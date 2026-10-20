-- Sistem Operasional Kos - Supabase/Postgres schema.
-- Target: PostgreSQL 15+ (Supabase).
-- Assumption: primary keys remain text IDs with the existing prefixes.
-- This schema is applied in production and is the source for new Supabase projects.

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table settings (
  setting_key text primary key,
  setting_value text not null default '',
  description text not null default '',
  updated_at timestamptz not null default now(),
  updated_by text not null default 'SYSTEM'
);

create table id_counters (
  counter_key text primary key,
  last_value bigint not null default 0 check (last_value >= 0)
);

create table staff (
  staff_id text primary key,
  full_name text not null,
  position text not null default '',
  phone text not null default '',
  email text not null default '',
  start_date date,
  end_date date,
  employment_status text not null default 'Active'
    check (employment_status in ('Active', 'Inactive', 'Resigned')),
  app_role text not null
    check (app_role in ('Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table users (
  user_id text primary key,
  staff_id text not null unique references staff(staff_id) on delete restrict,
  email text not null,
  password_hash text not null,
  role text not null
    check (role in ('Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index users_email_lower_uidx on users (lower(email));

create table room_types (
  room_type_id text primary key,
  type_name text not null,
  description text not null default '',
  default_capacity integer not null default 1 check (default_capacity > 0),
  default_monthly_price numeric(14, 2) not null default 0 check (default_monthly_price >= 0),
  facilities text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rooms (
  room_id text primary key,
  room_number text not null unique,
  building text not null default '',
  floor text not null default '',
  room_type_id text not null references room_types(room_type_id) on delete restrict,
  capacity integer not null default 1 check (capacity > 0),
  facilities text not null default '',
  standard_monthly_price numeric(14, 2) not null default 0 check (standard_monthly_price >= 0),
  operational_status text not null default 'Available'
    check (operational_status in ('Available', 'Maintenance', 'Inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tenants (
  tenant_id text primary key,
  full_name text not null,
  identity_type text not null default 'KTP',
  identity_number text not null default '',
  phone text not null,
  email text not null default '',
  address text not null default '',
  emergency_contact text not null default '',
  emergency_phone text not null default '',
  occupation text not null default '',
  registration_date date not null default current_date,
  tenant_status text not null default 'Prospective'
    check (tenant_status in ('Prospective', 'Active', 'Checked Out', 'Inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tenants_identity_number_uidx
  on tenants (identity_number)
  where identity_number <> '';

create table price_list (
  price_id text primary key,
  item_code text not null,
  item_name text not null,
  item_category text not null,
  room_type_id text references room_types(room_type_id) on delete restrict,
  billing_unit text not null default 'bulan',
  standard_price numeric(14, 2) not null default 0 check (standard_price >= 0),
  effective_from date not null default current_date,
  effective_to date,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_code, effective_from),
  check (effective_to is null or effective_to >= effective_from)
);

create table services (
  service_id text primary key,
  service_code text not null unique,
  service_name text not null,
  category text not null,
  unit text not null,
  standard_price numeric(14, 2) not null default 0 check (standard_price >= 0),
  cost_price numeric(14, 2) not null default 0 check (cost_price >= 0),
  is_available boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table transactions (
  transaction_id text primary key,
  transaction_date date not null,
  transaction_type text not null,
  direction text not null check (direction in ('IN', 'OUT')),
  category text not null default '',
  reference_type text not null default '',
  reference_id text not null default '',
  tenant_id text references tenants(tenant_id) on delete restrict,
  room_id text references rooms(room_id) on delete restrict,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  payment_method text not null default '',
  payment_status text not null default 'Confirmed'
    check (payment_status in ('Pending', 'Confirmed', 'Voided')),
  staff_id text,
  related_transaction_id text,
  idempotency_key text not null unique,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint transactions_related_fk foreign key (related_transaction_id)
    references transactions(transaction_id) deferrable initially deferred
);

create table reservations (
  reservation_id text primary key,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  room_id text not null references rooms(room_id) on delete restrict,
  reservation_date date not null default current_date,
  planned_check_in date not null,
  planned_check_out date,
  agreed_monthly_price numeric(14, 2) not null default 0 check (agreed_monthly_price >= 0),
  deposit_amount numeric(14, 2) not null default 0 check (deposit_amount >= 0),
  reservation_status text not null default 'Pending'
    check (reservation_status in ('Pending', 'Confirmed', 'Cancelled', 'Converted', 'Expired')),
  created_by text not null default 'SYSTEM',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (planned_check_out is null or planned_check_out >= planned_check_in)
);

create table occupancies (
  occupancy_id text primary key,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  room_id text not null references rooms(room_id) on delete restrict,
  check_in_date date not null,
  planned_check_out date,
  actual_check_out date,
  rental_plan text not null default 'Monthly',
  agreed_monthly_price numeric(14, 2) not null default 0 check (agreed_monthly_price >= 0),
  billing_day integer check (billing_day between 1 and 31),
  due_day integer check (due_day between 1 and 31),
  deposit_amount numeric(14, 2) not null default 0 check (deposit_amount >= 0),
  agreement_status text not null default 'Active'
    check (agreement_status in ('Active', 'Ended', 'Transferred', 'Renewed')),
  previous_occupancy_id text,
  created_by text not null default 'SYSTEM',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (planned_check_out is null or planned_check_out >= check_in_date),
  check (actual_check_out is null or actual_check_out >= check_in_date),
  constraint occupancies_previous_fk foreign key (previous_occupancy_id)
    references occupancies(occupancy_id) deferrable initially deferred
);

create unique index occupancies_one_active_per_room
  on occupancies (room_id)
  where agreement_status = 'Active';

create unique index occupancies_one_active_per_tenant
  on occupancies (tenant_id)
  where agreement_status = 'Active';

create table deposits (
  deposit_record_id text primary key,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  occupancy_id text not null references occupancies(occupancy_id) on delete restrict,
  deposit_type text not null default 'Security Deposit',
  deposit_amount numeric(14, 2) not null default 0 check (deposit_amount >= 0),
  amount_returned numeric(14, 2) not null default 0 check (amount_returned >= 0),
  amount_deducted numeric(14, 2) not null default 0 check (amount_deducted >= 0),
  outstanding_deposit_liability numeric(14, 2) not null default 0 check (outstanding_deposit_liability >= 0),
  receipt_transaction_id text references transactions(transaction_id) on delete restrict,
  return_transaction_id text references transactions(transaction_id) on delete restrict,
  deposit_status text not null default 'Held'
    check (deposit_status in ('Held', 'Partially Returned', 'Returned', 'Voided')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_returned + amount_deducted + outstanding_deposit_liability = deposit_amount)
);

create table invoices (
  invoice_id text primary key,
  invoice_number text not null unique,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  occupancy_id text not null references occupancies(occupancy_id) on delete restrict,
  room_id text not null references rooms(room_id) on delete restrict,
  period_start date not null,
  period_end date not null,
  invoice_date date not null default current_date,
  due_date date not null,
  rental_amount numeric(14, 2) not null default 0 check (rental_amount >= 0),
  service_charges numeric(14, 2) not null default 0 check (service_charges >= 0),
  other_charges numeric(14, 2) not null default 0 check (other_charges >= 0),
  discount_amount numeric(14, 2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(14, 2) not null default 0 check (total_amount >= 0),
  invoice_status text not null default 'Issued'
    check (invoice_status in ('Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled')),
  late_fee_applied boolean not null default false,
  created_by text not null default 'SYSTEM',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (occupancy_id, period_start),
  check (period_end >= period_start),
  check (discount_amount <= rental_amount + service_charges + other_charges),
  check (total_amount = rental_amount + service_charges + other_charges - discount_amount)
);

create table payments (
  payment_id text primary key,
  receipt_number text not null unique,
  payment_date date not null,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  payment_method text not null
    check (payment_method in ('Cash', 'Bank Transfer', 'QRIS', 'Other')),
  amount_received numeric(14, 2) not null check (amount_received > 0),
  reference_number text not null default '',
  payment_status text not null default 'Confirmed'
    check (payment_status in ('Pending', 'Confirmed', 'Voided', 'Refunded')),
  received_by text not null default 'SYSTEM',
  idempotency_key text not null unique,
  notes text not null default '',
  voided_at timestamptz,
  voided_by text,
  void_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payment_allocations (
  allocation_id text primary key,
  payment_id text not null references payments(payment_id) on delete restrict,
  invoice_id text not null references invoices(invoice_id) on delete restrict,
  allocated_amount numeric(14, 2) not null check (allocated_amount > 0),
  allocation_status text not null default 'Valid'
    check (allocation_status in ('Valid', 'Voided')),
  created_by text not null default 'SYSTEM',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_id, invoice_id)
);

create table credits (
  credit_id text primary key,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  payment_id text not null unique references payments(payment_id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  remaining_amount numeric(14, 2) not null check (remaining_amount >= 0),
  status text not null default 'Available'
    check (status in ('Available', 'Used', 'Voided')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (remaining_amount <= amount)
);

create table service_orders (
  service_order_id text primary key,
  order_date date not null default current_date,
  tenant_id text not null references tenants(tenant_id) on delete restrict,
  room_id text references rooms(room_id) on delete restrict,
  service_id text not null references services(service_id) on delete restrict,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_price numeric(14, 2) not null default 0 check (unit_price >= 0),
  total_amount numeric(14, 2) not null default 0 check (total_amount >= 0),
  order_status text not null default 'Billed'
    check (order_status in ('Billed', 'Paid', 'Cancelled')),
  billing_method text not null
    check (billing_method in ('Immediate Payment', 'Add to Invoice')),
  invoice_id text references invoices(invoice_id) on delete restrict,
  payment_id text references payments(payment_id) on delete restrict,
  requested_by text not null default 'SYSTEM',
  processed_by text not null default 'SYSTEM',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_amount = round(quantity * unit_price, 2))
);

create table expenses (
  expense_id text primary key,
  expense_date date not null default current_date,
  category text not null,
  description text not null,
  vendor text not null default '',
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_cost numeric(14, 2) not null default 0 check (unit_cost >= 0),
  total_amount numeric(14, 2) not null default 0 check (total_amount >= 0),
  payment_method text not null default '',
  receipt_url text not null default '',
  requested_by text not null default 'SYSTEM',
  payment_status text not null default 'Pending'
    check (payment_status in ('Pending', 'Approved', 'Paid', 'Cancelled')),
  transaction_id text references transactions(transaction_id) on delete restrict,
  approved_by text,
  approved_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_amount = round(quantity * unit_cost, 2))
);

create table activities (
  activity_id text primary key,
  activity_date date not null default current_date,
  staff_id text not null references staff(staff_id) on delete restrict,
  category text not null
    check (category in ('Cleaning', 'Maintenance', 'Inspection', 'Security', 'Administration', 'Other')),
  room_id text references rooms(room_id) on delete restrict,
  tenant_id text references tenants(tenant_id) on delete restrict,
  description text not null,
  priority text not null default 'Normal'
    check (priority in ('Low', 'Normal', 'High', 'Urgent')),
  due_date date not null,
  status text not null default 'Pending'
    check (status in ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  verified_by text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table audit_log (
  audit_id text primary key,
  timestamp timestamptz not null default now(),
  user_id text not null default 'SYSTEM',
  action text not null,
  module text not null,
  record_id text not null default '',
  previous_value jsonb,
  new_value jsonb,
  reason text not null default '',
  request_id text not null default ''
);

create table system_log (
  log_id text primary key,
  timestamp timestamptz not null default now(),
  function_name text not null,
  severity text not null default 'ERROR',
  request_id text not null default '',
  record_id text not null default '',
  error_message text not null default '',
  status text not null default 'Failed'
);

create index staff_email_idx on staff (lower(email));
create index rooms_type_idx on rooms (room_type_id);
create index rooms_operational_status_idx on rooms (operational_status);
create index tenants_status_idx on tenants (tenant_status);
create index tenants_name_idx on tenants (full_name);
create index reservations_room_status_idx on reservations (room_id, reservation_status, planned_check_in);
create index reservations_tenant_idx on reservations (tenant_id);
create index occupancies_room_status_idx on occupancies (room_id, agreement_status);
create index occupancies_tenant_idx on occupancies (tenant_id, agreement_status);
create index deposits_occupancy_idx on deposits (occupancy_id, deposit_status);
create index invoices_tenant_status_idx on invoices (tenant_id, invoice_status);
create index invoices_due_idx on invoices (due_date) where invoice_status in ('Issued', 'Partially Paid', 'Overdue');
create index invoices_room_idx on invoices (room_id);
create index payments_tenant_date_idx on payments (tenant_id, payment_date desc);
create index payments_status_idx on payments (payment_status);
create index payment_allocations_invoice_idx on payment_allocations (invoice_id);
create index credits_tenant_idx on credits (tenant_id, status);
create index service_orders_tenant_idx on service_orders (tenant_id, order_date desc);
create index service_orders_invoice_idx on service_orders (invoice_id);
create index expenses_date_idx on expenses (expense_date desc);
create index expenses_status_idx on expenses (payment_status);
create index transactions_date_idx on transactions (transaction_date desc);
create index transactions_tenant_idx on transactions (tenant_id, transaction_date desc);
create index transactions_reference_idx on transactions (reference_type, reference_id);
create index activities_staff_status_idx on activities (staff_id, status, due_date);
create index activities_room_idx on activities (room_id);
create index audit_log_timestamp_idx on audit_log (timestamp desc);
create index audit_log_record_idx on audit_log (module, record_id);
create index system_log_timestamp_idx on system_log (timestamp desc);

create or replace view v_invoice_balances as
select
  i.*,
  coalesce(sum(a.allocated_amount) filter (where a.allocation_status = 'Valid'), 0)::numeric(14, 2) as amount_paid,
  greatest(
    i.total_amount - coalesce(sum(a.allocated_amount) filter (where a.allocation_status = 'Valid'), 0),
    0
  )::numeric(14, 2) as outstanding_balance
from invoices i
left join payment_allocations a on a.invoice_id = i.invoice_id
group by i.invoice_id;

create trigger settings_updated_at before update on settings
  for each row execute function set_updated_at();
create trigger staff_updated_at before update on staff
  for each row execute function set_updated_at();
create trigger users_updated_at before update on users
  for each row execute function set_updated_at();
create trigger room_types_updated_at before update on room_types
  for each row execute function set_updated_at();
create trigger rooms_updated_at before update on rooms
  for each row execute function set_updated_at();
create trigger tenants_updated_at before update on tenants
  for each row execute function set_updated_at();
create trigger price_list_updated_at before update on price_list
  for each row execute function set_updated_at();
create trigger services_updated_at before update on services
  for each row execute function set_updated_at();
create trigger reservations_updated_at before update on reservations
  for each row execute function set_updated_at();
create trigger occupancies_updated_at before update on occupancies
  for each row execute function set_updated_at();
create trigger deposits_updated_at before update on deposits
  for each row execute function set_updated_at();
create trigger invoices_updated_at before update on invoices
  for each row execute function set_updated_at();
create trigger payments_updated_at before update on payments
  for each row execute function set_updated_at();
create trigger payment_allocations_updated_at before update on payment_allocations
  for each row execute function set_updated_at();
create trigger credits_updated_at before update on credits
  for each row execute function set_updated_at();
create trigger service_orders_updated_at before update on service_orders
  for each row execute function set_updated_at();
create trigger expenses_updated_at before update on expenses
  for each row execute function set_updated_at();
create trigger activities_updated_at before update on activities
  for each row execute function set_updated_at();

alter table id_counters enable row level security;
alter table settings enable row level security;
alter table staff enable row level security;
alter table users enable row level security;
alter table room_types enable row level security;
alter table rooms enable row level security;
alter table tenants enable row level security;
alter table price_list enable row level security;
alter table services enable row level security;
alter table transactions enable row level security;
alter table reservations enable row level security;
alter table occupancies enable row level security;
alter table deposits enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table payment_allocations enable row level security;
alter table credits enable row level security;
alter table service_orders enable row level security;
alter table expenses enable row level security;
alter table activities enable row level security;
alter table audit_log enable row level security;
alter table system_log enable row level security;
