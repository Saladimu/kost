# AGENTS.md

Instructions for AI coding agents working on **Sistem Operasional Kos**.

## Project summary

Boarding house operations system for 21-100 rooms. The UI is a vanilla JavaScript SPA in Bahasa Indonesia. It supports two interchangeable backends:

- **Local development:** Node.js HTTP server with a JSON file database.
- **Production:** Google Apps Script Web App with Google Sheets as the database.

There are no third-party runtime dependencies. Keep it that way unless a strong reason is documented.

## Commands

```bash
npm start
npm test
npm run build:gas
```

- `npm start` runs the local server on port 3000.
- `npm test` runs the end-to-end acceptance suite with a temporary database.
- `npm run build:gas` regenerates `src/code.gs` from `src/gas/*.js`, `src/services/*.js`, and the files in `public/`.

Useful overrides:

```bash
PORT=3005 npm start
DB_PATH=/tmp/kos-test.json npm start
```

Validation before finishing a task:

```bash
node --check <changed-js-file>
npm test
npm run build:gas
```

`npm run build:gas` is mandatory whenever anything under `public/`, `src/gas/`, or `src/services/` changes, because the Apps Script bundle inlines the frontend and those modules.

## Required configuration

### Node.js environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Local HTTP port |
| `HOST` | `0.0.0.0` | Local bind address |
| `DB_PATH` | `data/db.json` | JSON database path |

`data/db.json` and `data/backups/` are ignored by Git. They are local runtime state.

### Apps Script Script Properties

| Property | Required | Purpose |
| --- | --- | --- |
| `SPREADSHEET_ID` | After setup | Target Google Spreadsheet |
| `OWNER_EMAIL` | For `setupProduction()` | Initial owner email |
| `OWNER_PASSWORD` | For `setupProduction()` | Initial owner password, minimum 8 characters |
| `OWNER_NAME` | Optional | Initial owner display name |

`setupProduction()` refuses to run if the spreadsheet already has users and deletes `OWNER_PASSWORD` after success. `setup()` creates demo data and is not for production.

### Frontend backend configuration

`public/js/config.js` controls which backend the SPA uses:

```javascript
window.KOS_CONFIG = {
  gasBridgeUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec'
};
```

Transport priority in `public/js/api.js`:

1. Inside Apps Script (`google.script.run`) use the direct GAS runtime.
2. If `gasBridgeUrl` is set, use the form-POST bridge to the Web App.
3. Otherwise use the same-origin Node API at `/api`.

### Cloudflare Pages

- Project: `kelolakos`
- Production URL: `https://kelolakos.pages.dev/`
- Build command: none
- Build output directory: `public`

A push to `main` triggers a deployment if the Pages project is connected to the repository.

### GitHub Pages

`.github/workflows/pages.yml` deploys `public/` with GitHub Actions. It is optional and currently unused while Cloudflare Pages is the primary host. The workflow fails if Pages is not enabled in repository settings.

## Critical data note

The committed `public/js/config.js` points to the **production** Apps Script deployment. Because the local preview serves the same frontend files, the preview at `http://localhost:3000` or the MonkeyCode preview URL reads and writes the same Google Sheets data as production.

- Treat preview operations as production operations unless a separate staging deployment is configured.
- `data/db.json` is a separate local database, but the SPA bypasses it while `gasBridgeUrl` is filled.
- To isolate staging, create a separate Apps Script deployment and spreadsheet, then point the preview build at that `/exec` URL. Do not change production `config.js` casually.

## Architecture and file map

```text
server.js                 Local HTTP server, static files, scheduler
src/
  api.js                  Node REST router and bootstrap payload
  auth.js                 Node sessions and RBAC matrix
  db.js                   JSON database, cache, write lock
  seed.js                 Initial schema and demo data
  bootstrap.js            Operational demo seeding
  jobs.js                 Billing, overdue, backup jobs
  code.gs                 Generated GAS bundle - never edit manually
  gas/
    db.js                 Google Sheets adapter, TABS and HEADERS
    auth.js               GAS sessions and RBAC matrix
    password.js           GAS password hashing
    jobs.js               GAS scheduled jobs
    router.js             GAS API router, caching, dashboard prefetch
    web.js                doGet/doPost, setup, bridge response
  services/               Business logic by domain
public/
  index.html              SPA shell
  css/styles.css          Responsive theme
  js/config.js            Backend bridge URL
  js/api.js               Transport, token, GET cache, request dedupe
  js/core.js              App metadata, permissions, navigation helpers
  js/app.js               Boot, login, routing, shell
  js/pages/*.js           Page renderers
scripts/build-gas.js      GAS bundler
tests/acceptance.test.js  End-to-end acceptance tests
docs/                     Architecture, rules, operations, deployment
```

## API conventions

