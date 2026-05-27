-- ─── Row Level Security ────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.jobs         enable row level security;
alter table public.analyses     enable row level security;
alter table public.usage_events enable row level security;

-- Profiles: users manage only their own row
create policy "profiles: own row"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Jobs: users manage only their own jobs
create policy "jobs: own rows"
  on public.jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Analyses: users read only their own results
create policy "analyses: own rows"
  on public.analyses for select
  using (auth.uid() = user_id);

-- Usage events: users read only their own
create policy "usage_events: own rows"
  on public.usage_events for select
  using (auth.uid() = user_id);

-- ─── Storage bucket ────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  false,
  209715200,  -- 200MB
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
on conflict (id) do nothing;

-- Storage RLS: users can only access their own folder
create policy "storage: upload own videos"
  on storage.objects for insert
  with check (
    bucket_id = 'videos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage: read own videos"
  on storage.objects for select
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage: delete own videos"
  on storage.objects for delete
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
