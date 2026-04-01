# WellNest — Product Requirements Document
**Version 2.1 | April 2026**
**"Your health. Your circle. Your journey."**

---

## CHANGELOG — v2.0 → v2.1

| Section | Change | Reason |
|---|---|---|
| Report Intelligence | Added imaging report handling separately from lab reports | MRI reports have no numeric values — need different processing |
| Symptom Library | Added neurological and spine-specific symptoms | Disc disease causes specific symptom patterns |
| New Module | Posture and Activity Tracker | Lumbar straightening caused by posture — needs active tracking |
| New Feature | Condition Connection Web | Multiple conditions are interconnected — show patients why |
| Doctor Portal | Multi-specialist views per specialty | Nephrologist, Urologist, Spine Specialist see different data |
| Report Connections | Link imaging findings to symptoms | MRI finding at L4-L5 connects to bladder symptoms |
| Health Plans | Added spine-specific plan category | Disc disease requires specific exercise and posture guidance |
| Database Schema | Added 5 new tables | imaging_reports, imaging_findings, activity_restrictions, posture_logs, condition_connections |
| Notifications | Added spine and posture reminders | Sit-stand reminders, lumbar support, sleep position |
| Folder Structure | Added imaging, posture, restrictions feature folders | New modules need dedicated structure |

---

## TABLE OF CONTENTS

1. Product Overview
2. Design Philosophy
3. User Roles
4. Tech Stack
5. Database Schema
6. Feature Specifications
7. Report Intelligence Engine
8. Condition Connection Engine (NEW v2.1)
9. API Integrations
10. Notification System
11. Privacy and Security
12. Development Roadmap
13. Success Metrics
14. Folder Structure
15. Environment Variables
16. README Starter

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
- Connects conditions intelligently — shows patients how their health issues relate
- Brings family into the journey — not just a solo tracking app
- Speaks to doctors in clinical language — not just patients
- Builds a health timeline — not just point-in-time snapshots

---

## 2. DESIGN PHILOSOPHY

### Principles

**1. Generic First**
WellNest is not built for any specific condition. Any user with any health profile can onboard, upload their reports, and immediately get value. The system learns from what the user uploads.

**2. Report Intelligence**
The core engine reads any medical report — blood test, urine analysis, imaging report, ECG, MRI, nerve study, bone density, endoscopy — extracts all findings, compares against standards, and flags anomalies automatically. No manual entry required.

**3. Two Report Worlds**
Lab reports contain numeric values compared to reference ranges.
Imaging reports contain descriptive findings requiring different intelligence.
WellNest handles both with purpose-built processing pipelines.

**4. Dynamic Planning**
Health plans are not static. Every time a new report is uploaded, the system updates the user's health plan, celebrates improvements, flags regressions, and adjusts recommendations accordingly.

**5. Connected Care**
Health is not a solo journey. Family members and doctors are first-class citizens in WellNest. Each role has appropriate access — family sees progress and sends support, doctors see clinical data and add notes.

**6. Condition Connections**
Multiple health conditions in the same patient are often interconnected. WellNest surfaces these connections visually — helping patients understand WHY they need to follow recommendations, driving motivation through understanding.

**7. Privacy by Design**
Health data is the most sensitive personal data. Row-level security at database level. Patient controls exactly what each family member and doctor can see. No data sold or shared.

**8. Progressive Complexity**
New users see a simple, clean interface. Power features reveal themselves as users engage more. Never overwhelming on day one.

---

## 3. USER ROLES

### 3.1 Patient (Primary User)
The individual whose health is being tracked.

**Capabilities:**
- Full read and write access to own health data
- Upload and manage all medical reports (lab AND imaging)
- Log daily health activities
- Manage medications and activity restrictions
- Invite and manage family members
- Add and manage multiple specialist doctors
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
- Cannot edit any patient data
- Cannot see sections marked private by patient

**Onboarding:**
- Invited by patient via email or phone number
- Creates own account
- Access level set by patient
- Can be removed by patient at any time

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
| Symptom Details | 🔒 Patient controls |
| Weight | 🔒 Patient controls |
| Detailed Lab Values | 🔒 Patient controls |
| Bladder / Intimate Logs | ❌ Always private |
| Personal Notes | ❌ Always private |

---

### 3.3 Doctor
A licensed medical professional managing the patient's care.

**Capabilities:**
- View clinical data relevant to their specialty
- View medication compliance history
- View symptom frequency and patterns filtered by specialty
- View relevant imaging findings
- Add clinical notes visible to patient
- Update health targets for patient
- Set activity restrictions
- Receive auto-generated patient summaries
- Cannot see personal diary or private notes

**Specialty-Filtered Views:**

**Nephrologist View:**
- Kidney function parameters (Creatinine, eGFR, BUN, Urea)
- Uric acid trends
- Electrolytes
- Urine analysis results
- Medication compliance (kidney-related medications)
- Fluid intake logs

**Urologist View:**
- Urinary frequency logs with patterns
- Uroflowmetry data
- Post-void residual measurements
- Bladder diary (if patient permits)
- PSA if available
- Ultrasound findings related to urinary tract

**Neurologist / Spine Specialist View:**
- NCS results and trends
- MRI spine findings summary
- Imaging findings at each spinal level
- Symptom logs: leg pain, numbness, falls, weakness
- Exercise compliance
- Physiotherapy progress logs
- Activity restriction compliance

**Cardiologist View:**
- Lipid profile trends
- Cardiac markers (Troponin, hs-CRP)
- ECG findings
- Echo findings
- Blood pressure logs
- Exercise logs

**General / Any Specialty:**
- Full clinical summary
- All reports uploaded
- Complete medication list
- All symptoms logged

**Onboarding:**
- Invited by patient
- Specialty tagged on invite
- Default view filtered by specialty
- Receives weekly auto-summary

---

### 3.4 Admin (Internal — Future)
Platform administrator for support and moderation.
Not in scope for v1.

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
  -- 1: Score only, 2: Detailed view, 3: Alert access
  visibility_config JSONB DEFAULT '{}',
  -- Per-section visibility overrides
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
  -- 'nephrology', 'urology', 'neurology', 'spine',
  -- 'cardiology', 'general', 'other'
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
  -- 'daily', 'alternate_days', 'weekly', 'custom'
  schedule_config JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  refill_reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Water Intake Logs
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  fluid_type TEXT DEFAULT 'water',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptom Logs
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  symptom_category TEXT,
  -- 'urinary', 'neurological', 'spinal', 'digestive',
  -- 'cardiac', 'general', 'other'
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  -- Flexible field for symptom-specific data
  -- Urinary: {color, volume, urgency, location, ac_environment}
  -- Spinal: {location, radiation_pattern, worse_with, better_with}
  -- Neurological: {which_limb, sensation_type, duration}
  linked_finding_id UUID,
  -- Links to imaging_findings if symptom is related to MRI finding
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Logs
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  is_physiotherapy BOOLEAN DEFAULT FALSE,
  -- Separates doctor-prescribed PT from general exercise
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

