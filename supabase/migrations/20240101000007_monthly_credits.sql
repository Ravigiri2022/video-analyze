-- Add configurable monthly job limit to profiles
-- Change this per user directly in Supabase dashboard to tweak limits
alter table public.profiles
  add column if not exists monthly_job_limit integer not null default 3;
