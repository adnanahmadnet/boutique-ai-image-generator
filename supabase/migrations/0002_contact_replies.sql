-- Adds authenticated support requests (tied to a real account) and admin
-- replies to the existing contact_messages inbox.

alter table public.contact_messages
  add column buyer_id uuid references auth.users (id) on delete set null,
  add column reply text,
  add column replied_at timestamptz;

create index contact_messages_buyer_id_idx on public.contact_messages (buyer_id);

-- Logged-in buyers can read their own messages (and any admin reply on
-- them) directly, same pattern as orders_select_own / licenses_select_own.
-- Inserts/updates still only ever happen via service-role API routes.
create policy "contact_messages_select_own" on public.contact_messages
  for select using (auth.uid() = buyer_id);
