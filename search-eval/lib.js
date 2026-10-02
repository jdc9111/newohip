'use strict';
// Shared helpers for the search benchmark: .env loading, OpenAI calls,
// the code corpus, cosine similarity and a small lexical scorer.
// Plain https (no fetch) so it runs on the local Node 16 as well as Netlify's 18.

var fs = require('fs');
var path = require('path');
var https = require('https');
var billing = require('../netlify/functions/billing');
var diagnose = require('../netlify/functions/diagnose');

var ROOT = path.join(__dirname, '..');

// Prices in USD per 1M tokens (OpenAI list prices; update if they change).
var PRICES = {
  'gpt-4o-mini': { input: 0.15, cachedInput: 0.075, output: 0.60 },
  'gpt-4.1': { input: 2.00, cachedInput: 0.50, output: 8.00 },
  'text-embedding-3-small': { input: 0.02 },
  'text-embedding-3-large': { input: 0.13 }
};

function loadEnv() {
  var file = path.join(ROOT, '.env');
  if (fs.existsSync(file)) {
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(function(line) {
      var m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing: add it to .env in the project root (see search-eval/README.md)');
  }
  return process.env.OPENAI_API_KEY;
}

// Retries rate limits and server errors (429 / 5xx) with backoff.
function openai(apiPath, body, attempt) {
  attempt = attempt || 0;
  return openaiOnce(apiPath, body).catch(function(e) {
    if (attempt >= 3 || !/^OpenAI (429|5\d\d)/.test(e.message)) throw e;
    return new Promise(function(r) { setTimeout(r, 1000 * Math.pow(2, attempt)); })
      .then(function() { return openai(apiPath, body, attempt + 1); });
  });
}

function openaiOnce(apiPath, body) {
  var payload = JSON.stringify(body);
  return new Promise(function(resolve, reject) {
    var req = https.request({
      hostname: 'api.openai.com',
      path: apiPath,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        if (res.statusCode !== 200) return reject(new Error('OpenAI ' + res.statusCode + ': ' + data.slice(0, 300)));
        resolve(JSON.parse(data));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Embeds up to a few hundred strings per call; returns { vectors, tokens }.
function embed(texts, model, dimensions) {
  return openai('/v1/embeddings', { model: model, input: texts, dimensions: dimensions })
    .then(function(r) {
      return { vectors: r.data.map(function(d) { return normalize(d.embedding); }), tokens: r.usage.total_tokens };
    });
}

// Embeds texts via a disk cache (search-eval/cache/<model>-<dims>.json), so
// ranking experiments are repeatable and don't depend on the network.
// Returns { vectors, tokens } where tokens counts only newly embedded texts.
function embedCached(texts, model, dimensions) {
  var dir = path.join(__dirname, 'cache');
  var file = path.join(dir, model + '-' + dimensions + '.json');
  var cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  var missing = texts.filter(function(t, i) { return !cache[t] && texts.indexOf(t) === i; });
  var chain = Promise.resolve(0);
  for (var i = 0; i < missing.length; i += 200) {
    (function(batch) {
      chain = chain.then(function(tokens) {
        return embed(batch, model, dimensions).then(function(r) {
          batch.forEach(function(t, j) { cache[t] = r.vectors[j].map(function(x) { return Number(x.toFixed(6)); }); });
          return tokens + r.tokens;
        });
      });
    })(missing.slice(i, i + 200));
  }
  return chain.then(function(tokens) {
    if (missing.length) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      fs.writeFileSync(file, JSON.stringify(cache));
    }
    return { vectors: texts.map(function(t) { return cache[t]; }), tokens: tokens };
  });
}

function chat(model, system, user, maxTokens) {
  return openai('/v1/chat/completions', {
    model: model,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    max_tokens: maxTokens,
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });
}

function normalize(v) {
  var n = 0;
  for (var i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  return v.map(function(x) { return x / n; });
}

// Vectors are unit length, so cosine similarity is just the dot product.
function dot(a, b) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// diagData.js writes "53" where diagnose.js and OHIP write "053".
function padDiag(c) {
  c = String(c);
  return c.length < 3 ? ('000' + c).slice(-3) : c;
}

// The searchable corpus. Billing: one doc per code (first line wins where a
// code is listed twice). Diagnostic: one doc per diagData.js row, since the
// same code appears under many names; results are grouped back to codes.
function loadCorpus() {
  var seen = {};
  var billingDocs = [];
  billing.BILLING_CODES.split('\n').forEach(function(line) {
    var m = line.match(/^(\S+) \(([^)]+)\): (.+)$/);
    if (!m || seen[m[1]]) return;
    seen[m[1]] = true;
    var parts = m[3].split(' -- ').filter(function(p) { return !/^Exact fee/.test(p); });
    billingDocs.push({ code: m[1], category: m[2], description: parts[0].trim(), notes: parts.slice(1).join('; ').trim() });
  });

  var DIAG = new Function(fs.readFileSync(path.join(ROOT, 'diagData.js'), 'utf8') + '\nreturn DIAG;')();
  // Skip rows that aren't physician diagnoses: the physiotherapy table (which
  // reuses real codes with unrelated meanings, e.g. 930 and 894) and the
  // 4-digit "Common Diagnostic Codes". They only add noise to ED search.
  var diagDocs = DIAG.filter(function(r) {
    return !/^Physiotherapy - /.test(r[1]) && !(String(r[0]).length === 4 && /^Common Diagnostic Codes/.test(r[1]));
  }).map(function(r) { return { code: padDiag(r[0]), description: r[1] }; });

  // The ED short list from diagnose.js: the codes ED physicians actually bill,
  // including catch-alls like 829 "Fracture" that they use for any site.
  var ed = {};
  diagnose.CODE_LIST.split('\n').forEach(function(line) {
    var m = line.match(/^(\S+) \(([^)]+)\): (.+)$/);
    if (!m) return;
    var code = padDiag(m[1]);
    if (!ed[code]) ed[code] = { code: code, description: m[3].trim(), category: m[2] };
    else if (ed[code].description.toLowerCase().indexOf(m[3].trim().toLowerCase()) === -1) ed[code].description += ' / ' + m[3].trim();
  });
  return { billing: billingDocs, diag: diagDocs, edDiag: Object.keys(ed).map(function(c) { return ed[c]; }) };
}

function billingText(d, synonyms) {
  return d.code + ' ' + d.description + ' (' + d.category + ')' + (d.notes ? '. ' + d.notes : '') +
    (synonyms ? '. Also searched as: ' + synonyms : '');
}

function diagText(d, synonyms) {
  return d.description + (synonyms ? '. Also searched as: ' + synonyms : '');
}

// Minimal BM25 over lowercased word tokens, for the hybrid variant.
function tokenize(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9&+]+/g, ' ').trim().split(' ').filter(Boolean);
}

function Bm25(texts) {
  var k1 = 1.2, b = 0.75;
  this.docs = texts.map(tokenize);
  this.avg = this.docs.reduce(function(s, d) { return s + d.length; }, 0) / this.docs.length;
  var df = {};
  this.docs.forEach(function(d) {
    Object.keys(d.reduce(function(o, t) { o[t] = 1; return o; }, {})).forEach(function(t) { df[t] = (df[t] || 0) + 1; });
  });
  var N = this.docs.length;
  this.idf = {};
  for (var t in df) this.idf[t] = Math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5));
  this.score = function(query) {
    var q = tokenize(query), self = this;
    return this.docs.map(function(d) {
      var tf = {}, s = 0;
      d.forEach(function(t) { tf[t] = (tf[t] || 0) + 1; });
      q.forEach(function(t) {
        if (!tf[t]) return;
        s += (self.idf[t] || 0) * tf[t] * (k1 + 1) / (tf[t] + k1 * (1 - b + b * d.length / self.avg));
      });
      return s;
    });
  };
}

function costUsd(model, usage) {
  var p = PRICES[model];
  if (!p) return 0;
  if (usage.embeddingTokens !== undefined) return usage.embeddingTokens * p.input / 1e6;
  var cached = usage.cachedTokens || 0;
  return ((usage.promptTokens - cached) * p.input + cached * p.cachedInput + usage.completionTokens * p.output) / 1e6;
}

module.exports = {
  ROOT: ROOT, PRICES: PRICES, loadEnv: loadEnv, embed: embed, embedCached: embedCached, chat: chat, dot: dot,
  padDiag: padDiag, loadCorpus: loadCorpus, billingText: billingText, diagText: diagText,
  Bm25: Bm25, costUsd: costUsd
};
