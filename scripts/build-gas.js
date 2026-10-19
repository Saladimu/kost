'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src', 'code.gs');

const MODULES = [
  ['util', 'src/util.js'],
  ['seed', 'src/seed.js'],
  ['bootstrap', 'src/bootstrap.js'],
  ['db', 'src/gas/db.js'],
  ['password', 'src/gas/password.js'],
  ['auth', 'src/gas/auth.js'],
  ['jobs', 'src/gas/jobs.js'],
];

function listServices() {
  const dir = path.join(ROOT, 'src', 'services');
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.js'))
    .sort()
    .map((file) => [`services/${file.replace(/\.js$/, '')}`, `src/services/${file}`]);
}

function moduleFactory(id, source) {
  return `__define(${JSON.stringify(id)}, function (module, exports, require) {\n${source}\n});\n`;
}

function dataUri(relative, mime) {
  const file = path.join(ROOT, 'public', relative);
  if (!fs.existsSync(file)) throw new Error(`Aset frontend tidak ditemukan: ${relative}`);
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function buildFrontend() {
  const indexPath = path.join(ROOT, 'public', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'public', 'css', 'styles.css'), 'utf8');
  html = html.replace('<link rel="stylesheet" href="css/styles.css">', `<style>\n${css}\n</style>`);
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (match, src) => {
    const relative = src.replace(/^\//, '');
    const file = path.join(ROOT, 'public', relative);
    if (!fs.existsSync(file)) throw new Error(`Aset frontend tidak ditemukan: ${src}`);
    const script = fs.readFileSync(file, 'utf8').replace(/<\/script/gi, '<\\/script');
    return `<script>\n${script}\n</script>`;
  });
  const assets = {
    'assets/logo.png': dataUri('assets/logo.png', 'image/png'),
    'assets/favicon.ico': dataUri('assets/favicon.ico', 'image/x-icon'),
    'assets/apple-touch-icon.png': dataUri('assets/apple-touch-icon.png', 'image/png'),
  };
  Object.keys(assets).forEach((asset) => { html = html.split(asset).join(assets[asset]); });
  return html;
}

function build() {
  const modules = MODULES.concat(listServices());
  const parts = [];
  parts.push([
    '/**',
    ' * Sistem Operasional Kos - Google Apps Script backend.',
    ' * Berkas ini dihasilkan oleh scripts/build-gas.js. Jangan diubah manual.',
    ' * Sumber: src/gas/*.js, src/services/*.js, src/util.js, src/seed.js, src/bootstrap.js, public/.',
    ' */',
    '',
    `const FRONTEND_HTML = ${JSON.stringify(buildFrontend())};`,
    '',
    'const __defs = {};',
    'const __cache = {};',
    '',
    'function __define(id, factory) { __defs[id] = factory; }',
    '',
    'function __resolve(from, request) {',
    '  if (request.charAt(0) !== ".") return request;',
    '  const stack = from.split("/");',
    '  stack.pop();',
    '  request.split("/").forEach((part) => {',
    '    if (!part || part === ".") return;',
    '    if (part === "..") stack.pop();',
    '    else stack.push(part);',
    '  });',
    '  return stack.join("/");',
    '}',
    '',
    'function __require(id) {',
    '  if (Object.prototype.hasOwnProperty.call(__cache, id)) return __cache[id];',
    '  if (!__defs[id]) throw new Error(`Modul ${id} tidak ditemukan.`);',
    '  const module = { exports: {} };',
    '  __defs[id](module, module.exports, (request) => __require(__resolve(id, request)));',
    '  __cache[id] = module.exports;',
    '  return module.exports;',
    '}',
    '',
  ].join('\n'));

  modules.forEach(([id, relative]) => {
    const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
    parts.push(moduleFactory(id, source));
  });

  parts.push(fs.readFileSync(path.join(ROOT, 'src', 'gas', 'router.js'), 'utf8'));
  parts.push(fs.readFileSync(path.join(ROOT, 'src', 'gas', 'web.js'), 'utf8'));

  fs.writeFileSync(OUTPUT, parts.join('\n'));
  const size = fs.statSync(OUTPUT).size;
  console.log(`code.gs dibuat: ${path.relative(ROOT, OUTPUT)} (${Math.round(size / 1024)} KB, ${modules.length} modul)`);
}

build();
