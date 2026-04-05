-- ─────────────────────────────────────────────────────────────────
-- Migration 005: Doctor account linking
-- ─────────────────────────────────────────────────────────────────

-- Link a doctor's Supabase auth account to their doctor record
alter table public.doctors
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists invite_token text unique;

-- Index for fast lookup by token (used during join flow)
create index if not exists idx_doctors_invite_token
  on public.doctors(invite_token);

-- Index for fast lookup by user_id (used during login role detection)
create index if not exists idx_doctors_user_id
  on public.doctors(user_id);

-- Doctors can read their own record (to resolve linked patient and specialty)
create policy "Doctors read own record"
  on public.doctors for select
  using (user_id = auth.uid());

-- Allow a doctor to claim an unclaimed invite token
-- (their auth.uid() does not match patient_id, so the default policy blocks this)
create policy "Doctors claim invite"
  on public.doctors for update
  using (user_id is null and invite_token is not null)
  with check (user_id = auth.uid());

-- Doctors can read their linked patient's user profile
create policy "Doctors read linked patient profile"
  on public.users for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.users.id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- Doctors can read their linked patient's lab reports
create policy "Doctors read linked patient lab reports"
  on public.lab_reports for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.lab_reports.patient_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- Doctors can read their linked patient's lab parameters
create policy "Doctors read linked patient lab parameters"
  on public.lab_parameters for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.lab_parameters.patient_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- Doctors can read imaging reports
create policy "Doctors read linked patient imaging reports"
  on public.imaging_reports for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.imaging_reports.patient_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- Doctors can read symptom logs
create policy "Doctors read linked patient symptom logs"
  on public.symptom_logs for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.symptom_logs.patient_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- Doctors can read medication logs
create policy "Doctors read linked patient medication logs"
  on public.medication_logs for select
  using (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.medication_logs.patient_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

-- Doctors can write notes on their linked patient
create policy "Doctors write own notes"
  on public.doctor_notes for insert
  with check (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.doctor_notes.patient_id
        and d.id = public.doctor_notes.doctor_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

create policy "Doctors read own notes"
  on public.doctor_notes for select
  using (
    exists (
      select 1 from public.doctors d
      where d.id = public.doctor_notes.doctor_id
        and d.user_id = auth.uid()
    )
  );

-- Doctors can set health targets for their linked patient
create policy "Doctors write health targets"
  on public.health_targets for insert
  with check (
    exists (
      select 1 from public.doctors d
      where d.patient_id = public.health_targets.patient_id
        and d.id = public.health_targets.doctor_id
        and d.user_id = auth.uid()
        and d.is_active = true
    )
  );

create policy "Doctors read health targets they set"
  on public.health_targets for select
  using (
    exists (
      select 1 from public.doctors d
      where d.id = public.health_targets.doctor_id
        and d.user_id = auth.uid()
    )
  );
