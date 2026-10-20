# Supabase step-by-step for first-time users

This guide takes you from zero to a populated Supabase database and then
connects the Node API to it. Until you set `SUPABASE_DB_URL`, the API keeps
using `data/db.json`.

Use the demo/local database for your first attempt. Do not start with
production data until the whole flow works once.

## 0. Checklist

- Node.js 18 or newer.
- A local `data/db.json` file. Running `npm start` once creates it if missing.
- A Supabase account: <https://supabase.com/dashboard>.
- About 20 minutes.
- A password manager or another safe place for the database password.

## 1. Create the Supabase project

1. Open <https://supabase.com/dashboard> and sign in.
2. Click **New project**.
3. Choose your organization, or accept the default.
4. Project name: `kelolakos`.
5. Database password: click **Generate a password** and save it immediately.
6. Region: **Southeast Asia (Singapore)** if it is available.
7. Plan: **Free** is enough for the first import.
8. Click **Create new project** and wait until provisioning finishes.

Do not use the `service_role` key for this import. The SQL Editor runs as the
database owner, which is what the schema expects.

## 2. Apply the schema

1. In the Supabase dashboard, open **SQL Editor** from the left sidebar.
2. Click **New query**.
3. Open `docs/supabase/0001_initial.sql` on your computer.
4. Copy the entire file and paste it into the SQL Editor.
5. Click **Run**, or press Ctrl+Enter on Windows/Linux or Cmd+Enter on macOS.
6. You should see **Success. No rows returned**.

If you see `relation "settings" already exists`, the schema was already applied
to this project. Stop and use a fresh project unless you know exactly what is
already there.

Optional check: open **Table Editor**. You should see tables such as `rooms`,
`tenants`, `invoices`, `payments`, and `audit_log`.

## 3. Generate the import SQL

From the project folder:

```bash
npm run import:supabase
```

This reads `data/db.json` and writes:

- `data/supabase-import.sql` - the file you will run in Supabase.
- `data/supabase-import-report.json` - validation results and row counts.

To use a different snapshot:

```bash
node scripts/import-supabase.js --input /path/to/db.json
```

Open `data/supabase-import-report.json`. Before continuing, `errors` must be an
empty array. If it is not empty, fix the reported source rows. Do not ignore
validation errors.

The generated SQL contains personal data and password hashes. It is ignored by
Git. Do not commit it or send it through chat.

## 4. Import the data

1. In Supabase, open **SQL Editor** and click **New query**.
2. Open `data/supabase-import.sql` in a text editor.
3. Copy the entire file and paste it into the SQL Editor.
4. Click **Run**.
5. You should see **Success. No rows returned**.

The file starts with `begin;` and ends with `commit;`. If any row fails, the
whole import rolls back. You can fix the problem and run it again. Existing
primary keys are skipped, so a repeated run does not duplicate data.

If the SQL Editor refuses a large file, use `psql` instead. Use the **direct
connection** or **session pooler** connection string, not the transaction
pooler, because the import uses one transaction.

```bash
export SUPABASE_DB_URL='postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres'
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f data/supabase-import.sql
```

With `psql` installed, the importer can also run it directly:

```bash
export SUPABASE_DB_URL='postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres'
npm run import:supabase -- --execute
```

The password is passed to `psql` through `PGPASSWORD`. It is not written to the
SQL file and is not printed by the script.

## 5. Verify the import

Run this in the SQL Editor:

```sql
select 'settings' as tabel, count(*) as jumlah from settings
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
union all select 'activities', count(*) from activities
union all select 'audit_log', count(*) from audit_log
union all select 'system_log', count(*) from system_log
order by tabel;
```

For the current demo database, the expected counts are:

| Table | Rows |
| --- | ---: |
| settings | 17 |
| staff | 5 |
| users | 5 |
| room_types | 4 |
| rooms | 21 |
| tenants | 6 |
| price_list | 8 |
| services | 5 |
| transactions | 9 |
| reservations | 1 |
| occupancies | 3 |
| deposits | 3 |
| invoices | 7 |
| payments | 5 |
| payment_allocations | 4 |
| credits | 0 |
| service_orders | 2 |
| expenses | 2 |
| activities | 3 |
| audit_log | 22 |
| system_log | 0 |

Your numbers can differ if the demo data changed. Compare them with
`data/supabase-import-report.json`, not with this table alone.

Check the derived invoice balances:

```sql
select invoice_id, total_amount, amount_paid, outstanding_balance
from v_invoice_balances
order by invoice_id;
```

For the current demo data, `INV-0001` should show a total of `1530000.00`, paid
`900000.00`, and outstanding `630000.00`.

Check that active occupancy is still unique per room:

```sql
select room_id, count(*)
from occupancies
where agreement_status = 'Active'
group by room_id
having count(*) > 1;
```

The result must be empty.

## 6. Connect the application

