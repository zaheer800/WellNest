# WellNest — Product Requirements Document
**Version 2.2 | April 2026**
**"Your health. Your circle. Your journey."**

---

## CHANGELOG — v2.1 → v2.2

| Gap | Feature Added | Priority |
|---|---|---|
| 1 | Symptom history backdating | 🔴 High |
| 2 | Symptom severity progression tracking | 🔴 High |
| 3 | Injection course manager | 🔴 High |
| 4 | Environmental trigger tracking | 🟠 Medium |
| 5 | Doctor visit preparation assistant | 🟠 Medium |
| 6 | Medication side effect monitoring | 🟠 Medium |
| 7 | Urine color visual logger | 🟠 Medium |
| 8 | Auto report type detection | 🟠 Medium |
| 9 | Family encouragement impact tracking | 🟡 Low |
| 10 | Sleep position guidance system | 🟠 Medium |
| 11 | Critical value bidirectional alerts | 🔴 High |
| 12 | Whole spine visual map | 🟠 Medium |

---

## TABLE OF CONTENTS

1. Product Overview
2. Design Philosophy
3. User Roles
4. Tech Stack
5. Database Schema
6. Feature Specifications
7. Report Intelligence Engine
8. Condition Connection Engine
9. New Features — v2.2 Additions
10. API Integrations
11. Notification System
12. Privacy and Security
13. Development Roadmap
14. Success Metrics
15. Folder Structure
16. Environment Variables
17. README Starter

---

## 1. PRODUCT OVERVIEW

### Vision
WellNest is a universal personal health tracking platform that transforms medical reports into actionable insights, tracks daily health habits, connects patients with their family support circle, and keeps doctors informed — all in one beautifully designed, privacy-first application.

### Mission
Make health tracking effortless, intelligent, and connected. Turn medical compliance into a supported, motivated, and measurable journey for anyone — regardless of their condition, age, or health literacy.

### Core Promise
Upload any medical report → WellNest reads it → Flags anomalies → Creates a personalised improvement plan → Tracks progress over time → Keeps your circle informed.

### Tagline
**"Your health. Your circle. Your journey."**

### What Makes WellNest Different
- Works for ANY medical condition — not disease specific
- Reads ANY report format — blood tests, imaging, nerve studies, endoscopy
- Connects conditions intelligently — shows how health issues relate
- Brings family into the journey — not just a solo tracking app
- Speaks to doctors in clinical language — not just patients
- Builds a complete health timeline — including past symptom history
- Monitors treatment side effects — prevents unnecessary medication abandonment
- Prepares patients for doctor visits — makes consultations more effective

---

## 2. DESIGN PHILOSOPHY

### Principles

**1. Generic First**
WellNest is not built for any specific condition. Any user with any health profile can onboard, upload their reports, and immediately get value. The system learns from what the user uploads.

**2. Report Intelligence**
The core engine reads any medical report — blood test, urine analysis, imaging report, ECG, MRI, nerve study, bone density, endoscopy — extracts all findings, compares against standards, and flags anomalies automatically. Auto-detects report type — no user selection needed.

**3. Two Report Worlds**
Lab reports contain numeric values compared to reference ranges.
Imaging reports contain descriptive findings requiring different intelligence.
WellNest handles both with purpose-built processing pipelines.

**4. Complete Timeline**
Health history is not just what happened today. Symptoms can be backdated to when they actually started. The system builds a true medical timeline — critical for conditions that develop gradually like neuropathy or disc disease.

**5. Dynamic Planning**
Health plans are not static. Every time a new report is uploaded, the system updates the user's health plan, celebrates improvements, flags regressions, and adjusts recommendations accordingly.

**6. Connected Care**
Health is not a solo journey. Family members and doctors are first-class citizens in WellNest. Each role has appropriate access — family sees progress and sends support, doctors see clinical data and add notes.

**7. Condition Connections**
Multiple health conditions in the same patient are often interconnected. WellNest surfaces these connections visually — helping patients understand WHY they need to follow recommendations, driving motivation through understanding.

**8. Safety First**
Critical lab values — both dangerously high AND dangerously low — trigger immediate bidirectional alerts. No critical value is ever silently dismissed.

**9. Privacy by Design**
Health data is the most sensitive personal data. Row-level security at database level. Patient controls exactly what each family member and doctor can see. No data sold or shared.

**10. Progressive Complexity**
New users see a simple, clean interface. Power features reveal themselves as users engage more. Never overwhelming on day one.

---

## 3. USER ROLES

### 3.1 Patient (Primary User)
The individual whose health is being tracked.

**Capabilities:**
- Full read and write access to own health data
- Upload and manage all medical reports (lab AND imaging)
- Log daily health activities with backdating support
- Manage medications, injection courses, and side effects
- Manage activity restrictions
- Invite and manage family members
- Add and manage multiple specialist doctors
- Prepare for doctor visits with AI assistance
- Control data visibility per person
- Generate and share reports
- View all trends, insights, and condition connections

**Onboarding:**
- Name, date of birth, gender
- Height and weight
- Optional: pre-existing conditions
- Optional: current medications
- Upload first medical report (triggers auto-profile generation)

---

### 3.2 Family Member
A trusted person in the patient's support circle.

**Capabilities:**
- View patient's daily health score
- View sections the patient has permitted
- Receive alerts and notifications
- Send encouraging messages and reactions
- View weekly summary reports
- View family impact score (how their engagement affects patient)
- Cannot edit any patient data
- Cannot see sections marked private by patient

**Default Visibility (patient can change each):**
| Section | Default |
|---|---|
| Daily Health Score | ✅ Visible |
| Medication Compliance | ✅ Visible |
| Water Intake | ✅ Visible |
| Exercise | ✅ Visible |
| Lab Results Summary | ✅ Visible |
| Imaging Report Summary | ✅ Visible |
| Condition Connections | ✅ Visible |
| Injection Course Progress | ✅ Visible |
| Symptom Details | 🔒 Patient controls |
| Weight | 🔒 Patient controls |
| Detailed Lab Values | 🔒 Patient controls |
| Sleep Position Logs | 🔒 Patient controls |
| Bladder / Intimate Logs | ❌ Always private |
| Personal Notes | ❌ Always private |

---

### 3.3 Doctor
A licensed medical professional managing the patient's care.

**Capabilities:**
- View clinical data relevant to their specialty
- View medication compliance and side effect reports
- View symptom frequency with onset dates and progression
- View relevant imaging findings including spine map
- View environmental trigger correlations
- Add clinical notes visible to patient
- Update health targets for patient
- Set activity restrictions
- Receive pre-visit summaries
- Receive auto-generated patient summaries
- Cannot see personal diary or private notes

**Specialty-Filtered Views:**

**Nephrologist View:**
- Kidney function parameters (Creatinine, eGFR, BUN, Urea)
- Critical value alerts — both high and low
- Uric acid trends
- Electrolytes including sodium trend
- Urine analysis results with color logs
- Medication compliance (kidney-related medications)
- Fluid intake logs
- Weight trend

**Urologist View:**
- Urinary frequency logs with time-of-day patterns
- Environmental trigger correlation (AC vs non-AC)
- Urine color visual log trend
- Uroflowmetry data
- Post-void residual measurements
- Bladder diary (if patient permits)
- PSA if available
- Ultrasound findings related to urinary tract

**Neurologist / Spine Specialist View:**
- NCS results and trends
- Whole spine visual map with all findings
- Symptom logs with ONSET DATES (not just log dates)
- Symptom progression charts per symptom
- Leg symptom history including backdated entries
- Exercise compliance and physiotherapy progress
- Activity restriction compliance
- Sleep position compliance
- Environmental triggers affecting neurological symptoms

**Cardiologist View:**
- Lipid profile trends
- Cardiac markers (Troponin, hs-CRP)
- ECG findings
- Echo findings
- Blood pressure logs
- Exercise logs

---