-- Sleep Logs
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sleep_at TIMESTAMPTZ,
  wake_at TIMESTAMPTZ,
  duration_hours DECIMAL,
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  sleep_position TEXT,
  -- 'back', 'left_side', 'right_side', 'stomach'
  -- Relevant for spine patients
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.3 Lab Report Tables

```sql
-- Lab Reports (numeric value reports)
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL,
  -- 'blood_test', 'urine_analysis', 'other_lab'
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

-- Lab Parameters (individual numeric values)
CREATE TABLE lab_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  parameter_category TEXT,
  -- 'kidney', 'liver', 'blood', 'lipids', 'diabetes',
  -- 'thyroid', 'vitamins', 'cardiac', 'electrolytes',
  -- 'urine', 'hormones', 'other'
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
    'critical'
  )),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening', 'new')),
  plain_language_explanation TEXT,
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
  -- 'system', 'doctor', 'patient'
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
  -- 'diet', 'exercise', 'lifestyle', 'medication',
  -- 'followup', 'posture', 'physiotherapy', 'spine'
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

### 5.4 Imaging Report Tables (NEW v2.1)

```sql
-- Imaging Reports (descriptive finding reports — MRI, CT, Ultrasound, etc.)
CREATE TABLE imaging_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  imaging_type TEXT NOT NULL,
  -- 'mri_lumbar', 'mri_cervical', 'mri_thoracic',
  -- 'mri_whole_spine', 'mri_brain', 'mri_joint',
  -- 'ct_scan', 'ultrasound_abdomen', 'ultrasound_pelvis',
  -- 'xray_chest', 'xray_spine', 'echo_cardiac',
  -- 'endoscopy_upper_gi', 'endoscopy_lower_gi',
  -- 'uroflowmetry', 'ncs', 'dexa', 'other_imaging'
  body_region TEXT,
  -- 'lumbar_spine', 'cervical_spine', 'thoracic_spine',
  -- 'brain', 'abdomen', 'pelvis', 'chest', 'joint', 'other'
  referring_doctor TEXT,
  reporting_radiologist TEXT,
  protocol_used TEXT,
  -- e.g., 'STIR Coronals, Sagittal and Axial T1 and T2'
  raw_findings TEXT,
  -- Full extracted text from report
  ai_summary TEXT,
  -- Plain language summary generated by Claude
  normal_findings JSONB DEFAULT '[]',
  -- Array of normal finding strings
  abnormal_findings JSONB DEFAULT '[]',
  -- Array of {finding, severity, location, plain_language}
  critical_findings JSONB DEFAULT '[]',
  -- Red flag findings requiring immediate attention
  surgical_urgency BOOLEAN DEFAULT FALSE,
  -- True if urgent surgical language detected
  -- e.g., cauda equina, cord compression, severe stenosis
  follow_up_recommended BOOLEAN DEFAULT FALSE,
  follow_up_timeline TEXT,
  -- e.g., '3 months', '6 months', 'as needed'
  image_url TEXT,
  -- Original report image or PDF stored in Supabase Storage
  processing_status TEXT DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed'
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Imaging Findings (individual findings from imaging reports)
CREATE TABLE imaging_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_report_id UUID REFERENCES imaging_reports(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  -- e.g., 'L4-L5', 'C5-C6', 'Left kidney', 'OG Junction'
  finding_type TEXT,
  -- e.g., 'disc_bulge', 'disc_protrusion', 'nerve_compression',
  -- 'osteophyte', 'facet_arthrosis', 'polyp', 'cyst',
  -- 'fatty_liver', 'hiatus_hernia', 'straightening',
  -- 'schmorls_node', 'spondylolysis', 'listhesis', 'other'
  severity TEXT CHECK (severity IN (
    'normal', 'mild', 'moderate', 'severe', 'critical'
  )),
  laterality TEXT,
  -- 'left', 'right', 'bilateral', 'central', 'not_applicable'
  description TEXT,
  -- Radiologist's exact words
  plain_language TEXT,
  -- AI simplified explanation
  nerves_affected TEXT[],
  -- Array of affected nerve levels e.g., ['L4', 'L5', 'S1']
  linked_symptoms TEXT[],
  -- Symptoms this finding may cause
  -- e.g., ['leg_pain', 'urinary_frequency', 'numbness']
  is_new BOOLEAN DEFAULT TRUE,
  -- False if same finding existed in previous report
  trend TEXT CHECK (trend IN ('new', 'stable', 'improved', 'worsened')),
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Restrictions (doctor prescribed — NEW v2.1)
CREATE TABLE activity_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restriction TEXT NOT NULL,
  -- e.g., 'No heavy lifting', 'No running',
  -- 'No forward bending', 'No contact sports'
  reason TEXT,
  -- e.g., 'L4-L5 disc bulge', 'Reduced eGFR'
  severity TEXT CHECK (severity IN ('advisory', 'strict', 'absolute')),
  -- advisory: be careful, strict: avoid, absolute: never
  set_by_doctor_id UUID REFERENCES doctors(id),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  -- NULL means indefinite
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posture Logs (NEW v2.1)
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
  -- 0-100 calculated from checklist
  notes TEXT
);

-- Condition Connections (NEW v2.1)
CREATE TABLE condition_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_condition TEXT NOT NULL,
  -- e.g., 'low_b12', 'l4_l5_disc_bulge', 'excess_weight'
  source_label TEXT NOT NULL,
  -- Human readable: 'Low Vitamin B12'
  target_condition TEXT NOT NULL,
  -- e.g., 'peripheral_neuropathy', 'urinary_frequency'
  target_label TEXT NOT NULL,
  -- Human readable: 'Urinary Frequency'
  connection_type TEXT CHECK (connection_type IN (
    'causes', 'worsens', 'correlates', 'compounds'
  )),
  plain_language TEXT NOT NULL,
  -- e.g., 'Low B12 damages nerve myelin, slowing bladder nerve signals'
  evidence_source TEXT,
  -- 'lab_report', 'imaging', 'symptom_pattern', 'clinical'
  evidence_report_id UUID,
  -- Links to specific report that established this connection
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
  -- 'encouragement', 'alert', 'note', 'clinical_note'
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Doctor Notes
CREATE TABLE doctor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'observation',
  -- 'observation', 'instruction', 'target_update',
  -- 'restriction', 'alert', 'physiotherapy_plan'
  is_visible_to_patient BOOLEAN DEFAULT TRUE,
  is_visible_to_family BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  appointment_type TEXT,
  -- 'routine', 'follow_up', 'urgent', 'procedure'
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT,
  -- 'reminder', 'alert', 'milestone', 'family',
  -- 'report', 'posture', 'restriction_warning'
  priority TEXT DEFAULT 'normal',
  -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN DEFAULT FALSE,
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
  -- 'walk', 'medications', 'water', 'diet',
  -- 'sleep', 'posture', 'physiotherapy'
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
  -- NEW v2.1
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

