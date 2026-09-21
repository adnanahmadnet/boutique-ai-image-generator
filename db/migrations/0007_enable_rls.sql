-- Supabase exposes the public schema through its auto-generated REST API
-- (reachable with the project's anon/publishable key). Tables created via raw
-- SQL have RLS off, which would leave password hashes, sessions and orders
-- readable by anyone holding that key.
--
-- Turning RLS on with no policies denies the anon/authenticated roles
-- entirely. The app is unaffected: it connects with the `postgres` role
-- through DATABASE_URL, and that role bypasses RLS.

alter table public.admins enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.support_agents enable row level security;
alter table public.support_sessions enable row level security;
alter table public.support_requests enable row level security;
alter table public.orders enable row level security;
alter table public.licenses enable row level security;
alter table public.download_grants enable row level security;
alter table public.contact_messages enable row level security;
alter table public.rate_limit_hits enable row level security;
alter table public.webhook_events enable row level security;
alter table public.schema_migrations enable row level security;
