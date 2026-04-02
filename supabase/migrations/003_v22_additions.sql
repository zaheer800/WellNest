-- WellNest v2.2 Schema — Injection Courses, Side Effects, Symptom Progression,
-- Family Engagement, Visit Preparations, and column additions
-- Run after 002_imaging_schema.sql

-- ─────────────────────────────────────────────
-- INJECTION COURSES
-- ─────────────────────────────────────────────
create table if not exists public.injection_courses (
  id                        uuid primary key default gen_random_uuid(),
  medication_id             uuid references public.medications(id) on delete cascade,
  patient_id                uuid references public.users(id) on delete cascade,
  total_doses               integer not null,
  frequency                 text not null check (frequency in ('daily','alternate_days','weekly')),
  start_date                date not null,
  end_date                  date,
  doses_completed           integer default 0,
  is_active                 boolean default true,
  post_course_medication_id uuid references public.medications(id),
  notes                     text,
  created_at                timestamptz default now()
);

alter table public.injection_courses enable row level security;
create policy "Patients manage own injection courses"
  on public.injection_courses for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- INJECTION COURSE LOGS
-- ─────────────────────────────────────────────
create table if not exists public.injection_course_logs (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid references public.injection_courses(id) on delete cascade,
  patient_id        uuid references public.users(id) on delete cascade,
  dose_number       integer not null,
  scheduled_date    date not null,
  administered      boolean default false,
  administered_at   timestamptz,
  administered_by   text check (administered_by in ('self','nurse','doctor','family')),
  site              text,
  side_effects_noted text,
  notes             text
);

alter table public.injection_course_logs enable row level security;
create policy "Patients manage own injection course logs"
  on public.injection_course_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- MEDICATION SIDE EFFECT LOGS
-- ─────────────────────────────────────────────
create table if not exists public.medication_side_effect_logs (
  id            uuid primary key default gen_random_uuid(),
  medication_id uuid references public.medications(id) on delete cascade,
  patient_id    uuid references public.users(id) on delete cascade,
  side_effect   text not null,
  severity      text not null check (severity in ('mild','moderate','severe','critical')),
  source        text not null check (source in ('experienced','read_about')),
  guidance      text,
  action_taken  text check (action_taken in ('continued','stopped','contacted_doctor','monitored')),
  resolved      boolean default false,
  resolved_at   timestamptz,
  logged_at     timestamptz default now()
);

alter table public.medication_side_effect_logs enable row level security;
create policy "Patients manage own side effect logs"
  on public.medication_side_effect_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- SYMPTOM PROGRESSION
-- ─────────────────────────────────────────────
create table if not exists public.symptom_progression (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  symptom_name      text not null,
  first_onset_date  date,
  current_severity  integer check (current_severity between 1 and 10),
  baseline_severity integer check (baseline_severity between 1 and 10),
  trend             text check (trend in ('improving','stable','worsening','resolved','new')),
  total_episodes    integer default 1,
  last_logged_at    timestamptz default now(),
  unique (patient_id, symptom_name)
);

alter table public.symptom_progression enable row level security;
create policy "Patients manage own symptom progression"
  on public.symptom_progression for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- FAMILY ENGAGEMENT LOGS
