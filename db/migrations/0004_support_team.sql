-- Adds a support-team identity with its own login/session type, an explicit
-- "includes_support" flag on orders (replacing the previous amount-based
-- heuristic used in the app), and a support_requests table tracking the
-- claim -> schedule -> done workflow for buyers who purchased support.
--
-- Apply with:
--   psql -U boutique_ai_app -h localhost -d boutique_ai -f db/migrations/0004_support_team.sql

begin;

-- ---------------------------------------------------------------------------
-- support_agents: a third identity alongside admins and users. Unlike
-- admins there's no singleton constraint — the admin can create as many
-- support accounts as needed from /admin/support-team. is_active lets the
-- admin revoke access without breaking the FK history on support_requests
-- (assigned_agent_id references this table with ON DELETE SET NULL, so a
-- hard delete would orphan past assignments — deactivating keeps the record
-- of who did what instead).
-- ---------------------------------------------------------------------------
create table public.support_agents (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- support_sessions: mirrors admin_sessions/sessions — its own table, its own
-- cookie (support_session_token), so this identity can never be confused
-- with an admin or buyer session. Same pattern as
-- db/migrations/0003_separate_admin_table.sql.
-- ---------------------------------------------------------------------------
create table public.support_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.support_agents (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index support_sessions_agent_id_idx on public.support_sessions (agent_id);
create index support_sessions_expires_at_idx on public.support_sessions (expires_at);

-- ---------------------------------------------------------------------------
-- orders.includes_support: previously inferred in the app from the order
-- amount (amount >= base price + add-on price), which the app-side comment
-- itself flagged as fragile if pricing ever changes. Backfill existing rows
-- with that same heuristic (one-time, for historical data only) — every
-- order created from here on sets this explicitly at insert time instead.
-- ---------------------------------------------------------------------------
alter table public.orders add column includes_support boolean not null default false;

update public.orders set includes_support = true where amount >= 49.99;

-- ---------------------------------------------------------------------------
-- support_requests: one row per order that included support, tracking the
-- claim -> schedule -> done workflow. Unique on order_id because support is
-- purchased once per order, not a recurring ticket queue.
-- ---------------------------------------------------------------------------
create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  buyer_id uuid references public.users (id) on delete set null,
  buyer_email text not null,
  status text not null default 'unclaimed' check (status in ('unclaimed', 'scheduled', 'done')),
  assigned_agent_id uuid references public.support_agents (id) on delete set null,
  scheduled_at timestamptz,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_requests_status_idx on public.support_requests (status);
create index support_requests_assigned_agent_id_idx on public.support_requests (assigned_agent_id);

-- Backfill: create a request row for every existing completed order that
-- now has includes_support = true, so historical test purchases show up in
-- the support dashboard too.
insert into public.support_requests (order_id, buyer_id, buyer_email)
select id, buyer_id, buyer_email
from public.orders
where includes_support = true and status = 'completed';

commit;
