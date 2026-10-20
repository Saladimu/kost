# Migration plan: JSON / Google Sheets to Supabase Postgres

Status: completed for the current dataset (imported from `data/db.json`) and
deployed on Render at `https://kelolakos.onrender.com`. The schema, importer, and persistence adapter
are live against Supabase Postgres. Keep this document as the runbook and
validation checklist for future imports.

## 1. Source inventory

There are two possible sources:

1. Local Node database: `data/db.json`, produced by `src/seed.js` and
   `src/bootstrap.js`.
2. Google Sheets production database: tabs defined in `src/gas/db.js`.

Both use the same logical collections:

`meta`, `settings`, `roomTypes`, `rooms`, `tenants`, `priceList`, `services`,
`staff`, `users`, `reservations`, `occupancies`, `invoices`, `payments`,
`allocations`, `credits`, `serviceOrders`, `expenses`, `activities`,
`transactions`, `deposits`, `auditLog`, `systemLog`.

Before exporting production data, stop scheduled billing and all writes. The
Apps Script cache can still return a recent read after a write, so do not
export while users are active.

## 2. Table mapping

| Source collection | Target table | Notes |
| --- | --- | --- |
| `meta.counters` | `id_counters` | One row per counter key. Values are the last used number, matching `nextCounter`. |
| `settings` | `settings` | Array of `{ SettingKey, SettingValue, Description, UpdatedAt, UpdatedBy }`. |
| `roomTypes` | `room_types` | `IsActive` string to boolean. |
| `rooms` | `rooms` | `Occupied` and `Reserved` become `Available`; availability is derived. |
| `tenants` | `tenants` | `RegistrationDate` to `date`. |
| `priceList` | `price_list` | Empty `RoomTypeID` becomes `NULL`. |
| `services` | `services` | `IsAvailable`/`IsActive` to boolean. |
| `staff` | `staff` | Empty `StartDate`/`EndDate` become `NULL`. |
| `users` | `users` | Keep Node scrypt hashes only. See section 4. |
| `reservations` | `reservations` | Status `Expired` is valid. |
| `occupancies` | `occupancies` | `PreviousOccupancyID` may be self-referencing. |
| `invoices` | `invoices` | Drop stored `AmountPaid`, `OutstandingBalance`, and `DaysOverdue`. |
| `payments` | `payments` | `ReceiptNumber` and `IdempotencyKey` must be unique. |
| `allocations` | `payment_allocations` | `Valid` / `Voided`. |
| `credits` | `credits` | `Available` / `Used` / `Voided`. |
| `serviceOrders` | `service_orders` | `InvoiceID`/`PaymentID` may be empty; map to `NULL`. |
| `expenses` | `expenses` | Keep `RequestedBy`, `ApprovedBy`, `ReceiptURL`. |
| `activities` | `activities` | Empty `StartedAt`, `CompletedAt`, `VerifiedBy` become `NULL`. |
| `transactions` | `transactions` | `RelatedTransactionID` is self-referencing. |
| `deposits` | `deposits` | `ReturnTransactionID` may be empty; map to `NULL`. |
| `auditLog` | `audit_log` | JSON strings become `jsonb`. |
| `systemLog` | `system_log` | GAS tab is `SystemLog`. |

## 3. Field transformations

Apply these rules to every row before inserting:

- Convert camel-case keys to snake_case column names.
- Convert `''` to `NULL` only for nullable columns: dates, timestamps,
  foreign keys, and optional actor fields. Never turn required text into
  `NULL`.
- Convert `'TRUE'` and `'FALSE'` (case-insensitive) to `true` and `false`.
- Convert numeric strings to numbers, then to `numeric` or integer columns.
- Convert `YYYY-MM-DD` values to `date`; convert ISO timestamps to
  `timestamptz`. Do not pass `''` to `new Date(...)`.
- Trim statuses and map display values to the canonical enum values used in
  `0001_initial.sql`.
- Normalize `rooms.OperationalStatus`:
  - `Occupied` -> `Available`
  - `Reserved` -> `Available`
  - `Maintenance`, `Inactive`, `Available` stay unchanged
- Recompute `invoices.total_amount` as
  `rental_amount + service_charges + other_charges - discount_amount`.
  Reject the row if the source total differs by more than 0.005.
- Do not import `invoices.amount_paid`, `invoices.outstanding_balance`, or
  `invoices.days_overdue`. They are replaced by `v_invoice_balances` and
  runtime calculation.
- If a transaction has no `IdempotencyKey`, generate
  `LEGACY:<TransactionID>`. Verify the generated key is unique before insert.
- If a payment has no `IdempotencyKey`, stop the import. Payment idempotency
  must be resolved manually rather than invented.
