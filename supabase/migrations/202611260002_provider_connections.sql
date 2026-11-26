create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  label text not null,
  status text not null default 'active',
  credential_ciphertext text not null,
  credential_iv text not null,
  credential_auth_tag text not null,
  credential_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_connections_provider_check check (provider in ('google')),
  constraint provider_connections_status_check check (status in ('active', 'invalid', 'revoked')),
  constraint provider_connections_label_length check (char_length(btrim(label)) between 1 and 80),
  constraint provider_connections_user_provider_label_key unique (user_id, provider, label)
);

create index provider_connections_user_id_idx on public.provider_connections (user_id);
create trigger provider_connections_set_updated_at before update on public.provider_connections
for each row execute procedure public.set_updated_at();

revoke all on public.provider_connections from anon;
grant insert, delete on public.provider_connections to authenticated;
alter table public.provider_connections enable row level security;

create policy "provider_connections_select_own" on public.provider_connections
for select to authenticated using ((select auth.uid()) = user_id);
create policy "provider_connections_insert_own" on public.provider_connections
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "provider_connections_delete_own" on public.provider_connections
for delete to authenticated using ((select auth.uid()) = user_id);