-- Family read access based on access level
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

-- Imaging findings — same family access rules
ALTER TABLE imaging_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family read imaging findings" ON imaging_findings
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM family_members
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = TRUE
      AND access_level >= 2
    )
    OR patient_id = auth.uid()
  );

-- Doctors see data based on specialty
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctor own notes" ON doctor_notes
  FOR ALL USING (
    doctor_id IN (
      SELECT id FROM doctors
      WHERE email = auth.jwt() ->> 'email'
    )
    OR patient_id = auth.uid()
  );

-- Condition connections — patient and family visible
ALTER TABLE condition_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Condition connections access" ON condition_connections
  FOR SELECT USING (
    patient_id = auth.uid()
    OR patient_id IN (
      SELECT patient_id FROM family_members
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = TRUE
    )
  );

-- Activity restrictions — patient and doctors
ALTER TABLE activity_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity restrictions access" ON activity_restrictions
  FOR SELECT USING (
    patient_id = auth.uid()
    OR set_by_doctor_id IN (
      SELECT id FROM doctors
      WHERE email = auth.jwt() ->> 'email'
    )
  );
```

---

## 6. FEATURE SPECIFICATIONS

---

### 6.1 Onboarding Flow

**Step 1 — Welcome**
- WellNest branding and value proposition
- Sign up with email OTP or Google OAuth
- No password required

**Step 2 — Basic Profile**
- Name, date of birth, gender
- Height and weight
- Profile photo (optional)

**Step 3 — First Report Upload**
- Prompt: "Upload any medical report to get started"
- Supported: JPG, PNG, PDF
- System detects report type automatically:
  - Lab report → numeric extraction pipeline
  - Imaging report → descriptive finding pipeline
- User sees friendly loading state
- On completion: Health profile auto-generated

**Step 4 — Review Auto-Generated Profile**
- System shows extracted findings
- Anomalies highlighted with plain language
- Imaging findings shown with body diagram
- Initial health plan presented
- Condition connections shown if multiple findings

**Step 5 — Add Your Circle (Optional)**
- Invite family members
- Set access levels
- Invite doctors with specialty tagging

**Step 6 — Medications and Restrictions**
- Add current medications
- Add any activity restrictions advised by doctor
- Can import from prescription photo

**Step 7 — Notification Preferences**
- Set wake time, meal times, sleep time
- Posture reminder interval (default 45 minutes)
- Smart reminder schedule generated

---

### 6.2 Home Dashboard

**Header Section**
- Personalised greeting with time of day
- Today's date
- Quick access to family and settings

**Daily Health Score (0-100)**
- Circular progress ring
- Score breakdown:
  - Water: 20 points
  - Medications: 25 points
  - Exercise: 20 points
  - Diet: 20 points
  - Posture (NEW): 15 points
- Colour coded: Green 80+, Yellow 60-79, Red below 60

**Quick Stats Cards**
- Water intake vs daily goal
- Medications taken vs total
- Posture — last stand break time (NEW)
- Today's symptom count

**Quick Action Buttons**
- Add Water
- Log Symptom
- Mark Medication
- I Just Stood Up (posture — NEW)

**Active Alerts**
- Activity restriction reminders (NEW)
- Prolonged sitting warning (NEW)
- Any red flag symptoms
- Missed medications
- Upcoming appointments

**Today's Schedule**
- Time-based task list including posture breaks
- Physiotherapy exercises if prescribed (NEW)

**Recent Family Activity**
- Who checked your profile
- Latest messages

**Condition Connection Highlight (NEW)**
- One connection shown daily
- Rotates through all active connections
- Helps patient understand their health

---

### 6.3 Report Intelligence Engine

#### 6.3.1 Lab Report Pipeline (Numeric Values)

**Processing Steps:**
```
1. Upload received
2. OCR text extraction if image
3. Detected as lab report (numeric values present)
4. Claude API called — lab report prompt
5. Parameters extracted with values and units
6. Reference ranges applied by age and gender
7. Status assigned per parameter
8. Trend calculated vs previous report
9. Plain language explanation generated
10. Anomaly score calculated
11. Health plan updated
12. Notifications sent if urgent
```

**Parameter Categories Auto-Detected:**
- Kidney: Creatinine, eGFR, BUN, Urea, Uric Acid
- Liver: ALT, AST, ALP, GGT, Bilirubin, Albumin, Total Protein
- Blood Count: Hemoglobin, WBC, Platelets, RBC, MCV, MCH, MCHC, RDW
- Lipids: Total Cholesterol, HDL, LDL, VLDL, Triglycerides
- Diabetes: Fasting Glucose, HbA1c, Post-Prandial Glucose, eAG
- Thyroid: TSH, T3, T4, Free T3, Free T4
- Vitamins: Vitamin D, Vitamin B12, Folate, Iron, Ferritin, TIBC
- Cardiac: Troponin I, CK-MB, BNP, hs-CRP, ESR
- Electrolytes: Sodium, Potassium, Chloride, Calcium, Magnesium, Phosphorus
- Urine: Protein, Glucose, RBC, WBC, Specific Gravity, pH, Ketones, Nitrites
- Hormones: Testosterone, Estrogen, FSH, LH, Cortisol, Prolactin, DHEA
- Prostate: PSA Total, PSA Free
- Bone: Bone Mineral Density, T-score, Z-score
- Any other: Extracted and tracked generically

---

#### 6.3.2 Imaging Report Pipeline (NEW v2.1 — Descriptive Findings)

**Imaging Report Types Supported:**
- MRI Lumbar Spine
- MRI Cervical Spine
- MRI Thoracic Spine
- MRI Whole Spine
- MRI Brain
- MRI Any Joint (knee, hip, shoulder)
- CT Scan (any region)
- Ultrasound Abdomen / Pelvis / Whole Abdomen
- X-Ray Chest / Spine / Joint
- 2D Echo / Doppler
- Upper GI Endoscopy
- Lower GI Endoscopy / Colonoscopy
- Uroflowmetry
- Nerve Conduction Study (NCS / EMG)
- DEXA Bone Density
- Any other imaging

**Processing Steps:**
```
1. Upload received
2. OCR text extraction if image
3. Detected as imaging report (no standard numeric values)
4. Claude API called — imaging report prompt
5. Normal findings extracted
6. Abnormal findings extracted with:
   - Location (e.g., L4-L5, C5-C6)
   - Finding type (disc bulge, protrusion, etc.)
   - Severity (mild, moderate, severe)
   - Laterality (left, right, bilateral)
   - Nerves affected if applicable
   - Symptoms this may cause
