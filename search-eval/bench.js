'use strict';
// Runs the golden set against each search backend and writes a report.
//
// Usage: node search-eval/bench.js [--backends home,ai,embed,hybrid] [--index te3-small-512-syn] [--limit 20]
//
// Backends
//   home    the instant search on the home page (same scoring as index.html; runs locally)
//   ai      the current AI search: gpt-4o-mini with each full code list in the prompt,
//           billing and diagnostic calls in parallel, same prompts as search.js
//   embed   embed the query, rank by cosine similarity (one run per index in search-eval/index/)
//   hybrid  exact-code match first, then embedding and BM25 ranks merged by reciprocal rank fusion
//
// Each side returns its top 5 codes. Scoring per golden case and side:
//   hit@1  first result is one of the "best" codes
//   hit@5  a "best" code is anywhere in the top 5
//   MRR    1 / rank of the first "best" code (0 if not in the top 5)

var fs = require('fs');
var path = require('path');
var lib = require('./lib');
var billing = require('../netlify/functions/billing');
var diagnose = require('../netlify/functions/diagnose');

var TOP = 5;

function arg(name, dflt) {
  var i = process.argv.indexOf('--' + name);
  return i === -1 ? dflt : process.argv[i + 1];
}

function now() { var t = process.hrtime(); return t[0] * 1e3 + t[1] / 1e6; }

function dedupe(codes) {
  var seen = {};
  return codes.filter(function(c) { return !seen[c] && (seen[c] = true); });
}

// ── home: port of index.html's score() over its DATA and diagData.js ─────────
function homeBackend() {
  var html = fs.readFileSync(path.join(lib.ROOT, 'index.html'), 'utf8');
  var start = html.indexOf('const DATA = [');
  var DATA = new Function(html.slice(start, html.indexOf('\n];', start) + 3) + '\nreturn DATA;')();
  var aliasSrc = html.match(/const CATEGORY_ALIASES = (\{[\s\S]*?\});/)[1];
  var ALIASES = new Function('return ' + aliasSrc)();
  var billTokens = DATA.map(function(r) {
    return (r[0] + ' ' + r[1] + ' ' + r[3] + ' ' + r[4] + ' ' + (ALIASES[r[3]] || '')).toLowerCase();
  });
  var DIAG = new Function(fs.readFileSync(path.join(lib.ROOT, 'diagData.js'), 'utf8') + '\nreturn DIAG;')();
  var diagTokens = DIAG.map(function(r) { return (r[0] + ' ' + r[1]).toLowerCase(); });

  function score(h, n) {
    n = n.toLowerCase();
    if (h.includes(n)) return 100 + (n.length / h.length) * 50;
    var words = n.split(/\s+/).filter(Boolean), hits = 0;
    words.forEach(function(w) { if (h.includes(w)) hits++; });
    if (hits === words.length) return 60 + hits * 5;
    if (hits > 0) return 30 + hits * 10;
    return 0;
  }
  function rank(rows, tokens, q, norm) {
    var ranked = rows.map(function(r, i) { return { c: norm(r[0]), s: score(tokens[i], q) }; })
      .filter(function(x) { return x.s > 0; })
      .sort(function(a, b) { return b.s - a.s; });
    return dedupe(ranked.map(function(x) { return x.c; })).slice(0, TOP);
  }
  return {
    name: 'home',
    run: function(q) {
      var t = now();
      var out = { billing: rank(DATA, billTokens, q, function(c) { return c; }),
                  diag: rank(DIAG, diagTokens, q, lib.padDiag) };
      out.ms = now() - t;
      out.cost = 0;
      return Promise.resolve(out);
    }
  };
}

