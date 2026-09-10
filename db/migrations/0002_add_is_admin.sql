-- Adds admin as an attribute of the user record itself, rather than only
-- living in the ADMIN_EMAILS env var (which is now bootstrap-only — see
-- lib/admin.ts). Apply with:
--   psql -U boutique_ai_app -h localhost -d boutique_ai -f db/migrations/0002_add_is_admin.sql

alter table public.users
  add column is_admin boolean not null default false;
