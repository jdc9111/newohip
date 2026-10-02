'use strict';
// Converts a benchmark index (search-eval/index/<name>.json) into the compact
// file shipped with the hybrid-search function: netlify/data/hybrid-index.json.
// Vectors are stored as int8 with a per-vector scale (about 4x smaller than
// float32); names maps every diagnostic code to a display description.
//
// Usage: node search-eval/export-index.js [--index te3-small-512-syn-ed]

var fs = require('fs');
var path = require('path');
var lib = require('./lib');

var i = process.argv.indexOf('--index');
var name = i === -1 ? 'te3-small-512-syn-ed' : process.argv[i + 1];
var src = JSON.parse(fs.readFileSync(path.join(__dirname, 'index', name + '.json'), 'utf8'));

var dims = src.dims;
var q = new Int8Array(src.docs.length * dims);
var scale = [];
src.docs.forEach(function(d, n) {
  var buf = Buffer.from(d.vec, 'base64');
  var v = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
  var max = 0;
  for (var j = 0; j < dims; j++) max = Math.max(max, Math.abs(v[j]));
  var s = max / 127 || 1;
  for (j = 0; j < dims; j++) q[n * dims + j] = Math.round(v[j] / s);
  scale.push(Number(s.toPrecision(6)));
});

// Diagnostic display names: the ED list's wording where it has the code,
// otherwise the shortest plain row of the full list (not a chapter heading).
var corpus = lib.loadCorpus();
var fullNames = {};
corpus.diag.forEach(function(d) {
  var chapter = d.description.split(' - ').length > 2;   // "Diseases of ... - Section - Name"
  var cur = fullNames[d.code];
  if (!cur || (cur.chapter && !chapter) || (cur.chapter === chapter && d.description.length < cur.text.length)) {
    fullNames[d.code] = { text: d.description, chapter: chapter };
  }
});
var names = {};
Object.keys(fullNames).forEach(function(c) { names[c] = fullNames[c].text; });
corpus.edDiag.forEach(function(d) { names[d.code] = d.description; });

var out = {
  model: src.model,
  dims: dims,
  built: new Date().toISOString().slice(0, 10),
  docs: src.docs.map(function(d) {
    var o = { s: d.side === 'billing' ? 'b' : 'd', c: d.code, t: d.text };
    if (d.ed) o.e = 1;
    return o;
  }),
  vec: Buffer.from(q.buffer).toString('base64'),
  scale: scale,
  names: names
};

var dir = path.join(lib.ROOT, 'netlify', 'data');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
var file = path.join(dir, 'hybrid-index.json');
fs.writeFileSync(file, JSON.stringify(out));
console.log('wrote ' + path.relative(lib.ROOT, file) + ' from ' + name + ': ' + out.docs.length + ' docs, ' +
  (fs.statSync(file).size / 1024 / 1024).toFixed(2) + ' MB');
