/**
 * Sistem Operasional Kos - Google Apps Script backend.
 * Berkas ini dihasilkan oleh scripts/build-gas.js. Jangan diubah manual.
 * Sumber: src/gas/*.js, src/services/*.js, src/util.js, src/seed.js, src/bootstrap.js, public/.
 */

const FRONTEND_HTML = "<!doctype html>\n<html lang=\"id\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <meta name=\"description\" content=\"Sistem Operasional Kos untuk mengelola kamar, penghuni, tagihan, pembayaran, dan laporan keuangan.\">\n  <title>Sistem Operasional Kos</title>\n  <style>\n:root {\n  --ink: #172422;\n  --ink-soft: #4a5c59;\n  --muted: #728481;\n  --line: #dfe6e4;\n  --line-strong: #c9d4d1;\n  --canvas: #f4f2ec;\n  --surface: #ffffff;\n  --surface-soft: #f8faf9;\n  --teal-950: #073b36;\n  --teal-900: #0b4b45;\n  --teal-800: #0f5f57;\n  --teal-700: #0f766e;\n  --teal-600: #128c82;\n  --teal-100: #d9f0ec;\n  --teal-50: #eef8f6;\n  --amber: #b7791f;\n  --amber-soft: #fdf3dc;\n  --danger: #b42318;\n  --danger-soft: #fdeceb;\n  --blue: #175cd3;\n  --blue-soft: #eaf2fe;\n  --purple: #6941c6;\n  --purple-soft: #f2edfd;\n  --shadow-sm: 0 1px 2px rgba(23, 36, 34, 0.06);\n  --shadow-md: 0 10px 30px rgba(23, 36, 34, 0.09);\n  --shadow-lg: 0 24px 70px rgba(7, 59, 54, 0.22);\n  --radius: 16px;\n  --radius-sm: 10px;\n  --sidebar-w: 268px;\n  --font: \"Segoe UI\", \"Helvetica Neue\", Arial, system-ui, -apple-system, sans-serif;\n}\n\n* { box-sizing: border-box; }\nhtml, body { height: 100%; }\nbody {\n  margin: 0;\n  font-family: var(--font);\n  color: var(--ink);\n  background: var(--canvas);\n  font-size: 14px;\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n}\nh1, h2, h3, h4, p { margin: 0; }\nbutton, input, select, textarea { font: inherit; color: inherit; }\na { color: var(--teal-700); }\n.hidden { display: none !important; }\n.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }\n\n/* Boot */\n.boot-screen {\n  position: fixed; inset: 0; display: flex; flex-direction: column; gap: 16px;\n  align-items: center; justify-content: center; background: var(--teal-950); color: #fff; z-index: 100;\n}\n.boot-mark {\n  width: 58px; height: 58px; border-radius: 17px; background: transparent;\n  display: grid; place-items: center; animation: pulse 1.4s ease-in-out infinite;\n}\n.boot-mark img { width: 100%; height: 100%; display: block; object-fit: contain; filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.32)); }\n.boot-text { color: rgba(255,255,255,0.72); font-size: 13px; letter-spacing: 0.04em; }\n@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }\n\n/* Login */\n.login-screen { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 0.9fr; background: #fff; }\n.login-visual {\n  position: relative; overflow: hidden; color: #fff;\n  background:\n    radial-gradient(circle at 18% 15%, rgba(18, 140, 130, 0.55), transparent 44%),\n    radial-gradient(circle at 85% 85%, rgba(183, 121, 31, 0.28), transparent 46%),\n    linear-gradient(145deg, #062f2b, #0b4b45 55%, #0f5f57);\n}\n.login-visual::before {\n  content: \"\"; position: absolute; inset: 0;\n  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);\n  background-size: 58px 58px; opacity: 0.5;\n}\n.login-visual::after {\n  content: \"\"; position: absolute; width: 420px; height: 420px; border: 1px solid rgba(255,255,255,0.14);\n  border-radius: 50%; right: -140px; bottom: -160px;\n}\n.login-visual-inner { position: relative; z-index: 1; padding: 56px 64px; max-width: 700px; height: 100%; display: flex; flex-direction: column; }\n.login-visual h1 { margin-top: 64px; font-size: clamp(30px, 3.2vw, 46px); line-height: 1.12; letter-spacing: -0.02em; max-width: 560px; }\n.login-lead { margin-top: 20px; max-width: 550px; color: rgba(255,255,255,0.75); font-size: 15px; line-height: 1.7; }\n.login-features { list-style: none; padding: 0; margin: 38px 0 0; display: grid; gap: 14px; max-width: 500px; }\n.login-features li { display: flex; gap: 14px; align-items: center; color: rgba(255,255,255,0.9); font-size: 14px; }\n.login-features span {\n  width: 34px; height: 34px; flex: none; border-radius: 10px; display: grid; place-items: center;\n  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16);\n  font-size: 11px; font-weight: 700; color: #ffe2a8; letter-spacing: 0.05em;\n}\n.login-footnote { margin-top: auto; padding-top: 40px; color: rgba(255,255,255,0.45); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }\n.login-form-side { display: flex; align-items: center; justify-content: center; padding: 48px; background: var(--canvas); }\n.login-card { width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--line); border-radius: 22px; padding: 38px; box-shadow: var(--shadow-md); }\n.login-card-head h2 { font-size: 24px; letter-spacing: -0.01em; }\n.login-card-head p { color: var(--muted); margin-top: 6px; font-size: 13px; }\n.login-card .field { margin-top: 20px; }\n.demo-accounts { margin-top: 28px; border-top: 1px solid var(--line); padding-top: 20px; display: grid; gap: 7px; }\n.demo-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); font-weight: 700; margin-bottom: 4px; }\n.demo-account {\n  display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border-radius: 9px;\n  border: 1px solid transparent; background: transparent; cursor: pointer; text-align: left;\n}\n.demo-account:hover { background: var(--teal-50); border-color: var(--teal-100); }\n.demo-account strong { width: 112px; font-size: 12px; color: var(--ink); }\n.demo-account span { flex: 1; font-size: 11px; color: var(--muted); }\n.demo-account em { font-style: normal; font-size: 10px; color: var(--teal-700); background: var(--teal-50); padding: 2px 7px; border-radius: 99px; }\n\n/* Brand */\n.brand { display: flex; align-items: center; gap: 12px; }\n.brand-mark {\n  width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center;\n  background: transparent; flex: none;\n}\n.brand-mark img { width: 100%; height: 100%; display: block; object-fit: contain; filter: drop-shadow(0 7px 16px rgba(7, 59, 54, 0.3)); }\n.brand-text { display: flex; flex-direction: column; line-height: 1.25; }\n.brand-text strong { font-size: 15px; letter-spacing: -0.01em; }\n.brand-text small { font-size: 11px; opacity: 0.55; letter-spacing: 0.06em; text-transform: uppercase; }\n.brand-light { color: #fff; }\n.brand-light .brand-text small { color: rgba(255,255,255,0.55); }\n\n/* App shell */\n.app { display: flex; min-height: 100vh; }\n.sidebar {\n  width: var(--sidebar-w); flex: none; position: fixed; inset: 0 auto 0 0; z-index: 40;\n  background: linear-gradient(180deg, var(--teal-950), #062f2b 70%);\n  color: #fff; display: flex; flex-direction: column; padding: 22px 16px 18px;\n}\n.sidebar-brand { padding: 4px 8px 22px; }\n.nav { flex: 1; overflow-y: auto; padding-right: 4px; }\n.nav::-webkit-scrollbar { width: 5px; }\n.nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 99px; }\n.nav-section { margin-top: 18px; }\n.nav-label { padding: 0 10px 8px; font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase; color: rgba(255,255,255,0.36); font-weight: 700; }\n.nav-item {\n  display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: 9px;\n  color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px; margin-bottom: 2px;\n  border: 1px solid transparent; transition: 0.14s ease;\n}\n.nav-item svg { flex: none; opacity: 0.75; }\n.nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }\n.nav-item.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.1); color: #fff; font-weight: 600; }\n.nav-item.active svg { color: #ffd479; opacity: 1; }\n.sidebar-foot { padding: 16px 6px 0; border-top: 1px solid rgba(255,255,255,0.09); margin-top: 14px; }\n.sidebar-foot-card { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.05); }\n.sidebar-foot-card .dot { width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 0 4px rgba(251,191,36,0.15); transition: background 0.2s ease, box-shadow 0.2s ease; }\n.sidebar-foot-card .dot.is-ok { background: #4ade80; box-shadow: 0 0 0 4px rgba(74,222,128,0.15); }\n.sidebar-foot-card .dot.is-warning { background: #fbbf24; box-shadow: 0 0 0 4px rgba(251,191,36,0.15); }\n.sidebar-foot-card .dot.is-error { background: #f87171; box-shadow: 0 0 0 4px rgba(248,113,113,0.18); }\n.sidebar-foot-card strong { display: block; font-size: 11px; font-weight: 600; }\n.sidebar-foot-card small { font-size: 10px; color: rgba(255,255,255,0.45); }\n.sidebar-version { font-size: 10px; color: rgba(255,255,255,0.3); padding: 12px 10px 0; letter-spacing: 0.05em; }\n.sidebar-backdrop { display: none; }\n.main { flex: 1; margin-left: var(--sidebar-w); min-width: 0; display: flex; flex-direction: column; min-height: 100vh; }\n\n/* Topbar */\n.topbar {\n  height: 78px; background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);\n  border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 16px;\n  padding: 0 32px; position: sticky; top: 0; z-index: 30;\n}\n.topbar-title h2 { font-size: 18px; letter-spacing: -0.01em; }\n.topbar-title span { font-size: 12px; color: var(--muted); }\n.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 14px; }\n.today-chip { font-size: 12px; color: var(--ink-soft); background: var(--surface); border: 1px solid var(--line); padding: 7px 12px; border-radius: 99px; white-space: nowrap; }\n.icon-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); display: grid; place-items: center; cursor: pointer; color: var(--ink-soft); }\n.menu-toggle { display: none; }\n.user-menu { position: relative; }\n.user-button { display: flex; align-items: center; gap: 10px; background: transparent; border: 0; cursor: pointer; padding: 4px; border-radius: 12px; }\n.user-button:hover { background: var(--surface-soft); }\n.avatar {\n  width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center;\n  background: var(--teal-100); color: var(--teal-800); font-weight: 700; font-size: 13px;\n}\n.user-meta { display: flex; flex-direction: column; text-align: left; line-height: 1.2; }\n.user-meta strong { font-size: 12px; }\n.user-meta small { font-size: 10px; color: var(--muted); }\n.dropdown {\n  position: absolute; right: 0; top: 52px; width: 250px; background: var(--surface); border: 1px solid var(--line);\n  border-radius: 13px; box-shadow: var(--shadow-md); overflow: hidden; z-index: 50;\n}\n.dropdown-head { padding: 15px; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 3px; }\n.dropdown-head strong { font-size: 13px; }\n.dropdown-head span { font-size: 11px; color: var(--muted); }\n.dropdown button { width: 100%; text-align: left; border: 0; background: transparent; padding: 12px 15px; cursor: pointer; color: var(--danger); font-size: 12px; }\n.dropdown button:hover { background: var(--danger-soft); }\n\n/* Page */\n.page { padding: 30px 32px 60px; max-width: 1480px; width: 100%; margin: 0 auto; outline: none; }\n.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }\n.page-header h1 { font-size: 26px; letter-spacing: -0.025em; }\n.page-header p { color: var(--muted); margin-top: 5px; max-width: 720px; font-size: 13px; }\n.page-actions { display: flex; gap: 9px; flex-wrap: wrap; align-items: center; }\n.section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 12px; }\n.muted { color: var(--muted); }\n.small { font-size: 12px; }\n.mono { font-variant-numeric: tabular-nums; }\n.numeric { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.nowrap { white-space: nowrap; }\n.stack { display: grid; gap: 18px; }\n.grid { display: grid; gap: 16px; }\n.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.flex { display: flex; gap: 10px; align-items: center; }\n.flex-wrap { flex-wrap: wrap; }\n.between { justify-content: space-between; }\n.mt-8 { margin-top: 8px; } .mt-12 { margin-top: 12px; } .mt-16 { margin-top: 16px; } .mt-24 { margin-top: 24px; }\n.mb-16 { margin-bottom: 16px; }\n\n/* Buttons */\n.btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 7px;\n  border-radius: 9px; border: 1px solid var(--line-strong); background: var(--surface);\n  padding: 9px 14px; font-size: 12.5px; font-weight: 600; cursor: pointer; color: var(--ink);\n  text-decoration: none; transition: 0.14s ease; white-space: nowrap;\n}\n.btn:hover { border-color: var(--teal-600); color: var(--teal-800); background: var(--teal-50); }\n.btn-primary { background: var(--teal-700); border-color: var(--teal-700); color: #fff; box-shadow: var(--shadow-sm); }\n.btn-primary:hover { background: var(--teal-800); border-color: var(--teal-800); color: #fff; }\n.btn-accent { background: var(--amber); border-color: var(--amber); color: #fff; }\n.btn-accent:hover { background: #96621a; border-color: #96621a; color: #fff; }\n.btn-danger { color: var(--danger); border-color: #efc4c0; background: #fff; }\n.btn-danger:hover { background: var(--danger-soft); border-color: var(--danger); color: var(--danger); }\n.btn-ghost { border-color: transparent; background: transparent; }\n.btn-ghost:hover { background: var(--surface-soft); border-color: var(--line); }\n.btn-sm { padding: 6px 10px; font-size: 11.5px; border-radius: 7px; }\n.btn-block { width: 100%; }\n.btn:disabled { opacity: 0.5; cursor: not-allowed; }\n.btn-group { display: inline-flex; gap: 6px; flex-wrap: wrap; }\n\n/* Cards */\n.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-sm); }\n.card-pad { padding: 22px; }\n.card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--line); }\n.card-head h3 { font-size: 14px; }\n.card-head p { font-size: 12px; color: var(--muted); margin-top: 2px; }\n.card-body { padding: 22px; }\n.card-body.tight { padding: 0; }\n.stat-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; }\n.stat-card::after { content: \"\"; position: absolute; right: -24px; top: -24px; width: 90px; height: 90px; border-radius: 50%; background: var(--teal-50); }\n.stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 700; }\n.stat-value { font-size: 26px; font-weight: 700; letter-spacing: -0.03em; margin-top: 8px; position: relative; z-index: 1; }\n.stat-value.sm { font-size: 21px; }\n.stat-foot { margin-top: 8px; font-size: 11.5px; color: var(--ink-soft); display: flex; gap: 6px; align-items: center; position: relative; z-index: 1; }\n.stat-icon { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; margin-bottom: 12px; background: var(--teal-50); color: var(--teal-700); }\n.stat-card.amber .stat-icon { background: var(--amber-soft); color: var(--amber); }\n.stat-card.red .stat-icon { background: var(--danger-soft); color: var(--danger); }\n.stat-card.blue .stat-icon { background: var(--blue-soft); color: var(--blue); }\n.stat-card.purple .stat-icon { background: var(--purple-soft); color: var(--purple); }\n.stat-trend { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 99px; background: var(--teal-50); color: var(--teal-800); }\n.stat-trend.warn { background: var(--amber-soft); color: var(--amber); }\n.stat-trend.bad { background: var(--danger-soft); color: var(--danger); }\n\n/* Badges */\n.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; white-space: nowrap; background: var(--surface-soft); color: var(--ink-soft); border: 1px solid var(--line); }\n.badge::before { content: \"\"; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.7; }\n.badge.green { background: #e9f8f0; color: #177245; border-color: #c6eed8; }\n.badge.teal { background: var(--teal-50); color: var(--teal-800); border-color: var(--teal-100); }\n.badge.amber { background: var(--amber-soft); color: var(--amber); border-color: #f5dfb4; }\n.badge.red { background: var(--danger-soft); color: var(--danger); border-color: #f3c9c5; }\n.badge.blue { background: var(--blue-soft); color: var(--blue); border-color: #c9dcfb; }\n.badge.purple { background: var(--purple-soft); color: var(--purple); border-color: #dfd3fa; }\n.badge.gray { background: #f1f4f3; color: var(--muted); border-color: var(--line); }\n.badge.no-dot::before { display: none; }\n\n/* Forms */\n.field { display: flex; flex-direction: column; gap: 6px; }\n.field > span { font-size: 11.5px; font-weight: 600; color: var(--ink-soft); letter-spacing: 0.01em; }\n.field > span em { color: var(--danger); font-style: normal; }\ninput, select, textarea {\n  width: 100%; border: 1px solid var(--line-strong); background: #fff; border-radius: 9px;\n  padding: 9px 11px; font-size: 13px; outline: none; transition: border-color 0.12s ease, box-shadow 0.12s ease;\n}\ninput:focus, select:focus, textarea:focus { border-color: var(--teal-600); box-shadow: 0 0 0 3px rgba(18,140,130,0.12); }\ninput::placeholder, textarea::placeholder { color: #a5b2af; }\ntextarea { min-height: 78px; resize: vertical; }\nselect { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #7b8b88 50%), linear-gradient(135deg, #7b8b88 50%, transparent 50%); background-position: calc(100% - 15px) 50%, calc(100% - 10px) 50%; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 30px; }\ninput[type=\"date\"], input[type=\"month\"] { color-scheme: light; }\n.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }\n.form-grid .full { grid-column: 1 / -1; }\n.form-section { border-top: 1px solid var(--line); padding-top: 16px; margin-top: 4px; }\n.form-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted); margin-bottom: 12px; }\n.form-hint { font-size: 11px; color: var(--muted); }\n.form-error { background: var(--danger-soft); color: var(--danger); border: 1px solid #f3c9c5; border-radius: 8px; padding: 9px 11px; font-size: 12px; margin-top: 10px; }\n.form-success { background: #e9f8f0; color: #177245; border: 1px solid #c6eed8; border-radius: 8px; padding: 9px 11px; font-size: 12px; margin-top: 10px; }\n.checkbox { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-soft); }\n.checkbox input { width: auto; }\n.filters { display: flex; gap: 11px; flex-wrap: wrap; align-items: flex-end; }\n.filters .field { min-width: 150px; }\n.filters .field.grow { flex: 1; min-width: 220px; }\n\n/* Table */\n.table-wrap { overflow-x: auto; }\ntable.data { width: 100%; border-collapse: collapse; font-size: 12.5px; }\ntable.data th {\n  text-align: left; padding: 11px 14px; background: var(--surface-soft); color: var(--muted);\n  font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid var(--line);\n  white-space: nowrap; user-select: none;\n}\ntable.data th.sortable { cursor: pointer; }\ntable.data th.sortable:hover { color: var(--teal-800); }\ntable.data th .sort-arrow { opacity: 0.5; margin-left: 3px; font-size: 9px; }\ntable.data td { padding: 12px 14px; border-bottom: 1px solid #edf1f0; vertical-align: middle; }\ntable.data tbody tr:hover { background: #fbfcfc; }\ntable.data tbody tr:last-child td { border-bottom: 0; }\ntable.data td.strong { font-weight: 600; }\ntable.data .sub { display: block; font-size: 11px; color: var(--muted); margin-top: 1px; }\n.table-toolbar { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }\n.search-box { position: relative; min-width: 230px; }\n.search-box input { padding-left: 32px; }\n.search-box svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); }\n.table-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--line); flex-wrap: wrap; }\n.pagination { display: flex; align-items: center; gap: 5px; }\n.pagination button { min-width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--line); background: #fff; cursor: pointer; font-size: 11.5px; padding: 0 8px; }\n.pagination button:hover:not(:disabled) { border-color: var(--teal-600); color: var(--teal-800); }\n.pagination button.active { background: var(--teal-700); border-color: var(--teal-700); color: #fff; }\n.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }\n.empty { padding: 48px 24px; text-align: center; color: var(--muted); }\n.empty-icon { width: 46px; height: 46px; border-radius: 13px; background: var(--surface-soft); border: 1px solid var(--line); display: grid; place-items: center; margin: 0 auto 12px; color: var(--muted); }\n.empty strong { display: block; color: var(--ink-soft); font-size: 13px; margin-bottom: 3px; }\n.empty p { font-size: 12px; }\n\n/* Tabs */\n.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--line); margin-bottom: 20px; overflow-x: auto; }\n.tab { border: 0; background: transparent; padding: 10px 14px; font-size: 12.5px; font-weight: 600; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }\n.tab:hover { color: var(--teal-800); }\n.tab.active { color: var(--teal-800); border-bottom-color: var(--teal-700); }\n\n/* Modal */\n.modal-overlay { position: fixed; inset: 0; background: rgba(7, 32, 29, 0.52); backdrop-filter: blur(3px); z-index: 80; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; overflow-y: auto; }\n.modal { width: 100%; max-width: 620px; background: #fff; border-radius: 18px; box-shadow: var(--shadow-lg); animation: modal-in 0.18s ease; margin: auto; }\n.modal.lg { max-width: 820px; }\n.modal.xl { max-width: 1040px; }\n@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(0.99); } to { opacity: 1; transform: none; } }\n.modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--line); }\n.modal-head h3 { font-size: 17px; letter-spacing: -0.01em; }\n.modal-head p { font-size: 12px; color: var(--muted); margin-top: 3px; }\n.modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--line); background: #fff; cursor: pointer; color: var(--muted); font-size: 16px; line-height: 1; }\n.modal-close:hover { background: var(--surface-soft); color: var(--ink); }\n.modal-body { padding: 22px 24px; }\n.modal-foot { display: flex; justify-content: flex-end; gap: 9px; padding: 16px 24px; border-top: 1px solid var(--line); background: var(--surface-soft); border-radius: 0 0 18px 18px; flex-wrap: wrap; }\n.modal-foot .left { margin-right: auto; }\n.confirm-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--amber-soft); color: var(--amber); display: grid; place-items: center; margin-bottom: 14px; }\n\n/* Toast */\n.toast-root { position: fixed; right: 22px; bottom: 22px; z-index: 120; display: flex; flex-direction: column; gap: 9px; max-width: 380px; }\n.toast { display: flex; gap: 10px; align-items: flex-start; background: var(--ink); color: #fff; padding: 12px 15px; border-radius: 11px; box-shadow: var(--shadow-md); font-size: 12.5px; animation: toast-in 0.2s ease; }\n.toast.success { background: #124f3a; }\n.toast.error { background: #7a1f18; }\n.toast.info { background: var(--teal-900); }\n.toast strong { display: block; font-size: 12px; margin-bottom: 2px; }\n.toast span { color: rgba(255,255,255,0.78); }\n.toast .toast-close { margin-left: auto; background: transparent; border: 0; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 15px; line-height: 1; }\n@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\n\n/* Dashboard specifics */\n.dashboard-hero { display: flex; justify-content: space-between; gap: 24px; padding: 26px 28px; border-radius: var(--radius); background: linear-gradient(120deg, var(--teal-950), var(--teal-800)); color: #fff; overflow: hidden; position: relative; }\n.dashboard-hero::after { content: \"\"; position: absolute; width: 280px; height: 280px; border: 1px solid rgba(255,255,255,0.12); border-radius: 50%; right: -60px; top: -140px; }\n.dashboard-hero h2 { font-size: 22px; letter-spacing: -0.02em; }\n.dashboard-hero p { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 6px; max-width: 580px; }\n.hero-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; position: relative; z-index: 1; }\n.hero-actions .btn { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); color: #fff; }\n.hero-actions .btn:hover { background: rgba(255,255,255,0.18); color: #fff; }\n.hero-actions .btn-primary { background: #fff; color: var(--teal-900); border-color: #fff; }\n.hero-actions .btn-primary:hover { background: #f2f8f7; color: var(--teal-950); }\n.occupancy-bar { height: 10px; border-radius: 99px; background: #eef2f1; overflow: hidden; display: flex; }\n.occupancy-bar span { display: block; height: 100%; }\n.legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: var(--ink-soft); margin-top: 12px; }\n.legend span { display: flex; align-items: center; gap: 6px; }\n.legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }\n.room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }\n.room-tile { border: 1px solid var(--line); border-radius: 11px; padding: 12px; background: var(--surface); }\n.room-tile .room-no { font-weight: 700; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }\n.room-tile small { color: var(--muted); font-size: 10.5px; display: block; margin-top: 3px; }\n.quick-list { display: grid; gap: 10px; }\n.quick-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border: 1px solid var(--line); border-radius: 11px; background: var(--surface); text-decoration: none; color: inherit; }\n.quick-item:hover { border-color: var(--teal-600); background: var(--teal-50); }\n.quick-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--teal-50); color: var(--teal-800); display: grid; place-items: center; flex: none; }\n.quick-item strong { display: block; font-size: 12.5px; }\n.quick-item small { font-size: 11px; color: var(--muted); }\n.bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 150px; padding-top: 10px; }\n.bar-chart .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }\n.bar-chart .bars { display: flex; align-items: flex-end; gap: 3px; width: 100%; justify-content: center; height: 100%; }\n.bar-chart .bar { width: 34%; border-radius: 4px 4px 0 0; min-height: 2px; background: var(--teal-700); }\n.bar-chart .bar.expense { background: #d7a84b; }\n.bar-chart .bar-label { font-size: 10px; color: var(--muted); }\n.chart-legend { display: flex; gap: 14px; font-size: 11px; color: var(--muted); margin-top: 8px; }\n.chart-legend i { width: 8px; height: 8px; display: inline-block; border-radius: 2px; margin-right: 5px; }\n\n/* Detail lists */\n.detail-list { display: grid; gap: 10px; }\n.detail-row { display: flex; justify-content: space-between; gap: 16px; font-size: 12.5px; padding-bottom: 9px; border-bottom: 1px dashed var(--line); }\n.detail-row:last-child { border-bottom: 0; padding-bottom: 0; }\n.detail-row dt { color: var(--muted); }\n.detail-row dd { margin: 0; font-weight: 600; text-align: right; }\n.money-lg { font-size: 27px; font-weight: 700; letter-spacing: -0.03em; }\n.money-positive { color: #177245; }\n.money-negative { color: var(--danger); }\n.info-strip { display: flex; gap: 14px; align-items: center; padding: 12px 15px; border-radius: 10px; background: var(--teal-50); border: 1px solid var(--teal-100); font-size: 12px; color: var(--teal-900); }\n.info-strip.warn { background: var(--amber-soft); border-color: #f5dfb4; color: #7a5214; }\n.info-strip.danger { background: var(--danger-soft); border-color: #f3c9c5; color: var(--danger); }\n.print-doc { background: #fff; color: #111; font-size: 13px; }\n.print-doc h1 { font-size: 20px; }\n.print-doc table { width: 100%; border-collapse: collapse; margin-top: 12px; }\n.print-doc th, .print-doc td { padding: 7px 8px; border-bottom: 1px solid #ddd; text-align: left; font-size: 12px; }\n.print-doc th { background: #f4f4f4; }\n.doc-head { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }\n.doc-head h1 { margin: 0 0 3px; }\n.doc-meta { text-align: right; font-size: 12px; }\n.doc-foot { margin-top: 22px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #555; }\n.print-only { display: none; }\n\n/* Misc */\n.loading-inline { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 46px; color: var(--muted); font-size: 12px; }\n.spinner { width: 18px; height: 18px; border: 2px solid var(--line); border-top-color: var(--teal-700); border-radius: 50%; animation: spin 0.8s linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }\n.list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }\n.chip-select { display: flex; gap: 6px; flex-wrap: wrap; }\n.chip { border: 1px solid var(--line); background: #fff; border-radius: 99px; padding: 5px 11px; font-size: 11.5px; cursor: pointer; color: var(--ink-soft); }\n.chip.active { background: var(--teal-700); border-color: var(--teal-700); color: #fff; }\n.inline-note { font-size: 11px; color: var(--muted); }\n.avatar-sm { width: 30px; height: 30px; border-radius: 9px; background: var(--teal-50); color: var(--teal-800); display: inline-grid; place-items: center; font-size: 10.5px; font-weight: 700; flex: none; }\n.cell-user { display: flex; align-items: center; gap: 9px; }\n.cell-user strong { display: block; font-size: 12.5px; }\n.cell-user small { color: var(--muted); font-size: 10.5px; }\n.settlement-hero { text-align: center; padding: 8px 0 18px; }\n.settlement-hero .money-lg { font-size: 32px; }\n.settlement-note { font-size: 11.5px; color: var(--muted); margin-top: 4px; }\n.amount-input { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }\n.kv-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }\n.kv { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }\n.kv span { display: block; font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }\n.kv strong { display: block; font-size: 15px; margin-top: 3px; }\n.notice { padding: 12px 14px; border-radius: 10px; font-size: 12px; border: 1px solid var(--line); background: var(--surface-soft); color: var(--ink-soft); }\n.notice.warn { background: var(--amber-soft); border-color: #f5dfb4; color: #7a5214; }\n.notice.danger { background: var(--danger-soft); border-color: #f3c9c5; color: var(--danger); }\n.notice.ok { background: #e9f8f0; border-color: #c6eed8; color: #177245; }\n\n\n/* Reports & filters */\n.filter-bar { padding: 16px 20px; }\n.field.inline { flex-direction: row; align-items: center; gap: 8px; }\n.field.inline > span { white-space: nowrap; }\n.field.inline input, .field.inline select { width: auto; min-width: 150px; }\n.report-row { position: relative; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 9px 0 12px; border-bottom: 1px solid var(--line); font-size: 12.5px; color: var(--ink-soft); }\n.report-row:last-child { border-bottom: 0; }\n.report-row .progress { position: absolute; left: 0; bottom: 4px; height: 3px; width: 100%; background: var(--surface-soft); border-radius: 99px; overflow: hidden; }\n.report-row .progress span { display: block; height: 100%; background: var(--teal-600); border-radius: 99px; }\n.report-row .progress span.amber { background: var(--amber); }\n.statement-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; }\n.statement-head h2 { font-size: 20px; letter-spacing: -0.02em; }\n.statement-head .grid { gap: 10px; }\n.statement-head .stat-card { padding: 14px; }\n.statement-head .stat-value { font-size: 17px; }\n\n/* Responsive */\n@media (max-width: 1180px) {\n  .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n}\n@media (max-width: 960px) {\n  .login-screen { grid-template-columns: 1fr; }\n  .login-visual { display: none; }\n  .login-form-side { min-height: 100vh; padding: 28px 18px; }\n  .sidebar { transform: translateX(-100%); transition: transform 0.2s ease; box-shadow: var(--shadow-lg); }\n  .app.sidebar-open .sidebar { transform: none; }\n  .app.sidebar-open .sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(7,32,29,0.45); z-index: 35; }\n  .main { margin-left: 0; }\n  .menu-toggle { display: grid; }\n  .topbar { padding: 0 18px; height: 70px; }\n  .page { padding: 22px 18px 50px; }\n  .today-chip { display: none; }\n  .user-meta { display: none; }\n}\n@media (max-width: 700px) {\n  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }\n  .form-grid { grid-template-columns: 1fr; }\n  .page-header h1 { font-size: 22px; }\n  .stat-value { font-size: 22px; }\n  .modal-overlay { padding: 16px 10px; }\n  .modal-body { padding: 18px; }\n  .modal-head { padding: 17px 18px; }\n  .modal-foot { padding: 14px 18px; }\n  .dashboard-hero { padding: 20px; flex-direction: column; }\n  .filters .field { min-width: 100%; }\n  .table-toolbar { padding: 12px; }\n  .search-box { width: 100%; }\n  .kv-grid { grid-template-columns: 1fr; }\n  .statement-head .grid { min-width: 0 !important; width: 100%; }\n  .field.inline { flex-direction: column; align-items: stretch; }\n  .field.inline input, .field.inline select { width: 100%; }\n  .detail-row { flex-direction: column; gap: 3px; }\n  .detail-row dd { text-align: left; }\n  .toast-root { left: 12px; right: 12px; bottom: 12px; max-width: none; }\n}\n\n@media print {\n  body { background: #fff; }\n  .sidebar, .topbar, .page-actions, .modal-foot, .toast-root, .btn { display: none !important; }\n  .main { margin: 0; }\n  .page { padding: 0; }\n  .card { border: 0; box-shadow: none; }\n  .modal-overlay { position: static; background: #fff; padding: 0; }\n  .modal { box-shadow: none; max-width: none; }\n  .modal-head { border: 0; padding: 0 0 10px; }\n  .modal-body { padding: 0; }\n}\n\n</style>\n  <link rel=\"icon\" href=\"data:image/x-icon;base64,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\" sizes=\"any\">\n  <link rel=\"apple-touch-icon\" href=\"data:image/png;base64,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\">\n</head>\n<body>\n  <div id=\"boot-screen\" class=\"boot-screen\">\n    <div class=\"boot-mark\"><img src=\"data:image/png;base64,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\" alt=\"\"></div>\n    <div class=\"boot-text\">Memuat sistem operasional kos...</div>\n  </div>\n\n  <section id=\"login-screen\" class=\"login-screen hidden\" aria-label=\"Halaman masuk\">\n    <div class=\"login-visual\">\n      <div class=\"login-visual-inner\">\n        <div class=\"brand brand-light\">\n          <span class=\"brand-mark\"><img src=\"data:image/png;base64,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\" alt=\"\"></span>\n          <span class=\"brand-text\"><strong id=\"login-property-name\">Kelola Kos</strong><small>Sistem Operasional Kos</small></span>\n        </div>\n        <h1>Kelola hunian, tagihan, dan keuangan dalam satu sistem.</h1>\n        <p class=\"login-lead\">Operasional harian yang rapi: ketersediaan kamar, perjanjian sewa, invoice bulanan, pembayaran bertahap, layanan tambahan, deposit, hingga laporan keuangan yang dapat direkonsiliasi.</p>\n        <ul class=\"login-features\">\n          <li><span>01</span>Kamar, penghuni, dan reservasi terpusat</li>\n          <li><span>02</span>Tagihan bulanan otomatis dan idempoten</li>\n          <li><span>03</span>Pembayaran sebagian dengan alokasi yang teraudit</li>\n          <li><span>04</span>Laporan arus kas, piutang, dan deposit</li>\n        </ul>\n        <div class=\"login-footnote\">Bahasa Indonesia &middot; Rupiah &middot; Siap operasional harian</div>\n      </div>\n    </div>\n    <div class=\"login-form-side\">\n      <form id=\"login-form\" class=\"login-card\" autocomplete=\"on\">\n        <div class=\"login-card-head\">\n          <h2>Masuk ke sistem</h2>\n          <p>Gunakan akun staf yang sudah terdaftar.</p>\n        </div>\n        <label class=\"field\">\n          <span>Email</span>\n          <input id=\"login-email\" type=\"email\" name=\"email\" required placeholder=\"nama@kos.id\" autocomplete=\"username\">\n        </label>\n        <label class=\"field\">\n          <span>Password</span>\n          <input id=\"login-password\" type=\"password\" name=\"password\" required placeholder=\"Masukkan password\" autocomplete=\"current-password\">\n        </label>\n        <div id=\"login-error\" class=\"form-error hidden\"></div>\n        <button id=\"login-submit\" class=\"btn btn-primary btn-block\" type=\"submit\">Masuk</button>\n        <div class=\"demo-accounts\">\n          <div class=\"demo-title\">Akun demo</div>\n          <button type=\"button\" class=\"demo-account\" data-email=\"owner@kos.id\" data-password=\"owner123\"><strong>Owner</strong><span>owner@kos.id</span><em>owner123</em></button>\n          <button type=\"button\" class=\"demo-account\" data-email=\"manager@kos.id\" data-password=\"manager123\"><strong>Manager</strong><span>manager@kos.id</span><em>manager123</em></button>\n          <button type=\"button\" class=\"demo-account\" data-email=\"resepsionis@kos.id\" data-password=\"reception123\"><strong>Receptionist</strong><span>resepsionis@kos.id</span><em>reception123</em></button>\n          <button type=\"button\" class=\"demo-account\" data-email=\"kasir@kos.id\" data-password=\"cashier123\"><strong>Cashier</strong><span>kasir@kos.id</span><em>cashier123</em></button>\n          <button type=\"button\" class=\"demo-account\" data-email=\"staf@kos.id\" data-password=\"staff123\"><strong>Operational Staff</strong><span>staf@kos.id</span><em>staff123</em></button>\n        </div>\n      </form>\n    </div>\n  </section>\n\n  <div id=\"app\" class=\"app hidden\">\n    <div id=\"sidebar-backdrop\" class=\"sidebar-backdrop\"></div>\n    <aside id=\"sidebar\" class=\"sidebar\">\n      <div class=\"brand brand-light sidebar-brand\">\n        <span class=\"brand-mark\"><img src=\"data:image/png;base64,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\" alt=\"\"></span>\n        <span class=\"brand-text\"><strong id=\"property-name\">Kelola Kos</strong><small>Sistem Operasional</small></span>\n      </div>\n      <nav id=\"nav\" class=\"nav\" aria-label=\"Navigasi utama\"></nav>\n      <div class=\"sidebar-foot\">\n        <div class=\"sidebar-foot-card\">\n          <span class=\"dot is-checking\" id=\"storage-dot\" role=\"img\" aria-label=\"Status koneksi: memeriksa\"></span>\n          <div><strong>Data tersimpan</strong><small id=\"storage-backend\">Buku besar operasional</small></div>\n        </div>\n        <div class=\"sidebar-version\">Versi 1.0 &middot; IDR</div>\n      </div>\n    </aside>\n    <div class=\"main\">\n      <header class=\"topbar\">\n        <button id=\"menu-toggle\" class=\"icon-btn menu-toggle\" type=\"button\" aria-label=\"Buka menu\">\n          <svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\"><path d=\"M4 7h16M4 12h16M4 17h16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>\n        </button>\n        <div class=\"topbar-title\">\n          <h2 id=\"page-title\">Dashboard</h2>\n          <span id=\"page-subtitle\">Ringkasan operasional hari ini</span>\n        </div>\n        <div class=\"topbar-right\">\n          <div class=\"today-chip\" id=\"today-chip\"></div>\n          <div class=\"user-menu\">\n            <button id=\"user-button\" class=\"user-button\" type=\"button\" aria-haspopup=\"true\">\n              <span id=\"user-avatar\" class=\"avatar\">DL</span>\n              <span class=\"user-meta\"><strong id=\"user-name\">-</strong><small id=\"user-role\">-</small></span>\n              <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M6 9l6 6 6-6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>\n            </button>\n            <div id=\"user-dropdown\" class=\"dropdown hidden\">\n              <div class=\"dropdown-head\"><strong id=\"dropdown-name\">-</strong><span id=\"dropdown-email\">-</span></div>\n              <button type=\"button\" id=\"logout-button\">Keluar dari sistem</button>\n            </div>\n          </div>\n        </div>\n      </header>\n      <main id=\"page\" class=\"page\" tabindex=\"-1\"></main>\n    </div>\n  </div>\n\n  <div id=\"modal-root\"></div>\n  <div id=\"toast-root\" class=\"toast-root\" aria-live=\"polite\"></div>\n  <script>\n'use strict';\n\n(() => {\n  const host = String(window.location.hostname || '').toLowerCase();\n  const localPreview = host === 'localhost'\n    || host === '127.0.0.1'\n    || host === '::1'\n    || host === '[::1]'\n    || /(^|\\.)monkeycode-ai\\.live$/.test(host);\n  const staticHost = /(^|\\.)pages\\.dev$/.test(host) || /(^|\\.)github\\.io$/.test(host);\n  const useNodeApi = localPreview || !staticHost;\n\n  window.KOS_CONFIG = {\n    gasBridgeUrl: useNodeApi ? '' : 'https://script.google.com/macros/s/AKfycbyqxmkMpqAp2ZvTROe2BQbL0rC5bYt_OtYkaeTSVYZN8hkrBqkAzntXJBpIUDslw-cbng/exec'\n  };\n})();\n\n</script>\n  <script>\n'use strict';\n\nconst API = (() => {\n  const TOKEN_KEY = 'kos_gas_token';\n  const BRIDGE_CHANNEL = 'kos-bridge';\n  const BRIDGE_TIMEOUT = 45000;\n  const GET_TTL = 60000;\n  const CACHE_KEY = 'kos_get_cache_v1';\n  const MAX_CACHE_CHARS = 2000000;\n  const MAX_ENTRY_CHARS = 250000;\n  let memoryToken = '';\n  const bridgePending = {};\n  const getCache = new Map();\n  const inflight = new Map();\n  let cacheGeneration = 0;\n  let cacheLoaded = false;\n  let cacheKey = '';\n\n  function storageKey() {\n    return `${CACHE_KEY}:${readToken() || 'guest'}`;\n  }\n\n  function loadGetCache() {\n    const key = storageKey();\n    if (cacheLoaded && cacheKey === key) return;\n    cacheLoaded = true;\n    cacheKey = key;\n    getCache.clear();\n    try {\n      const raw = sessionStorage.getItem(key);\n      if (!raw) return;\n      const parsed = JSON.parse(raw);\n      const now = Date.now();\n      Object.entries(parsed).forEach(([path, entry]) => {\n        if (entry && entry.expires > now && entry.data !== undefined) getCache.set(path, entry);\n      });\n    } catch (error) { /* ignore unavailable or corrupted cache */ }\n  }\n\n  function saveGetCache() {\n    try {\n      const now = Date.now();\n      const entries = {};\n      let chars = 0;\n      getCache.forEach((entry, path) => {\n        if (!entry || entry.expires <= now) return;\n        const serialized = JSON.stringify(entry);\n        if (serialized.length > MAX_ENTRY_CHARS) return;\n        if (chars + serialized.length > MAX_CACHE_CHARS) return;\n        entries[path] = entry;\n        chars += serialized.length;\n      });\n      sessionStorage.setItem(storageKey(), JSON.stringify(entries));\n    } catch (error) { /* ignore unavailable or full storage */ }\n  }\n\n  function clearGetCache() {\n    cacheGeneration += 1;\n    getCache.clear();\n    inflight.clear();\n    cacheLoaded = false;\n    cacheKey = '';\n    try { sessionStorage.removeItem(storageKey()); } catch (error) { /* storage may be unavailable */ }\n  }\n\n  function clone(value) {\n    if (typeof structuredClone === 'function') {\n      try { return structuredClone(value); } catch (error) { /* fall back to JSON */ }\n    }\n    return JSON.parse(JSON.stringify(value));\n  }\n\n  function isGas() {\n    return typeof google !== 'undefined' && google.script && google.script.run;\n  }\n\n  function configuredBridgeUrl() {\n    const config = window.KOS_CONFIG || {};\n    return String(config.gasBridgeUrl || '').trim();\n  }\n\n  function isGoogleOrigin(origin) {\n    return /^https:\\/\\/([a-z0-9-]+\\.)*(script\\.google\\.com|googleusercontent\\.com)$/i.test(origin);\n  }\n\n  function readToken() {\n    if (memoryToken) return memoryToken;\n    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (error) { return ''; }\n  }\n\n  function writeToken(token) {\n    clearGetCache();\n    memoryToken = token;\n    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (error) { /* storage may be unavailable */ }\n  }\n\n  function clearToken() {\n    clearGetCache();\n    memoryToken = '';\n    try { sessionStorage.removeItem(TOKEN_KEY); } catch (error) { /* storage may be unavailable */ }\n  }\n\n  function applyPayload(path, payload) {\n    if (!payload || payload.ok === false) {\n      const status = payload && payload.status ? payload.status : 500;\n      if (status === 401 && !path.startsWith('/auth/')) {\n        clearToken();\n        if (typeof window.onUnauthorized === 'function') window.onUnauthorized();\n      }\n      const error = new Error((payload && payload.error) || 'Permintaan gagal.');\n      error.status = status;\n      error.code = payload && payload.code;\n      throw error;\n    }\n    if (path === '/auth/login' && payload.token) writeToken(payload.token);\n    if (path === '/auth/logout') clearToken();\n    return payload.data;\n  }\n\n  function gasRequest(path, method, body) {\n    return new Promise((resolve, reject) => {\n      google.script.run\n        .withSuccessHandler((payload) => {\n          try { resolve(applyPayload(path, payload)); } catch (error) { reject(error); }\n        })\n        .withFailureHandler((error) => {\n          reject(new Error(error && error.message ? error.message : 'Tidak dapat terhubung ke server.'));\n        })\n        .gasApi(readToken(), method, path, body || {});\n    });\n  }\n\n  function bridgeId() {\n    if (window.crypto && window.crypto.getRandomValues) {\n      const bytes = new Uint8Array(12);\n      window.crypto.getRandomValues(bytes);\n      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');\n    }\n    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;\n  }\n\n  function onBridgeMessage(event) {\n    const data = event.data || {};\n    if (data.channel !== BRIDGE_CHANNEL || data.type !== 'response') return;\n    const pending = bridgePending[data.id];\n    if (!pending || !isGoogleOrigin(event.origin)) return;\n    delete bridgePending[data.id];\n    clearTimeout(pending.timer);\n    pending.cleanup();\n    try {\n      pending.resolve(applyPayload(pending.path, data.result));\n    } catch (error) {\n      pending.reject(error);\n    }\n  }\n\n  function bridgeRequest(path, method, body) {\n    const url = configuredBridgeUrl();\n    const id = bridgeId();\n    const separator = url.indexOf('?') === -1 ? '?' : '&';\n    return new Promise((resolve, reject) => {\n      const frameName = `kos-bridge-${id}`;\n      const iframe = document.createElement('iframe');\n      iframe.name = frameName;\n      iframe.title = 'KOS API Bridge';\n      iframe.setAttribute('aria-hidden', 'true');\n      iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';\n\n      const form = document.createElement('form');\n      form.method = 'POST';\n      form.target = frameName;\n      form.action = `${url}${separator}bridgeResponse=1&id=${encodeURIComponent(id)}`;\n      form.style.display = 'none';\n      const input = document.createElement('input');\n      input.type = 'hidden';\n      input.name = 'payload';\n      input.value = JSON.stringify({\n        token: readToken(),\n        method: method || 'GET',\n        path,\n        body: body || {},\n        origin: location.origin,\n      });\n      form.appendChild(input);\n\n      let cleaned = false;\n      const cleanup = () => {\n        if (cleaned) return;\n        cleaned = true;\n        if (form.parentNode) form.parentNode.removeChild(form);\n        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);\n      };\n\n      const timer = setTimeout(() => {\n        delete bridgePending[id];\n        cleanup();\n        reject(new Error('Backend Apps Script tidak merespons. Periksa gasBridgeUrl dan akses deployment.'));\n      }, BRIDGE_TIMEOUT);\n\n      bridgePending[id] = { resolve, reject, timer, path, cleanup };\n      document.body.appendChild(iframe);\n      document.body.appendChild(form);\n      try {\n        form.submit();\n      } catch (error) {\n        delete bridgePending[id];\n        clearTimeout(timer);\n        cleanup();\n        reject(new Error('Tidak dapat mengirim permintaan ke Apps Script.'));\n      }\n    });\n  }\n\n  async function request(path, options = {}) {\n    const method = options.method || 'GET';\n    if (method !== 'GET') clearGetCache();\n    if (isGas()) return gasRequest(path, method, options.body);\n    if (configuredBridgeUrl()) return bridgeRequest(path, method, options.body);\n    if (location.protocol === 'file:' || /(^|\\.)github\\.io$/.test(location.hostname)) {\n      throw new Error('Backend Apps Script belum diatur. Isi gasBridgeUrl pada js/config.js dengan URL deployment /exec.');\n    }\n    const config = { method, headers: {}, credentials: 'same-origin' };\n    if (options.body !== undefined) {\n      config.headers['Content-Type'] = 'application/json';\n      config.body = JSON.stringify(options.body);\n    }\n    let response;\n    try {\n      response = await fetch(`/api${path}`, config);\n    } catch (error) {\n      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');\n    }\n    let payload = null;\n    try { payload = await response.json(); } catch (error) { payload = null; }\n    if (!response.ok || !payload || payload.ok === false) {\n      if (response.status === 401 && !path.startsWith('/auth/')) {\n        if (typeof window.onUnauthorized === 'function') window.onUnauthorized();\n      }\n      const err = new Error((payload && payload.error) || `Permintaan gagal (${response.status}).`);\n      err.status = response.status;\n      err.code = payload && payload.code;\n      throw err;\n    }\n    return payload.data;\n  }\n\n  function get(path, params) {\n    let query = '';\n    if (params) {\n      const usable = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');\n      if (usable.length) query = `?${new URLSearchParams(usable).toString()}`;\n    }\n    const fullPath = `${path}${query}`;\n    loadGetCache();\n    const cached = getCache.get(fullPath);\n    if (cached && cached.expires > Date.now()) return Promise.resolve(clone(cached.data));\n    if (inflight.has(fullPath)) return inflight.get(fullPath);\n    const generation = cacheGeneration;\n    const promise = request(fullPath).then((data) => {\n      if (generation === cacheGeneration) {\n        getCache.set(fullPath, { data: clone(data), expires: Date.now() + GET_TTL });\n        saveGetCache();\n      }\n      inflight.delete(fullPath);\n      return data;\n    }, (error) => {\n      inflight.delete(fullPath);\n      throw error;\n    });\n    inflight.set(fullPath, promise);\n    return promise;\n  }\n\n  window.addEventListener('message', onBridgeMessage);\n\n  return {\n    get,\n    health: () => request('/health'),\n    hasToken: () => !!readToken(),\n    post: (path, body) => request(path, { method: 'POST', body: body || {} }),\n    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),\n    logout: async () => {\n      try {\n        return await request('/auth/logout', { method: 'POST', body: {} });\n      } finally {\n        if (isGas() || configuredBridgeUrl()) clearToken();\n      }\n    },\n    me: () => request('/auth/me'),\n  };\n})();\n\n</script>\n  <script>\n'use strict';\n\nconst UI = (() => {\n  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];\n  const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];\n\n  const STATUS_COLORS = {\n    Available: 'green', Occupied: 'teal', Reserved: 'purple', Maintenance: 'amber', Inactive: 'gray',\n    Active: 'green', Prospective: 'purple', 'Checked Out': 'gray',\n    Pending: 'amber', Confirmed: 'green', Cancelled: 'gray', Converted: 'green', Expired: 'red',\n    Ended: 'gray', Transferred: 'purple', Renewed: 'blue',\n    Draft: 'gray', Issued: 'blue', 'Partially Paid': 'amber', Paid: 'green', Overdue: 'red',\n    Voided: 'red', Refunded: 'purple',\n    'In Progress': 'blue', Completed: 'green',\n    Held: 'blue', 'Partially Returned': 'amber', Returned: 'green',\n    Approved: 'blue', Billed: 'blue',\n    'Immediate Payment': 'blue', 'Add to Invoice': 'amber',\n    IN: 'green', OUT: 'red',\n  };\n\n  function esc(value) {\n    return String(value === undefined || value === null ? '' : value)\n      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')\n      .replace(/\"/g, '&quot;').replace(/'/g, '&#039;');\n  }\n\n  function currency(value) {\n    const n = Number(value || 0);\n    const negative = n < 0;\n    const formatted = Math.abs(n).toLocaleString('id-ID');\n    return `${negative ? '-' : ''}Rp${formatted}`;\n  }\n\n  function compactCurrency(value) {\n    const n = Number(value || 0);\n    if (Math.abs(n) >= 1000000000) return `Rp${(n / 1000000000).toFixed(1).replace('.', ',')} M`;\n    if (Math.abs(n) >= 1000000) return `Rp${(n / 1000000).toFixed(1).replace('.', ',')} jt`;\n    if (Math.abs(n) >= 1000) return `Rp${(n / 1000).toFixed(0)} rb`;\n    return currency(n);\n  }\n\n  function num(value) { return Number(value || 0).toLocaleString('id-ID'); }\n\n  function date(value, style = 'short') {\n    if (!value) return '-';\n    const raw = String(value).slice(0, 10);\n    const parts = raw.split('-');\n    if (parts.length !== 3) return raw;\n    const [y, m, d] = parts.map(Number);\n    if (style === 'long') return `${d} ${MONTHS_LONG[m - 1]} ${y}`;\n    return `${d} ${MONTHS[m - 1]} ${y}`;\n  }\n\n  function dateTime(value) {\n    if (!value) return '-';\n    const dt = new Date(value);\n    if (Number.isNaN(dt.getTime())) return String(value);\n    return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;\n  }\n\n  function monthLabel(value) {\n    const [y, m] = String(value).split('-').map(Number);\n    return `${MONTHS_LONG[(m || 1) - 1]} ${y}`;\n  }\n\n  function todayISO() {\n    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });\n  }\n\n  function monthStartISO(offset = 0) {\n    const dt = new Date();\n    dt.setDate(1);\n    dt.setMonth(dt.getMonth() + offset);\n    return dt.toLocaleDateString('en-CA');\n  }\n\n  function monthEndISO(offset = 0) {\n    const dt = new Date();\n    dt.setDate(1);\n    dt.setMonth(dt.getMonth() + offset + 1);\n    dt.setDate(0);\n    return dt.toLocaleDateString('en-CA');\n  }\n\n  function initials(name) {\n    return String(name || '?').trim().split(/\\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();\n  }\n\n  function badge(status, custom) {\n    const label = custom || status || '-';\n    const color = STATUS_COLORS[status] || 'gray';\n    return `<span class=\"badge ${color}\">${esc(label)}</span>`;\n  }\n\n  function directionBadge(direction) {\n    return `<span class=\"badge ${direction === 'IN' ? 'green' : 'red'}\">${esc(direction)}</span>`;\n  }\n\n  function toast(message, type = 'success', title) {\n    const root = document.getElementById('toast-root');\n    const node = document.createElement('div');\n    node.className = `toast ${type}`;\n    node.innerHTML = `<div><strong>${esc(title || (type === 'error' ? 'Terjadi kesalahan' : type === 'info' ? 'Informasi' : 'Berhasil'))}</strong><span>${esc(message)}</span></div><button class=\"toast-close\" type=\"button\" aria-label=\"Tutup\">&times;</button>`;\n    root.appendChild(node);\n    const remove = () => node.remove();\n    node.querySelector('.toast-close').addEventListener('click', remove);\n    setTimeout(remove, type === 'error' ? 6000 : 4200);\n  }\n\n  function loading(container, message = 'Memuat data...') {\n    container.innerHTML = `<div class=\"loading-inline\"><span class=\"spinner\"></span>${esc(message)}</div>`;\n  }\n\n  function emptyState(title, description = '') {\n    return `<div class=\"empty\"><div class=\"empty-icon\"><svg viewBox=\"0 0 24 24\" width=\"21\" height=\"21\"><path d=\"M4 7h16v12H4zM4 7l2-3h12l2 3M9 11h6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg></div><strong>${esc(title)}</strong><p>${esc(description)}</p></div>`;\n  }\n\n  function pageError(container, error, retry) {\n    container.innerHTML = `<div class=\"card\"><div class=\"empty\"><div class=\"empty-icon\" style=\"background:#fdeceb;color:#b42318\">!</div><strong>Gagal memuat halaman</strong><p>${esc(error.message || error)}</p><button class=\"btn btn-sm mt-12\" type=\"button\" id=\"retry-page\">Coba lagi</button></div></div>`;\n    const btn = container.querySelector('#retry-page');\n    if (btn && retry) btn.addEventListener('click', retry);\n  }\n\n  function openModal({ title, subtitle = '', body = '', size = '', footer = '', onMount }) {\n    const root = document.getElementById('modal-root');\n    const overlay = document.createElement('div');\n    overlay.className = 'modal-overlay';\n    overlay.innerHTML = `<div class=\"modal ${size}\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"modal-head\"><div><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div><button class=\"modal-close\" type=\"button\" aria-label=\"Tutup\">&times;</button></div>\n      <div class=\"modal-body\">${body}</div>\n      ${footer ? `<div class=\"modal-foot\">${footer}</div>` : ''}\n    </div>`;\n    root.appendChild(overlay);\n    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };\n    const onKey = (event) => { if (event.key === 'Escape') close(); };\n    document.addEventListener('keydown', onKey);\n    overlay.querySelector('.modal-close').addEventListener('click', close);\n    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });\n    if (onMount) onMount(overlay, close);\n    return { overlay, close, root };\n  }\n\n  function formModal({ title, subtitle, body, submitText = 'Simpan', cancelText = 'Batal', size = '', onSubmit, onMount, extraFooter = '', danger = false }) {\n    return new Promise((resolve) => {\n      const modal = openModal({\n        title,\n        subtitle,\n        size,\n        body: `<form id=\"modal-form\" novalidate>${body}<div class=\"form-error hidden\" id=\"modal-error\"></div></form>`,\n        footer: `${extraFooter ? `<div class=\"left\">${extraFooter}</div>` : ''}<button class=\"btn\" type=\"button\" data-cancel>${esc(cancelText)}</button><button class=\"btn ${danger ? 'btn-danger' : 'btn-primary'}\" type=\"submit\" form=\"modal-form\">${esc(submitText)}</button>`,\n        onMount: (overlay, close) => {\n          const form = overlay.querySelector('#modal-form');\n          const submitBtn = overlay.querySelector('[type=\"submit\"]');\n          const errorBox = overlay.querySelector('#modal-error');\n          overlay.querySelector('[data-cancel]').addEventListener('click', () => { close(); resolve(null); });\n          overlay.querySelector('.modal-close').addEventListener('click', () => resolve(null));\n          if (onMount) onMount(overlay, close, form);\n          form.addEventListener('submit', async (event) => {\n            event.preventDefault();\n            errorBox.classList.add('hidden');\n            const values = Object.fromEntries(new FormData(form).entries());\n            form.querySelectorAll('input[type=\"checkbox\"]').forEach((checkbox) => { values[checkbox.name] = checkbox.checked; });\n            submitBtn.disabled = true;\n            const original = submitBtn.textContent;\n            submitBtn.textContent = 'Memproses...';\n            try {\n              const result = await onSubmit(values, form, close);\n              if (result !== false) { close(); resolve(result || values); }\n            } catch (error) {\n              errorBox.textContent = error.message || 'Terjadi kesalahan.';\n              errorBox.classList.remove('hidden');\n              errorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });\n            } finally {\n              submitBtn.disabled = false;\n              submitBtn.textContent = original;\n            }\n          });\n        },\n      });\n      const cancelBtn = modal.overlay.querySelector('[data-cancel]');\n      if (cancelBtn) cancelBtn.addEventListener('click', () => {});\n    });\n  }\n\n  function confirmDialog({ title = 'Konfirmasi', message = '', confirmText = 'Ya, lanjutkan', cancelText = 'Batal', danger = false, details = '' }) {\n    return new Promise((resolve) => {\n      const modal = openModal({\n        title,\n        size: '',\n        body: `<div class=\"confirm-icon\">!</div><p style=\"font-size:13px;color:#4a5c59\">${esc(message)}</p>${details ? `<div class=\"mt-16\">${details}</div>` : ''}`,\n        footer: `<button class=\"btn\" type=\"button\" data-cancel>${esc(cancelText)}</button><button class=\"btn ${danger ? 'btn-danger' : 'btn-primary'}\" type=\"button\" data-confirm>${esc(confirmText)}</button>`,\n        onMount: (overlay, close) => {\n          overlay.querySelector('[data-cancel]').addEventListener('click', () => { close(); resolve(false); });\n          overlay.querySelector('.modal-close').addEventListener('click', () => resolve(false));\n          overlay.addEventListener('click', (event) => { if (event.target === overlay) resolve(false); });\n          overlay.querySelector('[data-confirm]').addEventListener('click', () => { close(); resolve(true); });\n        },\n      });\n      modal.overlay.addEventListener('remove', () => resolve(false));\n    });\n  }\n\n  function badgeCell(status) { return badge(status); }\n\n  function cellUser(name, sub) {\n    return `<div class=\"cell-user\"><span class=\"avatar-sm\">${esc(initials(name))}</span><span><strong>${esc(name)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</span></div>`;\n  }\n\n  function table(container, options) {\n    const state = {\n      rows: options.rows || [],\n      page: 1,\n      pageSize: options.pageSize || 10,\n      search: '',\n      sortKey: options.defaultSort || null,\n      sortDir: options.defaultSortDir || 'desc',\n    };\n    const searchKeys = options.searchKeys || [];\n    const columns = options.columns || [];\n    const rowKey = options.rowKey || ((row, index) => row.id || index);\n\n    function filteredRows() {\n      let rows = [...state.rows];\n      if (state.search && searchKeys.length) {\n        const term = state.search.toLowerCase();\n        rows = rows.filter((row) => searchKeys.some((key) => String(row[key] === undefined ? '' : row[key]).toLowerCase().includes(term)));\n      }\n      if (state.sortKey) {\n        const key = state.sortKey;\n        const dir = state.sortDir === 'asc' ? 1 : -1;\n        rows.sort((a, b) => {\n          const av = a[key]; const bv = b[key];\n          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;\n          return String(av === undefined ? '' : av).localeCompare(String(bv === undefined ? '' : bv), 'id') * dir;\n        });\n      }\n      return rows;\n    }\n\n    function pageRows(rows) {\n      const start = (state.page - 1) * state.pageSize;\n      return rows.slice(start, start + state.pageSize);\n    }\n\n    function render() {\n      const rows = filteredRows();\n      const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));\n      if (state.page > totalPages) state.page = totalPages;\n      const current = pageRows(rows);\n      const start = rows.length ? (state.page - 1) * state.pageSize + 1 : 0;\n      const end = Math.min(state.page * state.pageSize, rows.length);\n      const head = columns.map((col) => {\n        const sortable = col.sortable !== false && col.key;\n        const active = state.sortKey === col.key;\n        return `<th class=\"${sortable ? 'sortable' : ''} ${col.className || ''}\" ${sortable ? `data-sort=\"${esc(col.key)}\"` : ''}>${esc(col.label)}${active ? `<span class=\"sort-arrow\">${state.sortDir === 'asc' ? '▲' : '▼'}</span>` : ''}</th>`;\n      }).join('');\n      const body = current.length ? current.map((row, index) => {\n        const id = rowKey(row, index);\n        const cells = columns.map((col) => `<td class=\"${col.className || ''}\">${col.render ? col.render(row) : esc(row[col.key])}</td>`).join('');\n        return `<tr data-row-id=\"${esc(id)}\">${cells}</tr>`;\n      }).join('') : `<tr><td colspan=\"${columns.length}\">${emptyState(options.emptyTitle || 'Belum ada data', options.emptyText || 'Data akan tampil di sini setelah ditambahkan.')}</td></tr>`;\n\n      const pageButtons = [];\n      const from = Math.max(1, state.page - 2);\n      const to = Math.min(totalPages, from + 4);\n      for (let i = from; i <= to; i += 1) pageButtons.push(`<button type=\"button\" class=\"${i === state.page ? 'active' : ''}\" data-page=\"${i}\">${i}</button>`);\n\n      container.innerHTML = `<div class=\"card\">\n        <div class=\"table-toolbar\">\n          <div class=\"search-box\"><svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\"><circle cx=\"11\" cy=\"11\" r=\"7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M20 20l-3.5-3.5\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg><input type=\"search\" placeholder=\"${esc(options.searchPlaceholder || 'Cari data...')}\" value=\"${esc(state.search)}\" data-search></div>\n          <div class=\"flex flex-wrap\">${options.toolbar || ''}${options.exportName !== false ? `<button class=\"btn btn-sm\" type=\"button\" data-export>Ekspor CSV</button>` : ''}</div>\n        </div>\n        <div class=\"table-wrap\"><table class=\"data\"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n        <div class=\"table-foot\"><span class=\"small muted\">Menampilkan ${start}-${end} dari ${rows.length} data</span><div class=\"pagination\"><button type=\"button\" data-page=\"${state.page - 1}\" ${state.page <= 1 ? 'disabled' : ''}>Sebelumnya</button>${pageButtons.join('')}<button type=\"button\" data-page=\"${state.page + 1}\" ${state.page >= totalPages ? 'disabled' : ''}>Berikutnya</button></div></div>\n      </div>`;\n\n      const search = container.querySelector('[data-search]');\n      if (search) {\n        search.addEventListener('input', (event) => {\n          state.search = event.target.value;\n          state.page = 1;\n          render();\n          const newSearch = container.querySelector('[data-search]');\n          if (newSearch) { newSearch.focus(); newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length); }\n        });\n      }\n      container.querySelectorAll('[data-sort]').forEach((th) => {\n        th.addEventListener('click', () => {\n          const key = th.dataset.sort;\n          if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';\n          else { state.sortKey = key; state.sortDir = 'asc'; }\n          render();\n        });\n      });\n      container.querySelectorAll('.pagination [data-page]').forEach((btn) => {\n        btn.addEventListener('click', () => {\n          const page = Number(btn.dataset.page);\n          if (page >= 1 && page <= totalPages) { state.page = page; render(); }\n        });\n      });\n      const exportBtn = container.querySelector('[data-export]');\n      if (exportBtn) exportBtn.addEventListener('click', () => exportCSV(options.exportName || 'data', columns, filteredRows()));\n      container.querySelectorAll('tbody tr[data-row-id]').forEach((tr) => {\n        if (options.onRow) {\n          tr.style.cursor = 'pointer';\n          tr.addEventListener('click', (event) => {\n            if (event.target.closest('button, a')) return;\n            const row = current.find((r, i) => String(rowKey(r, i)) === tr.dataset.rowId);\n            if (row) options.onRow(row);\n          });\n        }\n      });\n      if (options.onAction) {\n        container.querySelectorAll('tbody [data-act]').forEach((btn) => {\n          btn.addEventListener('click', (event) => {\n            event.stopPropagation();\n            const tr = btn.closest('tr[data-row-id]');\n            const row = current.find((r, i) => String(rowKey(r, i)) === (tr ? tr.dataset.rowId : ''));\n            if (row) options.onAction(btn.dataset.act, row, btn);\n          });\n        });\n      }\n    }\n\n    render();\n    return {\n      refresh(rows) { state.rows = rows || state.rows; render(); },\n      getState: () => state,\n      setRows(rows) { state.rows = rows; state.page = 1; render(); },\n    };\n  }\n\n  function exportCSV(name, columns, rows) {\n    const usable = columns.filter((c) => c.export !== false && c.key !== 'actions');\n    const lines = [usable.map((c) => `\"${String(c.label).replace(/\"/g, '\"\"')}\"`).join(',')];\n    rows.forEach((row) => {\n      lines.push(usable.map((c) => {\n        const value = c.exportValue ? c.exportValue(row) : row[c.key];\n        return `\"${String(value === undefined || value === null ? '' : value).replace(/\"/g, '\"\"')}\"`;\n      }).join(','));\n    });\n    csvDownload(name, lines.join('\\r\\n'));\n  }\n\n  function csvDownload(name, content) {\n    const blob = new Blob([`\\ufeff${content}`], { type: 'text/csv;charset=utf-8;' });\n    const link = document.createElement('a');\n    link.href = URL.createObjectURL(blob);\n    link.download = `${name}-${todayISO()}.csv`;\n    document.body.appendChild(link);\n    link.click();\n    link.remove();\n    URL.revokeObjectURL(link.href);\n    toast('File CSV berhasil diunduh.', 'success', 'Ekspor selesai');\n  }\n\n  function printDocument(title, bodyHTML) {\n    const win = window.open('', '_blank', 'width=900,height=700');\n    if (!win) { toast('Popup diblokir. Izinkan popup untuk mencetak.', 'error'); return; }\n    win.document.write(`<!doctype html><html lang=\"id\"><head><meta charset=\"utf-8\"><title>${esc(title)}</title><style>\n      *{box-sizing:border-box}body{font-family:\"Segoe UI\",Arial,sans-serif;color:#111;margin:32px;font-size:13px;line-height:1.5}\n      h1{font-size:20px;margin:0 0 3px}h2{font-size:15px;margin:20px 0 8px}h3{font-size:13px;margin:0}\n      table{width:100%;border-collapse:collapse;margin-top:10px}th,td{padding:7px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:12px;vertical-align:top}\n      th{background:#f4f4f4;text-transform:uppercase;letter-spacing:.05em;font-size:10px}\n      .doc-head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px}\n      .doc-meta{text-align:right;font-size:12px}.doc-foot{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#555}\n      .numeric{text-align:right}.badge{padding:2px 7px;border:1px solid #ddd;border-radius:9px;font-size:10px}.muted{color:#666}\n      .summary{display:flex;gap:24px;margin-top:12px}.summary div{flex:1}.summary span{display:block;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:.05em}.summary strong{font-size:16px}\n      @media print{body{margin:16px}.no-print{display:none}}\n    </style></head><body>${bodyHTML}<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\\/script></body></html>`);\n    win.document.close();\n  }\n\n  function docHeader(property, docTitle, metaRows) {\n    return `<div class=\"doc-head\"><div><h1>${esc(property.name)}</h1><div class=\"muted\">${esc(property.address)}<br>${esc(property.phone)}</div></div><div class=\"doc-meta\"><h2>${esc(docTitle)}</h2>${metaRows.map(([k, v]) => `<div>${esc(k)}: <strong>${esc(v)}</strong></div>`).join('')}</div></div>`;\n  }\n\n\n  function receiptHTML(payment, allocations, property) {\n    return `${docHeader(property, 'Kuitansi Pembayaran', [['No. Kuitansi', payment.ReceiptNumber], ['Tanggal', date(payment.PaymentDate)]])}\n      <div class=\"summary\"><div><span>Diterima dari</span><strong>${esc(payment.TenantName || payment.TenantID)}</strong></div><div><span>Metode</span><strong>${esc(payment.PaymentMethod)}</strong></div><div><span>Status</span><strong>${esc(payment.PaymentStatus)}</strong></div></div>\n      <h3 style=\"margin-top:20px\">Rincian</h3>\n      <table><thead><tr><th>Referensi</th><th>Tanggal</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>\n        ${allocations && allocations.length ? allocations.map((a) => `<tr><td>${esc(a.InvoiceNumber || a.InvoiceID)}</td><td>${date(payment.PaymentDate)}</td><td class=\"numeric\">${currency(a.AllocatedAmount)}</td></tr>`).join('') : `<tr><td>${esc(payment.Notes || 'Pembayaran layanan')}</td><td>${date(payment.PaymentDate)}</td><td class=\"numeric\">${currency(payment.AmountReceived)}</td></tr>`}\n      </tbody></table>\n      <div class=\"summary\"><div><span>Total diterima</span><strong>${currency(payment.AmountReceived)}</strong></div></div>\n      ${payment.ReferenceNumber ? `<p class=\"muted\">Referensi: ${esc(payment.ReferenceNumber)}</p>` : ''}\n      <div class=\"doc-foot\">Kuitansi ini dibuat secara elektronik oleh ${esc(property.name)}. ${esc(property.address)} &middot; ${esc(property.phone)}</div>`;\n  }\n\n  function showReceipt(payment, allocations = []) {\n    const property = (window.App && App.property) || { name: 'Kos', address: '', phone: '' };\n    openModal({\n      title: `Kuitansi ${payment.ReceiptNumber}`,\n      subtitle: `${payment.TenantName || payment.TenantID} &middot; ${currency(payment.AmountReceived)}`,\n      size: 'lg',\n      body: `<div class=\"print-doc\">${receiptHTML(payment, allocations, property)}</div>`,\n      footer: `<button class=\"btn\" type=\"button\" data-print>Cetak kuitansi</button><button class=\"btn btn-primary\" type=\"button\" data-close>Tutup</button>`,\n      onMount: (overlay, close) => {\n        overlay.querySelector('[data-close]').addEventListener('click', close);\n        overlay.querySelector('[data-print]').addEventListener('click', () => printDocument(`Kuitansi ${payment.ReceiptNumber}`, receiptHTML(payment, allocations, property)));\n      },\n    });\n  }\n\n  function formValues(form) {\n    const values = Object.fromEntries(new FormData(form).entries());\n    form.querySelectorAll('input[type=\"checkbox\"]').forEach((cb) => { values[cb.name] = cb.checked; });\n    return values;\n  }\n\n  function qs(name) {\n    return new URLSearchParams(window.location.search).get(name);\n  }\n\n  function debounce(fn, wait = 250) {\n    let timer;\n    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };\n  }\n\n  function uuid() {\n    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();\n    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;\n  }\n\n  return {\n    MONTHS, MONTHS_LONG, esc, currency, compactCurrency, num, date, dateTime, monthLabel,\n    todayISO, monthStartISO, monthEndISO, initials, badge, directionBadge, toast, loading,\n    emptyState, pageError, openModal, formModal, confirmDialog, cellUser, table, exportCSV,\n    csvDownload, printDocument, docHeader, receiptHTML, showReceipt, formValues, qs, debounce, uuid,\n  };\n})();\n\n</script>\n  <script>\n'use strict';\n\nwindow.App = {\n  user: null,\n  meta: {},\n  storage: 'Buku besar operasional',\n  storageState: 'checking',\n  statusTimer: null,\n  statusInFlight: false,\n  statusHandlers: null,\n  property: { name: 'Kelola Kos', address: '', phone: '', currency: 'IDR' },\n  pages: {},\n  currentRoute: '',\n\n  registerPage(name, renderer) {\n    this.pages[name] = renderer;\n  },\n\n  can(module, action = 'read') {\n    if (!this.user) return false;\n    const permissions = this.user.Permissions || {};\n    if (permissions['*'] && permissions['*'].includes('*')) return true;\n    const actions = permissions[module];\n    return Array.isArray(actions) && (actions.includes('*') || actions.includes(action));\n  },\n\n  applyBranding() {\n    const name = this.property.name || 'Kelola Kos';\n    const nameEl = document.getElementById('property-name');\n    if (nameEl) nameEl.textContent = name;\n    const loginName = document.getElementById('login-property-name');\n    if (loginName) loginName.textContent = name;\n    const storageEl = document.getElementById('storage-backend');\n    if (storageEl) storageEl.textContent = this.storage || 'Buku besar operasional';\n  },\n\n  applyMeta(meta) {\n    this.meta = meta || {};\n    if (this.meta.user) this.user = this.meta.user;\n    if (this.meta.storage) this.storage = this.meta.storage;\n    this.property = this.meta.property || this.property;\n    this.applyBranding();\n    if (this.user) this.startStatusMonitor();\n    return this.meta;\n  },\n\n  setStorageState(state) {\n    this.storageState = state;\n    const backend = this.storage || 'Buku besar operasional';\n    const label = state === 'ok'\n      ? `Terhubung ke ${backend}`\n      : state === 'warning'\n        ? `Koneksi ke ${backend} bermasalah`\n        : state === 'error'\n          ? `Tidak terhubung ke ${backend}`\n          : `Memeriksa koneksi ke ${backend}`;\n    const dot = document.getElementById('storage-dot');\n    if (dot) {\n      dot.className = `dot is-${state}`;\n      dot.title = label;\n      dot.setAttribute('aria-label', `Status koneksi: ${label}`);\n    }\n    const storageEl = document.getElementById('storage-backend');\n    if (storageEl) storageEl.title = label;\n  },\n\n  checkStorageStatus() {\n    if (this.statusInFlight) return;\n    if (navigator.onLine === false) {\n      this.setStorageState('error');\n      return;\n    }\n    this.statusInFlight = true;\n    this.setStorageState('checking');\n    let timeoutId = null;\n    const timeout = new Promise((_, reject) => {\n      timeoutId = setTimeout(() => reject(new Error('timeout')), 20000);\n    });\n    Promise.race([API.health(), timeout]).then((data) => {\n      if (navigator.onLine === false) {\n        this.setStorageState('error');\n        return;\n      }\n      if (data && data.storage) {\n        this.storage = data.storage;\n        this.applyBranding();\n      }\n      const ready = data && data.status === 'ok' && data.configured !== false;\n      this.setStorageState(ready ? 'ok' : 'warning');\n    }).catch(() => {\n      this.setStorageState('error');\n    }).finally(() => {\n      if (timeoutId) clearTimeout(timeoutId);\n      this.statusInFlight = false;\n    });\n  },\n\n  startStatusMonitor() {\n    if (this.statusTimer) return;\n    if (!this.statusHandlers) {\n      this.statusHandlers = {\n        visibility: () => { if (!document.hidden) this.checkStorageStatus(); },\n        online: () => this.checkStorageStatus(),\n        offline: () => this.setStorageState('error'),\n      };\n      document.addEventListener('visibilitychange', this.statusHandlers.visibility);\n      window.addEventListener('online', this.statusHandlers.online);\n      window.addEventListener('offline', this.statusHandlers.offline);\n    }\n    this.checkStorageStatus();\n    this.statusTimer = setInterval(() => {\n      if (!document.hidden) this.checkStorageStatus();\n    }, 120000);\n  },\n\n  stopStatusMonitor() {\n    if (this.statusTimer) {\n      clearInterval(this.statusTimer);\n      this.statusTimer = null;\n    }\n    if (this.statusHandlers) {\n      document.removeEventListener('visibilitychange', this.statusHandlers.visibility);\n      window.removeEventListener('online', this.statusHandlers.online);\n      window.removeEventListener('offline', this.statusHandlers.offline);\n      this.statusHandlers = null;\n    }\n  },\n\n  async loadPublicBranding() {\n    try {\n      const data = await API.get('/public-config');\n      if (data && data.property) {\n        this.property = Object.assign({}, this.property, data.property);\n        this.applyBranding();\n      }\n    } catch (error) {\n      // Keep the neutral fallback when the public branding endpoint is unavailable.\n    }\n  },\n\n  async refreshMeta() {\n    return this.applyMeta(await API.get('/bootstrap'));\n  },\n\n  navigate(hash) {\n    if (window.location.hash === hash) {\n      window.dispatchEvent(new HashChangeEvent('hashchange'));\n    } else {\n      window.location.hash = hash;\n    }\n  },\n};\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('dashboard', async (container, route) => {\n  const state = {\n    preset: 'month',\n    from: UI.monthStartISO(),\n    to: UI.monthEndISO(),\n  };\n\n  function presetRange(preset) {\n    if (preset === 'today') return { from: UI.todayISO(), to: UI.todayISO() };\n    if (preset === 'last') return { from: UI.monthStartISO(-1), to: UI.monthEndISO(-1) };\n    return { from: UI.monthStartISO(), to: UI.monthEndISO() };\n  }\n\n  async function load() {\n    UI.loading(container, 'Menyiapkan ringkasan operasional...');\n    try {\n      let data;\n      let revenue;\n      let activities;\n      try {\n        const page = await API.get('/dashboard-page', { from: state.from, to: state.to });\n        data = page.dashboard;\n        revenue = page.revenue || [];\n        activities = page.activities || [];\n      } catch (error) {\n        if (error.status !== 404) throw error;\n        [data, revenue, activities] = await Promise.all([\n          API.get('/dashboard', { from: state.from, to: state.to }),\n          App.can('reports', 'read') ? API.get('/reports/revenue') : Promise.resolve([]),\n          App.can('activities', 'read') ? API.get('/activities', { status: 'Pending' }) : Promise.resolve([]),\n        ]);\n      }\n      render(data, revenue, activities);\n    } catch (error) {\n      UI.pageError(container, error, load);\n    }\n  }\n\n  function greeting() {\n    const hour = new Date().getHours();\n    if (hour < 11) return 'Selamat pagi';\n    if (hour < 15) return 'Selamat siang';\n    if (hour < 19) return 'Selamat sore';\n    return 'Selamat malam';\n  }\n\n  function statCard(label, value, foot, icon, tone = '') {\n    return `<div class=\"stat-card ${tone}\"><div class=\"stat-icon\">${icon}</div><div class=\"stat-label\">${UI.esc(label)}</div><div class=\"stat-value\">${value}</div><div class=\"stat-foot\">${foot || ''}</div></div>`;\n  }\n\n  const icons = {\n    room: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path d=\"M4 20V6l8-3 8 3v14M4 20h16M9 20v-5h6v5M8 9h.01M16 9h.01\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    people: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><circle cx=\"9\" cy=\"8\" r=\"3.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M3.5 20c.4-3.4 2.7-5.4 5.5-5.4s5.1 2 5.5 5.4M16 5.5a3 3 0 010 5.6M17 14.6c2.2.5 3.6 2.3 3.9 5.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n    money: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M6 9v6M18 9v6\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n    invoice: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path d=\"M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    expense: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path d=\"M4 18l5-6 4 3 7-9M16 6h4v4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    cash: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path d=\"M4 7h16v10H4zM7 12h.01M17 12h.01M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n    warning: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path d=\"M12 4l9 16H3zM12 9v5M12 17h.01\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    task: '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path d=\"M5 5h14v15H5zM8 3v4M16 3v4M8 12l2 2 5-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n  };\n\n  function render(data, revenue, activities) {\n    const r = data.rooms;\n    const t = data.tenants;\n    const f = data.financial;\n    const statusSegments = [\n      { key: 'Occupied', color: '#0f766e', label: 'Terisi' },\n      { key: 'Reserved', color: '#6941c6', label: 'Reservasi' },\n      { key: 'Available', color: '#9fd8ce', label: 'Tersedia' },\n      { key: 'Maintenance', color: '#d7a84b', label: 'Perbaikan' },\n      { key: 'Inactive', color: '#c9d4d1', label: 'Nonaktif' },\n    ];\n    const bar = statusSegments.map((segment) => {\n      const width = r.total ? (r[segment.key] / r.total) * 100 : 0;\n      return `<span style=\"width:${width}%;background:${segment.color}\" title=\"${segment.label}: ${r[segment.key]}\"></span>`;\n    }).join('');\n    const today = UI.todayISO();\n    const preset = state.preset;\n    const roomTiles = (App.meta.rooms || []).slice(0, 12).map((room) => `<div class=\"room-tile\"><div class=\"room-no\">${UI.esc(room.RoomNumber)}${UI.badge(room.AvailabilityStatus)}</div><small>${UI.esc(room.RoomTypeName)} &middot; ${UI.esc(room.OccupantNames || 'Kosong')}</small></div>`).join('');\n\n    const financeRow = f ? `\n      <div class=\"grid grid-4 mt-16\">\n        ${statCard('Invoice diterbitkan', UI.currency(f.invoicedThisMonth), `${f.invoiceCount} invoice dalam periode`, icons.invoice, 'blue')}\n        ${statCard('Penerimaan kas', UI.currency(f.collectionsThisMonth), `${f.paymentCount} pembayaran dikonfirmasi`, icons.cash, '')}\n        ${statCard('Pengeluaran operasional', UI.currency(f.expensesPaid), 'Pengeluaran berstatus dibayar', icons.expense, 'amber')}\n        ${statCard('Arus kas operasional', UI.currency(f.netCashFlow), `Masuk ${UI.currency(f.inflow)} &middot; keluar ${UI.currency(f.outflow)}`, icons.money, f.netCashFlow < 0 ? 'red' : '')}\n      </div>` : '';\n\n    const revenueBars = revenue.length ? (() => {\n      const max = Math.max(...revenue.map((m) => Math.max(m.invoiced, m.collected, m.expenses)), 1);\n      return revenue.map((m) => `<div class=\"bar-group\"><div class=\"bars\">\n        <span class=\"bar\" style=\"height:${(m.invoiced / max) * 100}%\" title=\"Invoice ${UI.currency(m.invoiced)}\"></span>\n        <span class=\"bar\" style=\"height:${(m.collected / max) * 100}%;background:#5ba89b\" title=\"Penerimaan ${UI.currency(m.collected)}\"></span>\n        <span class=\"bar expense\" style=\"height:${(m.expenses / max) * 100}%\" title=\"Pengeluaran ${UI.currency(m.expenses)}\"></span>\n      </div><div class=\"bar-label\">${UI.MONTHS[Number(m.month.slice(5, 7)) - 1]}</div></div>`).join('');\n    })() : '';\n\n    const recent = (data.recentInvoices || []).length ? data.recentInvoices.map((inv) => `<tr><td class=\"strong\">${UI.esc(inv.InvoiceNumber)}<span class=\"sub\">${UI.esc(inv.TenantName)} &middot; ${UI.esc(inv.RoomNumber)}</span></td><td>${UI.date(inv.PeriodStart)}</td><td class=\"numeric\">${UI.currency(inv.TotalAmount)}</td><td class=\"numeric\">${UI.currency(inv.OutstandingBalance)}</td><td>${UI.badge(inv.InvoiceStatus)}</td></tr>`).join('') : `<tr><td colspan=\"5\">${UI.emptyState('Belum ada invoice', 'Invoice bulanan akan tampil di sini.')}</td></tr>`;\n\n    const overdue = (data.overdueInvoices || []).length ? data.overdueInvoices.map((inv) => `<a class=\"quick-item\" href=\"#/invoices\">\n      <span class=\"quick-icon\" style=\"background:#fdeceb;color:#b42318\">${icons.warning}</span>\n      <span style=\"min-width:0\"><strong>${UI.esc(inv.TenantName)} &middot; ${UI.esc(inv.RoomNumber)}</strong><small>${UI.esc(inv.InvoiceNumber)} &middot; jatuh tempo ${UI.date(inv.DueDate)}</small></span>\n      <span class=\"numeric\" style=\"margin-left:auto;color:#b42318;font-weight:700\">${UI.currency(inv.OutstandingBalance)}</span>\n    </a>`).join('') : `<div class=\"notice ok\">Tidak ada invoice jatuh tempo. Piutang berjalan ${UI.currency(f ? f.outstandingReceivables : 0)}.</div>`;\n\n    const taskList = activities.slice(0, 5).map((task) => `<a class=\"quick-item\" href=\"#/activities\"><span class=\"quick-icon\">${icons.task}</span><span style=\"min-width:0\"><strong>${UI.esc(task.Description)}</strong><small>${UI.esc(task.RoomNumber || 'Tanpa kamar')} &middot; ${UI.esc(task.StaffName)} &middot; ${UI.date(task.DueDate)}</small></span><span style=\"margin-left:auto\">${UI.badge(task.Status)}</span></a>`).join('') || `<div class=\"notice\">Tidak ada tugas tertunda.</div>`;\n\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>${greeting()}, ${UI.esc(App.user.FullName.split(' ')[0])}</h1><p>Ringkasan operasional ${UI.esc(data.propertyName)} untuk periode ${UI.date(state.from)} s.d. ${UI.date(state.to)}.</p></div>\n        <div class=\"page-actions\">\n          ${App.can('payments', 'write') ? '<a class=\"btn btn-primary\" href=\"#/payments\">Catat pembayaran</a>' : ''}\n          ${App.can('agreements', 'write') ? '<a class=\"btn\" href=\"#/agreements\">Check-in penghuni</a>' : ''}\n          ${App.can('invoices', 'generate') ? '<button class=\"btn\" type=\"button\" id=\"dash-generate\">Jalankan tagihan</button>' : ''}\n        </div>\n      </div>\n\n      <div class=\"dashboard-hero\">\n        <div><h2>${UI.esc(data.propertyName)}</h2><p>${r.Occupied} dari ${r.total - r.Inactive} kamar aktif terisi. ${r.Available} kamar siap disewakan, ${r.Reserved} dalam reservasi, ${r.Maintenance} dalam perbaikan.</p></div>\n        <div class=\"hero-actions\">\n          <a class=\"btn btn-primary\" href=\"#/rooms\">Lihat kamar</a>\n          <a class=\"btn\" href=\"#/reports\">Buka laporan</a>\n        </div>\n      </div>\n\n      <div class=\"grid grid-4 mt-16\">\n        ${statCard('Tingkat hunian', `${r.occupancyRate}%`, `${r.Occupied} kamar terisi`, icons.room, '')}\n        ${statCard('Total kamar', r.total, `${r.Available} tersedia &middot; ${r.Inactive} nonaktif`, icons.room, 'blue')}\n        ${statCard('Penghuni aktif', t.active, `${t.upcomingCheckIns} check-in &middot; ${t.upcomingCheckOuts} check-out mendatang`, icons.people, 'purple')}\n        ${f\n          ? statCard('Piutang penghuni', UI.currency(f.outstandingReceivables), `${f.overdueCount} invoice jatuh tempo &middot; ${UI.currency(f.overdueTotal)}`, icons.invoice, f.overdueCount ? 'red' : '')\n          : statCard('Tugas tertunda', t.pendingActivities, 'Aktivitas operasional belum selesai', icons.task, 'amber')}\n      </div>\n      ${financeRow}\n\n      <div class=\"grid grid-2 mt-16\" style=\"grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)\">\n        <div class=\"card\">\n          <div class=\"card-head\"><div><h3>Komposisi status kamar</h3><p>Dihitung dari hunian dan reservasi aktif</p></div><span class=\"badge teal\">${r.occupancyRate}% terisi</span></div>\n          <div class=\"card-body\">\n            <div class=\"occupancy-bar\">${bar}</div>\n            <div class=\"legend\">${statusSegments.map((s) => `<span><i style=\"background:${s.color}\"></i>${s.label} <strong>${r[s.key]}</strong></span>`).join('')}</div>\n            <div class=\"room-grid mt-24\">${roomTiles || UI.emptyState('Belum ada kamar', 'Tambahkan kamar pada menu Kamar.')}</div>\n            <div class=\"mt-16\"><a class=\"btn btn-sm\" href=\"#/rooms\">Kelola seluruh kamar</a></div>\n          </div>\n        </div>\n        <div class=\"stack\">\n          ${f ? `<div class=\"card\"><div class=\"card-head\"><div><h3>Arus kas 6 bulan</h3><p>Invoice, penerimaan, dan pengeluaran</p></div></div>\n            <div class=\"card-body\">\n              <div class=\"bar-chart\">${revenueBars || UI.emptyState('Belum ada data', '')}</div>\n              <div class=\"chart-legend\"><span><i style=\"background:#0f766e\"></i>Invoice</span><span><i style=\"background:#5ba89b\"></i>Penerimaan</span><span><i style=\"background:#d7a84b\"></i>Pengeluaran</span></div>\n              <div class=\"detail-list mt-24\">\n                <div class=\"detail-row\"><dt>Koleksi sewa</dt><dd>${UI.currency(f.rentalCollections)}</dd></div>\n                <div class=\"detail-row\"><dt>Koleksi layanan</dt><dd>${UI.currency(f.serviceCollections)}</dd></div>\n                <div class=\"detail-row\"><dt>Kewajiban deposit</dt><dd>${UI.currency(f.depositLiabilities)}</dd></div>\n              </div>\n            </div></div>` : ''}\n          <div class=\"card\">\n            <div class=\"card-head\"><div><h3>Tugas operasional</h3><p>${t.pendingActivities} aktivitas belum selesai</p></div><a class=\"btn btn-sm\" href=\"#/activities\">Semua tugas</a></div>\n            <div class=\"card-body\"><div class=\"quick-list\">${taskList}</div></div>\n          </div>\n        </div>\n      </div>\n\n      ${f ? `<div class=\"grid grid-2 mt-16\" style=\"grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)\">\n        <div class=\"card\">\n          <div class=\"card-head\"><div><h3>Invoice terbaru</h3><p>Penerbitan tagihan terakhir</p></div><a class=\"btn btn-sm\" href=\"#/invoices\">Lihat semua</a></div>\n          <div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Invoice</th><th>Periode</th><th class=\"numeric\">Total</th><th class=\"numeric\">Sisa</th><th>Status</th></tr></thead><tbody>${recent}</tbody></table></div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-head\"><div><h3>Perlu perhatian</h3><p>Invoice lewat jatuh tempo</p></div><span class=\"badge ${f.overdueCount ? 'red' : 'green'}\">${f.overdueCount} tagihan</span></div>\n          <div class=\"card-body\"><div class=\"quick-list\">${overdue}</div></div>\n        </div>\n      </div>` : ''}\n\n      <div class=\"card mt-16\">\n        <div class=\"card-head\"><div><h3>Akses cepat</h3><p>Sesuai peran ${UI.esc(App.user.Role)}</p></div></div>\n        <div class=\"card-body\"><div class=\"grid grid-4\">\n          ${App.can('tenants', 'write') ? '<a class=\"quick-item\" href=\"#/tenants\"><span class=\"quick-icon\">' + icons.people + '</span><span><strong>Daftarkan penghuni</strong><small>Data dan identitas</small></span></a>' : ''}\n          ${App.can('reservations', 'write') ? '<a class=\"quick-item\" href=\"#/reservations\"><span class=\"quick-icon\">' + icons.room + '</span><span><strong>Buat reservasi</strong><small>Kunci kamar calon penghuni</small></span></a>' : ''}\n          ${App.can('services', 'write') ? '<a class=\"quick-item\" href=\"#/services\"><span class=\"quick-icon\">' + icons.invoice + '</span><span><strong>Order layanan</strong><small>Laundry, cleaning, parkir</small></span></a>' : ''}\n          ${App.can('expenses', 'write') ? '<a class=\"quick-item\" href=\"#/expenses\"><span class=\"quick-icon\">' + icons.expense + '</span><span><strong>Catat pengeluaran</strong><small>Biaya operasional properti</small></span></a>' : ''}\n          ${App.can('reports', 'read') ? '<a class=\"quick-item\" href=\"#/reports\"><span class=\"quick-icon\">' + icons.money + '</span><span><strong>Laporan keuangan</strong><small>Kas, piutang, rekonsiliasi</small></span></a>' : ''}\n          ${App.can('activities', 'write') ? '<a class=\"quick-item\" href=\"#/activities\"><span class=\"quick-icon\">' + icons.task + '</span><span><strong>Tugas staf</strong><small>Kebersihan dan perawatan</small></span></a>' : ''}\n        </div></div>\n      </div>\n\n      <div class=\"filters mt-24\">\n        <div class=\"chip-select\">\n          <button class=\"chip ${preset === 'today' ? 'active' : ''}\" type=\"button\" data-preset=\"today\">Hari ini</button>\n          <button class=\"chip ${preset === 'month' ? 'active' : ''}\" type=\"button\" data-preset=\"month\">Bulan ini</button>\n          <button class=\"chip ${preset === 'last' ? 'active' : ''}\" type=\"button\" data-preset=\"last\">Bulan lalu</button>\n          <button class=\"chip ${preset === 'custom' ? 'active' : ''}\" type=\"button\" data-preset=\"custom\">Kustom</button>\n        </div>\n        ${preset === 'custom' ? `<div class=\"field\"><span>Dari</span><input type=\"date\" id=\"dash-from\" value=\"${state.from}\"></div><div class=\"field\"><span>Sampai</span><input type=\"date\" id=\"dash-to\" value=\"${state.to}\"></div><button class=\"btn btn-primary btn-sm\" type=\"button\" id=\"dash-apply\">Terapkan</button>` : ''}\n      </div>\n    `;\n\n    container.querySelectorAll('[data-preset]').forEach((button) => {\n      button.addEventListener('click', () => {\n        state.preset = button.dataset.preset;\n        if (state.preset !== 'custom') {\n          const range = presetRange(state.preset);\n          state.from = range.from;\n          state.to = range.to;\n          load();\n        } else {\n          render(data, revenue, activities);\n        }\n      });\n    });\n    const apply = container.querySelector('#dash-apply');\n    if (apply) apply.addEventListener('click', () => {\n      const from = container.querySelector('#dash-from').value;\n      const to = container.querySelector('#dash-to').value;\n      if (!from || !to || from > to) { UI.toast('Rentang tanggal tidak valid.', 'error'); return; }\n      state.from = from; state.to = to; load();\n    });\n    const generate = container.querySelector('#dash-generate');\n    if (generate) generate.addEventListener('click', async () => {\n      const confirmed = await UI.confirmDialog({\n        title: 'Jalankan penagihan bulanan',\n        message: 'Sistem akan membuat invoice untuk setiap perjanjian aktif yang belum memiliki invoice pada periode berjalan. Proses ini idempoten dan aman dijalankan ulang.',\n        confirmText: 'Jalankan sekarang',\n        details: `<div class=\"notice\">Tanggal proses: <strong>${UI.date(today)}</strong></div>`,\n      });\n      if (!confirmed) return;\n      try {\n        const result = await API.post('/invoices/generate', { asOf: today });\n        UI.toast(`${result.count} invoice baru dibuat.`, 'success', 'Penagihan selesai');\n        load();\n      } catch (error) { UI.toast(error.message, 'error'); }\n    });\n  }\n\n  await load();\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('rooms', async (container) => {\n  UI.loading(container);\n  try {\n    const [rooms, roomTypes] = await Promise.all([API.get('/rooms'), App.can('roomTypes', 'read') ? API.get('/room-types') : Promise.resolve([])]);\n    render(rooms, roomTypes);\n  } catch (error) { UI.pageError(container, error, () => App.navigate('#/rooms')); }\n\n  function render(rooms, roomTypes) {\n    const counts = rooms.reduce((acc, room) => { acc[room.AvailabilityStatus] = (acc[room.AvailabilityStatus] || 0) + 1; return acc; }, {});\n    let activeFilter = '';\n    const tableHost = document.createElement('div');\n\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Manajemen Kamar</h1><p>Status kamar dihitung dari hunian aktif dan reservasi, bukan sekadar status manual. Denah dan kapasitas setiap kamar tersaji di sini.</p></div>\n        <div class=\"page-actions\">\n          ${App.can('roomTypes', 'write') ? '<a class=\"btn\" href=\"#/room-types\">Tipe kamar</a>' : ''}\n          ${App.can('rooms', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"add-room\">Tambah kamar</button>' : ''}\n        </div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Total kamar</div><div class=\"stat-value\">${rooms.length}</div><div class=\"stat-foot\">${counts.Inactive || 0} nonaktif</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Tersedia</div><div class=\"stat-value\">${counts.Available || 0}</div><div class=\"stat-foot\">Siap disewakan</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Terisi</div><div class=\"stat-value\">${counts.Occupied || 0}</div><div class=\"stat-foot\">Memiliki hunian aktif</div></div>\n        <div class=\"stat-card amber\"><div class=\"stat-label\">Reservasi / perbaikan</div><div class=\"stat-value\">${(counts.Reserved || 0) + (counts.Maintenance || 0)}</div><div class=\"stat-foot\">${counts.Reserved || 0} reservasi &middot; ${counts.Maintenance || 0} perbaikan</div></div>\n      </div>\n      <div class=\"filters mt-16\" id=\"room-filters\">\n        <div class=\"chip-select\">\n          <button class=\"chip active\" type=\"button\" data-status=\"\">Semua</button>\n          ${['Available', 'Occupied', 'Reserved', 'Maintenance', 'Inactive'].map((status) => `<button class=\"chip\" type=\"button\" data-status=\"${status}\">${status === 'Available' ? 'Tersedia' : status === 'Occupied' ? 'Terisi' : status === 'Reserved' ? 'Reservasi' : status === 'Maintenance' ? 'Perbaikan' : 'Nonaktif'}</button>`).join('')}\n        </div>\n      </div>\n      <div id=\"rooms-table\" class=\"mt-16\"></div>\n    `;\n    container.querySelector('#rooms-table').appendChild(tableHost);\n\n    function buildTable(rows) {\n      UI.table(tableHost, {\n        rows,\n        searchKeys: ['RoomNumber', 'RoomTypeName', 'Building', 'OccupantNames'],\n        searchPlaceholder: 'Cari nomor kamar atau penghuni...',\n        exportName: 'daftar-kamar',\n        emptyTitle: 'Belum ada kamar',\n        emptyText: 'Tambahkan kamar untuk memulai operasional.',\n        rowKey: (row) => row.RoomID,\n        defaultSort: 'RoomNumber',\n        defaultSortDir: 'asc',\n        columns: [\n          { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong><span class=\"sub\">${UI.esc(row.Building || '-')} &middot; lantai ${UI.esc(row.Floor || '-')}</span>` },\n          { key: 'RoomTypeName', label: 'Tipe', render: (row) => `${UI.esc(row.RoomTypeName)}<span class=\"sub\">Kapasitas ${row.ActiveOccupants}/${row.Capacity}</span>` },\n          { key: 'OccupantNames', label: 'Penghuni', render: (row) => row.OccupantNames ? UI.esc(row.OccupantNames) : '<span class=\"muted\">Kosong</span>' },\n          { key: 'StandardMonthlyPrice', label: 'Harga / bulan', className: 'numeric', render: (row) => UI.currency(row.StandardMonthlyPrice) },\n          { key: 'AvailabilityStatus', label: 'Status', render: (row) => UI.badge(row.AvailabilityStatus) },\n          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => App.can('rooms', 'write') ? `<div class=\"btn-group\">\n            <button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>\n            ${row.AvailabilityStatus === 'Maintenance' ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"activate\">Aktifkan</button>' : '<button class=\"btn btn-sm\" type=\"button\" data-act=\"maintenance\">Perbaikan</button>'}\n          </div>` : '' },\n        ],\n        onAction: async (action, row) => {\n          if (action === 'edit') return openRoomForm(row, roomTypes);\n          if (action === 'maintenance') {\n            const confirmed = await UI.confirmDialog({ title: 'Tandai kamar dalam perbaikan', message: `Kamar ${row.RoomNumber} akan ditandai dalam perbaikan. Kamar tidak dapat dipilih untuk check-in sampai status diaktifkan kembali.`, confirmText: 'Tandai perbaikan', danger: true });\n            if (!confirmed) return;\n            try {\n              await API.post('/rooms', { RoomID: row.RoomID, OperationalStatus: 'Maintenance', Notes: row.Notes || 'Ditandai oleh ' + App.user.FullName });\n              UI.toast('Kamar ditandai dalam perbaikan.');\n              App.navigate('#/rooms');\n            } catch (error) { UI.toast(error.message, 'error'); }\n          }\n          if (action === 'activate') {\n            try {\n              await API.post('/rooms', { RoomID: row.RoomID, OperationalStatus: 'Available' });\n              UI.toast('Kamar aktif kembali.');\n              App.navigate('#/rooms');\n            } catch (error) { UI.toast(error.message, 'error'); }\n          }\n        },\n      });\n    }\n\n    let allRooms = rooms;\n    buildTable(allRooms);\n    container.querySelectorAll('[data-status]').forEach((button) => {\n      button.addEventListener('click', () => {\n        container.querySelectorAll('[data-status]').forEach((b) => b.classList.remove('active'));\n        button.classList.add('active');\n        activeFilter = button.dataset.status;\n        buildTable(activeFilter ? allRooms.filter((room) => room.AvailabilityStatus === activeFilter) : allRooms);\n      });\n    });\n\n    const add = container.querySelector('#add-room');\n    if (add) add.addEventListener('click', () => openRoomForm(null, roomTypes));\n  }\n\n  function typeOptions(roomTypes, selected) {\n    return roomTypes.map((type) => `<option value=\"${UI.esc(type.RoomTypeID)}\" data-price=\"${type.DefaultMonthlyPrice}\" data-capacity=\"${type.DefaultCapacity}\" ${type.RoomTypeID === selected ? 'selected' : ''}>${UI.esc(type.TypeName)} - ${UI.currency(type.DefaultMonthlyPrice)}</option>`).join('');\n  }\n\n  function openRoomForm(room, roomTypes) {\n    const isEdit = !!room;\n    UI.formModal({\n      title: isEdit ? `Ubah kamar ${room.RoomNumber}` : 'Tambah kamar baru',\n      subtitle: 'Status hunian dihitung otomatis; status operasional diatur manual.',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Nomor kamar <em>*</em></span><input name=\"RoomNumber\" required value=\"${UI.esc(room ? room.RoomNumber : '')}\" placeholder=\"A-101\"></label>\n        <label class=\"field\"><span>Gedung</span><input name=\"Building\" value=\"${UI.esc(room ? room.Building : '')}\" placeholder=\"A\"></label>\n        <label class=\"field\"><span>Lantai</span><input name=\"Floor\" value=\"${UI.esc(room ? room.Floor : '')}\" placeholder=\"1\"></label>\n        <label class=\"field\"><span>Tipe kamar <em>*</em></span><select name=\"RoomTypeID\" required>${typeOptions(roomTypes, room ? room.RoomTypeID : '')}</select></label>\n        <label class=\"field\"><span>Kapasitas</span><input type=\"number\" min=\"1\" max=\"10\" name=\"Capacity\" value=\"${room ? room.Capacity : 1}\"></label>\n        <label class=\"field\"><span>Harga bulanan (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"StandardMonthlyPrice\" required value=\"${room ? room.StandardMonthlyPrice : ''}\"></label>\n        <label class=\"field full\"><span>Fasilitas</span><textarea name=\"Facilities\" placeholder=\"Kasur, lemari, AC...\">${UI.esc(room ? room.Facilities : '')}</textarea></label>\n        <label class=\"field\"><span>Status operasional</span><select name=\"OperationalStatus\">\n          ${['Available', 'Maintenance', 'Inactive'].map((status) => `<option value=\"${status}\" ${room && room.OperationalStatus === status ? 'selected' : ''}>${status === 'Available' ? 'Aktif / tersedia' : status === 'Maintenance' ? 'Perbaikan' : 'Nonaktif'}</option>`).join('')}\n        </select></label>\n        <label class=\"field\"><span>Catatan</span><input name=\"Notes\" value=\"${UI.esc(room ? room.Notes : '')}\" placeholder=\"Catatan opsional\"></label>\n      </div>`,\n      submitText: isEdit ? 'Simpan perubahan' : 'Tambah kamar',\n      onMount: (overlay) => {\n        const typeSelect = overlay.querySelector('[name=\"RoomTypeID\"]');\n        const capacity = overlay.querySelector('[name=\"Capacity\"]');\n        const price = overlay.querySelector('[name=\"StandardMonthlyPrice\"]');\n        typeSelect.addEventListener('change', () => {\n          const option = typeSelect.selectedOptions[0];\n          if (!option) return;\n          capacity.value = option.dataset.capacity;\n          price.value = option.dataset.price;\n        });\n        if (!isEdit) {\n          const option = typeSelect.selectedOptions[0];\n          if (option) { capacity.value = option.dataset.capacity; price.value = option.dataset.price; }\n        }\n      },\n      onSubmit: async (values) => {\n        if (isEdit) values.RoomID = room.RoomID;\n        await API.post('/rooms', values);\n        UI.toast(isEdit ? 'Data kamar diperbarui.' : 'Kamar baru ditambahkan.');\n        await App.refreshMeta();\n        App.navigate('#/rooms');\n      },\n    });\n  }\n});\n\nApp.registerPage('room-types', async (container) => {\n  UI.loading(container);\n  try {\n    const types = await API.get('/room-types');\n    const tableHost = document.createElement('div');\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Tipe Kamar</h1><p>Template kapasitas, harga dasar, dan fasilitas. Perubahan tipe tidak mengubah invoice atau perjanjian yang sudah terbit.</p></div>\n        <div class=\"page-actions\">${App.can('roomTypes', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"add-type\">Tambah tipe</button>' : ''}</div>\n      </div>\n      <div id=\"types-table\"></div>\n    `;\n    container.querySelector('#types-table').appendChild(tableHost);\n    function build(rows) {\n      UI.table(tableHost, {\n        rows,\n        searchKeys: ['TypeName', 'Description', 'Facilities'],\n        exportName: 'tipe-kamar',\n        rowKey: (row) => row.RoomTypeID,\n        columns: [\n          { key: 'TypeName', label: 'Tipe', render: (row) => `<strong>${UI.esc(row.TypeName)}</strong><span class=\"sub\">${UI.esc(row.Description || '-')}</span>` },\n          { key: 'DefaultCapacity', label: 'Kapasitas', render: (row) => `${row.DefaultCapacity} orang` },\n          { key: 'DefaultMonthlyPrice', label: 'Harga default', className: 'numeric', render: (row) => UI.currency(row.DefaultMonthlyPrice) },\n          { key: 'RoomCount', label: 'Jumlah kamar', className: 'numeric' },\n          { key: 'IsActive', label: 'Status', render: (row) => UI.badge(row.IsActive === 'TRUE' ? 'Active' : 'Inactive') },\n          { key: 'actions', label: '', sortable: false, render: (row) => App.can('roomTypes', 'write') ? `<button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>` : '' },\n        ],\n        onAction: (action, row) => {\n          if (action === 'edit') openForm(row);\n        },\n      });\n    }\n    build(types);\n    const add = container.querySelector('#add-type');\n    if (add) add.addEventListener('click', () => openForm(null));\n\n    function openForm(type) {\n      const isEdit = !!type;\n      UI.formModal({\n        title: isEdit ? `Ubah tipe ${type.TypeName}` : 'Tambah tipe kamar',\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Nama tipe <em>*</em></span><input name=\"TypeName\" required value=\"${UI.esc(type ? type.TypeName : '')}\" placeholder=\"Deluxe\"></label>\n          <label class=\"field\"><span>Kapasitas default</span><input type=\"number\" min=\"1\" max=\"10\" name=\"DefaultCapacity\" value=\"${type ? type.DefaultCapacity : 1}\"></label>\n          <label class=\"field\"><span>Harga bulanan default (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"DefaultMonthlyPrice\" required value=\"${type ? type.DefaultMonthlyPrice : ''}\"></label>\n          <label class=\"field\"><span>Status</span><select name=\"IsActive\"><option value=\"TRUE\" ${!type || type.IsActive === 'TRUE' ? 'selected' : ''}>Aktif</option><option value=\"FALSE\" ${type && type.IsActive === 'FALSE' ? 'selected' : ''}>Nonaktif</option></select></label>\n          <label class=\"field full\"><span>Deskripsi</span><textarea name=\"Description\">${UI.esc(type ? type.Description : '')}</textarea></label>\n          <label class=\"field full\"><span>Fasilitas</span><textarea name=\"Facilities\">${UI.esc(type ? type.Facilities : '')}</textarea></label>\n        </div>`,\n        submitText: isEdit ? 'Simpan perubahan' : 'Tambah tipe',\n        onSubmit: async (values) => {\n          if (isEdit) values.RoomTypeID = type.RoomTypeID;\n          await API.post('/room-types', values);\n          UI.toast(isEdit ? 'Tipe kamar diperbarui.' : 'Tipe kamar ditambahkan.');\n          await App.refreshMeta();\n          App.navigate('#/room-types');\n        },\n      });\n    }\n  } catch (error) { UI.pageError(container, error); }\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('tenants', async (container) => {\n  UI.loading(container);\n  try {\n    const tenants = await API.get('/tenants');\n    const tableHost = document.createElement('div');\n    const counts = {\n      active: tenants.filter((t) => t.TenantStatus === 'Active').length,\n      prospective: tenants.filter((t) => t.TenantStatus === 'Prospective').length,\n      out: tenants.filter((t) => t.TenantStatus === 'Checked Out').length,\n      balance: tenants.reduce((sum, t) => sum + Number(t.ActiveBalance || 0), 0),\n    };\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Manajemen Penghuni</h1><p>Data penghuni aktif, calon penghuni, dan riwayat hunian. Nomor identitas hanya ditampilkan kepada peran yang berwenang.</p></div>\n        <div class=\"page-actions\">${App.can('tenants', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"add-tenant\">Daftarkan penghuni</button>' : ''}</div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Penghuni aktif</div><div class=\"stat-value\">${counts.active}</div><div class=\"stat-foot\">Memiliki perjanjian sewa</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Calon penghuni</div><div class=\"stat-value\">${counts.prospective}</div><div class=\"stat-foot\">Belum check-in</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Sudah check-out</div><div class=\"stat-value\">${counts.out}</div><div class=\"stat-foot\">Riwayat tetap tersimpan</div></div>\n        <div class=\"stat-card ${counts.balance ? 'red' : ''}\"><div class=\"stat-label\">Total saldo penghuni</div><div class=\"stat-value\" style=\"font-size:21px\">${UI.currency(counts.balance)}</div><div class=\"stat-foot\">Piutang aktif</div></div>\n      </div>\n      <div id=\"tenants-table\" class=\"mt-16\"></div>\n    `;\n    container.querySelector('#tenants-table').appendChild(tableHost);\n    build(tenants);\n\n    const add = container.querySelector('#add-tenant');\n    if (add) add.addEventListener('click', () => openForm(null));\n\n    function build(rows) {\n      UI.table(tableHost, {\n        rows,\n        searchKeys: ['FullName', 'Phone', 'Email', 'RoomNumber', 'IdentityNumber'],\n        searchPlaceholder: 'Cari nama, telepon, kamar...',\n        exportName: 'daftar-penghuni',\n        rowKey: (row) => row.TenantID,\n        defaultSort: 'FullName',\n        defaultSortDir: 'asc',\n        columns: [\n          { key: 'FullName', label: 'Penghuni', render: (row) => UI.cellUser(row.FullName, row.Occupation || row.Email) },\n          { key: 'Phone', label: 'Kontak', render: (row) => `${UI.esc(row.Phone)}<span class=\"sub\">${UI.esc(row.Email || '-')}</span>` },\n          { key: 'IdentityNumber', label: 'Identitas', render: (row) => `${UI.esc(row.IdentityType || '-')}<span class=\"sub\">${UI.esc(row.IdentityNumber || '-')}</span>` },\n          { key: 'RoomNumber', label: 'Kamar', render: (row) => row.RoomNumber ? `<strong>${UI.esc(row.RoomNumber)}</strong>` : '<span class=\"muted\">-</span>' },\n          { key: 'ActiveBalance', label: 'Saldo', className: 'numeric', render: (row) => row.ActiveBalance > 0 ? `<span style=\"color:#b42318;font-weight:700\">${UI.currency(row.ActiveBalance)}</span>` : UI.currency(0) },\n          { key: 'TenantStatus', label: 'Status', render: (row) => UI.badge(row.TenantStatus) },\n          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class=\"btn-group\">\n            <button class=\"btn btn-sm\" type=\"button\" data-act=\"detail\">Detail</button>\n            ${App.can('tenants', 'write') ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>' : ''}\n            ${App.can('agreements', 'write') && row.TenantStatus !== 'Active' && row.TenantStatus !== 'Inactive' ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"checkin\">Check-in</button>' : ''}\n          </div>` },\n        ],\n        onAction: async (action, row) => {\n          if (action === 'edit') openForm(row);\n          if (action === 'detail') showDetail(row);\n          if (action === 'checkin') openCheckIn(row);\n        },\n      });\n    }\n\n    async function showDetail(tenant) {\n      const canFinance = App.can('invoices', 'read');\n      let statement = null;\n      if (canFinance) {\n        try { statement = await API.get('/reports/statement', { tenantId: tenant.TenantID }); } catch (error) { statement = null; }\n      }\n      const invoices = statement ? statement.invoices.slice(0, 6) : [];\n      const payments = statement ? statement.payments.slice(0, 6) : [];\n      UI.openModal({\n        title: tenant.FullName,\n        subtitle: `${tenant.TenantStatus} &middot; terdaftar ${UI.date(tenant.RegistrationDate)}`,\n        size: 'lg',\n        body: `<div class=\"grid grid-2\">\n          <div class=\"card\"><div class=\"card-body\">\n            <div class=\"section-title\">Identitas & kontak</div>\n            <div class=\"detail-list\">\n              <div class=\"detail-row\"><dt>Telepon</dt><dd>${UI.esc(tenant.Phone)}</dd></div>\n              <div class=\"detail-row\"><dt>Email</dt><dd>${UI.esc(tenant.Email || '-')}</dd></div>\n              <div class=\"detail-row\"><dt>${UI.esc(tenant.IdentityType || 'Identitas')}</dt><dd>${UI.esc(tenant.IdentityNumber || '-')}</dd></div>\n              <div class=\"detail-row\"><dt>Pekerjaan</dt><dd>${UI.esc(tenant.Occupation || '-')}</dd></div>\n              <div class=\"detail-row\"><dt>Kamar</dt><dd>${UI.esc(tenant.RoomNumber || '-')}</dd></div>\n              <div class=\"detail-row\"><dt>Kontak darurat</dt><dd>${UI.esc(tenant.EmergencyContact || '-')}<br>${UI.esc(tenant.EmergencyPhone || '')}</dd></div>\n              <div class=\"detail-row\"><dt>Alamat</dt><dd>${UI.esc(tenant.Address || '-')}</dd></div>\n            </div>\n          </div></div>\n          <div class=\"card\"><div class=\"card-body\">\n            <div class=\"section-title\">Ringkasan akun</div>\n            ${canFinance && statement ? `\n              <div class=\"money-lg\">${UI.currency(statement.summary.outstanding)}</div>\n              <div class=\"muted small\">Total tagihan belum dibayar</div>\n              <div class=\"detail-list mt-16\">\n                <div class=\"detail-row\"><dt>Total ditagihkan</dt><dd>${UI.currency(statement.summary.totalInvoiced)}</dd></div>\n                <div class=\"detail-row\"><dt>Total dibayar</dt><dd>${UI.currency(statement.summary.totalPaid)}</dd></div>\n                <div class=\"detail-row\"><dt>Kewajiban deposit</dt><dd>${UI.currency(statement.summary.depositLiability)}</dd></div>\n              </div>` : `<div class=\"notice\">Ringkasan keuangan hanya tersedia untuk peran dengan akses invoice.</div>`}\n          </div></div>\n        </div>\n        ${canFinance && invoices.length ? `<div class=\"card mt-16\"><div class=\"card-head\"><h3>Invoice terakhir</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Invoice</th><th>Periode</th><th class=\"numeric\">Total</th><th class=\"numeric\">Sisa</th><th>Status</th></tr></thead><tbody>\n          ${invoices.map((inv) => `<tr><td class=\"strong\">${UI.esc(inv.InvoiceNumber)}</td><td>${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}</td><td class=\"numeric\">${UI.currency(inv.TotalAmount)}</td><td class=\"numeric\">${UI.currency(inv.OutstandingBalance)}</td><td>${UI.badge(inv.InvoiceStatus)}</td></tr>`).join('')}\n        </tbody></table></div></div>` : ''}\n        ${canFinance && payments.length ? `<div class=\"card mt-16\"><div class=\"card-head\"><h3>Pembayaran terakhir</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Kuitansi</th><th>Tanggal</th><th>Metode</th><th class=\"numeric\">Jumlah</th><th>Status</th></tr></thead><tbody>\n          ${payments.map((p) => `<tr><td class=\"strong\">${UI.esc(p.ReceiptNumber)}</td><td>${UI.date(p.PaymentDate)}</td><td>${UI.esc(p.PaymentMethod)}</td><td class=\"numeric\">${UI.currency(p.AmountReceived)}</td><td>${UI.badge(p.PaymentStatus)}</td></tr>`).join('')}\n        </tbody></table></div></div>` : ''}\n        ${tenant.Notes ? `<div class=\"notice mt-16\">${UI.esc(tenant.Notes)}</div>` : ''}`,\n        footer: `<button class=\"btn\" type=\"button\" data-close>Tutup</button>`,\n        onMount: (overlay, close) => overlay.querySelector('[data-close]').addEventListener('click', close),\n      });\n    }\n\n    function openForm(tenant) {\n      const isEdit = !!tenant;\n      UI.formModal({\n        title: isEdit ? `Ubah data ${tenant.FullName}` : 'Daftarkan penghuni',\n        subtitle: 'Simpan hanya informasi pribadi yang diperlukan untuk operasional.',\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Nama lengkap <em>*</em></span><input name=\"FullName\" required value=\"${UI.esc(tenant ? tenant.FullName : '')}\"></label>\n          <label class=\"field\"><span>Nomor telepon <em>*</em></span><input name=\"Phone\" required value=\"${UI.esc(tenant ? tenant.Phone : '')}\" placeholder=\"0812...\"></label>\n          <label class=\"field\"><span>Email</span><input type=\"email\" name=\"Email\" value=\"${UI.esc(tenant ? tenant.Email : '')}\"></label>\n          <label class=\"field\"><span>Pekerjaan</span><input name=\"Occupation\" value=\"${UI.esc(tenant ? tenant.Occupation : '')}\"></label>\n          <label class=\"field\"><span>Jenis identitas</span><select name=\"IdentityType\">${['KTP', 'SIM', 'Paspor', 'Lainnya'].map((type) => `<option ${tenant && tenant.IdentityType === type ? 'selected' : ''}>${type}</option>`).join('')}</select></label>\n          <label class=\"field\"><span>Nomor identitas</span><input name=\"IdentityNumber\" value=\"${UI.esc(tenant ? tenant.IdentityNumber : '')}\"></label>\n          <label class=\"field full\"><span>Alamat asal</span><textarea name=\"Address\">${UI.esc(tenant ? tenant.Address : '')}</textarea></label>\n          <label class=\"field\"><span>Kontak darurat</span><input name=\"EmergencyContact\" value=\"${UI.esc(tenant ? tenant.EmergencyContact : '')}\"></label>\n          <label class=\"field\"><span>Telepon darurat</span><input name=\"EmergencyPhone\" value=\"${UI.esc(tenant ? tenant.EmergencyPhone : '')}\"></label>\n          <label class=\"field\"><span>Status</span><select name=\"TenantStatus\">${['Prospective', 'Active', 'Checked Out', 'Inactive'].map((status) => `<option value=\"${status}\" ${tenant && tenant.TenantStatus === status ? 'selected' : (!tenant && status === 'Prospective' ? 'selected' : '')}>${status === 'Prospective' ? 'Calon penghuni' : status === 'Active' ? 'Aktif' : status === 'Checked Out' ? 'Sudah check-out' : 'Nonaktif'}</option>`).join('')}</select></label>\n          <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\">${UI.esc(tenant ? tenant.Notes : '')}</textarea></label>\n        </div>`,\n        submitText: isEdit ? 'Simpan perubahan' : 'Daftarkan',\n        onSubmit: async (values) => {\n          if (isEdit) values.TenantID = tenant.TenantID;\n          await API.post('/tenants', values);\n          UI.toast(isEdit ? 'Data penghuni diperbarui.' : 'Penghuni baru terdaftar.');\n          await App.refreshMeta();\n          App.navigate('#/tenants');\n        },\n      });\n    }\n\n    async function openCheckIn(tenant) {\n      let rooms;\n      try { rooms = await API.get('/rooms', { status: 'Available' }); } catch (error) { UI.toast(error.message, 'error'); return; }\n      if (!rooms.length) { UI.toast('Belum ada kamar tersedia untuk check-in.', 'error'); return; }\n      UI.formModal({\n        title: `Check-in ${tenant.FullName}`,\n        subtitle: 'Buat perjanjian sewa dan catat deposit awal.',\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Kamar <em>*</em></span><select name=\"RoomID\" required>${rooms.map((room) => `<option value=\"${room.RoomID}\" data-price=\"${room.StandardMonthlyPrice}\">${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)} &middot; ${UI.currency(room.StandardMonthlyPrice)}</option>`).join('')}</select></label>\n          <label class=\"field\"><span>Tanggal check-in <em>*</em></span><input type=\"date\" name=\"CheckInDate\" required value=\"${UI.todayISO()}\"></label>\n          <label class=\"field\"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"AgreedMonthlyPrice\" required value=\"${rooms[0].StandardMonthlyPrice}\"></label>\n          <label class=\"field\"><span>Deposit keamanan (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"DepositAmount\" value=\"0\"></label>\n          <label class=\"field\"><span>Rencana check-out</span><input type=\"date\" name=\"PlannedCheckOut\"></label>\n          <label class=\"field\"><span>Metode deposit</span><select name=\"DepositMethod\"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n          <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\"></textarea></label>\n        </div>\n        <div class=\"notice mt-16\">Invoice periode pertama akan dibuat otomatis setelah check-in berhasil. Sistem menolak check-in jika kamar tidak tersedia atau kapasitas sudah penuh.</div>`,\n        submitText: 'Proses check-in',\n        onMount: (overlay) => {\n          const roomSelect = overlay.querySelector('[name=\"RoomID\"]');\n          const price = overlay.querySelector('[name=\"AgreedMonthlyPrice\"]');\n          roomSelect.addEventListener('change', () => { price.value = roomSelect.selectedOptions[0].dataset.price; });\n        },\n        onSubmit: async (values) => {\n          values.TenantID = tenant.TenantID;\n          const result = await API.post('/check-in', values);\n          UI.toast(`Check-in berhasil. ${result.invoicesCreated || 0} invoice dibuat.`, 'success', 'Hunian aktif');\n          await App.refreshMeta();\n          App.navigate('#/agreements');\n        },\n      });\n    }\n  } catch (error) { UI.pageError(container, error); }\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('reservations', async (container) => {\n  UI.loading(container);\n  try {\n    const [rows, tenants, rooms] = await Promise.all([\n      API.get('/reservations'),\n      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),\n      API.get('/rooms'),\n    ]);\n    const tableHost = document.createElement('div');\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Reservasi Kamar</h1><p>Kunci kamar untuk calon penghuni. Sistem menolak reservasi yang bentrok dengan hunian atau reservasi lain pada periode yang sama.</p></div>\n        <div class=\"page-actions\">${App.can('reservations', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"add-reservation\">Buat reservasi</button>' : ''}</div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Total reservasi</div><div class=\"stat-value\">${rows.length}</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Terkonfirmasi</div><div class=\"stat-value\">${rows.filter((r) => r.ReservationStatus === 'Confirmed').length}</div><div class=\"stat-foot\">Menunggu check-in</div></div>\n        <div class=\"stat-card amber\"><div class=\"stat-label\">Pending</div><div class=\"stat-value\">${rows.filter((r) => r.ReservationStatus === 'Pending').length}</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Dikonversi</div><div class=\"stat-value\">${rows.filter((r) => r.ReservationStatus === 'Converted').length}</div><div class=\"stat-foot\">Menjadi hunian aktif</div></div>\n      </div>\n      <div id=\"reservation-table\" class=\"mt-16\"></div>\n    `;\n    container.querySelector('#reservation-table').appendChild(tableHost);\n    build(rows);\n\n    const add = container.querySelector('#add-reservation');\n    if (add) add.addEventListener('click', openForm);\n\n    function build(data) {\n      UI.table(tableHost, {\n        rows: data,\n        searchKeys: ['TenantName', 'RoomNumber', 'ReservationID', 'Notes'],\n        exportName: 'reservasi',\n        rowKey: (row) => row.ReservationID,\n        defaultSort: 'PlannedCheckIn',\n        defaultSortDir: 'asc',\n        columns: [\n          { key: 'ReservationID', label: 'Reservasi', render: (row) => `<strong>${UI.esc(row.ReservationID)}</strong><span class=\"sub\">${UI.date(row.ReservationDate)}</span>` },\n          { key: 'TenantName', label: 'Calon penghuni', render: (row) => UI.cellUser(row.TenantName, row.TenantPhone) },\n          { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong>` },\n          { key: 'PlannedCheckIn', label: 'Rencana masuk', render: (row) => `${UI.date(row.PlannedCheckIn)}${row.PlannedCheckOut ? `<span class=\"sub\">keluar ${UI.date(row.PlannedCheckOut)}</span>` : ''}` },\n          { key: 'AgreedMonthlyPrice', label: 'Harga', className: 'numeric', render: (row) => UI.currency(row.AgreedMonthlyPrice) },\n          { key: 'DepositAmount', label: 'Deposit', className: 'numeric', render: (row) => UI.currency(row.DepositAmount) },\n          { key: 'ReservationStatus', label: 'Status', render: (row) => UI.badge(row.ReservationStatus) },\n          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => {\n            if (!App.can('reservations', 'write') || ['Converted', 'Cancelled', 'Expired'].includes(row.ReservationStatus)) return '';\n            return `<div class=\"btn-group\">\n              ${row.ReservationStatus === 'Pending' ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"confirm\">Konfirmasi</button>' : ''}\n              ${App.can('agreements', 'write') ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"checkin\">Check-in</button>' : ''}\n              <button class=\"btn btn-sm\" type=\"button\" data-act=\"cancel\">Batal</button>\n            </div>`;\n          } },\n        ],\n        onAction: async (action, row) => {\n          if (action === 'confirm') {\n            try {\n              await API.post(`/reservations/${row.ReservationID}`, { ReservationStatus: 'Confirmed' });\n              UI.toast('Reservasi dikonfirmasi.');\n              App.navigate('#/reservations');\n            } catch (error) { UI.toast(error.message, 'error'); }\n          }\n          if (action === 'cancel') {\n            const confirmed = await UI.confirmDialog({ title: 'Batalkan reservasi', message: `Reservasi ${row.ReservationID} untuk ${row.TenantName} akan dibatalkan. Kamar kembali tersedia untuk periode tersebut.`, confirmText: 'Batalkan reservasi', danger: true });\n            if (!confirmed) return;\n            try {\n              await API.post(`/reservations/${row.ReservationID}`, { ReservationStatus: 'Cancelled' });\n              UI.toast('Reservasi dibatalkan.');\n              App.navigate('#/reservations');\n            } catch (error) { UI.toast(error.message, 'error'); }\n          }\n          if (action === 'checkin') openCheckIn(row);\n        },\n      });\n    }\n\n    function openForm() {\n      const tenantOptions = tenants.filter((t) => t.TenantStatus !== 'Inactive').map((t) => `<option value=\"${t.TenantID}\">${UI.esc(t.FullName)} &middot; ${UI.esc(t.Phone)}</option>`).join('');\n      const roomOptions = rooms.filter((room) => ['Available', 'Reserved'].includes(room.AvailabilityStatus)).map((room) => `<option value=\"${room.RoomID}\" data-price=\"${room.StandardMonthlyPrice}\">${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)}</option>`).join('');\n      UI.formModal({\n        title: 'Buat reservasi kamar',\n        subtitle: 'Reservasi akan memvalidasi bentrok jadwal secara server-side.',\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Calon penghuni <em>*</em></span><select name=\"TenantID\" required>${tenantOptions || '<option value=\"\">Belum ada penghuni</option>'}</select></label>\n          <label class=\"field\"><span>Kamar <em>*</em></span><select name=\"RoomID\" required>${roomOptions || '<option value=\"\">Tidak ada kamar</option>'}</select></label>\n          <label class=\"field\"><span>Rencana check-in <em>*</em></span><input type=\"date\" name=\"PlannedCheckIn\" required value=\"${UI.todayISO()}\"></label>\n          <label class=\"field\"><span>Rencana check-out</span><input type=\"date\" name=\"PlannedCheckOut\"></label>\n          <label class=\"field\"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"AgreedMonthlyPrice\" required value=\"${rooms[0] ? rooms[0].StandardMonthlyPrice : ''}\"></label>\n          <label class=\"field\"><span>Deposit (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"DepositAmount\" value=\"0\"></label>\n          <label class=\"field\"><span>Status awal</span><select name=\"ReservationStatus\"><option value=\"Confirmed\">Terkonfirmasi</option><option value=\"Pending\">Pending</option></select></label>\n          <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\"></textarea></label>\n        </div>\n        <div class=\"notice mt-16\">Reservasi tidak mengurangi pendapatan. Konversi menjadi hunian dilakukan melalui tombol Check-in.</div>`,\n        submitText: 'Simpan reservasi',\n        onMount: (overlay) => {\n          const tenant = overlay.querySelector('[name=\"TenantID\"]');\n          const room = overlay.querySelector('[name=\"RoomID\"]');\n          const price = overlay.querySelector('[name=\"AgreedMonthlyPrice\"]');\n          tenant.innerHTML = tenantOptions || '<option value=\"\">Belum ada penghuni</option>';\n          if (!tenantOptions) { tenant.closest('.field').insertAdjacentHTML('afterend', '<div class=\"notice warn full\">Daftarkan penghuni terlebih dahulu pada menu Penghuni.</div>'); }\n          room.addEventListener('change', () => { const opt = room.selectedOptions[0]; if (opt && opt.dataset.price) price.value = opt.dataset.price; });\n        },\n        onSubmit: async (values) => {\n          await API.post('/reservations', values);\n          UI.toast('Reservasi berhasil dibuat.');\n          App.navigate('#/reservations');\n        },\n      });\n    }\n\n    function openCheckIn(row) {\n      UI.formModal({\n        title: `Check-in ${row.TenantName}`,\n        subtitle: `Dari reservasi ${row.ReservationID} &middot; kamar ${row.RoomNumber}`,\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Tanggal check-in <em>*</em></span><input type=\"date\" name=\"CheckInDate\" required value=\"${row.PlannedCheckIn}\"></label>\n          <label class=\"field\"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"AgreedMonthlyPrice\" required value=\"${row.AgreedMonthlyPrice}\"></label>\n          <label class=\"field\"><span>Deposit keamanan (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"DepositAmount\" value=\"${row.DepositAmount || 0}\"></label>\n          <label class=\"field\"><span>Metode deposit</span><select name=\"DepositMethod\"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n          <label class=\"field\"><span>Rencana check-out</span><input type=\"date\" name=\"PlannedCheckOut\" value=\"${row.PlannedCheckOut || ''}\"></label>\n          <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\">${UI.esc(row.Notes || '')}</textarea></label>\n        </div>`,\n        submitText: 'Konversi & check-in',\n        onSubmit: async (values) => {\n          values.TenantID = row.TenantID;\n          values.RoomID = row.RoomID;\n          values.ReservationID = row.ReservationID;\n          const result = await API.post('/check-in', values);\n          UI.toast(`Check-in berhasil. ${result.invoicesCreated || 0} invoice dibuat.`, 'success', 'Hunian aktif');\n          await App.refreshMeta();\n          App.navigate('#/agreements');\n        },\n      });\n    }\n  } catch (error) { UI.pageError(container, error); }\n});\n\nApp.registerPage('agreements', async (container) => {\n  UI.loading(container);\n  try {\n    const [rows, tenants, rooms] = await Promise.all([\n      API.get('/occupancies'),\n      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),\n      API.get('/rooms'),\n    ]);\n    const tableHost = document.createElement('div');\n    const active = rows.filter((r) => r.AgreementStatus === 'Active');\n    const counts = {\n      active: active.length,\n      ended: rows.filter((r) => r.AgreementStatus === 'Ended').length,\n      transfers: rows.filter((r) => r.AgreementStatus === 'Transferred' || r.PreviousOccupancyID).length,\n      outstanding: active.reduce((sum, r) => sum + Number(r.OutstandingBalance || 0), 0),\n    };\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Perjanjian Sewa</h1><p>Setiap hunian memiliki catatan yang dapat dilacak. Transfer, perpanjangan, dan check-out tidak menimpa riwayat sebelumnya.</p></div>\n        <div class=\"page-actions\">${App.can('agreements', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-checkin\">Check-in penghuni</button>' : ''}</div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Hunian aktif</div><div class=\"stat-value\">${counts.active}</div><div class=\"stat-foot\">Perjanjian berjalan</div></div>\n        <div class=\"stat-card purple\"><div class=\"stat-label\">Transfer & perpanjangan</div><div class=\"stat-value\">${counts.transfers}</div><div class=\"stat-foot\">Riwayat tetap tersimpan</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Selesai</div><div class=\"stat-value\">${counts.ended}</div><div class=\"stat-foot\">Sudah check-out</div></div>\n        <div class=\"stat-card ${counts.outstanding ? 'red' : ''}\"><div class=\"stat-label\">Saldo hunian aktif</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(counts.outstanding)}</div><div class=\"stat-foot\">Tagihan belum dibayar</div></div>\n      </div>\n      <div id=\"agreement-table\" class=\"mt-16\"></div>\n    `;\n    container.querySelector('#agreement-table').appendChild(tableHost);\n    build(rows);\n\n    const checkin = container.querySelector('#new-checkin');\n    if (checkin) checkin.addEventListener('click', openCheckInForm);\n\n    function build(data) {\n      UI.table(tableHost, {\n        rows: data,\n        searchKeys: ['TenantName', 'RoomNumber', 'OccupancyID', 'Notes'],\n        exportName: 'perjanjian-sewa',\n        rowKey: (row) => row.OccupancyID,\n        defaultSort: 'CheckInDate',\n        defaultSortDir: 'desc',\n        columns: [\n          { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.TenantPhone) },\n          { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong><span class=\"sub\">${row.PreviousOccupancyID ? 'dari ' + UI.esc(row.PreviousOccupancyID) : 'hunian awal'}</span>` },\n          { key: 'CheckInDate', label: 'Check-in', render: (row) => `${UI.date(row.CheckInDate)}${row.ActualCheckOut ? `<span class=\"sub\">keluar ${UI.date(row.ActualCheckOut)}</span>` : row.PlannedCheckOut ? `<span class=\"sub\">rencana keluar ${UI.date(row.PlannedCheckOut)}</span>` : ''}` },\n          { key: 'AgreedMonthlyPrice', label: 'Sewa / bulan', className: 'numeric', render: (row) => `${UI.currency(row.AgreedMonthlyPrice)}<span class=\"sub\">jatuh tempo tgl ${row.DueDay}</span>` },\n          { key: 'DepositAmount', label: 'Deposit', className: 'numeric', render: (row) => UI.currency(row.DepositAmount) },\n          { key: 'OutstandingBalance', label: 'Saldo', className: 'numeric', render: (row) => row.OutstandingBalance > 0 ? `<strong style=\"color:#b42318\">${UI.currency(row.OutstandingBalance)}</strong>` : UI.currency(0) },\n          { key: 'AgreementStatus', label: 'Status', render: (row) => UI.badge(row.AgreementStatus) },\n          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class=\"btn-group\">\n            <button class=\"btn btn-sm\" type=\"button\" data-act=\"detail\">Detail</button>\n            ${App.can('agreements', 'write') && row.AgreementStatus === 'Active' ? `\n              <button class=\"btn btn-sm\" type=\"button\" data-act=\"transfer\">Pindah</button>\n              <button class=\"btn btn-sm\" type=\"button\" data-act=\"renew\">Perpanjang</button>\n              <button class=\"btn btn-sm btn-danger\" type=\"button\" data-act=\"checkout\">Check-out</button>` : ''}\n          </div>` },\n        ],\n        onAction: async (action, row) => {\n          if (action === 'detail') showDetail(row);\n          if (action === 'transfer') openTransfer(row);\n          if (action === 'renew') openRenew(row);\n          if (action === 'checkout') openCheckout(row);\n        },\n      });\n    }\n\n    function showDetail(row) {\n      UI.openModal({\n        title: `Perjanjian ${row.OccupancyID}`,\n        subtitle: `${row.TenantName} &middot; kamar ${row.RoomNumber}`,\n        size: 'lg',\n        body: `<div class=\"grid grid-2\">\n          <div class=\"card\"><div class=\"card-body\"><div class=\"section-title\">Perjanjian sewa</div><div class=\"detail-list\">\n            <div class=\"detail-row\"><dt>Penghuni</dt><dd>${UI.esc(row.TenantName)}</dd></div>\n            <div class=\"detail-row\"><dt>Kamar</dt><dd>${UI.esc(row.RoomNumber)}</dd></div>\n            <div class=\"detail-row\"><dt>Mulai</dt><dd>${UI.date(row.CheckInDate)}</dd></div>\n            <div class=\"detail-row\"><dt>Selesai / keluar</dt><dd>${row.ActualCheckOut ? UI.date(row.ActualCheckOut) : row.PlannedCheckOut ? UI.date(row.PlannedCheckOut) : '-'}</dd></div>\n            <div class=\"detail-row\"><dt>Sewa bulanan</dt><dd>${UI.currency(row.AgreedMonthlyPrice)}</dd></div>\n            <div class=\"detail-row\"><dt>Tanggal penagihan</dt><dd>Tanggal ${row.BillingDay}</dd></div>\n            <div class=\"detail-row\"><dt>Jatuh tempo</dt><dd>${row.DueDay} hari setelah periode</dd></div>\n            <div class=\"detail-row\"><dt>Deposit</dt><dd>${UI.currency(row.DepositAmount)}</dd></div>\n            <div class=\"detail-row\"><dt>Status</dt><dd>${UI.badge(row.AgreementStatus)}</dd></div>\n            <div class=\"detail-row\"><dt>Hunian sebelumnya</dt><dd>${UI.esc(row.PreviousOccupancyID || '-')}</dd></div>\n          </div></div></div>\n          <div class=\"card\"><div class=\"card-body\"><div class=\"section-title\">Catatan</div><p class=\"small\" style=\"color:#4a5c59\">${UI.esc(row.Notes || 'Tidak ada catatan.')}</p>\n            <div class=\"notice mt-16\">Perjanjian aktif: <strong>${row.AgreementStatus === 'Active' ? 'Ya' : 'Tidak'}</strong>. Tagihan dan pembayaran masa lalu tetap merujuk pada hunian ini.</div>\n          </div></div>\n        </div>`,\n        footer: `<button class=\"btn\" type=\"button\" data-print>Cetak perjanjian</button><button class=\"btn btn-primary\" type=\"button\" data-close>Tutup</button>`,\n        onMount: (overlay, close) => {\n          overlay.querySelector('[data-close]').addEventListener('click', close);\n          overlay.querySelector('[data-print]').addEventListener('click', () => {\n            UI.printDocument(`Perjanjian ${row.OccupancyID}`, `${UI.docHeader(App.property, 'Perjanjian Sewa', [['No. Hunian', row.OccupancyID], ['Tanggal cetak', UI.date(UI.todayISO())]])}\n              <h3>Penghuni</h3><p>${UI.esc(row.TenantName)}<br>${UI.esc(row.TenantPhone)}</p>\n              <h3>Kamar dan ketentuan</h3><table><tbody>\n                <tr><td>Kamar</td><td>${UI.esc(row.RoomNumber)}</td></tr>\n                <tr><td>Mulai hunian</td><td>${UI.date(row.CheckInDate)}</td></tr>\n                <tr><td>Sewa bulanan</td><td>${UI.currency(row.AgreedMonthlyPrice)}</td></tr>\n                <tr><td>Deposit</td><td>${UI.currency(row.DepositAmount)}</td></tr>\n                <tr><td>Status</td><td>${UI.esc(row.AgreementStatus)}</td></tr>\n              </tbody></table>\n              <p style=\"margin-top:20px\">Penghuni menyetujui ketentuan sewa, jadwal pembayaran, dan kebijakan deposit yang berlaku di ${UI.esc(App.property.name)}.</p>\n              <div style=\"display:flex;justify-content:space-between;margin-top:50px\"><div>Penghuni<br><br><br>____________________</div><div>Pengelola<br><br><br>____________________</div></div>\n              <div class=\"doc-foot\">${UI.esc(App.property.name)} &middot; ${UI.esc(App.property.address)}</div>`);\n          });\n        },\n      });\n    }\n\n    function roomOptions(selected) {\n      return rooms.filter((room) => room.OperationalStatus !== 'Inactive' && room.OperationalStatus !== 'Maintenance' && (room.AvailabilityStatus === 'Available' || (room.AvailabilityStatus === 'Occupied' && room.ActiveOccupants < room.Capacity)))\n        .map((room) => `<option value=\"${room.RoomID}\" data-price=\"${room.StandardMonthlyPrice}\" ${selected === room.RoomID ? 'selected' : ''}>${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)} (${room.ActiveOccupants}/${room.Capacity})</option>`).join('');\n    }\n\n    function openCheckInForm() {\n      const tenantOptions = tenants.filter((t) => t.TenantStatus !== 'Inactive').map((t) => `<option value=\"${t.TenantID}\" data-status=\"${t.TenantStatus}\">${UI.esc(t.FullName)} &middot; ${UI.esc(t.Phone)} &middot; ${t.TenantStatus}</option>`).join('');\n      UI.formModal({\n        title: 'Check-in penghuni',\n        subtitle: 'Buat perjanjian sewa baru dan invoice periode pertama.',\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Penghuni <em>*</em></span><select name=\"TenantID\" required>${tenantOptions || '<option value=\"\">Belum ada penghuni</option>'}</select></label>\n          <label class=\"field\"><span>Kamar <em>*</em></span><select name=\"RoomID\" required>${roomOptions() || '<option value=\"\">Tidak ada kamar tersedia</option>'}</select></label>\n          <label class=\"field\"><span>Tanggal check-in <em>*</em></span><input type=\"date\" name=\"CheckInDate\" required value=\"${UI.todayISO()}\"></label>\n          <label class=\"field\"><span>Rencana check-out</span><input type=\"date\" name=\"PlannedCheckOut\"></label>\n          <label class=\"field\"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"AgreedMonthlyPrice\" required value=\"${rooms[0] ? rooms[0].StandardMonthlyPrice : ''}\"></label>\n          <label class=\"field\"><span>Deposit keamanan (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"DepositAmount\" value=\"0\"></label>\n          <label class=\"field\"><span>Metode deposit</span><select name=\"DepositMethod\"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n          <label class=\"field\"><span>Catatan</span><input name=\"Notes\"></label>\n        </div>\n        <div class=\"notice mt-16\">Kebijakan penagihan: sewa penuh per periode bulanan sejak tanggal check-in. Tanggal 29-31 mengikuti hari terakhir bulan.</div>`,\n        submitText: 'Proses check-in',\n        onMount: (overlay) => {\n          const room = overlay.querySelector('[name=\"RoomID\"]');\n          const price = overlay.querySelector('[name=\"AgreedMonthlyPrice\"]');\n          room.addEventListener('change', () => { const opt = room.selectedOptions[0]; if (opt && opt.dataset.price) price.value = opt.dataset.price; });\n        },\n        onSubmit: async (values) => {\n          const result = await API.post('/check-in', values);\n          UI.toast(`Check-in berhasil. ${result.invoicesCreated || 0} invoice dibuat.`, 'success', 'Hunian aktif');\n          await App.refreshMeta();\n          App.navigate('#/agreements');\n        },\n      });\n    }\n\n    function openTransfer(row) {\n      UI.formModal({\n        title: `Pindahkan ${row.TenantName}`,\n        subtitle: `Dari kamar ${row.RoomNumber}. Riwayat hunian lama tidak diubah.`,\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Kamar tujuan <em>*</em></span><select name=\"ToRoomID\" required>${roomOptions() || '<option value=\"\">Tidak ada kamar tersedia</option>'}</select></label>\n          <label class=\"field\"><span>Tanggal pindah <em>*</em></span><input type=\"date\" name=\"TransferDate\" required value=\"${UI.todayISO()}\"></label>\n          <label class=\"field\"><span>Harga sewa baru (Rp)</span><input type=\"number\" min=\"1\" step=\"1000\" name=\"NewMonthlyPrice\" value=\"${row.AgreedMonthlyPrice}\"></label>\n          <label class=\"field\"><span>Alasan</span><input name=\"Reason\" placeholder=\"Permintaan penghuni\"></label>\n        </div>\n        <div class=\"notice warn mt-16\">Kebijakan transfer: periode berjalan yang sudah ditagihkan tetap berlaku. Periode kamar baru dimulai setelah periode terakhir kamar lama berakhir agar tidak terjadi tagihan ganda. Deposit dialihkan ke hunian baru.</div>`,\n        submitText: 'Proses transfer',\n        onSubmit: async (values) => {\n          values.OccupancyID = row.OccupancyID;\n          await API.post('/transfers', values);\n          UI.toast('Transfer kamar berhasil.');\n          await App.refreshMeta();\n          App.navigate('#/agreements');\n        },\n      });\n    }\n\n    function openRenew(row) {\n      const nextMonth = new Date();\n      nextMonth.setDate(1);\n      nextMonth.setMonth(nextMonth.getMonth() + 1);\n      const suggested = nextMonth.toLocaleDateString('en-CA');\n      UI.formModal({\n        title: `Perpanjang sewa ${row.TenantName}`,\n        subtitle: `Hunian ${row.OccupancyID} &middot; kamar ${row.RoomNumber}`,\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Tanggal efektif <em>*</em></span><input type=\"date\" name=\"EffectiveDate\" required value=\"${suggested}\"></label>\n          <label class=\"field\"><span>Harga sewa baru (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"NewMonthlyPrice\" required value=\"${row.AgreedMonthlyPrice}\"></label>\n          <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\"></textarea></label>\n        </div>\n        <div class=\"notice mt-16\">Perpanjangan membuat catatan hunian baru dengan referensi ke hunian sebelumnya. Invoice dan pembayaran lama tidak berubah.</div>`,\n        submitText: 'Perpanjang perjanjian',\n        onSubmit: async (values) => {\n          values.OccupancyID = row.OccupancyID;\n          await API.post('/renew', values);\n          UI.toast('Perjanjian diperpanjang.');\n          await App.refreshMeta();\n          App.navigate('#/agreements');\n        },\n      });\n    }\n\n    function openCheckout(row) {\n      UI.formModal({\n        title: `Check-out ${row.TenantName}`,\n        subtitle: `Kamar ${row.RoomNumber}. Deposito dan tagihan akan diselesaikan.`,\n        size: 'lg',\n        body: `<div class=\"form-grid\">\n          <label class=\"field\"><span>Tanggal check-out <em>*</em></span><input type=\"date\" name=\"CheckOutDate\" required value=\"${UI.todayISO()}\"></label>\n          <label class=\"field\"><span>Potongan deposit (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"DepositDeduction\" value=\"0\"></label>\n          <label class=\"field full\"><span>Alasan potongan / kerusakan</span><input name=\"DeductionReason\" placeholder=\"Contoh: kerusakan kunci, pembersihan ekstra\"></label>\n          <label class=\"field\"><span>Metode pengembalian deposit</span><select name=\"ReturnMethod\"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n          <label class=\"field\"><span>Catatan</span><input name=\"Notes\"></label>\n        </div>\n        <div class=\"notice warn mt-16\">Tagihan yang belum dibayar tetap menjadi kewajiban penghuni. Kamar akan masuk status perbaikan sampai tugas pembersihan diselesaikan.</div>`,\n        submitText: 'Proses check-out',\n        onSubmit: async (values) => {\n          values.OccupancyID = row.OccupancyID;\n          const result = await API.post('/check-out', values);\n          showSettlement(row, result.settlement);\n          await App.refreshMeta();\n        },\n      });\n    }\n\n    function showSettlement(row, settlement) {\n      const deposit = settlement.deposit;\n      UI.openModal({\n        title: 'Ringkasan check-out',\n        subtitle: `${row.TenantName} &middot; ${row.RoomNumber} &middot; ${UI.date(settlement.checkOutDate)}`,\n        size: 'lg',\n        body: `<div class=\"settlement-hero\">\n          <div class=\"stat-label\">Sisa tagihan penghuni</div>\n          <div class=\"money-lg ${settlement.outstandingTotal ? 'money-negative' : 'money-positive'}\">${UI.currency(settlement.outstandingTotal)}</div>\n          <div class=\"settlement-note\">${settlement.outstandingInvoices.length} invoice belum lunas</div>\n        </div>\n        <div class=\"grid grid-2\">\n          <div class=\"card\"><div class=\"card-body\"><div class=\"section-title\">Deposit</div>\n            ${deposit ? `<div class=\"detail-list\">\n              <div class=\"detail-row\"><dt>Deposit awal</dt><dd>${UI.currency(deposit.deposit.DepositAmount)}</dd></div>\n              <div class=\"detail-row\"><dt>Potongan</dt><dd>${UI.currency(deposit.deduction)}</dd></div>\n              <div class=\"detail-row\"><dt>Dikembalikan</dt><dd>${UI.currency(deposit.returnAmount)}</dd></div>\n              <div class=\"detail-row\"><dt>Status</dt><dd>${UI.badge(deposit.deposit.DepositStatus)}</dd></div>\n            </div>` : '<div class=\"notice\">Tidak ada deposit yang tercatat.</div>'}\n          </div></div>\n          <div class=\"card\"><div class=\"card-body\"><div class=\"section-title\">Tindak lanjut</div><div class=\"detail-list\">\n            <div class=\"detail-row\"><dt>Status kamar</dt><dd>${UI.badge(settlement.roomStatus)}</dd></div>\n            <div class=\"detail-row\"><dt>Tugas kebersihan</dt><dd>${settlement.cleaningActivity ? 'Dibuat otomatis' : 'Tidak diperlukan'}</dd></div>\n            <div class=\"detail-row\"><dt>Hunian</dt><dd>Selesai (riwayat tersimpan)</dd></div>\n          </div></div></div>\n        </div>\n        ${settlement.outstandingInvoices.length ? `<div class=\"card mt-16\"><div class=\"card-head\"><h3>Invoice belum lunas</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Invoice</th><th>Periode</th><th class=\"numeric\">Sisa</th><th>Status</th></tr></thead><tbody>\n          ${settlement.outstandingInvoices.map((inv) => `<tr><td class=\"strong\">${UI.esc(inv.InvoiceNumber)}</td><td>${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}</td><td class=\"numeric\">${UI.currency(inv.OutstandingBalance)}</td><td>${UI.badge(inv.InvoiceStatus)}</td></tr>`).join('')}\n        </tbody></table></div></div>` : ''}`,\n        footer: `<a class=\"btn\" href=\"#/invoices\" data-close>Lihat invoice</a><button class=\"btn btn-primary\" type=\"button\" data-close>Tutup</button>`,\n        onMount: (overlay, close) => {\n          overlay.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => { close(); App.navigate('#/agreements'); }));\n        },\n      });\n    }\n  } catch (error) { UI.pageError(container, error); }\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('invoices', async (container) => {\n  const state = { rows: [], status: '', query: '' };\n  UI.loading(container);\n  try {\n    state.rows = await API.get('/invoices');\n    render();\n  } catch (error) { UI.pageError(container, error); }\n\n  function stats() {\n    const rows = state.rows.filter((r) => r.InvoiceStatus !== 'Cancelled');\n    return {\n      issued: rows.reduce((s, r) => s + Number(r.TotalAmount), 0),\n      paid: rows.reduce((s, r) => s + Number(r.AmountPaid), 0),\n      outstanding: rows.reduce((s, r) => s + Number(r.OutstandingBalance), 0),\n      overdue: rows.filter((r) => r.InvoiceStatus === 'Overdue').reduce((s, r) => s + Number(r.OutstandingBalance), 0),\n      count: rows.length,\n    };\n  }\n\n  function render() {\n    const s = stats();\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Invoice Bulanan</h1><p>Tagihan sewa dan layanan. Saldo dihitung dari alokasi pembayaran yang valid, bukan dari input manual.</p></div>\n        <div class=\"page-actions\">\n          <button class=\"btn\" type=\"button\" id=\"print-list\">Cetak daftar</button>\n          ${App.can('invoices', 'generate') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"generate\">Jalankan penagihan</button>' : ''}\n        </div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Total invoice</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(s.issued)}</div><div class=\"stat-foot\">${s.count} invoice aktif</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Sudah dibayar</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(s.paid)}</div><div class=\"stat-foot\">Alokasi valid</div></div>\n        <div class=\"stat-card amber\"><div class=\"stat-label\">Piutang</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(s.outstanding)}</div><div class=\"stat-foot\">Belum dibayar</div></div>\n        <div class=\"stat-card red\"><div class=\"stat-label\">Jatuh tempo</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(s.overdue)}</div><div class=\"stat-foot\">Perlu tindak lanjut</div></div>\n      </div>\n      <div class=\"filters mt-16\"><div class=\"chip-select\" id=\"invoice-filters\">\n        <button class=\"chip ${state.status === '' ? 'active' : ''}\" type=\"button\" data-status=\"\">Semua</button>\n        ${['Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].map((status) => `<button class=\"chip ${state.status === status ? 'active' : ''}\" type=\"button\" data-status=\"${status}\">${status === 'Issued' ? 'Terbit' : status === 'Partially Paid' ? 'Dibayar sebagian' : status === 'Paid' ? 'Lunas' : status === 'Overdue' ? 'Jatuh tempo' : 'Dibatalkan'}</button>`).join('')}\n      </div></div>\n      <div id=\"invoice-table\" class=\"mt-16\"></div>\n    `;\n    const host = document.createElement('div');\n    container.querySelector('#invoice-table').appendChild(host);\n\n    const filtered = state.status ? state.rows.filter((r) => r.InvoiceStatus === state.status) : state.rows;\n    UI.table(host, {\n      rows: filtered,\n      searchKeys: ['InvoiceNumber', 'TenantName', 'RoomNumber', 'PeriodStart'],\n      searchPlaceholder: 'Cari nomor invoice atau penghuni...',\n      exportName: 'invoice',\n      rowKey: (row) => row.InvoiceID,\n      defaultSort: 'InvoiceDate',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'InvoiceNumber', label: 'Invoice', render: (row) => `<strong>${UI.esc(row.InvoiceNumber)}</strong><span class=\"sub\">${UI.esc(row.TenantName)}</span>` },\n        { key: 'RoomNumber', label: 'Kamar' },\n        { key: 'PeriodStart', label: 'Periode', render: (row) => `${UI.date(row.PeriodStart)}<span class=\"sub\">s.d. ${UI.date(row.PeriodEnd)}</span>` },\n        { key: 'DueDate', label: 'Jatuh tempo', render: (row) => `${UI.date(row.DueDate)}${row.InvoiceStatus === 'Overdue' ? `<span class=\"sub\" style=\"color:#b42318\">${row.DaysOverdue} hari lewat</span>` : ''}` },\n        { key: 'TotalAmount', label: 'Total', className: 'numeric', render: (row) => UI.currency(row.TotalAmount) },\n        { key: 'AmountPaid', label: 'Dibayar', className: 'numeric', render: (row) => UI.currency(row.AmountPaid) },\n        { key: 'OutstandingBalance', label: 'Sisa', className: 'numeric', render: (row) => row.OutstandingBalance > 0 ? `<strong style=\"color:#b42318\">${UI.currency(row.OutstandingBalance)}</strong>` : UI.currency(0) },\n        { key: 'InvoiceStatus', label: 'Status', render: (row) => UI.badge(row.InvoiceStatus) },\n        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class=\"btn-group\">\n          <button class=\"btn btn-sm\" type=\"button\" data-act=\"detail\">Detail</button>\n          ${App.can('payments', 'write') && !['Paid', 'Cancelled'].includes(row.InvoiceStatus) && row.OutstandingBalance > 0 ? '<button class=\"btn btn-sm btn-primary\" type=\"button\" data-act=\"pay\">Bayar</button>' : ''}\n        </div>` },\n      ],\n      onAction: (action, row) => {\n        if (action === 'detail') openDetail(row.InvoiceID);\n        if (action === 'pay') openPayment(row);\n      },\n    });\n\n    container.querySelectorAll('[data-status]').forEach((button) => {\n      button.addEventListener('click', () => { state.status = button.dataset.status; render(); });\n    });\n    const generate = container.querySelector('#generate');\n    if (generate) generate.addEventListener('click', async () => {\n      const confirmed = await UI.confirmDialog({\n        title: 'Jalankan penagihan bulanan',\n        message: 'Invoice dibuat untuk perjanjian aktif yang belum memiliki tagihan pada periode berjalan. Proses idempoten: menjalankannya dua kali tidak membuat invoice ganda.',\n        confirmText: 'Jalankan penagihan',\n        details: `<div class=\"notice\">Tanggal proses: <strong>${UI.date(UI.todayISO())}</strong> &middot; prefix <strong>${UI.esc(App.property.invoicePrefix || 'INV')}</strong></div>`,\n      });\n      if (!confirmed) return;\n      try {\n        const result = await API.post('/invoices/generate', { asOf: UI.todayISO() });\n        UI.toast(`${result.count} invoice baru dibuat, ${result.skipped.length} periode dilewati karena sudah ada.`, 'success', 'Penagihan selesai');\n        state.rows = await API.get('/invoices');\n        render();\n      } catch (error) { UI.toast(error.message, 'error'); }\n    });\n    const printList = container.querySelector('#print-list');\n    if (printList) printList.addEventListener('click', () => {\n      UI.printDocument('Daftar Invoice', `${UI.docHeader(App.property, 'Daftar Invoice', [['Dicetak', UI.date(UI.todayISO())], ['Jumlah', String(filtered.length)]])}\n        <table><thead><tr><th>Invoice</th><th>Penghuni</th><th>Kamar</th><th>Periode</th><th>Jatuh tempo</th><th class=\"numeric\">Total</th><th class=\"numeric\">Sisa</th><th>Status</th></tr></thead><tbody>\n        ${filtered.map((row) => `<tr><td>${UI.esc(row.InvoiceNumber)}</td><td>${UI.esc(row.TenantName)}</td><td>${UI.esc(row.RoomNumber)}</td><td>${UI.date(row.PeriodStart)} - ${UI.date(row.PeriodEnd)}</td><td>${UI.date(row.DueDate)}</td><td class=\"numeric\">${UI.currency(row.TotalAmount)}</td><td class=\"numeric\">${UI.currency(row.OutstandingBalance)}</td><td>${UI.esc(row.InvoiceStatus)}</td></tr>`).join('')}\n        </tbody></table>\n        <div class=\"summary\"><div><span>Total</span><strong>${UI.currency(filtered.reduce((s, r) => s + Number(r.TotalAmount), 0))}</strong></div><div><span>Sisa</span><strong>${UI.currency(filtered.reduce((s, r) => s + Number(r.OutstandingBalance), 0))}</strong></div></div>\n        <div class=\"doc-foot\">${UI.esc(App.property.name)} &middot; ${UI.esc(App.property.address)}</div>`);\n    });\n  }\n\n  async function openDetail(invoiceId) {\n    try {\n      const detail = await API.get(`/invoices/${invoiceId}`);\n      const inv = detail.invoice;\n      const allocations = detail.allocations.filter((a) => a.AllocationStatus === 'Valid');\n      const modal = UI.openModal({\n        title: `Invoice ${inv.InvoiceNumber}`,\n        subtitle: `${inv.TenantName} &middot; kamar ${inv.RoomNumber} &middot; ${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}`,\n        size: 'lg',\n        body: `<div class=\"grid grid-2\">\n          <div class=\"card\"><div class=\"card-body\"><div class=\"section-title\">Rincian tagihan</div>\n            <div class=\"detail-list\">\n              <div class=\"detail-row\"><dt>Status</dt><dd>${UI.badge(inv.InvoiceStatus)}</dd></div>\n              <div class=\"detail-row\"><dt>Sewa</dt><dd>${UI.currency(inv.RentalAmount)}</dd></div>\n              <div class=\"detail-row\"><dt>Layanan</dt><dd>${UI.currency(inv.ServiceCharges)}</dd></div>\n              <div class=\"detail-row\"><dt>Biaya lain</dt><dd>${UI.currency(inv.OtherCharges)}</dd></div>\n              <div class=\"detail-row\"><dt>Diskon</dt><dd>-${UI.currency(inv.DiscountAmount)}</dd></div>\n              <div class=\"detail-row\"><dt>Total</dt><dd>${UI.currency(inv.TotalAmount)}</dd></div>\n              <div class=\"detail-row\"><dt>Dibayar</dt><dd>${UI.currency(inv.AmountPaid)}</dd></div>\n              <div class=\"detail-row\"><dt>Sisa</dt><dd>${UI.currency(inv.OutstandingBalance)}</dd></div>\n              <div class=\"detail-row\"><dt>Jatuh tempo</dt><dd>${UI.date(inv.DueDate)}</dd></div>\n            </div>\n          </div></div>\n          <div class=\"card\"><div class=\"card-body\"><div class=\"section-title\">Alokasi pembayaran</div>\n            ${allocations.length ? `<div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Kuitansi</th><th>Tanggal</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>${allocations.map((a) => `<tr><td>${UI.esc(a.ReceiptNumber)}</td><td>${UI.date(a.PaymentDate)}</td><td class=\"numeric\">${UI.currency(a.AllocatedAmount)}</td></tr>`).join('')}</tbody></table></div>` : '<div class=\"notice\">Belum ada pembayaran yang dialokasikan.</div>'}\n            <div class=\"notice mt-16\">${UI.esc(inv.Notes || 'Tidak ada catatan.')}</div>\n          </div></div>\n        </div>`,\n        footer: `<button class=\"btn\" type=\"button\" data-print>Cetak invoice</button>\n          ${App.can('invoices', 'write') && inv.InvoiceStatus !== 'Cancelled' ? '<button class=\"btn\" type=\"button\" data-adjust>Penyesuaian</button><button class=\"btn btn-danger\" type=\"button\" data-cancel>Batalkan</button>' : ''}\n          ${App.can('payments', 'write') && inv.OutstandingBalance > 0 && inv.InvoiceStatus !== 'Cancelled' ? '<button class=\"btn btn-primary\" type=\"button\" data-pay>Catat pembayaran</button>' : ''}\n          <button class=\"btn\" type=\"button\" data-close>Tutup</button>`,\n        onMount: (overlay, close) => {\n          overlay.querySelector('[data-close]').addEventListener('click', close);\n          overlay.querySelector('[data-print]').addEventListener('click', () => printInvoice(inv, allocations));\n          const pay = overlay.querySelector('[data-pay]');\n          if (pay) pay.addEventListener('click', () => { close(); openPayment(inv); });\n          const adjust = overlay.querySelector('[data-adjust]');\n          if (adjust) adjust.addEventListener('click', () => { close(); openAdjust(inv); });\n          const cancel = overlay.querySelector('[data-cancel]');\n          if (cancel) cancel.addEventListener('click', () => { close(); openCancel(inv); });\n        },\n      });\n      return modal;\n    } catch (error) { UI.toast(error.message, 'error'); }\n  }\n\n  function openPayment(inv) {\n    const key = UI.uuid();\n    UI.formModal({\n      title: `Pembayaran ${inv.InvoiceNumber}`,\n      subtitle: `${inv.TenantName} &middot; sisa tagihan ${UI.currency(inv.OutstandingBalance)}`,\n      body: `<div class=\"form-grid\">\n        <label class=\"field full\"><span>Jumlah diterima (Rp) <em>*</em></span><input class=\"amount-input\" type=\"number\" min=\"1\" step=\"1000\" name=\"AmountReceived\" required value=\"${inv.OutstandingBalance}\"></label>\n        <label class=\"field\"><span>Tanggal pembayaran <em>*</em></span><input type=\"date\" name=\"PaymentDate\" required value=\"${UI.todayISO()}\"></label>\n        <label class=\"field\"><span>Metode <em>*</em></span><select name=\"PaymentMethod\" required><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n        <label class=\"field full\"><span>Referensi bank / QRIS</span><input name=\"ReferenceNumber\" placeholder=\"Nomor referensi transaksi\"></label>\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\" placeholder=\"Cicilan ke-...\"></textarea></label>\n      </div>\n      <div class=\"notice mt-16\">Pembayaran dapat dilakukan sebagian. Setiap pembayaran memiliki kuitansi sendiri dan dialokasikan ke invoice ini. Kelebihan pembayaran dicatat sebagai kredit penghuni.</div>\n      <input type=\"hidden\" name=\"TenantID\" value=\"${inv.TenantID}\">\n      <input type=\"hidden\" name=\"InvoiceID\" value=\"${inv.InvoiceID}\">\n      <input type=\"hidden\" name=\"IdempotencyKey\" value=\"${key}\">\n      <input type=\"hidden\" name=\"PaymentStatus\" value=\"Confirmed\">`,\n      submitText: 'Konfirmasi pembayaran',\n      onSubmit: async (values) => {\n        const result = await API.post('/payments', values);\n        const detail = await API.get(`/payments/${result.payment.PaymentID}`);\n        UI.toast(`Pembayaran ${UI.currency(result.payment.AmountReceived)} tersimpan.`, 'success', 'Kuitansi dibuat');\n        UI.showReceipt(detail.payment, detail.allocations);\n        state.rows = await API.get('/invoices');\n        render();\n      },\n    });\n  }\n\n  function openAdjust(inv) {\n    UI.formModal({\n      title: `Penyesuaian ${inv.InvoiceNumber}`,\n      subtitle: 'Biaya tambahan dan diskon akan mengubah saldo invoice ini saja.',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Biaya lain-lain (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"OtherCharges\" value=\"${inv.OtherCharges}\"></label>\n        <label class=\"field\"><span>Diskon (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"DiscountAmount\" value=\"${inv.DiscountAmount}\"></label>\n        <label class=\"field full\"><span>Alasan penyesuaian <em>*</em></span><input name=\"Reason\" required placeholder=\"Contoh: kompensasi gangguan air\"></label>\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\">${UI.esc(inv.Notes || '')}</textarea></label>\n      </div>\n      <div class=\"notice warn mt-16\">Penyesuaian tercatat pada audit log. Invoice yang sudah memiliki pembayaran tidak dapat dibatalkan, tetapi dapat disesuaikan selama tidak mengurangi total di bawah jumlah yang sudah dibayar.</div>`,\n      submitText: 'Simpan penyesuaian',\n      onSubmit: async (values) => {\n        await API.post(`/invoices/${inv.InvoiceID}/adjust`, values);\n        UI.toast('Invoice berhasil disesuaikan.');\n        state.rows = await API.get('/invoices');\n        render();\n      },\n    });\n  }\n\n  function openCancel(inv) {\n    UI.formModal({\n      title: `Batalkan ${inv.InvoiceNumber}`,\n      subtitle: 'Invoice tidak dihapus; statusnya diubah menjadi dibatalkan untuk menjaga jejak audit.',\n      body: `<label class=\"field\"><span>Alasan pembatalan <em>*</em></span><textarea name=\"reason\" required placeholder=\"Contoh: duplikasi tagihan\"></textarea></label>\n      <div class=\"notice danger mt-16\">Invoice dengan pembayaran valid tidak dapat dibatalkan. Lakukan void pembayaran terlebih dahulu.</div>`,\n      submitText: 'Batalkan invoice',\n      danger: true,\n      onSubmit: async (values) => {\n        await API.post(`/invoices/${inv.InvoiceID}/cancel`, values);\n        UI.toast('Invoice dibatalkan.');\n        state.rows = await API.get('/invoices');\n        render();\n      },\n    });\n  }\n\n  function printInvoice(inv, allocations) {\n    UI.printDocument(`Invoice ${inv.InvoiceNumber}`, `${UI.docHeader(App.property, 'Invoice', [['No. Invoice', inv.InvoiceNumber], ['Tanggal', UI.date(inv.InvoiceDate)], ['Jatuh tempo', UI.date(inv.DueDate)]])}\n      <div class=\"summary\"><div><span>Ditagihkan kepada</span><strong>${UI.esc(inv.TenantName)}</strong><br>${UI.esc(inv.TenantPhone || '')}</div><div><span>Kamar</span><strong>${UI.esc(inv.RoomNumber)}</strong></div><div><span>Periode</span><strong>${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}</strong></div></div>\n      <table><thead><tr><th>Deskripsi</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>\n        <tr><td>Sewa bulanan</td><td class=\"numeric\">${UI.currency(inv.RentalAmount)}</td></tr>\n        <tr><td>Layanan tambahan</td><td class=\"numeric\">${UI.currency(inv.ServiceCharges)}</td></tr>\n        <tr><td>Biaya lain-lain</td><td class=\"numeric\">${UI.currency(inv.OtherCharges)}</td></tr>\n        <tr><td>Diskon</td><td class=\"numeric\">-${UI.currency(inv.DiscountAmount)}</td></tr>\n        <tr><td><strong>Total</strong></td><td class=\"numeric\"><strong>${UI.currency(inv.TotalAmount)}</strong></td></tr>\n        <tr><td>Sudah dibayar</td><td class=\"numeric\">${UI.currency(inv.AmountPaid)}</td></tr>\n        <tr><td><strong>Sisa tagihan</strong></td><td class=\"numeric\"><strong>${UI.currency(inv.OutstandingBalance)}</strong></td></tr>\n      </tbody></table>\n      ${allocations && allocations.length ? `<h3>Riwayat pembayaran</h3><table><thead><tr><th>Kuitansi</th><th>Tanggal</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>${allocations.map((a) => `<tr><td>${UI.esc(a.ReceiptNumber)}</td><td>${UI.date(a.PaymentDate)}</td><td class=\"numeric\">${UI.currency(a.AllocatedAmount)}</td></tr>`).join('')}</tbody></table>` : ''}\n      <div class=\"doc-foot\">${UI.esc(inv.Notes || '')}<br>${UI.esc(App.property.name)} &middot; ${UI.esc(App.property.address)} &middot; ${UI.esc(App.property.phone)}</div>`);\n  }\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('payments', async (container) => {\n  let rows = [];\n  let tenants = [];\n  UI.loading(container);\n  try {\n    [rows, tenants] = await Promise.all([\n      API.get('/payments'),\n      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),\n    ]);\n    render();\n  } catch (error) { UI.pageError(container, error); }\n\n  function render() {\n    const confirmed = rows.filter((r) => r.PaymentStatus === 'Confirmed');\n    const total = confirmed.reduce((s, r) => s + Number(r.AmountReceived), 0);\n    const unallocated = confirmed.reduce((s, r) => s + Number(r.UnallocatedAmount || 0), 0);\n    const voids = rows.filter((r) => r.PaymentStatus === 'Voided').length;\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Pembayaran & Kuitansi</h1><p>Setiap penerimaan tercatat dengan kuitansi unik. Pembayaran sebagian dialokasikan ke invoice dan saldo dihitung ulang secara server-side.</p></div>\n        <div class=\"page-actions\">${App.can('payments', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"record-payment\">Catat pembayaran</button>' : ''}</div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Penerimaan terkonfirmasi</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(total)}</div><div class=\"stat-foot\">${confirmed.length} pembayaran</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Kredit belum teralokasi</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(unallocated)}</div><div class=\"stat-foot\">Kelebihan bayar penghuni</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Kuitansi terbit</div><div class=\"stat-value\">${rows.length}</div><div class=\"stat-foot\">Termasuk void</div></div>\n        <div class=\"stat-card ${voids ? 'red' : ''}\"><div class=\"stat-label\">Pembayaran void</div><div class=\"stat-value\">${voids}</div><div class=\"stat-foot\">Memiliki jurnal pembalik</div></div>\n      </div>\n      <div id=\"payment-table\" class=\"mt-16\"></div>\n    `;\n    const host = document.createElement('div');\n    container.querySelector('#payment-table').appendChild(host);\n    UI.table(host, {\n      rows,\n      searchKeys: ['ReceiptNumber', 'TenantName', 'ReferenceNumber', 'PaymentMethod'],\n      searchPlaceholder: 'Cari kuitansi, penghuni, referensi...',\n      exportName: 'pembayaran',\n      rowKey: (row) => row.PaymentID,\n      defaultSort: 'PaymentDate',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'ReceiptNumber', label: 'Kuitansi', render: (row) => `<strong>${UI.esc(row.ReceiptNumber)}</strong><span class=\"sub\">${UI.esc(row.ReferenceNumber || '-')}</span>` },\n        { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.PaymentMethod) },\n        { key: 'PaymentDate', label: 'Tanggal', render: (row) => UI.date(row.PaymentDate) },\n        { key: 'PaymentMethod', label: 'Metode' },\n        { key: 'AmountReceived', label: 'Diterima', className: 'numeric', render: (row) => `<strong>${UI.currency(row.AmountReceived)}</strong>` },\n        { key: 'AmountAllocated', label: 'Teralokasi', className: 'numeric', render: (row) => `${UI.currency(row.AmountAllocated)}${row.UnallocatedAmount > 0 ? `<span class=\"sub\">kredit ${UI.currency(row.UnallocatedAmount)}</span>` : ''}` },\n        { key: 'ReceivedByName', label: 'Petugas', render: (row) => UI.esc(row.ReceivedByName || '-') },\n        { key: 'PaymentStatus', label: 'Status', render: (row) => UI.badge(row.PaymentStatus) },\n        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class=\"btn-group\">\n          <button class=\"btn btn-sm\" type=\"button\" data-act=\"receipt\">Kuitansi</button>\n          ${App.can('payments', 'void') && row.PaymentStatus === 'Confirmed' ? '<button class=\"btn btn-sm btn-danger\" type=\"button\" data-act=\"void\">Void</button>' : ''}\n        </div>` },\n      ],\n      onAction: async (action, row) => {\n        if (action === 'receipt') {\n          try {\n            const detail = await API.get(`/payments/${row.PaymentID}`);\n            UI.showReceipt(detail.payment, detail.allocations);\n          } catch (error) { UI.toast(error.message, 'error'); }\n        }\n        if (action === 'void') openVoid(row);\n      },\n    });\n    const record = container.querySelector('#record-payment');\n    if (record) record.addEventListener('click', openPaymentForm);\n  }\n\n  async function openPaymentForm() {\n    const tenantOptions = tenants.filter((t) => t.TenantStatus === 'Active' || t.ActiveBalance > 0).map((t) => `<option value=\"${t.TenantID}\">${UI.esc(t.FullName)} &middot; ${UI.esc(t.RoomNumber || 'tanpa kamar')} &middot; saldo ${UI.currency(t.ActiveBalance)}</option>`).join('');\n    if (!tenantOptions) { UI.toast('Tidak ada penghuni aktif dengan tagihan.', 'error'); return; }\n    const key = UI.uuid();\n    UI.formModal({\n      title: 'Catat pembayaran',\n      subtitle: 'Pilih invoice atau biarkan sistem mengalokasikan otomatis ke tagihan tertua.',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field full\"><span>Penghuni <em>*</em></span><select name=\"TenantID\" id=\"pay-tenant\" required>${tenantOptions}</select></label>\n        <label class=\"field full\"><span>Invoice tujuan</span><select name=\"InvoiceID\" id=\"pay-invoice\"><option value=\"\">Alokasi otomatis ke tagihan tertua</option></select></label>\n        <label class=\"field\"><span>Jumlah diterima (Rp) <em>*</em></span><input class=\"amount-input\" type=\"number\" min=\"1\" step=\"1000\" name=\"AmountReceived\" id=\"pay-amount\" required></label>\n        <label class=\"field\"><span>Tanggal pembayaran <em>*</em></span><input type=\"date\" name=\"PaymentDate\" required value=\"${UI.todayISO()}\"></label>\n        <label class=\"field\"><span>Metode <em>*</em></span><select name=\"PaymentMethod\" required><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n        <label class=\"field\"><span>Referensi</span><input name=\"ReferenceNumber\" placeholder=\"Nomor referensi bank / QRIS\"></label>\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\" placeholder=\"Cicilan, pembayaran gabungan, dll.\"></textarea></label>\n      </div>\n      <div id=\"pay-info\" class=\"notice mt-16\">Pilih penghuni untuk melihat tagihan terbuka.</div>\n      <input type=\"hidden\" name=\"IdempotencyKey\" value=\"${key}\">`,\n      submitText: 'Konfirmasi pembayaran',\n      onMount: (overlay) => {\n        const tenantSelect = overlay.querySelector('#pay-tenant');\n        const invoiceSelect = overlay.querySelector('#pay-invoice');\n        const amount = overlay.querySelector('#pay-amount');\n        const info = overlay.querySelector('#pay-info');\n        async function loadInvoices() {\n          invoiceSelect.innerHTML = '<option value=\"\">Memuat invoice...</option>';\n          try {\n            const invoices = await API.get('/invoices', { tenantId: tenantSelect.value });\n            const open = invoices.filter((inv) => !['Paid', 'Cancelled'].includes(inv.InvoiceStatus) && inv.OutstandingBalance > 0);\n            invoiceSelect.innerHTML = '<option value=\"\">Alokasi otomatis ke tagihan tertua</option>' + open.map((inv) => `<option value=\"${inv.InvoiceID}\" data-outstanding=\"${inv.OutstandingBalance}\">${UI.esc(inv.InvoiceNumber)} &middot; ${UI.date(inv.PeriodStart)} &middot; sisa ${UI.currency(inv.OutstandingBalance)}</option>`).join('');\n            const total = open.reduce((s, inv) => s + Number(inv.OutstandingBalance), 0);\n            amount.value = open.length ? (invoiceSelect.value ? open[0].OutstandingBalance : total) : '';\n            info.className = `notice mt-16 ${open.length ? '' : 'warn'}`;\n            info.innerHTML = open.length ? `Total saldo terbuka: <strong>${UI.currency(total)}</strong>. Pembayaran berlebih menjadi kredit penghuni.` : 'Tidak ada invoice terbuka. Pembayaran akan dicatat sebagai kredit penghuni.';\n          } catch (error) { info.textContent = error.message; }\n        }\n        tenantSelect.addEventListener('change', loadInvoices);\n        invoiceSelect.addEventListener('change', () => {\n          const opt = invoiceSelect.selectedOptions[0];\n          if (opt && opt.dataset.outstanding) amount.value = opt.dataset.outstanding;\n        });\n        loadInvoices();\n      },\n      onSubmit: async (values) => {\n        const result = await API.post('/payments', values);\n        const detail = await API.get(`/payments/${result.payment.PaymentID}`);\n        UI.toast(`Pembayaran ${UI.currency(result.payment.AmountReceived)} tersimpan.`, 'success', 'Kuitansi dibuat');\n        UI.showReceipt(detail.payment, detail.allocations);\n        rows = await API.get('/payments');\n        render();\n      },\n    });\n  }\n\n  function openVoid(row) {\n    UI.formModal({\n      title: `Void pembayaran ${row.ReceiptNumber}`,\n      subtitle: 'Pembayaran tidak dihapus. Sistem mencatat jurnal pembalik dan membatalkan alokasi.',\n      body: `<div class=\"detail-list\">\n        <div class=\"detail-row\"><dt>Penghuni</dt><dd>${UI.esc(row.TenantName)}</dd></div>\n        <div class=\"detail-row\"><dt>Jumlah</dt><dd>${UI.currency(row.AmountReceived)}</dd></div>\n        <div class=\"detail-row\"><dt>Tanggal</dt><dd>${UI.date(row.PaymentDate)}</dd></div>\n      </div>\n      <label class=\"field mt-16\"><span>Alasan void <em>*</em></span><textarea name=\"reason\" required placeholder=\"Contoh: pembayaran ganda / salah input\"></textarea></label>\n      <div class=\"notice danger mt-16\">Setelah void, saldo invoice akan naik kembali sebesar alokasi yang dibatalkan. Tindakan ini tercatat pada audit log.</div>`,\n      submitText: 'Void pembayaran',\n      danger: true,\n      onSubmit: async (values) => {\n        await API.post(`/payments/${row.PaymentID}/void`, values);\n        UI.toast('Pembayaran di-void dan jurnal pembalik dibuat.');\n        rows = await API.get('/payments');\n        render();\n      },\n    });\n  }\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('services', async (container) => {\n  const state = { tab: 'orders', orders: [], services: [], tenants: [] };\n  UI.loading(container);\n  try {\n    [state.orders, state.services, state.tenants] = await Promise.all([\n      API.get('/service-orders'),\n      API.get('/services'),\n      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),\n    ]);\n    render();\n  } catch (error) { UI.pageError(container, error); }\n\n  function render() {\n    const paid = state.orders.filter((o) => o.OrderStatus === 'Paid');\n    const billed = state.orders.filter((o) => o.OrderStatus === 'Billed');\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Layanan Tambahan</h1><p>Laundry, cleaning, parkir, dan layanan lain. Harga disepakati saat order dan tidak berubah oleh perubahan master harga.</p></div>\n        <div class=\"page-actions\">\n          ${state.tab === 'orders' && App.can('services', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-order\">Buat order layanan</button>' : ''}\n          ${state.tab === 'master' && App.can('services', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-service\">Tambah layanan</button>' : ''}\n        </div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Total order</div><div class=\"stat-value\">${state.orders.length}</div><div class=\"stat-foot\">${state.services.length} layanan aktif</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Langsung dibayar</div><div class=\"stat-value\">${paid.length}</div><div class=\"stat-foot\">${UI.currency(paid.reduce((s, o) => s + Number(o.TotalAmount), 0))}</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Ditagihkan ke invoice</div><div class=\"stat-value\">${billed.length}</div><div class=\"stat-foot\">${UI.currency(billed.reduce((s, o) => s + Number(o.TotalAmount), 0))}</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Nilai layanan</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(state.orders.reduce((s, o) => s + Number(o.TotalAmount), 0))}</div><div class=\"stat-foot\">Seluruh order</div></div>\n      </div>\n      <div class=\"tabs mt-16\">\n        <button class=\"tab ${state.tab === 'orders' ? 'active' : ''}\" type=\"button\" data-tab=\"orders\">Order Layanan</button>\n        <button class=\"tab ${state.tab === 'master' ? 'active' : ''}\" type=\"button\" data-tab=\"master\">Master Layanan</button>\n      </div>\n      <div id=\"services-content\"></div>\n    `;\n    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; render(); }));\n    if (state.tab === 'orders') renderOrders(); else renderMaster();\n    const orderBtn = container.querySelector('#new-order');\n    if (orderBtn) orderBtn.addEventListener('click', openOrderForm);\n    const serviceBtn = container.querySelector('#new-service');\n    if (serviceBtn) serviceBtn.addEventListener('click', () => openServiceForm(null));\n  }\n\n  function renderOrders() {\n    const host = document.createElement('div');\n    container.querySelector('#services-content').appendChild(host);\n    UI.table(host, {\n      rows: state.orders,\n      searchKeys: ['TenantName', 'ServiceName', 'RoomNumber', 'ServiceOrderID'],\n      searchPlaceholder: 'Cari order, penghuni, layanan...',\n      exportName: 'order-layanan',\n      rowKey: (row) => row.ServiceOrderID,\n      defaultSort: 'OrderDate',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'ServiceOrderID', label: 'Order', render: (row) => `<strong>${UI.esc(row.ServiceOrderID)}</strong><span class=\"sub\">${UI.date(row.OrderDate)}</span>` },\n        { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.RoomNumber) },\n        { key: 'ServiceName', label: 'Layanan', render: (row) => `${UI.esc(row.ServiceName)}<span class=\"sub\">${row.Quantity} &times; ${UI.currency(row.UnitPrice)}</span>` },\n        { key: 'TotalAmount', label: 'Total', className: 'numeric', render: (row) => `<strong>${UI.currency(row.TotalAmount)}</strong>` },\n        { key: 'BillingMethod', label: 'Penagihan', render: (row) => UI.badge(row.BillingMethod) },\n        { key: 'InvoiceID', label: 'Referensi', render: (row) => row.InvoiceID ? `Invoice ${UI.esc(row.InvoiceID)}` : row.PaymentID ? `Kuitansi ${UI.esc(row.PaymentID)}` : '-' },\n        { key: 'OrderStatus', label: 'Status', render: (row) => UI.badge(row.OrderStatus) },\n      ],\n    });\n  }\n\n  function renderMaster() {\n    const host = document.createElement('div');\n    container.querySelector('#services-content').appendChild(host);\n    UI.table(host, {\n      rows: state.services,\n      searchKeys: ['ServiceName', 'ServiceCode', 'Category'],\n      exportName: 'master-layanan',\n      rowKey: (row) => row.ServiceID,\n      columns: [\n        { key: 'ServiceName', label: 'Layanan', render: (row) => `<strong>${UI.esc(row.ServiceName)}</strong><span class=\"sub\">${UI.esc(row.ServiceCode)} &middot; ${UI.esc(row.Description || '')}</span>` },\n        { key: 'Category', label: 'Kategori' },\n        { key: 'Unit', label: 'Satuan' },\n        { key: 'StandardPrice', label: 'Harga jual', className: 'numeric', render: (row) => UI.currency(row.StandardPrice) },\n        { key: 'CostPrice', label: 'Harga pokok', className: 'numeric', render: (row) => UI.currency(row.CostPrice) },\n        { key: 'IsAvailable', label: 'Status', render: (row) => UI.badge(row.IsAvailable === 'TRUE' ? 'Active' : 'Inactive') },\n        { key: 'actions', label: '', sortable: false, render: (row) => App.can('services', 'write') ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>' : '' },\n      ],\n      onAction: (action, row) => { if (action === 'edit') openServiceForm(row); },\n    });\n  }\n\n  async function openOrderForm() {\n    const activeTenants = state.tenants.filter((t) => t.TenantStatus === 'Active');\n    if (!activeTenants.length) { UI.toast('Belum ada penghuni aktif.', 'error'); return; }\n    UI.formModal({\n      title: 'Buat order layanan',\n      subtitle: 'Harga diambil saat order dan disimpan pada catatan order.',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Penghuni <em>*</em></span><select name=\"TenantID\" required>${activeTenants.map((t) => `<option value=\"${t.TenantID}\">${UI.esc(t.FullName)} &middot; ${UI.esc(t.RoomNumber || '-')}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Layanan <em>*</em></span><select name=\"ServiceID\" required>${state.services.filter((s) => s.IsAvailable === 'TRUE').map((s) => `<option value=\"${s.ServiceID}\" data-price=\"${s.StandardPrice}\" data-unit=\"${s.Unit}\">${UI.esc(s.ServiceName)} &middot; ${UI.currency(s.StandardPrice)} / ${UI.esc(s.Unit)}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Jumlah <em>*</em></span><input type=\"number\" min=\"1\" step=\"1\" name=\"Quantity\" required value=\"1\"></label>\n        <label class=\"field\"><span>Tanggal order <em>*</em></span><input type=\"date\" name=\"OrderDate\" required value=\"${UI.todayISO()}\"></label>\n        <label class=\"field\"><span>Harga satuan (Rp)</span><input type=\"number\" min=\"1\" step=\"1000\" name=\"UnitPrice\" id=\"order-price\" required></label>\n        <label class=\"field\"><span>Metode penagihan <em>*</em></span><select name=\"BillingMethod\" id=\"billing-method\" required><option value=\"Add to Invoice\">Tambahkan ke invoice</option><option value=\"Immediate Payment\">Bayar langsung</option></select></label>\n        <div class=\"field\" id=\"method-field\" style=\"display:none\"><span>Metode pembayaran</span><select name=\"PaymentMethod\"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></div>\n        <label class=\"field\"><span>Referensi pembayaran</span><input name=\"ReferenceNumber\" placeholder=\"Opsional\"></label>\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\" placeholder=\"Detail permintaan layanan\"></textarea></label>\n      </div>\n      <div class=\"notice mt-16\">Untuk penagihan ke invoice, sistem memilih invoice terbuka tertua. Jika tidak ada, invoice layanan baru dibuat otomatis.</div>`,\n      submitText: 'Simpan order',\n      onMount: (overlay) => {\n        const service = overlay.querySelector('[name=\"ServiceID\"]');\n        const price = overlay.querySelector('#order-price');\n        const method = overlay.querySelector('#billing-method');\n        const methodField = overlay.querySelector('#method-field');\n        const setPrice = () => { price.value = service.selectedOptions[0].dataset.price; };\n        setPrice();\n        service.addEventListener('change', setPrice);\n        method.addEventListener('change', () => { methodField.style.display = method.value === 'Immediate Payment' ? '' : 'none'; });\n      },\n      onSubmit: async (values) => {\n        const result = await API.post('/service-orders', values);\n        UI.toast(`Order ${result.order.ServiceOrderID} dibuat (${UI.currency(result.order.TotalAmount)}).`, 'success', 'Layanan tercatat');\n        if (result.payment) {\n          const detail = await API.get(`/payments/${result.payment.PaymentID}`);\n          UI.showReceipt(detail.payment, detail.allocations);\n        }\n        state.orders = await API.get('/service-orders');\n        state.services = await API.get('/services');\n        render();\n      },\n    });\n  }\n\n  function openServiceForm(service) {\n    const isEdit = !!service;\n    UI.formModal({\n      title: isEdit ? `Ubah ${service.ServiceName}` : 'Tambah layanan',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Nama layanan <em>*</em></span><input name=\"ServiceName\" required value=\"${UI.esc(service ? service.ServiceName : '')}\"></label>\n        <label class=\"field\"><span>Kode</span><input name=\"ServiceCode\" value=\"${UI.esc(service ? service.ServiceCode : '')}\"></label>\n        <label class=\"field\"><span>Kategori <em>*</em></span><select name=\"Category\">${['Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'].map((cat) => `<option ${service && service.Category === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Satuan <em>*</em></span><input name=\"Unit\" required value=\"${UI.esc(service ? service.Unit : '')}\" placeholder=\"kg / kali / bulan\"></label>\n        <label class=\"field\"><span>Harga jual (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"500\" name=\"StandardPrice\" required value=\"${service ? service.StandardPrice : ''}\"></label>\n        <label class=\"field\"><span>Harga pokok (Rp)</span><input type=\"number\" min=\"0\" step=\"500\" name=\"CostPrice\" value=\"${service ? service.CostPrice : 0}\"></label>\n        <label class=\"field\"><span>Status</span><select name=\"IsAvailable\"><option value=\"TRUE\" ${!service || service.IsAvailable === 'TRUE' ? 'selected' : ''}>Tersedia</option><option value=\"FALSE\" ${service && service.IsAvailable === 'FALSE' ? 'selected' : ''}>Tidak tersedia</option></select></label>\n        <label class=\"field full\"><span>Deskripsi</span><textarea name=\"Description\">${UI.esc(service ? service.Description : '')}</textarea></label>\n      </div>`,\n      submitText: isEdit ? 'Simpan perubahan' : 'Tambah layanan',\n      onSubmit: async (values) => {\n        if (isEdit) values.ServiceID = service.ServiceID;\n        await API.post('/services', values);\n        UI.toast(isEdit ? 'Layanan diperbarui.' : 'Layanan ditambahkan.');\n        state.services = await API.get('/services');\n        await App.refreshMeta();\n        render();\n      },\n    });\n  }\n});\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('expenses', async (container) => {\n  let rows = [];\n  UI.loading(container);\n  try {\n    rows = await API.get('/expenses');\n    render();\n  } catch (error) { UI.pageError(container, error); }\n\n  function render() {\n    const paid = rows.filter((r) => r.PaymentStatus === 'Paid');\n    const pending = rows.filter((r) => r.PaymentStatus === 'Pending' || r.PaymentStatus === 'Approved');\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Pengeluaran Operasional</h1><p>Catat biaya listrik, perawatan, kebersihan, internet, gaji, dan peralatan. Setiap pembayaran masuk ke ledger sebagai arus kas keluar.</p></div>\n        <div class=\"page-actions\">${App.can('expenses', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"add-expense\">Catat pengeluaran</button>' : ''}</div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Pengeluaran dibayar</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(paid.reduce((s, r) => s + Number(r.TotalAmount), 0))}</div><div class=\"stat-foot\">${paid.length} transaksi</div></div>\n        <div class=\"stat-card amber\"><div class=\"stat-label\">Menunggu pembayaran</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(pending.reduce((s, r) => s + Number(r.TotalAmount), 0))}</div><div class=\"stat-foot\">${pending.length} pengeluaran</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Total tercatat</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(rows.reduce((s, r) => s + Number(r.TotalAmount), 0))}</div><div class=\"stat-foot\">${rows.length} dokumen</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Kategori terbanyak</div><div class=\"stat-value\" style=\"font-size:18px\">${topCategory()}</div><div class=\"stat-foot\">Berdasarkan nilai pengeluaran</div></div>\n      </div>\n      <div id=\"expense-table\" class=\"mt-16\"></div>\n    `;\n    const host = document.createElement('div');\n    container.querySelector('#expense-table').appendChild(host);\n    UI.table(host, {\n      rows,\n      searchKeys: ['Description', 'Vendor', 'Category', 'RequestedByName'],\n      searchPlaceholder: 'Cari deskripsi, vendor, kategori...',\n      exportName: 'pengeluaran',\n      rowKey: (row) => row.ExpenseID,\n      defaultSort: 'ExpenseDate',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'ExpenseDate', label: 'Tanggal', render: (row) => `${UI.date(row.ExpenseDate)}<span class=\"sub\">${UI.esc(row.ExpenseID)}</span>` },\n        { key: 'Description', label: 'Deskripsi', render: (row) => `<strong>${UI.esc(row.Description)}</strong><span class=\"sub\">${UI.esc(row.Vendor || '-')} &middot; ${UI.esc(row.Category)}</span>` },\n        { key: 'Quantity', label: 'Qty', className: 'numeric' },\n        { key: 'UnitCost', label: 'Biaya satuan', className: 'numeric', render: (row) => UI.currency(row.UnitCost) },\n        { key: 'TotalAmount', label: 'Total', className: 'numeric', render: (row) => `<strong>${UI.currency(row.TotalAmount)}</strong>` },\n        { key: 'PaymentMethod', label: 'Metode' },\n        { key: 'PaymentStatus', label: 'Status', render: (row) => UI.badge(row.PaymentStatus) },\n        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => {\n          if (!App.can('expenses', 'write') || row.PaymentStatus === 'Cancelled') return '';\n          const buttons = [];\n          if (row.PaymentStatus === 'Pending') buttons.push('<button class=\"btn btn-sm\" type=\"button\" data-act=\"approve\">Setujui</button>');\n          if (row.PaymentStatus === 'Pending' || row.PaymentStatus === 'Approved') buttons.push('<button class=\"btn btn-sm btn-primary\" type=\"button\" data-act=\"pay\">Bayar</button>');\n          buttons.push('<button class=\"btn btn-sm btn-danger\" type=\"button\" data-act=\"cancel\">Batal</button>');\n          return `<div class=\"btn-group\">${buttons.join('')}</div>`;\n        } },\n      ],\n      onAction: async (action, row) => {\n        if (action === 'approve') {\n          try { await API.post('/expenses', { ExpenseID: row.ExpenseID, PaymentStatus: 'Approved' }); UI.toast('Pengeluaran disetujui.'); refresh(); } catch (error) { UI.toast(error.message, 'error'); }\n        }\n        if (action === 'pay') {\n          const ok = await UI.confirmDialog({ title: 'Tandai pengeluaran dibayar', message: `Pengeluaran ${UI.currency(row.TotalAmount)} untuk \"${row.Description}\" akan dicatat sebagai arus kas keluar.`, confirmText: 'Tandai dibayar' });\n          if (!ok) return;\n          try { await API.post('/expenses', { ExpenseID: row.ExpenseID, PaymentStatus: 'Paid' }); UI.toast('Pengeluaran dibayar dan masuk ledger.'); refresh(); } catch (error) { UI.toast(error.message, 'error'); }\n        }\n        if (action === 'cancel') openCancel(row);\n      },\n    });\n\n    const addBtn = container.querySelector('#add-expense');\n    if (addBtn) addBtn.addEventListener('click', openForm);\n  }\n\n  function topCategory() {\n    const totals = {};\n    rows.filter((r) => r.PaymentStatus === 'Paid').forEach((r) => { totals[r.Category] = (totals[r.Category] || 0) + Number(r.TotalAmount); });\n    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);\n    return entries.length ? UI.esc(entries[0][0]) : '-';\n  }\n\n  async function refresh() {\n    rows = await API.get('/expenses');\n    render();\n  }\n\n  function openForm() {\n    UI.formModal({\n      title: 'Catat pengeluaran',\n      subtitle: 'Pengeluaran berstatus dibayar langsung tercatat di ledger.',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Tanggal <em>*</em></span><input type=\"date\" name=\"ExpenseDate\" required value=\"${UI.todayISO()}\"></label>\n        <label class=\"field\"><span>Kategori <em>*</em></span><select name=\"Category\" required>${['Utilities', 'Maintenance', 'Cleaning Supplies', 'Internet', 'Salaries', 'Equipment', 'Other'].map((cat) => `<option>${cat}</option>`).join('')}</select></label>\n        <label class=\"field full\"><span>Deskripsi <em>*</em></span><input name=\"Description\" required placeholder=\"Contoh: tagihan listrik area bersama\"></label>\n        <label class=\"field\"><span>Vendor</span><input name=\"Vendor\" placeholder=\"Nama vendor\"></label>\n        <label class=\"field\"><span>Jumlah <em>*</em></span><input type=\"number\" min=\"1\" step=\"1\" name=\"Quantity\" required value=\"1\"></label>\n        <label class=\"field\"><span>Biaya satuan (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"UnitCost\" required></label>\n        <label class=\"field\"><span>Metode pembayaran <em>*</em></span><select name=\"PaymentMethod\" required><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n        <label class=\"field\"><span>Status</span><select name=\"PaymentStatus\"><option value=\"Pending\">Pending</option><option value=\"Paid\">Langsung dibayar</option></select></label>\n        <label class=\"field full\"><span>URL bukti / nota</span><input name=\"ReceiptURL\" placeholder=\"https://drive.google.com/...\"></label>\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\"></textarea></label>\n      </div>`,\n      submitText: 'Simpan pengeluaran',\n      onSubmit: async (values) => {\n        await API.post('/expenses', values);\n        UI.toast(values.PaymentStatus === 'Paid' ? 'Pengeluaran dibayar dan dicatat di ledger.' : 'Pengeluaran dicatat sebagai pending.');\n        refresh();\n      },\n    });\n  }\n\n  function openCancel(row) {\n    UI.formModal({\n      title: `Batalkan ${row.ExpenseID}`,\n      subtitle: 'Jika sudah dibayar, sistem membuat jurnal pembalik.',\n      body: `<div class=\"notice warn\">${UI.esc(row.Description)} &middot; ${UI.currency(row.TotalAmount)}</div>\n        <label class=\"field mt-16\"><span>Alasan pembatalan <em>*</em></span><textarea name=\"reason\" required></textarea></label>`,\n      submitText: 'Batalkan pengeluaran',\n      danger: true,\n      onSubmit: async (values) => {\n        await API.post(`/expenses/${row.ExpenseID}/cancel`, values);\n        UI.toast('Pengeluaran dibatalkan.');\n        refresh();\n      },\n    });\n  }\n});\n\n</script>\n  <script>\n'use strict';\n\nasync function renderFinance(container, initialTab) {\n  const canTransactions = App.can('transactions', 'read');\n  const canDeposits = App.can('deposits', 'read');\n  const state = {\n    tab: initialTab === 'deposits' ? (canDeposits ? 'deposits' : 'transactions') : initialTab === 'transactions' ? (canTransactions ? 'transactions' : 'deposits') : (canTransactions ? 'transactions' : 'deposits'),\n    from: UI.monthStartISO(),\n    to: UI.monthEndISO(),\n    transactions: [],\n    deposits: [],\n  };\n  UI.loading(container);\n  try {\n    await load();\n  } catch (error) { UI.pageError(container, error); }\n\n  async function load() {\n    const tasks = [state.tab === 'transactions' ? API.get('/transactions', { from: state.from, to: state.to }) : Promise.resolve(state.transactions)];\n    if (canDeposits) {\n      tasks.push(API.get('/deposits'));\n    } else {\n      tasks.push(Promise.resolve([]));\n    }\n    const [transactions, deposits] = await Promise.all(tasks);\n    state.transactions = transactions;\n    state.deposits = deposits;\n    render();\n  }\n\n  function render() {\n    const confirmed = state.transactions.filter((t) => t.PaymentStatus !== 'Voided' && t.PaymentStatus !== 'Cancelled');\n    const inflow = confirmed.filter((t) => t.Direction === 'IN').reduce((s, t) => s + Number(t.Amount), 0);\n    const outflow = confirmed.filter((t) => t.Direction === 'OUT').reduce((s, t) => s + Number(t.Amount), 0);\n    const held = state.deposits.filter((d) => ['Held', 'Partially Returned'].includes(d.DepositStatus));\n    const heldTotal = held.reduce((s, d) => s + Number(d.OutstandingDepositLiability), 0);\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Kas & Deposit</h1><p>Ledger transaksi operasional dan kewajiban deposit penghuni. Transaksi void tetap tersimpan dengan jurnal pembalik.</p></div>\n        <div class=\"page-actions\">\n          <div class=\"range-picker\"><label class=\"field inline\"><span>Dari</span><input type=\"date\" id=\"fin-from\" value=\"${state.from}\"></label><label class=\"field inline\"><span>Sampai</span><input type=\"date\" id=\"fin-to\" value=\"${state.to}\"></label><button class=\"btn btn-sm\" type=\"button\" id=\"fin-apply\">Terapkan</button></div>\n        </div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Kas masuk</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(inflow)}</div><div class=\"stat-foot\">Periode terpilih</div></div>\n        <div class=\"stat-card red\"><div class=\"stat-label\">Kas keluar</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(outflow)}</div><div class=\"stat-foot\">Periode terpilih</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Arus kas bersih</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(inflow - outflow)}</div><div class=\"stat-foot\">Masuk dikurangi keluar</div></div>\n        <div class=\"stat-card ${heldTotal ? 'amber' : ''}\"><div class=\"stat-label\">Kewajiban deposit</div><div class=\"stat-value\" style=\"font-size:20px\">${UI.currency(heldTotal)}</div><div class=\"stat-foot\">${held.length} deposit ditahan</div></div>\n      </div>\n      <div class=\"tabs mt-16\">\n        ${canTransactions ? `<button class=\"tab ${state.tab === 'transactions' ? 'active' : ''}\" type=\"button\" data-tab=\"transactions\">Transaksi</button>` : ''}\n        ${canDeposits ? `<button class=\"tab ${state.tab === 'deposits' ? 'active' : ''}\" type=\"button\" data-tab=\"deposits\">Deposit</button>` : ''}\n      </div>\n      <div id=\"finance-content\"></div>\n    `;\n    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {\n      state.tab = button.dataset.tab;\n      UI.loading(container);\n      try { await load(); } catch (error) { UI.pageError(container, error); }\n    }));\n    const apply = container.querySelector('#fin-apply');\n    if (apply) apply.addEventListener('click', async () => {\n      state.from = container.querySelector('#fin-from').value;\n      state.to = container.querySelector('#fin-to').value;\n      UI.loading(container);\n      try { await load(); } catch (error) { UI.pageError(container, error); }\n    });\n    if (state.tab === 'deposits') renderDeposits(); else renderTransactions();\n  }\n\n  function renderTransactions() {\n    const host = document.createElement('div');\n    container.querySelector('#finance-content').appendChild(host);\n    UI.table(host, {\n      rows: state.transactions,\n      searchKeys: ['TransactionID', 'Description', 'TransactionType', 'TenantName', 'ReferenceID'],\n      searchPlaceholder: 'Cari transaksi, referensi, penghuni...',\n      exportName: 'ledger-transaksi',\n      rowKey: (row) => row.TransactionID,\n      defaultSort: 'TransactionDate',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'TransactionDate', label: 'Tanggal', render: (row) => `${UI.date(row.TransactionDate)}<span class=\"sub\">${UI.esc(row.TransactionID)}</span>` },\n        { key: 'Description', label: 'Transaksi', render: (row) => `<strong>${UI.esc(row.Description)}</strong><span class=\"sub\">${UI.esc(row.TransactionType)} &middot; ${UI.esc(row.Category)}</span>` },\n        { key: 'TenantName', label: 'Penghuni', render: (row) => row.TenantName ? UI.esc(row.TenantName) : '-' },\n        { key: 'Direction', label: 'Arah', render: (row) => UI.directionBadge(row.Direction) },\n        { key: 'Amount', label: 'Jumlah', className: 'numeric', render: (row) => `<strong>${UI.currency(row.Amount)}</strong>` },\n        { key: 'PaymentMethod', label: 'Metode' },\n        { key: 'PaymentStatus', label: 'Status', render: (row) => UI.badge(row.PaymentStatus) },\n      ],\n    });\n  }\n\n  function renderDeposits() {\n    const host = document.createElement('div');\n    container.querySelector('#finance-content').appendChild(host);\n    UI.table(host, {\n      rows: state.deposits,\n      searchKeys: ['DepositRecordID', 'TenantName', 'RoomNumber', 'DepositType'],\n      searchPlaceholder: 'Cari deposit, penghuni, kamar...',\n      exportName: 'deposit',\n      rowKey: (row) => row.DepositRecordID,\n      defaultSort: 'CreatedAt',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'DepositRecordID', label: 'Deposit', render: (row) => `<strong>${UI.esc(row.DepositRecordID)}</strong><span class=\"sub\">${UI.esc(row.DepositType)}</span>` },\n        { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.RoomNumber || '-') },\n        { key: 'DepositAmount', label: 'Diterima', className: 'numeric', render: (row) => UI.currency(row.DepositAmount) },\n        { key: 'AmountDeducted', label: 'Potongan', className: 'numeric', render: (row) => UI.currency(row.AmountDeducted) },\n        { key: 'AmountReturned', label: 'Dikembalikan', className: 'numeric', render: (row) => UI.currency(row.AmountReturned) },\n        { key: 'OutstandingDepositLiability', label: 'Sisa kewajiban', className: 'numeric', render: (row) => `<strong>${UI.currency(row.OutstandingDepositLiability)}</strong>` },\n        { key: 'DepositStatus', label: 'Status', render: (row) => UI.badge(row.DepositStatus) },\n        { key: 'actions', label: '', sortable: false, render: (row) => App.can('deposits', 'write') && ['Held', 'Partially Returned'].includes(row.DepositStatus) ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"return\">Kembalikan</button>' : '' },\n      ],\n      onAction: (action, row) => { if (action === 'return') openReturn(row); },\n    });\n  }\n\n  function openReturn(deposit) {\n    UI.formModal({\n      title: `Pengembalian ${deposit.DepositRecordID}`,\n      subtitle: `${deposit.TenantName} &middot; sisa kewajiban ${UI.currency(deposit.OutstandingDepositLiability)}`,\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Jumlah dikembalikan (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"AmountReturned\" value=\"${deposit.OutstandingDepositLiability}\"></label>\n        <label class=\"field\"><span>Potongan (Rp)</span><input type=\"number\" min=\"0\" step=\"1000\" name=\"AmountDeducted\" value=\"0\"></label>\n        <label class=\"field\"><span>Tanggal pengembalian</span><input type=\"date\" name=\"ReturnDate\" value=\"${UI.todayISO()}\"></label>\n        <label class=\"field\"><span>Metode</span><select name=\"ReturnMethod\"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>\n        <label class=\"field full\"><span>Catatan / alasan potongan</span><textarea name=\"Notes\" placeholder=\"Kerusakan, tunggakan, dll.\"></textarea></label>\n      </div>\n      <div class=\"notice mt-16\">Potongan tidak mengurangi kas keluar. Pengembalian tunai dicatat sebagai transaksi keluar.</div>`,\n      submitText: 'Proses pengembalian',\n      onSubmit: async (values) => {\n        await API.post('/deposits/return', { ...values, DepositRecordID: deposit.DepositRecordID });\n        UI.toast('Pengembalian deposit tercatat.');\n        state.deposits = await API.get('/deposits');\n        render();\n      },\n    });\n  }\n}\n\nApp.registerPage('finance', (container) => renderFinance(container, 'auto'));\nApp.registerPage('transactions', (container) => renderFinance(container, 'transactions'));\nApp.registerPage('deposits', (container) => renderFinance(container, 'deposits'));\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('staff', (container) => renderTeam(container, 'staff'));\nApp.registerPage('users', (container) => renderTeam(container, 'users'));\nApp.registerPage('activities', (container) => renderTeam(container, 'activities'));\n\nasync function renderTeam(container, initialTab) {\n  const ROLES = ['Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff'];\n  const state = {\n    tab: initialTab,\n    staff: [],\n    users: [],\n    activities: [],\n    loaded: false,\n  };\n  if (!App.can('staff', 'read') && !App.can('users', 'read') && !App.can('activities', 'read')) {\n    UI.pageError(container, new Error('Anda tidak memiliki akses ke halaman ini.'));\n    return;\n  }\n  if (!App.can('staff', 'read') && state.tab === 'staff') state.tab = 'activities';\n  if (!App.can('users', 'read') && state.tab === 'users') state.tab = 'activities';\n\n  UI.loading(container);\n  try {\n    await load();\n  } catch (error) { UI.pageError(container, error); }\n\n  async function load() {\n    const [staff, users, activities] = await Promise.all([\n      App.can('staff', 'read') ? API.get('/staff') : Promise.resolve([]),\n      App.can('users', 'read') ? API.get('/users') : Promise.resolve([]),\n      App.can('activities', 'read') ? API.get('/activities') : Promise.resolve([]),\n    ]);\n    state.staff = staff;\n    state.users = users;\n    state.activities = activities;\n    render();\n  }\n\n  function render() {\n    const activeStaff = state.staff.filter((s) => s.EmploymentStatus === 'Active');\n    const openTasks = state.activities.filter((a) => ['Pending', 'In Progress'].includes(a.Status));\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Tim & Tugas Operasional</h1><p>Kelola staf, akun login dengan peran terbatas, dan tugas kebersihan atau perawatan kamar.</p></div>\n        <div class=\"page-actions\">\n          ${state.tab === 'activities' && App.can('activities', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-task\">Buat tugas</button>' : ''}\n          ${state.tab === 'staff' && App.can('staff', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-staff\">Tambah staf</button>' : ''}\n          ${state.tab === 'users' && App.can('users', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-user\">Tambah akun</button>' : ''}\n        </div>\n      </div>\n      <div class=\"grid grid-4\">\n        <div class=\"stat-card\"><div class=\"stat-label\">Staf aktif</div><div class=\"stat-value\">${activeStaff.length}</div><div class=\"stat-foot\">${state.staff.length} total staf</div></div>\n        <div class=\"stat-card blue\"><div class=\"stat-label\">Akun login</div><div class=\"stat-value\">${state.users.filter((u) => u.IsActive === 'TRUE').length}</div><div class=\"stat-foot\">${state.users.length} akun terdaftar</div></div>\n        <div class=\"stat-card ${openTasks.length ? 'amber' : ''}\"><div class=\"stat-label\">Tugas terbuka</div><div class=\"stat-value\">${openTasks.length}</div><div class=\"stat-foot\">${state.activities.filter((a) => a.Status === 'Pending').length} belum dimulai</div></div>\n        <div class=\"stat-card\"><div class=\"stat-label\">Selesai</div><div class=\"stat-value\">${state.activities.filter((a) => a.Status === 'Completed').length}</div><div class=\"stat-foot\">Sepanjang catatan</div></div>\n      </div>\n      <div class=\"tabs mt-16\">\n        ${App.can('staff', 'read') ? `<button class=\"tab ${state.tab === 'staff' ? 'active' : ''}\" type=\"button\" data-tab=\"staff\">Staf</button>` : ''}\n        ${App.can('users', 'read') ? `<button class=\"tab ${state.tab === 'users' ? 'active' : ''}\" type=\"button\" data-tab=\"users\">Akun & Peran</button>` : ''}\n        ${App.can('activities', 'read') ? `<button class=\"tab ${state.tab === 'activities' ? 'active' : ''}\" type=\"button\" data-tab=\"activities\">Tugas</button>` : ''}\n      </div>\n      <div id=\"team-content\"></div>\n    `;\n    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; render(); }));\n    if (state.tab === 'staff') renderStaff();\n    else if (state.tab === 'users') renderUsers();\n    else renderActivities();\n    const addStaff = container.querySelector('#new-staff');\n    if (addStaff) addStaff.addEventListener('click', () => openStaffForm(null));\n    const addUser = container.querySelector('#new-user');\n    if (addUser) addUser.addEventListener('click', openUserForm);\n    const addTask = container.querySelector('#new-task');\n    if (addTask) addTask.addEventListener('click', openTaskForm);\n  }\n\n  function renderStaff() {\n    const host = document.createElement('div');\n    container.querySelector('#team-content').appendChild(host);\n    UI.table(host, {\n      rows: state.staff,\n      searchKeys: ['FullName', 'Position', 'Phone', 'Email', 'AppRole'],\n      searchPlaceholder: 'Cari staf, posisi, telepon...',\n      exportName: 'staf',\n      rowKey: (row) => row.StaffID,\n      columns: [\n        { key: 'FullName', label: 'Staf', render: (row) => `${UI.cellUser(row.FullName, row.StaffID)}` },\n        { key: 'Position', label: 'Posisi', render: (row) => `${UI.esc(row.Position || '-')}<span class=\"sub\">${UI.esc(row.AppRole)}</span>` },\n        { key: 'Phone', label: 'Kontak', render: (row) => `${UI.esc(row.Phone || '-')}<span class=\"sub\">${UI.esc(row.Email || '')}</span>` },\n        { key: 'StartDate', label: 'Mulai', render: (row) => UI.date(row.StartDate) },\n        { key: 'LoginEmail', label: 'Akun', render: (row) => row.LoginEmail ? `${UI.esc(row.LoginEmail)}<span class=\"sub\">${UI.esc(row.LoginRole)}</span>` : '<span class=\"muted\">Belum ada akun</span>' },\n        { key: 'EmploymentStatus', label: 'Status', render: (row) => UI.badge(row.EmploymentStatus) },\n        { key: 'actions', label: '', sortable: false, render: () => App.can('staff', 'write') ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>' : '' },\n      ],\n      onAction: (action, row) => { if (action === 'edit') openStaffForm(row); },\n    });\n  }\n\n  function renderUsers() {\n    const host = document.createElement('div');\n    container.querySelector('#team-content').appendChild(host);\n    UI.table(host, {\n      rows: state.users,\n      searchKeys: ['FullName', 'Email', 'Role'],\n      searchPlaceholder: 'Cari nama, email, peran...',\n      exportName: 'akun-pengguna',\n      rowKey: (row) => row.UserID,\n      columns: [\n        { key: 'FullName', label: 'Pengguna', render: (row) => UI.cellUser(row.FullName, row.Email) },\n        { key: 'Role', label: 'Peran', render: (row) => `<span class=\"badge blue\">${UI.esc(row.Role)}</span>` },\n        { key: 'IsActive', label: 'Status', render: (row) => UI.badge(row.IsActive === 'TRUE' ? 'Active' : 'Inactive') },\n        { key: 'CreatedAt', label: 'Dibuat', render: (row) => UI.dateTime(row.CreatedAt) },\n        { key: 'actions', label: '', sortable: false, render: () => App.can('users', 'write') ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>' : '' },\n      ],\n      onAction: (action, row) => { if (action === 'edit') openUserEdit(row); },\n    });\n  }\n\n  function renderActivities() {\n    const host = document.createElement('div');\n    container.querySelector('#team-content').appendChild(host);\n    UI.table(host, {\n      rows: state.activities,\n      searchKeys: ['ActivityID', 'Description', 'StaffName', 'RoomNumber', 'Category'],\n      searchPlaceholder: 'Cari tugas, staf, kamar...',\n      exportName: 'tugas-operasional',\n      rowKey: (row) => row.ActivityID,\n      defaultSort: 'DueDate',\n      defaultSortDir: 'asc',\n      columns: [\n        { key: 'ActivityDate', label: 'Tanggal', render: (row) => `${UI.date(row.ActivityDate)}<span class=\"sub\">${UI.esc(row.ActivityID)}</span>` },\n        { key: 'Description', label: 'Tugas', render: (row) => `<strong>${UI.esc(row.Description)}</strong><span class=\"sub\">${UI.esc(row.Category)}${row.RoomNumber ? ` &middot; ${UI.esc(row.RoomNumber)}` : ''}${row.Priority !== 'Normal' ? ` &middot; ${UI.esc(row.Priority)}` : ''}</span>` },\n        { key: 'StaffName', label: 'Petugas', render: (row) => UI.esc(row.StaffName) },\n        { key: 'DueDate', label: 'Batas', render: (row) => UI.date(row.DueDate) },\n        { key: 'Status', label: 'Status', render: (row) => UI.badge(row.Status) },\n        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => {\n          if (!App.can('activities', 'write')) return '';\n          const buttons = [];\n          if (row.Status === 'Pending') buttons.push('<button class=\"btn btn-sm\" type=\"button\" data-act=\"start\">Mulai</button>');\n          if (['Pending', 'In Progress'].includes(row.Status)) buttons.push('<button class=\"btn btn-sm btn-primary\" type=\"button\" data-act=\"complete\">Selesai</button>');\n          if (row.Status === 'Pending') buttons.push('<button class=\"btn btn-sm btn-danger\" type=\"button\" data-act=\"cancel\">Batal</button>');\n          return `<div class=\"btn-group\">${buttons.join('')}</div>`;\n        } },\n      ],\n      onAction: async (action, row) => {\n        const statusMap = { start: 'In Progress', complete: 'Completed', cancel: 'Cancelled' };\n        if (!statusMap[action]) return;\n        if (action === 'cancel') {\n          const ok = await UI.confirmDialog({ title: 'Batalkan tugas', message: `Tugas \"${row.Description}\" akan dibatalkan.`, confirmText: 'Batalkan tugas', danger: true });\n          if (!ok) return;\n        }\n        try {\n          await API.post(`/activities/${row.ActivityID}`, { Status: statusMap[action] });\n          UI.toast(action === 'complete' ? 'Tugas ditandai selesai.' : 'Status tugas diperbarui.');\n          state.activities = await API.get('/activities');\n          render();\n        } catch (error) { UI.toast(error.message, 'error'); }\n      },\n    });\n  }\n\n  function openStaffForm(staff) {\n    const isEdit = !!staff;\n    UI.formModal({\n      title: isEdit ? `Ubah ${staff.FullName}` : 'Tambah staf',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Nama lengkap <em>*</em></span><input name=\"FullName\" required value=\"${UI.esc(staff ? staff.FullName : '')}\"></label>\n        <label class=\"field\"><span>Posisi</span><input name=\"Position\" value=\"${UI.esc(staff ? staff.Position : '')}\" placeholder=\"Resepsionis, Teknisi...\"></label>\n        <label class=\"field\"><span>Telepon</span><input name=\"Phone\" value=\"${UI.esc(staff ? staff.Phone : '')}\"></label>\n        <label class=\"field\"><span>Email</span><input type=\"email\" name=\"Email\" value=\"${UI.esc(staff ? staff.Email : '')}\"></label>\n        <label class=\"field\"><span>Peran aplikasi <em>*</em></span><select name=\"AppRole\" required>${ROLES.map((role) => `<option ${staff && staff.AppRole === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Status kepegawaian</span><select name=\"EmploymentStatus\">${['Active', 'Inactive', 'Resigned'].map((status) => `<option ${staff && staff.EmploymentStatus === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Tanggal mulai</span><input type=\"date\" name=\"StartDate\" value=\"${UI.esc(staff ? staff.StartDate : UI.todayISO())}\"></label>\n        <label class=\"field\"><span>Tanggal selesai</span><input type=\"date\" name=\"EndDate\" value=\"${UI.esc(staff ? staff.EndDate : '')}\"></label>\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\">${UI.esc(staff ? staff.Notes : '')}</textarea></label>\n      </div>`,\n      submitText: isEdit ? 'Simpan perubahan' : 'Tambah staf',\n      onSubmit: async (values) => {\n        if (isEdit) values.StaffID = staff.StaffID;\n        await API.post('/staff', values);\n        UI.toast(isEdit ? 'Data staf diperbarui.' : 'Staf ditambahkan.');\n        state.staff = await API.get('/staff');\n        state.users = App.can('users', 'read') ? await API.get('/users') : state.users;\n        render();\n      },\n    });\n  }\n\n  function openUserForm() {\n    const available = state.staff.filter((s) => !s.LoginEmail && s.EmploymentStatus !== 'Resigned');\n    if (!available.length) { UI.toast('Semua staf sudah memiliki akun atau belum ada staf baru.', 'error'); return; }\n    UI.formModal({\n      title: 'Tambah akun login',\n      subtitle: 'Setiap akun terhubung ke satu data staf dan peran akses.',\n      body: `<div class=\"form-grid\">\n        <label class=\"field full\"><span>Staf <em>*</em></span><select name=\"StaffID\" required>${available.map((s) => `<option value=\"${s.StaffID}\">${UI.esc(s.FullName)} &middot; ${UI.esc(s.Position || s.AppRole)}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Email <em>*</em></span><input type=\"email\" name=\"Email\" required placeholder=\"nama@kos.id\"></label>\n        <label class=\"field\"><span>Password <em>*</em></span><input type=\"password\" name=\"Password\" required minlength=\"6\" placeholder=\"Minimal 6 karakter\"></label>\n        <label class=\"field\"><span>Peran <em>*</em></span><select name=\"Role\" required>${ROLES.map((role) => `<option>${role}</option>`).join('')}</select></label>\n      </div>`,\n      submitText: 'Buat akun',\n      onSubmit: async (values) => {\n        await API.post('/users', values);\n        UI.toast('Akun login dibuat.');\n        state.users = await API.get('/users');\n        state.staff = App.can('staff', 'read') ? await API.get('/staff') : state.staff;\n        render();\n      },\n    });\n  }\n\n  function openUserEdit(user) {\n    UI.formModal({\n      title: `Ubah akun ${user.FullName}`,\n      subtitle: user.Email,\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Email <em>*</em></span><input type=\"email\" name=\"Email\" required value=\"${UI.esc(user.Email)}\"></label>\n        <label class=\"field\"><span>Peran <em>*</em></span><select name=\"Role\" required>${ROLES.map((role) => `<option ${user.Role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Status</span><select name=\"IsActive\"><option value=\"TRUE\" ${user.IsActive === 'TRUE' ? 'selected' : ''}>Aktif</option><option value=\"FALSE\" ${user.IsActive === 'FALSE' ? 'selected' : ''}>Nonaktif</option></select></label>\n        <label class=\"field\"><span>Password baru</span><input type=\"password\" name=\"Password\" minlength=\"6\" placeholder=\"Kosongkan jika tidak diubah\"></label>\n      </div>`,\n      submitText: 'Simpan akun',\n      onSubmit: async (values) => {\n        values.UserID = user.UserID;\n        if (!values.Password) delete values.Password;\n        await API.post('/users', values);\n        UI.toast('Akun diperbarui.');\n        state.users = await API.get('/users');\n        render();\n      },\n    });\n  }\n\n  function openTaskForm() {\n    const canAssign = App.can('staff', 'read') && state.staff.length;\n    UI.formModal({\n      title: 'Buat tugas operasional',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        ${canAssign ? `<label class=\"field full\"><span>Petugas <em>*</em></span><select name=\"StaffID\" required>${state.staff.filter((s) => s.EmploymentStatus === 'Active').map((s) => `<option value=\"${s.StaffID}\">${UI.esc(s.FullName)} &middot; ${UI.esc(s.Position || s.AppRole)}</option>`).join('')}</select></label>` : `<input type=\"hidden\" name=\"StaffID\" value=\"${App.user.StaffID}\">`}\n        <label class=\"field\"><span>Kategori <em>*</em></span><select name=\"Category\" required>${['Cleaning', 'Maintenance', 'Inspection', 'Security', 'Administration', 'Other'].map((cat) => `<option>${cat}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Prioritas</span><select name=\"Priority\"><option>Low</option><option selected>Normal</option><option>High</option><option>Urgent</option></select></label>\n        <label class=\"field\"><span>Kamar</span><select name=\"RoomID\"><option value=\"\">Tanpa kamar</option>${(App.meta.rooms || []).map((room) => `<option value=\"${room.RoomID}\">${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Tanggal tugas</span><input type=\"date\" name=\"ActivityDate\" value=\"${UI.todayISO()}\"></label>\n        <label class=\"field\"><span>Batas waktu</span><input type=\"date\" name=\"DueDate\" value=\"${UI.todayISO()}\"></label>\n        <label class=\"field full\"><span>Deskripsi tugas <em>*</em></span><textarea name=\"Description\" required placeholder=\"Contoh: bersihkan kamar 08 setelah check-out\"></textarea></label>\n      </div>`,\n      submitText: 'Buat tugas',\n      onSubmit: async (values) => {\n        await API.post('/activities', values);\n        UI.toast('Tugas dibuat.');\n        state.activities = await API.get('/activities');\n        state.tab = 'activities';\n        render();\n      },\n    });\n  }\n}\n\n</script>\n  <script>\n'use strict';\n\nApp.registerPage('reports', async (container) => {\n  const state = {\n    tab: 'financial',\n    from: UI.monthStartISO(),\n    to: UI.monthEndISO(),\n    date: UI.todayISO(),\n    tenantId: '',\n    tenants: [],\n    data: null,\n  };\n  UI.loading(container);\n  try {\n    if (App.can('tenants', 'read')) state.tenants = await API.get('/tenants');\n    state.tenantId = (state.tenants.find((t) => t.TenantStatus === 'Active') || state.tenants[0] || {}).TenantID || '';\n    await load();\n  } catch (error) { UI.pageError(container, error); }\n\n  async function load() {\n    if (state.tab === 'financial') state.data = await API.get('/reports/financial', { from: state.from, to: state.to });\n    else if (state.tab === 'daily') state.data = await API.get('/reports/daily', { date: state.date });\n    else if (state.tab === 'occupancy') state.data = await API.get('/reports/occupancy', { from: state.from, to: state.to });\n    else if (state.tab === 'statement') {\n      if (!state.tenantId) { state.data = null; }\n      else state.data = await API.get('/reports/statement', { tenantId: state.tenantId, from: state.from, to: state.to });\n    } else if (state.tab === 'reconcile') state.data = await API.get('/reports/reconcile');\n    render();\n  }\n\n  function render() {\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Laporan</h1><p>Laporan keuangan, harian, hunian, kartu penghuni, dan pemeriksaan konsistensi pembukuan.</p></div>\n        <div class=\"page-actions\"><button class=\"btn\" type=\"button\" id=\"print-report\">Cetak laporan</button></div>\n      </div>\n      <div class=\"tabs\">\n        ${tabButton('financial', 'Keuangan')}\n        ${tabButton('daily', 'Harian')}\n        ${tabButton('occupancy', 'Hunian')}\n        ${tabButton('statement', 'Kartu Penghuni')}\n        ${tabButton('reconcile', 'Rekonsiliasi')}\n      </div>\n      <div class=\"card mt-16 filter-bar\" id=\"report-filters\"></div>\n      <div id=\"report-content\" class=\"mt-16\"></div>\n    `;\n    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {\n      state.tab = button.dataset.tab;\n      UI.loading(container.querySelector('#report-content'));\n      try { await load(); } catch (error) { UI.pageError(container.querySelector('#report-content'), error); }\n    }));\n    const print = container.querySelector('#print-report');\n    if (print) print.addEventListener('click', printReport);\n    renderFilters();\n    renderContent();\n  }\n\n  function tabButton(key, label) {\n    return `<button class=\"tab ${state.tab === key ? 'active' : ''}\" type=\"button\" data-tab=\"${key}\">${label}</button>`;\n  }\n\n  function renderFilters() {\n    const host = container.querySelector('#report-filters');\n    if (state.tab === 'daily') {\n      host.innerHTML = `<div class=\"flex flex-wrap\" style=\"align-items:flex-end;gap:12px\"><label class=\"field inline\"><span>Tanggal laporan</span><input type=\"date\" id=\"report-date\" value=\"${state.date}\"></label><button class=\"btn btn-sm btn-primary\" type=\"button\" id=\"apply-filter\">Tampilkan</button></div>`;\n    } else if (state.tab === 'statement') {\n      host.innerHTML = `<div class=\"flex flex-wrap\" style=\"align-items:flex-end;gap:12px\">\n        <label class=\"field inline\"><span>Penghuni</span><select id=\"report-tenant\">${state.tenants.map((t) => `<option value=\"${t.TenantID}\" ${t.TenantID === state.tenantId ? 'selected' : ''}>${UI.esc(t.FullName)} &middot; ${UI.esc(t.RoomNumber || 'tanpa kamar')}</option>`).join('')}</select></label>\n        <label class=\"field inline\"><span>Dari</span><input type=\"date\" id=\"report-from\" value=\"${state.from}\"></label>\n        <label class=\"field inline\"><span>Sampai</span><input type=\"date\" id=\"report-to\" value=\"${state.to}\"></label>\n        <button class=\"btn btn-sm btn-primary\" type=\"button\" id=\"apply-filter\">Tampilkan</button>\n      </div>`;\n    } else if (state.tab === 'reconcile') {\n      host.innerHTML = `<div class=\"flex\" style=\"justify-content:space-between;align-items:center;gap:12px\"><span class=\"small muted\">Pemeriksaan dijalankan terhadap saldo invoice, alokasi pembayaran, kredit, dan deposit.</span><button class=\"btn btn-sm btn-primary\" type=\"button\" id=\"apply-filter\">Periksa ulang</button></div>`;\n    } else {\n      host.innerHTML = `<div class=\"flex flex-wrap\" style=\"align-items:flex-end;gap:12px\">\n        <label class=\"field inline\"><span>Dari</span><input type=\"date\" id=\"report-from\" value=\"${state.from}\"></label>\n        <label class=\"field inline\"><span>Sampai</span><input type=\"date\" id=\"report-to\" value=\"${state.to}\"></label>\n        <button class=\"btn btn-sm btn-primary\" type=\"button\" id=\"apply-filter\">Tampilkan</button>\n        <button class=\"btn btn-sm\" type=\"button\" data-preset=\"month\">Bulan ini</button>\n        <button class=\"btn btn-sm\" type=\"button\" data-preset=\"last\">Bulan lalu</button>\n      </div>`;\n    }\n    const apply = host.querySelector('#apply-filter');\n    if (apply) apply.addEventListener('click', async () => {\n      if (state.tab === 'daily') state.date = host.querySelector('#report-date').value;\n      else if (state.tab === 'statement') {\n        state.tenantId = host.querySelector('#report-tenant').value;\n        state.from = host.querySelector('#report-from').value;\n        state.to = host.querySelector('#report-to').value;\n      } else if (state.tab !== 'reconcile') {\n        state.from = host.querySelector('#report-from').value;\n        state.to = host.querySelector('#report-to').value;\n      }\n      UI.loading(container.querySelector('#report-content'));\n      try { await load(); } catch (error) { UI.pageError(container.querySelector('#report-content'), error); }\n    });\n    host.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', async () => {\n      const offset = button.dataset.preset === 'last' ? -1 : 0;\n      state.from = UI.monthStartISO(offset);\n      state.to = UI.monthEndISO(offset);\n      UI.loading(container.querySelector('#report-content'));\n      try { await load(); } catch (error) { UI.pageError(container.querySelector('#report-content'), error); }\n    }));\n  }\n\n  function renderContent() {\n    const host = container.querySelector('#report-content');\n    if (!host) return;\n    if (state.tab === 'financial') renderFinancial(host);\n    else if (state.tab === 'daily') renderDaily(host);\n    else if (state.tab === 'occupancy') renderOccupancy(host);\n    else if (state.tab === 'statement') renderStatement(host);\n    else renderReconcile(host);\n  }\n\n  function summaryCard(label, value, foot, tone = '') {\n    return `<div class=\"stat-card ${tone}\"><div class=\"stat-label\">${UI.esc(label)}</div><div class=\"stat-value\" style=\"font-size:20px\">${value}</div><div class=\"stat-foot\">${foot || ''}</div></div>`;\n  }\n\n  function breakdown(title, entries, tone = '') {\n    const total = Object.values(entries).reduce((s, v) => s + Number(v), 0);\n    const rows = Object.entries(entries).sort((a, b) => b[1] - a[1]);\n    return `<div class=\"card\"><div class=\"card-head\"><h3>${UI.esc(title)}</h3><span class=\"small muted\">${UI.currency(total)}</span></div><div class=\"card-body\">\n      ${rows.length ? rows.map(([label, value]) => `<div class=\"report-row\"><span>${UI.esc(label)}</span><span class=\"numeric\">${UI.currency(value)}</span><div class=\"progress\"><span style=\"width:${total ? (value / total) * 100 : 0}%\" class=\"${tone}\"></span></div></div>`).join('') : '<div class=\"notice\">Belum ada data pada periode ini.</div>'}\n    </div></div>`;\n  }\n\n  function renderFinancial(host) {\n    const d = state.data;\n    const s = d.summary;\n    const receivables = d.receivableByTenant.slice(0, 8);\n    host.innerHTML = `\n      <div class=\"grid grid-4\">\n        ${summaryCard('Invoice diterbitkan', UI.currency(s.invoiceTotal), `${s.invoicesIssued} invoice`)}\n        ${summaryCard('Penerimaan pembayaran', UI.currency(s.paymentsReceived), `${s.paymentCount} kuitansi`, 'blue')}\n        ${summaryCard('Pengeluaran dibayar', UI.currency(s.expensesPaid), `${s.expenseCount} transaksi`, 'amber')}\n        ${summaryCard('Arus kas bersih', UI.currency(s.netCashFlow), `Masuk ${UI.currency(s.cashIn)} &middot; keluar ${UI.currency(s.cashOut)}`, s.netCashFlow < 0 ? 'red' : '')}\n      </div>\n      <div class=\"grid grid-2 mt-16\">\n        ${breakdown('Pendapatan per tipe kamar', d.revenueByRoomType)}\n        ${breakdown('Pengeluaran per kategori', d.expenseByCategory, 'amber')}\n      </div>\n      <div class=\"grid grid-2 mt-16\">\n        <div class=\"card\"><div class=\"card-head\"><h3>Piutang per penghuni</h3><span class=\"small muted\">Total ${UI.currency(s.outstandingReceivables)}</span></div>\n          <div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Penghuni</th><th class=\"numeric\">Invoice terbuka</th><th class=\"numeric\">Piutang</th><th class=\"numeric\">Jatuh tempo</th></tr></thead><tbody>\n          ${receivables.length ? receivables.map((r) => `<tr><td>${UI.esc(r.TenantName)}</td><td class=\"numeric\">${r.InvoiceCount}</td><td class=\"numeric strong\">${UI.currency(r.Outstanding)}</td><td class=\"numeric\" style=\"color:#b42318\">${UI.currency(r.Overdue)}</td></tr>`).join('') : `<tr><td colspan=\"4\">${UI.emptyState('Tidak ada piutang', 'Semua invoice pada periode ini sudah lunas.')}</td></tr>`}\n          </tbody></table></div>\n        </div>\n        <div class=\"card\"><div class=\"card-head\"><h3>Ringkasan kewajiban</h3></div><div class=\"card-body\">\n          <div class=\"report-row\"><span>Deposit ditahan</span><span class=\"numeric\">${UI.currency(s.depositLiabilities)}</span></div>\n          <div class=\"report-row\"><span>Total piutang berjalan</span><span class=\"numeric\">${UI.currency(s.outstandingReceivables)}</span></div>\n          <div class=\"report-row\"><span>Piutang jatuh tempo</span><span class=\"numeric\" style=\"color:#b42318\">${UI.currency(s.overdueAmount)}</span></div>\n          <div class=\"report-row\"><span>Pendapatan sewa</span><span class=\"numeric\">${UI.currency(s.rentalInvoiced)}</span></div>\n          <div class=\"report-row\"><span>Pendapatan layanan</span><span class=\"numeric\">${UI.currency(s.serviceInvoiced)}</span></div>\n        </div></div>\n      </div>`;\n  }\n\n  function renderDaily(host) {\n    const d = state.data;\n    host.innerHTML = `\n      <div class=\"grid grid-3\">\n        ${summaryCard('Penerimaan', UI.currency(d.summary.paymentTotal), `${d.payments.length} pembayaran`)}\n        ${summaryCard('Pengeluaran', UI.currency(d.summary.expenseTotal), `${d.expenses.length} pengeluaran`, 'amber')}\n        ${summaryCard('Kas bersih', UI.currency(d.summary.net), `Masuk ${UI.currency(d.summary.cashIn)} &middot; keluar ${UI.currency(d.summary.cashOut)}`, d.summary.net < 0 ? 'red' : 'blue')}\n      </div>\n      <div class=\"grid grid-2 mt-16\">\n        <div class=\"card\"><div class=\"card-head\"><h3>Pembayaran ${UI.date(d.date)}</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Kuitansi</th><th>Penghuni</th><th>Metode</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>\n          ${d.payments.length ? d.payments.map((p) => `<tr><td class=\"strong\">${UI.esc(p.ReceiptNumber)}</td><td>${UI.esc(p.TenantName)}</td><td>${UI.esc(p.PaymentMethod)}</td><td class=\"numeric\">${UI.currency(p.AmountReceived)}</td></tr>`).join('') : `<tr><td colspan=\"4\">${UI.emptyState('Tidak ada pembayaran', 'Belum ada penerimaan pada tanggal ini.')}</td></tr>`}\n        </tbody></table></div></div>\n        <div class=\"card\"><div class=\"card-head\"><h3>Pengeluaran ${UI.date(d.date)}</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Deskripsi</th><th>Kategori</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>\n          ${d.expenses.length ? d.expenses.map((e) => `<tr><td class=\"strong\">${UI.esc(e.Description)}</td><td>${UI.esc(e.Category)}</td><td class=\"numeric\">${UI.currency(e.TotalAmount)}</td></tr>`).join('') : `<tr><td colspan=\"3\">${UI.emptyState('Tidak ada pengeluaran', 'Belum ada biaya dibayar pada tanggal ini.')}</td></tr>`}\n        </tbody></table></div></div>\n      </div>`;\n  }\n\n  function renderOccupancy(host) {\n    const d = state.data;\n    host.innerHTML = `\n      <div class=\"grid grid-4\">\n        ${summaryCard('Tingkat hunian', `${d.summary.occupancyRate}%`, `${d.summary.occupied} dari ${d.summary.activeRooms} kamar aktif`)}\n        ${summaryCard('Total kamar', d.summary.totalRooms, 'Seluruh kamar terdaftar', 'blue')}\n        ${summaryCard('Kamar aktif', d.summary.activeRooms, `${d.summary.totalRooms - d.summary.activeRooms} nonaktif`, 'purple')}\n        ${summaryCard('Terisi', d.summary.occupied, `${d.summary.activeRooms - d.summary.occupied} belum terisi`, 'amber')}\n      </div>\n      <div class=\"mt-16\" id=\"occupancy-table\"></div>`;\n    const tableHost = document.createElement('div');\n    host.querySelector('#occupancy-table').appendChild(tableHost);\n    UI.table(tableHost, {\n      rows: d.rooms,\n      searchKeys: ['RoomNumber', 'RoomTypeName', 'AvailabilityStatus'],\n      searchPlaceholder: 'Cari kamar, tipe, status...',\n      exportName: 'laporan-hunian',\n      rowKey: (row) => row.RoomID,\n      pageSize: 12,\n      columns: [\n        { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong><span class=\"sub\">${UI.esc(row.RoomTypeName || '')}</span>` },\n        { key: 'AvailabilityStatus', label: 'Status', render: (row) => UI.badge(row.AvailabilityStatus) },\n        { key: 'History', label: 'Penghuni / riwayat', render: (row) => row.History.length ? row.History.map((h) => `<div class=\"small\">${UI.esc(h.TenantName)} <span class=\"muted\">(${UI.date(h.CheckInDate)} - ${h.CheckOutDate ? UI.date(h.CheckOutDate) : 'sekarang'})</span></div>`).join('') : '<span class=\"muted\">Tidak ada hunian pada periode</span>' },\n        { key: 'InvoicesIssued', label: 'Invoice', className: 'numeric', render: (row) => UI.currency(row.InvoicesIssued) },\n        { key: 'RentCollected', label: 'Terkumpul', className: 'numeric', render: (row) => UI.currency(row.RentCollected) },\n      ],\n    });\n  }\n\n  function renderStatement(host) {\n    const d = state.data;\n    if (!d) { host.innerHTML = `<div class=\"card\">${UI.emptyState('Pilih penghuni', 'Belum ada penghuni yang dapat ditampilkan.')}</div>`; return; }\n    const invoiceRows = d.invoices.map((i) => `<tr><td class=\"strong\">${UI.esc(i.InvoiceNumber)}<span class=\"sub\">${UI.date(i.InvoiceDate)}</span></td><td>${UI.date(i.PeriodStart)} s.d. ${UI.date(i.PeriodEnd)}</td><td class=\"numeric\">${UI.currency(i.TotalAmount)}</td><td class=\"numeric\">${UI.currency(i.AmountPaid)}</td><td class=\"numeric\">${UI.currency(i.OutstandingBalance)}</td><td>${UI.badge(i.InvoiceStatus)}</td></tr>`).join('');\n    const paymentRows = d.payments.map((p) => `<tr><td class=\"strong\">${UI.esc(p.ReceiptNumber)}<span class=\"sub\">${UI.date(p.PaymentDate)}</span></td><td>${UI.esc(p.PaymentMethod)}</td><td>${UI.esc(p.ReferenceNumber || '-')}</td><td class=\"numeric\">${UI.currency(p.AmountReceived)}</td><td>${UI.badge(p.PaymentStatus)}</td></tr>`).join('');\n    host.innerHTML = `\n      <div class=\"card\"><div class=\"card-body\">\n        <div class=\"statement-head\"><div><h2>${UI.esc(d.tenant.FullName)}</h2><p class=\"muted\">${UI.esc(d.tenant.Email || '-')} &middot; ${UI.esc(d.tenant.Phone || '-')} &middot; ${UI.esc(d.tenant.RoomNumber || 'tanpa kamar')}</p></div>\n          <div class=\"grid grid-3\" style=\"min-width:480px\">\n            ${summaryCard('Total ditagihkan', UI.currency(d.summary.totalInvoiced), 'Periode terpilih')}\n            ${summaryCard('Total dibayar', UI.currency(d.summary.totalPaid), 'Pembayaran dikonfirmasi', 'blue')}\n            ${summaryCard('Saldo', UI.currency(d.summary.outstanding), `Deposit ${UI.currency(d.summary.depositLiability)}`, d.summary.outstanding > 0 ? 'amber' : '')}\n          </div>\n        </div>\n      </div></div>\n      <div class=\"card mt-16\"><div class=\"card-head\"><h3>Invoice</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Invoice</th><th>Periode</th><th class=\"numeric\">Total</th><th class=\"numeric\">Dibayar</th><th class=\"numeric\">Sisa</th><th>Status</th></tr></thead><tbody>${invoiceRows || `<tr><td colspan=\"6\">${UI.emptyState('Tidak ada invoice', 'Tidak ada tagihan pada periode ini.')}</td></tr>`}</tbody></table></div></div>\n      <div class=\"card mt-16\"><div class=\"card-head\"><h3>Pembayaran</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Kuitansi</th><th>Metode</th><th>Referensi</th><th class=\"numeric\">Jumlah</th><th>Status</th></tr></thead><tbody>${paymentRows || `<tr><td colspan=\"5\">${UI.emptyState('Tidak ada pembayaran', 'Belum ada pembayaran pada periode ini.')}</td></tr>`}</tbody></table></div></div>\n      ${d.deposits.length ? `<div class=\"card mt-16\"><div class=\"card-head\"><h3>Deposit</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Deposit</th><th>Tipe</th><th class=\"numeric\">Nilai</th><th class=\"numeric\">Sisa kewajiban</th><th>Status</th></tr></thead><tbody>${d.deposits.map((dep) => `<tr><td>${UI.esc(dep.DepositRecordID)}</td><td>${UI.esc(dep.DepositType)}</td><td class=\"numeric\">${UI.currency(dep.DepositAmount)}</td><td class=\"numeric\">${UI.currency(dep.OutstandingDepositLiability)}</td><td>${UI.badge(dep.DepositStatus)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`;\n  }\n\n  function renderReconcile(host) {\n    const d = state.data;\n    const t = d.totals;\n    host.innerHTML = `\n      <div class=\"notice ${d.ok ? 'ok' : 'warn'}\"><strong>${d.ok ? 'Pembukuan konsisten' : `${d.issues.length} temuan perlu diperiksa`}</strong><div class=\"small mt-8\">Pemeriksaan terakhir ${UI.dateTime(d.checkedAt)}</div></div>\n      <div class=\"grid grid-4 mt-16\">\n        ${summaryCard('Total invoice', UI.currency(t.invoicesTotal), `Dibayar ${UI.currency(t.invoicesPaid)}`)}\n        ${summaryCard('Piutang', UI.currency(t.invoicesOutstanding), 'Saldo invoice berjalan', t.invoicesOutstanding > 0 ? 'amber' : '')}\n        ${summaryCard('Pembayaran terkonfirmasi', UI.currency(t.confirmedPayments), `Alokasi valid ${UI.currency(t.validAllocations)}`, 'blue')}\n        ${summaryCard('Kewajiban deposit', UI.currency(t.depositLiability), `Kredit ${UI.currency(t.credits)}`, 'purple')}\n      </div>\n      ${d.issues.length ? `<div class=\"card mt-16\"><div class=\"card-head\"><h3>Temuan</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Tingkat</th><th>Modul</th><th>Record</th><th>Pesan</th></tr></thead><tbody>${d.issues.map((issue) => `<tr><td>${UI.badge(issue.level === 'critical' ? 'Overdue' : 'Pending', issue.level)}</td><td>${UI.esc(issue.module)}</td><td>${UI.esc(issue.recordId)}</td><td>${UI.esc(issue.message)}</td></tr>`).join('')}</tbody></table></div></div>` : `<div class=\"card mt-16\"><div class=\"card-body\">${UI.emptyState('Tidak ada selisih', 'Saldo invoice, alokasi pembayaran, kredit, dan deposit konsisten.')}</div></div>`}\n      <div class=\"card mt-16\"><div class=\"card-head\"><h3>Total ledger</h3></div><div class=\"card-body\">\n        <div class=\"report-row\"><span>Transaksi masuk</span><span class=\"numeric\">${UI.currency(t.transactionsIn)}</span></div>\n        <div class=\"report-row\"><span>Transaksi keluar</span><span class=\"numeric\">${UI.currency(t.transactionsOut)}</span></div>\n        <div class=\"report-row\"><span>Saldo kas</span><span class=\"numeric strong\">${UI.currency(t.transactionsIn - t.transactionsOut)}</span></div>\n      </div></div>`;\n  }\n\n  function printReport() {\n    const property = App.property || { name: 'Kos', address: '', phone: '' };\n    let title = 'Laporan Keuangan';\n    let body = '';\n    if (state.tab === 'financial') {\n      const d = state.data;\n      const s = d.summary;\n      title = 'Laporan Keuangan';\n      body = `${UI.docHeader(property, title, [['Periode', `${UI.date(d.range.from)} s.d. ${UI.date(d.range.to)}`]])}\n        <div class=\"summary\"><div><span>Invoice</span><strong>${UI.currency(s.invoiceTotal)}</strong></div><div><span>Penerimaan</span><strong>${UI.currency(s.paymentsReceived)}</strong></div><div><span>Pengeluaran</span><strong>${UI.currency(s.expensesPaid)}</strong></div><div><span>Arus kas bersih</span><strong>${UI.currency(s.netCashFlow)}</strong></div></div>\n        <h2>Pendapatan per tipe kamar</h2><table><thead><tr><th>Tipe</th><th class=\"numeric\">Nilai</th></tr></thead><tbody>${Object.entries(d.revenueByRoomType).map(([k, v]) => `<tr><td>${UI.esc(k)}</td><td class=\"numeric\">${UI.currency(v)}</td></tr>`).join('') || '<tr><td colspan=\"2\">Tidak ada data</td></tr>'}</tbody></table>\n        <h2>Pengeluaran per kategori</h2><table><thead><tr><th>Kategori</th><th class=\"numeric\">Nilai</th></tr></thead><tbody>${Object.entries(d.expenseByCategory).map(([k, v]) => `<tr><td>${UI.esc(k)}</td><td class=\"numeric\">${UI.currency(v)}</td></tr>`).join('') || '<tr><td colspan=\"2\">Tidak ada data</td></tr>'}</tbody></table>\n        <div class=\"doc-foot\">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;\n    } else if (state.tab === 'daily') {\n      const d = state.data;\n      title = 'Laporan Harian';\n      body = `${UI.docHeader(property, title, [['Tanggal', UI.date(d.date)]])}\n        <div class=\"summary\"><div><span>Penerimaan</span><strong>${UI.currency(d.summary.paymentTotal)}</strong></div><div><span>Pengeluaran</span><strong>${UI.currency(d.summary.expenseTotal)}</strong></div><div><span>Kas bersih</span><strong>${UI.currency(d.summary.net)}</strong></div></div>\n        <h2>Pembayaran</h2><table><thead><tr><th>Kuitansi</th><th>Penghuni</th><th>Metode</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>${d.payments.map((p) => `<tr><td>${UI.esc(p.ReceiptNumber)}</td><td>${UI.esc(p.TenantName)}</td><td>${UI.esc(p.PaymentMethod)}</td><td class=\"numeric\">${UI.currency(p.AmountReceived)}</td></tr>`).join('') || '<tr><td colspan=\"4\">Tidak ada pembayaran</td></tr>'}</tbody></table>\n        <h2>Pengeluaran</h2><table><thead><tr><th>Deskripsi</th><th>Kategori</th><th class=\"numeric\">Jumlah</th></tr></thead><tbody>${d.expenses.map((e) => `<tr><td>${UI.esc(e.Description)}</td><td>${UI.esc(e.Category)}</td><td class=\"numeric\">${UI.currency(e.TotalAmount)}</td></tr>`).join('') || '<tr><td colspan=\"3\">Tidak ada pengeluaran</td></tr>'}</tbody></table>\n        <div class=\"doc-foot\">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;\n    } else if (state.tab === 'statement') {\n      const d = state.data;\n      if (!d) { UI.toast('Tidak ada data untuk dicetak.', 'error'); return; }\n      title = `Kartu Penghuni ${d.tenant.FullName}`;\n      body = `${UI.docHeader(property, 'Kartu Penghuni', [['Nama', d.tenant.FullName], ['Kamar', d.tenant.RoomNumber || '-'], ['Periode', `${UI.date(state.from)} s.d. ${UI.date(state.to)}`]])}\n        <div class=\"summary\"><div><span>Ditagihkan</span><strong>${UI.currency(d.summary.totalInvoiced)}</strong></div><div><span>Dibayar</span><strong>${UI.currency(d.summary.totalPaid)}</strong></div><div><span>Saldo</span><strong>${UI.currency(d.summary.outstanding)}</strong></div></div>\n        <h2>Invoice</h2><table><thead><tr><th>Invoice</th><th>Periode</th><th class=\"numeric\">Total</th><th class=\"numeric\">Dibayar</th><th class=\"numeric\">Sisa</th><th>Status</th></tr></thead><tbody>${d.invoices.map((i) => `<tr><td>${UI.esc(i.InvoiceNumber)}</td><td>${UI.date(i.PeriodStart)} s.d. ${UI.date(i.PeriodEnd)}</td><td class=\"numeric\">${UI.currency(i.TotalAmount)}</td><td class=\"numeric\">${UI.currency(i.AmountPaid)}</td><td class=\"numeric\">${UI.currency(i.OutstandingBalance)}</td><td>${UI.esc(i.InvoiceStatus)}</td></tr>`).join('') || '<tr><td colspan=\"6\">Tidak ada invoice</td></tr>'}</tbody></table>\n        <div class=\"doc-foot\">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;\n    } else if (state.tab === 'occupancy') {\n      const d = state.data;\n      title = 'Laporan Hunian';\n      body = `${UI.docHeader(property, title, [['Periode', `${UI.date(d.range.from)} s.d. ${UI.date(d.range.to)}`]])}\n        <div class=\"summary\"><div><span>Tingkat hunian</span><strong>${d.summary.occupancyRate}%</strong></div><div><span>Kamar aktif</span><strong>${d.summary.activeRooms}</strong></div><div><span>Terisi</span><strong>${d.summary.occupied}</strong></div></div>\n        <table><thead><tr><th>Kamar</th><th>Tipe</th><th>Status</th><th class=\"numeric\">Invoice</th><th class=\"numeric\">Terkumpul</th></tr></thead><tbody>${d.rooms.map((r) => `<tr><td>${UI.esc(r.RoomNumber)}</td><td>${UI.esc(r.RoomTypeName || '')}</td><td>${UI.esc(r.AvailabilityStatus)}</td><td class=\"numeric\">${UI.currency(r.InvoicesIssued)}</td><td class=\"numeric\">${UI.currency(r.RentCollected)}</td></tr>`).join('')}</tbody></table>\n        <div class=\"doc-foot\">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;\n    } else {\n      const d = state.data;\n      title = 'Rekonsiliasi Pembukuan';\n      const t = d.totals;\n      body = `${UI.docHeader(property, title, [['Waktu', UI.dateTime(d.checkedAt)]])}\n        <div class=\"summary\"><div><span>Status</span><strong>${d.ok ? 'Konsisten' : `${d.issues.length} temuan`}</strong></div><div><span>Piutang</span><strong>${UI.currency(t.invoicesOutstanding)}</strong></div><div><span>Deposit</span><strong>${UI.currency(t.depositLiability)}</strong></div></div>\n        <table><thead><tr><th>Tingkat</th><th>Modul</th><th>Record</th><th>Pesan</th></tr></thead><tbody>${d.issues.map((i) => `<tr><td>${UI.esc(i.level)}</td><td>${UI.esc(i.module)}</td><td>${UI.esc(i.recordId)}</td><td>${UI.esc(i.message)}</td></tr>`).join('') || '<tr><td colspan=\"4\">Tidak ada temuan</td></tr>'}</tbody></table>\n        <div class=\"doc-foot\">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;\n    }\n    UI.printDocument(title, body);\n  }\n});\n\n</script>\n  <script>\n'use strict';\n\nasync function renderSettings(container, initialTab = 'general') {\n  const state = {\n    tab: initialTab,\n    settings: [],\n    prices: [],\n    audit: [],\n    logs: [],\n    lastBackup: '',\n  };\n  if (!App.can('settings', 'read') && !App.can('master', 'read') && !App.can('audit', 'read') && !App.can('system', 'run')) {\n    UI.pageError(container, new Error('Anda tidak memiliki akses ke pengaturan.'));\n    return;\n  }\n  if (!App.can('settings', 'read') && state.tab === 'general') state.tab = App.can('master', 'read') ? 'pricing' : App.can('audit', 'read') ? 'audit' : 'system';\n\n  UI.loading(container);\n  try { await load(); } catch (error) { UI.pageError(container, error); }\n\n  async function load() {\n    const [settings, prices, audit, logs] = await Promise.all([\n      App.can('settings', 'read') ? API.get('/settings') : Promise.resolve([]),\n      App.can('master', 'read') ? API.get('/price-list') : Promise.resolve([]),\n      App.can('audit', 'read') ? API.get('/audit') : Promise.resolve([]),\n      App.can('audit', 'read') ? API.get('/system/logs') : Promise.resolve([]),\n    ]);\n    state.settings = settings;\n    state.prices = prices;\n    state.audit = audit;\n    state.logs = logs;\n    render();\n  }\n\n  function setting(key, fallback = '') {\n    const found = state.settings.find((s) => s.SettingKey === key);\n    return found ? found.SettingValue : fallback;\n  }\n\n  function render() {\n    const generalAllowed = App.can('settings', 'read');\n    container.innerHTML = `\n      <div class=\"page-header\">\n        <div><h1>Pengaturan & Master</h1><p>Identitas properti, kebijakan tagihan, daftar harga, jejak audit, dan pemeliharaan sistem.</p></div>\n        <div class=\"page-actions\">\n          ${state.tab === 'pricing' && App.can('master', 'write') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"new-price\">Tambah harga</button>' : ''}\n          ${state.tab === 'system' && App.can('system', 'run') ? '<button class=\"btn\" type=\"button\" id=\"run-jobs\">Jalankan tagihan harian</button><button class=\"btn btn-primary\" type=\"button\" id=\"backup-db\">Backup data</button>' : ''}\n        </div>\n      </div>\n      <div class=\"tabs\">\n        ${generalAllowed ? `<button class=\"tab ${state.tab === 'general' ? 'active' : ''}\" type=\"button\" data-tab=\"general\">Umum & Kebijakan</button>` : ''}\n        ${App.can('master', 'read') ? `<button class=\"tab ${state.tab === 'pricing' ? 'active' : ''}\" type=\"button\" data-tab=\"pricing\">Daftar Harga</button>` : ''}\n        ${App.can('audit', 'read') ? `<button class=\"tab ${state.tab === 'audit' ? 'active' : ''}\" type=\"button\" data-tab=\"audit\">Jejak Audit</button>` : ''}\n        ${App.can('system', 'run') || App.can('audit', 'read') ? `<button class=\"tab ${state.tab === 'system' ? 'active' : ''}\" type=\"button\" data-tab=\"system\">Sistem</button>` : ''}\n      </div>\n      <div id=\"settings-content\" class=\"mt-16\"></div>\n    `;\n    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; render(); }));\n    if (state.tab === 'general') renderGeneral();\n    else if (state.tab === 'pricing') renderPricing();\n    else if (state.tab === 'audit') renderAudit();\n    else renderSystem();\n    const priceBtn = container.querySelector('#new-price');\n    if (priceBtn) priceBtn.addEventListener('click', () => openPriceForm(null));\n    const jobsBtn = container.querySelector('#run-jobs');\n    if (jobsBtn) jobsBtn.addEventListener('click', runJobs);\n    const backupBtn = container.querySelector('#backup-db');\n    if (backupBtn) backupBtn.addEventListener('click', backup);\n  }\n\n  function renderGeneral() {\n    const host = container.querySelector('#settings-content');\n    const editable = App.can('settings', 'write');\n    host.innerHTML = `<form id=\"settings-form\">\n      <div class=\"grid grid-2\">\n        <div class=\"card\"><div class=\"card-head\"><h3>Identitas properti</h3></div><div class=\"card-body\">\n          ${field('PropertyName', 'Nama properti', 'text', editable)}\n          ${field('PropertyAddress', 'Alamat', 'text', editable)}\n          ${field('PropertyPhone', 'Telepon', 'text', editable)}\n          ${field('Currency', 'Mata uang', 'text', editable, 'readonly')}\n          ${field('Timezone', 'Zona waktu', 'text', editable, 'readonly')}\n          ${field('CompanyFooter', 'Footer dokumen', 'textarea', editable)}\n        </div></div>\n        <div class=\"card\"><div class=\"card-head\"><h3>Penomoran dokumen</h3></div><div class=\"card-body\">\n          ${field('InvoicePrefix', 'Prefix invoice', 'text', editable)}\n          ${field('ReceiptPrefix', 'Prefix kuitansi', 'text', editable)}\n          ${field('DefaultDueDays', 'Jatuh tempo (hari)', 'number', editable)}\n          ${field('BillingAdvanceDays', 'Invoice dibuat sebelum periode (hari)', 'number', editable)}\n          ${field('ReminderIntervalDays', 'Jeda pengingat (hari)', 'number', editable)}\n        </div></div>\n        <div class=\"card\"><div class=\"card-head\"><h3>Kebijakan tagihan</h3></div><div class=\"card-body\">\n          ${selectField('ProrateMidMonth', 'Prorata check-in/check-out tengah bulan', [['false', 'Tidak aktif'], ['true', 'Aktif']], editable)}\n          ${selectField('LateFeeEnabled', 'Denda keterlambatan', [['false', 'Tidak aktif'], ['true', 'Aktif']], editable)}\n          ${field('LateFeePercent', 'Persentase denda (%)', 'number', editable)}\n          ${field('BillingPolicy', 'Kebijakan sewa', 'textarea', editable)}\n        </div></div>\n        <div class=\"card\"><div class=\"card-head\"><h3>Kebijakan pembayaran</h3></div><div class=\"card-body\">\n          ${field('PaymentPolicy', 'Kebijakan pembayaran', 'textarea', editable)}\n          ${field('DepositPolicy', 'Kebijakan deposit', 'textarea', editable)}\n          <div class=\"notice mt-16\">Perubahan pengaturan dicatat pada jejak audit dan hanya memengaruhi transaksi baru.</div>\n        </div></div>\n      </div>\n      ${editable ? '<div class=\"page-actions mt-16\"><button class=\"btn btn-primary\" type=\"submit\">Simpan pengaturan</button></div>' : '<div class=\"notice mt-16\">Anda memiliki akses baca saja untuk pengaturan.</div>'}\n    </form>`;\n    const form = host.querySelector('#settings-form');\n    form.addEventListener('submit', async (event) => {\n      event.preventDefault();\n      const values = Object.fromEntries(new FormData(form).entries());\n      try {\n        state.settings = await API.post('/settings', { settings: values });\n        UI.toast('Pengaturan disimpan.');\n        await App.refreshMeta();\n        render();\n      } catch (error) { UI.toast(error.message, 'error'); }\n    });\n  }\n\n  function field(key, label, type, editable, extra = '') {\n    const value = UI.esc(setting(key));\n    const disabled = editable ? '' : 'disabled';\n    if (type === 'textarea') return `<label class=\"field\"><span>${UI.esc(label)}</span><textarea name=\"${key}\" rows=\"3\" ${disabled}>${value}</textarea></label>`;\n    return `<label class=\"field\"><span>${UI.esc(label)}</span><input type=\"${type}\" name=\"${key}\" value=\"${value}\" ${disabled} ${extra}></label>`;\n  }\n\n  function selectField(key, label, options, editable) {\n    const current = setting(key, 'false');\n    return `<label class=\"field\"><span>${UI.esc(label)}</span><select name=\"${key}\" ${editable ? '' : 'disabled'}>${options.map(([value, text]) => `<option value=\"${value}\" ${current === value ? 'selected' : ''}>${UI.esc(text)}</option>`).join('')}</select></label>`;\n  }\n\n  function renderPricing() {\n    const host = container.querySelector('#settings-content');\n    host.innerHTML = '<div id=\"price-table\"></div>';\n    const tableHost = host.querySelector('#price-table');\n    UI.table(tableHost, {\n      rows: state.prices,\n      searchKeys: ['ItemName', 'ItemCode', 'ItemCategory', 'BillingUnit'],\n      searchPlaceholder: 'Cari item, kategori...',\n      exportName: 'daftar-harga',\n      rowKey: (row) => row.PriceID,\n      columns: [\n        { key: 'ItemName', label: 'Item', render: (row) => `<strong>${UI.esc(row.ItemName)}</strong><span class=\"sub\">${UI.esc(row.ItemCode)} &middot; ${UI.esc(row.ItemCategory)}</span>` },\n        { key: 'BillingUnit', label: 'Satuan' },\n        { key: 'StandardPrice', label: 'Harga standar', className: 'numeric', render: (row) => `<strong>${UI.currency(row.StandardPrice)}</strong>` },\n        { key: 'EffectiveFrom', label: 'Berlaku dari', render: (row) => UI.date(row.EffectiveFrom) },\n        { key: 'EffectiveTo', label: 'Berlaku sampai', render: (row) => row.EffectiveTo ? UI.date(row.EffectiveTo) : 'Tanpa batas' },\n        { key: 'IsActive', label: 'Status', render: (row) => UI.badge(row.IsActive === 'TRUE' ? 'Active' : 'Inactive') },\n        { key: 'actions', label: '', sortable: false, render: () => App.can('master', 'write') ? '<button class=\"btn btn-sm\" type=\"button\" data-act=\"edit\">Ubah</button>' : '' },\n      ],\n      onAction: (action, row) => { if (action === 'edit') openPriceForm(row); },\n    });\n  }\n\n  function renderAudit() {\n    const host = container.querySelector('#settings-content');\n    host.innerHTML = '<div id=\"audit-table\"></div>';\n    UI.table(host.querySelector('#audit-table'), {\n      rows: state.audit,\n      searchKeys: ['Action', 'Module', 'RecordID', 'UserID', 'Reason'],\n      searchPlaceholder: 'Cari aksi, modul, record, pengguna...',\n      exportName: 'jejak-audit',\n      rowKey: (row) => row.AuditID,\n      pageSize: 15,\n      defaultSort: 'Timestamp',\n      defaultSortDir: 'desc',\n      columns: [\n        { key: 'Timestamp', label: 'Waktu', render: (row) => UI.dateTime(row.Timestamp) },\n        { key: 'Action', label: 'Aksi', render: (row) => `<strong>${UI.esc(row.Action)}</strong><span class=\"sub\">${UI.esc(row.Module)} &middot; ${UI.esc(row.RecordID)}</span>` },\n        { key: 'UserName', label: 'Pengguna', render: (row) => UI.esc(row.UserName || row.UserID || 'SYSTEM') },\n        { key: 'Reason', label: 'Alasan', render: (row) => UI.esc(row.Reason || '-') },\n      ],\n    });\n  }\n\n  function renderSystem() {\n    const host = container.querySelector('#settings-content');\n    host.innerHTML = `\n      <div class=\"grid grid-2\">\n        <div class=\"card\"><div class=\"card-head\"><h3>Pemeliharaan data</h3></div><div class=\"card-body\">\n          <p class=\"small muted\">Jalankan proses tagihan harian secara manual atau buat salinan basis data. Proses tagihan bersifat idempoten sehingga aman dijalankan berulang.</p>\n          <div class=\"flex mt-16\">${App.can('system', 'run') ? '<button class=\"btn btn-primary\" type=\"button\" id=\"sys-jobs\">Jalankan tagihan</button><button class=\"btn\" type=\"button\" id=\"sys-backup\">Backup sekarang</button>' : '<span class=\"small muted\">Akses tindakan sistem terbatas untuk Owner/Manager.</span>'}</div>\n          ${state.lastBackup ? `<div class=\"notice ok mt-16\">Backup dibuat: ${UI.esc(state.lastBackup)}</div>` : ''}\n        </div></div>\n        <div class=\"card\"><div class=\"card-head\"><h3>Kebijakan operasional</h3></div><div class=\"card-body\">\n          <div class=\"report-row\"><span>Zona waktu</span><span>${UI.esc(setting('Timezone', 'Asia/Jakarta'))}</span></div>\n          <div class=\"report-row\"><span>Prorata</span><span>${setting('ProrateMidMonth') === 'true' ? 'Aktif' : 'Tidak aktif'}</span></div>\n          <div class=\"report-row\"><span>Denda keterlambatan</span><span>${setting('LateFeeEnabled') === 'true' ? `${setting('LateFeePercent')}%` : 'Tidak aktif'}</span></div>\n          <div class=\"report-row\"><span>Jatuh tempo</span><span>${UI.esc(setting('DefaultDueDays', '5'))} hari</span></div>\n        </div></div>\n      </div>\n      <div class=\"card mt-16\"><div class=\"card-head\"><h3>Log sistem</h3></div><div class=\"table-wrap\"><table class=\"data\"><thead><tr><th>Waktu</th><th>Level</th><th>Sumber</th><th>Pesan</th></tr></thead><tbody>\n        ${state.logs.length ? state.logs.slice(0, 60).map((log) => `<tr><td>${UI.dateTime(log.Timestamp)}</td><td>${UI.badge(log.Level === 'ERROR' ? 'Overdue' : log.Level === 'WARN' ? 'Pending' : 'Issued', log.Level)}</td><td>${UI.esc(log.Source || '-')}</td><td>${UI.esc(log.Message)}</td></tr>`).join('') : `<tr><td colspan=\"4\">${UI.emptyState('Belum ada log', 'Log sistem akan tampil di sini.')}</td></tr>`}\n      </tbody></table></div></div>`;\n    const jobsBtn = host.querySelector('#sys-jobs');\n    if (jobsBtn) jobsBtn.addEventListener('click', runJobs);\n    const backupBtn = host.querySelector('#sys-backup');\n    if (backupBtn) backupBtn.addEventListener('click', backup);\n  }\n\n  async function runJobs() {\n    try {\n      const result = await API.post('/system/run-jobs', {});\n      const created = result.billing && result.billing.count ? result.billing.count : 0;\n      UI.toast(`Tagihan dijalankan. ${created ? `${created} invoice baru dibuat.` : 'Tidak ada invoice baru.'}`, 'success', 'Proses selesai');\n      state.logs = App.can('audit', 'read') ? await API.get('/system/logs') : state.logs;\n      render();\n    } catch (error) { UI.toast(error.message, 'error'); }\n  }\n\n  async function backup() {\n    try {\n      const result = await API.post('/system/backup', {});\n      state.lastBackup = result.file;\n      UI.toast(`Backup tersimpan di ${result.file}.`, 'success', 'Backup selesai');\n      render();\n    } catch (error) { UI.toast(error.message, 'error'); }\n  }\n\n  function openPriceForm(price) {\n    const isEdit = !!price;\n    UI.formModal({\n      title: isEdit ? `Ubah ${price.ItemName}` : 'Tambah daftar harga',\n      size: 'lg',\n      body: `<div class=\"form-grid\">\n        <label class=\"field\"><span>Nama item <em>*</em></span><input name=\"ItemName\" required value=\"${UI.esc(price ? price.ItemName : '')}\"></label>\n        <label class=\"field\"><span>Kode item</span><input name=\"ItemCode\" value=\"${UI.esc(price ? price.ItemCode : '')}\"></label>\n        <label class=\"field\"><span>Kategori <em>*</em></span><select name=\"ItemCategory\" required>${['Room Rental', 'Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'].map((cat) => `<option ${price && price.ItemCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></label>\n        <label class=\"field\"><span>Satuan</span><input name=\"BillingUnit\" value=\"${UI.esc(price ? price.BillingUnit : 'bulan')}\" placeholder=\"bulan / kg / kali\"></label>\n        <label class=\"field\"><span>Harga standar (Rp) <em>*</em></span><input type=\"number\" min=\"1\" step=\"1000\" name=\"StandardPrice\" required value=\"${price ? price.StandardPrice : ''}\"></label>\n        <label class=\"field\"><span>Berlaku dari <em>*</em></span><input type=\"date\" name=\"EffectiveFrom\" required value=\"${UI.esc(price ? price.EffectiveFrom : UI.todayISO())}\"></label>\n        <label class=\"field\"><span>Berlaku sampai</span><input type=\"date\" name=\"EffectiveTo\" value=\"${UI.esc(price ? price.EffectiveTo : '')}\"></label>\n        ${isEdit ? `<label class=\"field\"><span>Status</span><select name=\"IsActive\"><option value=\"TRUE\" ${price.IsActive === 'TRUE' ? 'selected' : ''}>Aktif</option><option value=\"FALSE\" ${price.IsActive === 'FALSE' ? 'selected' : ''}>Nonaktif</option></select></label>` : ''}\n        <label class=\"field full\"><span>Catatan</span><textarea name=\"Notes\">${UI.esc(price ? price.Notes : '')}</textarea></label>\n      </div>`,\n      submitText: isEdit ? 'Simpan perubahan' : 'Tambah harga',\n      onSubmit: async (values) => {\n        if (isEdit) values.PriceID = price.PriceID;\n        await API.post('/price-list', values);\n        UI.toast(isEdit ? 'Harga diperbarui.' : 'Harga ditambahkan.');\n        state.prices = await API.get('/price-list');\n        render();\n      },\n    });\n  }\n}\n\nApp.registerPage('settings', (container) => renderSettings(container, 'general'));\nApp.registerPage('master-data', (container) => renderSettings(container, 'pricing'));\n\n</script>\n  <script>\n'use strict';\n\n(() => {\n  const ICONS = {\n    dashboard: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M4 13h7V4H4zM13 9h7V4h-7zM13 20h7v-9h-7zM4 20h7v-5H4z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\"/></svg>',\n    rooms: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M4 20V6l8-3 8 3v14M4 20h16M9 20v-5h6v5M8 9h.01M16 9h.01\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    tenants: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><circle cx=\"9\" cy=\"8\" r=\"3.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M3.5 20c.4-3.4 2.7-5.4 5.5-5.4s5.1 2 5.5 5.4M16 5.5a3 3 0 010 5.6M17 14.6c2.2.5 3.6 2.3 3.9 5.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n    reservations: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    agreements: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M6 3h9l4 4v14H6zM15 3v5h4M9 13h6M9 17h6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    invoices: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    payments: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M6 9v6M18 9v6\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n    services: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M12 3l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9L9.6 8z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/></svg>',\n    expenses: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M4 18l5-6 4 3 7-9M16 6h4v4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    finance: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M3 19h18M6 16V9M11 16V5M16 16v-4M21 16v-8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>',\n    activities: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M5 5h14v15H5zM8 3v4M16 3v4M8 12l2 2 5-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n    staff: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><circle cx=\"12\" cy=\"8\" r=\"3.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M5 20c.5-4 3.2-6 7-6s6.5 2 7 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n    reports: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path d=\"M4 20V4M4 20h16M8 16v-4M13 16V7M18 16v-7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>',\n    settings: '<svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><path d=\"M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></svg>',\n  };\n\n  const NAV = [\n    { label: '', items: [{ route: 'dashboard', label: 'Dashboard', icon: 'dashboard', module: 'dashboard' }] },\n    { label: 'Operasional', items: [\n      { route: 'rooms', label: 'Kamar', icon: 'rooms', module: 'rooms' },\n      { route: 'room-types', label: 'Tipe Kamar', icon: 'rooms', module: 'roomTypes' },\n      { route: 'tenants', label: 'Penghuni', icon: 'tenants', module: 'tenants' },\n      { route: 'reservations', label: 'Reservasi', icon: 'reservations', module: 'reservations' },\n      { route: 'agreements', label: 'Perjanjian & Check-in', icon: 'agreements', module: 'agreements' },\n      { route: 'activities', label: 'Tugas', icon: 'activities', module: 'activities' },\n    ] },\n    { label: 'Keuangan', items: [\n      { route: 'invoices', label: 'Tagihan', icon: 'invoices', module: 'invoices' },\n      { route: 'payments', label: 'Pembayaran', icon: 'payments', module: 'payments' },\n      { route: 'services', label: 'Layanan', icon: 'services', module: 'services' },\n      { route: 'expenses', label: 'Pengeluaran', icon: 'expenses', module: 'expenses' },\n      { route: 'transactions', label: 'Transaksi', icon: 'finance', module: 'transactions' },\n      { route: 'deposits', label: 'Deposit', icon: 'finance', module: 'deposits' },\n    ] },\n    { label: 'Analitik', items: [\n      { route: 'reports', label: 'Laporan', icon: 'reports', module: 'reports' },\n    ] },\n    { label: 'Sistem', items: [\n      { route: 'staff', label: 'Staf', icon: 'staff', module: 'staff' },\n      { route: 'users', label: 'Akun Pengguna', icon: 'staff', module: 'users' },\n      { route: 'master-data', label: 'Master Data', icon: 'services', module: 'master' },\n      { route: 'settings', label: 'Pengaturan', icon: 'settings', can: () => App.can('settings', 'read') || App.can('audit', 'read') || App.can('system', 'run') },\n    ] },\n  ];\n\n  const ROUTES = {\n    dashboard: { title: 'Dashboard', subtitle: 'Ringkasan operasional hari ini', page: 'dashboard', module: 'dashboard' },\n    rooms: { title: 'Kamar', subtitle: 'Ketersediaan, tipe, dan status kamar', page: 'rooms', module: 'rooms' },\n    'room-types': { title: 'Tipe Kamar', subtitle: 'Harga sewa dan fasilitas kamar', page: 'room-types', module: 'roomTypes' },\n    tenants: { title: 'Penghuni', subtitle: 'Data penghuni, kontak, dan status hunian', page: 'tenants', module: 'tenants' },\n    reservations: { title: 'Reservasi', subtitle: 'Calon penghuni dan kamar yang dipesan', page: 'reservations', module: 'reservations' },\n    agreements: { title: 'Perjanjian & Check-in', subtitle: 'Perjanjian sewa, check-in, transfer, dan check-out', page: 'agreements', module: 'agreements' },\n    invoices: { title: 'Tagihan', subtitle: 'Invoice bulanan, pembayaran sebagian, dan penyesuaian', page: 'invoices', module: 'invoices' },\n    payments: { title: 'Pembayaran', subtitle: 'Kuitansi, alokasi invoice, dan kredit penghuni', page: 'payments', module: 'payments' },\n    services: { title: 'Layanan Tambahan', subtitle: 'Laundry, cleaning, parkir, dan layanan lain', page: 'services', module: 'services' },\n    expenses: { title: 'Pengeluaran', subtitle: 'Biaya operasional dan pembayaran vendor', page: 'expenses', module: 'expenses' },\n    finance: { title: 'Kas & Deposit', subtitle: 'Ledger transaksi dan kewajiban deposit', page: 'finance', can: () => App.can('transactions', 'read') || App.can('deposits', 'read') },\n    transactions: { title: 'Transaksi', subtitle: 'Ledger kas masuk, kas keluar, dan jurnal pembalik', page: 'transactions', module: 'transactions' },\n    deposits: { title: 'Security Deposit', subtitle: 'Deposit ditahan, potongan, dan pengembalian', page: 'deposits', module: 'deposits' },\n    users: { title: 'Akun Pengguna', subtitle: 'Akun login, peran, dan status akses', page: 'users', module: 'users' },\n    'master-data': { title: 'Master Data', subtitle: 'Daftar harga, layanan, dan tipe kamar', page: 'master-data', module: 'master' },\n    activities: { title: 'Tugas Operasional', subtitle: 'Kebersihan, perawatan, dan inspeksi kamar', page: 'activities', module: 'activities' },\n    staff: { title: 'Tim & Akun', subtitle: 'Staf, akun login, dan peran akses', page: 'staff', can: () => App.can('staff', 'read') || App.can('users', 'read') },\n    reports: { title: 'Laporan', subtitle: 'Keuangan, hunian, kartu penghuni, dan rekonsiliasi', page: 'reports', module: 'reports' },\n    settings: { title: 'Pengaturan', subtitle: 'Identitas properti, kebijakan, harga, dan sistem', page: 'settings', can: () => App.can('settings', 'read') || App.can('master', 'read') || App.can('audit', 'read') || App.can('system', 'run') },\n  };\n\n  let currentHash = '';\n  let booting = false;\n\n  function allowed(route) {\n    const definition = ROUTES[route];\n    if (!definition) return false;\n    if (definition.can) return definition.can();\n    return App.can(definition.module, 'read');\n  }\n\n  function showLogin() {\n    App.stopStatusMonitor();\n    document.getElementById('boot-screen').classList.add('hidden');\n    document.getElementById('app').classList.add('hidden');\n    document.getElementById('login-screen').classList.remove('hidden');\n    const email = document.getElementById('login-email');\n    if (email) setTimeout(() => email.focus(), 80);\n  }\n\n  function showApp() {\n    document.getElementById('boot-screen').classList.add('hidden');\n    document.getElementById('login-screen').classList.add('hidden');\n    document.getElementById('app').classList.remove('hidden');\n  }\n\n  function renderNav() {\n    const nav = document.getElementById('nav');\n    nav.innerHTML = NAV.map((section) => {\n      const items = section.items.filter((item) => item.can ? item.can() : App.can(item.module, 'read'));\n      if (!items.length) return '';\n      return `<div class=\"nav-section\">${section.label ? `<div class=\"nav-label\">${section.label}</div>` : ''}${items.map((item) => `<a class=\"nav-item\" href=\"#/${item.route}\" data-route=\"${item.route}\">${ICONS[item.icon] || ''}<span>${UI.esc(item.label)}</span></a>`).join('')}</div>`;\n    }).join('');\n  }\n\n  function markActive(route) {\n    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.route === route));\n  }\n\n  function setUserChrome() {\n    const user = App.user;\n    if (!user) return;\n    document.getElementById('user-name').textContent = user.FullName;\n    document.getElementById('user-role').textContent = user.Role;\n    document.getElementById('user-avatar').textContent = UI.initials(user.FullName);\n    document.getElementById('dropdown-name').textContent = user.FullName;\n    document.getElementById('dropdown-email').textContent = user.Email;\n    const chip = document.getElementById('today-chip');\n    if (chip) chip.textContent = UI.date(UI.todayISO(), 'long');\n  }\n\n  async function route() {\n    if (!App.user) return;\n    const raw = window.location.hash.replace(/^#\\/?/, '').split('?')[0] || 'dashboard';\n    let key = ROUTES[raw] ? raw : 'dashboard';\n    if (!allowed(key)) {\n      if (currentHash === `#/${raw}`) {\n        const container = document.getElementById('page');\n        container.innerHTML = '';\n        UI.pageError(container, new Error('Anda tidak memiliki akses ke halaman ini.'));\n        return;\n      }\n      key = 'dashboard';\n    }\n    currentHash = `#/${key}`;\n    if (window.location.hash !== currentHash) {\n      history.replaceState(null, '', currentHash);\n    }\n    const definition = ROUTES[key];\n    document.getElementById('page-title').textContent = definition.title;\n    document.getElementById('page-subtitle').textContent = definition.subtitle;\n    markActive(key);\n    document.getElementById('app').classList.remove('sidebar-open');\n    const container = document.getElementById('page');\n    const renderer = App.pages[definition.page];\n    if (!renderer) {\n      UI.pageError(container, new Error(`Halaman \"${definition.page}\" belum tersedia.`));\n      return;\n    }\n    container.innerHTML = '';\n    try {\n      await renderer(container, { route: key });\n      container.focus({ preventScroll: true });\n      window.scrollTo({ top: 0, behavior: 'smooth' });\n    } catch (error) {\n      UI.pageError(container, error);\n    }\n  }\n\n  async function boot() {\n    if (booting) return;\n    booting = true;\n    try {\n      if (!API.hasToken()) {\n        await App.loadPublicBranding();\n        App.user = null;\n        showLogin();\n        return;\n      }\n      await App.refreshMeta();\n      if (!App.user) {\n        const me = await API.me();\n        App.user = me.user;\n      }\n      setUserChrome();\n      renderNav();\n      showApp();\n      await route();\n    } catch (error) {\n      App.user = null;\n      await App.loadPublicBranding();\n      showLogin();\n    } finally {\n      booting = false;\n    }\n  }\n\n  function setupLogin() {\n    const form = document.getElementById('login-form');\n    const errorBox = document.getElementById('login-error');\n    const submit = document.getElementById('login-submit');\n    form.addEventListener('submit', async (event) => {\n      event.preventDefault();\n      errorBox.classList.add('hidden');\n      submit.disabled = true;\n      const original = submit.textContent;\n      submit.textContent = 'Memeriksa akun...';\n      try {\n        const email = document.getElementById('login-email').value;\n        const password = document.getElementById('login-password').value;\n        const result = await API.login(email, password);\n        App.user = result.user;\n        if (result.bootstrap) App.applyMeta(result.bootstrap);\n        else await App.refreshMeta();\n        setUserChrome();\n        renderNav();\n        showApp();\n        currentHash = '';\n        if (!window.location.hash || window.location.hash === '#/') window.location.hash = '#/dashboard';\n        await route();\n        UI.toast(`Selamat datang, ${result.user.FullName}.`, 'success', 'Berhasil masuk');\n      } catch (error) {\n        errorBox.textContent = error.message || 'Gagal masuk.';\n        errorBox.classList.remove('hidden');\n      } finally {\n        submit.disabled = false;\n        submit.textContent = original;\n      }\n    });\n    document.querySelectorAll('.demo-account').forEach((button) => {\n      button.addEventListener('click', () => {\n        document.getElementById('login-email').value = button.dataset.email;\n        document.getElementById('login-password').value = button.dataset.password;\n        errorBox.classList.add('hidden');\n      });\n    });\n  }\n\n  function setupChrome() {\n    document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('app').classList.toggle('sidebar-open'));\n    document.getElementById('sidebar-backdrop').addEventListener('click', () => document.getElementById('app').classList.remove('sidebar-open'));\n    const userButton = document.getElementById('user-button');\n    const dropdown = document.getElementById('user-dropdown');\n    userButton.addEventListener('click', (event) => { event.stopPropagation(); dropdown.classList.toggle('hidden'); });\n    document.addEventListener('click', (event) => { if (!event.target.closest('.user-menu')) dropdown.classList.add('hidden'); });\n    document.getElementById('logout-button').addEventListener('click', async () => {\n      try { await API.logout(); } catch (error) { /* session may already be gone */ }\n      App.user = null;\n      currentHash = '';\n      document.getElementById('user-dropdown').classList.add('hidden');\n      showLogin();\n      UI.toast('Anda telah keluar dari sistem.', 'info', 'Sampai jumpa');\n    });\n    window.addEventListener('hashchange', route);\n    window.onUnauthorized = () => {\n      if (!App.user) return;\n      App.user = null;\n      currentHash = '';\n      showLogin();\n      UI.toast('Sesi berakhir. Silakan masuk kembali.', 'error', 'Sesi berakhir');\n    };\n  }\n\n  document.addEventListener('DOMContentLoaded', () => {\n    setupLogin();\n    setupChrome();\n    boot();\n  });\n})();\n\n</script>\n</body>\n</html>\n";

const __defs = {};
const __cache = {};

function __define(id, factory) { __defs[id] = factory; }

function __resolve(from, request) {
  if (request.charAt(0) !== ".") return request;
  const stack = from.split("/");
  stack.pop();
  request.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") stack.pop();
    else stack.push(part);
  });
  return stack.join("/");
}

function __require(id) {
  if (Object.prototype.hasOwnProperty.call(__cache, id)) return __cache[id];
  if (!__defs[id]) throw new Error(`Modul ${id} tidak ditemukan.`);
  const module = { exports: {} };
  __defs[id](module, module.exports, (request) => __require(__resolve(id, request)));
  __cache[id] = module.exports;
  return module.exports;
}

__define("util", function (module, exports, require) {
'use strict';

const TIMEZONE = 'Asia/Jakarta';

function nowISO() {
  return new Date().toISOString();
}

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

function parseDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, day] = value.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1, day));
    if (d.getUTCFullYear() !== y || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== day) return null;
    return d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseDate(value);
  return !!d && d.toISOString().slice(0, 10) === value;
}

function addDays(value, days) {
  const d = parseDate(value);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonthsClamped(value, months) {
  const [y, m, day] = value.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const maxDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, maxDay));
  return target.toISOString().slice(0, 10);
}

function monthStart(value = today()) {
  return `${value.slice(0, 7)}-01`;
}

function monthEnd(value = today()) {
  const [y, m] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function previousMonthRange(value = today()) {
  const first = new Date(`${monthStart(value)}T00:00:00Z`);
  first.setUTCMonth(first.getUTCMonth() - 1);
  const from = first.toISOString().slice(0, 10);
  return { from, to: monthEnd(from) };
}

function daysBetween(a, b) {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  return Math.round((d2 - d1) / 86400000);
}

function overlaps(startA, endA, startB, endB) {
  const aEnd = endA || '9999-12-31';
  const bEnd = endB || '9999-12-31';
  return startA <= bEnd && startB <= aEnd;
}

function round(value) {
  return Math.round(Number(value) || 0);
}

function nextCounter(db, key) {
  db.meta.counters[key] = (db.meta.counters[key] || 0) + 1;
  return db.meta.counters[key];
}

function makeId(db, key, prefix, width = 4) {
  return `${prefix}-${pad(nextCounter(db, key), width)}`;
}

function makeInvoiceNumber(db, prefix, date = today()) {
  const seq = nextCounter(db, `invoice-${date.slice(0, 7)}`);
  return `${prefix}/${date.slice(0, 4)}${date.slice(5, 7)}/${pad(seq, 4)}`;
}

function makeReceiptNumber(db, prefix, date = today()) {
  const seq = nextCounter(db, `receipt-${date.slice(0, 7)}`);
  return `${prefix}/${date.slice(0, 7).replace('-', '')}/${pad(seq, 4)}`;
}

class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function requireFields(data, fields) {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new AppError(`Field ${field} wajib diisi.`);
    }
  }
}

function requireDate(value, label) {
  if (!isDate(value)) throw new AppError(`${label} harus berupa tanggal yang valid (YYYY-MM-DD).`);
  return value;
}

function requireEnum(value, allowed, label) {
  if (!allowed.includes(value)) throw new AppError(`${label} tidak valid. Pilihan: ${allowed.join(', ')}.`);
  return value;
}

function requireAmount(value, label, { allowZero = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new AppError(`${label} harus berupa angka.`);
  if (!Number.isInteger(n)) throw new AppError(`${label} harus berupa angka bulat Rupiah.`);
  if (n < 0 || (!allowZero && n === 0)) throw new AppError(`${label} harus lebih besar dari nol.`);
  return n;
}

function cleanText(value, max = 500) {
  return String(value === undefined || value === null ? '' : value).trim().slice(0, max);
}

function cleanOptional(value) {
  const text = cleanText(value);
  return text === '' ? '' : text;
}

function sortBy(rows, key, direction = 'asc') {
  const dir = direction === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });
}

function inRange(value, from, to) {
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

module.exports = {
  TIMEZONE,
  nowISO,
  today,
  pad,
  parseDate,
  isDate,
  addDays,
  addMonthsClamped,
  monthStart,
  monthEnd,
  previousMonthRange,
  daysBetween,
  overlaps,
  round,
  nextCounter,
  makeId,
  makeInvoiceNumber,
  makeReceiptNumber,
  AppError,
  requireFields,
  requireDate,
  requireEnum,
  requireAmount,
  cleanText,
  cleanOptional,
  sortBy,
  inRange,
};

});

__define("seed", function (module, exports, require) {
'use strict';

const {
  nowISO,
  today,
  addMonthsClamped,
  monthStart,
  monthEnd,
  makeId,
} = require('./util');
const { hashPassword } = require('./password');

function buildSeed(db) {
  const now = nowISO();
  const day = today();
  const lastMonth = addMonthsClamped(day, -1);
  const twoMonths = addMonthsClamped(day, -2);

  db.meta.schemaVersion = 1;
  db.meta.createdAt = now;
  db.meta.updatedAt = now;
  db.meta.demoPaymentsSeeded = false;
  db.meta.counters = {
    room: 21,
    roomType: 4,
    tenant: 6,
    staff: 5,
    user: 5,
    service: 5,
    price: 8,
    occupancy: 3,
    deposit: 3,
    reservation: 1,
    invoice: 0,
    payment: 0,
    allocation: 0,
    serviceOrder: 0,
    expense: 2,
    activity: 3,
    transaction: 3,
  };

  db.settings = [
    ['PropertyName', 'Kos', 'Nama properti yang tampil pada invoice dan kuitansi'],
    ['PropertyAddress', 'Jl. Melati Raya No. 18, Jakarta Selatan', 'Alamat properti'],
    ['PropertyPhone', '021-7654321', 'Nomor telepon properti'],
    ['Currency', 'IDR', 'Mata uang transaksi'],
    ['Timezone', 'Asia/Jakarta', 'Zona waktu operasional'],
    ['InvoicePrefix', 'INV', 'Prefix nomor invoice'],
    ['ReceiptPrefix', 'KWT', 'Prefix nomor kuitansi'],
    ['DefaultDueDays', '5', 'Jatuh tempo invoice dalam hari sejak awal periode'],
    ['BillingAdvanceDays', '0', 'Invoice dibuat berapa hari sebelum periode dimulai'],
    ['ReminderIntervalDays', '7', 'Jeda minimum pengingat tagihan yang sama'],
    ['ProrateMidMonth', 'false', 'Kebijakan prorata untuk check-in/check-out di tengah bulan'],
    ['LateFeeEnabled', 'false', 'Denda keterlambatan hanya aktif jika owner mengaktifkan'],
    ['LateFeePercent', '0', 'Persentase denda keterlambatan (jika diaktifkan)'],
    ['DepositPolicy', 'Deposit dikembalikan setelah inspeksi kamar dan pelunasan tagihan.'],
    ['BillingPolicy', 'Sewa dibebankan penuh per periode bulanan sejak tanggal check-in. Tanggal 29-31 mengikuti hari terakhir bulan.'],
    ['PaymentPolicy', 'Kelebihan pembayaran dicatat sebagai kredit penghuni dan dapat dialokasikan ke invoice berikutnya.'],
    ['CompanyFooter', 'Terima kasih telah mempercayakan hunian Anda kepada kami.'],
  ].map(([key, value, description]) => ({
    SettingKey: key,
    SettingValue: value,
    Description: description,
    UpdatedAt: now,
    UpdatedBy: 'SYSTEM',
  }));

  db.roomTypes = [
    {
      RoomTypeID: 'RT-0001', TypeName: 'Standard', Description: 'Kamar standar dengan kamar mandi dalam',
      DefaultCapacity: 1, DefaultMonthlyPrice: 1500000,
      Facilities: 'Kasur, lemari, meja, AC, kamar mandi dalam, WiFi',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
    {
      RoomTypeID: 'RT-0002', TypeName: 'Deluxe', Description: 'Kamar lebih luas dengan balkon',
      DefaultCapacity: 1, DefaultMonthlyPrice: 2000000,
      Facilities: 'Kasur queen, lemari, meja kerja, AC, kamar mandi dalam, balkon, WiFi',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
    {
      RoomTypeID: 'RT-0003', TypeName: 'Premium', Description: 'Kamar premium untuk dua penghuni',
      DefaultCapacity: 2, DefaultMonthlyPrice: 2500000,
      Facilities: '2 kasur, lemari, meja, AC, kamar mandi dalam, balkon, WiFi, parkir',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
    {
      RoomTypeID: 'RT-0004', TypeName: 'VIP', Description: 'Kamar VIP dengan area kerja dan dapur kecil',
      DefaultCapacity: 2, DefaultMonthlyPrice: 3200000,
      Facilities: 'Kasur king, sofa, dapur kecil, AC, kamar mandi dalam, TV, WiFi',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
  ];

  const roomPlan = [
    ...Array.from({ length: 7 }, (_, i) => ({ no: `A-10${i + 1}`, building: 'A', floor: '1', type: 'RT-0001', cap: 1, price: 1500000 })),
    ...Array.from({ length: 7 }, (_, i) => ({ no: `A-20${i + 1}`, building: 'A', floor: '2', type: 'RT-0002', cap: 1, price: 2000000 })),
    ...Array.from({ length: 7 }, (_, i) => ({ no: `B-10${i + 1}`, building: 'B', floor: '1', type: 'RT-0003', cap: 2, price: 2500000 })),
  ];

  db.rooms = roomPlan.map((room, index) => ({
    RoomID: `RM-${String(index + 1).padStart(4, '0')}`,
    RoomNumber: room.no,
    Building: room.building,
    Floor: room.floor,
    RoomTypeID: room.type,
    Capacity: room.cap,
    Facilities: db.roomTypes.find((t) => t.RoomTypeID === room.type).Facilities,
    StandardMonthlyPrice: room.price,
    OperationalStatus: index === 20 ? 'Maintenance' : 'Available',
    Notes: index === 20 ? 'Perbaikan keran kamar mandi' : '',
    CreatedAt: now,
    UpdatedAt: now,
  }));

  db.tenants = [
    {
      TenantID: 'T-0001', FullName: 'Budi Santoso', IdentityType: 'KTP', IdentityNumber: '3171010101900001',
      Phone: '0812-1111-2222', Email: 'budi.santoso@example.com', Address: 'Jl. Kenanga No. 4, Depok',
      EmergencyContact: 'Sri Santoso', EmergencyPhone: '0812-1111-3333', Occupation: 'Karyawan Swasta',
      RegistrationDate: addMonthsClamped(day, -1), TenantStatus: 'Active',
      Notes: 'Penghuni kamar A-101', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0002', FullName: 'Siti Aminah', IdentityType: 'KTP', IdentityNumber: '3171010202910002',
      Phone: '0813-2222-3333', Email: 'siti.aminah@example.com', Address: 'Jl. Anggrek No. 9, Jakarta',
      EmergencyContact: 'Hasan Amin', EmergencyPhone: '0813-2222-4444', Occupation: 'Dosen',
      RegistrationDate: twoMonths, TenantStatus: 'Active',
      Notes: 'Penghuni kamar A-201', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0003', FullName: 'Andi Wijaya', IdentityType: 'KTP', IdentityNumber: '3171010303920003',
      Phone: '0814-3333-4444', Email: 'andi.wijaya@example.com', Address: 'Jl. Dahlia No. 21, Bekasi',
      EmergencyContact: 'Rina Wijaya', EmergencyPhone: '0814-3333-5555', Occupation: 'Wirausaha',
      RegistrationDate: lastMonth, TenantStatus: 'Active',
      Notes: 'Penghuni kamar B-101, tagihan menunggak', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0004', FullName: 'Maya Putri', IdentityType: 'KTP', IdentityNumber: '3171010404930004',
      Phone: '0815-4444-5555', Email: 'maya.putri@example.com', Address: 'Jl. Cempaka No. 2, Tangerang',
      EmergencyContact: 'Dian Putri', EmergencyPhone: '0815-4444-6666', Occupation: 'Desainer',
      RegistrationDate: day, TenantStatus: 'Prospective',
      Notes: 'Calon penghuni, reservasi kamar A-102', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0005', FullName: 'Rizky Ramadhan', IdentityType: 'KTP', IdentityNumber: '3171010505940005',
      Phone: '0816-5555-6666', Email: 'rizky.ramadhan@example.com', Address: 'Jl. Flamboyan No. 7, Bogor',
      EmergencyContact: 'Ayu Ramadhan', EmergencyPhone: '0816-5555-7777', Occupation: 'Pegawai Bank',
      RegistrationDate: addMonthsClamped(day, -3), TenantStatus: 'Checked Out',
      Notes: 'Sudah check-out, riwayat tersimpan', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0006', FullName: 'Nadia Safira', IdentityType: 'KTP', IdentityNumber: '3171010606950006',
      Phone: '0817-6666-7777', Email: 'nadia.safira@example.com', Address: 'Jl. Bougenville No. 11, Jakarta',
      EmergencyContact: 'Fajar Safira', EmergencyPhone: '0817-6666-8888', Occupation: 'Perawat',
      RegistrationDate: day, TenantStatus: 'Prospective',
      Notes: '', CreatedAt: now, UpdatedAt: now,
    },
  ];

  db.services = [
    { ServiceID: 'SV-0001', ServiceCode: 'LDY', ServiceName: 'Laundry', Category: 'Laundry', Unit: 'kg', StandardPrice: 15000, CostPrice: 10000, IsAvailable: 'TRUE', Description: 'Cuci dan lipat pakaian', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0002', ServiceCode: 'CLN', ServiceName: 'Cleaning Kamar', Category: 'Cleaning', Unit: 'kali', StandardPrice: 50000, CostPrice: 30000, IsAvailable: 'TRUE', Description: 'Pembersihan kamar oleh staf', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0003', ServiceCode: 'PRK', ServiceName: 'Parkir Motor', Category: 'Parking', Unit: 'bulan', StandardPrice: 100000, CostPrice: 0, IsAvailable: 'TRUE', Description: 'Biaya parkir motor bulanan', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0004', ServiceCode: 'WIFI', ServiceName: 'Internet Premium', Category: 'Utilities', Unit: 'bulan', StandardPrice: 75000, CostPrice: 40000, IsAvailable: 'TRUE', Description: 'Upgrade bandwidth internet', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0005', ServiceCode: 'XBD', ServiceName: 'Extra Bed', Category: 'Other Services', Unit: 'unit', StandardPrice: 150000, CostPrice: 90000, IsAvailable: 'TRUE', Description: 'Penambahan kasur lipat', CreatedAt: now, UpdatedAt: now },
  ];

  db.priceList = db.services.map((service, index) => ({
    PriceID: `PRC-${String(index + 1).padStart(4, '0')}`,
    ItemCode: service.ServiceCode,
    ItemName: service.ServiceName,
    ItemCategory: service.Category,
    RoomTypeID: '',
    BillingUnit: service.Unit,
    StandardPrice: service.StandardPrice,
    EffectiveFrom: twoMonths,
    EffectiveTo: '',
    IsActive: 'TRUE',
    Notes: 'Harga layanan standar',
  }));
  db.priceList.push({
    PriceID: 'PRC-0006', ItemCode: 'RENT-STD', ItemName: 'Sewa Standard', ItemCategory: 'Room Rental',
    RoomTypeID: 'RT-0001', BillingUnit: 'bulan', StandardPrice: 1500000, EffectiveFrom: twoMonths,
    EffectiveTo: '', IsActive: 'TRUE', Notes: '',
  });
  db.priceList.push({
    PriceID: 'PRC-0007', ItemCode: 'RENT-DLX', ItemName: 'Sewa Deluxe', ItemCategory: 'Room Rental',
    RoomTypeID: 'RT-0002', BillingUnit: 'bulan', StandardPrice: 2000000, EffectiveFrom: twoMonths,
    EffectiveTo: '', IsActive: 'TRUE', Notes: '',
  });
  db.priceList.push({
    PriceID: 'PRC-0008', ItemCode: 'RENT-PRM', ItemName: 'Sewa Premium', ItemCategory: 'Room Rental',
    RoomTypeID: 'RT-0003', BillingUnit: 'bulan', StandardPrice: 2500000, EffectiveFrom: twoMonths,
    EffectiveTo: '', IsActive: 'TRUE', Notes: '',
  });

  db.staff = [
    { StaffID: 'ST-0001', FullName: 'Dewi Lestari', Position: 'Pemilik', Phone: '0811-0000-0001', Email: 'owner@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Owner', Notes: '' },
    { StaffID: 'ST-0002', FullName: 'Rudi Hartono', Position: 'Manajer Operasional', Phone: '0811-0000-0002', Email: 'manager@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Manager', Notes: '' },
    { StaffID: 'ST-0003', FullName: 'Sari Wulandari', Position: 'Resepsionis', Phone: '0811-0000-0003', Email: 'resepsionis@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Receptionist', Notes: '' },
    { StaffID: 'ST-0004', FullName: 'Agus Pratama', Position: 'Kasir', Phone: '0811-0000-0004', Email: 'kasir@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Cashier', Notes: '' },
    { StaffID: 'ST-0005', FullName: 'Joko Susilo', Position: 'Staf Operasional', Phone: '0811-0000-0005', Email: 'staf@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Operational Staff', Notes: '' },
  ];

  db.users = [
    { UserID: 'USR-0001', StaffID: 'ST-0001', Email: 'owner@kos.id', PasswordHash: hashPassword('owner123'), Role: 'Owner', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0002', StaffID: 'ST-0002', Email: 'manager@kos.id', PasswordHash: hashPassword('manager123'), Role: 'Manager', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0003', StaffID: 'ST-0003', Email: 'resepsionis@kos.id', PasswordHash: hashPassword('reception123'), Role: 'Receptionist', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0004', StaffID: 'ST-0004', Email: 'kasir@kos.id', PasswordHash: hashPassword('cashier123'), Role: 'Cashier', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0005', StaffID: 'ST-0005', Email: 'staf@kos.id', PasswordHash: hashPassword('staff123'), Role: 'Operational Staff', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
  ];

  db.occupancies = [
    {
      OccupancyID: 'OCC-0001', TenantID: 'T-0001', RoomID: 'RM-0001', CheckInDate: lastMonth,
      PlannedCheckOut: '', ActualCheckOut: '', RentalPlan: 'Monthly', AgreedMonthlyPrice: 1500000,
      BillingDay: Number(lastMonth.slice(8, 10)), DueDay: 5, DepositAmount: 500000,
      AgreementStatus: 'Active', PreviousOccupancyID: '', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: 'Check-in awal, deposit diterima',
    },
    {
      OccupancyID: 'OCC-0002', TenantID: 'T-0002', RoomID: 'RM-0008', CheckInDate: twoMonths,
      PlannedCheckOut: '', ActualCheckOut: '', RentalPlan: 'Monthly', AgreedMonthlyPrice: 2000000,
      BillingDay: Number(twoMonths.slice(8, 10)), DueDay: 5, DepositAmount: 500000,
      AgreementStatus: 'Active', PreviousOccupancyID: '', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: '',
    },
    {
      OccupancyID: 'OCC-0003', TenantID: 'T-0003', RoomID: 'RM-0015', CheckInDate: lastMonth,
      PlannedCheckOut: '', ActualCheckOut: '', RentalPlan: 'Monthly', AgreedMonthlyPrice: 2500000,
      BillingDay: Number(lastMonth.slice(8, 10)), DueDay: 5, DepositAmount: 750000,
      AgreementStatus: 'Active', PreviousOccupancyID: '', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: 'Penghuni belum melunasi periode pertama',
    },
  ];

  db.rooms.forEach((room) => {
    if (['RM-0001', 'RM-0008', 'RM-0015'].includes(room.RoomID)) room.OperationalStatus = 'Occupied';
  });

  db.deposits = [
    { DepositRecordID: 'DEP-0001', TenantID: 'T-0001', OccupancyID: 'OCC-0001', DepositType: 'Security Deposit', DepositAmount: 500000, AmountReturned: 0, AmountDeducted: 0, OutstandingDepositLiability: 500000, ReceiptTransactionID: 'TXN-0001', ReturnTransactionID: '', DepositStatus: 'Held', CreatedAt: now, Notes: 'Deposit check-in' },
    { DepositRecordID: 'DEP-0002', TenantID: 'T-0002', OccupancyID: 'OCC-0002', DepositType: 'Security Deposit', DepositAmount: 500000, AmountReturned: 0, AmountDeducted: 0, OutstandingDepositLiability: 500000, ReceiptTransactionID: 'TXN-0002', ReturnTransactionID: '', DepositStatus: 'Held', CreatedAt: now, Notes: 'Deposit check-in' },
    { DepositRecordID: 'DEP-0003', TenantID: 'T-0003', OccupancyID: 'OCC-0003', DepositType: 'Security Deposit', DepositAmount: 750000, AmountReturned: 0, AmountDeducted: 0, OutstandingDepositLiability: 750000, ReceiptTransactionID: 'TXN-0003', ReturnTransactionID: '', DepositStatus: 'Held', CreatedAt: now, Notes: 'Deposit check-in' },
  ];

  db.transactions = [
    { TransactionID: 'TXN-0001', TransactionDate: lastMonth, TransactionType: 'Deposit Received', Direction: 'IN', Category: 'Deposit', ReferenceType: 'Deposit', ReferenceID: 'DEP-0001', TenantID: 'T-0001', RoomID: 'RM-0001', Description: 'Deposit keamanan Budi Santoso', Amount: 500000, PaymentMethod: 'Cash', PaymentStatus: 'Confirmed', StaffID: 'ST-0004', RelatedTransactionID: '', IdempotencyKey: 'DEP-RCPT-DEP-0001', CreatedAt: now, Notes: '' },
    { TransactionID: 'TXN-0002', TransactionDate: twoMonths, TransactionType: 'Deposit Received', Direction: 'IN', Category: 'Deposit', ReferenceType: 'Deposit', ReferenceID: 'DEP-0002', TenantID: 'T-0002', RoomID: 'RM-0008', Description: 'Deposit keamanan Siti Aminah', Amount: 500000, PaymentMethod: 'Bank Transfer', PaymentStatus: 'Confirmed', StaffID: 'ST-0004', RelatedTransactionID: '', IdempotencyKey: 'DEP-RCPT-DEP-0002', CreatedAt: now, Notes: '' },
    { TransactionID: 'TXN-0003', TransactionDate: lastMonth, TransactionType: 'Deposit Received', Direction: 'IN', Category: 'Deposit', ReferenceType: 'Deposit', ReferenceID: 'DEP-0003', TenantID: 'T-0003', RoomID: 'RM-0015', Description: 'Deposit keamanan Andi Wijaya', Amount: 750000, PaymentMethod: 'Cash', PaymentStatus: 'Confirmed', StaffID: 'ST-0004', RelatedTransactionID: '', IdempotencyKey: 'DEP-RCPT-DEP-0003', CreatedAt: now, Notes: '' },
  ];

  db.reservations = [
    {
      ReservationID: 'RSV-0001', TenantID: 'T-0004', RoomID: 'RM-0002', ReservationDate: day,
      PlannedCheckIn: addMonthsClamped(day, 1).slice(0, 8) + '25', PlannedCheckOut: '', AgreedMonthlyPrice: 1500000,
      DepositAmount: 300000, ReservationStatus: 'Confirmed', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: 'Reservasi kamar A-102, menunggu check-in',
    },
  ];

  db.serviceOrders = [];
  db.invoices = [];
  db.payments = [];
  db.allocations = [];
  db.credits = [];
  db.expenses = [];
  db.activities = [
    { ActivityID: 'ACT-0001', ActivityDate: day, StaffID: 'ST-0005', Category: 'Cleaning', RoomID: 'RM-0021', TenantID: '', Description: 'Perbaikan keran dan pembersihan kamar B-107', Priority: 'High', DueDate: day, Status: 'In Progress', StartedAt: now, CompletedAt: '', VerifiedBy: '', Notes: 'Kamar dalam status maintenance' },
    { ActivityID: 'ACT-0002', ActivityDate: day, StaffID: 'ST-0005', Category: 'Maintenance', RoomID: 'RM-0015', TenantID: 'T-0003', Description: 'Cek lampu kamar B-101', Priority: 'Normal', DueDate: addMonthsClamped(day, 0), Status: 'Pending', StartedAt: '', CompletedAt: '', VerifiedBy: '', Notes: '' },
    { ActivityID: 'ACT-0003', ActivityDate: addMonthsClamped(day, -1), StaffID: 'ST-0005', Category: 'Cleaning', RoomID: 'RM-0008', TenantID: 'T-0002', Description: 'Pembersihan rutin area kamar A-201', Priority: 'Low', DueDate: addMonthsClamped(day, -1), Status: 'Completed', StartedAt: now, CompletedAt: now, VerifiedBy: 'ST-0002', Notes: '' },
  ];

  db.auditLog = [];
  db.systemLog = [];

  return db;
}

module.exports = { buildSeed };

});

__define("bootstrap", function (module, exports, require) {
'use strict';

const { today } = require('./util');
const { load, save } = require('./db');
const { generateMonthlyInvoices, updateOverdueInvoices } = require('./services/billing');
const { recordPayment } = require('./services/payments');
const { createServiceOrder } = require('./services/serviceOrders');
const { saveExpense } = require('./services/expenses');
const { audit } = require('./services/common');

function userByEmail(db, email) {
  const user = db.users.find((u) => u.Email === email);
  if (!user) throw new Error(`User demo ${email} tidak ditemukan.`);
  return user;
}

function seedDemoOperations(db, { persist = true } = {}) {
  if (db.meta.demoPaymentsSeeded) return;
  const cashier = userByEmail(db, 'kasir@kos.id');
  const receptionist = userByEmail(db, 'resepsionis@kos.id');
  const owner = userByEmail(db, 'owner@kos.id');

  const invoicesForT1 = db.invoices.filter((i) => i.TenantID === 'T-0001').sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
  const invoicesForT2 = db.invoices.filter((i) => i.TenantID === 'T-0002').sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));

  createServiceOrder(db, {
    TenantID: 'T-0001',
    ServiceID: 'SV-0001',
    Quantity: 2,
    OrderDate: today(),
    BillingMethod: 'Add to Invoice',
    InvoiceID: invoicesForT1[0] ? invoicesForT1[0].InvoiceID : '',
    Notes: 'Laundry 2 kg ditagihkan bersama sewa',
  }, receptionist);

  if (invoicesForT1[0]) {
    recordPayment(db, {
      TenantID: 'T-0001', AmountReceived: 500000, PaymentMethod: 'Cash',
      InvoiceID: invoicesForT1[0].InvoiceID, IdempotencyKey: 'DEMO-PAY-T1-1',
      Notes: 'Cicilan pertama sewa', PaymentDate: today(),
    }, cashier);
    recordPayment(db, {
      TenantID: 'T-0001', AmountReceived: 400000, PaymentMethod: 'Bank Transfer',
      InvoiceID: invoicesForT1[0].InvoiceID, IdempotencyKey: 'DEMO-PAY-T1-2',
      ReferenceNumber: 'TRX-BCA-778812', Notes: 'Cicilan kedua sewa', PaymentDate: today(),
    }, cashier);
  }

  if (invoicesForT2[0]) {
    recordPayment(db, {
      TenantID: 'T-0002', AmountReceived: invoicesForT2[0].TotalAmount, PaymentMethod: 'Bank Transfer',
      InvoiceID: invoicesForT2[0].InvoiceID, IdempotencyKey: 'DEMO-PAY-T2-1',
      ReferenceNumber: 'TRX-MANDIRI-112233', Notes: 'Pembayaran lunas periode pertama', PaymentDate: today(),
    }, cashier);
  }
  if (invoicesForT2[1]) {
    recordPayment(db, {
      TenantID: 'T-0002', AmountReceived: 1200000, PaymentMethod: 'QRIS',
      InvoiceID: invoicesForT2[1].InvoiceID, IdempotencyKey: 'DEMO-PAY-T2-2',
      ReferenceNumber: 'QRIS-900812', Notes: 'Pembayaran sebagian', PaymentDate: today(),
    }, cashier);
  }

  createServiceOrder(db, {
    TenantID: 'T-0002',
    ServiceID: 'SV-0002',
    Quantity: 1,
    OrderDate: today(),
    BillingMethod: 'Immediate Payment',
    PaymentMethod: 'Cash',
    Notes: 'Pembersihan kamar dibayar langsung',
  }, receptionist);

  const existingExpense = db.expenses.find((e) => e.Notes === 'DEMO');
  if (!existingExpense) {
    saveExpense(db, {
      ExpenseDate: today(), Category: 'Utilities', Description: 'Tagihan listrik area bersama',
      Vendor: 'PLN', Quantity: 1, UnitCost: 750000, PaymentMethod: 'Bank Transfer',
      PaymentStatus: 'Paid', Notes: 'DEMO',
    }, owner);
    saveExpense(db, {
      ExpenseDate: today(), Category: 'Cleaning Supplies', Description: 'Pembelian sabun dan alat kebersihan',
      Vendor: 'Toko Bersih Jaya', Quantity: 5, UnitCost: 30000, PaymentMethod: 'Cash',
      PaymentStatus: 'Pending', Notes: 'DEMO',
    }, owner);
  }

  db.meta.demoPaymentsSeeded = true;
  db.meta.demoSeededAt = new Date().toISOString();
  audit(db, { user: 'SYSTEM', action: 'SEED_DEMO_DATA', module: 'System', recordId: 'DEMO', next: 'Demo operations seeded' });
  if (persist) save(db);
}

function bootstrap(db) {
  const billing = generateMonthlyInvoices(db, { asOf: today(), user: 'SYSTEM' });
  updateOverdueInvoices(db, { asOf: today(), user: 'SYSTEM' });
  return { billingCount: billing.count };
}

function bootstrapLocal() {
  const db = load();
  const result = bootstrap(db);
  seedDemoOperations(db);
  save(db);
  return result;
}

module.exports = { bootstrap, bootstrapLocal, seedDemoOperations };

});

__define("db", function (module, exports, require) {
'use strict';

const { nowISO, today } = require('./util');
const { buildSeed } = require('./seed');

const TABS = {
  settings: 'Settings',
  roomTypes: 'RoomTypes',
  rooms: 'Rooms',
  tenants: 'Tenants',
  priceList: 'PriceList',
  services: 'Services',
  staff: 'Staff',
  users: 'Users',
  reservations: 'Reservations',
  occupancies: 'Occupancies',
  invoices: 'Invoices',
  payments: 'Payments',
  allocations: 'Allocations',
  credits: 'Credits',
  serviceOrders: 'ServiceOrders',
  expenses: 'Expenses',
  activities: 'Activities',
  transactions: 'Transactions',
  deposits: 'Deposits',
  auditLog: 'AuditLog',
  systemLog: 'SystemLog',
};

const HEADERS = {
  settings: ['SettingKey', 'SettingValue', 'Description', 'UpdatedAt', 'UpdatedBy'],
  roomTypes: ['RoomTypeID', 'TypeName', 'Description', 'DefaultCapacity', 'DefaultMonthlyPrice', 'Facilities', 'IsActive', 'CreatedAt', 'UpdatedAt'],
  rooms: ['RoomID', 'RoomNumber', 'Building', 'Floor', 'RoomTypeID', 'Capacity', 'Facilities', 'StandardMonthlyPrice', 'OperationalStatus', 'Notes', 'CreatedAt', 'UpdatedAt'],
  tenants: ['TenantID', 'FullName', 'IdentityType', 'IdentityNumber', 'Phone', 'Email', 'Address', 'EmergencyContact', 'EmergencyPhone', 'Occupation', 'RegistrationDate', 'TenantStatus', 'Notes', 'CreatedAt', 'UpdatedAt'],
  priceList: ['PriceID', 'ItemCode', 'ItemName', 'ItemCategory', 'RoomTypeID', 'BillingUnit', 'StandardPrice', 'EffectiveFrom', 'EffectiveTo', 'IsActive', 'Notes'],
  services: ['ServiceID', 'ServiceCode', 'ServiceName', 'Category', 'Unit', 'StandardPrice', 'CostPrice', 'IsAvailable', 'Description', 'CreatedAt', 'UpdatedAt'],
  staff: ['StaffID', 'FullName', 'Position', 'Phone', 'Email', 'StartDate', 'EndDate', 'EmploymentStatus', 'AppRole', 'Notes'],
  users: ['UserID', 'StaffID', 'Email', 'PasswordHash', 'Role', 'IsActive', 'CreatedAt', 'UpdatedAt'],
  reservations: ['ReservationID', 'TenantID', 'RoomID', 'ReservationDate', 'PlannedCheckIn', 'PlannedCheckOut', 'AgreedMonthlyPrice', 'DepositAmount', 'ReservationStatus', 'CreatedBy', 'CreatedAt', 'Notes'],
  occupancies: ['OccupancyID', 'TenantID', 'RoomID', 'CheckInDate', 'PlannedCheckOut', 'ActualCheckOut', 'RentalPlan', 'AgreedMonthlyPrice', 'BillingDay', 'DueDay', 'DepositAmount', 'AgreementStatus', 'PreviousOccupancyID', 'CreatedBy', 'CreatedAt', 'Notes'],
  invoices: ['InvoiceID', 'InvoiceNumber', 'TenantID', 'OccupancyID', 'RoomID', 'PeriodStart', 'PeriodEnd', 'InvoiceDate', 'DueDate', 'RentalAmount', 'ServiceCharges', 'OtherCharges', 'DiscountAmount', 'TotalAmount', 'AmountPaid', 'OutstandingBalance', 'InvoiceStatus', 'LateFeeApplied', 'CreatedAt', 'CreatedBy', 'Notes'],
  payments: ['PaymentID', 'ReceiptNumber', 'PaymentDate', 'TenantID', 'PaymentMethod', 'AmountReceived', 'ReferenceNumber', 'PaymentStatus', 'ReceivedBy', 'IdempotencyKey', 'CreatedAt', 'Notes'],
  allocations: ['AllocationID', 'PaymentID', 'InvoiceID', 'AllocatedAmount', 'AllocationStatus', 'CreatedAt', 'CreatedBy', 'Notes'],
  credits: ['CreditID', 'TenantID', 'PaymentID', 'Amount', 'RemainingAmount', 'Status', 'CreatedAt', 'Notes'],
  serviceOrders: ['ServiceOrderID', 'OrderDate', 'TenantID', 'RoomID', 'ServiceID', 'Quantity', 'UnitPrice', 'TotalAmount', 'OrderStatus', 'BillingMethod', 'InvoiceID', 'PaymentID', 'RequestedBy', 'ProcessedBy', 'CreatedAt', 'Notes'],
  expenses: ['ExpenseID', 'ExpenseDate', 'Category', 'Description', 'Vendor', 'Quantity', 'UnitCost', 'TotalAmount', 'PaymentMethod', 'PaymentStatus', 'ReceiptURL', 'RequestedBy', 'ApprovedBy', 'TransactionID', 'CreatedAt', 'Notes'],
  activities: ['ActivityID', 'ActivityDate', 'StaffID', 'Category', 'RoomID', 'TenantID', 'Description', 'Priority', 'DueDate', 'Status', 'StartedAt', 'CompletedAt', 'VerifiedBy', 'Notes'],
  transactions: ['TransactionID', 'TransactionDate', 'TransactionType', 'Direction', 'Category', 'ReferenceType', 'ReferenceID', 'TenantID', 'RoomID', 'Description', 'Amount', 'PaymentMethod', 'PaymentStatus', 'StaffID', 'RelatedTransactionID', 'IdempotencyKey', 'CreatedAt', 'Notes'],
  deposits: ['DepositRecordID', 'TenantID', 'OccupancyID', 'DepositType', 'DepositAmount', 'AmountReturned', 'AmountDeducted', 'OutstandingDepositLiability', 'ReceiptTransactionID', 'ReturnTransactionID', 'DepositStatus', 'CreatedAt', 'Notes'],
  auditLog: ['AuditID', 'Timestamp', 'UserID', 'Action', 'Module', 'RecordID', 'PreviousValue', 'NewValue', 'Reason', 'RequestID'],
  systemLog: ['LogID', 'Timestamp', 'FunctionName', 'Severity', 'RequestID', 'RecordID', 'ErrorMessage', 'Status'],
};

const TIMEZONE = 'Asia/Jakarta';
const COLLECTIONS = Object.keys(TABS);
const DB_PATH = '';

function emptyDb_() {
  const db = {
    meta: { schemaVersion: 1, createdAt: nowISO(), updatedAt: nowISO(), counters: {}, demoPaymentsSeeded: false },
    settings: [], roomTypes: [], rooms: [], tenants: [], priceList: [], services: [],
    staff: [], users: [], reservations: [], occupancies: [], invoices: [], payments: [],
    allocations: [], credits: [], serviceOrders: [], expenses: [], activities: [],
    transactions: [], deposits: [], auditLog: [], systemLog: [],
  };
  for (const key of COLLECTIONS) db[key] = [];
  return db;
}

function spreadsheetId_() {
  const stored = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (stored) return stored;
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active.getId();
  } catch (error) {
    // Container-bound scripts can resolve the active spreadsheet; standalone scripts cannot.
  }
  throw new Error('SPREADSHEET_ID belum diatur. Jalankan fungsi setup() terlebih dahulu.');
}

function openSpreadsheet_() {
  return SpreadsheetApp.openById(spreadsheetId_());
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function valueForSheet_(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return Utilities.formatDate(value, TIMEZONE, 'yyyy-MM-dd');
  if (typeof value === 'object') {
    const text = JSON.stringify(value);
    return text.length > 49000 ? text.slice(0, 49000) : text;
  }
  if (typeof value === 'string' && value.length > 49000) return value.slice(0, 49000);
  return value;
}

function readRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map((header) => String(header || '').trim());
  const rows = [];
  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    const row = {};
    let hasValue = false;
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      const header = headers[columnIndex];
      if (!header) continue;
      const value = valueForSheet_(values[rowIndex][columnIndex]);
      row[header] = value;
      if (value !== '' && value !== null) hasValue = true;
    }
    if (hasValue) rows.push(row);
  }
  return rows;
}

function writeRows_(sheet, baseHeaders, rows) {
  const headers = [];
  const seen = {};
  const add = (header) => {
    const key = String(header || '').trim();
    if (!key || seen[key]) return;
    seen[key] = true;
    headers.push(key);
  };
  baseHeaders.forEach(add);
  if (sheet.getLastColumn() > 0) {
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].forEach(add);
  }
  rows.forEach((row) => Object.keys(row).forEach(add));

  const values = [headers].concat(rows.map((row) => headers.map((header) => valueForSheet_(row[header]))));
  const target = sheet.getRange(1, 1, values.length, headers.length);
  target.setNumberFormat('@');
  sheet.clearContents();
  target.setValues(values);
  sheet.setFrozenRows(1);
}

function readMeta_(sheet) {
  const meta = { schemaVersion: 1, createdAt: nowISO(), updatedAt: nowISO(), counters: {}, demoPaymentsSeeded: false };
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return meta;
  for (let index = 1; index < values.length; index += 1) {
    if (String(values[index][0]) === 'meta' && values[index][1]) {
      try {
        const parsed = JSON.parse(values[index][1]);
        Object.keys(parsed).forEach((key) => { meta[key] = parsed[key]; });
      } catch (error) {
        // Fall back to defaults when the meta payload is unreadable.
      }
    }
  }
  if (!meta.counters) meta.counters = {};
  return meta;
}

function snapshot_(db) {
  const state = {};
  COLLECTIONS.forEach((key) => { state[key] = JSON.stringify(db[key] || []); });
  return state;
}

function remember_(db, state) {
  Object.defineProperty(db, '__original', {
    value: state,
    enumerable: false,
    configurable: true,
    writable: true,
  });
}

function load(options) {
  const allowSeed = !options || options.seed !== false;
  const spreadsheet = openSpreadsheet_();
  const metaSheet = spreadsheet.getSheetByName('Meta') || ensureSheet_(spreadsheet, 'Meta', ['Key', 'Value']);
  const db = emptyDb_();
  db.meta = readMeta_(metaSheet);
  COLLECTIONS.forEach((key) => {
    const sheet = spreadsheet.getSheetByName(TABS[key]) || ensureSheet_(spreadsheet, TABS[key], HEADERS[key]);
    db[key] = readRows_(sheet);
  });

  const empty = !db.rooms.length && !db.users.length && !db.settings.length;
  if (empty && allowSeed) {
    buildSeed(db);
    save(db);
  }
  remember_(db, snapshot_(db));
  return db;
}

function bumpApiCacheVersion_() {
  try {
    PropertiesService.getScriptProperties().setProperty('API_CACHE_VERSION', Utilities.getUuid());
  } catch (error) {
    // Cached reads simply expire after their TTL when versioning is unavailable.
  }
}

function save(db) {
  if (!db) throw new Error('Database belum dimuat.');
  const spreadsheet = openSpreadsheet_();
  db.meta.updatedAt = nowISO();
  const metaSheet = ensureSheet_(spreadsheet, 'Meta', ['Key', 'Value']);
  const previous = db.__original || {};
  COLLECTIONS.forEach((key) => {
    const serialized = JSON.stringify(db[key] || []);
    if (previous[key] === serialized) return;
    const sheet = ensureSheet_(spreadsheet, TABS[key], HEADERS[key]);
    writeRows_(sheet, HEADERS[key], db[key] || []);
  });
  metaSheet.clearContents();
  metaSheet.getRange(1, 1, 2, 2).setValues([['Key', 'Value'], ['meta', JSON.stringify(db.meta)]]);
  SpreadsheetApp.flush();
  bumpApiCacheVersion_();
  remember_(db, snapshot_(db));
  return db;
}

function withLock(work) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const db = load();
    const result = work(db);
    save(db);
    return result;
  } finally {
    lock.releaseLock();
  }
}

function resetCacheForTests() {}

function isConfigured() {
  try {
    spreadsheetId_();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { DB_PATH, TABS, HEADERS, load, save, withLock, isConfigured, resetCacheForTests };

});

__define("password", function (module, exports, require) {
'use strict';

const ROUNDS = 800;

function toHex_(bytes) {
  return bytes.map((byte) => ((byte + 256) % 256).toString(16).padStart(2, '0')).join('');
}

function derive_(password, salt, rounds) {
  let value = `${salt}:${password}`;
  for (let index = 0; index < rounds; index += 1) {
    value = toHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value));
  }
  return value;
}

function hashPassword(password) {
  const salt = Utilities.getUuid().replace(/-/g, '');
  return `sha256$${ROUNDS}$${salt}$${derive_(password, salt, ROUNDS)}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('sha256$')) return false;
  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const rounds = Number(parts[1]);
  if (!Number.isFinite(rounds) || rounds < 1 || rounds > 5000) return false;
  const derived = derive_(password, parts[2], rounds);
  if (derived.length !== parts[3].length) return false;
  let mismatch = 0;
  for (let index = 0; index < derived.length; index += 1) {
    mismatch |= derived.charCodeAt(index) ^ parts[3].charCodeAt(index);
  }
  return mismatch === 0;
}

module.exports = { hashPassword, verifyPassword };

});

__define("auth", function (module, exports, require) {
'use strict';

const { AppError } = require('./util');
const { verifyPassword } = require('./password');

const SESSION_CACHE = 'kos_sessions';
const SESSION_TTL_SECONDS = 21600;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

const PERMISSIONS = {
  Owner: { '*': ['*'] },
  Manager: {
    dashboard: ['read'], rooms: ['read', 'write'], roomTypes: ['read', 'write'],
    tenants: ['read', 'write'], reservations: ['read', 'write'], agreements: ['read', 'write'],
    invoices: ['read', 'generate', 'write'], payments: ['read', 'void'],
    services: ['read', 'write'], expenses: ['read', 'write', 'approve'],
    transactions: ['read'], deposits: ['read', 'write'], staff: ['read'],
    activities: ['read', 'write'], reports: ['read'], master: ['read', 'write'],
    audit: ['read'], settings: ['read'], system: ['run'],
  },
  Receptionist: {
    dashboard: ['read'], rooms: ['read'], roomTypes: ['read'], tenants: ['read', 'write'],
    reservations: ['read', 'write'], agreements: ['read', 'write'], invoices: ['read'],
    services: ['read', 'write'], deposits: ['read'], activities: ['read', 'write'],
    reports: ['read'], master: ['read'], settings: ['read'],
  },
  Cashier: {
    dashboard: ['read'], tenants: ['read'], invoices: ['read'], payments: ['read', 'write'],
    services: ['read', 'write'], deposits: ['read'], transactions: ['read'],
    reports: ['read'], master: ['read'], settings: ['read'],
  },
  'Operational Staff': {
    dashboard: ['read'], rooms: ['read'], activities: ['read', 'write'],
  },
};

function can(user, module, action) {
  if (!user) return false;
  const perms = PERMISSIONS[user.Role];
  if (!perms) return false;
  if (perms['*'] && perms['*'].includes('*')) return true;
  const actions = perms[module];
  return !!actions && (actions.includes('*') || actions.includes(action));
}

function guard(user, module, action) {
  if (!user) throw new AppError('Silakan login terlebih dahulu.', 401, 'UNAUTHORIZED');
  if (!can(user, module, action)) throw new AppError('Anda tidak memiliki akses untuk tindakan ini.', 403, 'FORBIDDEN');
}

function sessionKey_(token) {
  return `kos_session_${token}`;
}

function sha256Hex_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value || ''));
  return bytes.map((byte) => ((byte & 0xff) + 0x100).toString(16).slice(1)).join('');
}

function credentialFingerprint_(user) {
  return sha256Hex_(user.PasswordHash);
}

function loginAttemptKey_(email) {
  return `kos_login_${sha256Hex_(email)}`;
}

function loginState_(email) {
  const raw = CacheService.getScriptCache().get(loginAttemptKey_(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ensureLoginAllowed_(email) {
  const state = loginState_(email);
  if (!state) return;
  const now = Date.now();
  if (state.lockedUntil && now < state.lockedUntil) {
    const minutes = Math.max(1, Math.ceil((state.lockedUntil - now) / 60000));
    throw new AppError(`Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`, 429, 'TOO_MANY_ATTEMPTS');
  }
}

function recordLoginFailure_(email) {
  const now = Date.now();
  let state = loginState_(email);
  if (!state || now - Number(state.firstAt || 0) >= LOGIN_WINDOW_SECONDS * 1000) {
    state = { count: 0, firstAt: now, lockedUntil: 0 };
  }
  state.count = Number(state.count || 0) + 1;
  if (state.count >= LOGIN_MAX_ATTEMPTS) state.lockedUntil = now + LOGIN_WINDOW_SECONDS * 1000;
  CacheService.getScriptCache().put(loginAttemptKey_(email), JSON.stringify(state), LOGIN_WINDOW_SECONDS);
}

function clearLoginFailures_(email) {
  CacheService.getScriptCache().remove(loginAttemptKey_(email));
}

function login(db, email, password) {
  const normalized = String(email || '').trim().toLowerCase().slice(0, 320);
  const candidate = String(password || '').slice(0, 1024);
  ensureLoginAllowed_(normalized);
  const user = db.users.find((row) => row.Email.toLowerCase() === normalized);
  if (!user || user.IsActive !== 'TRUE' || !verifyPassword(candidate, user.PasswordHash)) {
    recordLoginFailure_(normalized);
    throw new AppError('Email atau password salah.', 401, 'INVALID_CREDENTIALS');
  }
  clearLoginFailures_(normalized);
  const token = `${Utilities.getUuid().replace(/-/g, '')}${Utilities.getUuid().replace(/-/g, '')}`;
  CacheService.getScriptCache().put(
    sessionKey_(token),
    JSON.stringify({ UserID: user.UserID, credential: credentialFingerprint_(user), createdAt: Date.now() }),
    SESSION_TTL_SECONDS
  );
  return { token, user };
}

function logout(token) {
  if (token) CacheService.getScriptCache().remove(sessionKey_(token));
}

function sessionUser(db, token) {
  if (!token) return null;
  const raw = CacheService.getScriptCache().get(sessionKey_(token));
  if (!raw) return null;
  let session;
  try { session = JSON.parse(raw); } catch (error) { return null; }
  if (!session || !session.UserID) return null;
  const user = db.users.find((row) => row.UserID === session.UserID && row.IsActive === 'TRUE');
  if (!user) return null;
  if (!session.credential || session.credential !== credentialFingerprint_(user)) {
    CacheService.getScriptCache().remove(sessionKey_(token));
    return null;
  }
  const staff = db.staff.find((row) => row.StaffID === user.StaffID);
  return {
    UserID: user.UserID,
    StaffID: user.StaffID,
    Email: user.Email,
    Role: user.Role,
    FullName: staff ? staff.FullName : user.Email,
    Position: staff ? staff.Position : '',
    Permissions: PERMISSIONS[user.Role] || {},
  };
}

module.exports = { PERMISSIONS, can, guard, login, logout, sessionUser };

});

__define("jobs", function (module, exports, require) {
'use strict';

const { today } = require('./util');
const { generateMonthlyInvoices, updateOverdueInvoices } = require('./services/billing');
const { reconcile } = require('./services/reports');
const { audit } = require('./services/common');
const { withLock } = require('./db');

function runBillingJobs(db, { user = 'SYSTEM', asOf = today() } = {}) {
  const billing = generateMonthlyInvoices(db, { asOf, user });
  const overdue = updateOverdueInvoices(db, { asOf, user });
  const recon = reconcile(db);
  return { asOf, billing, overdue: overdue.length, reconciliation: recon };
}

function backupDatabase() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diatur.');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const copy = DriveApp.getFileById(id).makeCopy(`kos-backup-${stamp}`);
  return copy.getUrl();
}

function dailyJobs() {
  return withLock((db) => {
    const day = today();
    const result = runBillingJobs(db, { asOf: day, user: 'SYSTEM' });
    audit(db, {
      user: 'SYSTEM',
      action: 'AUTO_BILLING',
      module: 'Automation',
      recordId: 'DAILY_JOB',
      next: JSON.stringify({ created: result.billing.count, overdue: result.overdue }),
    });
    backupDatabase();
    return result;
  });
}

function installTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some((trigger) => trigger.getHandlerFunction() === 'dailyJobs');
  if (!exists) {
    ScriptApp.newTrigger('dailyJobs').timeBased().atHour(1).everyDays(1).create();
  }
  return !exists;
}

module.exports = { runBillingJobs, backupDatabase, dailyJobs, installTriggers };

});

__define("services/activities", function (module, exports, require) {
'use strict';

const { today, nowISO, makeId, AppError, requireFields, requireEnum, cleanText, isDate } = require('../util');
const { audit, findById } = require('./common');

const ACTIVITY_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const ACTIVITY_CATEGORIES = ['Cleaning', 'Maintenance', 'Inspection', 'Security', 'Administration', 'Other'];

function listActivities(db, filters = {}, user = null) {
  let rows = db.activities.map((activity) => {
    const staff = db.staff.find((s) => s.StaffID === activity.StaffID);
    const room = db.rooms.find((r) => r.RoomID === activity.RoomID);
    const tenant = db.tenants.find((t) => t.TenantID === activity.TenantID);
    return {
      ...activity,
      StaffName: staff ? staff.FullName : 'Belum ditugaskan',
      RoomNumber: room ? room.RoomNumber : '',
      TenantName: tenant ? tenant.FullName : '',
    };
  });
  if (user && user.Role === 'Operational Staff') {
    rows = rows.filter((row) => row.StaffID === user.StaffID);
  }
  if (filters.status) rows = rows.filter((row) => row.Status === filters.status);
  if (filters.staffId) rows = rows.filter((row) => row.StaffID === filters.staffId);
  if (filters.roomId) rows = rows.filter((row) => row.RoomID === filters.roomId);
  if (filters.from) rows = rows.filter((row) => row.ActivityDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.ActivityDate <= filters.to);
  rows.sort((a, b) => {
    const order = { Pending: 0, 'In Progress': 1, Completed: 2, Cancelled: 3 };
    if (order[a.Status] !== order[b.Status]) return order[a.Status] - order[b.Status];
    return b.ActivityDate.localeCompare(a.ActivityDate);
  });
  return rows;
}

function createActivity(db, data, user) {
  requireFields(data, ['StaffID', 'Category', 'Description']);
  const staff = findById(db.staff, 'StaffID', data.StaffID);
  const category = requireEnum(data.Category, ACTIVITY_CATEGORIES, 'Kategori');
  const activityDate = data.ActivityDate || today();
  if (!isDate(activityDate)) throw new AppError('Tanggal aktivitas tidak valid.');
  const activity = {
    ActivityID: makeId(db, 'activity', 'ACT'),
    ActivityDate: activityDate,
    StaffID: staff.StaffID,
    Category: category,
    RoomID: data.RoomID || '',
    TenantID: data.TenantID || '',
    Description: cleanText(data.Description, 500),
    Priority: requireEnum(data.Priority || 'Normal', ['Low', 'Normal', 'High', 'Urgent'], 'Prioritas'),
    DueDate: data.DueDate || activityDate,
    Status: 'Pending',
    StartedAt: '',
    CompletedAt: '',
    VerifiedBy: '',
    Notes: cleanText(data.Notes, 500),
  };
  db.activities.push(activity);
  audit(db, { user: user.StaffID, action: 'CREATE_ACTIVITY', module: 'Activities', recordId: activity.ActivityID, next: JSON.stringify(activity) });
  return activity;
}

function updateActivity(db, activityId, data, user) {
  const activity = findById(db.activities, 'ActivityID', activityId);
  if (user.Role === 'Operational Staff' && activity.StaffID !== user.StaffID) {
    throw new AppError('Anda hanya dapat memperbarui tugas yang ditugaskan kepada Anda.', 403, 'FORBIDDEN');
  }
  const previous = JSON.stringify(activity);
  if (data.Status) {
    const status = requireEnum(data.Status, ACTIVITY_STATUSES, 'Status aktivitas');
    if (status === 'In Progress' && !activity.StartedAt) activity.StartedAt = nowISO();
    if (status === 'Completed') {
      activity.CompletedAt = nowISO();
      if (!activity.StartedAt) activity.StartedAt = nowISO();
      activity.VerifiedBy = user.StaffID;
    }
    activity.Status = status;
  }
  if (data.Notes !== undefined) activity.Notes = cleanText(data.Notes, 500);
  if (data.Priority !== undefined) activity.Priority = requireEnum(data.Priority, ['Low', 'Normal', 'High', 'Urgent'], 'Prioritas');
  if (data.StaffID !== undefined && user.Role !== 'Operational Staff') {
    findById(db.staff, 'StaffID', data.StaffID);
    activity.StaffID = data.StaffID;
  }

  if (activity.Status === 'Completed' && activity.RoomID) {
    const room = db.rooms.find((r) => r.RoomID === activity.RoomID);
    const hasOccupant = db.occupancies.some((o) => o.RoomID === activity.RoomID && o.AgreementStatus === 'Active');
    if (room && room.OperationalStatus === 'Maintenance' && !hasOccupant) {
      room.OperationalStatus = 'Available';
      room.UpdatedAt = nowISO();
    }
  }
  audit(db, { user: user.StaffID, action: 'UPDATE_ACTIVITY', module: 'Activities', recordId: activityId, previous, next: JSON.stringify(activity) });
  return activity;
}

module.exports = { ACTIVITY_STATUSES, ACTIVITY_CATEGORIES, listActivities, createActivity, updateActivity };

});

__define("services/billing", function (module, exports, require) {
'use strict';

const {
  today, nowISO, addDays, addMonthsClamped, daysBetween, monthEnd, makeId, makeInvoiceNumber,
  AppError, requireDate, requireAmount, cleanText,
} = require('../util');
const { audit, getNumberSetting, getSetting, findById } = require('./common');

function proratedRental(db, occupancy, periodStart, periodEnd) {
  const price = Number(occupancy.AgreedMonthlyPrice);
  if (getSetting(db, 'ProrateMidMonth', 'false') !== 'true') return price;
  const naturalEnd = addDays(addMonthsClamped(periodStart, 1), -1);
  const checkIn = occupancy.CheckInDate > periodStart ? occupancy.CheckInDate : periodStart;
  let checkOut = periodEnd < naturalEnd ? periodEnd : naturalEnd;
  for (const candidate of [occupancy.ActualCheckOut, occupancy.PlannedCheckOut]) {
    if (candidate && candidate >= checkIn && candidate < checkOut) checkOut = candidate;
  }
  const totalDays = Math.max(1, daysBetween(periodStart, naturalEnd) + 1);
  const usedDays = Math.max(0, daysBetween(checkIn, checkOut) + 1);
  if (usedDays >= totalDays) return price;
  return Math.round((price * usedDays) / totalDays);
}

function invoiceTotal(invoice) {
  return Number(invoice.RentalAmount || 0)
    + Number(invoice.ServiceCharges || 0)
    + Number(invoice.OtherCharges || 0)
    - Number(invoice.DiscountAmount || 0);
}

function validAllocatedAmount(db, invoiceId) {
  return db.allocations
    .filter((allocation) => allocation.InvoiceID === invoiceId && allocation.AllocationStatus === 'Valid')
    .reduce((sum, allocation) => sum + Number(allocation.AllocatedAmount || 0), 0);
}

function recalculateInvoice(db, invoice, asOf = today()) {
  if (invoice.InvoiceStatus === 'Cancelled') {
    invoice.AmountPaid = 0;
    invoice.OutstandingBalance = 0;
    return invoice;
  }
  const total = invoiceTotal(invoice);
  const paid = validAllocatedAmount(db, invoice.InvoiceID);
  invoice.TotalAmount = total;
  invoice.AmountPaid = paid;
  invoice.OutstandingBalance = Math.max(0, total - paid);
  if (total > 0 && paid >= total) invoice.InvoiceStatus = 'Paid';
  else if (paid > 0) invoice.InvoiceStatus = 'Partially Paid';
  else if (invoice.DueDate && asOf > invoice.DueDate) invoice.InvoiceStatus = 'Overdue';
  else invoice.InvoiceStatus = 'Issued';
  return invoice;
}

function recalculateAllInvoices(db, asOf = today()) {
  db.invoices.forEach((invoice) => recalculateInvoice(db, invoice, asOf));
}

function decorateInvoice(db, invoice) {
  const tenant = db.tenants.find((t) => t.TenantID === invoice.TenantID);
  const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
  const occupancy = db.occupancies.find((o) => o.OccupancyID === invoice.OccupancyID);
  return {
    ...invoice,
    TenantName: tenant ? tenant.FullName : invoice.TenantID,
    TenantPhone: tenant ? tenant.Phone : '',
    RoomNumber: room ? room.RoomNumber : '',
    CheckInDate: occupancy ? occupancy.CheckInDate : '',
    DaysOverdue: invoice.InvoiceStatus === 'Overdue' && invoice.DueDate
      ? Math.max(0, Math.round((new Date(today()) - new Date(invoice.DueDate)) / 86400000))
      : 0,
  };
}

function listInvoices(db, filters = {}) {
  recalculateAllInvoices(db, filters.asOf || today());
  let rows = db.invoices.map((invoice) => decorateInvoice(db, invoice));
  if (filters.status) rows = rows.filter((row) => row.InvoiceStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.roomId) rows = rows.filter((row) => row.RoomID === filters.roomId);
  if (filters.from) rows = rows.filter((row) => row.InvoiceDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.InvoiceDate <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.InvoiceNumber} ${row.TenantName} ${row.RoomNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    if (a.InvoiceDate === b.InvoiceDate) return b.InvoiceNumber.localeCompare(a.InvoiceNumber);
    return b.InvoiceDate.localeCompare(a.InvoiceDate);
  });
  return rows;
}

function getInvoiceDetail(db, invoiceId) {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  recalculateInvoice(db, invoice);
  const allocations = db.allocations.filter((a) => a.InvoiceID === invoiceId).map((allocation) => {
    const payment = db.payments.find((p) => p.PaymentID === allocation.PaymentID);
    return { ...allocation, PaymentDate: payment ? payment.PaymentDate : '', ReceiptNumber: payment ? payment.ReceiptNumber : '', PaymentMethod: payment ? payment.PaymentMethod : '' };
  });
  return { invoice: decorateInvoice(db, invoice), allocations };
}

function createInvoiceForPeriod(db, occupancy, periodStart, user, periodEndOverride = '') {
  const invoiceDate = today();
  const dueDays = getNumberSetting(db, 'DefaultDueDays', 5);
  const periodEnd = periodEndOverride || addDays(addMonthsClamped(periodStart, 1), -1);
  const rentalAmount = proratedRental(db, occupancy, periodStart, periodEnd);
  const invoice = {
    InvoiceID: makeId(db, 'invoice', 'INV'),
    InvoiceNumber: makeInvoiceNumber(db, getSetting(db, 'InvoicePrefix', 'INV'), invoiceDate),
    TenantID: occupancy.TenantID,
    OccupancyID: occupancy.OccupancyID,
    RoomID: occupancy.RoomID,
    PeriodStart: periodStart,
    PeriodEnd: periodEnd,
    InvoiceDate: invoiceDate,
    DueDate: addDays(periodStart, dueDays),
    RentalAmount: rentalAmount,
    ServiceCharges: 0,
    OtherCharges: 0,
    DiscountAmount: 0,
    TotalAmount: rentalAmount,
    AmountPaid: 0,
    OutstandingBalance: rentalAmount,
    InvoiceStatus: 'Issued',
    CreatedAt: nowISO(),
    CreatedBy: user,
    Notes: `Sewa periode ${periodStart} s.d. ${periodEnd}`,
  };
  db.invoices.push(invoice);
  recalculateInvoice(db, invoice);
  audit(db, {
    user, action: 'CREATE_INVOICE', module: 'Invoices', recordId: invoice.InvoiceID,
    next: JSON.stringify({ InvoiceNumber: invoice.InvoiceNumber, OccupancyID: occupancy.OccupancyID, PeriodStart: periodStart, TotalAmount: invoice.TotalAmount }),
  });
  return invoice;
}

/**
 * Idempotent monthly billing. Invoices are unique by occupancy + period start.
 * A daily trigger can safely call this repeatedly; existing periods are skipped.
 */
function generateMonthlyInvoices(db, { asOf = today(), user = 'SYSTEM' } = {}) {
  const created = [];
  const skipped = [];
  const advance = getNumberSetting(db, 'BillingAdvanceDays', 0);
  const limitDate = addDays(asOf, advance);
  const occupancies = db.occupancies.filter((o) => o.AgreementStatus === 'Active' && o.CheckInDate <= limitDate);

  for (const occupancy of occupancies) {
    const existing = db.invoices
      .filter((invoice) => invoice.OccupancyID === occupancy.OccupancyID)
      .sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
    const prorate = getSetting(db, 'ProrateMidMonth', 'false') === 'true';
    const hardEnd = occupancy.ActualCheckOut || occupancy.PlannedCheckOut || '';
    let firstPeriodEnd = '';
    if (!existing.length && prorate && occupancy.CheckInDate.slice(8, 10) !== '01') {
      const end = monthEnd(occupancy.CheckInDate);
      if (end > occupancy.CheckInDate) firstPeriodEnd = end;
    }
    let periodStart = occupancy.CheckInDate;
    if (existing.length) {
      const lastEnd = existing[existing.length - 1].PeriodEnd;
      periodStart = addDays(lastEnd, 1);
    }
    let guard = 0;
    while (periodStart <= limitDate && guard < 120) {
      guard += 1;
      if (hardEnd && periodStart > hardEnd) break;
      const duplicate = db.invoices.find(
        (invoice) => invoice.OccupancyID === occupancy.OccupancyID && invoice.PeriodStart === periodStart
      );
      if (duplicate) {
        skipped.push({ OccupancyID: occupancy.OccupancyID, PeriodStart: periodStart });
        periodStart = addDays(duplicate.PeriodEnd, 1);
        continue;
      }
      let periodEndOverride = '';
      const naturalEnd = addDays(addMonthsClamped(periodStart, 1), -1);
      if (firstPeriodEnd && periodStart === occupancy.CheckInDate) periodEndOverride = firstPeriodEnd;
      else if (prorate && hardEnd && hardEnd >= periodStart && hardEnd < naturalEnd) periodEndOverride = hardEnd;
      const invoice = createInvoiceForPeriod(db, occupancy, periodStart, user, periodEndOverride);
      created.push(invoice);
      periodStart = addDays(invoice.PeriodEnd, 1);
    }
  }
  recalculateAllInvoices(db, asOf);
  return { created, skipped, count: created.length };
}

function updateOverdueInvoices(db, { asOf = today(), user = 'SYSTEM' } = {}) {
  const changed = [];
  const lateFeeEnabled = getSetting(db, 'LateFeeEnabled', 'false') === 'true';
  const lateFeePercent = getNumberSetting(db, 'LateFeePercent', 0);
  for (const invoice of db.invoices) {
    if (invoice.InvoiceStatus === 'Cancelled') continue;
    const before = invoice.InvoiceStatus;
    recalculateInvoice(db, invoice, asOf);
    if (invoice.InvoiceStatus === 'Overdue' && lateFeeEnabled && lateFeePercent > 0 && invoice.LateFeeApplied !== 'TRUE') {
      const fee = Math.round((invoiceTotal(invoice) * lateFeePercent) / 100);
      if (fee > 0) {
        invoice.OtherCharges = Number(invoice.OtherCharges || 0) + fee;
        invoice.LateFeeApplied = 'TRUE';
        invoice.Notes = cleanText(`${invoice.Notes} | Denda keterlambatan ${lateFeePercent}% (${fee})`, 700);
        recalculateInvoice(db, invoice, asOf);
      }
    }
    if (invoice.InvoiceStatus === 'Overdue' && before !== 'Overdue') {
      changed.push(invoice);
    }
  }
  if (changed.length) {
    audit(db, { user, action: 'MARK_OVERDUE', module: 'Invoices', next: JSON.stringify(changed.map((i) => i.InvoiceID)) });
  }
  return changed;
}

function cancelInvoice(db, invoiceId, reason, user) {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  if (invoice.InvoiceStatus === 'Cancelled') throw new AppError('Invoice sudah dibatalkan.');
  if (validAllocatedAmount(db, invoiceId) > 0) {
    throw new AppError('Invoice yang sudah memiliki pembayaran tidak dapat dibatalkan. Lakukan void pembayaran atau koreksi.');
  }
  recalculateInvoice(db, invoice);
  const previous = JSON.stringify({ status: invoice.InvoiceStatus, outstanding: invoice.OutstandingBalance });
  invoice.InvoiceStatus = 'Cancelled';
  invoice.OutstandingBalance = 0;
  invoice.Notes = `${invoice.Notes} | Dibatalkan: ${cleanText(reason, 300)}`;
  audit(db, { user: user.StaffID, action: 'CANCEL_INVOICE', module: 'Invoices', recordId: invoiceId, previous, next: JSON.stringify(invoice), reason });
  return invoice;
}

function applyInvoiceAdjustment(db, invoiceId, data, user) {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  if (invoice.InvoiceStatus === 'Cancelled') throw new AppError('Invoice yang dibatalkan tidak dapat disesuaikan.');
  const previous = JSON.stringify(invoice);
  if (data.OtherCharges !== undefined) invoice.OtherCharges = requireAmount(data.OtherCharges, 'Biaya lain-lain', { allowZero: true });
  if (data.DiscountAmount !== undefined) invoice.DiscountAmount = requireAmount(data.DiscountAmount, 'Diskon', { allowZero: true });
  if (Number(data.DiscountAmount || invoice.DiscountAmount) > Number(invoice.RentalAmount) + Number(invoice.OtherCharges) + Number(invoice.ServiceCharges)) {
    throw new AppError('Diskon melebihi total tagihan.');
  }
  invoice.Notes = cleanText(data.Notes || invoice.Notes, 500);
  recalculateInvoice(db, invoice);
  audit(db, { user: user.StaffID, action: 'ADJUST_INVOICE', module: 'Invoices', recordId: invoiceId, previous, next: JSON.stringify(invoice), reason: data.Reason || '' });
  return invoice;
}

function addServiceCharge(db, invoiceId, amount, note = '') {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  if (['Cancelled', 'Paid'].includes(invoice.InvoiceStatus)) {
    throw new AppError('Service tidak dapat ditambahkan ke invoice yang sudah lunas atau dibatalkan.');
  }
  invoice.ServiceCharges = Number(invoice.ServiceCharges || 0) + Number(amount);
  if (note) invoice.Notes = cleanText(`${invoice.Notes} | ${note}`, 700);
  recalculateInvoice(db, invoice);
  return invoice;
}

function findOpenInvoiceForTenant(db, tenantId) {
  recalculateAllInvoices(db);
  const open = db.invoices
    .filter((invoice) => invoice.TenantID === tenantId && !['Paid', 'Cancelled'].includes(invoice.InvoiceStatus))
    .sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
  return open[0] || null;
}

module.exports = {
  invoiceTotal,
  validAllocatedAmount,
  recalculateInvoice,
  recalculateAllInvoices,
  decorateInvoice,
  listInvoices,
  getInvoiceDetail,
  generateMonthlyInvoices,
  updateOverdueInvoices,
  cancelInvoice,
  applyInvoiceAdjustment,
  addServiceCharge,
  findOpenInvoiceForTenant,
  createInvoiceForPeriod,
  requireDate,
};

});

__define("services/common", function (module, exports, require) {
'use strict';

const { nowISO, makeId, today, AppError } = require('../util');

function getSetting(db, key, fallback = '') {
  const row = db.settings.find((s) => s.SettingKey === key);
  return row ? row.SettingValue : fallback;
}

function getNumberSetting(db, key, fallback = 0) {
  const value = Number(getSetting(db, key, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function getBooleanSetting(db, key, fallback = false) {
  const value = String(getSetting(db, key, fallback)).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

function setSetting(db, key, value, user, description = '') {
  const existing = db.settings.find((s) => s.SettingKey === key);
  if (existing) {
    existing.SettingValue = String(value);
    existing.UpdatedAt = nowISO();
    existing.UpdatedBy = user;
    if (description) existing.Description = description;
  } else {
    db.settings.push({
      SettingKey: key,
      SettingValue: String(value),
      Description: description,
      UpdatedAt: nowISO(),
      UpdatedBy: user,
    });
  }
}

function audit(db, { user, action, module, recordId = '', previous = '', next = '', reason = '', requestId = '' }) {
  db.auditLog.push({
    AuditID: makeId(db, 'audit', 'AUD'),
    Timestamp: nowISO(),
    UserID: user || 'SYSTEM',
    Action: action,
    Module: module,
    RecordID: recordId,
    PreviousValue: typeof previous === 'string' ? previous : JSON.stringify(previous),
    NewValue: typeof next === 'string' ? next : JSON.stringify(next),
    Reason: reason,
    RequestID: requestId,
  });
}

function logError(db, { functionName, severity = 'ERROR', requestId = '', recordId = '', errorMessage = '', status = 'Failed' }) {
  db.systemLog.push({
    LogID: makeId(db, 'systemLog', 'LOG'),
    Timestamp: nowISO(),
    FunctionName: functionName,
    Severity: severity,
    RequestID: requestId,
    RecordID: recordId,
    ErrorMessage: String(errorMessage).slice(0, 1000),
    Status: status,
  });
}

function findById(rows, key, id) {
  const row = rows.find((item) => item[key] === id);
  if (!row) throw new AppError(`Data dengan ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  return row;
}

function staffIdForUser(db, user) {
  if (!user) return '';
  return user.StaffID || '';
}

function actorName(db, user) {
  if (!user) return 'SYSTEM';
  const staff = db.staff.find((s) => s.StaffID === user.StaffID);
  return staff ? staff.FullName : user.Email;
}

function todayClampedStart(value) {
  return value || today();
}

module.exports = {
  getSetting,
  getNumberSetting,
  getBooleanSetting,
  setSetting,
  audit,
  logError,
  findById,
  staffIdForUser,
  actorName,
  todayClampedStart,
};

});

__define("services/deposits", function (module, exports, require) {
'use strict';

const { today, nowISO, AppError, requireAmount, requireFields, cleanText } = require('../util');
const { audit, findById } = require('./common');
const { createTransaction } = require('./payments');

function listDeposits(db, filters = {}) {
  let rows = db.deposits.map((deposit) => {
    const tenant = db.tenants.find((t) => t.TenantID === deposit.TenantID);
    const occupancy = db.occupancies.find((o) => o.OccupancyID === deposit.OccupancyID);
    const room = occupancy ? db.rooms.find((r) => r.RoomID === occupancy.RoomID) : null;
    return {
      ...deposit,
      TenantName: tenant ? tenant.FullName : deposit.TenantID,
      RoomNumber: room ? room.RoomNumber : '',
      CheckInDate: occupancy ? occupancy.CheckInDate : '',
    };
  });
  if (filters.status) rows = rows.filter((row) => row.DepositStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  rows.sort((a, b) => b.CreatedAt.localeCompare(a.CreatedAt));
  return rows;
}

function recordDepositReturn(db, data, user) {
  requireFields(data, ['DepositRecordID']);
  const deposit = findById(db.deposits, 'DepositRecordID', data.DepositRecordID);
  if (['Returned', 'Voided'].includes(deposit.DepositStatus)) throw new AppError('Deposit ini sudah diselesaikan.');
  const outstanding = Number(deposit.OutstandingDepositLiability);
  const returned = requireAmount(data.AmountReturned || 0, 'Jumlah pengembalian', { allowZero: true });
  const deducted = requireAmount(data.AmountDeducted || 0, 'Jumlah potongan', { allowZero: true });
  if (returned + deducted <= 0) throw new AppError('Masukkan jumlah pengembalian atau potongan.');
  if (returned + deducted > outstanding) throw new AppError('Pengembalian dan potongan melebihi saldo deposit.');
  const previous = JSON.stringify(deposit);
  deposit.AmountReturned = Number(deposit.AmountReturned) + returned;
  deposit.AmountDeducted = Number(deposit.AmountDeducted) + deducted;
  deposit.OutstandingDepositLiability = outstanding - returned - deducted;
  deposit.DepositStatus = deposit.OutstandingDepositLiability === 0 ? 'Returned' : 'Partially Returned';
  deposit.Notes = `${deposit.Notes} | ${cleanText(data.Notes, 250)}`;
  if (returned > 0) {
    const occupancy = db.occupancies.find((o) => o.OccupancyID === deposit.OccupancyID);
    const tx = createTransaction(db, {
      date: data.ReturnDate || today(), type: 'Deposit Returned', direction: 'OUT', category: 'Deposit',
      referenceType: 'Deposit', referenceId: deposit.DepositRecordID,
      tenantId: deposit.TenantID, roomId: occupancy ? occupancy.RoomID : '',
      description: `Pengembalian deposit ${deposit.DepositRecordID}`,
      amount: returned, method: data.ReturnMethod || 'Cash', status: 'Confirmed', staffId: user.StaffID,
      key: `DEP:RET:${deposit.DepositRecordID}:${data.ReturnDate || today()}`,
    });
    deposit.ReturnTransactionID = tx.TransactionID;
  }
  audit(db, { user: user.StaffID, action: 'RETURN_DEPOSIT', module: 'Deposits', recordId: deposit.DepositRecordID, previous, next: JSON.stringify(deposit), reason: data.Notes || '' });
  return deposit;
}

function depositSummary(db) {
  const held = db.deposits.filter((d) => ['Held', 'Partially Returned'].includes(d.DepositStatus));
  return {
    totalHeld: held.reduce((sum, d) => sum + Number(d.OutstandingDepositLiability || 0), 0),
    totalReceived: db.deposits.reduce((sum, d) => sum + Number(d.DepositAmount || 0), 0),
    totalReturned: db.deposits.reduce((sum, d) => sum + Number(d.AmountReturned || 0), 0),
    totalDeducted: db.deposits.reduce((sum, d) => sum + Number(d.AmountDeducted || 0), 0),
    count: held.length,
  };
}

module.exports = { listDeposits, recordDepositReturn, depositSummary };

});

__define("services/expenses", function (module, exports, require) {
'use strict';

const { today, nowISO, makeId, AppError, requireFields, requireAmount, requireEnum, cleanText, isDate } = require('../util');
const { audit, findById } = require('./common');
const { createTransaction } = require('./payments');

const EXPENSE_CATEGORIES = ['Utilities', 'Maintenance', 'Cleaning Supplies', 'Internet', 'Salaries', 'Equipment', 'Other'];
const EXPENSE_STATUSES = ['Pending', 'Approved', 'Paid', 'Cancelled'];

function listExpenses(db, filters = {}) {
  let rows = db.expenses.map((expense) => {
    const staff = db.staff.find((s) => s.StaffID === expense.RequestedBy);
    const approver = db.staff.find((s) => s.StaffID === expense.ApprovedBy);
    return {
      ...expense,
      RequestedByName: staff ? staff.FullName : expense.RequestedBy,
      ApprovedByName: approver ? approver.FullName : '',
    };
  });
  if (filters.status) rows = rows.filter((row) => row.PaymentStatus === filters.status);
  if (filters.category) rows = rows.filter((row) => row.Category === filters.category);
  if (filters.from) rows = rows.filter((row) => row.ExpenseDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.ExpenseDate <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.Description} ${row.Vendor}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.ExpenseDate.localeCompare(a.ExpenseDate) || b.CreatedAt.localeCompare(a.CreatedAt));
  return rows;
}

function expenseTotal(quantity, unitCost) {
  return Number(quantity) * Number(unitCost);
}

function saveExpense(db, data, user) {
  if (data.ExpenseID) {
    const expense = findById(db.expenses, 'ExpenseID', data.ExpenseID);
    if (expense.PaymentStatus === 'Cancelled') throw new AppError('Pengeluaran yang dibatalkan tidak dapat diubah.');
    const previous = JSON.stringify(expense);
    if (data.PaymentStatus !== undefined) {
      const status = requireEnum(data.PaymentStatus, ['Approved', 'Paid'], 'Status pengeluaran');
      if (status === 'Approved') {
        expense.PaymentStatus = 'Approved';
        expense.ApprovedBy = user.StaffID || '';
      }
      if (status === 'Paid') {
        expense.ApprovedBy = expense.ApprovedBy || user.StaffID || '';
        expense.PaymentStatus = 'Paid';
        if (!expense.TransactionID) {
          const tx = createTransaction(db, {
            date: expense.ExpenseDate, type: 'Expense Payment', direction: 'OUT', category: expense.Category,
            referenceType: 'Expense', referenceId: expense.ExpenseID, tenantId: '', roomId: '',
            description: `${expense.Description}${expense.Vendor ? ` - ${expense.Vendor}` : ''}`,
            amount: Number(expense.TotalAmount), method: expense.PaymentMethod,
            status: 'Confirmed', staffId: user.StaffID, key: `EXP:${expense.ExpenseID}`,
          });
          expense.TransactionID = tx.TransactionID;
        }
      }
    }
    if (data.Notes !== undefined) expense.Notes = cleanText(data.Notes, 500);
    if (data.ReceiptURL !== undefined) expense.ReceiptURL = cleanText(data.ReceiptURL, 500);
    audit(db, { user: user.StaffID, action: 'UPDATE_EXPENSE', module: 'Expenses', recordId: expense.ExpenseID, previous, next: JSON.stringify(expense) });
    return expense;
  }
  requireFields(data, ['ExpenseDate', 'Category', 'Description', 'Quantity', 'UnitCost', 'PaymentMethod']);
  if (!isDate(data.ExpenseDate)) throw new AppError('Tanggal pengeluaran tidak valid.');
  const quantity = requireAmount(data.Quantity, 'Jumlah');
  const unitCost = requireAmount(data.UnitCost, 'Biaya satuan');
  const category = requireEnum(data.Category, EXPENSE_CATEGORIES, 'Kategori pengeluaran');
  const status = requireEnum(data.PaymentStatus || 'Pending', ['Pending', 'Paid'], 'Status pembayaran');
  const expense = {
    ExpenseID: makeId(db, 'expense', 'EXP'),
    ExpenseDate: data.ExpenseDate,
    Category: category,
    Description: cleanText(data.Description, 300),
    Vendor: cleanText(data.Vendor, 120),
    Quantity: quantity,
    UnitCost: unitCost,
    TotalAmount: expenseTotal(quantity, unitCost),
    PaymentMethod: requireEnum(data.PaymentMethod, ['Cash', 'Bank Transfer', 'QRIS', 'Other'], 'Metode pembayaran'),
    PaymentStatus: status,
    ReceiptURL: cleanText(data.ReceiptURL, 500),
    RequestedBy: user.StaffID || '',
    ApprovedBy: status === 'Paid' ? (user.StaffID || '') : '',
    TransactionID: '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.expenses.push(expense);
  if (status === 'Paid') {
    const tx = createTransaction(db, {
      date: expense.ExpenseDate, type: 'Expense Payment', direction: 'OUT', category: expense.Category,
      referenceType: 'Expense', referenceId: expense.ExpenseID, tenantId: '', roomId: '',
      description: `${expense.Description}${expense.Vendor ? ` - ${expense.Vendor}` : ''}`,
      amount: expense.TotalAmount, method: expense.PaymentMethod, status: 'Confirmed',
      staffId: user.StaffID, key: `EXP:${expense.ExpenseID}`,
    });
    expense.TransactionID = tx.TransactionID;
  }
  audit(db, { user: user.StaffID, action: 'CREATE_EXPENSE', module: 'Expenses', recordId: expense.ExpenseID, next: JSON.stringify(expense) });
  return expense;
}

function cancelExpense(db, expenseId, reason, user) {
  const expense = findById(db.expenses, 'ExpenseID', expenseId);
  if (expense.PaymentStatus === 'Cancelled') throw new AppError('Pengeluaran sudah dibatalkan.');
  if (!reason) throw new AppError('Alasan pembatalan wajib diisi.');
  const previous = JSON.stringify(expense);
  if (expense.PaymentStatus === 'Paid' && expense.TransactionID) {
    createTransaction(db, {
      date: today(), type: 'Adjustment', direction: 'IN', category: 'Reversal',
      referenceType: 'Expense', referenceId: expense.ExpenseID, tenantId: '', roomId: '',
      description: `Pembatalan pengeluaran ${expense.ExpenseID}`, amount: Number(expense.TotalAmount),
      method: expense.PaymentMethod, status: 'Confirmed', staffId: user.StaffID,
      relatedId: expense.TransactionID, key: `EXP:CANCEL:${expense.ExpenseID}`,
    });
  }
  expense.PaymentStatus = 'Cancelled';
  expense.Notes = `${expense.Notes} | Dibatalkan: ${cleanText(reason, 300)}`;
  audit(db, { user: user.StaffID, action: 'CANCEL_EXPENSE', module: 'Expenses', recordId: expenseId, previous, next: JSON.stringify(expense), reason });
  return expense;
}

module.exports = { EXPENSE_CATEGORIES, EXPENSE_STATUSES, listExpenses, saveExpense, cancelExpense };

});

__define("services/masters", function (module, exports, require) {
'use strict';

const { nowISO, makeId, AppError, requireFields, requireAmount, requireEnum, cleanText, isDate } = require('../util');
const { audit, setSetting, findById } = require('./common');

const PRICE_CATEGORIES = ['Room Rental', 'Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'];

function listSettings(db) {
  return db.settings.slice().sort((a, b) => a.SettingKey.localeCompare(b.SettingKey));
}

function saveSettings(db, updates, user) {
  if (!updates || typeof updates !== 'object') throw new AppError('Data pengaturan tidak valid.');
  const allowed = new Set(db.settings.map((s) => s.SettingKey));
  for (const [key, value] of Object.entries(updates)) {
    if (!allowed.has(key)) continue;
    setSetting(db, key, value, user.StaffID || 'SYSTEM');
  }
  audit(db, { user: user.StaffID, action: 'UPDATE_SETTINGS', module: 'Settings', recordId: 'SETTINGS', next: JSON.stringify(updates) });
  return listSettings(db);
}

function listPriceList(db) {
  return db.priceList.slice().sort((a, b) => `${a.ItemCategory}${a.ItemName}`.localeCompare(`${b.ItemCategory}${b.ItemName}`));
}

function savePrice(db, data, user) {
  if (data.PriceID) {
    const price = findById(db.priceList, 'PriceID', data.PriceID);
    const previous = JSON.stringify(price);
    if (data.ItemName !== undefined) price.ItemName = cleanText(data.ItemName, 120);
    if (data.ItemCode !== undefined) price.ItemCode = cleanText(data.ItemCode, 30);
    if (data.ItemCategory !== undefined) price.ItemCategory = requireEnum(data.ItemCategory, PRICE_CATEGORIES, 'Kategori harga');
    if (data.BillingUnit !== undefined) price.BillingUnit = cleanText(data.BillingUnit, 20);
    if (data.StandardPrice !== undefined) price.StandardPrice = requireAmount(data.StandardPrice, 'Harga standar');
    if (data.EffectiveFrom !== undefined) price.EffectiveFrom = isDate(data.EffectiveFrom) ? data.EffectiveFrom : price.EffectiveFrom;
    if (data.EffectiveTo !== undefined) price.EffectiveTo = data.EffectiveTo && isDate(data.EffectiveTo) ? data.EffectiveTo : '';
    if (data.IsActive !== undefined) price.IsActive = String(data.IsActive).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    if (data.Notes !== undefined) price.Notes = cleanText(data.Notes, 300);
    audit(db, { user: user.StaffID, action: 'UPDATE_PRICE', module: 'PriceList', recordId: price.PriceID, previous, next: JSON.stringify(price) });
    return price;
  }
  requireFields(data, ['ItemName', 'ItemCategory', 'StandardPrice', 'EffectiveFrom']);
  if (!isDate(data.EffectiveFrom)) throw new AppError('Tanggal efektif tidak valid.');
  const price = {
    PriceID: makeId(db, 'price', 'PRC'),
    ItemCode: cleanText(data.ItemCode, 30) || `ITEM${db.priceList.length + 1}`,
    ItemName: cleanText(data.ItemName, 120),
    ItemCategory: requireEnum(data.ItemCategory, PRICE_CATEGORIES, 'Kategori harga'),
    RoomTypeID: data.RoomTypeID || '',
    BillingUnit: cleanText(data.BillingUnit, 20) || 'bulan',
    StandardPrice: requireAmount(data.StandardPrice, 'Harga standar'),
    EffectiveFrom: data.EffectiveFrom,
    EffectiveTo: '',
    IsActive: 'TRUE',
    Notes: cleanText(data.Notes, 300),
  };
  db.priceList.push(price);
  audit(db, { user: user.StaffID, action: 'CREATE_PRICE', module: 'PriceList', recordId: price.PriceID, next: JSON.stringify(price) });
  return price;
}

function listAudit(db, filters = {}) {
  let rows = db.auditLog.slice();
  if (filters.module) rows = rows.filter((row) => row.Module === filters.module);
  if (filters.userId) rows = rows.filter((row) => row.UserID === filters.userId);
  if (filters.from) rows = rows.filter((row) => row.Timestamp.slice(0, 10) >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.Timestamp.slice(0, 10) <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.Action} ${row.Module} ${row.RecordID} ${row.UserID}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.Timestamp.localeCompare(a.Timestamp));
  return rows.slice(0, 1000);
}

function listSystemLog(db) {
  return db.systemLog.slice().sort((a, b) => b.Timestamp.localeCompare(a.Timestamp)).slice(0, 500);
}

module.exports = { PRICE_CATEGORIES, listSettings, saveSettings, listPriceList, savePrice, listAudit, listSystemLog };

});

__define("services/occupancy", function (module, exports, require) {
'use strict';

const {
  today, nowISO, addDays, addMonthsClamped, makeId, AppError, requireFields,
  requireDate, requireAmount, requireEnum, cleanText,
} = require('../util');
const { audit, getNumberSetting, findById } = require('./common');
const { assignmentConflict, activeOccupanciesForRoom } = require('./rooms');
const { generateMonthlyInvoices, recalculateAllInvoices } = require('./billing');
const { createTransaction } = require('./payments');

const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Converted', 'Expired'];
const AGREEMENT_STATUSES = ['Active', 'Ended', 'Transferred', 'Renewed'];

function expireReservations(db) {
  const days = getNumberSetting(db, 'ReservationExpiryDays', 3);
  const limit = addDays(today(), -days);
  for (const reservation of db.reservations) {
    if (reservation.ReservationStatus === 'Pending' && reservation.ReservationDate < limit) {
      reservation.ReservationStatus = 'Expired';
    }
  }
}

function decorateReservation(db, reservation) {
  const tenant = db.tenants.find((t) => t.TenantID === reservation.TenantID);
  const room = db.rooms.find((r) => r.RoomID === reservation.RoomID);
  return {
    ...reservation,
    TenantName: tenant ? tenant.FullName : reservation.TenantID,
    TenantPhone: tenant ? tenant.Phone : '',
    RoomNumber: room ? room.RoomNumber : '',
    RoomTypeID: room ? room.RoomTypeID : '',
  };
}

function listReservations(db, filters = {}) {
  expireReservations(db);
  let rows = db.reservations.map((r) => decorateReservation(db, r));
  if (filters.status) rows = rows.filter((row) => row.ReservationStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.from) rows = rows.filter((row) => row.PlannedCheckIn >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.PlannedCheckIn <= filters.to);
  rows.sort((a, b) => a.PlannedCheckIn.localeCompare(b.PlannedCheckIn));
  return rows;
}

function createReservation(db, data, user) {
  requireFields(data, ['TenantID', 'RoomID', 'PlannedCheckIn']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const checkIn = requireDate(data.PlannedCheckIn, 'Rencana check-in');
  const checkOut = data.PlannedCheckOut ? requireDate(data.PlannedCheckOut, 'Rencana check-out') : '';
  if (checkOut && checkOut < checkIn) throw new AppError('Rencana check-out tidak boleh sebelum check-in.');
  const status = requireEnum(data.ReservationStatus || 'Confirmed', ['Pending', 'Confirmed'], 'Status reservasi');
  const endForConflict = checkOut || addDays(addMonthsClamped(checkIn, 1), -1);
  assignmentConflict(db, { roomId: data.RoomID, startDate: checkIn, endDate: endForConflict });
  const price = requireAmount(data.AgreedMonthlyPrice, 'Harga sewa disepakati');
  const reservation = {
    ReservationID: makeId(db, 'reservation', 'RSV'),
    TenantID: tenant.TenantID,
    RoomID: data.RoomID,
    ReservationDate: today(),
    PlannedCheckIn: checkIn,
    PlannedCheckOut: checkOut,
    AgreedMonthlyPrice: price,
    DepositAmount: requireAmount(data.DepositAmount || 0, 'Deposit', { allowZero: true }),
    ReservationStatus: status,
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.reservations.push(reservation);
  if (tenant.TenantStatus === 'Inactive') tenant.TenantStatus = 'Prospective';
  audit(db, { user: user.StaffID, action: 'CREATE_RESERVATION', module: 'Reservations', recordId: reservation.ReservationID, next: JSON.stringify(reservation) });
  return decorateReservation(db, reservation);
}

function updateReservation(db, reservationId, data, user) {
  const reservation = findById(db.reservations, 'ReservationID', reservationId);
  if (['Converted', 'Cancelled', 'Expired'].includes(reservation.ReservationStatus)) {
    throw new AppError('Reservasi ini tidak dapat diubah lagi.');
  }
  const previous = JSON.stringify(reservation);
  if (data.ReservationStatus) {
    if (data.ReservationStatus === 'Cancelled') {
      reservation.ReservationStatus = 'Cancelled';
    } else if (data.ReservationStatus === 'Confirmed') {
      reservation.ReservationStatus = 'Confirmed';
    }
  }
  if (data.PlannedCheckIn) reservation.PlannedCheckIn = requireDate(data.PlannedCheckIn, 'Rencana check-in');
  if (data.PlannedCheckOut !== undefined) reservation.PlannedCheckOut = data.PlannedCheckOut ? requireDate(data.PlannedCheckOut, 'Rencana check-out') : '';
  if (data.AgreedMonthlyPrice !== undefined) reservation.AgreedMonthlyPrice = requireAmount(data.AgreedMonthlyPrice, 'Harga sewa');
  if (data.Notes !== undefined) reservation.Notes = cleanText(data.Notes, 500);
  audit(db, { user: user.StaffID, action: 'UPDATE_RESERVATION', module: 'Reservations', recordId: reservationId, previous, next: JSON.stringify(reservation) });
  return decorateReservation(db, reservation);
}

function listOccupancies(db, filters = {}) {
  recalculateAllInvoices(db, today());
  let rows = db.occupancies.map((occupancy) => {
    const tenant = db.tenants.find((t) => t.TenantID === occupancy.TenantID);
    const room = db.rooms.find((r) => r.RoomID === occupancy.RoomID);
    const outstanding = db.invoices
      .filter((i) => i.OccupancyID === occupancy.OccupancyID && i.InvoiceStatus !== 'Cancelled')
      .reduce((sum, i) => sum + Number(i.OutstandingBalance || 0), 0);
    return {
      ...occupancy,
      TenantName: tenant ? tenant.FullName : occupancy.TenantID,
      TenantPhone: tenant ? tenant.Phone : '',
      RoomNumber: room ? room.RoomNumber : '',
      OutstandingBalance: outstanding,
    };
  });
  if (filters.status) rows = rows.filter((row) => row.AgreementStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.roomId) rows = rows.filter((row) => row.RoomID === filters.roomId);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.TenantName} ${row.RoomNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.CheckInDate.localeCompare(a.CheckInDate));
  return rows;
}

function checkInTenant(db, data, user) {
  requireFields(data, ['TenantID', 'RoomID', 'AgreedMonthlyPrice']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const room = findById(db.rooms, 'RoomID', data.RoomID);
  const checkInDate = requireDate(data.CheckInDate || today(), 'Tanggal check-in');
  const plannedOut = data.PlannedCheckOut ? requireDate(data.PlannedCheckOut, 'Rencana check-out') : '';
  if (plannedOut && plannedOut < checkInDate) throw new AppError('Rencana check-out tidak boleh sebelum check-in.');
  const price = requireAmount(data.AgreedMonthlyPrice, 'Harga sewa disepakati');
  const depositAmount = requireAmount(data.DepositAmount || 0, 'Deposit', { allowZero: true });
  let reservation = null;
  if (data.ReservationID) {
    reservation = findById(db.reservations, 'ReservationID', data.ReservationID);
    if (reservation.TenantID !== tenant.TenantID || reservation.RoomID !== room.RoomID) {
      throw new AppError('Reservasi tidak sesuai dengan penghuni atau kamar yang dipilih.');
    }
    if (!['Pending', 'Confirmed'].includes(reservation.ReservationStatus)) {
      throw new AppError('Reservasi tidak dapat dikonversi karena statusnya tidak aktif.');
    }
  }
  assignmentConflict(db, {
    roomId: room.RoomID,
    startDate: checkInDate,
    endDate: plannedOut,
    excludeReservationId: reservation ? reservation.ReservationID : '',
  });

  const occupancy = {
    OccupancyID: makeId(db, 'occupancy', 'OCC'),
    TenantID: tenant.TenantID,
    RoomID: room.RoomID,
    CheckInDate: checkInDate,
    PlannedCheckOut: plannedOut,
    ActualCheckOut: '',
    RentalPlan: 'Monthly',
    AgreedMonthlyPrice: price,
    BillingDay: Number(checkInDate.slice(8, 10)),
    DueDay: getNumberSetting(db, 'DefaultDueDays', 5),
    DepositAmount: depositAmount,
    AgreementStatus: 'Active',
    PreviousOccupancyID: data.PreviousOccupancyID ? cleanText(data.PreviousOccupancyID, 30) : '',
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.occupancies.push(occupancy);
  tenant.TenantStatus = 'Active';
  tenant.UpdatedAt = nowISO();
  if (reservation) {
    reservation.ReservationStatus = 'Converted';
    reservation.Notes = `${reservation.Notes} | Dikonversi ke ${occupancy.OccupancyID}`;
  }

  let depositRecord = null;
  if (depositAmount > 0) {
    const method = data.DepositMethod || 'Cash';
    const tx = createTransaction(db, {
      date: checkInDate, type: 'Deposit Received', direction: 'IN', category: 'Deposit',
      referenceType: 'Deposit', referenceId: '', tenantId: tenant.TenantID, roomId: room.RoomID,
      description: `Deposit keamanan ${tenant.FullName}`, amount: depositAmount, method,
      status: 'Confirmed', staffId: user.StaffID, key: `DEP:RCPT:${occupancy.OccupancyID}`,
    });
    depositRecord = {
      DepositRecordID: makeId(db, 'deposit', 'DEP'),
      TenantID: tenant.TenantID,
      OccupancyID: occupancy.OccupancyID,
      DepositType: 'Security Deposit',
      DepositAmount: depositAmount,
      AmountReturned: 0,
      AmountDeducted: 0,
      OutstandingDepositLiability: depositAmount,
      ReceiptTransactionID: tx.TransactionID,
      ReturnTransactionID: '',
      DepositStatus: 'Held',
      CreatedAt: nowISO(),
      Notes: cleanText(data.DepositNotes, 300),
    };
    tx.ReferenceID = depositRecord.DepositRecordID;
    db.deposits.push(depositRecord);
  }

  const occupants = activeOccupanciesForRoom(db, room.RoomID, checkInDate);
  if (occupants.length >= Number(room.Capacity || 1)) room.OperationalStatus = 'Occupied';
  room.UpdatedAt = nowISO();

  const billing = generateMonthlyInvoices(db, { asOf: today(), user: user.StaffID });

  audit(db, {
    user: user.StaffID, action: 'CHECK_IN', module: 'Occupancy', recordId: occupancy.OccupancyID,
    next: JSON.stringify({ tenant: tenant.TenantID, room: room.RoomID, price, deposit: depositAmount, reservation: reservation ? reservation.ReservationID : '' }),
  });
  return { occupancy, deposit: depositRecord, invoicesCreated: billing.count };
}

function transferTenant(db, data, user) {
  requireFields(data, ['ToRoomID', 'TransferDate']);
  const transferDate = requireDate(data.TransferDate, 'Tanggal pindah');
  let occupancy = null;
  if (data.OccupancyID) occupancy = findById(db.occupancies, 'OccupancyID', data.OccupancyID);
  else {
    const tenant = findById(db.tenants, 'TenantID', data.TenantID);
    occupancy = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active');
  }
  if (!occupancy || occupancy.AgreementStatus !== 'Active') throw new AppError('Tidak ada perjanjian sewa aktif untuk dipindahkan.');
  if (transferDate < occupancy.CheckInDate) throw new AppError('Tanggal pindah tidak boleh sebelum check-in.');
  if (occupancy.RoomID === data.ToRoomID) throw new AppError('Kamar tujuan harus berbeda dari kamar saat ini.');
  const newRoom = findById(db.rooms, 'RoomID', data.ToRoomID);
  assignmentConflict(db, { roomId: newRoom.RoomID, startDate: transferDate, endDate: occupancy.PlannedCheckOut, excludeOccupancyId: occupancy.OccupancyID });

  const previous = JSON.stringify(occupancy);
  const price = data.NewMonthlyPrice !== undefined
    ? requireAmount(data.NewMonthlyPrice, 'Harga sewa baru')
    : Number(occupancy.AgreedMonthlyPrice);

  occupancy.ActualCheckOut = transferDate;
  occupancy.AgreementStatus = 'Transferred';
  occupancy.Notes = `${occupancy.Notes} | Dipindahkan ke ${newRoom.RoomNumber} pada ${transferDate}`;

  const newOccupancy = {
    OccupancyID: makeId(db, 'occupancy', 'OCC'),
    TenantID: occupancy.TenantID,
    RoomID: newRoom.RoomID,
    CheckInDate: transferDate,
    PlannedCheckOut: occupancy.PlannedCheckOut,
    ActualCheckOut: '',
    RentalPlan: 'Monthly',
    AgreedMonthlyPrice: price,
    BillingDay: Number(occupancy.CheckInDate.slice(8, 10)),
    DueDay: Number(occupancy.DueDay || getNumberSetting(db, 'DefaultDueDays', 5)),
    DepositAmount: Number(occupancy.DepositAmount || 0),
    AgreementStatus: 'Active',
    PreviousOccupancyID: occupancy.OccupancyID,
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.occupancies.push(newOccupancy);

  db.deposits.filter((d) => d.OccupancyID === occupancy.OccupancyID && d.DepositStatus === 'Held').forEach((d) => { d.OccupancyID = newOccupancy.OccupancyID; });
  if (activeOccupanciesForRoom(db, newRoom.RoomID, transferDate).length >= Number(newRoom.Capacity || 1)) newRoom.OperationalStatus = 'Occupied';
  const oldRoom = db.rooms.find((r) => r.RoomID === occupancy.RoomID);
  if (oldRoom && activeOccupanciesForRoom(db, oldRoom.RoomID, transferDate).length === 0 && oldRoom.OperationalStatus === 'Occupied') oldRoom.OperationalStatus = 'Available';
  audit(db, { user: user.StaffID, action: 'TRANSFER_ROOM', module: 'Occupancy', recordId: newOccupancy.OccupancyID, previous, next: JSON.stringify(newOccupancy), reason: data.Reason || '' });
  return { previous: occupancy, occupancy: newOccupancy };
}

function renewAgreement(db, data, user) {
  const occupancy = findById(db.occupancies, 'OccupancyID', data.OccupancyID);
  if (occupancy.AgreementStatus !== 'Active') throw new AppError('Hanya perjanjian aktif yang dapat diperpanjang.');
  const lastInvoice = db.invoices
    .filter((i) => i.OccupancyID === occupancy.OccupancyID && i.InvoiceStatus !== 'Cancelled')
    .sort((a, b) => a.PeriodEnd.localeCompare(b.PeriodEnd))[0];
  const effectiveDate = data.EffectiveDate
    ? requireDate(data.EffectiveDate, 'Tanggal efektif')
    : (lastInvoice ? addDays(lastInvoice.PeriodEnd, 1) : addDays(today(), 1));
  if (effectiveDate <= occupancy.CheckInDate) throw new AppError('Tanggal efektif perpanjangan tidak valid.');
  const price = requireAmount(data.NewMonthlyPrice, 'Harga sewa baru');
  const previous = JSON.stringify(occupancy);
  occupancy.AgreementStatus = 'Renewed';
  occupancy.ActualCheckOut = addDays(effectiveDate, -1);
  occupancy.Notes = `${occupancy.Notes} | Diperpanjang mulai ${effectiveDate}`;
  const newOccupancy = {
    ...occupancy,
    OccupancyID: makeId(db, 'occupancy', 'OCC'),
    CheckInDate: effectiveDate,
    ActualCheckOut: '',
    AgreedMonthlyPrice: price,
    AgreementStatus: 'Active',
    PreviousOccupancyID: occupancy.OccupancyID,
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes || `Perpanjangan dari ${occupancy.OccupancyID}`, 500),
  };
  db.occupancies.push(newOccupancy);
  db.deposits.filter((d) => d.OccupancyID === occupancy.OccupancyID && d.DepositStatus === 'Held').forEach((d) => { d.OccupancyID = newOccupancy.OccupancyID; });
  audit(db, { user: user.StaffID, action: 'RENEW_AGREEMENT', module: 'Occupancy', recordId: newOccupancy.OccupancyID, previous, next: JSON.stringify(newOccupancy) });
  return newOccupancy;
}

function checkOutTenant(db, data, user) {
  requireFields(data, ['OccupancyID']);
  const occupancy = findById(db.occupancies, 'OccupancyID', data.OccupancyID);
  if (occupancy.AgreementStatus !== 'Active') throw new AppError('Perjanjian ini tidak aktif.');
  const checkOutDate = requireDate(data.CheckOutDate || today(), 'Tanggal check-out');
  if (checkOutDate < occupancy.CheckInDate) throw new AppError('Tanggal check-out tidak boleh sebelum check-in.');
  const tenant = findById(db.tenants, 'TenantID', occupancy.TenantID);
  const room = findById(db.rooms, 'RoomID', occupancy.RoomID);
  recalculateAllInvoices(db, checkOutDate);
  const outstandingInvoices = db.invoices.filter(
    (invoice) => invoice.TenantID === occupancy.TenantID && invoice.InvoiceStatus !== 'Cancelled' && Number(invoice.OutstandingBalance) > 0
  );
  const outstanding = outstandingInvoices.reduce((sum, invoice) => sum + Number(invoice.OutstandingBalance), 0);

  const deposit = db.deposits.find((d) => d.OccupancyID === occupancy.OccupancyID && d.DepositStatus === 'Held');
  let depositResult = null;
  if (deposit) {
    const deduction = requireAmount(data.DepositDeduction || 0, 'Potongan deposit', { allowZero: true });
    if (deduction > Number(deposit.OutstandingDepositLiability)) {
      throw new AppError('Potongan deposit melebihi saldo deposit yang tersedia.');
    }
    const returnAmount = Number(deposit.OutstandingDepositLiability) - deduction;
    deposit.AmountDeducted = Number(deposit.AmountDeducted || 0) + deduction;
    deposit.AmountReturned = Number(deposit.AmountReturned || 0) + returnAmount;
    deposit.OutstandingDepositLiability = 0;
    deposit.DepositStatus = deduction > 0 ? 'Partially Returned' : 'Returned';
    deposit.Notes = `${deposit.Notes} | Check-out ${checkOutDate}. Potongan: ${cleanText(data.DeductionReason, 200)}`;
    if (returnAmount > 0) {
      const method = data.ReturnMethod || 'Cash';
      const tx = createTransaction(db, {
        date: checkOutDate, type: 'Deposit Returned', direction: 'OUT', category: 'Deposit',
        referenceType: 'Deposit', referenceId: deposit.DepositRecordID,
        tenantId: occupancy.TenantID, roomId: occupancy.RoomID,
        description: `Pengembalian deposit ${tenant.FullName}`, amount: returnAmount,
        method, status: 'Confirmed', staffId: user.StaffID,
        key: `DEP:RET:${deposit.DepositRecordID}:${checkOutDate}`,
      });
      deposit.ReturnTransactionID = tx.TransactionID;
    }
    depositResult = { deposit, deduction, returnAmount };
  }

  occupancy.ActualCheckOut = checkOutDate;
  occupancy.AgreementStatus = 'Ended';
  occupancy.Notes = cleanText(`${occupancy.Notes} | Check-out ${checkOutDate}`, 500);
  const otherActive = db.occupancies.some((o) => o.TenantID === tenant.TenantID && o.OccupancyID !== occupancy.OccupancyID && o.AgreementStatus === 'Active');
  if (!otherActive) {
    tenant.TenantStatus = 'Checked Out';
    tenant.UpdatedAt = nowISO();
  }

  const remainingOccupants = activeOccupanciesForRoom(db, room.RoomID, addDays(checkOutDate, 1));
  let cleaningActivity = null;
  if (remainingOccupants.length === 0 && room.OperationalStatus !== 'Inactive') {
    room.OperationalStatus = 'Maintenance';
    cleaningActivity = {
      ActivityID: makeId(db, 'activity', 'ACT'),
      ActivityDate: checkOutDate,
      StaffID: '',
      Category: 'Cleaning',
      RoomID: room.RoomID,
      TenantID: '',
      Description: `Pembersihan dan inspeksi kamar ${room.RoomNumber} setelah check-out`,
      Priority: 'High',
      DueDate: addDays(checkOutDate, 1),
      Status: 'Pending',
      StartedAt: '',
      CompletedAt: '',
      VerifiedBy: '',
      Notes: `Dibuat otomatis saat check-out ${occupancy.OccupancyID}`,
    };
    db.activities.push(cleaningActivity);
  }

  audit(db, {
    user: user.StaffID, action: 'CHECK_OUT', module: 'Occupancy', recordId: occupancy.OccupancyID,
    next: JSON.stringify({ checkOutDate, outstanding, deposit: depositResult ? { deduction: depositResult.deduction, returned: depositResult.returnAmount } : null }),
  });
  return {
    occupancy,
    settlement: {
      checkOutDate,
      outstandingInvoices,
      outstandingTotal: outstanding,
      deposit: depositResult,
      roomStatus: room.OperationalStatus,
      cleaningActivity,
    },
  };
}

module.exports = {
  RESERVATION_STATUSES,
  AGREEMENT_STATUSES,
  listReservations,
  createReservation,
  updateReservation,
  expireReservations,
  listOccupancies,
  checkInTenant,
  transferTenant,
  renewAgreement,
  checkOutTenant,
};

});

__define("services/payments", function (module, exports, require) {
'use strict';

const {
  today, nowISO, makeId, makeReceiptNumber, AppError, requireFields, requireDate,
  requireEnum, requireAmount, cleanText,
} = require('../util');
const { audit, getSetting, findById } = require('./common');
const { recalculateAllInvoices, recalculateInvoice, validAllocatedAmount } = require('./billing');

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'QRIS', 'Other'];
const PAYMENT_STATUSES = ['Pending', 'Confirmed', 'Voided', 'Refunded'];

function listPayments(db, filters = {}) {
  recalculateAllInvoices(db, today());
  let rows = db.payments.map((payment) => {
    const tenant = db.tenants.find((t) => t.TenantID === payment.TenantID);
    const staff = db.staff.find((s) => s.StaffID === payment.ReceivedBy);
    const allocated = db.allocations
      .filter((a) => a.PaymentID === payment.PaymentID && a.AllocationStatus === 'Valid')
      .reduce((sum, a) => sum + Number(a.AllocatedAmount), 0);
    const serviceApplied = db.serviceOrders
      .filter((order) => order.PaymentID === payment.PaymentID)
      .reduce((sum, order) => sum + Number(order.TotalAmount), 0);
    return {
      ...payment,
      TenantName: tenant ? tenant.FullName : payment.TenantID,
      ReceivedByName: staff ? staff.FullName : payment.ReceivedBy,
      AmountAllocated: allocated + serviceApplied,
      UnallocatedAmount: Math.max(0, Number(payment.AmountReceived) - allocated - serviceApplied),
      AllocationCount: db.allocations.filter((a) => a.PaymentID === payment.PaymentID && a.AllocationStatus === 'Valid').length,
    };
  });
  if (filters.status) rows = rows.filter((row) => row.PaymentStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.from) rows = rows.filter((row) => row.PaymentDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.PaymentDate <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.ReceiptNumber} ${row.TenantName} ${row.ReferenceNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    if (a.PaymentDate === b.PaymentDate) return b.CreatedAt.localeCompare(a.CreatedAt);
    return b.PaymentDate.localeCompare(a.PaymentDate);
  });
  return rows;
}

function validateAndPlanAllocations(db, data, amount, tenantId) {
  const plans = [];
  if (Array.isArray(data.Allocations) && data.Allocations.length) {
    for (const raw of data.Allocations) {
      const invoice = findById(db.invoices, 'InvoiceID', raw.InvoiceID);
      if (invoice.TenantID !== tenantId) throw new AppError('Invoice tidak belongs to tenant yang dipilih.');
      if (invoice.InvoiceStatus === 'Cancelled') throw new AppError(`Invoice ${invoice.InvoiceNumber} sudah dibatalkan.`);
      const value = requireAmount(raw.Amount !== undefined ? raw.Amount : raw.AllocatedAmount, 'Jumlah alokasi');
      const available = Number(invoice.OutstandingBalance) - plans.filter((p) => p.invoice.InvoiceID === invoice.InvoiceID).reduce((sum, p) => sum + p.amount, 0);
      if (value > available) {
        throw new AppError(`Alokasi ke ${invoice.InvoiceNumber} melebihi saldo yang dapat dibayar (Rp${Math.max(0, available).toLocaleString('id-ID')}).`);
      }
      plans.push({ invoice, amount: value });
    }
  } else if (data.InvoiceID) {
    const invoice = findById(db.invoices, 'InvoiceID', data.InvoiceID);
    if (invoice.TenantID !== tenantId) throw new AppError('Invoice tidak belongs to tenant yang dipilih.');
    if (invoice.InvoiceStatus === 'Cancelled') throw new AppError('Invoice sudah dibatalkan.');
    plans.push({ invoice, amount: Math.min(amount, Number(invoice.OutstandingBalance)) });
  } else {
    let remaining = amount;
    const open = db.invoices
      .filter((invoice) => invoice.TenantID === tenantId && !['Paid', 'Cancelled'].includes(invoice.InvoiceStatus) && Number(invoice.OutstandingBalance) > 0)
      .sort((a, b) => a.DueDate.localeCompare(b.DueDate) || a.PeriodStart.localeCompare(b.PeriodStart));
    for (const invoice of open) {
      if (remaining <= 0) break;
      const allocate = Math.min(remaining, Number(invoice.OutstandingBalance));
      plans.push({ invoice, amount: allocate });
      remaining -= allocate;
    }
  }
  const totalPlanned = plans.reduce((sum, p) => sum + p.amount, 0);
  if (totalPlanned > amount) throw new AppError('Total alokasi melebihi jumlah pembayaran.');
  return plans;
}

function createTransaction(db, { date, type, direction, category, referenceType, referenceId, tenantId, roomId, description, amount, method, status, staffId, relatedId = '', key, notes = '' }) {
  const existing = db.transactions.find((t) => t.IdempotencyKey && t.IdempotencyKey === key);
  if (existing) return existing;
  const transaction = {
    TransactionID: makeId(db, 'transaction', 'TXN'),
    TransactionDate: date,
    TransactionType: type,
    Direction: direction,
    Category: category,
    ReferenceType: referenceType,
    ReferenceID: referenceId,
    TenantID: tenantId || '',
    RoomID: roomId || '',
    Description: cleanText(description, 500),
    Amount: amount,
    PaymentMethod: method || '',
    PaymentStatus: status || 'Confirmed',
    StaffID: staffId || '',
    RelatedTransactionID: relatedId,
    IdempotencyKey: key,
    CreatedAt: nowISO(),
    Notes: notes,
  };
  db.transactions.push(transaction);
  return transaction;
}

function recordPayment(db, data, user) {
  requireFields(data, ['TenantID', 'AmountReceived', 'PaymentMethod', 'IdempotencyKey']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const amount = requireAmount(data.AmountReceived, 'Jumlah pembayaran');
  const method = requireEnum(data.PaymentMethod, PAYMENT_METHODS, 'Metode pembayaran');
  const date = requireDate(data.PaymentDate || today(), 'Tanggal pembayaran');
  const key = cleanText(data.IdempotencyKey, 120);
  const existing = db.payments.find((payment) => payment.IdempotencyKey === key);
  if (existing) return { payment: existing, duplicate: true };

  recalculateAllInvoices(db, today());
  const plans = validateAndPlanAllocations(db, data, amount, tenant.TenantID);
  const receiptNumber = makeReceiptNumber(db, getSetting(db, 'ReceiptPrefix', 'KWT'), date);
  const payment = {
    PaymentID: makeId(db, 'payment', 'PAY'),
    ReceiptNumber: receiptNumber,
    PaymentDate: date,
    TenantID: tenant.TenantID,
    PaymentMethod: method,
    AmountReceived: amount,
    ReferenceNumber: cleanText(data.ReferenceNumber, 120),
    PaymentStatus: 'Confirmed',
    ReceivedBy: user.StaffID || '',
    IdempotencyKey: key,
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.payments.push(payment);

  let allocated = 0;
  for (const plan of plans) {
    const allocation = {
      AllocationID: makeId(db, 'allocation', 'ALC'),
      PaymentID: payment.PaymentID,
      InvoiceID: plan.invoice.InvoiceID,
      AllocatedAmount: plan.amount,
      AllocationStatus: 'Valid',
      CreatedAt: nowISO(),
      CreatedBy: user.StaffID || '',
      Notes: '',
    };
    db.allocations.push(allocation);
    allocated += plan.amount;
    recalculateInvoice(db, plan.invoice, today());
  }

  const leftover = amount - allocated;
  if (leftover > 0) {
    db.credits.push({
      CreditID: makeId(db, 'credit', 'CRD'),
      TenantID: tenant.TenantID,
      PaymentID: payment.PaymentID,
      Amount: leftover,
      RemainingAmount: leftover,
      Status: 'Available',
      CreatedAt: nowISO(),
      Notes: 'Kelebihan pembayaran dicatat sebagai kredit penghuni',
    });
  }

  const roomId = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active')?.RoomID || '';
  createTransaction(db, {
    date, type: 'Rental Payment', direction: 'IN', category: 'Rental',
    referenceType: 'Payment', referenceId: payment.PaymentID, tenantId: tenant.TenantID,
    roomId, description: `Pembayaran sewa ${receiptNumber}`, amount, method,
    status: 'Confirmed', staffId: user.StaffID, key: `TXN:${key}`,
  });

  recalculateAllInvoices(db, today());
  audit(db, {
    user: user.StaffID, action: 'RECORD_PAYMENT', module: 'Payments', recordId: payment.PaymentID,
    next: JSON.stringify({ receipt: receiptNumber, amount, allocated, credit: leftover, tenant: tenant.TenantID }),
  });
  return { payment, allocations: plans.length, allocated, credit: leftover, duplicate: false };
}

function recordDirectPayment(db, data, user) {
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const amount = requireAmount(data.AmountReceived, 'Jumlah pembayaran');
  const method = requireEnum(data.PaymentMethod, PAYMENT_METHODS, 'Metode pembayaran');
  const date = requireDate(data.PaymentDate || today(), 'Tanggal pembayaran');
  const key = cleanText(data.IdempotencyKey, 120);
  const existing = db.payments.find((payment) => payment.IdempotencyKey === key);
  if (existing) return { payment: existing, duplicate: true };
  const receiptNumber = makeReceiptNumber(db, getSetting(db, 'ReceiptPrefix', 'KWT'), date);
  const payment = {
    PaymentID: makeId(db, 'payment', 'PAY'),
    ReceiptNumber: receiptNumber,
    PaymentDate: date,
    TenantID: tenant.TenantID,
    PaymentMethod: method,
    AmountReceived: amount,
    ReferenceNumber: cleanText(data.ReferenceNumber, 120),
    PaymentStatus: 'Confirmed',
    ReceivedBy: user.StaffID || '',
    IdempotencyKey: key,
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes || 'Pembayaran layanan langsung', 500),
  };
  db.payments.push(payment);
  createTransaction(db, {
    date,
    type: data.TransactionType || 'Service Payment',
    direction: 'IN',
    category: data.Category || 'Service',
    referenceType: data.ReferenceType || 'ServiceOrder',
    referenceId: data.ReferenceID || payment.PaymentID,
    tenantId: tenant.TenantID,
    roomId: data.RoomID || '',
    description: data.Description || `Pembayaran layanan ${receiptNumber}`,
    amount,
    method,
    status: 'Confirmed',
    staffId: user.StaffID,
    key: `TXN:${key}`,
  });
  audit(db, { user: user.StaffID, action: 'RECORD_SERVICE_PAYMENT', module: 'Payments', recordId: payment.PaymentID, next: JSON.stringify(payment) });
  return { payment, duplicate: false };
}

function voidPayment(db, paymentId, reason, user) {
  const payment = findById(db.payments, 'PaymentID', paymentId);
  if (payment.PaymentStatus === 'Voided') throw new AppError('Pembayaran sudah di-void.');
  if (!reason || !cleanText(reason)) throw new AppError('Alasan void wajib diisi.');
  const previous = JSON.stringify({ status: payment.PaymentStatus, amount: payment.AmountReceived });
  payment.PaymentStatus = 'Voided';
  payment.Notes = `${payment.Notes} | Void: ${cleanText(reason, 300)}`;
  db.allocations.filter((a) => a.PaymentID === paymentId).forEach((a) => { a.AllocationStatus = 'Voided'; });
  db.credits.filter((c) => c.PaymentID === paymentId).forEach((c) => { c.Status = 'Voided'; c.RemainingAmount = 0; });
  const related = db.transactions.find((t) => t.ReferenceType === 'Payment' && t.ReferenceID === paymentId && t.TransactionType !== 'Adjustment');
  db.transactions.forEach((t) => {
    if (t.ReferenceType === 'Payment' && t.ReferenceID === paymentId && t.TransactionType !== 'Adjustment') {
      t.PaymentStatus = 'Voided';
    }
  });
  createTransaction(db, {
    date: today(), type: 'Adjustment', direction: 'OUT', category: 'Reversal',
    referenceType: 'Payment', referenceId: paymentId, tenantId: payment.TenantID,
    roomId: related ? related.RoomID : '',
    description: `Void pembayaran ${payment.ReceiptNumber}`, amount: Number(payment.AmountReceived),
    method: payment.PaymentMethod, status: 'Confirmed', staffId: user.StaffID,
    relatedId: related ? related.TransactionID : '', key: `TXN:VOID:${payment.PaymentID}`,
  });
  recalculateAllInvoices(db, today());
  audit(db, { user: user.StaffID, action: 'VOID_PAYMENT', module: 'Payments', recordId: paymentId, previous, next: JSON.stringify(payment), reason });
  return payment;
}

function getPaymentDetail(db, paymentId) {
  const payment = findById(db.payments, 'PaymentID', paymentId);
  const tenant = db.tenants.find((t) => t.TenantID === payment.TenantID);
  const allocations = db.allocations.filter((a) => a.PaymentID === paymentId).map((a) => {
    const invoice = db.invoices.find((i) => i.InvoiceID === a.InvoiceID);
    return { ...a, InvoiceNumber: invoice ? invoice.InvoiceNumber : '' };
  });
  return { payment: { ...payment, TenantName: tenant ? tenant.FullName : '' }, allocations };
}

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  listPayments,
  recordPayment,
  recordDirectPayment,
  voidPayment,
  getPaymentDetail,
  createTransaction,
  validateAndPlanAllocations,
};

});

__define("services/reports", function (module, exports, require) {
'use strict';

const { today, monthStart, monthEnd, addDays, addMonthsClamped, daysBetween, inRange } = require('../util');
const { getSetting } = require('./common');
const { roomAvailability } = require('./rooms');
const { recalculateAllInvoices } = require('./billing');
const { depositSummary } = require('./deposits');
const { tenantStatement } = require('./tenants');

function sanitizeRange(filters = {}) {
  const from = filters.from || monthStart();
  const to = filters.to || monthEnd(from);
  return { from, to };
}

function roomStats(db) {
  const counts = { total: db.rooms.length, Available: 0, Occupied: 0, Reserved: 0, Maintenance: 0, Inactive: 0 };
  for (const room of db.rooms) {
    const status = roomAvailability(db, room);
    counts[status] += 1;
  }
  const denominator = counts.total - counts.Inactive;
  counts.occupancyRate = denominator > 0 ? Math.round((counts.Occupied / denominator) * 1000) / 10 : 0;
  return counts;
}

function transactionTotals(db, from, to) {
  const rows = db.transactions.filter((t) => inRange(t.TransactionDate, from, to));
  const confirmed = (t) => t.PaymentStatus !== 'Voided' && t.PaymentStatus !== 'Cancelled';
  const sum = (filter) => rows.filter(filter).reduce((total, t) => total + Number(t.Amount || 0), 0);
  const deposits = ['Deposit Received', 'Deposit Returned'];
  const operating = rows.filter((t) => !deposits.includes(t.TransactionType));
  return {
    inflow: operating.filter((t) => t.Direction === 'IN' && confirmed(t)).reduce((s, t) => s + Number(t.Amount), 0),
    outflow: operating.filter((t) => t.Direction === 'OUT' && confirmed(t)).reduce((s, t) => s + Number(t.Amount), 0),
    net: operating.reduce((s, t) => s + (t.Direction === 'IN' ? 1 : -1) * Number(t.Amount), 0),
    rentalCollections: sum((t) => t.TransactionType === 'Rental Payment' && t.Direction === 'IN' && confirmed(t)),
    serviceCollections: sum((t) => t.TransactionType === 'Service Payment' && t.Direction === 'IN' && confirmed(t)),
    expensePayments: sum((t) => t.TransactionType === 'Expense Payment' && t.Direction === 'OUT' && confirmed(t)),
    depositReceived: sum((t) => t.TransactionType === 'Deposit Received' && t.Direction === 'IN' && confirmed(t)),
    depositReturned: sum((t) => t.TransactionType === 'Deposit Returned' && t.Direction === 'OUT' && confirmed(t)),
    rows,
  };
}

function getDashboard(db, filters = {}, user = null) {
  const { from, to } = sanitizeRange(filters);
  recalculateAllInvoices(db, today());
  const rooms = roomStats(db);
  const activeTenants = db.tenants.filter((t) => t.TenantStatus === 'Active').length;
  const upcomingCheckIns = db.reservations.filter(
    (r) => ['Pending', 'Confirmed'].includes(r.ReservationStatus) && r.PlannedCheckIn >= today() && r.PlannedCheckIn <= addDays(today(), 30)
  ).length;
  const upcomingCheckOuts = db.occupancies.filter(
    (o) => o.AgreementStatus === 'Active' && o.PlannedCheckOut && o.PlannedCheckOut >= today() && o.PlannedCheckOut <= addDays(today(), 30)
  ).length;
  const recentTransfers = db.occupancies.filter(
    (o) => o.PreviousOccupancyID && o.CheckInDate >= addDays(today(), -30)
  ).length;

  const invoicesInRange = db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled' && inRange(i.InvoiceDate, from, to));
  const invoicedTotal = invoicesInRange.reduce((sum, i) => sum + Number(i.TotalAmount), 0);
  const paymentsInRange = db.payments.filter((p) => p.PaymentStatus === 'Confirmed' && inRange(p.PaymentDate, from, to));
  const paymentTotal = paymentsInRange.reduce((sum, p) => sum + Number(p.AmountReceived), 0);
  const receivable = db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((sum, i) => sum + Number(i.OutstandingBalance), 0);
  const overdue = db.invoices.filter((i) => i.InvoiceStatus === 'Overdue');
  const overdueTotal = overdue.reduce((sum, i) => sum + Number(i.OutstandingBalance), 0);
  const deposits = depositSummary(db);
  const ledger = transactionTotals(db, from, to);

  const canSeeFinance = user && ['Owner', 'Manager', 'Cashier'].includes(user.Role);
  const financial = canSeeFinance ? {
    invoicedThisMonth: invoicedTotal,
    invoiceCount: invoicesInRange.length,
    collectionsThisMonth: paymentTotal,
    paymentCount: paymentsInRange.length,
    rentalCollections: ledger.rentalCollections,
    serviceCollections: ledger.serviceCollections,
    expensesPaid: ledger.expensePayments,
    outstandingReceivables: receivable,
    overdueCount: overdue.length,
    overdueTotal,
    depositLiabilities: deposits.totalHeld,
    netCashFlow: ledger.net,
    inflow: ledger.inflow,
    outflow: ledger.outflow,
  } : null;

  const recentInvoices = db.invoices
    .filter((i) => i.InvoiceStatus !== 'Cancelled')
    .sort((a, b) => b.CreatedAt.localeCompare(a.CreatedAt))
    .slice(0, 6)
    .map((invoice) => {
      const tenant = db.tenants.find((t) => t.TenantID === invoice.TenantID);
      const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
      return { ...invoice, TenantName: tenant ? tenant.FullName : invoice.TenantID, RoomNumber: room ? room.RoomNumber : '' };
    });

  const overdueList = overdue
    .sort((a, b) => a.DueDate.localeCompare(b.DueDate))
    .slice(0, 6)
    .map((invoice) => {
      const tenant = db.tenants.find((t) => t.TenantID === invoice.TenantID);
      const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
      return { ...invoice, TenantName: tenant ? tenant.FullName : invoice.TenantID, RoomNumber: room ? room.RoomNumber : '' };
    });

  const pendingActivities = db.activities.filter((a) => ['Pending', 'In Progress'].includes(a.Status)).length;

  return {
    range: { from, to },
    rooms,
    tenants: { active: activeTenants, upcomingCheckIns, upcomingCheckOuts, recentTransfers, pendingActivities },
    financial,
    recentInvoices: canSeeFinance ? recentInvoices : [],
    overdueInvoices: canSeeFinance ? overdueList : [],
    propertyName: getSetting(db, 'PropertyName', 'Kos'),
  };
}

function getFinancialReport(db, filters = {}) {
  const { from, to } = sanitizeRange(filters);
  recalculateAllInvoices(db, today());
  const invoices = db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled' && inRange(i.InvoiceDate, from, to));
  const payments = db.payments.filter((p) => p.PaymentStatus === 'Confirmed' && inRange(p.PaymentDate, from, to));
  const expenses = db.expenses.filter((e) => e.PaymentStatus === 'Paid' && inRange(e.ExpenseDate, from, to));
  const ledger = transactionTotals(db, from, to);

  const byType = {};
  for (const t of ledger.rows) {
    const key = `${t.TransactionType}|${t.Direction}`;
    byType[key] = (byType[key] || 0) + Number(t.Amount);
  }

  const revenueByRoomType = {};
  for (const invoice of invoices) {
    const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
    const type = room ? db.roomTypes.find((t) => t.RoomTypeID === room.RoomTypeID) : null;
    const key = type ? type.TypeName : 'Tanpa Kamar';
    revenueByRoomType[key] = (revenueByRoomType[key] || 0) + Number(invoice.RentalAmount);
  }

  const receivableByTenant = db.tenants.map((tenant) => {
    const open = db.invoices.filter((i) => i.TenantID === tenant.TenantID && i.InvoiceStatus !== 'Cancelled' && Number(i.OutstandingBalance) > 0);
    return {
      TenantID: tenant.TenantID,
      TenantName: tenant.FullName,
      InvoiceCount: open.length,
      Outstanding: open.reduce((s, i) => s + Number(i.OutstandingBalance), 0),
      Overdue: open.filter((i) => i.InvoiceStatus === 'Overdue').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
    };
  }).filter((row) => row.Outstanding > 0).sort((a, b) => b.Outstanding - a.Outstanding);

  const expenseByCategory = {};
  for (const expense of expenses) {
    expenseByCategory[expense.Category] = (expenseByCategory[expense.Category] || 0) + Number(expense.TotalAmount);
  }

  return {
    range: { from, to },
    summary: {
      invoicesIssued: invoices.length,
      invoiceTotal: invoices.reduce((s, i) => s + Number(i.TotalAmount), 0),
      rentalInvoiced: invoices.reduce((s, i) => s + Number(i.RentalAmount), 0),
      serviceInvoiced: invoices.reduce((s, i) => s + Number(i.ServiceCharges), 0),
      paymentsReceived: payments.reduce((s, p) => s + Number(p.AmountReceived), 0),
      paymentCount: payments.length,
      expensesPaid: expenses.reduce((s, e) => s + Number(e.TotalAmount), 0),
      expenseCount: expenses.length,
      outstandingReceivables: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
      overdueAmount: db.invoices.filter((i) => i.InvoiceStatus === 'Overdue').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
      depositLiabilities: depositSummary(db).totalHeld,
      cashIn: ledger.inflow,
      cashOut: ledger.outflow,
      netCashFlow: ledger.net,
    },
    ledgerByType: byType,
    revenueByRoomType,
    expenseByCategory,
    receivableByTenant,
    invoices,
    payments,
    expenses,
    transactions: ledger.rows.sort((a, b) => b.TransactionDate.localeCompare(a.TransactionDate)),
  };
}

function getDailyReport(db, date = today()) {
  const payments = db.payments.filter((p) => p.PaymentDate === date && p.PaymentStatus === 'Confirmed');
  const expenses = db.expenses.filter((e) => e.ExpenseDate === date && e.PaymentStatus === 'Paid');
  const transactions = db.transactions.filter((t) => t.TransactionDate === date);
  return {
    date,
    payments: payments.map((p) => {
      const tenant = db.tenants.find((t) => t.TenantID === p.TenantID);
      return { ...p, TenantName: tenant ? tenant.FullName : p.TenantID };
    }),
    expenses,
    transactions,
    summary: {
      paymentTotal: payments.reduce((s, p) => s + Number(p.AmountReceived), 0),
      expenseTotal: expenses.reduce((s, e) => s + Number(e.TotalAmount), 0),
      cashIn: transactions.filter((t) => t.Direction === 'IN' && !['Deposit Received'].includes(t.TransactionType)).reduce((s, t) => s + Number(t.Amount), 0),
      cashOut: transactions.filter((t) => t.Direction === 'OUT' && !['Deposit Returned'].includes(t.TransactionType)).reduce((s, t) => s + Number(t.Amount), 0),
      net: transactions.filter((t) => !['Deposit Received', 'Deposit Returned'].includes(t.TransactionType)).reduce((s, t) => s + (t.Direction === 'IN' ? 1 : -1) * Number(t.Amount), 0),
    },
  };
}

function getOccupancyReport(db, filters = {}) {
  const { from, to } = sanitizeRange(filters);
  recalculateAllInvoices(db, today());
  const rooms = db.rooms.map((room) => {
    const history = db.occupancies.filter((o) => {
      if (o.RoomID !== room.RoomID) return false;
      const end = o.ActualCheckOut || '9999-12-31';
      return o.CheckInDate <= to && end >= from;
    }).map((o) => {
      const tenant = db.tenants.find((t) => t.TenantID === o.TenantID);
      return {
        OccupancyID: o.OccupancyID,
        TenantName: tenant ? tenant.FullName : o.TenantID,
        CheckInDate: o.CheckInDate,
        CheckOutDate: o.ActualCheckOut || '',
        AgreementStatus: o.AgreementStatus,
        MonthlyPrice: o.AgreedMonthlyPrice,
        ActiveDays: Math.max(1, daysBetween(o.CheckInDate < from ? from : o.CheckInDate, (o.ActualCheckOut && o.ActualCheckOut < to ? o.ActualCheckOut : to)) + 1),
      };
    });
    const invoices = db.invoices.filter((i) => i.RoomID === room.RoomID && i.InvoiceStatus !== 'Cancelled' && inRange(i.InvoiceDate, from, to));
    return {
      ...room,
      AvailabilityStatus: roomAvailability(db, room),
      History: history,
      InvoicesIssued: invoices.reduce((s, i) => s + Number(i.TotalAmount), 0),
      RentCollected: invoices.reduce((s, i) => s + Number(i.AmountPaid), 0),
    };
  });
  const occupied = rooms.filter((r) => r.AvailabilityStatus === 'Occupied').length;
  const activeRooms = rooms.filter((r) => r.AvailabilityStatus !== 'Inactive').length;
  return {
    range: { from, to },
    summary: { totalRooms: rooms.length, occupied, activeRooms, occupancyRate: activeRooms ? Math.round((occupied / activeRooms) * 1000) / 10 : 0 },
    rooms,
  };
}

function getTenantStatement(db, tenantId, filters = {}) {
  return tenantStatement(db, tenantId, filters);
}

function reconcile(db) {
  recalculateAllInvoices(db, today());
  const issues = [];
  const confirmedPayments = db.payments.filter((p) => p.PaymentStatus === 'Confirmed');
  for (const payment of confirmedPayments) {
    const allocations = db.allocations.filter((a) => a.PaymentID === payment.PaymentID && a.AllocationStatus === 'Valid');
    const allocated = allocations.reduce((s, a) => s + Number(a.AllocatedAmount), 0);
    const serviceApplied = db.serviceOrders.filter((o) => o.PaymentID === payment.PaymentID).reduce((s, o) => s + Number(o.TotalAmount), 0);
    const credits = db.credits.filter((c) => c.PaymentID === payment.PaymentID && c.Status !== 'Voided');
    const creditTotal = credits.reduce((s, c) => s + Number(c.RemainingAmount), 0);
    const total = allocated + serviceApplied + creditTotal;
    if (total > Number(payment.AmountReceived)) {
      issues.push({
        level: 'critical',
        module: 'Payments',
        recordId: payment.PaymentID,
        message: `Alokasi + kredit (${total}) melebihi jumlah pembayaran (${payment.AmountReceived}).`,
      });
    }
  }
  for (const invoice of db.invoices) {
    if (invoice.InvoiceStatus === 'Cancelled') {
      if (db.allocations.some((a) => a.InvoiceID === invoice.InvoiceID && a.AllocationStatus === 'Valid')) {
        issues.push({ level: 'critical', module: 'Invoices', recordId: invoice.InvoiceID, message: 'Invoice dibatalkan masih memiliki alokasi valid.' });
      }
      continue;
    }
    const expected = Number(invoice.TotalAmount) - Number(invoice.AmountPaid);
    if (Math.abs(expected - Number(invoice.OutstandingBalance)) > 0.5) {
      issues.push({ level: 'critical', module: 'Invoices', recordId: invoice.InvoiceID, message: `Saldo invoice tidak konsisten (${invoice.OutstandingBalance} vs ${expected}).` });
    }
    if (Number(invoice.AmountPaid) > Number(invoice.TotalAmount) + 0.5) {
      issues.push({ level: 'warning', module: 'Invoices', recordId: invoice.InvoiceID, message: 'Pembayaran melebihi total invoice; periksa alokasi.' });
    }
  }
  for (const deposit of db.deposits) {
    const expected = Number(deposit.DepositAmount) - Number(deposit.AmountReturned) - Number(deposit.AmountDeducted);
    if (Math.abs(expected - Number(deposit.OutstandingDepositLiability)) > 0.5) {
      issues.push({ level: 'critical', module: 'Deposits', recordId: deposit.DepositRecordID, message: 'Saldo kewajiban deposit tidak konsisten.' });
    }
  }
  const totals = {
    invoicesTotal: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.TotalAmount), 0),
    invoicesPaid: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.AmountPaid), 0),
    invoicesOutstanding: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
    confirmedPayments: confirmedPayments.reduce((s, p) => s + Number(p.AmountReceived), 0),
    validAllocations: db.allocations.filter((a) => a.AllocationStatus === 'Valid').reduce((s, a) => s + Number(a.AllocatedAmount), 0),
    credits: db.credits.filter((c) => c.Status !== 'Voided').reduce((s, c) => s + Number(c.RemainingAmount), 0),
    depositLiability: depositSummary(db).totalHeld,
    transactionsIn: db.transactions.filter((t) => t.Direction === 'IN').reduce((s, t) => s + Number(t.Amount), 0),
    transactionsOut: db.transactions.filter((t) => t.Direction === 'OUT').reduce((s, t) => s + Number(t.Amount), 0),
  };
  return { checkedAt: new Date().toISOString(), issues, totals, ok: issues.length === 0 };
}

function getRevenueSummary(db) {
  recalculateAllInvoices(db, today());
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const from = monthStart(addMonthsClamped(today(), -i));
    const to = monthEnd(from);
    const invoices = db.invoices.filter((invoice) => invoice.InvoiceStatus !== 'Cancelled' && inRange(invoice.InvoiceDate, from, to));
    const payments = db.payments.filter((p) => p.PaymentStatus === 'Confirmed' && inRange(p.PaymentDate, from, to));
    const expenses = db.expenses.filter((e) => e.PaymentStatus === 'Paid' && inRange(e.ExpenseDate, from, to));
    months.push({
      month: from.slice(0, 7),
      invoiced: invoices.reduce((s, i) => s + Number(i.TotalAmount), 0),
      collected: payments.reduce((s, p) => s + Number(p.AmountReceived), 0),
      expenses: expenses.reduce((s, e) => s + Number(e.TotalAmount), 0),
    });
  }
  return months;
}

module.exports = {
  sanitizeRange,
  roomStats,
  getDashboard,
  getFinancialReport,
  getDailyReport,
  getOccupancyReport,
  getTenantStatement,
  reconcile,
  getRevenueSummary,
};

});

__define("services/rooms", function (module, exports, require) {
'use strict';

const { nowISO, today, makeId, AppError, requireFields, requireAmount, requireEnum, cleanText } = require('../util');
const { audit, findById } = require('./common');

const ROOM_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Inactive'];

function activeOccupanciesForRoom(db, roomId, date = today()) {
  return db.occupancies.filter((occupancy) => {
    if (occupancy.RoomID !== roomId) return false;
    if (occupancy.AgreementStatus !== 'Active') return false;
    if (occupancy.CheckInDate > date) return false;
    if (occupancy.ActualCheckOut && occupancy.ActualCheckOut <= date) return false;
    return true;
  });
}

function roomAvailability(db, room) {
  if (room.OperationalStatus === 'Inactive') return 'Inactive';
  if (room.OperationalStatus === 'Maintenance') return 'Maintenance';
  const occupants = activeOccupanciesForRoom(db, room.RoomID);
  if (occupants.length >= Number(room.Capacity || 1)) return 'Occupied';
  const hasReservation = db.reservations.some(
    (reservation) => reservation.RoomID === room.RoomID
      && ['Pending', 'Confirmed'].includes(reservation.ReservationStatus)
      && (!reservation.PlannedCheckOut || reservation.PlannedCheckOut >= today())
  );
  if (hasReservation) return 'Reserved';
  if (occupants.length > 0) return 'Occupied';
  return 'Available';
}

function listRoomTypes(db) {
  return db.roomTypes.map((type) => ({
    ...type,
    RoomCount: db.rooms.filter((room) => room.RoomTypeID === type.RoomTypeID).length,
  }));
}

function saveRoomType(db, data, user) {
  if (data.RoomTypeID) {
    const row = findById(db.roomTypes, 'RoomTypeID', data.RoomTypeID);
    const previous = JSON.stringify(row);
    if (data.TypeName !== undefined) row.TypeName = cleanText(data.TypeName, 80) || row.TypeName;
    if (data.Description !== undefined) row.Description = cleanText(data.Description, 500);
    if (data.DefaultCapacity !== undefined) row.DefaultCapacity = requireAmount(data.DefaultCapacity, 'Kapasitas');
    if (data.DefaultMonthlyPrice !== undefined) row.DefaultMonthlyPrice = requireAmount(data.DefaultMonthlyPrice, 'Harga bulanan');
    if (data.Facilities !== undefined) row.Facilities = cleanText(data.Facilities, 1000);
    if (data.IsActive !== undefined) row.IsActive = String(data.IsActive).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
    row.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_ROOM_TYPE', module: 'RoomTypes', recordId: row.RoomTypeID, previous, next: JSON.stringify(row) });
    return row;
  }
  requireFields(data, ['TypeName', 'DefaultMonthlyPrice']);
  const type = {
    RoomTypeID: makeId(db, 'roomType', 'RT'),
    TypeName: cleanText(data.TypeName, 80),
    Description: cleanText(data.Description, 500),
    DefaultCapacity: requireAmount(data.DefaultCapacity || 1, 'Kapasitas'),
    DefaultMonthlyPrice: requireAmount(data.DefaultMonthlyPrice, 'Harga bulanan'),
    Facilities: cleanText(data.Facilities, 1000),
    IsActive: 'TRUE',
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.roomTypes.push(type);
  audit(db, { user: user.StaffID, action: 'CREATE_ROOM_TYPE', module: 'RoomTypes', recordId: type.RoomTypeID, next: JSON.stringify(type) });
  return type;
}

function decorateRoom(db, room) {
  const type = db.roomTypes.find((t) => t.RoomTypeID === room.RoomTypeID);
  const occupants = activeOccupanciesForRoom(db, room.RoomID);
  return {
    ...room,
    RoomTypeName: type ? type.TypeName : '-',
    AvailabilityStatus: roomAvailability(db, room),
    ActiveOccupants: occupants.length,
    OccupantNames: occupants.map((occupancy) => {
      const tenant = db.tenants.find((t) => t.TenantID === occupancy.TenantID);
      return tenant ? tenant.FullName : occupancy.TenantID;
    }).join(', '),
    OccupancyID: occupants[0] ? occupants[0].OccupancyID : '',
    TenantID: occupants[0] ? occupants[0].TenantID : '',
  };
}

function listRooms(db, filters = {}) {
  let rows = db.rooms.map((room) => decorateRoom(db, room));
  if (filters.status) rows = rows.filter((room) => room.AvailabilityStatus === filters.status);
  if (filters.building) rows = rows.filter((room) => room.Building === filters.building);
  if (filters.roomTypeId) rows = rows.filter((room) => room.RoomTypeID === filters.roomTypeId);
  return rows.sort((a, b) => String(a.RoomNumber).localeCompare(String(b.RoomNumber)));
}

function saveRoom(db, data, user) {
  const operationalStatus = data.OperationalStatus
    ? requireEnum(data.OperationalStatus, ROOM_STATUSES.filter((s) => s !== 'Occupied' && s !== 'Reserved'), 'Status operasional')
    : 'Available';
  if (data.RoomID) {
    const room = findById(db.rooms, 'RoomID', data.RoomID);
    const previous = JSON.stringify(room);
    if (data.RoomNumber && data.RoomNumber !== room.RoomNumber) {
      if (db.rooms.some((r) => r.RoomNumber.toLowerCase() === cleanText(data.RoomNumber, 20).toLowerCase() && r.RoomID !== room.RoomID)) {
        throw new AppError('Nomor kamar sudah digunakan.');
      }
      room.RoomNumber = cleanText(data.RoomNumber, 20);
    }
    if (data.Building !== undefined) room.Building = cleanText(data.Building, 30);
    if (data.Floor !== undefined) room.Floor = cleanText(data.Floor, 10);
    if (data.RoomTypeID !== undefined) {
      const type = findById(db.roomTypes, 'RoomTypeID', data.RoomTypeID);
      room.RoomTypeID = type.RoomTypeID;
    }
    if (data.Capacity !== undefined) room.Capacity = requireAmount(data.Capacity, 'Kapasitas');
    if (data.Facilities !== undefined) room.Facilities = cleanText(data.Facilities, 1000);
    if (data.StandardMonthlyPrice !== undefined) room.StandardMonthlyPrice = requireAmount(data.StandardMonthlyPrice, 'Harga bulanan');
    if (data.OperationalStatus !== undefined) room.OperationalStatus = operationalStatus;
    if (data.Notes !== undefined) room.Notes = cleanText(data.Notes, 500);
    room.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_ROOM', module: 'Rooms', recordId: room.RoomID, previous, next: JSON.stringify(room) });
    return decorateRoom(db, room);
  }
  requireFields(data, ['RoomNumber', 'RoomTypeID', 'StandardMonthlyPrice']);
  if (db.rooms.some((r) => r.RoomNumber.toLowerCase() === cleanText(data.RoomNumber, 20).toLowerCase())) {
    throw new AppError('Nomor kamar sudah digunakan.');
  }
  const type = findById(db.roomTypes, 'RoomTypeID', data.RoomTypeID);
  const room = {
    RoomID: makeId(db, 'room', 'RM'),
    RoomNumber: cleanText(data.RoomNumber, 20),
    Building: cleanText(data.Building, 30),
    Floor: cleanText(data.Floor, 10),
    RoomTypeID: type.RoomTypeID,
    Capacity: requireAmount(data.Capacity || type.DefaultCapacity, 'Kapasitas'),
    Facilities: cleanText(data.Facilities || type.Facilities, 1000),
    StandardMonthlyPrice: requireAmount(data.StandardMonthlyPrice, 'Harga bulanan'),
    OperationalStatus: operationalStatus,
    Notes: cleanText(data.Notes, 500),
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.rooms.push(room);
  audit(db, { user: user.StaffID, action: 'CREATE_ROOM', module: 'Rooms', recordId: room.RoomID, next: JSON.stringify(room) });
  return decorateRoom(db, room);
}

function assignmentConflict(db, { roomId, startDate, endDate, excludeOccupancyId = '', excludeReservationId = '' }) {
  const room = findById(db.rooms, 'RoomID', roomId);
  if (room.OperationalStatus === 'Inactive') throw new AppError('Kamar tidak aktif dan tidak dapat digunakan.');
  if (room.OperationalStatus === 'Maintenance') throw new AppError('Kamar sedang dalam perbaikan dan tidak dapat digunakan.');
  const end = endDate || '9999-12-31';
  const occupants = db.occupancies.filter((occupancy) => {
    if (occupancy.RoomID !== roomId || occupancy.OccupancyID === excludeOccupancyId) return false;
    if (occupancy.AgreementStatus !== 'Active') return false;
    const occEnd = occupancy.ActualCheckOut || occupancy.PlannedCheckOut || '9999-12-31';
    return occupancy.CheckInDate <= end && occEnd >= startDate;
  });
  const reservations = db.reservations.filter((reservation) => {
    if (reservation.RoomID !== roomId || reservation.ReservationID === excludeReservationId) return false;
    if (!['Pending', 'Confirmed'].includes(reservation.ReservationStatus)) return false;
    const resEnd = reservation.PlannedCheckOut || '9999-12-31';
    return reservation.PlannedCheckIn <= end && resEnd >= startDate;
  });
  const used = occupants.length + reservations.length;
  if (used >= Number(room.Capacity || 1)) {
    throw new AppError(`Kamar ${room.RoomNumber} tidak tersedia untuk periode tersebut (kapasitas ${room.Capacity} terpakai).`);
  }
  return room;
}

module.exports = {
  ROOM_STATUSES,
  activeOccupanciesForRoom,
  roomAvailability,
  listRoomTypes,
  saveRoomType,
  listRooms,
  saveRoom,
  decorateRoom,
  assignmentConflict,
};

});

__define("services/serviceOrders", function (module, exports, require) {
'use strict';

const {
  today, nowISO, addDays, monthStart, monthEnd, makeId, makeInvoiceNumber,
  AppError, requireFields, requireAmount, requireEnum, cleanText, isDate,
} = require('../util');
const { audit, getSetting, getNumberSetting, findById } = require('./common');
const { findOpenInvoiceForTenant, addServiceCharge, recalculateInvoice } = require('./billing');
const { recordDirectPayment } = require('./payments');

const SERVICE_CATEGORIES = ['Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'];
const BILLING_METHODS = ['Immediate Payment', 'Add to Invoice'];

function listServices(db) {
  return db.services.slice().sort((a, b) => a.ServiceName.localeCompare(b.ServiceName));
}

function saveService(db, data, user) {
  if (data.ServiceID) {
    const service = findById(db.services, 'ServiceID', data.ServiceID);
    const previous = JSON.stringify(service);
    if (data.ServiceName !== undefined) service.ServiceName = cleanText(data.ServiceName, 120) || service.ServiceName;
    if (data.ServiceCode !== undefined) service.ServiceCode = cleanText(data.ServiceCode, 30);
    if (data.Category !== undefined) service.Category = requireEnum(data.Category, SERVICE_CATEGORIES, 'Kategori layanan');
    if (data.Unit !== undefined) service.Unit = cleanText(data.Unit, 30);
    if (data.StandardPrice !== undefined) service.StandardPrice = requireAmount(data.StandardPrice, 'Harga standar');
    if (data.CostPrice !== undefined) service.CostPrice = requireAmount(data.CostPrice, 'Harga pokok', { allowZero: true });
    if (data.IsAvailable !== undefined) service.IsAvailable = String(data.IsAvailable).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    if (data.Description !== undefined) service.Description = cleanText(data.Description, 500);
    service.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_SERVICE', module: 'Services', recordId: service.ServiceID, previous, next: JSON.stringify(service) });
    return service;
  }
  requireFields(data, ['ServiceName', 'Category', 'Unit', 'StandardPrice']);
  const service = {
    ServiceID: makeId(db, 'service', 'SV'),
    ServiceCode: cleanText(data.ServiceCode, 30) || `SVC${db.services.length + 1}`,
    ServiceName: cleanText(data.ServiceName, 120),
    Category: requireEnum(data.Category, SERVICE_CATEGORIES, 'Kategori layanan'),
    Unit: cleanText(data.Unit, 30),
    StandardPrice: requireAmount(data.StandardPrice, 'Harga standar'),
    CostPrice: requireAmount(data.CostPrice || 0, 'Harga pokok', { allowZero: true }),
    IsAvailable: 'TRUE',
    Description: cleanText(data.Description, 500),
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.services.push(service);
  audit(db, { user: user.StaffID, action: 'CREATE_SERVICE', module: 'Services', recordId: service.ServiceID, next: JSON.stringify(service) });
  return service;
}

function listServiceOrders(db, filters = {}) {
  let rows = db.serviceOrders.map((order) => {
    const tenant = db.tenants.find((t) => t.TenantID === order.TenantID);
    const service = db.services.find((s) => s.ServiceID === order.ServiceID);
    const room = db.rooms.find((r) => r.RoomID === order.RoomID);
    return {
      ...order,
      TenantName: tenant ? tenant.FullName : order.TenantID,
      ServiceName: service ? service.ServiceName : order.ServiceID,
      RoomNumber: room ? room.RoomNumber : '',
    };
  });
  if (filters.status) rows = rows.filter((row) => row.OrderStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.from) rows = rows.filter((row) => row.OrderDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.OrderDate <= filters.to);
  rows.sort((a, b) => b.OrderDate.localeCompare(a.OrderDate) || b.CreatedAt.localeCompare(a.CreatedAt));
  return rows;
}

function createServiceInvoice(db, tenantId, occupancy, amount, orderDate, user) {
  const invoiceDate = today();
  const invoice = {
    InvoiceID: makeId(db, 'invoice', 'INV'),
    InvoiceNumber: makeInvoiceNumber(db, getSetting(db, 'InvoicePrefix', 'INV'), invoiceDate),
    TenantID: tenantId,
    OccupancyID: occupancy ? occupancy.OccupancyID : '',
    RoomID: occupancy ? occupancy.RoomID : '',
    PeriodStart: monthStart(orderDate),
    PeriodEnd: monthEnd(orderDate),
    InvoiceDate: invoiceDate,
    DueDate: addDays(orderDate, getNumberSetting(db, 'DefaultDueDays', 5)),
    RentalAmount: 0,
    ServiceCharges: amount,
    OtherCharges: 0,
    DiscountAmount: 0,
    TotalAmount: amount,
    AmountPaid: 0,
    OutstandingBalance: amount,
    InvoiceStatus: 'Issued',
    CreatedAt: nowISO(),
    CreatedBy: user.StaffID || '',
    Notes: `Tagihan layanan tambahan tanggal ${orderDate}`,
  };
  db.invoices.push(invoice);
  recalculateInvoice(db, invoice);
  audit(db, { user: user.StaffID, action: 'CREATE_SERVICE_INVOICE', module: 'Invoices', recordId: invoice.InvoiceID, next: JSON.stringify({ amount, tenant: tenantId }) });
  return invoice;
}

function createServiceOrder(db, data, user) {
  requireFields(data, ['TenantID', 'ServiceID', 'Quantity', 'BillingMethod']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const service = findById(db.services, 'ServiceID', data.ServiceID);
  if (service.IsAvailable === 'FALSE') throw new AppError('Layanan ini sedang tidak tersedia.');
  const quantity = requireAmount(data.Quantity, 'Jumlah');
  const orderDate = data.OrderDate || today();
  if (!isDate(orderDate)) throw new AppError('Tanggal order tidak valid.');
  const billingMethod = requireEnum(data.BillingMethod, BILLING_METHODS, 'Metode penagihan');
  const occupancy = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active');
  if (!occupancy) throw new AppError('Penghuni tidak memiliki perjanjian sewa aktif.');
  const unitPrice = requireAmount(data.UnitPrice !== undefined ? data.UnitPrice : service.StandardPrice, 'Harga satuan');
  const total = unitPrice * quantity;
  const orderId = makeId(db, 'serviceOrder', 'SVO');

  let invoice = null;
  let payment = null;
  let paymentMethod = '';
  if (billingMethod === 'Add to Invoice') {
    invoice = data.InvoiceID ? findById(db.invoices, 'InvoiceID', data.InvoiceID) : findOpenInvoiceForTenant(db, tenant.TenantID);
    if (!invoice) invoice = createServiceInvoice(db, tenant.TenantID, occupancy, total, orderDate, user);
    else {
      if (invoice.TenantID !== tenant.TenantID) throw new AppError('Invoice tidak sesuai dengan penghuni.');
      addServiceCharge(db, invoice.InvoiceID, total, `${service.ServiceName} ${quantity} ${service.Unit}`);
    }
  } else {
    paymentMethod = requireEnum(data.PaymentMethod || 'Cash', ['Cash', 'Bank Transfer', 'QRIS', 'Other'], 'Metode pembayaran');
    const result = recordDirectPayment(db, {
      TenantID: tenant.TenantID,
      AmountReceived: total,
      PaymentMethod: paymentMethod,
      PaymentDate: orderDate,
      ReferenceNumber: data.ReferenceNumber,
      ReferenceType: 'ServiceOrder',
      ReferenceID: orderId,
      RoomID: occupancy.RoomID,
      TransactionType: 'Service Payment',
      Category: service.Category,
      Description: `Layanan ${service.ServiceName} ${quantity} ${service.Unit}`,
      IdempotencyKey: `SVC-ORDER:${orderId}`,
      Notes: cleanText(data.Notes, 400),
    }, user);
    payment = result.payment;
  }

  const order = {
    ServiceOrderID: orderId,
    OrderDate: orderDate,
    TenantID: tenant.TenantID,
    RoomID: occupancy.RoomID,
    ServiceID: service.ServiceID,
    Quantity: quantity,
    UnitPrice: unitPrice,
    TotalAmount: total,
    OrderStatus: billingMethod === 'Immediate Payment' ? 'Paid' : 'Billed',
    BillingMethod: billingMethod,
    InvoiceID: invoice ? invoice.InvoiceID : '',
    PaymentID: payment ? payment.PaymentID : '',
    RequestedBy: user.StaffID || '',
    ProcessedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.serviceOrders.push(order);
  audit(db, {
    user: user.StaffID, action: 'CREATE_SERVICE_ORDER', module: 'ServiceOrders', recordId: order.ServiceOrderID,
    next: JSON.stringify({ service: service.ServiceID, quantity, total, billingMethod, invoice: order.InvoiceID, payment: order.PaymentID }),
  });
  return { order, invoice, payment };
}

module.exports = { SERVICE_CATEGORIES, BILLING_METHODS, listServices, saveService, listServiceOrders, createServiceOrder };

});

__define("services/staff", function (module, exports, require) {
'use strict';

const { nowISO, makeId, AppError, requireFields, requireEnum, cleanText } = require('../util');
const { audit, findById } = require('./common');

const APP_ROLES = ['Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff'];
const EMPLOYMENT_STATUSES = ['Active', 'Inactive', 'Resigned'];

function listStaff(db) {
  return db.staff.map((staff) => {
    const user = db.users.find((u) => u.StaffID === staff.StaffID);
    return {
      ...staff,
      UserID: user ? user.UserID : '',
      LoginEmail: user ? user.Email : '',
      LoginRole: user ? user.Role : '',
      LoginActive: user ? user.IsActive : 'FALSE',
    };
  }).sort((a, b) => a.FullName.localeCompare(b.FullName));
}

function saveStaff(db, data, user) {
  if (data.StaffID) {
    const staff = findById(db.staff, 'StaffID', data.StaffID);
    const previous = JSON.stringify(staff);
    if (data.FullName !== undefined) staff.FullName = cleanText(data.FullName, 120) || staff.FullName;
    if (data.Position !== undefined) staff.Position = cleanText(data.Position, 80);
    if (data.Phone !== undefined) staff.Phone = cleanText(data.Phone, 40);
    if (data.Email !== undefined) staff.Email = cleanText(data.Email, 120);
    if (data.StartDate !== undefined) staff.StartDate = cleanText(data.StartDate, 10);
    if (data.EndDate !== undefined) staff.EndDate = cleanText(data.EndDate, 10);
    if (data.EmploymentStatus !== undefined) staff.EmploymentStatus = requireEnum(data.EmploymentStatus, EMPLOYMENT_STATUSES, 'Status kepegawaian');
    if (data.AppRole !== undefined) staff.AppRole = requireEnum(data.AppRole, APP_ROLES, 'Peran aplikasi');
    if (data.Notes !== undefined) staff.Notes = cleanText(data.Notes, 500);
    audit(db, { user: user.StaffID, action: 'UPDATE_STAFF', module: 'Staff', recordId: staff.StaffID, previous, next: JSON.stringify(staff) });
    return staff;
  }
  requireFields(data, ['FullName', 'AppRole']);
  const staff = {
    StaffID: makeId(db, 'staff', 'ST'),
    FullName: cleanText(data.FullName, 120),
    Position: cleanText(data.Position, 80),
    Phone: cleanText(data.Phone, 40),
    Email: cleanText(data.Email, 120),
    StartDate: cleanText(data.StartDate, 10) || new Date().toISOString().slice(0, 10),
    EndDate: cleanText(data.EndDate, 10),
    EmploymentStatus: requireEnum(data.EmploymentStatus || 'Active', EMPLOYMENT_STATUSES, 'Status kepegawaian'),
    AppRole: requireEnum(data.AppRole, APP_ROLES, 'Peran aplikasi'),
    Notes: cleanText(data.Notes, 500),
  };
  db.staff.push(staff);
  audit(db, { user: user.StaffID, action: 'CREATE_STAFF', module: 'Staff', recordId: staff.StaffID, next: JSON.stringify(staff) });
  return staff;
}

module.exports = { APP_ROLES, EMPLOYMENT_STATUSES, listStaff, saveStaff };

});

__define("services/tenants", function (module, exports, require) {
'use strict';

const { nowISO, makeId, AppError, requireFields, requireEnum, cleanText } = require('../util');
const { audit, findById } = require('./common');

const TENANT_STATUSES = ['Prospective', 'Active', 'Checked Out', 'Inactive'];

function canSeeIdentity(user) {
  return user && ['Owner', 'Manager', 'Receptionist'].includes(user.Role);
}

function sanitizeTenant(tenant, user) {
  if (canSeeIdentity(user)) return tenant;
  return { ...tenant, IdentityNumber: '***', Address: '***', EmergencyContact: '', EmergencyPhone: '' };
}

function listTenants(db, filters = {}, user = null) {
  let rows = db.tenants.map((tenant) => {
    const active = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active');
    const room = active ? db.rooms.find((r) => r.RoomID === active.RoomID) : null;
    return {
      ...tenant,
      RoomNumber: room ? room.RoomNumber : '',
      OccupancyID: active ? active.OccupancyID : '',
      ActiveBalance: db.invoices
        .filter((invoice) => invoice.TenantID === tenant.TenantID && invoice.InvoiceStatus !== 'Cancelled')
        .reduce((sum, invoice) => sum + Number(invoice.OutstandingBalance || 0), 0),
    };
  });
  if (filters.status) rows = rows.filter((tenant) => tenant.TenantStatus === filters.status);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((tenant) => `${tenant.FullName} ${tenant.Phone} ${tenant.Email} ${tenant.IdentityNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => a.FullName.localeCompare(b.FullName));
  return rows.map((tenant) => sanitizeTenant(tenant, user));
}

function saveTenant(db, data, user) {
  if (data.TenantID) {
    const tenant = findById(db.tenants, 'TenantID', data.TenantID);
    const previous = JSON.stringify(tenant);
    const textFields = ['FullName', 'IdentityType', 'IdentityNumber', 'Phone', 'Email', 'Address', 'EmergencyContact', 'EmergencyPhone', 'Occupation', 'Notes'];
    for (const field of textFields) {
      if (data[field] !== undefined) tenant[field] = cleanText(data[field], field === 'Notes' || field === 'Address' ? 500 : 120);
    }
    if (data.TenantStatus !== undefined) tenant.TenantStatus = requireEnum(data.TenantStatus, TENANT_STATUSES, 'Status penghuni');
    tenant.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_TENANT', module: 'Tenants', recordId: tenant.TenantID, previous, next: JSON.stringify(tenant) });
    return sanitizeTenant(tenant, user);
  }
  requireFields(data, ['FullName', 'Phone']);
  const tenant = {
    TenantID: makeId(db, 'tenant', 'T'),
    FullName: cleanText(data.FullName, 120),
    IdentityType: cleanText(data.IdentityType || 'KTP', 30),
    IdentityNumber: cleanText(data.IdentityNumber, 60),
    Phone: cleanText(data.Phone, 40),
    Email: cleanText(data.Email, 120),
    Address: cleanText(data.Address, 500),
    EmergencyContact: cleanText(data.EmergencyContact, 120),
    EmergencyPhone: cleanText(data.EmergencyPhone, 40),
    Occupation: cleanText(data.Occupation, 80),
    RegistrationDate: cleanText(data.RegistrationDate, 10) || nowISO().slice(0, 10),
    TenantStatus: requireEnum(data.TenantStatus || 'Prospective', TENANT_STATUSES, 'Status penghuni'),
    Notes: cleanText(data.Notes, 500),
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  if (tenant.Email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(tenant.Email)) throw new AppError('Format email tidak valid.');
  db.tenants.push(tenant);
  audit(db, { user: user.StaffID, action: 'CREATE_TENANT', module: 'Tenants', recordId: tenant.TenantID, next: JSON.stringify(tenant) });
  return sanitizeTenant(tenant, user);
}

function tenantStatement(db, tenantId, filters = {}) {
  const tenant = findById(db.tenants, 'TenantID', tenantId);
  const invoices = db.invoices.filter((invoice) => invoice.TenantID === tenantId)
    .filter((invoice) => !filters.from || invoice.InvoiceDate >= filters.from)
    .filter((invoice) => !filters.to || invoice.InvoiceDate <= filters.to);
  const payments = db.payments.filter((payment) => payment.TenantID === tenantId)
    .filter((payment) => !filters.from || payment.PaymentDate >= filters.from)
    .filter((payment) => !filters.to || payment.PaymentDate <= filters.to);
  const deposits = db.deposits.filter((deposit) => deposit.TenantID === tenantId);
  const credits = db.credits.filter((credit) => credit.TenantID === tenantId);
  const totalInvoiced = invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((sum, i) => sum + Number(i.TotalAmount), 0);
  const totalPaid = payments.filter((p) => p.PaymentStatus === 'Confirmed').reduce((sum, p) => sum + Number(p.AmountReceived), 0);
  const outstanding = invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((sum, i) => sum + Number(i.OutstandingBalance), 0);
  return {
    tenant,
    invoices,
    payments,
    deposits,
    credits,
    summary: { totalInvoiced, totalPaid, outstanding, depositLiability: deposits.reduce((s, d) => s + Number(d.OutstandingDepositLiability), 0) },
  };
}

module.exports = { TENANT_STATUSES, listTenants, saveTenant, tenantStatement, sanitizeTenant };

});

__define("services/users", function (module, exports, require) {
'use strict';

const { nowISO, makeId, AppError, requireFields, requireEnum, cleanText } = require('../util');
const { hashPassword } = require('../password');
const { audit, findById } = require('./common');
const { APP_ROLES } = require('./staff');

function listUsers(db) {
  return db.users.map((user) => {
    const staff = db.staff.find((s) => s.StaffID === user.StaffID);
    return {
      UserID: user.UserID,
      StaffID: user.StaffID,
      FullName: staff ? staff.FullName : '-',
      Email: user.Email,
      Role: user.Role,
      IsActive: user.IsActive,
      CreatedAt: user.CreatedAt,
      UpdatedAt: user.UpdatedAt,
    };
  });
}

function saveUser(db, data, user) {
  if (data.UserID) {
    const target = findById(db.users, 'UserID', data.UserID);
    const previous = JSON.stringify({ email: target.Email, role: target.Role, active: target.IsActive });
    if (data.Email !== undefined) {
      const email = cleanText(data.Email, 120).toLowerCase();
      if (db.users.some((u) => u.Email.toLowerCase() === email && u.UserID !== target.UserID)) throw new AppError('Email sudah digunakan.');
      target.Email = email;
    }
    if (data.Role !== undefined) target.Role = requireEnum(data.Role, APP_ROLES, 'Peran');
    if (data.IsActive !== undefined) target.IsActive = String(data.IsActive).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    if (data.Password) {
      if (String(data.Password).length < 6) throw new AppError('Password minimal 6 karakter.');
      target.PasswordHash = hashPassword(String(data.Password));
    }
    if (target.Role === 'Owner' && target.IsActive === 'TRUE') {
      // allowed
    }
    if (target.UserID === user.UserID && target.IsActive === 'FALSE') throw new AppError('Anda tidak dapat menonaktifkan akun sendiri.');
    target.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_USER', module: 'Users', recordId: target.UserID, previous, next: JSON.stringify({ email: target.Email, role: target.Role, active: target.IsActive }) });
    return target;
  }
  requireFields(data, ['StaffID', 'Email', 'Password', 'Role']);
  const staff = findById(db.staff, 'StaffID', data.StaffID);
  const email = cleanText(data.Email, 120).toLowerCase();
  if (db.users.some((u) => u.Email.toLowerCase() === email)) throw new AppError('Email sudah digunakan.');
  if (String(data.Password).length < 6) throw new AppError('Password minimal 6 karakter.');
  const target = {
    UserID: makeId(db, 'user', 'USR'),
    StaffID: staff.StaffID,
    Email: email,
    PasswordHash: hashPassword(String(data.Password)),
    Role: requireEnum(data.Role, APP_ROLES, 'Peran'),
    IsActive: 'TRUE',
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.users.push(target);
  if (!staff.Email) staff.Email = email;
  audit(db, { user: user.StaffID, action: 'CREATE_USER', module: 'Users', recordId: target.UserID, next: JSON.stringify({ email, role: target.Role, staff: staff.StaffID }) });
  return target;
}

module.exports = { listUsers, saveUser };

});

function parseApiTarget_(rawPath) {
  const raw = String(rawPath || '/');
  const question = raw.indexOf('?');
  const pathPart = question >= 0 ? raw.slice(0, question) : raw;
  const queryPart = question >= 0 ? raw.slice(question + 1) : '';
  let path = pathPart.replace(/\/+$/, '') || '/';
  if (!path.startsWith('/api')) path = `/api${path.startsWith('/') ? '' : '/'}${path}`;
  const query = {};
  if (queryPart) {
    queryPart.split('&').forEach((pair) => {
      const index = pair.indexOf('=');
      const key = decodeURIComponent(index >= 0 ? pair.slice(0, index) : pair);
      const value = decodeURIComponent(index >= 0 ? pair.slice(index + 1) : '');
      if (key) query[key] = value;
    });
  }
  return { path, query };
}

function bootstrapPayload_(db, user, services, token) {
  const { can } = services.auth;
  const payload = {
    user,
    storage: 'Google Sheets',
    property: {
      name: services.common.getSetting(db, 'PropertyName', 'Kos'),
      address: services.common.getSetting(db, 'PropertyAddress', ''),
      phone: services.common.getSetting(db, 'PropertyPhone', ''),
      currency: services.common.getSetting(db, 'Currency', 'IDR'),
      timezone: services.common.getSetting(db, 'Timezone', 'Asia/Jakarta'),
      invoicePrefix: services.common.getSetting(db, 'InvoicePrefix', 'INV'),
      receiptPrefix: services.common.getSetting(db, 'ReceiptPrefix', 'KWT'),
      dueDays: services.common.getSetting(db, 'DefaultDueDays', '5'),
    },
    today: services.util.today(),
    roomTypes: can(user, 'roomTypes', 'read') ? services.rooms.listRoomTypes(db).filter((row) => row.IsActive === 'TRUE') : [],
    rooms: can(user, 'rooms', 'read') ? services.rooms.listRooms(db) : [],
    tenants: can(user, 'tenants', 'read') ? services.tenants.listTenants(db, {}, user) : [],
    services: can(user, 'services', 'read') ? services.serviceOrders.listServices(db) : [],
    staff: can(user, 'staff', 'read')
      ? services.staff.listStaff(db)
      : (user.Role === 'Operational Staff' ? services.staff.listStaff(db).filter((row) => row.StaffID === user.StaffID) : []),
    settings: can(user, 'settings', 'read') ? services.masters.listSettings(db) : [],
    users: can(user, 'users', 'read') ? services.users.listUsers(db) : [],
  };
  if (can(user, 'dashboard', 'read')) {
    try {
      const from = services.util.monthStart();
      const to = services.util.monthEnd();
      const page = dashboardPage_(db, user, services, { from, to });
      writeApiCache_(apiCacheKey_(token || '', '/api/dashboard-page', { from, to }), ok_(page));
    } catch (error) {
      // Dashboard prefetch is best effort; the page falls back to its own request.
    }
  }
  return payload;
}

function dashboardPage_(db, user, services, filters) {
  const { can } = services.auth;
  return {
    dashboard: services.reports.getDashboard(db, filters || {}, user),
    revenue: can(user, 'reports', 'read') ? services.reports.getRevenueSummary(db) : [],
    activities: can(user, 'activities', 'read') ? services.activities.listActivities(db, { status: 'Pending' }, user) : [],
  };
}

function ok_(data) {
  return { ok: true, data };
}

function mutate_(work) {
  return __require('db').withLock(work);
}

const API_CACHE_PREFIX = 'kos_api_';
const API_CACHE_TTL_SECONDS = 30;
const API_CACHE_MAX_CHARS = 45000;

function apiCache_() {
  try {
    const documentCache = CacheService.getDocumentCache();
    if (documentCache) return documentCache;
  } catch (error) {
    // Standalone scripts have no document cache; use the script cache instead.
  }
  return CacheService.getScriptCache();
}

function apiCacheVersion_() {
  try {
    return PropertiesService.getScriptProperties().getProperty('API_CACHE_VERSION') || '0';
  } catch (error) {
    return '0';
  }
}

function apiCacheKey_(token, path, query) {
  const source = `${apiCacheVersion_()}\n${path}\n${JSON.stringify(query || {})}\n${token || ''}`;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, source);
  let hex = '';
  for (let index = 0; index < digest.length; index += 1) {
    const value = digest[index] < 0 ? digest[index] + 256 : digest[index];
    hex += (value < 16 ? '0' : '') + value.toString(16);
  }
  return `${API_CACHE_PREFIX}${hex}`;
}

function readApiCache_(key) {
  try {
    const raw = apiCache_().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeApiCache_(key, result) {
  try {
    const text = JSON.stringify(result);
    if (text.length > API_CACHE_MAX_CHARS) return;
    apiCache_().put(key, text, API_CACHE_TTL_SECONDS);
  } catch (error) {
    // Read responses remain uncached when the script cache is unavailable or full.
  }
}

function handleApi_(token, method, path, q, body) {
  const DB = __require('db');
  const auth = __require('auth');
  const { AppError, today } = __require('util');
  const common = __require('services/common');
  const services = {
    auth,
    common,
    util: __require('util'),
    rooms: __require('services/rooms'),
    tenants: __require('services/tenants'),
    occupancy: __require('services/occupancy'),
    billing: __require('services/billing'),
    payments: __require('services/payments'),
    serviceOrders: __require('services/serviceOrders'),
    expenses: __require('services/expenses'),
    deposits: __require('services/deposits'),
    staff: __require('services/staff'),
    users: __require('services/users'),
    activities: __require('services/activities'),
    masters: __require('services/masters'),
    reports: __require('services/reports'),
    jobs: __require('jobs'),
  };

  if (path === '/api/health') {
    return ok_({ status: 'ok', storage: 'Google Sheets', configured: DB.isConfigured(), time: new Date().toISOString() });
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const db = DB.load();
    const result = auth.login(db, body.email, body.password);
    const fresh = auth.sessionUser(db, result.token);
    return {
      ok: true,
      data: { user: fresh, bootstrap: bootstrapPayload_(db, fresh, services, result.token) },
      token: result.token,
    };
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    auth.logout(token);
    return ok_({ loggedOut: true });
  }

  const db = DB.load();
  if (path === '/api/public-config' && method === 'GET') {
    return ok_({ property: { name: common.getSetting(db, 'PropertyName', 'Kos') } });
  }
  const user = auth.sessionUser(db, token);
  if (!user) throw new AppError('Silakan login terlebih dahulu.', 401, 'UNAUTHORIZED');
  if (path === '/api/auth/me' && method === 'GET') return ok_({ user });

  if (path === '/api/bootstrap' && method === 'GET') {
    auth.guard(user, 'dashboard', 'read');
    return ok_(bootstrapPayload_(db, user, services, token));
  }
  if (path === '/api/dashboard-page' && method === 'GET') {
    auth.guard(user, 'dashboard', 'read');
    return ok_(dashboardPage_(db, user, services, q));
  }
  if (path === '/api/dashboard' && method === 'GET') {
    auth.guard(user, 'dashboard', 'read');
    return ok_(services.reports.getDashboard(db, q, user));
  }

  if (path === '/api/rooms' && method === 'GET') {
    auth.guard(user, 'rooms', 'read');
    return ok_(services.rooms.listRooms(db, q));
  }
  if (path === '/api/rooms' && method === 'POST') {
    auth.guard(user, 'rooms', 'write');
    return ok_(mutate_((tx) => services.rooms.saveRoom(tx, body, user)));
  }
  if (path === '/api/room-types' && method === 'GET') {
    auth.guard(user, 'roomTypes', 'read');
    return ok_(services.rooms.listRoomTypes(db));
  }
  if (path === '/api/room-types' && method === 'POST') {
    auth.guard(user, 'roomTypes', 'write');
    return ok_(mutate_((tx) => services.rooms.saveRoomType(tx, body, user)));
  }

  if (path === '/api/tenants' && method === 'GET') {
    auth.guard(user, 'tenants', 'read');
    return ok_(services.tenants.listTenants(db, q, user));
  }
  if (path === '/api/tenants' && method === 'POST') {
    auth.guard(user, 'tenants', 'write');
    return ok_(mutate_((tx) => services.tenants.saveTenant(tx, body, user)));
  }

  if (path === '/api/reservations' && method === 'GET') {
    auth.guard(user, 'reservations', 'read');
    return ok_(services.occupancy.listReservations(db, q));
  }
  if (path === '/api/reservations' && method === 'POST') {
    auth.guard(user, 'reservations', 'write');
    return ok_(mutate_((tx) => services.occupancy.createReservation(tx, body, user)));
  }
  let match = path.match(/^\/api\/reservations\/([^/]+)$/);
  if (match && method === 'POST') {
    auth.guard(user, 'reservations', 'write');
    return ok_(mutate_((tx) => services.occupancy.updateReservation(tx, match[1], body, user)));
  }

  if (path === '/api/occupancies' && method === 'GET') {
    auth.guard(user, 'agreements', 'read');
    return ok_(services.occupancy.listOccupancies(db, q));
  }
  if (path === '/api/check-in' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.checkInTenant(tx, body, user)));
  }
  if (path === '/api/transfers' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.transferTenant(tx, body, user)));
  }
  if (path === '/api/renew' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.renewAgreement(tx, body, user)));
  }
  if (path === '/api/check-out' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.checkOutTenant(tx, body, user)));
  }

  if (path === '/api/invoices' && method === 'GET') {
    auth.guard(user, 'invoices', 'read');
    return ok_(services.billing.listInvoices(db, q));
  }
  if (path === '/api/invoices/generate' && method === 'POST') {
    auth.guard(user, 'invoices', 'generate');
    return ok_(mutate_((tx) => services.billing.generateMonthlyInvoices(tx, { asOf: body.asOf || today(), user: user.StaffID })));
  }
  match = path.match(/^\/api\/invoices\/([^/]+)$/);
  if (match && method === 'GET') {
    auth.guard(user, 'invoices', 'read');
    return ok_(services.billing.getInvoiceDetail(db, match[1]));
  }
  match = path.match(/^\/api\/invoices\/([^/]+)\/(cancel|adjust)$/);
  if (match && method === 'POST') {
    auth.guard(user, 'invoices', 'write');
    if (match[2] === 'cancel') return ok_(mutate_((tx) => services.billing.cancelInvoice(tx, match[1], body.reason, user)));
    return ok_(mutate_((tx) => services.billing.applyInvoiceAdjustment(tx, match[1], body, user)));
  }

  if (path === '/api/payments' && method === 'GET') {
    auth.guard(user, 'payments', 'read');
    return ok_(services.payments.listPayments(db, q));
  }
  if (path === '/api/payments' && method === 'POST') {
    auth.guard(user, 'payments', 'write');
    return ok_(mutate_((tx) => services.payments.recordPayment(tx, body, user)));
  }
  match = path.match(/^\/api\/payments\/([^/]+)$/);
  if (match && method === 'GET') {
    auth.guard(user, 'payments', 'read');
    return ok_(services.payments.getPaymentDetail(db, match[1]));
  }
  match = path.match(/^\/api\/payments\/([^/]+)\/void$/);
  if (match && method === 'POST') {
    auth.guard(user, 'payments', 'void');
    return ok_(mutate_((tx) => services.payments.voidPayment(tx, match[1], body.reason, user)));
  }

  if (path === '/api/services' && method === 'GET') {
    auth.guard(user, 'services', 'read');
    return ok_(services.serviceOrders.listServices(db));
  }
  if (path === '/api/services' && method === 'POST') {
    auth.guard(user, 'services', 'write');
    return ok_(mutate_((tx) => services.serviceOrders.saveService(tx, body, user)));
  }
  if (path === '/api/service-orders' && method === 'GET') {
    auth.guard(user, 'services', 'read');
    return ok_(services.serviceOrders.listServiceOrders(db, q));
  }
  if (path === '/api/service-orders' && method === 'POST') {
    auth.guard(user, 'services', 'write');
    return ok_(mutate_((tx) => services.serviceOrders.createServiceOrder(tx, body, user)));
  }

  if (path === '/api/expenses' && method === 'GET') {
    auth.guard(user, 'expenses', 'read');
    return ok_(services.expenses.listExpenses(db, q));
  }
  if (path === '/api/expenses' && method === 'POST') {
    auth.guard(user, 'expenses', 'write');
    return ok_(mutate_((tx) => services.expenses.saveExpense(tx, body, user)));
  }
  match = path.match(/^\/api\/expenses\/([^/]+)\/cancel$/);
  if (match && method === 'POST') {
    auth.guard(user, 'expenses', 'write');
    return ok_(mutate_((tx) => services.expenses.cancelExpense(tx, match[1], body.reason, user)));
  }

  if (path === '/api/transactions' && method === 'GET') {
    auth.guard(user, 'transactions', 'read');
    let rows = db.transactions.slice();
    if (q.from) rows = rows.filter((row) => row.TransactionDate >= q.from);
    if (q.to) rows = rows.filter((row) => row.TransactionDate <= q.to);
    if (q.type) rows = rows.filter((row) => row.TransactionType === q.type);
    if (q.direction) rows = rows.filter((row) => row.Direction === q.direction);
    rows = rows.map((row) => {
      const tenant = db.tenants.find((item) => item.TenantID === row.TenantID);
      const staff = db.staff.find((item) => item.StaffID === row.StaffID);
      return Object.assign({}, row, { TenantName: tenant ? tenant.FullName : '', StaffName: staff ? staff.FullName : '' });
    }).sort((a, b) => b.TransactionDate.localeCompare(a.TransactionDate) || b.CreatedAt.localeCompare(a.CreatedAt));
    return ok_(rows);
  }

  if (path === '/api/deposits' && method === 'GET') {
    auth.guard(user, 'deposits', 'read');
    return ok_(services.deposits.listDeposits(db, q));
  }
  if (path === '/api/deposits/return' && method === 'POST') {
    auth.guard(user, 'deposits', 'write');
    return ok_(mutate_((tx) => services.deposits.recordDepositReturn(tx, body, user)));
  }

  if (path === '/api/staff' && method === 'GET') {
    auth.guard(user, 'staff', 'read');
    return ok_(services.staff.listStaff(db));
  }
  if (path === '/api/staff' && method === 'POST') {
    auth.guard(user, 'staff', 'write');
    return ok_(mutate_((tx) => services.staff.saveStaff(tx, body, user)));
  }

  if (path === '/api/users' && method === 'GET') {
    auth.guard(user, 'users', 'read');
    return ok_(services.users.listUsers(db));
  }
  if (path === '/api/users' && method === 'POST') {
    auth.guard(user, 'users', 'write');
    return ok_(mutate_((tx) => services.users.saveUser(tx, body, user)));
  }

  if (path === '/api/activities' && method === 'GET') {
    auth.guard(user, 'activities', 'read');
    return ok_(services.activities.listActivities(db, q, user));
  }
  if (path === '/api/activities' && method === 'POST') {
    auth.guard(user, 'activities', 'write');
    return ok_(mutate_((tx) => services.activities.createActivity(tx, body, user)));
  }
  match = path.match(/^\/api\/activities\/([^/]+)$/);
  if (match && method === 'POST') {
    auth.guard(user, 'activities', 'write');
    return ok_(mutate_((tx) => services.activities.updateActivity(tx, match[1], body, user)));
  }

  if (path === '/api/settings' && method === 'GET') {
    auth.guard(user, 'settings', 'read');
    return ok_(services.masters.listSettings(db));
  }
  if (path === '/api/settings' && method === 'POST') {
    auth.guard(user, 'settings', 'write');
    return ok_(mutate_((tx) => services.masters.saveSettings(tx, body.settings || body, user)));
  }
  if (path === '/api/price-list' && method === 'GET') {
    auth.guard(user, 'master', 'read');
    return ok_(services.masters.listPriceList(db));
  }
  if (path === '/api/price-list' && method === 'POST') {
    auth.guard(user, 'master', 'write');
    return ok_(mutate_((tx) => services.masters.savePrice(tx, body, user)));
  }

  if (path === '/api/reports/financial' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getFinancialReport(db, q));
  }
  if (path === '/api/reports/daily' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getDailyReport(db, q.date || today()));
  }
  if (path === '/api/reports/occupancy' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getOccupancyReport(db, q));
  }
  if (path === '/api/reports/statement' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    if (!q.tenantId) throw new AppError('tenantId wajib diisi.');
    return ok_(services.reports.getTenantStatement(db, q.tenantId, { from: q.from, to: q.to }));
  }
  if (path === '/api/reports/reconcile' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.reconcile(db));
  }
  if (path === '/api/reports/revenue' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getRevenueSummary(db));
  }
  if (path === '/api/audit' && method === 'GET') {
    auth.guard(user, 'audit', 'read');
    return ok_(services.masters.listAudit(db, q));
  }
  if (path === '/api/system/logs' && method === 'GET') {
    auth.guard(user, 'audit', 'read');
    return ok_(services.masters.listSystemLog(db));
  }
  if (path === '/api/system/run-jobs' && method === 'POST') {
    auth.guard(user, 'system', 'run');
    return ok_(mutate_((tx) => services.jobs.runBillingJobs(tx, { user: user.StaffID, asOf: body.asOf || today() })));
  }
  if (path === '/api/system/backup' && method === 'POST') {
    auth.guard(user, 'system', 'run');
    return ok_({ file: services.jobs.backupDatabase() });
  }

  throw new AppError('Endpoint tidak ditemukan.', 404, 'NOT_FOUND');
}

function gasApi(token, method, path, body) {
  try {
    const target = parseApiTarget_(path);
    const payload = body && typeof body === 'object' ? body : {};
    const verb = String(method || 'GET').toUpperCase();
    if (verb === 'GET' && target.path !== '/api/health') {
      const key = apiCacheKey_(token || '', target.path, target.query);
      const cached = readApiCache_(key);
      if (cached) return cached;
      const result = handleApi_(token || '', verb, target.path, target.query, payload);
      if (result && result.ok) writeApiCache_(key, result);
      return result;
    }
    return handleApi_(token || '', verb, target.path, target.query, payload);
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Terjadi kesalahan.',
      code: error.code || 'ERROR',
      status: error.status || 400,
    };
  }
}

const SETUP_HTML = '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Setup Sistem Operasional Kos</title><style>body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:40px}main{max-width:680px;margin:0 auto;background:#1e293b;padding:32px;border-radius:16px}h1{margin-top:0;color:#5eead4}code{background:#0f172a;padding:2px 6px;border-radius:4px}ol{line-height:1.9}</style></head><body><main><h1>Setup diperlukan</h1><p>Google Sheets belum terhubung ke aplikasi ini.</p><ol><li>Buka editor Apps Script.</li><li>Jalankan fungsi <code>setup()</code> satu kali.</li><li>Izinkan akses Spreadsheet, Drive, dan Triggers.</li><li>Deploy ulang sebagai Web App dan buka URL deployment.</li></ol><p>Fungsi <code>setup()</code> membuat spreadsheet baru, seluruh tab, data awal, dan trigger harian.</p></main></body></html>';

const SCRIPT_END = '</' + 'script>';

function bridgeResponseHtml(result, id, origin) {
  const safeResult = JSON.stringify(result).replace(/</g, '\\u003c');
  const safeId = JSON.stringify(String(id || ''));
  const safeOrigin = JSON.stringify(String(origin || '*'));
  return '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>KOS Bridge</title>' +
    '<style>html,body{margin:0;padding:0;background:transparent}</style></head><body>' +
    '<' + 'script>(function(){try{window.top.postMessage({channel:"kos-bridge",type:"response",id:' +
    safeId + ',result:' + safeResult + '},' + safeOrigin + ');}catch(error){}})();' + SCRIPT_END +
    '</body></html>';
}

function setup() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty('SPREADSHEET_ID');
  let spreadsheet;
  if (!id) {
    spreadsheet = SpreadsheetApp.create('Sistem Operasional Kos - Production DB');
    id = spreadsheet.getId();
    properties.setProperty('SPREADSHEET_ID', id);
  } else {
    spreadsheet = SpreadsheetApp.openById(id);
  }

  const db = __require('db').load();
  if (!db.meta.demoPaymentsSeeded) {
    __require('bootstrap').seedDemoOperations(db);
  }
  __require('jobs').installTriggers();

  const webUrl = ScriptApp.getService().getUrl() || '(deploy sebagai Web App untuk mendapatkan URL)';
  return [
    'Setup selesai.',
    `SPREADSHEET_ID: ${id}`,
    `Spreadsheet: ${spreadsheet.getUrl()}`,
    `Web App: ${webUrl}`,
    'Langkah berikutnya: ganti password akun demo, lalu deploy sebagai Web App dengan akses "Anyone".',
  ].join('\n');
}


function setupProduction() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty('SPREADSHEET_ID');
  let spreadsheet;
  if (!id) {
    spreadsheet = SpreadsheetApp.create('Sistem Operasional Kos - Production DB');
    id = spreadsheet.getId();
    properties.setProperty('SPREADSHEET_ID', id);
  } else {
    spreadsheet = SpreadsheetApp.openById(id);
  }

  const db = __require('db').load({ seed: false });
  if (db.users.length > 0) {
    throw new Error('Spreadsheet ini sudah memiliki pengguna. Gunakan spreadsheet baru untuk setup produksi.');
  }
  const email = String(properties.getProperty('OWNER_EMAIL') || '').trim().toLowerCase();
  const password = String(properties.getProperty('OWNER_PASSWORD') || '');
  const name = String(properties.getProperty('OWNER_NAME') || 'Owner').trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('Atur Script Property OWNER_EMAIL dengan alamat email owner yang valid.');
  }
  if (password.length < 8) {
    throw new Error('Atur Script Property OWNER_PASSWORD minimal 8 karakter.');
  }

  const util = __require('util');
  const now = util.nowISO();
  const staffId = util.makeId(db, 'staff', 'STF');
  db.staff.push({
    StaffID: staffId, FullName: name, Position: 'Owner', Phone: '', Email: email,
    StartDate: util.today(), EndDate: '', EmploymentStatus: 'Active', AppRole: 'Owner',
    Notes: 'Akun owner produksi',
  });
  db.users.push({
    UserID: util.makeId(db, 'user', 'USR'), StaffID: staffId, Email: email,
    PasswordHash: __require('password').hashPassword(password), Role: 'Owner',
    IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
  });
  db.settings = [
    ['PropertyName', 'Kos', 'Nama properti yang tampil pada invoice dan kuitansi'],
    ['PropertyAddress', '', 'Alamat properti'],
    ['PropertyPhone', '', 'Nomor telepon properti'],
    ['Currency', 'IDR', 'Mata uang transaksi'],
    ['Timezone', 'Asia/Jakarta', 'Zona waktu operasional'],
    ['InvoicePrefix', 'INV', 'Prefix nomor invoice'],
    ['ReceiptPrefix', 'KWT', 'Prefix nomor kuitansi'],
    ['DefaultDueDays', '5', 'Jatuh tempo invoice dalam hari sejak awal periode'],
    ['BillingAdvanceDays', '0', 'Invoice dibuat berapa hari sebelum periode dimulai'],
    ['ReminderIntervalDays', '7', 'Jeda minimum pengingat tagihan yang sama'],
    ['ProrateMidMonth', 'false', 'Kebijakan prorata untuk check-in/check-out di tengah bulan'],
    ['LateFeeEnabled', 'false', 'Denda keterlambatan hanya aktif jika owner mengaktifkan'],
    ['LateFeePercent', '0', 'Persentase denda keterlambatan (jika diaktifkan)'],
    ['DepositPolicy', 'Deposit dikembalikan setelah inspeksi kamar dan pelunasan tagihan.'],
    ['BillingPolicy', 'Sewa dibebankan penuh per periode bulanan sejak tanggal check-in.'],
    ['PaymentPolicy', 'Kelebihan pembayaran dicatat sebagai kredit penghuni.'],
    ['CompanyFooter', ''],
  ].map(([key, value, description]) => ({
    SettingKey: key, SettingValue: value, Description: description, UpdatedAt: now, UpdatedBy: 'SYSTEM',
  }));
  db.meta.createdAt = now;
  db.meta.demoPaymentsSeeded = true;
  __require('db').save(db);
  properties.deleteProperty('OWNER_PASSWORD');
  __require('jobs').installTriggers();

  const webUrl = ScriptApp.getService().getUrl() || '(deploy sebagai Web App untuk mendapatkan URL)';
  return [
    'Setup produksi selesai.',
    `SPREADSHEET_ID: ${id}`,
    `Spreadsheet: ${spreadsheet.getUrl()}`,
    `Web App: ${webUrl}`,
    `Owner: ${email}`,
    'Password owner telah dihapus dari Script Properties. Deploy ulang sebagai Web App.',
  ].join('\n');
}

function importKosJson(fileId, confirmation) {
  if (String(confirmation || '') !== 'GANTI_DATA') {
    throw new Error("Konfirmasi wajib: importKosJson('<FILE_ID>', 'GANTI_DATA').");
  }
  const id = String(fileId || '').trim();
  if (!id) throw new Error('FILE_ID Google Drive belum diisi.');

  let text;
  try {
    text = DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8');
  } catch (error) {
    throw new Error(`Berkas Drive tidak dapat dibaca: ${error.message}`);
  }
  if (text.length > 5 * 1024 * 1024) throw new Error('Berkas impor melebihi 5 MB.');

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`JSON tidak valid: ${error.message}`);
  }
  if (!payload || payload.format !== 'kos-json-export' || payload.version !== 1 || !payload.db) {
    throw new Error('Format berkas bukan ekspor kos-json-export versi 1.');
  }

  const dbApi = __require('db');
  const target = dbApi.load({ seed: false });
  const collections = Object.keys(target).filter((key) => Array.isArray(target[key]));
  const incoming = payload.db;

  Object.keys(incoming).forEach((key) => {
    if (key !== 'meta' && collections.indexOf(key) < 0) throw new Error(`Koleksi tidak dikenal: ${key}`);
  });
  collections.forEach((key) => {
    if (!Array.isArray(incoming[key])) throw new Error(`Koleksi ${key} tidak ada di berkas impor.`);
  });
  if (!incoming.meta || typeof incoming.meta !== 'object' || !incoming.meta.counters) {
    throw new Error('meta atau meta.counters tidak ada di berkas impor.');
  }
  if (!Array.isArray(incoming.users) || !incoming.users.length) {
    throw new Error('Berkas impor tidak memiliki pengguna.');
  }
  incoming.users.forEach((user) => {
    if (String(user.PasswordHash || '').indexOf('sha256$') !== 0) {
      throw new Error(`PasswordHash ${user.Email || user.UserID || ''} bukan format Apps Script.`);
    }
  });

  const errors = [];
  (incoming.invoices || []).forEach((invoice) => {
    const expected = Number(invoice.TotalAmount || 0) - Number(invoice.AmountPaid || 0);
    const actual = Number(invoice.OutstandingBalance || 0);
    if (!Number.isFinite(expected) || !Number.isFinite(actual) || Math.abs(expected - actual) > 0.01) {
      errors.push(`Invoice ${invoice.InvoiceID} memiliki saldo yang tidak konsisten.`);
    }
  });
  const activeRooms = {};
  const activeTenants = {};
  (incoming.occupancies || []).filter((row) => row.AgreementStatus === 'Active').forEach((row) => {
    if (activeRooms[row.RoomID]) errors.push(`Kamar ${row.RoomID} memiliki lebih dari satu hunian aktif.`);
    else activeRooms[row.RoomID] = row.OccupancyID;
    if (activeTenants[row.TenantID]) errors.push(`Penghuni ${row.TenantID} memiliki lebih dari satu hunian aktif.`);
    else activeTenants[row.TenantID] = row.OccupancyID;
  });
  if (errors.length) throw new Error(`Validasi gagal: ${errors.slice(0, 5).join(' ')}`);

  target.meta = incoming.meta;
  collections.forEach((key) => {
    target[key] = incoming[key];
  });
  dbApi.save(target);

  const check = dbApi.load({ seed: false });
  const summary = [];
  collections.forEach((key) => {
    if (check[key].length !== incoming[key].length) {
      throw new Error(`Jumlah baris ${key} tidak cocok setelah impor.`);
    }
    summary.push(`${key}=${check[key].length}`);
  });

  const message = [
    'Impor selesai dan terverifikasi.',
    `Baris: ${summary.join(', ')}`,
    'Uji login, lalu hapus berkas JSON dari Google Drive.',
  ].join('\n');
  Logger.log(message);
  return message;
}

function health() {
  return { status: 'ok', configured: __require('db').isConfigured(), time: new Date().toISOString() };
}

function dailyJobs() {
  return __require('jobs').dailyJobs();
}

function doGet(event) {
  const params = (event && event.parameter) || {};
  if (params.route || params.api) {
    const result = gasApi(
      params.token || '',
      params.method || 'GET',
      params.route || params.api,
      params
    );
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  if (!__require('db').isConfigured()) {
    return HtmlService.createHtmlOutput(SETUP_HTML).setTitle('Setup Sistem Operasional Kos');
  }
  return HtmlService.createHtmlOutput(FRONTEND_HTML)
    .setTitle('Sistem Operasional Kos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(event) {
  const params = (event && event.parameter) || {};
  let payload = {};
  try {
    if (event && event.postData && event.postData.contents) payload = JSON.parse(event.postData.contents);
  } catch (error) {
    payload = {};
  }
  if ((!payload || !payload.path) && params.payload) {
    try { payload = JSON.parse(params.payload); } catch (error) { payload = {}; }
  }
  const result = gasApi(
    payload.token || params.token || '',
    payload.method || params.method || 'POST',
    payload.path || params.path || '/',
    payload.body || payload.data || {}
  );
  if (params.bridgeResponse === '1') {
    return HtmlService.createHtmlOutput(bridgeResponseHtml(result, params.id, payload.origin || params.origin))
      .setTitle('KOS Bridge')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
