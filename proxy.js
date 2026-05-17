// proxy.js — serve static files + proxy /api/* to webnewtvs.top
// Usage: node proxy.js
// Requires Node.js 18+ (built-in fetch)

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT    = 9000;
const API_HOST = 'webnewtvs.top';

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Proxy /api/* → https://webnewtvs.top/api/*
  if (url.pathname.startsWith('/api/')) {
    const options = {
      hostname: API_HOST,
      port: 443,
      path: url.pathname + url.search,
      method: req.method,
      headers: { ...req.headers, host: API_HOST },
    };
    const proxy = https.request(options, upstream => {
      res.writeHead(upstream.statusCode, {
        ...upstream.headers,
        'access-control-allow-origin': '*',
      });
      upstream.pipe(res);
    });
    proxy.on('error', () => { res.writeHead(502); res.end('Bad Gateway'); });
    req.pipe(proxy);
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`WebTV running at http://localhost:${PORT}`));