7. Critical findings flagged:
   - Surgical urgency language detected
   - Cord compression
   - Cauda equina syndrome indicators
   - Malignancy language
8. Plain language summary generated
9. Each finding stored in imaging_findings
10. Linked to relevant symptom categories
11. Condition connections updated
12. Health plan updated with imaging-specific guidance
13. Urgent notification if critical finding detected
```

**Claude Prompt — Imaging Report:**
```
You are a medical imaging report parser.
Extract all findings from this imaging report.

For normal findings return array of strings.

For abnormal findings return array of objects:
{
  location: string (e.g., "L4-L5", "C5-C6"),
  finding_type: string,
  severity: "mild" | "moderate" | "severe",
  laterality: "left" | "right" | "bilateral" | "central" | "not_applicable",
  description: string (radiologist exact words),
  plain_language: string (simple one sentence explanation),
  nerves_affected: string[] (nerve levels if applicable),
  linked_symptoms: string[] (symptoms this may cause),
  surgical_urgency: boolean
}

For critical findings: array of urgent finding strings.

Also extract:
- imaging_type: string
- body_region: string
- follow_up_recommended: boolean
- follow_up_timeline: string if applicable
- overall_summary: string (2-3 sentences plain language)

Patient context: Age {age}, Gender {gender}
Return JSON only. No other text.
```

**Imaging Finding Display:**
- Body diagram with affected regions highlighted
- Colour coded by severity
- Plain language explanation per finding
- Nerves affected shown
- Possible symptoms linked
- Previous report comparison if available
- Trend: New / Stable / Improved / Worsened

**Surgical Urgency Detection:**
If any of these phrases detected — immediate urgent alert:
- Cauda equina
- Cord compression with signal change
- Complete canal stenosis
- Malignant / Malignancy
- Metastasis / Metastatic
- Fracture with displacement
- Epidural abscess
- Emergency / Urgent surgical

---

### 6.4 Condition Connection Engine (NEW v2.1)

#### Purpose
Multiple health conditions in the same patient are often causally connected. Showing these connections helps patients understand WHY they need to follow recommendations — driving motivation through understanding.

#### How Connections Are Built

**Automatic Generation:**
When reports are processed, Claude identifies connections:

```
Example connections generated from Abdul Aleem's reports:

Low B12 (186 pg/mL) [lab_report]
  → CAUSES → Peripheral Neuropathy [ncs_report]
  Plain: "Low B12 damages the protective myelin sheath
          around nerves, slowing their conduction speed"

Peripheral Neuropathy [ncs_report]
  → CAUSES → Neurogenic Bladder [symptom_pattern]
  Plain: "Slowed nerve conduction disrupts bladder
          control signals causing urgency and frequency"

L4-L5 Disc Bulge [mri_lumbar]
  → WORSENS → Neurogenic Bladder [symptom_pattern]
  Plain: "Disc pressure on L4-L5 nerve roots compounds
          the bladder nerve disruption from B12 deficiency"

Excess Weight (BMI 28.3) [user_profile]
  → WORSENS → L4-L5 Disc Bulge [mri_lumbar]
  Plain: "Every extra kg adds ~4kg of pressure on lumbar
          discs — making disc bulges worse over time"

High Uric Acid (7.28) [lab_report]
  → CAUSES → Reduced eGFR [lab_report]
  Plain: "Uric acid crystals deposit in kidney tubules,
          gradually reducing kidney filtration capacity"

Cold AC Environment [symptom_pattern]
  → WORSENS → Urinary Frequency [symptom_pattern]
  Plain: "Cold temperatures cause vasoconstriction and
          suppress ADH, increasing urine production"
```

#### Condition Web Display

**Visual Graph (Web App):**
- Node-based visual showing all conditions
- Colour coded by type (lab finding, imaging finding, symptom)
- Arrows showing cause-and-effect relationships
- Tap any node to see explanation

**Mobile List View:**
- Card-based list of connections
- "Did you know?" framing
- One new connection shown on home screen daily

#### Claude Prompt — Connection Generation:
```
Given these health findings for a patient:
{list of all findings from all reports}

Identify causal or correlational connections between findings.
For each connection return:
{
  source_condition: string,
  source_label: string,
  target_condition: string,
  target_label: string,
  connection_type: "causes" | "worsens" | "correlates" | "compounds",
  plain_language: string (simple one sentence),
  evidence_source: string
}

