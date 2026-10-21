# AGENTS.md

Instructions for AI coding agents working on **Sistem Operasional Kos**.

## Project summary

Boarding house operations system for 21-100 rooms. The UI is a vanilla JavaScript SPA in Bahasa Indonesia. It supports three data modes:

- **Local development:** Node.js HTTP server with a JSON file database.
- **Node production:** Node.js HTTP server with Supabase Postgres through a snapshot/diff persistence adapter in `src/pg/`.
- **Legacy production:** Google Apps Script Web App with Google Sheets as the database.

`pg` is the only runtime dependency, required for the Supabase adapter. Do not add more runtime dependencies without a documented strong reason. The Apps Script bundle and `npm test` do not use `pg`.

## Commands

```bash
npm start
npm test
npm run test:pg
npm run build:gas
npm run import:supabase
npm run check:supabase
npm run export:supabase
npm run export:gas
```

- `npm start` runs the local server on port 3000.
- `npm test` runs the JSON export validation and the end-to-end acceptance suite against a temporary JSON database.
- `npm run test:pg` runs the Postgres adapter and HTTP integration tests against embedded PGlite. It requires devDependencies (`npm install`).
- `npm run build:gas` regenerates `src/code.gs` from `src/gas/*.js`, `src/services/*.js`, and the files in `public/`.
- `npm run import:supabase` generates `data/supabase-import.sql` from `data/db.json`. It does not change the running backend.
- `npm run check:supabase` validates the configured database: table counts, cache version, invoice balance, and duplicate active occupancies.
- `npm run export:supabase` writes a logical JSON backup of the Postgres database under `data/backups/`.
- `npm run export:gas` writes `data/gas-import.json`, a validation report, and temporary credentials for importing JSON data into Apps Script/Google Sheets.

Useful overrides:

```bash
PORT=3005 npm start
DB_PATH=/tmp/kos-test.json npm start
SUPABASE_DB_URL=postgresql://... npm start
```

Validation before finishing a task:

```bash
node --check <changed-js-file>
npm test
npm run build:gas
```

Add `npm run test:pg` whenever `src/pg/`, `src/db.js`, `server.js`, `src/bootstrap.js`, `src/jobs.js`, or the schema mapping changes.

`npm run build:gas` is mandatory whenever anything under `public/`, `src/gas/`, or `src/services/` changes, because the Apps Script bundle inlines the frontend and those modules.

## Required configuration

### Node.js environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Local HTTP port |
| `HOST` | `0.0.0.0` | Local bind address |
| `DB_PATH` | `data/db.json` | JSON database path and backup directory base |
| `SUPABASE_DB_URL` | none | Enables Postgres mode when set |
| `DATABASE_URL` | none | Fallback for `SUPABASE_DB_URL` |
| `DB_BACKEND` | auto | Set `postgres` to require the Postgres adapter |
| `PG_SEED_DEMO` | `false` | Seed an empty Postgres database with demo data |
| `PG_ADVISORY_LOCK` | `true` | Cross-instance write lock; keep enabled in production |
| `PGSSLMODE` | `require` for remote hosts | Set `disable` for local Postgres |
| `PG_POOL_MAX` | `5` | Maximum Postgres pool connections |
| `COOKIE_SECURE` | `false` | Set `true` on HTTPS hosts to add `Secure` to the session cookie and enable HSTS |
| `LOGIN_MAX_ATTEMPTS` | `5` | Failed logins per email before a temporary lock |
| `LOGIN_WINDOW_MS` | `900000` | Login failure window and lock duration in milliseconds |

`data/db.json`, `data/backups/`, `data/supabase-import.sql`, and the import report are ignored by Git. They are local runtime state.

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

### Render (production Node + Supabase)

Production URL: `https://kelolakos.onrender.com`. `render.yaml` defines a
Singapore web service that builds with `npm ci --omit=dev` and runs `npm start`.
Set `SUPABASE_DB_URL` in the Render dashboard; it is not stored in Git.
`COOKIE_SECURE=true` requires HTTPS. `/api/health` must report
`"database":"postgres"`.

