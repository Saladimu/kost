'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { handle, fail } = require('./src/api');
const { load, save } = require('./src/db');
const { bootstrap } = require('./src/bootstrap');
const { startScheduler } = require('./src/jobs');
const { AppError } = require('./src/util');
const { logError } = require('./src/services/common');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

function serveStatic(req, res, pathname) {
  let relative = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.resolve(PUBLIC_DIR, `.${relative}`);
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    const fallback = path.join(PUBLIC_DIR, 'index.html');
    if (pathname !== '/' && !path.extname(pathname)) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      fs.createReadStream(fallback).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Halaman tidak ditemukan');
    return;
  }
  const ext = path.extname(resolved).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
  });
  fs.createReadStream(resolved).pipe(res);
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    try {
      await handle(req, res, url);
    } catch (error) {
      if (error instanceof AppError) {
        fail(res, error);
      } else {
        console.error(error);
        try {
          const db = load();
          logError(db, { functionName: `${req.method} ${url.pathname}`, severity: 'ERROR', errorMessage: error.message });
          save(db);
        } catch (logFailure) {
          console.error('Gagal menulis system log:', logFailure.message);
        }
        fail(res, new AppError('Terjadi kesalahan pada server.', 500, 'INTERNAL_ERROR'));
      }
    }
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }
  serveStatic(req, res, url.pathname);
});

try {
  const result = bootstrap();
  console.log(`Database siap. Invoice baru dari bootstrap: ${result.billingCount}`);
} catch (error) {
  console.error('Gagal menyiapkan database:', error);
  process.exit(1);
}

startScheduler(load, save);

server.listen(PORT, HOST, () => {
  console.log(`Sistem Operasional Kos berjalan di http://${HOST}:${PORT}`);
});
