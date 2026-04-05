-- WellNest — Storage Bucket and Policies
-- Creates the `reports` bucket and grants authenticated patients
-- access to their own folder only (patient_id is the first path segment).

-- ─────────────────────────────────────────────
-- CREATE BUCKET
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports',
  'reports',
  false,
  20971520, -- 20 MB per file
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- STORAGE RLS POLICIES
-- Path convention: {patient_id}/{timestamp}-{filename}
-- The first segment of the object name must equal auth.uid().
-- ─────────────────────────────────────────────

-- Allow authenticated patients to upload their own files
create policy "Patients upload own reports"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated patients to read their own files
create policy "Patients read own reports"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated patients to delete their own files
create policy "Patients delete own reports"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated patients to replace (update) their own files
create policy "Patients update own reports"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