-- ─────────────────────────────────────────────
create table if not exists public.family_engagement_logs (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references public.users(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  engagement_type  text,
  logged_at        timestamptz default now()
);

alter table public.family_engagement_logs enable row level security;
create policy "Patients manage own family engagement logs"
  on public.family_engagement_logs for all
  using (patient_id = auth.uid());
create policy "Family members view own engagement logs"
  on public.family_engagement_logs for select
  using (family_member_id in (
    select id from public.family_members where patient_id = auth.uid()
  ));

-- ─────────────────────────────────────────────
-- FAMILY IMPACT SCORES
-- ─────────────────────────────────────────────
create table if not exists public.family_impact_scores (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid references public.users(id) on delete cascade,
  score_date            date not null,
  family_check_in_count integer default 0,
  messages_received     integer default 0,
  patient_health_score  integer,
  correlation_note      text,
  unique (patient_id, score_date)
);

alter table public.family_impact_scores enable row level security;
create policy "Patients manage own family impact scores"
  on public.family_impact_scores for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- VISIT PREPARATIONS
-- ─────────────────────────────────────────────
create table if not exists public.visit_preparations (
  id                    uuid primary key default gen_random_uuid(),
  appointment_id        uuid references public.appointments(id) on delete cascade,
  patient_id            uuid references public.users(id) on delete cascade,
  doctor_id             uuid references public.doctors(id),
  reports_to_carry      jsonb default '[]',
  symptoms_to_mention   jsonb default '[]',
  questions_to_ask      jsonb default '[]',
  what_doctor_will_check jsonb default '[]',
  medications_to_discuss jsonb default '[]',
  generated_at          timestamptz default now(),
  viewed_by_patient     boolean default false
);

alter table public.visit_preparations enable row level security;
create policy "Patients manage own visit preparations"
  on public.visit_preparations for all
  using (patient_id = auth.uid());
create policy "Doctors view linked visit preparations"
  on public.visit_preparations for select
  using (doctor_id in (
    select id from public.doctors where patient_id = auth.uid()
  ));

-- ─────────────────────────────────────────────
-- ALTER: symptom_logs — add onset tracking
-- ─────────────────────────────────────────────
alter table public.symptom_logs
  add column if not exists onset_date    date,
  add column if not exists is_backdated  boolean default false,
  add column if not exists environment   jsonb default '{}';

-- ─────────────────────────────────────────────
-- ALTER: sleep_logs — add position compliance
-- ─────────────────────────────────────────────
alter table public.sleep_logs
  add column if not exists position_compliant boolean,
  add column if not exists head_elevated      boolean;

-- ─────────────────────────────────────────────
-- ALTER: lab_reports — add detection metadata
-- ─────────────────────────────────────────────
alter table public.lab_reports
  add column if not exists detected_type        text,
  add column if not exists detection_confidence decimal;

-- ─────────────────────────────────────────────
-- ALTER: lab_parameters — expand status values + add critical_action
-- ─────────────────────────────────────────────
alter table public.lab_parameters
  drop constraint if exists lab_parameters_status_check;

alter table public.lab_parameters
  add constraint lab_parameters_status_check
  check (status in (
    'normal','borderline_low','borderline_high',
    'abnormal_low','abnormal_high',
    'critical_low','critical_high'
  ));

alter table public.lab_parameters
  add column if not exists critical_action text;

-- ─────────────────────────────────────────────
-- ALTER: imaging_reports — add detection metadata
-- ─────────────────────────────────────────────
alter table public.imaging_reports
  add column if not exists detected_type        text,
  add column if not exists detection_confidence decimal;

-- ─────────────────────────────────────────────
-- ALTER: imaging_findings — add spinal location columns
-- ─────────────────────────────────────────────
alter table public.imaging_findings
  add column if not exists spinal_level  text,
  add column if not exists spinal_region text check (spinal_region in (
    'cervical','thoracic','lumbar','sacral','non_spinal'
  ));

-- ─────────────────────────────────────────────
-- ALTER: appointments — add pre/post visit fields
-- ─────────────────────────────────────────────
alter table public.appointments
  add column if not exists pre_visit_report_generated boolean default false,
  add column if not exists post_visit_notes           text,
  add column if not exists follow_up_tasks            jsonb default '[]';

-- ─────────────────────────────────────────────
-- ALTER: medications — add injection and side effect fields
-- ─────────────────────────────────────────────
alter table public.medications
  add column if not exists is_injection        boolean default false,
  add column if not exists known_side_effects  jsonb default '[]';

-- ─────────────────────────────────────────────
-- ALTER: notifications — add acknowledgment fields
-- ─────────────────────────────────────────────
alter table public.notifications
  add column if not exists requires_acknowledgment boolean default false,
  add column if not exists acknowledged_at         timestamptz;
