-- Paid download files (the pipeline zip). Stored in Postgres rather than on
-- disk because the serverless deploy only contains what's in git, and the zip
-- is deliberately git-ignored. Loaded with `node db/upload-deliverable.mjs`
-- and read only by /api/download after it has verified a download token.
--
-- RLS on with no policies: unreadable through Supabase's public REST API; the
-- app's `postgres` role bypasses it.

create table public.deliverables (
  name text primary key,
  content bytea not null,
  content_type text not null default 'application/zip',
  updated_at timestamptz not null default now()
);

alter table public.deliverables enable row level security;