The first production deploy failed with `getaddrinfo ENOTFOUND base` because
`SUPABASE_DB_URL` was not a complete URI. Use the full session-pooler URI
(`postgresql://...@...pooler.supabase.com:5432/postgres`), never only the
database name or the direct IPv6-only host.

The free plan sleeps after inactivity, which also pauses the daily scheduler.
Use the Starter plan for an always-on production service. Render's filesystem is
ephemeral, so `data/backups/` must be copied off-host or replaced by Supabase
backups/PITR.

### Cloudflare Pages (legacy static frontend)

- Project: `kelolakos`
- Production URL: `https://kelolakos.pages.dev/`
- Build command: none
- Build output directory: `public`

Pages serves only static files and uses the Apps Script bridge. A push to
`main` triggers a deployment if the Pages project is connected to the repository.

### GitHub Pages

`.github/workflows/pages.yml` deploys `public/` with GitHub Actions. It is optional and currently unused while Cloudflare Pages is the primary host. The workflow fails if Pages is not enabled in repository settings.

## Critical data note

`public/js/config.js` selects the backend by hostname:

- `localhost`, `127.0.0.1`, `::1`, and `*.monkeycode-ai.live` use the same-origin Node API. Without a database URL that is `data/db.json`; with `SUPABASE_DB_URL` it is Postgres.
- Any other host uses the same-origin Node API, including Render and a custom domain pointed at Render.
- Only `*.pages.dev` and `*.github.io` use the **production** Apps Script bridge, because those hosts cannot run Node.

Production is the Render Node service backed by Supabase. Cloudflare Pages and
GitHub Pages remain static Apps Script clients. If a custom domain is attached to
Cloudflare Pages, add it to `staticHost` in `public/js/config.js`; otherwise it
will try the same-origin Node API.

- Treat public deployments as production operations.
- Do not point a local test host at the production Supabase database without a separate staging project.
- Production changes to the Apps Script backend still require manual redeployment.

## Architecture and file map

```text
server.js                 Local HTTP server, static files, scheduler
src/
  api.js                  Node REST router and bootstrap payload
  auth.js                 Node sessions and RBAC matrix
  db.js                   Backend selector: JSON or Postgres, cache, write lock
  pg/
    schema.js             App collection to table/PK mapping
    store.js              Snapshot load, row diff, transactional writes
    driver.js             pg Pool and SSL configuration
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
scripts/export-gas.js     JSON to Apps Script/Sheets exporter
scripts/import-supabase.js Supabase SQL importer
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

- Run `npm test` for the Node JSON backend and business flows.
- Run `npm run test:pg` for the Postgres adapter, wire protocol, login, and restart persistence.
- Rebuild the GAS bundle after frontend or shared-module changes.
- Do not change `src/services/*.js` to async or SQL: they are shared with the synchronous GAS bundle. Postgres persistence lives in `src/pg/`.
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
- Assuming public deployments are isolated from production Apps Script data.
- Pointing a local host at production without understanding the hostname switch in `public/js/config.js`.
- Writing to Supabase outside the API (SQL Editor, dashboard, psql). The adapter only detects changes through `id_counters.__data_version`; external writes are invisible until the API restarts.
- Calling `DB.save()` in Postgres mode. Use `withLock()`; the adapter reloads, diffs, and commits rows.
- Changing the Postgres schema without updating `src/pg/schema.js` and the importer column lists.
- Assuming `npm test` exercises Postgres. It does not; use `npm run test:pg`.

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
- `docs/supabase/README.md`, `docs/supabase/MIGRATION.md`, and `docs/supabase/STEP_BY_STEP.md` (Postgres architecture, deployment status, and migration runbook; keep the schema, importer, and cutover plan in sync if the data model changes)