## 4. TECH STACK

### Frontend
| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 | Industry standard, component-based |
| Language | TypeScript | Type safety across codebase |
| Styling | Tailwind CSS | Rapid UI development |
| State Management | Zustand | Lightweight, simple |
| Charts | Recharts | React-native charts library |
| Forms | React Hook Form | Performant form handling |
| PWA | Vite PWA Plugin | Installable on mobile |
| Routing | React Router v6 | Client-side navigation |
| Animations | Framer Motion | Smooth transitions |
| Spine Visualisation | Custom SVG | Interactive spine diagram |

### Backend / Infrastructure
| Layer | Technology | Reason |
|---|---|---|
| Database | Supabase (PostgreSQL) | Relational, open source, RLS support |
| Authentication | Supabase Auth | Built-in, supports OTP and OAuth |
| File Storage | Supabase Storage | Report images and PDFs |
| Real-time | Supabase Realtime | Family dashboard live updates |
| Edge Functions | Supabase Edge Functions | Report processing, notifications |
| AI / Report Reading | Claude API (Anthropic) | Best-in-class document understanding |
| Hosting | Vercel | Free tier, instant deploys |
| CI/CD | GitHub Actions | Automated testing and deployment |

### Development
| Tool | Purpose |
|---|---|
| GitHub | Version control and collaboration |
| ESLint + Prettier | Code quality and formatting |
| Vitest | Unit testing |
| Playwright | End-to-end testing |

---

## 5. DATABASE SCHEMA

### 5.1 Core Tables

```sql
-- Users (Patients)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm DECIMAL,
  weight_kg DECIMAL,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT,
  access_level INTEGER DEFAULT 1 CHECK (access_level IN (1, 2, 3)),
  visibility_config JSONB DEFAULT '{}',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Doctors
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  hospital TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

---

### 5.2 Health Tracking Tables

```sql
-- Medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  unit TEXT,
  frequency TEXT,
  schedule_config JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  is_injection BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  refill_reminder_days INTEGER DEFAULT 7,
  known_side_effects JSONB DEFAULT '[]',
  -- Array of known side effect strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Injection Courses (NEW v2.2)
CREATE TABLE injection_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_doses INTEGER NOT NULL,
  frequency TEXT NOT NULL,
  -- 'daily', 'alternate_days', 'weekly'
  start_date DATE NOT NULL,
  end_date DATE,
  -- Calculated from total_doses and frequency
  doses_completed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  post_course_medication_id UUID REFERENCES medications(id),
  -- Oral medication to transition to after course
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Injection Course Logs (NEW v2.2)
CREATE TABLE injection_course_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES injection_courses(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dose_number INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  administered BOOLEAN DEFAULT FALSE,
  administered_at TIMESTAMPTZ,
  administered_by TEXT,
  -- 'self', 'nurse', 'doctor', 'family'
  site TEXT,
  -- Injection site if relevant
  side_effects_noted TEXT,
  notes TEXT
);

-- Medication Logs
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  taken BOOLEAN DEFAULT FALSE,
  taken_at TIMESTAMPTZ,
  skipped_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Side Effect Logs (NEW v2.2)
CREATE TABLE medication_side_effect_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  side_effect TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  source TEXT CHECK (source IN ('experienced', 'read_about')),
  -- 'experienced': patient actually felt this
  -- 'read_about': patient read about it and is worried
  guidance TEXT,
  -- System generated: 'continue', 'monitor', 'contact_doctor', 'stop_immediately'
  action_taken TEXT,
  -- 'continued', 'stopped', 'contacted_doctor', 'monitored'
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Intake Logs
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  fluid_type TEXT DEFAULT 'water',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptom Logs (UPDATED v2.2)
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  symptom_category TEXT,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  onset_date DATE,
  -- NEW v2.2: When symptom actually started (can be in past)
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  -- When it was entered in app (may differ from onset_date)
  is_backdated BOOLEAN DEFAULT FALSE,
  -- NEW v2.2: True if onset_date < logged_at date
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  -- Urinary: {color, volume, urgency, location, ac_environment, temperature}
  -- Spinal: {location, radiation_pattern, worse_with, better_with}
  -- Neurological: {which_limb, sensation_type, duration, progression}
  environment JSONB DEFAULT '{}',
  -- NEW v2.2: {temperature: 'cold_ac'|'room_temp'|'hot', location: 'home'|'office'|'outdoor', activity: 'sitting'|'walking'|'post_meal'}
  linked_finding_id UUID,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATE
);

-- Symptom Progression (NEW v2.2)
-- Tracks same symptom over time for trend analysis
CREATE TABLE symptom_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  first_onset_date DATE,
  -- Earliest onset_date recorded for this symptom
  current_severity INTEGER,
  baseline_severity INTEGER,
  -- Severity at first onset
  trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening', 'resolved', 'new')),
  total_episodes INTEGER DEFAULT 1,
  last_logged_at TIMESTAMPTZ DEFAULT NOW(),
  -- Aggregated for performance
  UNIQUE(patient_id, symptom_name)
);

-- Exercise Logs
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  is_physiotherapy BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER,
  distance_km DECIMAL,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight Logs
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight_kg DECIMAL NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diet Logs
CREATE TABLE diet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_type TEXT,
  food_items JSONB DEFAULT '[]',
  compliance_flags JSONB DEFAULT '{}',
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep Logs (UPDATED v2.2)
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sleep_at TIMESTAMPTZ,
  wake_at TIMESTAMPTZ,
  duration_hours DECIMAL,
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  sleep_position TEXT,
  -- 'left_side_pillow', 'right_side_pillow', 'back', 'stomach', 'other'
  recommended_position TEXT,
  -- System generated from conditions
  position_compliant BOOLEAN,
  -- NEW v2.2: Did patient use recommended position?
  head_elevated BOOLEAN,
  -- NEW v2.2: For GERD patients
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.3 Lab Report Tables

```sql
-- Lab Reports
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL,
  detected_type TEXT,
  -- NEW v2.2: Auto-detected type by Claude
  detection_confidence DECIMAL,
  -- NEW v2.2: Confidence score 0-1
  lab_name TEXT,
  doctor_name TEXT,
  raw_text TEXT,
  image_url TEXT,
  ai_summary TEXT,
  anomaly_count INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Lab Parameters (UPDATED v2.2)
CREATE TABLE lab_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  parameter_category TEXT,
  value DECIMAL,
  unit TEXT,
  reference_min DECIMAL,
  reference_max DECIMAL,
  status TEXT CHECK (status IN (
    'normal',
    'borderline_low',
    'borderline_high',
    'abnormal_low',
    'abnormal_high',
    'critical_low',
    -- NEW v2.2: Separate critical low
    'critical_high'
    -- NEW v2.2: Separate critical high
  )),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening', 'new')),
  plain_language_explanation TEXT,
  critical_action TEXT,
  -- NEW v2.2: What to do if critical — 'contact_doctor_today', 'emergency', 'monitor'
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Targets
CREATE TABLE health_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  target_min DECIMAL,
  target_max DECIMAL,
  target_value DECIMAL,
  set_by TEXT DEFAULT 'system',
  doctor_id UUID REFERENCES doctors(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Plans
CREATE TABLE health_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  triggered_by TEXT,
  priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

---

### 5.4 Imaging Report Tables

```sql
-- Imaging Reports
CREATE TABLE imaging_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  imaging_type TEXT NOT NULL,
  detected_type TEXT,
  -- NEW v2.2: Auto-detected by Claude
  detection_confidence DECIMAL,
  -- NEW v2.2: Confidence 0-1
  body_region TEXT,
  referring_doctor TEXT,
  reporting_radiologist TEXT,
  protocol_used TEXT,
  raw_findings TEXT,
  ai_summary TEXT,
  normal_findings JSONB DEFAULT '[]',
  abnormal_findings JSONB DEFAULT '[]',
  critical_findings JSONB DEFAULT '[]',
  surgical_urgency BOOLEAN DEFAULT FALSE,
  follow_up_recommended BOOLEAN DEFAULT FALSE,
  follow_up_timeline TEXT,
  image_url TEXT,
  processing_status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Imaging Findings
