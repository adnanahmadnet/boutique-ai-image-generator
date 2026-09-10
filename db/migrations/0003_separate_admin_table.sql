-- Separates admin identity from buyer identity into two independent tables.
--
-- Before this migration, "admin" was just a boolean flag
-- (public.users.is_admin) set automatically at signup for any email
-- present in the ADMIN_EMAILS bootstrap list (see lib/admin.ts, now
-- removed). That meant any visitor who signed up through the public
-- /signup form with a matching email silently became an admin and got
-- redirected into /admin instead of their buyer dashboard.
--
-- Fix: admins now live in their own table with their own session type
-- (public.admin_sessions, own cookie). The public signup/login endpoints
-- only ever touch public.users and can never create or authenticate an
-- admin. Admin login is a separate route (/admin/login -> POST
-- /api/admin/login) that checks public.admins only.
--
-- Apply with:
--   psql -U boutique_ai_app -h localhost -d boutique_ai -f db/migrations/0003_separate_admin_table.sql

begin;

-- ---------------------------------------------------------------------------
-- admins: fully separate from public.users — not "a user with a flag".
-- The `singleton` column plus the unique index on it enforce "at most one
-- admin row" at the database level: inserting a second row is a constraint
-- violation, not just an app-level convention. To rotate admins, update the
-- existing row (or delete it and insert a new one) rather than adding rows.
-- ---------------------------------------------------------------------------
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true check (singleton),
  email text not null unique,
  password_hash text not null,
  full_name text,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index admins_singleton_idx on public.admins (singleton);

-- ---------------------------------------------------------------------------
-- admin_sessions: mirrors public.sessions but for admins. A dedicated table
-- (rather than a nullable admin_id column on public.sessions) keeps the two
-- identities from ever sharing a session row, a cookie name, or a query.
-- ---------------------------------------------------------------------------
create table public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index admin_sessions_admin_id_idx on public.admin_sessions (admin_id);
create index admin_sessions_expires_at_idx on public.admin_sessions (expires_at);

-- ---------------------------------------------------------------------------
-- One-time data migration: carry over the most recently created
-- users.is_admin = true account (the real bootstrap admin) into the new
-- admins table before the column disappears, so they keep their existing
-- password and don't get locked out. Any other is_admin account was granted
-- that flag by the same bootstrap bug this migration fixes — it just
-- becomes an ordinary buyer account once the column is dropped below.
-- ---------------------------------------------------------------------------
insert into public.admins (email, password_hash, full_name, last_sign_in_at, created_at)
select email, password_hash, full_name, last_sign_in_at, created_at
from public.users
where is_admin = true
order by created_at desc
limit 1;

-- That identity now lives solely in public.admins — remove the duplicate
-- buyer-table row so the same email/password can't also log into the buyer
-- dashboard. No-op (matches zero rows) if no admin was migrated above.
delete from public.users
where email = (select email from public.admins limit 1);

alter table public.users drop column is_admin;

commit;