- Success response: `{ "ok": true, "data": ... }`
- Failure response: `{ "ok": false, "error": "...", "code": "...", "status": 400 }`
- Login through the GAS bridge also returns a `token`; the SPA stores it in `sessionStorage`.
- `GET /api/public-config` is unauthenticated. It may expose only non-sensitive branding, currently the property name from `PropertyName`. The SPA uses it to render the login screen before authentication.
- Authenticated endpoints require a valid session. RBAC is enforced server-side with `guard(user, module, action)`.
- All endpoints must exist in both `src/api.js` and `src/gas/router.js` unless they are Node-only by design.
- When adding a page that needs several read endpoints, prefer one composite endpoint or a bootstrap prefetch over multiple GAS round trips.

## Business invariants

- Currency is IDR. Dates use `YYYY-MM-DD`. Operational timezone is `Asia/Jakarta`.
- Billing is monthly with partial payments. Invoice generation must be idempotent by occupancy and period start.
- Payments must be idempotent through `IdempotencyKey`.
- Never delete financial records. Use void, cancel, or reversal transactions.
- Recalculate invoice balances server-side. Do not trust client totals.
- Proration is optional and configured by `ProrateMidMonth`.
- Late fees are optional and configured by `LateFeeEnabled` and `LateFeePercent`.
- Deposit balances are liabilities until returned or deducted.
- Keep the audit trail in `auditLog` for state-changing operations.

## Authentication notes

- Node passwords use scrypt.
- Apps Script passwords use salted, iterated SHA-256.
- Hashes are not portable between the two backends. Reset passwords when migrating.
- GAS sessions live in `CacheService` for 6 hours. A cache eviction can log users out early.

## Performance and caching

- GAS caches successful GET responses for 30 seconds, keyed by token, path, and query.
- `src/gas/db.js` bumps `API_CACHE_VERSION` in Script Properties on every save. This invalidates all cached reads.
- Cached responses over 45,000 characters are skipped.
- The frontend caches GET responses for 60 seconds in memory and `sessionStorage`, deduplicates identical in-flight requests, and clears its cache on every non-GET request and on login/logout.
- `bootstrapPayload_` prefetches the current-month `/dashboard-page` response to avoid extra GAS reads after boot or login.
- Do not cache non-GET responses. Do not add write-side effects to GET handlers.
- If you add a new write path that bypasses `DB.save`, you must invalidate the read cache explicitly.

## Google Apps Script deployment

1. Run `npm run build:gas`.
2. Copy `src/code.gs` and `src/appsscript.json` into the Apps Script project.
3. Set the required Script Properties.
4. Run `setupProduction()` once for a real database, or `setup()` for demo data.
5. Deploy as Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Use the `/exec` URL, not `/dev`.
7. Update `public/js/config.js` if the deployment URL changes.

Frontend changes deploy through Cloudflare Pages after a push. Backend changes require manually updating the Apps Script project and creating a new deployment; they are not deployed by Git.

## Testing and quality gates

- Run `npm test` for the Node backend and business flows.
- Rebuild the GAS bundle after frontend or shared-module changes.
- For GAS-specific changes, use a mock harness or verify the affected endpoint against a staging Apps Script deployment.
- Do not claim a deployment works without checking both the page and the API.
- Keep `docs/TEST_RESULTS.md` current when behavior or coverage changes.

## Coding conventions

- CommonJS modules (`require` / `module.exports`), two-space indentation, single quotes.
- Do not add comments unless they explain a non-obvious decision.
- Keep HTTP routing thin; put domain rules in `src/services/*.js`.
- Reuse `AppError`, validation helpers, and `withLock` instead of ad-hoc handling.
- Escape user-controlled HTML through `UI.esc` or existing UI helpers.
- Never expose secrets, tokens, or LLM API keys in code, logs, or responses.
- Do not commit generated local state such as `data/db.json`, backups, or logs.

## Common pitfalls

- Editing `src/code.gs` directly: it is generated and will be overwritten.
- Forgetting to update both Node and GAS routers for a new endpoint.
- Changing the bootstrap payload in one backend only; update `src/api.js` and `src/gas/router.js`.
- Adding a collection without updating `TABS`, `HEADERS`, and `emptyDb_` in `src/gas/db.js`.
- Enabling dashboard prefetch for a user without checking permissions; use `can()`.
- Testing destructive operations on the local preview while it points at production Apps Script.
- Assuming preview data is isolated. It is not, unless staging is configured.

## Documentation

Keep these files accurate when behavior changes:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/BUSINESS_RULES.md`
- `docs/OPERATIONS.md`
- `docs/GOOGLE_SHEETS.md`
- `docs/GITHUB_PAGES.md`
- `docs/TEST_RESULTS.md`
- `docs/manuals/` (one guide per role; keep permissions and procedures aligned with RBAC and UI)
