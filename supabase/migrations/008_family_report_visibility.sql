-- Migration 008: Gate family report access on visibility_config->>'reports'
-- Replaces the permissive policies added in 007 with visibility-checked ones.
-- Reports default to false when a family member is invited (see addFamilyMember
-- in supabase.ts), so access is explicitly opt-in per patient.

-- ─────────────────────────────────────────────
-- Drop permissive family report policies from migration 007
-- ─────────────────────────────────────────────
drop policy if exists "Family members read linked patient lab reports"       on public.lab_reports;
drop policy if exists "Family members read linked patient lab parameters"    on public.lab_parameters;
drop policy if exists "Family members read linked patient imaging reports"   on public.imaging_reports;
drop policy if exists "Family members read linked patient imaging findings"  on public.imaging_findings;
drop policy if exists "Family members read linked patient report files"      on storage.objects;

-- ─────────────────────────────────────────────
-- Re-create with visibility gate
-- ─────────────────────────────────────────────

create policy "Family members read linked patient lab reports"
  on public.lab_reports for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.lab_reports.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
        and (fm.visibility_config->>'reports')::boolean = true
    )
  );

create policy "Family members read linked patient lab parameters"
  on public.lab_parameters for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.lab_parameters.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
        and (fm.visibility_config->>'reports')::boolean = true
    )
  );

create policy "Family members read linked patient imaging reports"
  on public.imaging_reports for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.imaging_reports.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
        and (fm.visibility_config->>'reports')::boolean = true
    )
  );

create policy "Family members read linked patient imaging findings"
  on public.imaging_findings for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.imaging_findings.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
        and (fm.visibility_config->>'reports')::boolean = true
    )
  );

create policy "Family members read linked patient report files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.family_members fm
      where fm.user_id = auth.uid()
        and fm.is_active = true
        and (fm.visibility_config->>'reports')::boolean = true
        and (storage.foldername(name))[1] = fm.patient_id::text
    )
  );
