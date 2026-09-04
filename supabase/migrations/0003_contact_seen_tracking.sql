-- Tracks whether a buyer has seen an admin's reply, so the dashboard nav can
-- show a "new message" badge that clears once they open the Contact page.
alter table public.contact_messages
  add column reply_seen_at timestamptz;