// ── ai: the current AI search ────────────────────────────────────────────────
function aiBackend() {
  var model = 'gpt-4o-mini';
  function side(system, hydrate, q) {
    return lib.chat(model, system, q, 60).then(function(r) {
      var parsed = {};
      try { parsed = JSON.parse(r.choices[0].message.content); } catch (e) { /* counts as no results */ }
      var d = r.usage.prompt_tokens_details || {};
      return {
        codes: hydrate(parsed.results).map(function(x) { return x.code; }),
        cost: lib.costUsd(model, { promptTokens: r.usage.prompt_tokens, cachedTokens: d.cached_tokens || 0,
                                   completionTokens: r.usage.completion_tokens })
      };
    });
  }
  // OpenAI rate limits are per organization, so this shares the live site's
  // tokens-per-minute budget. Each query sends ~15k prompt tokens; unpaced,
  // the benchmark starved production AI search. Pause between queries
  // (default 15 s, about 60k tokens/min) with --ai-delay <seconds>.
  var delayMs = Number(arg('ai-delay', 15)) * 1000;
  var first = true;
  function pause() {
    if (first) { first = false; return Promise.resolve(); }
    return new Promise(function(r) { setTimeout(r, delayMs); });
  }
  return {
    name: 'ai',
    run: function(q) {
      return pause().then(function() {
        var t = now();
        return Promise.all([side(billing.SYSTEM_PROMPT, billing.hydrate, q), side(diagnose.SYSTEM_PROMPT, diagnose.hydrate, q)])
          .then(function(r) {
            return { billing: r[0].codes.slice(0, TOP), diag: r[1].codes.map(lib.padDiag).slice(0, TOP),
                     ms: now() - t, cost: r[0].cost + r[1].cost };
          });
      });
    }
  };
}

// ── embed / hybrid ───────────────────────────────────────────────────────────
function loadIndex(file) {
  var idx = JSON.parse(fs.readFileSync(file, 'utf8'));
  idx.docs.forEach(function(d) {
    var buf = Buffer.from(d.vec, 'base64');
    d.v = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
  });
  ['billing', 'diag'].forEach(function(side) {
    var docs = idx.docs.filter(function(d) { return d.side === side; });
    idx[side] = { docs: docs, bm25: new lib.Bm25(docs.map(function(d) { return d.text; })) };
  });
  return idx;
}

// Rank codes from per-doc scores; a code's rank is its best doc's rank.
function codeOrder(docs, scores) {
  var order = scores.map(function(s, i) { return i; }).filter(function(i) { return scores[i] > 0; })
    .sort(function(a, b) { return scores[b] - scores[a]; });
  return dedupe(order.map(function(i) { return docs[i].code; }));
}

function exactCode(q, side) {
  var t = q.trim().toUpperCase();
  if (side === 'billing' && /^[A-Z]\d{3}[A-Z]?$/.test(t)) return t;
  if (side === 'diag' && /^\d{2,4}$/.test(t)) return lib.padDiag(t);
  return null;
}

function embedBackends(idx) {
  function embedQuery(q) {
    return lib.embed([q], idx.model, idx.dims).then(function(r) {
      return { v: r.vectors[0], cost: lib.costUsd(idx.model, { embeddingTokens: r.tokens }) };
    });
  }
  function semantic(side, v) {
    var docs = idx[side].docs;
    return codeOrder(docs, docs.map(function(d) { return lib.dot(v, d.v) + 1; }));
  }
  // Reciprocal rank fusion of meaning and keyword rankings. With an ED-list
  // index, a third ranking over just the ED short list favours the codes ED
  // physicians actually bill (e.g. 829 over the site-specific 824).
  function hybrid(side, q, v) {
    var sem = semantic(side, v);
    var lex = codeOrder(idx[side].docs, idx[side].bm25.score(q));
    var lists = [sem, lex];
    var edDocs = idx[side].docs.filter(function(d) { return d.ed; });
    if (edDocs.length) lists.push(codeOrder(edDocs, edDocs.map(function(d) { return lib.dot(v, d.v) + 1; })));
    var fused = {};
    lists.forEach(function(list) {
      list.forEach(function(c, i) { fused[c] = (fused[c] || 0) + 1 / (60 + i + 1); });
    });
    var ranked = Object.keys(fused).sort(function(a, b) { return fused[b] - fused[a]; });
    var exact = exactCode(q, side);
    var known = exact && idx[side].docs.some(function(d) { return d.code === exact; });
    return dedupe((known ? [exact] : []).concat(ranked));
  }
  function make(name, rankSide) {
    return {
      name: name,
      run: function(q) {
        var t = now();
        return embedQuery(q).then(function(e) {
          return { billing: rankSide('billing', q, e.v).slice(0, TOP), diag: rankSide('diag', q, e.v).slice(0, TOP),
                   ms: now() - t, cost: e.cost };
        });
      }
    };
  }
  return [
    make('embed:' + idx.name, function(side, q, v) { return semantic(side, v); }),
    make('hybrid:' + idx.name, hybrid)
  ];
}