- Empty actor fields (`CreatedBy`, `ReceivedBy`, `RequestedBy`,
  `ProcessedBy`) become `SYSTEM` where the target column is `not null`.
- For deposits, recompute
  `outstanding_deposit_liability = deposit_amount - amount_returned - amount_deducted`
  when the source value is missing. Reject negative results.
- For `audit_log.previous_value` and `audit_log.new_value`, parse valid JSON.
  If parsing fails, store the original text with `to_jsonb(value)` so the
  audit trail is not lost.
- `id_counters`: import every `meta.counters` key as `counter_key` and its
  value as `last_value`. For monthly invoice and receipt keys that are
  missing, derive them from the highest existing number for that month.

## 3.1 Preflight checks

These checks run on the exported snapshot before any insert. If one fails,
stop and resolve the source data. Do not rely on the database constraints to
find the problem after half the data has been imported.

- Duplicate active occupancies per room.
- Duplicate active occupancies per tenant.
- Duplicate `(OccupancyID, PeriodStart)` invoices.
- Duplicate invoice numbers, receipt numbers, and service order numbers.
- Payments and allocations where the allocated total exceeds the payment.
- Invoices whose stored total differs from the computed total.
- Rows whose required parent is missing (tenant, room, occupancy, invoice,
  payment, service, or staff).
- Transactions and payments with missing or duplicate idempotency keys.
- Negative amounts, negative deposit liabilities, or unsupported statuses.

Produce a CSV or JSON report keyed by source ID so each row can be corrected
in the old system before the cutover window.

## 4. Password handling

Local JSON to Postgres:

- `users.password_hash` is produced by Node scrypt and remains valid.
- Verify one owner login before cutover.

Google Sheets to Postgres:

- GAS hashes use salted, iterated SHA-256 and are not compatible with Node
  scrypt.
- Reset passwords through an owner-assisted flow, or add a temporary
  verification path that upgrades the hash on first successful login.
- Do not import a GAS hash into `users.password_hash` without an upgrade
  mechanism.

## 5. Import order

Use one database transaction and stop on the first error. Self-referencing
foreign keys are deferrable, but normal foreign keys still require parent rows
to exist.

1. `id_counters`
2. `settings`
3. `staff`
4. `users`
5. `room_types`
6. `rooms`
7. `tenants`
8. `price_list`
9. `services`
10. `transactions`
11. `reservations`
12. `occupancies`
13. `deposits`
14. `invoices`
15. `payments`
16. `payment_allocations`
17. `credits`
18. `service_orders`
19. `expenses`
20. `activities`
21. `audit_log`
22. `system_log`

Inside the transaction, run:

```sql
set constraints all deferred;
```

This is required for `transactions.related_transaction_id`,
`occupancies.previous_occupancy_id`, and any other deferrable self-reference.

## 6. Import script

`scripts/import-supabase.js` converts the JSON snapshot into one transactional
SQL file. It has no runtime dependencies, so the server dependency list does
not change.

```bash
# Generate data/supabase-import.sql and data/supabase-import-report.json
npm run import:supabase

# Read a different snapshot
node scripts/import-supabase.js --input /path/to/db.json

# Recompute totals when the source total is inconsistent
node scripts/import-supabase.js --repair-totals
```

The script:

- validates required fields, enums, dates, foreign keys, duplicates, and
  financial invariants before writing SQL
- maps empty strings to `NULL` for nullable columns
- skips stored invoice balances that are derived by `v_invoice_balances`
- derives missing ID counters from existing IDs and invoice/receipt numbers
- wraps the import in `begin; ... commit;` with
  `set constraints all deferred;`
- uses `on conflict (primary_key) do nothing`, so a rerun is safe and does not
  update existing rows

Open the generated file in Supabase SQL Editor and run it. The optional
`--execute` flag uses `psql` and `SUPABASE_DB_URL` for operators who have
`psql` installed; the password is passed through `PGPASSWORD`, not written to
the SQL file or printed.

Do not log or commit `SUPABASE_DB_URL`, database passwords, password hashes,
tokens, or full rows containing personal data.

## 7. Reconciliation

Run these checks before switching the application. Any non-zero result blocks
cutover.