Patient context: Age {age}, Gender {gender}
Return JSON array only.
```

---

### 6.5 Medication Manager

**Medication List:**
- All active medications displayed
- Grouped by time of day
- One-tap mark as taken
- Undo option (30 second window)
- Activity restriction warnings if medication conflicts

**Add Medication:**
- Name, dose, unit
- Frequency: daily / alternate days / weekly / custom
- Custom schedule builder
- Start and end date
- Linked condition (optional)
- Photo of prescription stored

**Compliance Tracking:**
- Daily compliance percentage
- Weekly compliance graph
- Monthly heat map
- Streak counter per medication

**Smart Features:**
- Injection course countdown (Day X of N)
- Refill reminder N days before running out
- Prescription photo storage

---

### 6.6 Symptom Tracker (UPDATED v2.1)

#### Symptom Library — Full List

**Urinary Symptoms:**
- Urinary frequency (with episode counter)
- Urinary urgency
- Incomplete emptying
- Urine color change
- Nighttime urination (nocturia)
- Urinary pain or burning
- Reduced urine output

**Neurological Symptoms (NEW v2.1):**
- Leg pain
  - Metadata: which leg, radiation pattern, severity
- Leg numbness or tingling
  - Metadata: location (thigh / knee / calf / foot / toes)
- Leg weakness
  - Metadata: which leg, which movement affected
- Falls or near-falls
  - Metadata: circumstances, injury if any
- Foot drop sensation
- Hand numbness or tingling
- Arm weakness

**Spinal Symptoms (NEW v2.1):**
- Lower back pain
  - Metadata: type (sharp/dull/burning/aching), worse with (sitting/standing/walking/bending)
- Neck pain
  - Metadata: radiation to arm or hand
- Mid back pain
- Morning stiffness
- Pain after prolonged sitting
- Pain relief on lying down

**Digestive Symptoms:**
- Heartburn / Acid reflux
- Nausea
- Bloating
- Abdominal pain
- Appetite changes

**General Symptoms:**
- Fatigue
- Fever
- Swelling (location)
- Headache
- Dizziness
- Breathlessness

**Custom:**
- User can add any symptom not in library
- Free text entry
- Categorised as 'other'

#### Symptom to Finding Linking (NEW v2.1)
When logging a symptom:
- System checks if any imaging finding is linked to this symptom
- If yes: "This may be related to your L4-L5 disc bulge (MRI March 2026)"
- Patient can confirm or deny the link
- Builds richer health picture over time

#### Pattern Analysis
- Frequency chart over time
- Severity trend
- Time of day distribution (home vs office)
- Correlation with medications
- Correlation with posture compliance (NEW)
- Environment factors

---

### 6.7 Posture and Activity Tracker (NEW v2.1)

#### Posture Tracker

**Sit-Stand Timer:**
- Configurable interval (default 45 minutes)
- Push notification when time to stand
- One tap "I Just Stood Up" to reset timer
- Session log: how many stand breaks taken today
- Daily posture compliance score

**Posture Checklist (morning setup):**
- ✓ Lumbar support cushion in place
- ✓ Screen at eye level (not looking down)
- ✓ Feet flat on floor
- ✓ Arms at 90 degrees
- ✓ Chair fully supporting lower back
- Score: X of 5 checks complete

**Sleep Position Tracker:**
- Log sleep position each night
- Recommended position based on conditions
- For spine patients: side sleeping with pillow between knees
- Compliance streak for sleep position

**Posture Score (contributes to daily health score):**
- Stand breaks taken: 50% of posture score
- Morning checklist complete: 30% of posture score
- Sleep position correct: 20% of posture score

#### Activity Restriction Manager (NEW v2.1)

**Doctor-Set Restrictions Display:**
- List of all active restrictions
- Set by which doctor
- Reason shown in plain language
- Severity: Advisory / Strict / Absolute

**Activity Warning System:**
When logging exercise:
- System checks against active restrictions
- If restricted: warning shown
- Advisory: "Doctor advises caution with this activity"
- Strict: "Doctor recommends avoiding this — log anyway?"
- Absolute: "This activity is restricted — cannot log"

**Safe Exercise List (generated from restrictions):**
- Shows only exercises compatible with all restrictions
- Tagged with why they are safe
- Sorted by benefit for patient's conditions

**Example for spine patient with L4-L5 disc:**
```
✅ Safe:
- Walking on flat surface (low impact)
- Swimming (zero spinal compression)
- Gentle yoga — approved poses only
- Stationary cycling (low resistance)
- Kegel exercises (pelvic floor)
- Cat-cow stretches
- Supine knee to chest

🔴 Restricted:
- Running (high impact — worsens disc)
- Heavy lifting (compresses discs)
- Forward bending (bends into bulge)
- Twisting movements (stresses facets)
- High impact sports
- Sit-ups / Crunches (spinal flexion)
```

---

### 6.8 Water Intake Tracker

**Logging:**
- Quick add: 100ml, 200ml, 250ml, 500ml
- Custom amount
- Fluid type: Water / Coconut water / Soup / Juice / Other

**Visual:**
- Animated progress to daily goal
- Configurable goal (default 2500ml)
- Streak counter

**Smart Reminders:**
- Hourly if falling behind
- No reminders after user bedtime
- Post-exercise extra reminder

---

### 6.9 Exercise Tracker

**Exercise Types:**
- Walking (GPS optional)
- Swimming
- Cycling (indoor/outdoor)
- Yoga / Stretching
- Physiotherapy exercises (NEW — separate category)
- Custom

**Physiotherapy Exercise Tracker (NEW v2.1):**
- Doctor or physio prescribed exercises logged separately
- Set reps, sets, duration per exercise
- Daily PT compliance tracked
- Reported to doctor in weekly summary

**Stats:**
- Weekly heat map
- Streak counter
- Distance this month
- Physiotherapy compliance separately

---

### 6.10 Diet Tracker

**Daily Compliance:**
- User-defined diet rules
- Checkbox interface
- Compliance score

**Meal Logging:**
- Breakfast, Lunch, Dinner, Snacks
- Photo option
- Quick add from recent

**Diet Rule Examples (user defines their own):**
- No red meat
- No caffeine
- Dinner before 8 PM
- No fluids after 10:30 PM
- No processed foods

---

### 6.11 Lab Results Dashboard

**Parameter Overview:**
- All tracked parameters
- Latest value + trend arrow
- Status badge
- Last tested date
- Next test due

**Individual Parameter View:**
- Full history graph
- Normal range band
- Percentage change
- Plain language explanation
- Linked conditions
- Recommendations

**Imaging Findings Overview (NEW v2.1):**
- All imaging reports listed
- Body diagram showing affected regions
- Finding severity map
- Trend: New / Stable / Improved / Worsened

**Report History:**
- Lab reports and imaging reports in unified timeline
- Filter by type
- View original
- Compare two dates

---

### 6.12 Family Circle

**Patient Controls:**
- Invite members
- Set access level
- Toggle visibility per section
- View access log
- Remove anytime

**Family Dashboard:**
- Health score — large display
- Medication compliance
- Posture compliance (NEW)
- Active restrictions summary (NEW)
- Exercise done
- Water intake
- Last app activity

**Condition Connection View for Family (NEW v2.1):**
- Family sees simplified condition connections
- Helps them understand patient's health
- Motivates support: "Abdul Aleem's back disc is
  affecting his bladder nerves — that is why he needs
  posture support at office"

**Messaging:**
- Encouragement messages
- Quick reactions
- Doctor notes (if permitted)

---

### 6.13 Doctor Portal (UPDATED v2.1)

**Multi-Specialist Support:**
Each doctor sees view filtered to their specialty.
See Section 3.3 for specialty-specific views.

**Shared Features Across All Specialties:**
- Patient demographic summary
- Active medications list
- Current restrictions
- Recent reports (filtered by specialty relevance)
- Medication compliance graph
- Next appointment

**Imaging Report View (NEW v2.1):**
- All imaging reports relevant to specialty
- Finding timeline
- Severity map
- Plain language and clinical language toggle
- Download original report

**Restriction Management (NEW v2.1):**
- Doctor can set activity restrictions
- Set severity level
- Set duration
- Patient notified immediately
- App enforces restriction in exercise logging

**Physiotherapy Prescription (NEW v2.1):**
- Doctor adds PT exercises
- Sets reps, sets, frequency
- Patient sees in exercise tracker
- Compliance reported back to doctor

---

### 6.14 Progress and Achievements

**Health Score History:**
- Daily score graph
- Monthly comparison
- Best score tracking

**Streak System:**
- Walk streak
- Medication streak
- Water goal streak
- Diet compliance streak
- Sleep goal streak
- Posture compliance streak (NEW)
- Physiotherapy streak (NEW)

**Milestones:**
- First report uploaded
- 7-day medication streak
- 30-day walk streak
- Parameter reaches normal range
- Weight goal reached
- Posture: 10 days of sit-stand compliance (NEW)
- Physiotherapy: first week complete (NEW)
- MRI improvement confirmed (NEW)
- NCS improvement confirmed (NEW)

---

## 7. REPORT INTELLIGENCE ENGINE

### 7.1 Claude API Integration

**Lab Report System Prompt:**
```
You are a medical lab report parser. Extract all numeric
parameters from the provided medical report text.

