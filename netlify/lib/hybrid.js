'use strict';
// Hybrid code search: embedding similarity + BM25 keyword ranking, merged by
// reciprocal rank fusion, with typed codes placed first. For diagnostic codes
// a third ranking over just the ED short list favours the codes ED physicians
// actually bill (e.g. 829 "Fracture" over the site-specific 824).
//
// Shared by netlify/functions/hybrid-search.js and search-eval/bench.js, so
// the benchmark measures exactly what ships. The index is built by
// search-eval/export-index.js.

var RRF_K = 60;

function tokenize(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9&+]+/g, ' ').trim().split(' ').filter(Boolean);
}

function Bm25(texts) {
  var k1 = 1.2, b = 0.75;
  var docs = texts.map(tokenize);
  var avg = docs.reduce(function(s, d) { return s + d.length; }, 0) / docs.length;
  var df = {};
  var tfs = docs.map(function(d) {
    var tf = {};
    d.forEach(function(t) { tf[t] = (tf[t] || 0) + 1; });
    Object.keys(tf).forEach(function(t) { df[t] = (df[t] || 0) + 1; });
    return tf;
  });
  var idf = {};
  for (var t in df) idf[t] = Math.log(1 + (docs.length - df[t] + 0.5) / (df[t] + 0.5));
  this.score = function(query) {
    var q = tokenize(query);
    return tfs.map(function(tf, i) {
      var s = 0;
      q.forEach(function(t) {
        if (!tf[t]) return;
        s += idf[t] * tf[t] * (k1 + 1) / (tf[t] + k1 * (1 - b + b * docs[i].length / avg));
      });
      return s;
    });
  };
}

function padDiag(c) {
  c = String(c);
  return c.length < 3 ? ('000' + c).slice(-3) : c;
}

// index: { dims, docs: [{ s: 'b'|'d', c: code, e: 1 if ED list, t: text }],
//          vec: base64 int8 (docs.length * dims), scale: [per-doc float] }
function load(index) {
  var raw = Buffer.from(index.vec, 'base64');
  var q = new Int8Array(raw.buffer, raw.byteOffset, raw.length);
  var dims = index.dims;
  var sides = { billing: [], diag: [] };
  index.docs.forEach(function(d, i) {
    var v = new Float32Array(dims), s = index.scale[i];
    for (var j = 0; j < dims; j++) v[j] = q[i * dims + j] * s;
    sides[d.s === 'b' ? 'billing' : 'diag'].push({ code: d.c, ed: !!d.e, text: d.t, v: v });
  });
  ['billing', 'diag'].forEach(function(side) {
    var docs = sides[side];
    sides[side] = { docs: docs, bm25: new Bm25(docs.map(function(d) { return d.text; })),
                    codes: docs.reduce(function(o, d) { o[d.code] = 1; return o; }, {}) };
  });
  return { model: index.model, dims: dims, billing: sides.billing, diag: sides.diag };
}

function dot(a, b) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function dedupe(codes) {
  var seen = {};
  return codes.filter(function(c) { return !seen[c] && (seen[c] = true); });
}

// Words in the query that are codes on this side ("H112", "e412", "427").
function typedCodes(idx, side, query) {
  return query.split(/[\s,]+/).map(function(w) {
    w = w.trim().toUpperCase();
    if (side === 'billing' && /^[A-Z]\d{3}[A-Z]?$/.test(w)) return w;
    if (side === 'diag' && /^\d{2,4}$/.test(w)) return padDiag(w);
    return null;
  }).filter(function(c) { return c && idx[side].codes[c]; });
}

// Relevance cutoff: after the first result, a code is only shown if one of the
// three signals backs it: similarity within COS_GAP of the best match, within
// ED_GAP of the best ED-list match, or a keyword score at least BM25_REL of the
// best. Tuned on the golden set: keeps 278/281 correct answers while dropping
// about half the filler (e.g. "foley" no longer lists Bell's palsy).
var COS_GAP = 0.06, ED_GAP = 0.05, BM25_REL = 0.5;
// When nothing on a side is relevant, every score is uniformly low, so the
// relative rules above keep everything. A result (including the first) also
// needs similarity >= COS_FLOOR unless keyword matching backs it.
var COS_FLOOR = Number(process.env.HYBRID_COS_FLOOR || 0.40);

function bestBy(docs, scores, filter) {
  var best = {};
  docs.forEach(function(d, i) {
    if (filter && !filter(d)) return;
    if (!(d.code in best) || scores[i] > best[d.code]) best[d.code] = scores[i];
  });
  return best;
}

function maxOf(o) {
  var m = -Infinity;
  for (var k in o) if (o[k] > m) m = o[k];
  return m;
}

// Returns up to `top` codes for one side. queryVec is the query's embedding
// (unit length), or null when the query is only typed codes.
function rank(idx, side, query, queryVec, top) {
  var s = idx[side];
  var typed = typedCodes(idx, side, query);
  if (!queryVec) return typed.slice(0, top);

  var cos = s.docs.map(function(d) { return dot(queryVec, d.v); });
  var bm = s.bm25.score(query);
  var cosBy = bestBy(s.docs, cos), bmBy = bestBy(s.docs, bm);
  var edBy = bestBy(s.docs, cos, function(d) { return d.ed; });
  var cosTop = maxOf(cosBy), bmTop = Math.max(0, maxOf(bmBy)), edTop = maxOf(edBy);

  var byScore = function(o) {
    return Object.keys(o).filter(function(c) { return o === bmBy ? o[c] > 0 : true; })
      .sort(function(a, b) { return o[b] - o[a]; });
  };
  var lists = [byScore(cosBy), byScore(bmBy)];
  if (edTop > -Infinity) lists.push(byScore(edBy));
  var fused = {};
  lists.forEach(function(list) {
    list.forEach(function(c, i) { fused[c] = (fused[c] || 0) + 1 / (RRF_K + i + 1); });
  });
  var ranked = Object.keys(fused).sort(function(a, b) { return fused[b] - fused[a]; });

  var relevant = ranked.filter(function(c, i) {
    var keyword = bmTop > 0 && (bmBy[c] || 0) >= BM25_REL * bmTop;
    if (keyword) return true;
    if (cosBy[c] < COS_FLOOR) return false;
    return i === 0 || cosTop - cosBy[c] <= COS_GAP || (c in edBy && edTop - edBy[c] <= ED_GAP);
  });
  return dedupe(typed.concat(relevant)).slice(0, top);
}

// True when every word of the query is a known code, so no embedding is needed.
function onlyCodes(idx, query) {
  var words = query.split(/[\s,]+/).filter(Boolean);
  return words.length > 0 &&
    typedCodes(idx, 'billing', query).length + typedCodes(idx, 'diag', query).length === words.length;
}

module.exports = { load: load, rank: rank, onlyCodes: onlyCodes, padDiag: padDiag };
