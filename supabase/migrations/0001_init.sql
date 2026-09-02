-- AI Image Generation Pipeline — initial schema
-- Apply via `supabase db push` or the Supabase SQL editor against a real project.
-- auth.users is managed by Supabase Auth — not created here.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated buyer, keyed to auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  boutique_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- orders: one row per purchase attempt. buyer_id is null until the guest
-- checkout email is claimed by a logged-in account (see auth/callback route).
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users (id) on delete set null,
  buyer_email text not null,
  boutique_name text,
  -- Nullable: the order row is created before we know PayPal's order id
  -- (custom_id on the PayPal order points back at this row's id).
  paypal_order_id text unique,
  paypal_capture_id text unique,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_buyer_email_idx on public.orders (buyer_email);

alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders
  for select using (auth.uid() = buyer_id);

-- No client insert/update policies: orders are only ever written by
-- server-side routes using the service-role key (create-order, capture-order,
-- the webhook handler, and the guest-order claim step).

-- ---------------------------------------------------------------------------
-- licenses: one per completed order (1:1 via unique order_id)
-- ---------------------------------------------------------------------------
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  buyer_id uuid references auth.users (id) on delete set null,
  license_key text not null unique,
  status text not null default 'active' check (status in ('active', 'revoked')),
  issued_at timestamptz not null default now()
);

create index licenses_buyer_id_idx on public.licenses (buyer_id);

alter table public.licenses enable row level security;

create policy "licenses_select_own" on public.licenses
  for select using (auth.uid() = buyer_id);

-- ---------------------------------------------------------------------------
-- download_grants: short-lived, DB-backed download tokens. Service-role only
-- — no client policies, so RLS is enabled with an empty policy set (default
-- deny) rather than left disabled.
-- ---------------------------------------------------------------------------
create table public.download_grants (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  license_id uuid not null references public.licenses (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create index download_grants_order_id_idx on public.download_grants (order_id);
create unique index download_grants_token_hash_idx on public.download_grants (token_hash);

alter table public.download_grants enable row level security;

-- ---------------------------------------------------------------------------
-- contact_messages: support/pre-sale inbox. Written only via /api/contact
-- using the service-role key, so no client insert policy either.
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  related_order_id uuid references public.orders (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------------
-- rate_limit_hits: windowed counters for lib/rate-limit.ts. Service-role only.
-- ---------------------------------------------------------------------------
create table public.rate_limit_hits (
  id bigserial primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_bucket_created_idx
  on public.rate_limit_hits (bucket_key, created_at);

alter table public.rate_limit_hits enable row level security;

-- ---------------------------------------------------------------------------
-- webhook_events: idempotency guard for PayPal webhook deliveries.
-- id is the PayPal event id — inserting the same id twice is a no-op via
-- ON CONFLICT DO NOTHING in the webhook handler.
-- ---------------------------------------------------------------------------
create table public.webhook_events (
  id text primary key,
  event_type text,
  received_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

-- Note: `testimonials` is intentionally not created here. Ship with the
-- static/empty data/testimonials.ts first; add a real table only once real,
-- non-fabricated testimonials exist to manage (see plan §5/§14).