For each parameter return:
{
  parameter_name: standardised name,
  value: numeric value only,
  unit: measurement unit,
  reference_min: lower bound of normal range,
  reference_max: upper bound of normal range,
  status: "normal" | "borderline_low" | "borderline_high" |
          "abnormal_low" | "abnormal_high" | "critical",
  plain_language: one sentence in simple terms,
  category: "kidney" | "liver" | "blood" | "lipids" |
            "diabetes" | "thyroid" | "vitamins" | "cardiac" |
            "electrolytes" | "urine" | "hormones" | "other"
}

Patient context: Age {age}, Gender {gender}
Return JSON array only. No other text.
```

**Imaging Report System Prompt:**
```
You are a medical imaging report parser.
Extract all findings from this imaging report.

Return JSON object:
{
  imaging_type: string,
  body_region: string,
  normal_findings: string[],
  abnormal_findings: [
    {
      location: string,
      finding_type: string,
      severity: "mild" | "moderate" | "severe",
      laterality: "left" | "right" | "bilateral" |
                  "central" | "not_applicable",
      description: string (exact radiologist words),
      plain_language: string (simple explanation),
      nerves_affected: string[],
      linked_symptoms: string[],
      surgical_urgency: boolean
    }
  ],
  critical_findings: string[],
  follow_up_recommended: boolean,
  follow_up_timeline: string,
  overall_summary: string
}

Patient context: Age {age}, Gender {gender}
Return JSON only. No other text.
```

**Condition Connection Prompt:**
```
Given these health findings for a patient:
{all_findings}

Identify meaningful causal or correlational connections.

For each connection return:
{
  source_condition: string (code format),
  source_label: string (human readable),
  target_condition: string (code format),
  target_label: string (human readable),
  connection_type: "causes" | "worsens" |
                   "correlates" | "compounds",
  plain_language: string (one simple sentence),
  evidence_source: "lab_report" | "imaging" |
                   "symptom_pattern" | "clinical"
}

