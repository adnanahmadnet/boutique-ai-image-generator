-- AI Image Generation Pipeline — local Postgres schema
-- Apply with: psql -U boutique_ai_app -h localhost -d boutique_ai -f db/migrations/0001_init.sql
-- Replaces Supabase (auth + Postgres) with a self-contained schema: this app
-- now owns its own users/sessions tables and does password auth directly.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users: one row per account. Replaces Supabase's auth.users. Password auth
-- is handled entirely in application code (bcrypt hash, see lib/auth/password.ts).
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  -- No email-confirmation flow without a transactional email provider wired
  -- up for it — accounts are confirmed at signup. Column kept so the admin
  -- user-detail page's "Email confirmed" field still means something.
  email_confirmed_at timestamptz not null default now(),
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sessions: server-side session store backing the httpOnly session cookie.
-- Only a SHA-256 hash of the session token is stored, mirroring how download
-- tokens are handled — the raw token never touches the database.
-- ---------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_user_id_idx on public.sessions (user_id);
create index sessions_expires_at_idx on public.sessions (expires_at);

-- ---------------------------------------------------------------------------
-- profiles: one row per account, for fields beyond auth (boutique name).
-- Kept separate from users so auth concerns and profile concerns don't mix.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references public.users (id) on delete cascade,
  boutique_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders: one row per purchase attempt. buyer_id is null until the guest
-- checkout email is claimed by a logged-in account (see lib/auth-claim.ts).
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users (id) on delete set null,
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

-- ---------------------------------------------------------------------------
-- licenses: one per completed order (1:1 via unique order_id)
-- ---------------------------------------------------------------------------
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  buyer_id uuid references public.users (id) on delete set null,
  license_key text not null unique,
  status text not null default 'active' check (status in ('active', 'revoked')),
  issued_at timestamptz not null default now()
);

create index licenses_buyer_id_idx on public.licenses (buyer_id);

-- ---------------------------------------------------------------------------
-- download_grants: short-lived download tokens. Only ever read/written by
-- server-side code holding the app's own DB role — no separate policy layer.
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

-- ---------------------------------------------------------------------------
-- contact_messages: support/pre-sale inbox, plus admin replies.
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users (id) on delete set null,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  related_order_id uuid references public.orders (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  reply text,
  replied_at timestamptz,
  reply_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index contact_messages_buyer_id_idx on public.contact_messages (buyer_id);

-- ---------------------------------------------------------------------------
-- rate_limit_hits: windowed counters for lib/rate-limit.ts.
-- ---------------------------------------------------------------------------
create table public.rate_limit_hits (
  id bigserial primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_bucket_created_idx
  on public.rate_limit_hits (bucket_key, created_at);

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

-- Note: `testimonials` is intentionally not created here. Ship with the
-- static/empty data/testimonials.ts first; add a real table only once real,
-- non-fabricated testimonials exist to manage.