```sql
-- Row counts must match the exported snapshot.
select 'settings' as table_name, count(*) from settings
union all select 'staff', count(*) from staff
union all select 'users', count(*) from users
union all select 'room_types', count(*) from room_types
union all select 'rooms', count(*) from rooms
union all select 'tenants', count(*) from tenants
union all select 'price_list', count(*) from price_list
union all select 'services', count(*) from services
union all select 'transactions', count(*) from transactions
union all select 'reservations', count(*) from reservations
union all select 'occupancies', count(*) from occupancies
union all select 'deposits', count(*) from deposits
union all select 'invoices', count(*) from invoices
union all select 'payments', count(*) from payments
union all select 'payment_allocations', count(*) from payment_allocations
union all select 'credits', count(*) from credits
union all select 'service_orders', count(*) from service_orders
union all select 'expenses', count(*) from expenses
union all select 'activities', count(*) from activities;

-- Financial totals.
select sum(total_amount) from invoices;
select sum(amount_received) from payments where payment_status <> 'Voided';
select sum(allocated_amount) from payment_allocations where allocation_status = 'Valid';
select sum(remaining_amount) from credits where status = 'Available';
select sum(outstanding_deposit_liability) from deposits where deposit_status in ('Held', 'Partially Returned');

-- Active occupancy uniqueness.
select room_id from occupancies where agreement_status = 'Active'
group by room_id having count(*) > 1;
select tenant_id from occupancies where agreement_status = 'Active'
group by tenant_id having count(*) > 1;

-- Invoice idempotency.
select occupancy_id, period_start from invoices
group by occupancy_id, period_start having count(*) > 1;

-- Invoice arithmetic and over-allocation.
select invoice_id from invoices
where total_amount <> rental_amount + service_charges + other_charges - discount_amount;
select invoice_id from v_invoice_balances
where amount_paid > total_amount + 0.005;

-- Payment allocation and credit totals must not exceed the payment.
select p.payment_id
from payments p
left join payment_allocations a
  on a.payment_id = p.payment_id and a.allocation_status = 'Valid'
left join credits c
  on c.payment_id = p.payment_id and c.status <> 'Voided'
group by p.payment_id, p.amount_received
having coalesce(sum(a.allocated_amount), 0) + coalesce(sum(c.amount), 0) > p.amount_received + 0.005;

-- Deposit liability arithmetic.
select deposit_record_id from deposits
where amount_returned + amount_deducted + outstanding_deposit_liability <> deposit_amount;
```

Also compare per-tenant balances and a few known invoices and receipts against
the old system. Numbers must match exactly to the Rupiah.

## 8. Staging rehearsal

1. Create a disposable Supabase project in the Singapore region.
2. Apply `0001_initial.sql` with the Supabase CLI or SQL editor.
3. Export a production snapshot and import it into staging.
4. Run all reconciliation queries.
5. Run `npm test` against the local Node server pointed at staging.
6. Log in as each role and smoke-test the dashboard, tenants, rooms,
   invoices, payments, deposits, service orders, expenses, activities, and
   reports.
7. Record the rehearsal duration and every manual correction.

## 9. Cutover

1. Announce a maintenance window. Billing is monthly, so avoid month-end and
   the first day of the month.
2. Stop the Node server. This stops `startScheduler` and all writes.
3. Export the final snapshot. Record a checksum.
4. Create a Supabase backup or confirm point-in-time recovery is enabled.
5. Run the import transaction.
6. Run reconciliation and smoke tests.

   ```bash
   npm install
   SUPABASE_DB_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres" npm run check:supabase
   ```

7. Set `SUPABASE_DB_URL` on the API host and start the Postgres-backed API.

   ```bash
   SUPABASE_DB_URL="postgresql://..." npm start
   ```

   Confirm `GET /api/health` returns `"database": "postgres"`, then log in and
   open Dashboard, Rooms, Invoices, and Payments.

8. Keep the old JSON/Sheets database read-only for the rollback window.
9. Re-enable the scheduler only after the smoke tests pass.

The Node API keeps the same routes and response shape. The SPA does not need a
new backend URL. Domain services remain synchronous; `src/pg/store.js` loads a
snapshot, applies the same logic, and commits row diffs under an advisory lock.

The frontend does not need a new backend URL if the API keeps its current
routes and response shape.

## 10. Rollback

If reconciliation or smoke tests fail:

1. Stop the new API.
2. Keep the failed Supabase database for inspection. Do not edit it in place
   while diagnosing.
3. Restore the previous API deployment and its JSON/Sheets data source.
4. Re-enable writes and the scheduler only after the old system is healthy.

Do not delete the old database, exports, or backups until the new system has
run through at least one full billing cycle and one deposit return or check-out.

## 11. Post-cutover checks

- `id_counters.__data_version` exists and increases after each write.
- First scheduled invoice run creates no duplicates.
- A repeated payment request with the same idempotency key returns the original
  payment.
- A voided payment reverses allocations, credits, and the ledger transaction.
- Check-out returns or deducts the deposit and leaves the liability at zero.
- One active occupancy remains enforced per room and tenant.
- Audit and system logs are written for every state-changing operation.
- Nightly backup or point-in-time recovery is verified, not just enabled.