Only include connections that are clinically meaningful.
Patient context: Age {age}, Gender {gender}
Return JSON array only.
```

### 7.2 Error Handling
- Illegible: Ask user to retake photo
- Partial extraction: Show extracted, allow manual completion
- Unknown parameters: Extract generically as 'other'
- Processing failure: Retry once then flag for manual review
- Surgical urgency detected: Immediate patient alert regardless of processing status

### 7.3 Reference Range Database
- Standard ranges by age group and gender
- Sourced from WHO, ICMR, major lab standards
- Overridable by doctor per patient
- Imaging finding severity standards included

### 7.4 Anomaly Scoring
Lab parameters:
- 0: Normal
- 1: Borderline (within 10% of limit)
- 2: Mildly abnormal (10-25% outside)
- 3: Moderately abnormal (25-50% outside)
- 4: Severely abnormal (>50% outside)
- 5: Critical

Imaging findings:
- 0: Normal
- 1: Mild finding (no nerve involvement)
- 2: Moderate finding (possible nerve involvement)
- 3: Significant finding (confirmed nerve involvement)
- 4: Severe finding (multiple levels, bilateral)
- 5: Critical (surgical urgency language)

---

## 8. CONDITION CONNECTION ENGINE

See Section 6.4 for full specification.

**Summary of Engine Logic:**
1. After every report processed — run connection analysis
2. Claude identifies connections between all known findings
3. New connections stored in condition_connections table
4. Existing connections updated (stable / worsened / resolved)
5. Patient notified of new connections in plain language
6. Family sees simplified connection summary
7. Doctor sees clinical connection summary

---

## 9. API INTEGRATIONS

### 9.1 Claude API
- Purpose: Lab report parsing, imaging report parsing, condition connections
- Model: claude-sonnet-4-5 (latest available)
- Usage: On report upload — not real-time
- Cost: Approximately $0.01-0.10 per report depending on length
- Fallback: Manual parameter entry if API fails

### 9.2 Supabase
- Database: All structured health data
- Auth: OTP email, Google OAuth
- Storage: Report images and PDFs
- Realtime: Family dashboard live updates
- Edge Functions: Scheduled notifications, score calculations, report processing queue

### 9.3 Web Push Notifications
- Purpose: Medication reminders, posture breaks, family alerts
- Implementation: Service Worker + Push API
- Fallback: Email via Supabase

### 9.4 Future Integrations (v3+)
- Apple HealthKit
- Google Fit
- Fitbit / Garmin / Samsung Health
- WhatsApp Business API

---

## 10. NOTIFICATION SYSTEM

### 10.1 Patient Notifications

**Daily Reminders (time-relative to user settings):**
| Trigger | Message |
|---|---|
| Wake time | "Good morning {name}! Time for water and your morning activity 🌅" |
| 30 min after wake | "Breakfast time — morning medications with food 💊" |
| Injection day | "💉 Injection day — Day {x} of {n}" |
| Mid morning | "Water check — have you hit 30% of goal? 💧" |
| Lunch | "Lunch time — stick to your health plan 🥗" |
| Afternoon | "Water check — staying hydrated? 💧" |
| Dinner | "Dinner time — eat {n} hours before sleep 🍽️" |
| Evening meds | "Evening medications 💊" |
| Pre-sleep | "Wind down — stop fluids and screens soon 🌙" |
| Weekly | "Weekly weigh-in day ⚖️" |
| Lab due | "Your {parameter} retest is due this week 🧪" |

**Posture Reminders (NEW v2.1):**
| Trigger | Message |
|---|---|
| Every 45 min sitting | "Stand up and move for 5 minutes — your spine needs it! 🚶" |
| 90 min sitting | "⚠️ You have been sitting too long. Your disc health depends on movement!" |
| Morning | "Remember lumbar support cushion today 🪑" |
| Bedtime | "Sleep on your side with pillow between knees tonight 🛏️" |
| Weekly | "Physiotherapy exercises due today 🧘" |

**Report-Based Reminders (NEW v2.1):**
| Trigger | Message |
|---|---|
| 3 months after MRI | "Consider spine review or follow-up MRI — discuss with doctor 📋" |
| 6 months after NCS | "NCS recheck recommended — book with your neurologist 🧪" |
| 4 weeks after new report | "Time to repeat your kidney function test — track your progress 🫘" |

**Alert Notifications:**
| Event | Priority | Message |
|---|---|---|
| Critical imaging finding | Urgent | Immediate alert with doctor contact |
| Surgical urgency detected | Urgent | "⚠️ Important: Please contact your doctor today" |
| Red flag symptom | High | Alert with recommended action |
| Medications missed 2 days | High | Gentle concern message |
| Logged restricted activity | Medium | "This activity is restricted by Dr. {name}" |
| Health score below 40 | Medium | Encouragement + tips |

### 10.2 Family Notifications

**Daily Summary (9 PM):**
```
{Name}'s health today:
Score: {score}/100
Medications: {taken}/{total}
Posture breaks: {n} taken
Exercise: {done/not done}
Water: {amount}ml of {goal}ml
```

**Alert Notifications:**
| Event | Message |
|---|---|
| Critical finding in new report | "⚠️ {Name} has a new medical finding — please check in" |
| Medications missed 2+ days | "{Name} has missed medications — gentle check-in?" |
| Health score below 40 | "{Name} may need support today" |
| Milestone achieved | "🎉 {Name} achieved: {milestone}" |
| Weekly Monday | "{Name}'s weekly health report is ready" |

### 10.3 Doctor Notifications

| Event | Message |
|---|---|
| New report uploaded | "New {report_type} uploaded by {patient_name}" |
| Critical finding detected | "⚠️ Critical finding in {patient_name}'s new report" |
| Weekly Sunday | "Weekly summary for {patient_name} is ready" |
| Appointment tomorrow | "Appointment reminder: {patient_name} tomorrow at {time}" |

---

## 11. PRIVACY AND SECURITY

### 11.1 Data Ownership
- Patient owns 100% of health data
- Never sold or shared with third parties
- No health-data-based advertising
- Full data export at any time
- Account and data deletion on request

### 11.2 Access Control
- Row Level Security at database level
- Not just frontend — genuinely secure at data layer
- Family access revocable instantly
- Doctor access revocable instantly
- Audit log of all family and doctor data access
- Imaging report access follows same rules as lab data

### 11.3 Authentication
- OTP-based login — no passwords
- Google OAuth option
- Biometric on supported devices
- Session timeout: 30 min inactive on web
- Persistent session on mobile with biometric

### 11.4 Data Encryption
- All data encrypted at rest (Supabase default)
- HTTPS enforced
- Report images encrypted in storage
- No sensitive data in localStorage
- API keys server-side only

### 11.5 Compliance
- HIPAA-aligned data handling
- GDPR-compliant for international users
- Data residency: Supabase region selectable
- No third-party analytics on health data

---

## 12. DEVELOPMENT ROADMAP

### Phase 1 — Foundation (Weeks 1-4)
**Goal: Working app the patient uses daily**

- [ ] Project setup: React + Vite + TypeScript + Tailwind
- [ ] Supabase schema setup (all tables including v2.1 additions)
- [ ] Authentication: OTP email login
- [ ] Basic profile creation
- [ ] Home dashboard with health score (including posture score)
- [ ] Medication tracker with daily logging
- [ ] Water intake tracker
- [ ] Basic symptom logger (including neurological and spinal)
- [ ] Activity restriction display
- [ ] Posture sit-stand timer (basic)
- [ ] Push notification system
- [ ] Deploy to Vercel

**Deliverable:** Patient uses app daily for medications, water, symptoms, posture

---

### Phase 2 — Intelligence (Weeks 5-8)
**Goal: Report upload and anomaly detection working**

- [ ] Lab report upload and Claude parsing
- [ ] Imaging report upload and Claude parsing (NEW v2.1)
- [ ] Parameter extraction and storage
- [ ] Imaging finding extraction and storage (NEW v2.1)
- [ ] Anomaly detection and flagging
- [ ] Lab results trend graphs
- [ ] Imaging findings display with severity
- [ ] Condition connection engine (NEW v2.1)
- [ ] Condition web visualisation
- [ ] Health plan generation from all findings
- [ ] Exercise tracker with restriction warnings (NEW v2.1)
- [ ] Physiotherapy exercise tracker (NEW v2.1)
- [ ] Safe exercise list generator (NEW v2.1)
- [ ] Full posture tracker with compliance scoring (NEW v2.1)

**Deliverable:** Upload any report (lab or imaging), get instant insights, safe exercise guidance, and condition connections

---

### Phase 3 — Circle (Weeks 9-12)
**Goal: Family and doctor access working**

- [ ] Family invitation system
- [ ] Family dashboard with imaging summary (NEW v2.1)
- [ ] Condition connections for family (NEW v2.1)
- [ ] Access level configuration
- [ ] Real-time updates
- [ ] Family messaging
- [ ] Multi-specialist doctor portal (NEW v2.1)
- [ ] Specialty-filtered views (NEW v2.1)
- [ ] Doctor restriction management (NEW v2.1)
- [ ] Physiotherapy prescription from doctor (NEW v2.1)
- [ ] Doctor notes system
- [ ] Health target management
- [ ] Doctor visit report PDF
- [ ] Appointment calendar
- [ ] Report-triggered follow-up reminders (NEW v2.1)

**Deliverable:** Full connected care experience across patient, family, and multiple specialist doctors

---

### Phase 4 — Polish (Weeks 13-16)
**Goal: Production-ready product**

- [ ] PWA installable on mobile
- [ ] Offline mode with sync
- [ ] Streak and milestone system (all new streaks)
- [ ] Weight tracking
- [ ] Sleep tracker with position logging
- [ ] Advanced pattern analysis
- [ ] Report comparison view
- [ ] Full notification system
- [ ] Performance optimisation
- [ ] Accessibility improvements
- [ ] Dark mode
- [ ] Onboarding polish

**Deliverable:** App ready to share with others

---

### Phase 5 — Scale (Month 5+)
**Goal: Generic platform for any user**

- [ ] Multi-language support
- [ ] Smartwatch integration
- [ ] Advanced food database
- [ ] Wearable data import
- [ ] App Store and Play Store (React Native)
- [ ] Admin dashboard

---

## 13. SUCCESS METRICS

### Product Health Metrics
| Metric | Target (3 months) |
|---|---|
| Daily active usage | 7 days per week |
| Medication compliance logged | > 90% of days |
| Reports uploaded | At least 1 per month |
| Posture breaks taken | > 6 per work day |
| Family members active | At least 2 weekly |
| Report processing accuracy — lab | > 95% parameters correct |
| Report processing accuracy — imaging | > 90% findings correct |
| Condition connections generated | At least 3 per patient |

### Health Outcome Metrics
These are patient-specific based on anomalies found at onboarding.
Generic examples:
- Abnormal lab parameters trending toward normal range
- Imaging findings showing stable or improved trend at follow-up
- Symptom frequency reducing over time
- Medication compliance improving month over month
- Exercise consistency increasing
- Posture compliance improving week over week
- Weight trending toward target

---

## 14. FOLDER STRUCTURE

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
│   │   │   └── BodyDiagram.tsx        # NEW v2.1 — spine/body diagram
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   └── features/
│   │       ├── dashboard/
│   │       ├── medications/
│   │       ├── symptoms/
│   │       │   ├── SymptomLogger.tsx
│   │       │   ├── NeurologicalSymptoms.tsx    # NEW v2.1
│   │       │   └── SpinalSymptoms.tsx           # NEW v2.1
│   │       ├── water/
│   │       ├── exercise/
│   │       │   ├── ExerciseLogger.tsx
│   │       │   ├── PhysiotherapyTracker.tsx    # NEW v2.1
│   │       │   ├── SafeExerciseList.tsx         # NEW v2.1
│   │       │   └── RestrictionWarning.tsx       # NEW v2.1
│   │       ├── diet/
│   │       ├── reports/
│   │       │   ├── LabReportUpload.tsx
│   │       │   ├── ImagingReportUpload.tsx      # NEW v2.1
│   │       │   ├── LabParameterView.tsx
│   │       │   ├── ImagingFindingView.tsx       # NEW v2.1
│   │       │   └── SpineMap.tsx                 # NEW v2.1
│   │       ├── conditions/                       # NEW v2.1
│   │       │   ├── ConditionWeb.tsx             # Visual graph
│   │       │   ├── ConditionCard.tsx            # List view
│   │       │   └── ConnectionDetail.tsx
│   │       ├── posture/                          # NEW v2.1
│   │       │   ├── PostureTracker.tsx
│   │       │   ├── SitStandTimer.tsx
│   │       │   ├── PostureChecklist.tsx
│   │       │   └── SleepPositionLogger.tsx
│   │       ├── restrictions/                     # NEW v2.1
│   │       │   ├── RestrictionsList.tsx
│   │       │   └── ActivityWarning.tsx
│   │       ├── family/
│   │       ├── doctor/
│   │       │   ├── DoctorPortal.tsx
│   │       │   ├── NephrologyView.tsx           # NEW v2.1
│   │       │   ├── UrologyView.tsx              # NEW v2.1
│   │       │   ├── NeurologyView.tsx            # NEW v2.1
│   │       │   └── CardiologyView.tsx           # NEW v2.1
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
│   │   ├── ImagingScreen.tsx                    # NEW v2.1
│   │   ├── ConditionsScreen.tsx                 # NEW v2.1
│   │   ├── PostureScreen.tsx                    # NEW v2.1
│   │   ├── FamilyScreen.tsx
│   │   ├── DoctorScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── healthStore.ts
│   │   ├── medicationStore.ts
│   │   ├── reportStore.ts
│   │   ├── imagingStore.ts                      # NEW v2.1
│   │   ├── postureStore.ts                      # NEW v2.1
│   │   └── conditionStore.ts                    # NEW v2.1
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── claudeApi.ts
│   │   ├── labReportParser.ts
│   │   ├── imagingReportParser.ts               # NEW v2.1
│   │   ├── conditionConnections.ts              # NEW v2.1
│   │   └── notifications.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useHealth.ts
│   │   ├── useMedications.ts
│   │   ├── useReports.ts
│   │   ├── useImaging.ts                        # NEW v2.1
│   │   ├── usePosture.ts                        # NEW v2.1
│   │   └── useConditions.ts                     # NEW v2.1
│   ├── utils/
│   │   ├── healthScore.ts
│   │   ├── anomalyDetection.ts
│   │   ├── imagingAnalysis.ts                   # NEW v2.1
│   │   ├── conditionConnections.ts              # NEW v2.1
│   │   ├── spineAnalysis.ts                     # NEW v2.1
│   │   ├── exerciseRestrictions.ts              # NEW v2.1
│   │   ├── referenceRanges.ts
│   │   ├── dateHelpers.ts
│   │   └── formatters.ts
│   ├── types/
│   │   ├── health.types.ts
│   │   ├── user.types.ts
│   │   ├── report.types.ts
│   │   └── imaging.types.ts                     # NEW v2.1
│   ├── constants/
│   │   ├── symptoms.ts
│   │   ├── imagingTypes.ts                      # NEW v2.1
│   │   ├── spineFindings.ts                     # NEW v2.1
│   │   ├── exerciseLibrary.ts                   # NEW v2.1
│   │   ├── medications.ts
│   │   └── referenceRanges.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_imaging_schema.sql               # NEW v2.1
│   ├── functions/
│   │   ├── process-lab-report/
│   │   ├── process-imaging-report/              # NEW v2.1
│   │   ├── generate-condition-connections/      # NEW v2.1
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

## 15. ENVIRONMENT VARIABLES

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
VITE_POSTURE_REMINDER_INTERVAL_MINUTES=45
```

