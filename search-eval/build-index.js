'use strict';
// Embeds every billing code and every diagnostic row, and writes
// search-eval/index/<name>.json for bench.js.
//
// Usage: node search-eval/build-index.js [--model text-embedding-3-small] [--dims 512] [--synonyms] [--ed]
//   --synonyms  append the terms from search-eval/synonyms.json (see gen-synonyms.js)
//   --ed        also index the ED short list from diagnose.js (docs marked ed: true),
//               which hybrid search then favours

var fs = require('fs');
var path = require('path');
var lib = require('./lib');

function arg(name, dflt) {
  var i = process.argv.indexOf('--' + name);
  if (i === -1) return dflt;
  var v = process.argv[i + 1];
  return v === undefined || v.indexOf('--') === 0 ? true : v;
}

var model = arg('model', 'text-embedding-3-small');
var dims = Number(arg('dims', 512));
var useSynonyms = !!arg('synonyms', false);
var useEd = !!arg('ed', false);
var name = model.replace('text-embedding-', 'te') + '-' + dims + (useSynonyms ? '-syn' : '') + (useEd ? '-ed' : '');

// Float32 vectors as base64 keep the index a few MB instead of tens.
function pack(v) { return Buffer.from(new Float32Array(v).buffer).toString('base64'); }

async function main() {
  lib.loadEnv();
  var corpus = lib.loadCorpus();
  var syn = { billing: {}, diag: {} };
  if (useSynonyms) syn = JSON.parse(fs.readFileSync(path.join(__dirname, 'synonyms.json'), 'utf8'));

  var docs = corpus.billing.map(function(d) {
    return { side: 'billing', code: d.code, text: lib.billingText(d, syn.billing[d.code]) };
  }).concat(corpus.diag.map(function(d) {
    return { side: 'diag', code: d.code, text: lib.diagText(d) };
  }));
  // Diagnostic synonyms get one extra row per code rather than being repeated
  // on every row that shares the code.
  Object.keys(syn.diag).forEach(function(code) {
    docs.push({ side: 'diag', code: lib.padDiag(code), text: 'Also searched as: ' + syn.diag[code] });
  });
  if (useEd) {
    var edSyn = syn.edDiag || {};
    corpus.edDiag.forEach(function(d) {
      docs.push({ side: 'diag', code: d.code, ed: true, text: lib.diagText(d, edSyn[d.code]) });
    });
  }

  var tokens = 0, batch = 256;
  for (var i = 0; i < docs.length; i += batch) {
    var slice = docs.slice(i, i + batch);
    var r = await lib.embed(slice.map(function(d) { return d.text; }), model, dims);
    tokens += r.tokens;
    slice.forEach(function(d, j) { d.vec = pack(r.vectors[j]); });
    process.stdout.write('\rembedded ' + Math.min(i + batch, docs.length) + '/' + docs.length);
  }

  var dir = path.join(__dirname, 'index');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  var out = path.join(dir, name + '.json');
  fs.writeFileSync(out, JSON.stringify({ name: name, model: model, dims: dims, synonyms: useSynonyms, ed: useEd, docs: docs }));
  var cost = lib.costUsd(model, { embeddingTokens: tokens });
  console.log('\nwrote ' + path.relative(lib.ROOT, out) + ': ' + docs.length + ' docs, ' + tokens +
    ' tokens, one-time cost $' + cost.toFixed(4));
}

main().catch(function(e) { console.error(e.message); process.exit(1); });
