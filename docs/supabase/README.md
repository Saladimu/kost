# Supabase Postgres

Status: implemented and deployed. The schema, importer, and Postgres
persistence adapter are in use on Render at `https://kelolakos.onrender.com`;
the Google Apps Script backend is unchanged.

Target architecture:

```text
Render web service (SPA + Node API, same origin)
        |
        v
Supabase Postgres (Singapore)

Legacy static frontend:
Cloudflare Pages / GitHub Pages
        |
        v
Apps Script Web App -> Google Sheets
```

The SPA keeps its current contract: `{ ok, data }` on success and
`{ ok, error, code, status }` on failure. The service-role key stays on the
server. The browser must never receive it.

## Files

- `0001_initial.sql` - initial schema, constraints, indexes, balance view,
  `updated_at` triggers, and RLS enablement.
- `MIGRATION.md` - source-to-target mapping, import order, reconciliation,
  cutover, and rollback.
- `STEP_BY_STEP.md` - beginner guide for creating the project, applying the
  schema, running the importer, and verifying the result.
- `scripts/import-supabase.js` - generates `data/supabase-import.sql` from the
  JSON snapshot and validates it before writing.
- `scripts/check-supabase.js` - connection and data checks for a configured
  database (`npm run check:supabase`).
- `src/pg/schema.js` - application collection to table and primary-key mapping.
- `src/pg/store.js` - snapshot loading, row diffing, and transactional writes.
- `src/pg/driver.js` - `pg` pool and SSL configuration.

## Runtime adapter

The domain services in `src/services/*.js` stay synchronous because the same
modules are bundled into the Google Apps Script backend. The Postgres adapter
therefore works as follows:

1. At boot, load every table into one in-memory snapshot with a single
   `jsonb_build_object` query. Record `id_counters.__data_version`.
2. On every API request, compare the cached version with the database. Reload
   the snapshot only when it changed.
3. On a write, open a transaction, take
   `pg_advisory_xact_lock(727274001)`, reload the snapshot, run the existing
   synchronous service logic, then diff rows by primary key.
4. Upsert changed or new rows, delete removed rows, persist `id_counters`, and
   bump `__data_version` in the same transaction.

Consequences:

- Writes from multiple API instances are serialized by the advisory lock.
- The whole dataset (small: 21-100 rooms) is reloaded only when the version
  changes, not on every request.
- External writes made in the SQL Editor do not bump `__data_version`. Use the
  API for all writes, or restart the API after a manual change.
- Re-running the importer bumps `__data_version` so running instances reload.
- `npm run test:pg` exercises the adapter with embedded PGlite over the real
  Postgres wire protocol, including a server restart.

## Decisions captured in the schema

| Decision | Rationale |
| --- | --- |
| Keep existing text IDs and prefixes | Avoids rewriting URLs, audit records, receipts, and UI references in one step. |
| Amounts are `numeric(14,2)` | Exact arithmetic; IDR amounts stay whole in practice. |
| Operational dates are `date`; audit times are `timestamptz` | Matches `Asia/Jakarta` business dates and unambiguous event timing. |
| `id_counters` replaces `meta.counters` | Keeps `makeId` behaviour while moving counters into the database. |
| Actor columns are text, not foreign keys | Scheduled jobs write `SYSTEM`; actor IDs are historical, not cascading relationships. |
| One active occupancy per room and per tenant | Enforced with partial unique indexes. |
| One invoice per occupancy and period start | Enforced with `unique (occupancy_id, period_start)`. |
| Idempotency keys are unique | Payments and ledger transactions cannot be duplicated by retries. |
| `AmountPaid` and `OutstandingBalance` are not stored | They are derived from valid allocations. `src/pg/store.js` recomputes them on load; `v_invoice_balances` exposes the same values for SQL checks. |
| Room `Occupied`/`Reserved` are not stored | Availability is derived from active occupancies and reservations. |
| RLS is enabled without policies | Only the Node API using the service role can read or write. Add policies only if direct client access is introduced. |
| Audit and system logs are append-only by convention | No update/delete path is exposed by the API. |

## Derived fields the API must adapt

These fields exist in the current JSON model but are intentionally not columns:

- `Invoices.AmountPaid` -> recomputed on load from valid allocations; `v_invoice_balances.amount_paid` for SQL
- `Invoices.OutstandingBalance` -> recomputed on load as total minus paid; `v_invoice_balances.outstanding_balance` for SQL
- `Invoices.DaysOverdue` -> computed from `due_date` and the business date
- `Rooms.RoomAvailability` / `IsOccupied` -> computed from active occupancies and reservations
- `Tenants` active occupancy summary -> query or composite endpoint

## Authentication

The first migration keeps the existing application login. Node uses scrypt
hashes, so a JSON-to-Postgres move preserves `users.password_hash`.

Apps Script uses salted, iterated SHA-256. Those hashes are not portable to
Node scrypt. A Google Sheets migration must reset passwords or add a one-time
verification path. Do not import GAS hashes as if they were scrypt hashes.

## Deployment note

`public/js/config.js` uses the Apps Script bridge only on `*.pages.dev` and
`*.github.io`. Every other host uses the same-origin Node API. Production runs
`server.js` on Render with `SUPABASE_DB_URL` set; `render.yaml` defines the
service, build command, health check, and required variables. The live service
is `https://kelolakos.onrender.com`, and `/api/health` reports
`"database":"postgres"`. Serving the SPA from the same Node process keeps
session cookies same-origin and requires no CORS changes.

Cloudflare Pages at `https://kelolakos.pages.dev` is not the Supabase
production frontend. It remains a static Apps Script client backed by Google
Sheets, so its users and data are separate from Render.

Using Cloudflare Pages or a custom static host as the SPA origin with the Node
API on another origin is not supported yet: the session cookie is `SameSite=Lax`, so it is not sent on
cross-site requests. That setup needs an API base URL, CORS, and a Bearer-token
flow before it can replace the Apps Script bridge.

## Not in scope yet

- Moving session storage to Postgres or Supabase Auth.
- Removing the Google Apps Script backend.
- File storage for receipts and attachments.
- Direct browser access to Supabase.
- Database triggers that bump `__data_version` for external writes.
- Replacing the snapshot-diff adapter with per-table SQL queries.
