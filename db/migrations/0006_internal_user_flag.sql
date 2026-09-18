-- Lets the admin mark a buyer account as "internal" (their own testing
-- account, a colleague's account, etc.) so it stops appearing in the
-- customer-facing Users list — without deleting it or losing its order
-- history. Defaults to false for every existing and future row.
--
-- Apply with:
--   psql -U boutique_ai_app -h localhost -d boutique_ai -f db/migrations/0006_internal_user_flag.sql

begin;

alter table public.users add column is_internal boolean not null default false;

commit;