CREATE TABLE imaging_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_report_id UUID REFERENCES imaging_reports(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  spinal_level TEXT,
  -- NEW v2.2: Standardised spinal level e.g. 'L4-L5', 'C5-C6', 'D8-D9'
  spinal_region TEXT,
  -- NEW v2.2: 'cervical', 'thoracic', 'lumbar', 'sacral', 'non_spinal'
  finding_type TEXT,
  severity TEXT CHECK (severity IN (
    'normal', 'mild', 'moderate', 'severe', 'critical'
  )),
  laterality TEXT,
  description TEXT,
  plain_language TEXT,
  nerves_affected TEXT[],
  linked_symptoms TEXT[],
  is_new BOOLEAN DEFAULT TRUE,
  trend TEXT CHECK (trend IN ('new', 'stable', 'improved', 'worsened')),
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Restrictions
CREATE TABLE activity_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restriction TEXT NOT NULL,
  reason TEXT,
  severity TEXT CHECK (severity IN ('advisory', 'strict', 'absolute')),
  set_by_doctor_id UUID REFERENCES doctors(id),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posture Logs
CREATE TABLE posture_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  sitting_duration_minutes INTEGER,
  stand_breaks_taken INTEGER DEFAULT 0,
  lumbar_support_used BOOLEAN,
  screen_at_eye_level BOOLEAN,
  feet_flat_on_floor BOOLEAN,
  compliance_score INTEGER,
  notes TEXT
);

-- Condition Connections
CREATE TABLE condition_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_condition TEXT NOT NULL,
  source_label TEXT NOT NULL,
  target_condition TEXT NOT NULL,
  target_label TEXT NOT NULL,
  connection_type TEXT CHECK (connection_type IN (
    'causes', 'worsens', 'correlates', 'compounds'
  )),
  plain_language TEXT NOT NULL,
  evidence_source TEXT,
  evidence_report_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.5 Communication Tables

```sql
-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_family_id UUID REFERENCES family_members(id),
  sender_doctor_id UUID REFERENCES doctors(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'encouragement',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Family Engagement Logs (NEW v2.2)
CREATE TABLE family_engagement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  engagement_type TEXT,
  -- 'viewed_dashboard', 'sent_message', 'sent_reaction', 'viewed_report'
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Impact Scores (NEW v2.2)
CREATE TABLE family_impact_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  family_check_in_count INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  patient_health_score INTEGER DEFAULT 0,
  -- Patient's daily score on days with family engagement
  correlation_note TEXT,
  -- System generated insight
  UNIQUE(patient_id, score_date)
);

-- Doctor Notes
CREATE TABLE doctor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'observation',
  is_visible_to_patient BOOLEAN DEFAULT TRUE,
  is_visible_to_family BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (UPDATED v2.2)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  appointment_type TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  pre_visit_report_generated BOOLEAN DEFAULT FALSE,
  -- NEW v2.2: Track if pre-visit preparation was generated
  post_visit_notes TEXT,
  -- NEW v2.2: What doctor said, instructions given
  follow_up_tasks JSONB DEFAULT '[]',
  -- NEW v2.2: List of tasks from this visit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor Visit Preparation (NEW v2.2)
CREATE TABLE visit_preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  reports_to_carry JSONB DEFAULT '[]',
  -- List of report IDs and names to carry
  symptoms_to_mention JSONB DEFAULT '[]',
  -- New or changed symptoms since last visit
  questions_to_ask JSONB DEFAULT '[]',
  -- AI-generated questions based on current anomalies
  what_doctor_will_check JSONB DEFAULT '[]',
  -- Based on specialty and current findings
  medications_to_discuss JSONB DEFAULT '[]',
  -- Side effects, compliance issues
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_by_patient BOOLEAN DEFAULT FALSE
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT,
  priority TEXT DEFAULT 'normal',
  -- 'low', 'normal', 'high', 'urgent', 'critical'
  -- NEW v2.2: 'critical' for bidirectional critical value alerts
  is_read BOOLEAN DEFAULT FALSE,
  requires_acknowledgment BOOLEAN DEFAULT FALSE,
  -- NEW v2.2: Critical alerts must be acknowledged
  acknowledged_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.6 Gamification Tables

```sql
-- Streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_logged_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ,
  is_achieved BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Daily Health Scores
CREATE TABLE daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  total_score INTEGER DEFAULT 0,
  water_score INTEGER DEFAULT 0,
  medication_score INTEGER DEFAULT 0,
  exercise_score INTEGER DEFAULT 0,
  diet_score INTEGER DEFAULT 0,
  sleep_score INTEGER DEFAULT 0,
  posture_score INTEGER DEFAULT 0,
  UNIQUE(patient_id, score_date)
);
```

---

### 5.7 Row Level Security Policies

```sql
-- Patients see only their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Family read access
ALTER TABLE lab_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family read lab parameters" ON lab_parameters
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM family_members
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = TRUE
      AND access_level >= 2
    )
    OR patient_id = auth.uid()
  );

-- Symptom logs — patient full, family restricted
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Symptom logs access" ON symptom_logs
  FOR SELECT USING (
    patient_id = auth.uid()
    OR (
      symptom_category NOT IN ('urinary', 'intimate')
      AND patient_id IN (
        SELECT patient_id FROM family_members
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = TRUE
        AND access_level >= 2
      )
    )
  );

-- Injection courses visible to family
ALTER TABLE injection_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Injection course access" ON injection_courses
  FOR SELECT USING (
    patient_id = auth.uid()
    OR patient_id IN (
      SELECT patient_id FROM family_members
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = TRUE
    )
  );

