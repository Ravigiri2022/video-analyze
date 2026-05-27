-- Add thumbnail + archive to jobs
alter table public.jobs
  add column if not exists thumbnail_url text,
  add column if not exists is_archived   boolean not null default false;

-- Add avatar to profiles
alter table public.profiles
  add column if not exists avatar_url text;

-- ─── Public thumbnails bucket (worker writes via service role) ──────
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

-- ─── Public avatars bucket ───────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Thumbnails: public read (bucket is already public, but explicit policy)
create policy "thumbnails: public read"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

-- Avatars: public read
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Avatars: owner can write/update/delete their own folder
create policy "avatars: owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "avatars: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
