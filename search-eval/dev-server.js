'use strict';
// Minimal local stand-in for Netlify: serves the site and runs
// netlify/functions/<name>.js for /.netlify/functions/<name>, reading
// OPENAI_API_KEY from .env. (The installed Netlify CLI hangs on `netlify dev`.)
// Usage: node search-eval/dev-server.js [port]

var http = require('http');
var fs = require('fs');
var path = require('path');
var lib = require('./lib');

lib.loadEnv();
var ROOT = lib.ROOT;
var PORT = Number(process.argv[2] || 8888);
var TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg' };

http.createServer(function(req, res) {
  var url = new URL(req.url, 'http://localhost');
  var fn = url.pathname.match(/^\/\.netlify\/functions\/([\w-]+)$/);
  if (fn) {
    var body = '';
    req.on('data', function(c) { body += c; });
    req.on('end', function() {
      var handler;
      try { handler = require(path.join(ROOT, 'netlify', 'functions', fn[1] + '.js')).handler; }
      catch (e) { res.writeHead(404); return res.end('no such function'); }
      Promise.resolve(handler({ httpMethod: req.method, body: body, headers: req.headers }))
        .then(function(r) {
          res.writeHead(r.statusCode || 200, r.headers || {});
          res.end(r.body || '');
        })
        .catch(function(e) { res.writeHead(500); res.end(String(e)); });
    });
    return;
  }
  var file = path.join(ROOT, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  // Never serve secrets or anything outside the project.
  if (!file.startsWith(ROOT) || /[\\/]\.env/.test(file)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, function(err, data) {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, function() { console.log('dev server on http://localhost:' + PORT); });
