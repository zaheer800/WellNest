-- WellNest Initial Schema — v1
-- Run via: supabase db push

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text not null default '',
  date_of_birth date,
  gender      text check (gender in ('male', 'female', 'other')),
  height_cm   decimal,
  weight_kg   decimal,
  profile_photo_url text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.users enable row level security;
create policy "Users manage own profile"
  on public.users for all
  using (auth.uid() = id);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- FAMILY MEMBERS
-- ─────────────────────────────────────────────
create table if not exists public.family_members (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.users(id) on delete cascade,
  name            text not null,
  email           text,
  phone           text,
  relationship    text,
  access_level    integer default 1 check (access_level in (1, 2, 3)),
  visibility_config jsonb default '{}',
  invited_at      timestamptz default now(),
  accepted_at     timestamptz,
  last_seen_at    timestamptz,
  is_active       boolean default true
);

alter table public.family_members enable row level security;
create policy "Patients manage own family"
  on public.family_members for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- DOCTORS
-- ─────────────────────────────────────────────
create table if not exists public.doctors (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid references public.users(id) on delete cascade,
  name        text not null,
  specialty   text check (specialty in (
                'nephrology','urology','neurology','spine',
                'cardiology','general','other')),
  hospital    text,
  phone       text,
  email       text,
  notes       text,
  added_at    timestamptz default now(),
  is_active   boolean default true
);

alter table public.doctors enable row level security;
create policy "Patients manage own doctors"
  on public.doctors for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- MEDICATIONS
-- ─────────────────────────────────────────────
create table if not exists public.medications (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.users(id) on delete cascade,
  name            text not null,
  dose            text,
  unit            text,
  frequency       text check (frequency in ('daily','alternate_days','weekly','custom')) default 'daily',
  schedule_config jsonb default '{}',
  start_date      date,
  end_date        date,
  is_active       boolean default true,
  notes           text,
  refill_reminder_days integer default 7,
  created_at      timestamptz default now()
);

alter table public.medications enable row level security;
create policy "Patients manage own medications"
  on public.medications for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- MEDICATION LOGS
-- ─────────────────────────────────────────────
create table if not exists public.medication_logs (
  id              uuid primary key default gen_random_uuid(),
  medication_id   uuid references public.medications(id) on delete cascade,
  patient_id      uuid references public.users(id) on delete cascade,
  scheduled_date  date not null,
  taken           boolean default false,
  taken_at        timestamptz,
  skipped_reason  text,
  created_at      timestamptz default now(),
  unique (medication_id, scheduled_date)
);

alter table public.medication_logs enable row level security;
create policy "Patients manage own medication logs"
  on public.medication_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- WATER LOGS
-- ─────────────────────────────────────────────
create table if not exists public.water_logs (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid references public.users(id) on delete cascade,
  amount_ml   integer not null,
  fluid_type  text default 'water',
  logged_at   timestamptz default now()
);

alter table public.water_logs enable row level security;
create policy "Patients manage own water logs"
  on public.water_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- SYMPTOM LOGS
-- ─────────────────────────────────────────────
create table if not exists public.symptom_logs (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  symptom_name      text not null,
  symptom_category  text check (symptom_category in (
                      'urinary','neurological','spinal',
                      'digestive','cardiac','general','other')),
  severity          integer check (severity between 1 and 10),
  notes             text,
  metadata          jsonb default '{}',
  linked_finding_id uuid,
  logged_at         timestamptz default now()
);

alter table public.symptom_logs enable row level security;
create policy "Patients manage own symptom logs"
  on public.symptom_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- EXERCISE LOGS
-- ─────────────────────────────────────────────
create table if not exists public.exercise_logs (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid references public.users(id) on delete cascade,
  exercise_type       text not null,
  is_physiotherapy    boolean default false,
  duration_minutes    integer,
  distance_km         decimal,
  notes               text,
  logged_at           timestamptz default now()
);

alter table public.exercise_logs enable row level security;
create policy "Patients manage own exercise logs"
  on public.exercise_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- WEIGHT LOGS
-- ─────────────────────────────────────────────
create table if not exists public.weight_logs (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid references public.users(id) on delete cascade,
  weight_kg   decimal not null,
  logged_at   timestamptz default now()
);

alter table public.weight_logs enable row level security;
create policy "Patients manage own weight logs"
  on public.weight_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- DIET LOGS
-- ─────────────────────────────────────────────
create table if not exists public.diet_logs (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  meal_type         text,
  food_items        jsonb default '[]',
  compliance_flags  jsonb default '{}',
  notes             text,
  logged_at         timestamptz default now()
);

alter table public.diet_logs enable row level security;
create policy "Patients manage own diet logs"
  on public.diet_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- SLEEP LOGS
-- ─────────────────────────────────────────────
create table if not exists public.sleep_logs (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.users(id) on delete cascade,
  sleep_at        timestamptz,
  wake_at         timestamptz,
  duration_hours  decimal,
  quality         integer check (quality between 1 and 5),
  sleep_position  text check (sleep_position in ('back','left_side','right_side','stomach')),
  notes           text,
  logged_at       timestamptz default now()
);

alter table public.sleep_logs enable row level security;
create policy "Patients manage own sleep logs"
  on public.sleep_logs for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- LAB REPORTS
