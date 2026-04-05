-- Migration 007: Report read access for family members and doctors
-- Family members: broad read access gated by is_active + link (visibility_config
--   is enforced in the application layer, same pattern as the users table policy).
-- Doctors: imaging_findings was missing from migration 005.

-- ─────────────────────────────────────────────
-- FAMILY — lab reports
-- ─────────────────────────────────────────────
create policy "Family members read linked patient lab reports"
  on public.lab_reports for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.lab_reports.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );

-- ─────────────────────────────────────────────
-- FAMILY — lab parameters
-- ─────────────────────────────────────────────
create policy "Family members read linked patient lab parameters"
  on public.lab_parameters for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.lab_parameters.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );

-- ─────────────────────────────────────────────
-- FAMILY — imaging reports
-- ─────────────────────────────────────────────
create policy "Family members read linked patient imaging reports"
  on public.imaging_reports for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.imaging_reports.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );

-- ─────────────────────────────────────────────
-- FAMILY — imaging findings
-- ─────────────────────────────────────────────
create policy "Family members read linked patient imaging findings"
  on public.imaging_findings for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.imaging_findings.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );

-- ─────────────────────────────────────────────
-- FAMILY — storage objects (read report files)
-- ─────────────────────────────────────────────
create policy "Family members read linked patient report files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.family_members fm
      where fm.user_id = auth.uid()
        and fm.is_active = true
        and (storage.foldername(name))[1] = fm.patient_id::text
    )
  );

-- ─────────────────────────────────────────────
-- DOCTORS — imaging findings (missing from migration 005)
-- ─────────────────────────────────────────────
create policy "Doctors read linked patient imaging findings"
  on public.imaging_findings for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.imaging_findings.patient_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- ─────────────────────────────────────────────
-- DOCTORS — storage objects (read report files)
-- ─────────────────────────────────────────────
create policy "Doctors read linked patient report files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.doctors d
      where d.user_id = auth.uid()
        and d.is_active = true
        and (storage.foldername(name))[1] = d.patient_id::text
    )
  );
