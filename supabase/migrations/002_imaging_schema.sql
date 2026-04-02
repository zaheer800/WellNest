-- WellNest v2.1 Schema — Imaging, Posture, Restrictions, Condition Connections
-- Run after 001_initial_schema.sql

-- ─────────────────────────────────────────────
-- IMAGING REPORTS
-- ─────────────────────────────────────────────
create table if not exists public.imaging_reports (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid references public.users(id) on delete cascade,
  report_date             date not null,
  imaging_type            text not null,
  body_region             text,
  referring_doctor        text,
  reporting_radiologist   text,
  protocol_used           text,
  raw_findings            text,
  ai_summary              text,
  normal_findings         jsonb default '[]',
  abnormal_findings       jsonb default '[]',
  critical_findings       jsonb default '[]',
  surgical_urgency        boolean default false,
  follow_up_recommended   boolean default false,
  follow_up_timeline      text,
  image_url               text,
  processing_status       text default 'pending' check (processing_status in ('pending','processing','completed','failed')),
  uploaded_at             timestamptz default now(),
  processed_at            timestamptz
);

alter table public.imaging_reports enable row level security;
create policy "Patients manage own imaging reports"
  on public.imaging_reports for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- IMAGING FINDINGS
-- ─────────────────────────────────────────────
create table if not exists public.imaging_findings (
  id                  uuid primary key default gen_random_uuid(),
  imaging_report_id   uuid references public.imaging_reports(id) on delete cascade,
  patient_id          uuid references public.users(id) on delete cascade,
  location            text,
  finding_type        text,
  severity            text check (severity in ('normal','mild','moderate','severe','critical')),
  laterality          text check (laterality in ('left','right','bilateral','central','not_applicable')),
  description         text,
  plain_language      text,
  nerves_affected     text[],
  linked_symptoms     text[],
  is_new              boolean default true,
  trend               text check (trend in ('new','stable','improved','worsened')),
  report_date         date,
  created_at          timestamptz default now()
);

alter table public.imaging_findings enable row level security;
create policy "Patients manage own imaging findings"
  on public.imaging_findings for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- ACTIVITY RESTRICTIONS
-- ─────────────────────────────────────────────
create table if not exists public.activity_restrictions (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid references public.users(id) on delete cascade,
  restriction         text not null,
  reason              text,
  severity            text check (severity in ('advisory','strict','absolute')),
  set_by_doctor_id    uuid references public.doctors(id),
  start_date          date default current_date,
  end_date            date,
  is_active           boolean default true,
  created_at          timestamptz default now()
);

alter table public.activity_restrictions enable row level security;
create policy "Patients manage own restrictions"
  on public.activity_restrictions for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- POSTURE LOGS
-- ─────────────────────────────────────────────
create table if not exists public.posture_logs (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid references public.users(id) on delete cascade,
  session_start           timestamptz default now(),
  session_end             timestamptz,
  sitting_duration_minutes integer,
  stand_breaks_taken      integer default 0,
  lumbar_support_used     boolean,
  screen_at_eye_level     boolean,
  feet_flat_on_floor      boolean,
  compliance_score        integer check (compliance_score between 0 and 100),
  notes                   text
);

alter table public.posture_logs enable row level security;
create policy "Patients manage own posture logs"
  on public.posture_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- CONDITION CONNECTIONS
-- ─────────────────────────────────────────────
create table if not exists public.condition_connections (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid references public.users(id) on delete cascade,
  source_condition    text not null,
  source_label        text not null,
  target_condition    text not null,
  target_label        text not null,
  connection_type     text check (connection_type in ('causes','worsens','correlates','compounds')),
  plain_language      text not null,
  evidence_source     text check (evidence_source in ('lab_report','imaging','symptom_pattern','clinical')),
  evidence_report_id  uuid,
  is_active           boolean default true,
  created_at          timestamptz default now()
);

alter table public.condition_connections enable row level security;
create policy "Patients manage own condition connections"
  on public.condition_connections for all
  using (patient_id = auth.uid());
