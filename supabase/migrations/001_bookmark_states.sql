create table if not exists public.bookmark_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.bookmark_states enable row level security;

revoke all on table public.bookmark_states from anon;
grant select, insert, update, delete on table public.bookmark_states to authenticated;

create policy "bookmark_states_select_own"
on public.bookmark_states
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "bookmark_states_insert_own"
on public.bookmark_states
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "bookmark_states_update_own"
on public.bookmark_states
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "bookmark_states_delete_own"
on public.bookmark_states
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create index if not exists bookmark_states_updated_at_idx
on public.bookmark_states(updated_at desc);