The Node API can now use this database. Keep `npm start` unchanged for JSON
mode; set `SUPABASE_DB_URL` to switch to Postgres.

1. Install the driver on the machine that runs the API:

   ```bash
   npm install
   ```

2. Export the Postgres connection string. Use the direct connection or the
   session pooler on port 5432. Do not use the anon key or the transaction
   pooler on port 6543.

   ```bash
   export SUPABASE_DB_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres"
   ```

3. Check the connection and data:

   ```bash
   npm run check:supabase
   ```

4. Start the API and open the app from the same host:

   ```bash
   npm start
   ```

5. Open `http://localhost:3000/api/health`. It must report
   `"database": "postgres"`. Then log in and open Dashboard, Rooms, Invoices,
   and Payments.

After this, writes from the app are stored in Supabase. Keep these rules:

- Make changes through the app, not the SQL Editor. Manual changes do not
  bump `id_counters.__data_version` and are invisible until the API restarts.
- Serve the SPA from the same Node process. The session cookie does not work
  across origins. Cloudflare Pages remains on the Apps Script bridge and is
  not the Supabase production frontend.
- The Apps Script backend still uses Google Sheets and is not affected.

### 6.1 Deploy to Render

Production is live at `https://kelolakos.onrender.com` with Supabase Postgres.
`render.yaml` defines the Singapore web service, the build and start commands,
the `/api/health` check, and the required environment variables.

1. In Render, create a **Blueprint** from this repository.
2. Enter `SUPABASE_DB_URL` using the session-pooler URI. Do not use the anon
   key, the transaction pooler on port 6543, or only the database name.
3. Keep the other variables from `render.yaml`, including
   `DB_BACKEND=postgres`, `PGSSLMODE=require`, and `COOKIE_SECURE=true`.
4. After deploy, open `https://<service>.onrender.com/api/health` and confirm
   `"database":"postgres"`.
5. Log in as Owner and change every demo password before sharing the URL.

`https://kelolakos.pages.dev` stays on Apps Script and Google Sheets. Do not
expect accounts or data from Render to appear there.

## 7. Common problems

### `extension "pgcrypto" is not available`

You are using an older copy of `0001_initial.sql`. The current schema does not
need `pgcrypto`.

### `syntax error at or near "all"`

You are using an older generated SQL file that contains
`set local constraints all deferred`. Regenerate it:

```bash
npm run import:supabase
```

The correct statement is `set constraints all deferred;`.

### `duplicate key value violates unique constraint`

The generated file normally skips existing primary keys. If this appears, the
conflict is probably on a secondary unique key such as email, room number,
invoice number, or idempotency key. Run the validation report and compare the
source rows. Do not delete rows to make the error disappear.

### `insert or update on table ... violates foreign key constraint`

A parent row is missing. The importer usually catches this before writing SQL.
Check `data/supabase-import-report.json` and fix the source data.

### `psql: command not found`

Use the Supabase SQL Editor instead. It needs no local installation.

### `password authentication failed`

Use the database password from project creation, not your Supabase account
password. If it is lost, reset it in **Project Settings > Database**.

### `SUPABASE_DB_URL belum diisi`

The app is in JSON mode. Export the connection string in the same shell that
runs `npm start`, then check `GET /api/health`.

### `Tabel Supabase belum lengkap`

Apply `0001_initial.sql` to this project before starting the API.

### `Database Supabase kosong`

Import the data (step 4) or set `PG_SEED_DEMO=true` only for a new demo
database. Never enable demo seeding on production data.

### `Cannot find module 'pg'`

Run `npm install` on the API host. The JSON mode and the Apps Script bundle do
not need `pg`, but the Postgres adapter does.

### `getaddrinfo ENOTFOUND` or connection timeout

The direct host may resolve to IPv6 only on some networks. Use the session
pooler connection string from **Project Settings > Database** (port 5432)
instead. Keep the same `SUPABASE_DB_URL` variable.

If the error is `getaddrinfo ENOTFOUND base`, the value is not a complete URI.
It may contain only the database name. Replace it with the full
`postgresql://...` session-pooler connection string in Render's **Environment**
tab, save, and run **Manual Deploy**.

### The SQL Editor seems stuck

The demo file is about 64 KB. A full production import can be much larger. Use
`psql` for production-sized imports.

## 8. Security rules

- Never put `SUPABASE_DB_URL`, the database password, or the `service_role` key
  in frontend code, screenshots, logs, or Git.
- The browser must only talk to the Node API. The service-role key belongs on
  the server.
- `data/supabase-import.sql` contains password hashes and personal data. It is
  ignored by Git; keep it that way.
- RLS is enabled on every table. The current design expects the Node API to use
  the database owner or service role. Do not add public RLS policies without a
  separate security review.

## 9. If you want to start over

Use a new Supabase project. Dropping and recreating tables in place is easier
to get wrong, especially once real data exists. For a disposable project only,
you can delete the project from **Project Settings > General** and create a new
one.
