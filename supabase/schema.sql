-- VIBEFLOW Supabase schema (Postgres)
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles: one row per auth user
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Liked songs: user saves tracks
create table if not exists public.liked_songs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  title text not null,
  artist text not null,
  album text,
  image_url text,
  duration_ms integer,
  spotify_uri text,
  jamendo_stream_url text,
  created_at timestamptz not null default now(),
  unique (user_id, track_id)
);

-- Playlists (created by user)
create table if not exists public.playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Playlist tracks
create table if not exists public.playlist_tracks (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  title text not null,
  artist text not null,
  album text,
  image_url text,
  duration_ms integer,
  spotify_uri text,
  jamendo_stream_url text,
  position integer,
  created_at timestamptz not null default now()
);

-- Recently played (dedup by user + track)
create table if not exists public.recently_played (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  title text not null,
  artist text not null,
  album text,
  image_url text,
  duration_ms integer,
  spotify_uri text,
  jamendo_stream_url text,
  last_played_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, track_id)
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_playlists_updated_at on public.playlists;
create trigger set_playlists_updated_at
before update on public.playlists
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.liked_songs enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.recently_played enable row level security;

-- profiles policies
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- liked_songs policies
drop policy if exists "liked_read_own" on public.liked_songs;
create policy "liked_read_own" on public.liked_songs
for select using (auth.uid() = user_id);

drop policy if exists "liked_write_own" on public.liked_songs;
create policy "liked_write_own" on public.liked_songs
for insert with check (auth.uid() = user_id);

drop policy if exists "liked_delete_own" on public.liked_songs;
create policy "liked_delete_own" on public.liked_songs
for delete using (auth.uid() = user_id);

-- playlists policies
drop policy if exists "playlists_read_own_or_public" on public.playlists;
create policy "playlists_read_own_or_public" on public.playlists
for select using (auth.uid() = user_id or is_public = true);

drop policy if exists "playlists_write_own" on public.playlists;
create policy "playlists_write_own" on public.playlists
for insert with check (auth.uid() = user_id);

drop policy if exists "playlists_update_own" on public.playlists;
create policy "playlists_update_own" on public.playlists
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "playlists_delete_own" on public.playlists;
create policy "playlists_delete_own" on public.playlists
for delete using (auth.uid() = user_id);

-- playlist_tracks policies
drop policy if exists "playlist_tracks_read_own_or_public" on public.playlist_tracks;
create policy "playlist_tracks_read_own_or_public" on public.playlist_tracks
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.playlists p
    where p.id = playlist_id and p.is_public = true
  )
);

drop policy if exists "playlist_tracks_write_own" on public.playlist_tracks;
create policy "playlist_tracks_write_own" on public.playlist_tracks
for insert with check (auth.uid() = user_id);

drop policy if exists "playlist_tracks_delete_own" on public.playlist_tracks;
create policy "playlist_tracks_delete_own" on public.playlist_tracks
for delete using (auth.uid() = user_id);

-- recently_played policies
drop policy if exists "recent_read_own" on public.recently_played;
create policy "recent_read_own" on public.recently_played
for select using (auth.uid() = user_id);

drop policy if exists "recent_write_own" on public.recently_played;
create policy "recent_write_own" on public.recently_played
for insert with check (auth.uid() = user_id);

drop policy if exists "recent_update_own" on public.recently_played;
create policy "recent_update_own" on public.recently_played
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

