-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES (extends auth.users) ────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  plan          text not null default 'free',
  jobs_this_month integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── JOBS (queue table) ────────────────────────────────────────────
create type job_status as enum ('pending', 'processing', 'done', 'failed', 'cancelled');
create type input_type as enum ('upload', 'youtube');

create table public.jobs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          job_status not null default 'pending',
  input_type      input_type not null,

  -- upload fields
  storage_path    text,
  original_name   text,
  file_size_bytes bigint,

  -- youtube fields
  youtube_url     text,
  youtube_title   text,
  youtube_duration_s integer,

  -- processing metadata
  attempts        smallint not null default 0,
  error_message   text,
  started_at      timestamptz,
  finished_at     timestamptz,
  processing_time_s real,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── ANALYSES (results) ────────────────────────────────────────────
create table public.analyses (
  id                    uuid primary key default uuid_generate_v4(),
  job_id                uuid not null unique references public.jobs(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,

  -- scores
  overall_score         real not null,
  grade                 char(1) not null,
  start_score           real,
  middle_score          real,
  end_score             real,

  -- curve data
  attention_curve       jsonb not null default '[]',
  motion_per_sec        jsonb not null default '[]',
  rms_per_sec           jsonb not null default '[]',

  -- transcript
  transcript_segments   jsonb not null default '[]',
  avg_speech_rate_wps   real,
  full_transcript       text,

  -- drops and silences
  attention_drops       jsonb not null default '[]',
  severe_drop_count     smallint not null default 0,
  silence_regions       jsonb not null default '[]',
  dead_silence_count    smallint not null default 0,
  dramatic_pause_count  smallint not null default 0,

  -- narrative continuity
  avg_continuity        real,

  -- GPT outputs
  gpt_summary           text not null default '',
  gpt_hook_analysis     text not null default '',
  gpt_recommendations   jsonb not null default '[]',
  gpt_tags              text[],

  -- meta
  video_duration_s      real,
  video_fps             real,
  created_at            timestamptz not null default now()
);

-- ─── USAGE TRACKING ────────────────────────────────────────────────
create table public.usage_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_type  text not null,
  job_id      uuid references public.jobs(id),
  created_at  timestamptz not null default now()
);
