-- Adds a phone number to public.profiles (previously unused — created in
-- 0001_init.sql for boutique_name but never wired up to signup) so the
-- support team has a direct way to contact a buyer, not just email.
--
-- Apply with:
--   psql -U boutique_ai_app -h localhost -d boutique_ai -f db/migrations/0005_profile_contact_info.sql

begin;

alter table public.profiles add column phone text;

commit;