-- Side effect logs — patient and doctor only
ALTER TABLE medication_side_effect_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Side effect logs access" ON medication_side_effect_logs
  FOR SELECT USING (
    patient_id = auth.uid()
    OR patient_id IN (
      SELECT patient_id FROM doctors
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Visit preparations — patient and relevant doctor
ALTER TABLE visit_preparations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visit preparation access" ON visit_preparations
  FOR SELECT USING (
    patient_id = auth.uid()
    OR doctor_id IN (
      SELECT id FROM doctors
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Critical notifications cannot be deleted
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications access" ON notifications
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Cannot delete critical" ON notifications
  FOR DELETE USING (
    patient_id = auth.uid()
    AND priority != 'critical'
  );
```

---

## 6. FEATURE SPECIFICATIONS

### 6.1 Onboarding Flow

**Step 1 — Welcome**
- WellNest branding
- Sign up with email OTP or Google OAuth

**Step 2 — Basic Profile**
- Name, date of birth, gender, height, weight
- Profile photo optional

**Step 3 — First Report Upload**
- Upload any medical report
- Auto-detection runs immediately
- User confirms or corrects detected type
- Full processing pipeline runs

**Step 4 — Review Auto-Generated Profile**
- Extracted findings shown
- Anomalies highlighted
- Initial health plan presented
- Condition connections shown

**Step 5 — Add Your Circle (Optional)**
- Invite family members
- Add doctors with specialty

**Step 6 — Medications and Restrictions**
- Add medications
- Configure injection courses if applicable
- Add restrictions

**Step 7 — Notification Preferences**
- Set wake time, meal times, sleep time
- Posture reminder interval

---

### 6.2 Home Dashboard

**Daily Health Score (0-100)**
- Water: 20 points
- Medications: 25 points
- Exercise: 20 points
- Diet: 20 points
- Posture: 15 points

**Quick Actions:**
- Add Water
- Log Symptom (with backdating option)
- Mark Medication
- I Just Stood Up (posture)
- Log Urine Color

**Active Alerts (priority ordered):**
- Critical lab values requiring acknowledgment
- Surgical urgency in new report
- Missed medications
- Injection course day reminder
- Activity restriction warning
- Prolonged sitting warning

**Today's Schedule**
- All reminders for today
- Injection course day highlighted

**Condition Connection Daily Highlight**
- One connection rotated daily

**Family Activity**
- Who checked in today
- Latest messages
- Family impact note

---

### 6.3 Report Intelligence Engine

#### 6.3.1 Auto Report Type Detection (NEW v2.2)

Before any processing begins — Claude identifies what the report is.

**Detection Prompt:**
```
Identify the type of this medical report.

Return JSON:
{
  detected_type: string,
  -- One of: 'blood_test', 'urine_analysis', 'mri_lumbar',
  -- 'mri_cervical', 'mri_thoracic', 'mri_whole_spine',
  -- 'mri_brain', 'ct_scan', 'ultrasound_abdomen',
  -- 'ultrasound_pelvis', 'xray_chest', 'xray_spine',
  -- 'echo_cardiac', 'ecg', 'endoscopy_upper_gi',
  -- 'endoscopy_lower_gi', 'uroflowmetry', 'ncs_emg',
  -- 'dexa', 'other_lab', 'other_imaging'
  confidence: number (0 to 1),
  key_indicators: string[],
  -- Words that led to this detection
  suggested_label: string,
  -- Human readable e.g. 'MRI Lumbar Spine — March 2026'
  pipeline: 'lab' | 'imaging'
  -- Which processing pipeline to use
}

Return JSON only.
```

**User Experience:**
- Upload report
- Spinner: "Reading your report..."
- Result: "We detected this as: MRI Lumbar Spine. Is that correct?"
- Confirm → Processing continues
- Change → User selects from list
- System learns from corrections over time

---

#### 6.3.2 Lab Report Pipeline
See v2.1 Section 6.3.1 — unchanged.

Added: Critical status now splits into `critical_low` and `critical_high` with specific action guidance per status.

---

#### 6.3.3 Imaging Report Pipeline
See v2.1 Section 6.3.2 — unchanged.

Added: `spinal_level` and `spinal_region` fields for whole spine visual map rendering.

---

### 6.4 Condition Connection Engine
See v2.1 Section 6.4 — unchanged.

---

## 7. REPORT INTELLIGENCE ENGINE

See v2.1 Section 7 for full Claude prompts.

### 7.1 Critical Value Alert System (UPDATED v2.2)

**Critical High (value dangerously above range):**
| Parameter | Critical High Threshold | Action |
|---|---|---|
| Creatinine | > 4.0 mg/dL | Contact doctor today |
| Potassium | > 6.5 mmol/L | Emergency |
| Sodium | > 155 mmol/L | Emergency |
| Glucose | > 400 mg/dL | Emergency |
| Troponin | > 34.2 pg/mL | Emergency |
| Any parameter | >50% above ref max | Contact doctor today |

**Critical Low (value dangerously below range):**
| Parameter | Critical Low Threshold | Action |
|---|---|---|
| Sodium | < 125 mmol/L | Emergency |
| Potassium | < 2.5 mmol/L | Emergency |
| Hemoglobin | < 7 g/dL | Contact doctor today |
| BUN | < 6 mg/dL | Monitor + context check |
| Glucose | < 50 mg/dL | Emergency |
| Any parameter | >50% below ref min | Contact doctor today |

**Alert Behaviour for Critical Values:**
- Cannot be dismissed without acknowledgment
- Family notified regardless of access level
- Doctor notified immediately
- Shown in red persistent banner on home screen
- Removed only after patient acknowledges
- Log of acknowledgment stored

**Context-Aware Guidance:**
System provides context before alarming patient:

```
Example: BUN 6.6 (Critical Low)
System checks: Patient was fasting for Ramadan?
               Recent large fluid intake?
Context note: "This may be related to low protein
              intake or high fluid consumption.
              However please mention this to your
              doctor at your next visit."
Action: 'monitor' not 'emergency'

vs

Sodium 118 (Critical Low)
No context explains this
Action: 'emergency' — go to hospital
```

---

## 8. CONDITION CONNECTION ENGINE
See v2.1 Section 8 — unchanged.

---

## 9. NEW FEATURES — v2.2 ADDITIONS

---

### 9.1 Symptom History Backdating (NEW v2.2)

#### The Problem This Solves
Patients often dismiss early symptoms as minor issues (e.g., "muscle problem") and only seek help when symptoms worsen. By the time they log symptoms in WellNest, their medical history appears incomplete — hiding the true duration and progression of conditions.

#### Feature Specification

**When Logging a Symptom:**
- Primary question: "When did this symptom start?"
- Options:
  - Today (default)
  - This week — shows past 7 days
  - This month — shows past 30 days
  - Earlier — date picker opens
- If past date selected: `is_backdated = true`
- `onset_date` = selected past date
- `logged_at` = now (when entered in app)

**Backdated Symptom Display:**
- Shown on timeline with correct onset date
- Labelled: "Onset: March 2025 • Logged: April 2026"
- Timeline shows gap between onset and logging
- Doctor sees true onset date — not log date

**Symptom Timeline View:**
```
Right leg weakness
────────────────────────────────────────────
Mar 2025        Sep 2025        Apr 2026
[Onset]         [Still present] [Logged in app]
Severity: 3     Severity: 3     Severity: 4

Urinary frequency
────────────────────────────────────────────
                                Mar 2026
                                [Onset + Logged]
Severity: 6
```

**Clinical Value:**
- Neurologist sees right leg symptom predated urinary symptoms by 1 year
- Confirms neuropathy preceded bladder involvement
- Helps establish disease progression timeline
- Critical for accurate diagnosis and prognosis

---

### 9.2 Symptom Severity Progression Tracking (NEW v2.2)

#### Feature Specification

**Automatic Aggregation:**
When a symptom is logged multiple times:
- `symptom_progression` table updated automatically
- `first_onset_date` = earliest recorded onset
- `current_severity` = most recent severity
- `baseline_severity` = severity at first onset
- `trend` = calculated direction

**Progression View:**
- Per-symptom trend graph over time
- Severity on Y axis, time on X axis
- Baseline marker shown
- Key events overlaid:
  - "Started B12 injections" → April 2026
  - "Started Febugenix" → April 2026
  - "MRI confirmed L4-L5" → March 2026
- Visual correlation between treatment start and symptom improvement

**Progression Summary Card:**
```
Right Leg Weakness
Started: March 2025 (estimated)
Current severity: 4/10
Baseline severity: 3/10
Trend: Stable (treatment just started)
Total episodes logged: 3
Expected improvement: 3-6 months on B12

Urinary Frequency
Started: March 2026
Current severity: 6/10
Baseline: 6/10
Trend: Early — monitoring
Total episodes logged: 47
Peak: Office, cold AC, afternoon
```

**Doctor View:**
- All symptom progressions in chronological order
- Severity heatmap per symptom
- Correlation with treatment timeline
- Exportable for clinical records

---

### 9.3 Injection Course Manager (NEW v2.2)

#### Feature Specification

**Course Setup:**
- Medication name
- Total number of doses (e.g., 5)
- Frequency: Daily / Alternate days / Weekly
- Start date
- Auto-calculates end date
- Post-course transition medication (optional)
  - e.g., "After 5 Bifomec injections → start oral Methylcobalamin"

**Course Progress Display:**
```
Bifomec Injection Course
━━━━━━━━━━━━━━━━━━━━━━━━
💉 B12 1500mcg — Nerve Recovery

Day 1 ✓  Day 2 ✓  Day 3 ✓  Day 4 ○  Day 5 ○
Apr 1    Apr 3    Apr 5    Apr 7    Apr 9

Progress: 3 of 5 complete
Next dose: April 7, 2026
Estimated completion: April 9, 2026

Post-course: Switch to oral Methylcobalamin
```

**Injection Day Reminders:**
- Morning reminder on injection days
- "Arrange nurse for Bifomec injection today — Day 4 of 5"
- Reminder includes who typically administers
- Snooze option (max 2 hours)

**Per-Dose Log:**
- Mark dose as administered
- Record who gave it (nurse, doctor, self)
- Note injection site
- Log any immediate side effects
- Time of administration recorded

**Course Completion:**
- Milestone celebration on final dose
- Family notification
- Doctor notification
- Auto-activate post-course medication reminder
- Prompt: "Schedule follow-up B12 blood test in 6 weeks"

**Course History:**
- All past courses listed
- Compliance rate per course
- Any side effects recorded
- Outcome: "B12 normalised after this course"

---

### 9.4 Environmental Trigger Tracking (NEW v2.2)

#### Feature Specification

**Environment Capture on Every Symptom Log:**
```
When logging any symptom — quick capture:

Temperature: [❄️ Cold AC] [🌡️ Room Temp] [☀️ Hot]
Location:    [🏠 Home] [🏢 Office] [🌳 Outdoor] [✈️ Travel]
Activity:    [🪑 Sitting] [🚶 Walking] [🍽️ Post-meal] [😴 Resting]
```

One tap per category — added to symptom metadata.

**Correlation Analysis Engine:**
Runs weekly — looks for patterns:

```
Urinary Frequency Correlations:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment    Avg Episodes    vs Baseline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cold AC         8.2 / day      +40% higher 🔴
Room temp       5.1 / day      Baseline
Hot / outdoor   4.8 / day      -6% lower  ✅

Location        Avg Episodes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Office          8.4 / day 🔴
Home            4.6 / day ✅

Time of day     Peak hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Peak:           1 PM - 5 PM
Lowest:         10 PM - 6 AM
```

**Trigger Insights:**
- "Cold AC is your strongest trigger — 40% more episodes"
- "Your symptoms improve significantly on work-from-home days"
- "Post-lunch is your highest frequency window"

**Doctor Report Integration:**
Environmental trigger data included in doctor visit report:
- Urologist sees AC correlation
- Helps explain neurogenic bladder pattern
- Guides workplace accommodation advice

---

### 9.5 Doctor Visit Preparation Assistant (NEW v2.2)

#### Feature Specification

**Trigger:**
- 24 hours before any scheduled appointment
- Or patient taps "Prepare for Visit" on appointment card

**Auto-Generated Preparation Guide:**
Claude analyses all data since last visit with this doctor and generates:

**Section 1 — What to Carry:**
```
Reports since last visit:
✓ MRI Lumbar Spine — March 31, 2026 (NEW)
✓ NCS Report — March 31, 2026 (NEW)
✓ KFT Apollo — March 29, 2026 (NEW)
✓ Pharmacy bill — March 31, 2026

Bring all previous reports too for reference
```

**Section 2 — What to Mention:**
```
New symptoms since last visit:
• Right leg weakness — backdated onset March 2025
  (dismissed as muscle issue at the time)
• Urinary frequency started March 24 — continues
• Mild brown urine after first Bifomec injection
  (resolved — vitamin B12/Niacinamide related)

Changes in existing symptoms:
• Urinary frequency: Still present, 6-8 times/day
• Cold AC correlation confirmed at office
```

**Section 3 — Questions to Ask:**
```
Based on your current findings, ask:
1. Is my eGFR truly reduced or was it Ramadan-affected?
   (Repeat test context needed)
2. Does the right leg symptom history change my
   B12 treatment duration or approach?
3. Do I need a physiotherapy referral for L4-L5?
4. Should I use a lumbar support belt at office?
5. Is the cold AC correlation clinically significant?
6. When should I repeat the NCS to check nerve improvement?
7. Can I restart Bladmir 50mg for bladder symptoms?
```

**Section 4 — What Doctor Will Likely Do:**
```
Based on specialty (Nephrology) and your findings:
• Review new MRI and NCS reports
• Possibly order repeat kidney function tests
• Check Bifomec injection course completion
• Review uric acid response to Febugenix
• May adjust medication dosage
• Likely discuss physiotherapy referral
```

**Post-Visit Logger:**
After appointment:
- What doctor said (free text)
- New prescriptions (auto-add to medications)
- New restrictions (auto-add to restrictions)
- Follow-up instructions
- Next appointment date
- Tests ordered

---

### 9.6 Medication Side Effect Monitor (NEW v2.2)

#### Feature Specification

**Side Effect Library:**
Each medication in the system has a curated list of known side effects with:
- Frequency (common / uncommon / rare)
- Typical onset (immediate / days / weeks)
- Duration (temporary / persistent)
- Severity (mild / moderate / serious)
- Action guidance (continue / monitor / contact doctor / stop)

**User Interaction — Two Paths:**

**Path A: "I Read About a Side Effect"**
```
User opens Bladmir and sees side effects list
Taps: "I'm worried about: Increased heart rate"

System responds:
"This side effect occurs in about 10% of users.
It is usually mild and temporary — resolving within
2 weeks as your body adjusts.

Since you haven't actually experienced it yet:
→ Take your prescribed dose as directed
→ If you do feel palpitations: note the time and
  how long it lasted
→ Only contact doctor if: heart rate exceeds 100bpm
  at rest or you feel dizzy or breathless

Your LVEF is 67% and your ECG was normal — 
you have a healthy heart which reduces this risk."

Logged as: source = 'read_about'
```

**Path B: "I Experienced a Side Effect"**
```
User reports: "I felt dizzy after Febugenix"

System asks:
- When did it happen?
- How long did it last?
- How severe? (1-10)
- Did it resolve on its own?

System responds based on severity and medication:
Mild (1-4): "This can happen when starting Febugenix.
            Continue taking it. Log again if it persists."

Moderate (5-7): "Please mention this to Dr. Rajendra
               Prasad at your next visit. Continue
               medication unless symptoms worsen."

Severe (8-10): "Stop Febugenix and contact your
              doctor today. Do not restart without
              medical advice."

Logged as: source = 'experienced'
Doctor notified if moderate or severe
```

**Side Effect Dashboard:**
- All active medications
- Known side effects listed
- Any logged side effects highlighted
- Trend: resolving / persistent / new
- Doctor can view all side effect logs

---

### 9.7 Urine Color Visual Logger (NEW v2.2)

#### Feature Specification

**Visual Color Scale:**
Eight color swatches rendered accurately:
```
1. Transparent/Clear
2. Very Pale Yellow (ideal)
3. Pale Yellow (normal)
4. Yellow (normal, slightly concentrated)
5. Amber/Dark Yellow (low fluid)
6. Orange (very low fluid OR vitamin B12 injection)
7. Light Brown (possible medication, monitor)
8. Dark Brown/Cola (contact doctor)
9. Pink/Red (contact doctor immediately)
```

**Tap to Select Today's Color**

**Context-Aware Guidance:**

```
Clear:
"Very well hydrated! Your kidneys are working well.
If this is constant, make sure you are meeting your
2.5L target — not exceeding it too much."

Pale Yellow ✅:
"This is ideal. Your hydration is perfect."

Orange (after injection day):
"This is completely normal after your Bifomec B12
injection. The Niacinamide and Methylcobalamin are
being excreted — harmless and temporary. Should
return to pale yellow within 24-48 hours."

Light Brown:
"This could be:
• Bifomec injection effect (if injected today) — normal
• Dehydration — drink more water now
• Other cause — monitor over next 2 urinations
If it does not clear within 24 hours, contact
Dr. Rajendra Prasad."

Dark Brown / Cola:
"⚠️ Please contact Dr. Rajendra Prasad today.
This color needs medical assessment.
Doctor contact: [stored number]"

Pink / Red:
"🔴 Please contact your doctor immediately or
go to the nearest emergency room.
Blood in urine needs urgent evaluation."
```

**Trend Graph:**
- Color logged over past 7 days as colored dots
- Timeline shows injection days
- Shows correlation between injection days and color change
- Family can see (if patient permits — default off)

**Streak:**
"5 days of pale yellow — excellent hydration! 💧"

---

### 9.8 Sleep Position Guidance System (NEW v2.2)

#### Feature Specification

**Condition-Based Recommendation Engine:**
System reads patient's active conditions and generates position recommendation:

```
Your conditions:
- L4-L5 disc bulge (lumbar)
- GERD Grade A + Hiatus Hernia Grade II

Recommended sleep position:
Left side with pillow between knees

Why:
• Side sleeping with pillow between knees
  keeps spine aligned and reduces L4-L5 disc pressure
• Left side sleeping preferred for GERD —
  reduces acid reflux due to stomach anatomy
• Head elevation 6-8 inches recommended for hiatus hernia
• Avoid sleeping on stomach — hyperextends lumbar spine

Avoid:
• Stomach sleeping — worsens lumbar disc
• Flat on back without knee support
• Right side for extended periods (worsens GERD)
```

**Morning Check-In:**
Simple question on wake:
- "How did you sleep?"
- Select position used
- Rate quality 1-5
- Note: Head elevated? Pillow between knees?

**Compliance Tracking:**
- Daily compliance: Used recommended position (yes/no)
- Weekly compliance percentage
- Streak: consecutive nights correct position
- Correlation: Better sleep quality on compliant nights

**Education Cards:**
Rotating tips related to conditions:
- "Why left side helps your GERD"
- "How pillow between knees protects your L4-L5 disc"
- "Why stomach sleeping is harmful for disc patients"

---

### 9.9 Family Encouragement Impact Tracking (NEW v2.2)

#### Feature Specification

**Data Collection:**
- Every family check-in logged in `family_engagement_logs`
- Patient's health score for that day captured
- Correlation calculated weekly

**Patient-Side Display:**
```
Today your family checked in 3 times 💕
Wife • Father • Brother

Your average health score on days your family
checks in: 76/100

Your average health score on other days: 58/100

Family support is making a measurable difference
in your health journey 🌟
```

**Family-Side Display:**
```
Your engagement this week:
You checked in: 5 of 7 days

Your impact:
On days you checked in — Abdul Aleem's score: 74
On days without check-in — Abdul Aleem's score: 61

Your support is genuinely helping his recovery 💪
```

**Privacy:**
- Patient can turn this feature off
- Family sees their own impact only — not other members
- Aggregate only — no session-level detail shown

---

### 9.10 Whole Spine Visual Map (NEW v2.2)

#### Feature Specification

**Interactive SVG Spine Diagram:**
Rendered as custom SVG with clickable regions:

```
CERVICAL (C1-C7)
  C1 ○ Normal
  C2 ○ Normal
  C3 ○ Normal
  C4 ● Mild (disc bulge)
  C5 ● Mild (disc bulge + osteophytes)
  C6 ● Mild (disc bulge + osteophytes)
  C7 ○ Normal

THORACIC (D1-D12)
  D1-D7  ○ Normal
  D8     ● Mild (disc bulge)
  D9     ● Mild (disc bulge + Schmorl's node)
  D10    ● Mild (disc bulge)
  D11-D12 ○ Normal

LUMBAR (L1-L5)
  L1 ○ Normal
  L2 🟡 Mild (foraminal protrusion left)
  L3 🟠 Moderate (disc bulge + protrusion)
  L4 🔴 Significant (bilateral + facet arthrosis)
  L5 🟡 Mild (disc bulge)

SACRAL
  S1 ○ Normal
  S2 ○ Normal
```

**Colour Coding:**
- ○ Grey: Normal
- 🟢 Green: Mild, no nerve involvement
- 🟡 Yellow: Mild with possible nerve involvement
- 🟠 Orange: Moderate, nerve involvement confirmed
- 🔴 Red: Significant, bilateral involvement
- 💀 Dark Red: Critical — surgical urgency

**Tap Any Level:**
```
L4-L5 (tapped):
━━━━━━━━━━━━━━━
Finding: Diffuse disc bulge with bilateral
         facet arthrosis

Severity: Significant 🔴

Nerves affected: L5 bilateral

Plain language:
"The disc between your 4th and 5th lumbar
vertebrae is bulging outward and pressing on
nerve roots on both sides. The small joints
on either side also show early wear. This is
your most significant spinal finding."

Possible symptoms:
• Urinary urgency / frequency
• Leg pain or weakness (both sides)
• Lower back pain
• Foot and ankle weakness

Found in: MRI Lumbar Spine — March 31, 2026

Trend: New finding
```

**Comparison View:**
When multiple spine MRIs exist:
- Side-by-side spine maps for two dates
- Colour changes highlighted
- "L4-L5 changed from Moderate to Significant"
- "C5-C6 improved from Mild to Normal"

**Export:**
- Spine map exported as image in doctor visit report
- Shows complete spinal picture at a glance

---

## 10. API INTEGRATIONS

### 10.1 Claude API
- Purpose: Report type detection, lab parsing, imaging parsing, condition connections, visit preparation, side effect guidance
- Model: claude-sonnet-4-5 (latest available)
- Usage: On report upload, on appointment creation, on side effect query
- Cost: Approximately $0.01-0.15 per interaction depending on complexity
- Fallback: Manual entry if API fails

### 10.2 Supabase
- Database, Auth, Storage, Realtime, Edge Functions
- See Section 4 for details

### 10.3 Web Push Notifications
- All reminders and alerts
- Critical alerts bypass quiet hours

### 10.4 Future Integrations (v3+)
- Apple HealthKit / Google Fit
- Smartwatch integration
- WhatsApp Business API

---

## 11. NOTIFICATION SYSTEM

### 11.1 Patient Notifications

**All v2.1 notifications retained — additions below:**

**Injection Course Notifications (NEW v2.2):**
| Trigger | Message |
|---|---|
| Injection day (alternate) | "💉 Bifomec injection today — Day {x} of {n}. Arrange with nurse" |
| 2 days before course ends | "Almost done! 2 injections remaining in your B12 course" |
| Course completion | "🎉 B12 injection course complete! Schedule follow-up test in 6 weeks" |
| Post-course med start | "Time to start oral Methylcobalamin — your maintenance dose" |

**Side Effect Notifications (NEW v2.2):**
| Trigger | Message |
|---|---|
| Moderate side effect logged | "Side effect noted for {med} — added to your doctor visit summary" |
| Severe side effect logged | "⚠️ Please contact Dr. {name} today about your {med} side effect" |
| 'Read about' side effect | "Understanding {side effect} — tap for personalised guidance" |

**Critical Value Notifications (NEW v2.2):**
| Type | Message |
|---|---|
| Critical High | "🔴 {Parameter} is critically high in your new report. Contact doctor today. Tap to acknowledge." |
| Critical Low | "🔴 {Parameter} is critically low in your new report. {Context-aware action}. Tap to acknowledge." |
| Surgical urgency | "⚠️ Your new {imaging type} report has a finding that needs medical attention today." |

**Visit Preparation (NEW v2.2):**
| Trigger | Message |
|---|---|
| 24 hrs before appointment | "📋 Your visit with Dr. {name} is tomorrow. Preparation guide is ready!" |
| 2 hours before | "⏰ Appointment in 2 hours. Have you reviewed your preparation guide?" |
| After visit | "How did your visit go? Log what Dr. {name} said to keep your health timeline complete." |

**Sleep Position (NEW v2.2):**
| Trigger | Message |
|---|---|
| Bedtime | "🛏️ Tonight: Sleep on left side, pillow between knees — protects your L4-L5 disc" |
| Morning | "Good morning! How did you sleep? Log your position to track compliance 😴" |

### 11.2 Family Notifications (Additions)

| Trigger | Message |
|---|---|
| Injection course complete | "🎉 {Name} completed their B12 injection course!" |
| Critical value (access level 3) | "⚠️ {Name} has a critical lab value — please check in" |
| Visit preparation ready | "{Name} has a doctor's appointment tomorrow. Encouragement welcome 💪" |
| Family impact weekly | "Your check-ins raised {Name}'s health score by 18 points this week 💕" |

### 11.3 Doctor Notifications (Additions)

| Trigger | Message |
|---|---|
| Severe side effect | "Patient {name} reported severe side effect for {medication}" |
| Critical lab value | "Critical value detected in new report for {name}: {parameter} = {value}" |
| Pre-visit summary | "Pre-visit summary ready for {name} — appointment tomorrow" |
| Injection course complete | "{name} completed {medication} injection course" |

---

## 12. PRIVACY AND SECURITY

### 12.1 Data Ownership
- Patient owns 100% of health data
- Never sold or shared
- Full data export anytime
- Account deletion on request

### 12.2 Access Control
- Row Level Security at database level
- Family access revocable instantly
- Doctor access revocable instantly
- Audit log of all access
- Critical notifications require acknowledgment

### 12.3 Authentication
- OTP-based login
- Google OAuth option
- Biometric on supported devices
- Session timeout: 30 min web
- Persistent mobile with biometric

### 12.4 Data Encryption
- All data encrypted at rest
- HTTPS enforced
- API keys server-side only

### 12.5 Compliance
- HIPAA-aligned
- GDPR-compliant
- Data residency selectable

---

## 13. DEVELOPMENT ROADMAP

### Phase 1 — Foundation (Weeks 1-4)
**Goal: Working app the patient uses daily**

- [ ] Project setup: React + Vite + TypeScript + Tailwind
- [ ] Supabase schema (all tables including v2.2)
- [ ] Authentication
- [ ] Basic profile
- [ ] Home dashboard with health score
- [ ] Medication tracker with daily logging
- [ ] Injection course manager (NEW v2.2)
- [ ] Water intake tracker
- [ ] Symptom logger with backdating (NEW v2.2)
- [ ] Urine color visual logger (NEW v2.2)
- [ ] Activity restriction display
- [ ] Posture sit-stand timer
- [ ] Sleep position logger (NEW v2.2)
- [ ] Push notifications
- [ ] Deploy to Vercel

**Deliverable:** Patient uses app daily with complete symptom history and injection tracking

---

### Phase 2 — Intelligence (Weeks 5-8)
**Goal: Report upload and anomaly detection**

- [ ] Auto report type detection (NEW v2.2)
- [ ] Lab report Claude parsing
- [ ] Imaging report Claude parsing
- [ ] Critical value bidirectional alerts (NEW v2.2)
- [ ] Parameter extraction and storage
- [ ] Imaging findings with spine levels
- [ ] Whole spine visual map (NEW v2.2)
- [ ] Symptom severity progression tracking (NEW v2.2)
- [ ] Environmental trigger tracking (NEW v2.2)
- [ ] Condition connection engine
- [ ] Health plan generation
- [ ] Exercise tracker with restrictions
- [ ] Physiotherapy tracker
- [ ] Medication side effect monitor (NEW v2.2)
- [ ] Full posture tracker

**Deliverable:** Upload any report — auto-detected, parsed, mapped to spine, triggers and progressions tracked

---

### Phase 3 — Circle (Weeks 9-12)
**Goal: Family and doctor access**

- [ ] Family invitation system
- [ ] Family dashboard with spine map summary
- [ ] Family impact tracking (NEW v2.2)
- [ ] Access level configuration
- [ ] Real-time updates
- [ ] Family messaging
- [ ] Multi-specialist doctor portal
- [ ] Specialty-filtered views
- [ ] Doctor restriction management
- [ ] Physiotherapy prescription
- [ ] Doctor notes
- [ ] Health target management
- [ ] Doctor visit preparation assistant (NEW v2.2)
- [ ] Post-visit logger (NEW v2.2)
- [ ] Doctor visit report PDF
- [ ] Appointment calendar

**Deliverable:** Full connected care — patient, family, multiple specialists all coordinated

---

### Phase 4 — Polish (Weeks 13-16)
**Goal: Production-ready**

- [ ] PWA installable
- [ ] Offline mode with sync
- [ ] Complete streak and milestone system
- [ ] Weight tracking
- [ ] Advanced pattern analysis
- [ ] Report comparison view
- [ ] Full notification system
- [ ] Performance optimisation
- [ ] Dark mode
- [ ] Onboarding polish
- [ ] Accessibility audit

**Deliverable:** App ready to share with others

---

### Phase 5 — Scale (Month 5+)
- [ ] Multi-language support
- [ ] Smartwatch integration
- [ ] App Store / Play Store
- [ ] Admin dashboard

---

## 14. SUCCESS METRICS

### Product Health Metrics
| Metric | Target (3 months) |
|---|---|
| Daily active usage | 7 days per week |
| Medication compliance logged | >90% of days |
| Injection course completion | 100% per course |
| Reports uploaded | At least 1 per month |
| Auto-detection accuracy | >95% correct type |
| Posture breaks taken | >6 per work day |
| Sleep position compliance | >80% of nights |
| Family members active | At least 2 weekly |
| Doctor visit prep used | Every appointment |
| Side effect logs | All experienced effects |

### Health Outcome Metrics
Patient-specific targets set at onboarding.
Generic examples:
- Abnormal lab parameters trending toward normal
- Symptom frequency reducing over time
- Symptom progression showing improvement
- Environmental triggers reducing in impact
- Medication compliance improving
- Sleep position compliance increasing
- Posture compliance improving

---

## 15. FOLDER STRUCTURE

```
wellnest/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── CircularProgress.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ColorPicker.tsx          # NEW v2.2 — urine color
│   │   │   ├── BodyDiagram.tsx
│   │   │   └── SpineMap.tsx             # NEW v2.2 — whole spine SVG
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   └── features/
│   │       ├── dashboard/
│   │       ├── medications/
│   │       │   ├── MedicationList.tsx
│   │       │   ├── InjectionCourse.tsx          # NEW v2.2
│   │       │   ├── InjectionCourseLog.tsx       # NEW v2.2
│   │       │   └── SideEffectMonitor.tsx        # NEW v2.2
│   │       ├── symptoms/
│   │       │   ├── SymptomLogger.tsx
│   │       │   ├── BackdateSelector.tsx         # NEW v2.2
│   │       │   ├── EnvironmentCapture.tsx       # NEW v2.2
│   │       │   ├── UrineColorLogger.tsx         # NEW v2.2
│   │       │   ├── SymptomProgression.tsx       # NEW v2.2
│   │       │   ├── NeurologicalSymptoms.tsx
│   │       │   └── SpinalSymptoms.tsx
│   │       ├── water/
│   │       ├── exercise/
│   │       │   ├── ExerciseLogger.tsx
│   │       │   ├── PhysiotherapyTracker.tsx
│   │       │   ├── SafeExerciseList.tsx
│   │       │   └── RestrictionWarning.tsx
│   │       ├── diet/
│   │       ├── reports/
│   │       │   ├── ReportUpload.tsx
│   │       │   ├── ReportTypeDetector.tsx       # NEW v2.2
│   │       │   ├── LabReportView.tsx
│   │       │   ├── ImagingReportView.tsx
│   │       │   ├── CriticalValueAlert.tsx       # NEW v2.2
│   │       │   └── WholeSpineMap.tsx            # NEW v2.2
│   │       ├── conditions/
│   │       │   ├── ConditionWeb.tsx
│   │       │   ├── ConditionCard.tsx
│   │       │   └── ConnectionDetail.tsx
│   │       ├── posture/
│   │       │   ├── PostureTracker.tsx
│   │       │   ├── SitStandTimer.tsx
│   │       │   ├── PostureChecklist.tsx
│   │       │   └── SleepPositionLogger.tsx      # NEW v2.2
│   │       ├── restrictions/
│   │       │   ├── RestrictionsList.tsx
│   │       │   └── ActivityWarning.tsx
│   │       ├── appointments/                    # NEW v2.2
│   │       │   ├── AppointmentCard.tsx
│   │       │   ├── VisitPreparation.tsx         # NEW v2.2
│   │       │   └── PostVisitLogger.tsx          # NEW v2.2
│   │       ├── family/
│   │       │   ├── FamilyCircle.tsx
│   │       │   ├── FamilyDashboard.tsx
│   │       │   └── FamilyImpact.tsx             # NEW v2.2
│   │       ├── doctor/
│   │       │   ├── DoctorPortal.tsx
│   │       │   ├── NephrologyView.tsx
│   │       │   ├── UrologyView.tsx
│   │       │   ├── NeurologyView.tsx
│   │       │   └── CardiologyView.tsx
│   │       └── progress/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── MedicationsScreen.tsx
│   │   ├── SymptomsScreen.tsx
│   │   ├── WaterScreen.tsx
│   │   ├── ExerciseScreen.tsx
│   │   ├── DietScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── ImagingScreen.tsx
│   │   ├── ConditionsScreen.tsx
│   │   ├── PostureScreen.tsx
│   │   ├── AppointmentsScreen.tsx               # NEW v2.2
│   │   ├── FamilyScreen.tsx
│   │   ├── DoctorScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── healthStore.ts
│   │   ├── medicationStore.ts
│   │   ├── injectionStore.ts                    # NEW v2.2
│   │   ├── reportStore.ts
│   │   ├── imagingStore.ts
│   │   ├── postureStore.ts
│   │   ├── conditionStore.ts
│   │   ├── appointmentStore.ts                  # NEW v2.2
│   │   └── symptomProgressionStore.ts           # NEW v2.2
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── claudeApi.ts
│   │   ├── reportTypeDetector.ts                # NEW v2.2
│   │   ├── labReportParser.ts
│   │   ├── imagingReportParser.ts
│   │   ├── criticalValueChecker.ts              # NEW v2.2
│   │   ├── conditionConnections.ts
│   │   ├── visitPreparation.ts                  # NEW v2.2
│   │   ├── sideEffectGuidance.ts                # NEW v2.2
│   │   ├── sleepPositionRecommender.ts          # NEW v2.2
│   │   └── notifications.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useHealth.ts
│   │   ├── useMedications.ts
│   │   ├── useInjectionCourse.ts                # NEW v2.2
│   │   ├── useReports.ts
│   │   ├── useImaging.ts
│   │   ├── usePosture.ts
│   │   ├── useConditions.ts
│   │   ├── useSymptomProgression.ts             # NEW v2.2
│   │   ├── useEnvironmentalTriggers.ts          # NEW v2.2
│   │   └── useVisitPreparation.ts               # NEW v2.2
│   ├── utils/
│   │   ├── healthScore.ts
│   │   ├── anomalyDetection.ts
│   │   ├── criticalValueLogic.ts                # NEW v2.2
│   │   ├── imagingAnalysis.ts
│   │   ├── spineMapRenderer.ts                  # NEW v2.2
│   │   ├── conditionConnections.ts
│   │   ├── spineAnalysis.ts
│   │   ├── exerciseRestrictions.ts
│   │   ├── urineColorGuidance.ts                # NEW v2.2
│   │   ├── symptomBackdating.ts                 # NEW v2.2
│   │   ├── referenceRanges.ts
│   │   ├── dateHelpers.ts
│   │   └── formatters.ts
│   ├── types/
│   │   ├── health.types.ts
│   │   ├── user.types.ts
│   │   ├── report.types.ts
│   │   ├── imaging.types.ts
│   │   ├── injection.types.ts                   # NEW v2.2
│   │   └── appointment.types.ts                 # NEW v2.2
│   ├── constants/
│   │   ├── symptoms.ts
│   │   ├── imagingTypes.ts
│   │   ├── spineFindings.ts
│   │   ├── exerciseLibrary.ts
│   │   ├── urineColors.ts                       # NEW v2.2
│   │   ├── sideEffects.ts                       # NEW v2.2
│   │   ├── sleepPositions.ts                    # NEW v2.2
│   │   ├── criticalValues.ts                    # NEW v2.2
│   │   ├── medications.ts
│   │   └── referenceRanges.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_imaging_schema.sql
│   │   └── 003_v22_additions.sql                # NEW v2.2
│   ├── functions/
│   │   ├── detect-report-type/                  # NEW v2.2
│   │   ├── process-lab-report/
│   │   ├── process-imaging-report/
│   │   ├── check-critical-values/               # NEW v2.2
│   │   ├── generate-condition-connections/
│   │   ├── generate-visit-preparation/          # NEW v2.2
│   │   ├── generate-side-effect-guidance/       # NEW v2.2
│   │   └── send-notifications/
│   └── seed.sql
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 16. ENVIRONMENT VARIABLES

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API (server-side only via Supabase Edge Function)
CLAUDE_API_KEY=your_claude_api_key

# App Config
VITE_APP_NAME=WellNest
VITE_APP_URL=https://wellnest.vercel.app

# Feature Flags
VITE_ENABLE_IMAGING=true
VITE_ENABLE_CONDITION_WEB=true
VITE_ENABLE_POSTURE_TRACKER=true
VITE_ENABLE_INJECTION_COURSE=true
VITE_ENABLE_VISIT_PREP=true
VITE_ENABLE_SIDE_EFFECT_MONITOR=true
VITE_ENABLE_SPINE_MAP=true
VITE_ENABLE_SYMPTOM_BACKDATING=true
VITE_ENABLE_ENVIRONMENTAL_TRIGGERS=true
VITE_POSTURE_REMINDER_INTERVAL_MINUTES=45
```

---

## 17. README STARTER

```markdown
# 🪺 WellNest

> Your health. Your circle. Your journey.

WellNest is a universal personal health tracking platform.
Upload any medical report — blood test or imaging — track
daily health habits, and keep your family and doctors
informed and connected.

## What Makes WellNest Different

- 📊 Reads ANY report — auto-detects type, no user selection needed
- 🦴 Whole spine visual map — all levels, colour-coded by severity
- ⏮️ Backdated symptoms — log when symptoms actually started
- 📈 Symptom progression — track how symptoms change over treatment
- 💉 Injection course manager — day-by-day course tracking
- 🌡️ Environmental triggers — correlate cold AC with symptoms
- 📋 Visit preparation — AI-generated prep guide before every appointment
- 💊 Side effect monitor — distinguishes reading-about vs experiencing
- 🎨 Urine color logger — visual chart with context-aware guidance
- 🛏️ Sleep position guidance — condition-specific recommendations
- 🔔 Critical value alerts — bidirectional, cannot be dismissed
- 👨‍👩‍👧‍👦 Family impact tracking — measure how support affects health
- 👨‍⚕️ Multi-specialist portal — nephrologist, urologist, neurologist views
- 🏆 Streaks and milestones — motivation through achievement

## Tech Stack

- React 18 + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Claude API for report intelligence and visit preparation
- Vercel for hosting

## Getting Started

1. Clone the repository
   git clone https://github.com/yourusername/wellnest.git

2. Install dependencies
   cd wellnest && npm install

3. Set up environment variables
   cp .env.example .env.local

4. Run database migrations
   npx supabase db push

5. Start development server
   npm run dev

## PRD Version History

v2.0 — Generic platform foundation
v2.1 — Imaging reports, condition connections, posture, spine
v2.2 — Symptom backdating, injection courses, visit prep,
        side effects, urine color, spine map, critical alerts,
        environmental triggers, sleep guidance, family impact

## License
MIT
```

---

*WellNest PRD v2.2 — Complete & Definitive*
*Updated: April 2026*
*Status: Ready for Development — Upload to GitHub*

*All features from the full design conversation are now documented.*
*No known gaps remain.*