// ── scoring ──────────────────────────────────────────────────────────────────
function scoreSide(got, exp, side) {
  var norm = side === 'diag' ? lib.padDiag : function(c) { return String(c).toUpperCase(); };
  var best = exp.best.map(norm);
  var pos = got.findIndex(function(c) { return best.indexOf(norm(c)) !== -1; });
  return { hit1: pos === 0 ? 1 : 0, hit5: pos !== -1 ? 1 : 0, rr: pos === -1 ? 0 : 1 / (pos + 1) };
}

function pct(xs, p) {
  var s = xs.slice().sort(function(a, b) { return a - b; });
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

function summarize(rows, side, filter) {
  var r = rows.filter(function(x) { return x[side] && (!filter || filter(x)); });
  if (!r.length) return null;
  var avg = function(k) { return r.reduce(function(s, x) { return s + x[side][k]; }, 0) / r.length; };
  return { n: r.length, hit1: avg('hit1'), hit5: avg('hit5'), mrr: avg('rr') };
}

function fmtPct(x) { return x == null ? '–' : (x * 100).toFixed(0) + '%'; }

async function main() {
  var golden = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden.json'), 'utf8')).cases;
  var limit = Number(arg('limit', 0));
  if (limit) golden = golden.slice(0, limit);
  var wanted = String(arg('backends', 'home,ai,embed,hybrid')).split(',');

  var backends = [];
  if (wanted.indexOf('home') !== -1) backends.push(homeBackend());
  if (wanted.indexOf('ai') !== -1 || wanted.indexOf('embed') !== -1 || wanted.indexOf('hybrid') !== -1) lib.loadEnv();
  if (wanted.indexOf('ai') !== -1) backends.push(aiBackend());
  if (wanted.indexOf('embed') !== -1 || wanted.indexOf('hybrid') !== -1) {
    var dir = path.join(__dirname, 'index');
    var only = arg('index', null);
    var files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function(f) { return /\.json$/.test(f); }) : [];
    if (only) files = files.filter(function(f) { return f === only + '.json'; });
    if (!files.length) throw new Error('no index found in search-eval/index; run build-index.js first');
    files.forEach(function(f) {
      embedBackends(loadIndex(path.join(dir, f))).forEach(function(b) {
        if (wanted.indexOf(b.name.split(':')[0]) !== -1) backends.push(b);
      });
    });
  }

  var results = {};
  for (var bi = 0; bi < backends.length; bi++) {
    var b = backends[bi], rows = [];
    for (var i = 0; i < golden.length; i++) {
      var c = golden[i];
      var out;
      try { out = await b.run(c.q); }
      catch (e) { out = { billing: [], diag: [], ms: NaN, cost: 0, error: e.message }; }
      rows.push({
        id: c.id, q: c.q, tags: c.tags, got: { billing: out.billing, diag: out.diag }, ms: out.ms, cost: out.cost,
        error: out.error, billing: c.billing ? scoreSide(out.billing, c.billing, 'billing') : null,
        diag: c.diag ? scoreSide(out.diag, c.diag, 'diag') : null
      });
      process.stdout.write('\r' + b.name + ' ' + (i + 1) + '/' + golden.length + '   ');
    }
    results[b.name] = rows;
  }
  console.log('');

  // ── report ──
  var lines = ['# Search benchmark', '', golden.length + ' golden queries, top ' + TOP + ' results per side. ' +
    'Latency is the full backend call from this machine (home runs in the browser, so it is effectively instant).', '',
    '| Backend | Billing hit@1 | Billing hit@5 | Billing MRR | Diag hit@1 | Diag hit@5 | Diag MRR | p50 ms | p95 ms | $ / 1k searches | Errors |',
    '|---|---|---|---|---|---|---|---|---|---|---|'];
  Object.keys(results).forEach(function(name) {
    var rows = results[name];
    var bs = summarize(rows, 'billing'), ds = summarize(rows, 'diag');
    var ms = rows.map(function(r) { return r.ms; }).filter(function(x) { return !isNaN(x); });
    var cost = rows.reduce(function(s, r) { return s + r.cost; }, 0) / rows.length * 1000;
    var errs = rows.filter(function(r) { return r.error; }).length;
    lines.push('| ' + name + ' | ' + fmtPct(bs && bs.hit1) + ' | ' + fmtPct(bs && bs.hit5) + ' | ' + (bs ? bs.mrr.toFixed(2) : '–') +
      ' | ' + fmtPct(ds && ds.hit1) + ' | ' + fmtPct(ds && ds.hit5) + ' | ' + (ds ? ds.mrr.toFixed(2) : '–') +
      ' | ' + (ms.length ? pct(ms, 0.5).toFixed(0) : '–') + ' | ' + (ms.length ? pct(ms, 0.95).toFixed(0) : '–') +
      ' | $' + (cost > 0 && cost < 0.01 ? cost.toFixed(4) : cost.toFixed(3)) + ' | ' + errs + ' |');
  });

  var tags = {};
  golden.forEach(function(c) { c.tags.forEach(function(t) { tags[t] = 1; }); });
  lines.push('', '## hit@5 by query type', '', '| Backend | ' + Object.keys(tags).join(' | ') + ' |',
    '|---|' + Object.keys(tags).map(function() { return '---'; }).join('|') + '|');
  Object.keys(results).forEach(function(name) {
    lines.push('| ' + name + ' | ' + Object.keys(tags).map(function(t) {
      var has = function(r) { return r.tags.indexOf(t) !== -1; };
      var b = summarize(results[name], 'billing', has), d = summarize(results[name], 'diag', has);
      var n = (b ? b.n : 0) + (d ? d.n : 0);
      return n ? fmtPct(((b ? b.hit5 * b.n : 0) + (d ? d.hit5 * d.n : 0)) / n) : '–';
    }).join(' | ') + ' |');
  });

  var byId = {};
  golden.forEach(function(c) { byId[c.id] = c; });
  lines.push('', '## Misses (best code not in top ' + TOP + ')', '');
  Object.keys(results).forEach(function(name) {
    var misses = [];
    results[name].forEach(function(r) {
      ['billing', 'diag'].forEach(function(side) {
        if (r[side] && !r[side].hit5) {
          misses.push('- `' + r.q + '` (' + side + '): wanted ' + byId[r.id][side].best.join('/') + ', got ' +
            (r.got[side].join(', ') || 'nothing') + (r.error ? ' — error: ' + r.error.slice(0, 80) : ''));
        }
      });
    });
    lines.push('<details><summary>' + name + ': ' + misses.length + ' misses</summary>', '', misses.join('\n'), '', '</details>', '');
  });

  var dir = path.join(__dirname, 'results');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  var stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.writeFileSync(path.join(dir, stamp + '.json'), JSON.stringify(results, null, 1));
  fs.writeFileSync(path.join(__dirname, 'report.md'), lines.join('\n') + '\n');
  console.log(lines.slice(0, 6 + Object.keys(results).length).join('\n'));
  console.log('\nFull report: search-eval/report.md; per-query results: search-eval/results/' + stamp + '.json');
}

main().catch(function(e) { console.error(e.message); process.exit(1); });
