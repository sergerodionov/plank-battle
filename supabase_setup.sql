-- ============================================================================
-- Plank Battle — database setup
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.
-- ============================================================================

-- 1. Profiles: one row per athlete, mirrored from Google sign-in.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. Plank results: one immutable run per athlete per local day.
create table if not exists public.plank_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  local_date date not null,
  duration_seconds integer not null check (duration_seconds > 0),
  created_at timestamptz not null default now(),
  unique (user_id, local_date) -- enforces "one run per day"
);

create index if not exists plank_results_user_idx on public.plank_results (user_id);

-- 3. Row Level Security ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.plank_results enable row level security;

-- Everyone signed in can read all profiles (needed for the leaderboard names/avatars).
drop policy if exists "profiles are readable by authenticated" on public.profiles;
create policy "profiles are readable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- An athlete can create / update only their own profile row.
drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
  on public.profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Everyone signed in can read all results (the tournament board).
drop policy if exists "results are readable by authenticated" on public.plank_results;
create policy "results are readable by authenticated"
  on public.plank_results for select
  to authenticated
  using (true);

-- An athlete can insert only their own results.
drop policy if exists "users insert own results" on public.plank_results;
create policy "users insert own results"
  on public.plank_results for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 4. Auto-create a profile row whenever a new user signs up via Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