---

## 16. README STARTER

```markdown
# 🪺 WellNest

> Your health. Your circle. Your journey.

WellNest is a universal personal health tracking platform.
Upload any medical report — blood test or imaging — track
daily health habits, and keep your family and doctors
informed and connected.

## What Makes WellNest Different

- 📊 Reads ANY report: blood tests AND imaging (MRI, CT, Ultrasound)
- 🔗 Connects conditions: shows how your health issues relate
- 💊 Tracks medications with smart reminders
- 🪑 Posture tracker for spine health (NEW)
- 🏃 Safe exercise guidance based on your restrictions
- 👨‍👩‍👧‍👦 Family circle with live health updates
- 👨‍⚕️ Multi-specialist doctor portal
- 🏆 Streaks and milestones to keep you motivated

## Tech Stack

- React 18 + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Claude API for report intelligence
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

## Architecture

WellNest uses two separate AI pipelines for reports:

Lab Reports (blood tests, urine):
Upload → OCR → Claude extracts numeric parameters
→ Compare to reference ranges → Flag anomalies

Imaging Reports (MRI, CT, Ultrasound):
Upload → OCR → Claude extracts descriptive findings
→ Categorise severity → Link to symptoms

Both feed into the Condition Connection Engine
which maps how findings relate to each other.

## Contributing

See CONTRIBUTING.md

## License

MIT
```

---

*WellNest PRD v2.1 — Imaging Intelligence + Spine Health Edition*
*Updated: April 2026*
*Changes from v2.0: Imaging report support, condition connections,
posture tracker, activity restrictions, multi-specialist doctor views,
neurological symptom library, physiotherapy tracker*
*Status: Ready for Development*
