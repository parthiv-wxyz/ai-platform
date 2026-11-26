create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 80
  )
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint conversations_title_length check (
    char_length(btrim(title)) between 1 and 200
  ),
  constraint conversations_id_user_id_key unique (id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null,
  role text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint messages_role_check check (role in ('user', 'assistant', 'system')),
  constraint messages_content_length check (
    char_length(btrim(content)) between 1 and 50000
  ),
  constraint messages_conversation_owner_fkey foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete cascade
);

create index conversations_user_id_updated_at_idx
  on public.conversations (user_id, updated_at desc);
create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);
create index messages_user_id_created_at_idx
  on public.messages (user_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

revoke all on public.profiles, public.conversations, public.messages from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.messages to authenticated;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "conversations_select_own"
on public.conversations for select to authenticated
using ((select auth.uid()) = user_id);

create policy "conversations_insert_own"
on public.conversations for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "conversations_update_own"
on public.conversations for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "conversations_delete_own"
on public.conversations for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "messages_select_own"
on public.messages for select to authenticated
using ((select auth.uid()) = user_id);

create policy "messages_insert_own"
on public.messages for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "messages_update_own"
on public.messages for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "messages_delete_own"
on public.messages for delete to authenticated
using ((select auth.uid()) = user_id);
