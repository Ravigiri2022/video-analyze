-- Worker poll query: pending jobs oldest first
create index idx_jobs_pending on public.jobs (created_at asc)
  where status = 'pending';

-- User job list
create index idx_jobs_user on public.jobs (user_id, created_at desc);

-- Analysis lookup by job
create index idx_analyses_job on public.analyses (job_id);

-- User analysis list
create index idx_analyses_user on public.analyses (user_id, created_at desc);

-- Rate limit check: count recent submissions per user
create index idx_usage_rate_limit on public.usage_events (user_id, created_at)
  where event_type = 'job_submitted';

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