-- ─────────────────────────────────────────────
create table if not exists public.lab_reports (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  report_date       date not null,
  report_type       text not null,
  lab_name          text,
  doctor_name       text,
  raw_text          text,
  image_url         text,
  ai_summary        text,
  anomaly_count     integer default 0,
  processing_status text default 'pending' check (processing_status in ('pending','processing','completed','failed')),
  uploaded_at       timestamptz default now(),
  processed_at      timestamptz
);

alter table public.lab_reports enable row level security;
create policy "Patients manage own lab reports"
  on public.lab_reports for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- LAB PARAMETERS
-- ─────────────────────────────────────────────
create table if not exists public.lab_parameters (
  id                          uuid primary key default gen_random_uuid(),
  report_id                   uuid references public.lab_reports(id) on delete cascade,
  patient_id                  uuid references public.users(id) on delete cascade,
  parameter_name              text not null,
  parameter_category          text,
  value                       decimal,
  unit                        text,
  reference_min               decimal,
  reference_max               decimal,
  status                      text check (status in (
                                'normal','borderline_low','borderline_high',
                                'abnormal_low','abnormal_high','critical')),
  severity                    text check (severity in ('mild','moderate','severe')),
  trend                       text check (trend in ('improving','stable','worsening','new')),
  plain_language_explanation  text,
  report_date                 date,
  created_at                  timestamptz default now()
);

alter table public.lab_parameters enable row level security;
create policy "Patients manage own lab parameters"
  on public.lab_parameters for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- HEALTH TARGETS
-- ─────────────────────────────────────────────
create table if not exists public.health_targets (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.users(id) on delete cascade,
  parameter_name  text not null,
  target_min      decimal,
  target_max      decimal,
  target_value    decimal,
  set_by          text default 'system' check (set_by in ('system','doctor','patient')),
  doctor_id       uuid references public.doctors(id),
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.health_targets enable row level security;
create policy "Patients manage own health targets"
  on public.health_targets for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- HEALTH PLANS
-- ─────────────────────────────────────────────
create table if not exists public.health_plans (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references public.users(id) on delete cascade,
  plan_type     text check (plan_type in (
                  'diet','exercise','lifestyle','medication',
                  'followup','posture','physiotherapy','spine')),
  title         text not null,
  description   text,
  triggered_by  text,
  priority      integer default 2 check (priority in (1,2,3)),
  is_active     boolean default true,
  created_at    timestamptz default now(),
  expires_at    timestamptz
);

alter table public.health_plans enable row level security;
create policy "Patients manage own health plans"
  on public.health_plans for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  sender_family_id  uuid references public.family_members(id),
  sender_doctor_id  uuid references public.doctors(id),
  message           text not null,
  message_type      text default 'encouragement',
  is_read           boolean default false,
  sent_at           timestamptz default now(),
  read_at           timestamptz
);

alter table public.messages enable row level security;
create policy "Patients manage own messages"
  on public.messages for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- DOCTOR NOTES
-- ─────────────────────────────────────────────
create table if not exists public.doctor_notes (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid references public.users(id) on delete cascade,
  doctor_id               uuid references public.doctors(id) on delete cascade,
  note                    text not null,
  note_type               text default 'observation',
  is_visible_to_patient   boolean default true,
  is_visible_to_family    boolean default false,
  created_at              timestamptz default now()
);

alter table public.doctor_notes enable row level security;
create policy "Patients view own doctor notes"
  on public.doctor_notes for select
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────
create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  doctor_id         uuid references public.doctors(id),
  appointment_date  timestamptz not null,
  appointment_type  text,
  notes             text,
  reminder_sent     boolean default false,
  completed         boolean default false,
  created_at        timestamptz default now()
);

alter table public.appointments enable row level security;
create policy "Patients manage own appointments"
  on public.appointments for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid references public.users(id) on delete cascade,
  title       text not null,
  body        text not null,
  type        text,
  priority    text default 'normal' check (priority in ('low','normal','high','urgent')),
  is_read     boolean default false,
  action_url  text,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Patients manage own notifications"
  on public.notifications for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- STREAKS
-- ─────────────────────────────────────────────
create table if not exists public.streaks (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  streak_type       text not null,
  current_streak    integer default 0,
  longest_streak    integer default 0,
  last_logged_date  date,
  updated_at        timestamptz default now(),
  unique (patient_id, streak_type)
);

alter table public.streaks enable row level security;
create policy "Patients manage own streaks"
  on public.streaks for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- MILESTONES
-- ─────────────────────────────────────────────
create table if not exists public.milestones (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid references public.users(id) on delete cascade,
  milestone_type  text not null,
  title           text not null,
  description     text,
  achieved_at     timestamptz,
  is_achieved     boolean default false,
  metadata        jsonb default '{}'
);

alter table public.milestones enable row level security;
create policy "Patients manage own milestones"
  on public.milestones for all
  using (patient_id = auth.uid());

-- ─────────────────────────────────────────────
-- DAILY SCORES
-- ─────────────────────────────────────────────
create table if not exists public.daily_scores (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid references public.users(id) on delete cascade,
  score_date        date not null,
  total_score       integer default 0,
  water_score       integer default 0,
  medication_score  integer default 0,
  exercise_score    integer default 0,
  diet_score        integer default 0,
  sleep_score       integer default 0,
  posture_score     integer default 0,
  unique (patient_id, score_date)
);

alter table public.daily_scores enable row level security;
create policy "Patients manage own daily scores"
  on public.daily_scores for all
  using (patient_id = auth.uid());
