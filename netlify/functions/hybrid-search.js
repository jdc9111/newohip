'use strict';
// Hybrid billing + diagnostic code search (see netlify/lib/hybrid.js).
// Same request and response shape as search.js, so ai-search.html can use
// either: POST { query } -> { billing: [...], diagnostic: [...], errors }.
// One small embedding call per query (none when the query is only codes);
// ranking runs in memory over the bundled index.

var https = require('https');
var hybrid = require('../lib/hybrid');
var billing = require('./billing');
var INDEX = require('../data/hybrid-index.json');

var TOP = 5;
var idx = hybrid.load(INDEX);

// Embedding calls usually take ~0.3 s but occasionally stall; give up on an
// attempt after 4 s and retry once, rather than show the user an error.
function embed(apiKey, text) {
  return embedOnce(apiKey, text).catch(function(err) {
    if (!/timeout|OpenAI (429|5\d\d)/.test(err.message)) throw err;
    return embedOnce(apiKey, text);
  });
}

function embedOnce(apiKey, text) {
  var payload = JSON.stringify({ model: idx.model, input: text, dimensions: idx.dims });
  return new Promise(function(resolve, reject) {
    var req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/embeddings',
      method: 'POST',
      timeout: 4000,
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        if (res.statusCode !== 200) return reject(new Error('OpenAI ' + res.statusCode + ': ' + data.slice(0, 200)));
        var v = JSON.parse(data).data[0].embedding;
        var n = Math.sqrt(v.reduce(function(s, x) { return s + x * x; }, 0)) || 1;
        resolve(v.map(function(x) { return x / n; }));
      });
    });
    req.on('timeout', function() { req.destroy(new Error('OpenAI timeout')); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function diagRow(code) {
  return { code: code, description: INDEX.names[code] || '', category: '' };
}

function respond(status, body) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = function(event) {
  if (event.httpMethod !== 'POST') return Promise.resolve({ statusCode: 405, body: 'Method Not Allowed' });
  var query;
  try { query = JSON.parse(event.body).query; }
  catch (e) { return Promise.resolve(respond(400, { error: 'Invalid body' })); }
  if (!query || query.trim().length < 2) return Promise.resolve(respond(400, { error: 'Query too short' }));
  query = query.trim().slice(0, 200);

  var started = Date.now();
  var apiKey = process.env.OPENAI_API_KEY;
  var needsEmbedding = !hybrid.onlyCodes(idx, query);
  if (needsEmbedding && !apiKey) return Promise.resolve(respond(500, { error: 'API key not configured' }));

  return (needsEmbedding ? embed(apiKey, query) : Promise.resolve(null))
    .then(function(vec) {
      return respond(200, {
        billing: billing.hydrate(hybrid.rank(idx, 'billing', query, vec, TOP)),
        diagnostic: hybrid.rank(idx, 'diag', query, vec, TOP).map(diagRow),
        errors: { billing: null, diagnostic: null },
        engine: 'hybrid',
        ms: Date.now() - started
      });
    })
    .catch(function(err) {
      console.error('hybrid-search error:', err.message);
      return respond(502, { error: 'Search service error' });
    });
};
