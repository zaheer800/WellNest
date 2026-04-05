# WellNest — Product Requirements Document
**Version 2.0 | March 2026**
**"Your health. Your circle. Your journey."**

---

## TABLE OF CONTENTS

1. Product Overview
2. Design Philosophy
3. User Roles
4. Tech Stack
5. Database Schema
6. Feature Specifications
7. Report Intelligence Engine
8. API Integrations
9. Notification System
10. Privacy and Security
11. Development Roadmap
12. Success Metrics

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

---

## 2. DESIGN PHILOSOPHY

### Principles

**1. Generic First**
WellNest is not built for any specific condition. Any user with any health profile can onboard, upload their reports, and immediately get value. The system learns from what the user uploads.

**2. Report Intelligence**
The core engine reads any medical report — blood test, urine analysis, imaging report, ECG, nerve study, bone density — extracts all parameters, compares against standard reference ranges, and flags anomalies automatically. No manual entry required.

**3. Dynamic Planning**
Health plans are not static. Every time a new report is uploaded, the system updates the user's health plan, celebrates improvements, flags regressions, and adjusts recommendations accordingly.

**4. Connected Care**
Health is not a solo journey. Family members and doctors are first-class citizens in WellNest. Each role has appropriate access — family sees progress and sends support, doctors see clinical data and add notes.

**5. Privacy by Design**
Health data is the most sensitive personal data. Row-level security at database level. Patient controls exactly what each family member and doctor can see. No data sold or shared.

**6. Progressive Complexity**
New users see a simple, clean interface. Power features reveal themselves as users engage more. Never overwhelming on day one.

---

## 3. USER ROLES

### 3.1 Patient (Primary User)
The individual whose health is being tracked.

**Capabilities:**
- Full read and write access to own health data
- Upload and manage medical reports
- Log daily health activities
- Manage medications and schedules
- Invite and manage family members
- Add and manage doctors
- Control data visibility per person
- Generate and share reports
- View all trends and insights

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
| Symptom Details | 🔒 Patient controls |
| Weight | 🔒 Patient controls |
| Detailed Lab Values | 🔒 Patient controls |
| Personal Notes | ❌ Always private |
| Bladder / Intimate Logs | ❌ Always private |

---

### 3.3 Doctor
A licensed medical professional managing the patient's care.

**Capabilities:**
- View full clinical data (lab results, trends, medications)
- View medication compliance history
- View symptom frequency and patterns
- Add clinical notes visible to patient
- Update health targets for patient
- Receive auto-generated patient summaries
- Cannot see personal diary or private notes
- Cannot modify patient's logs

**Onboarding:**
- Invited by patient
- Verified by patient (no credential verification in v1)
- Tagged by specialty (nephrologist, cardiologist, etc.)
- Receives weekly auto-summary of patient data

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
| Styling | Tailwind CSS | Rapid UI development |
| State Management | Zustand | Lightweight, simple |
| Charts | Recharts | React-native charts library |
| Forms | React Hook Form | Performant form handling |
| PWA | Vite PWA Plugin | Installable on mobile |
| Routing | React Router v6 | Client-side navigation |

### Backend / Infrastructure
| Layer | Technology | Reason |
|---|---|---|
| Database | Supabase (PostgreSQL) | Relational, open source, RLS support |
| Authentication | Supabase Auth | Built-in, supports OTP and OAuth |
| File Storage | Supabase Storage | Report images and PDFs |
| Real-time | Supabase Realtime | Family dashboard live updates |
| AI / Report Reading | Claude API (Anthropic) | Best-in-class document understanding |
| Hosting | Vercel | Free tier, instant deploys |
| CI/CD | GitHub Actions | Automated testing and deployment |

### Development
| Tool | Purpose |
|---|---|
| GitHub | Version control and collaboration |
| TypeScript | Type safety across codebase |
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
  -- Custom schedule details
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
  -- 'water', 'coconut_water', 'soup', 'juice', 'other'
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptom Logs
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  -- Flexible field for symptom-specific data
  -- e.g., for urination: {color, volume, urgency, location, ac_environment}
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Logs
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
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
  -- 'breakfast', 'lunch', 'dinner', 'snack'
  food_items JSONB DEFAULT '[]',
  compliance_flags JSONB DEFAULT '{}',
  -- e.g., {no_meat: true, no_caffeine: true}
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
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.3 Report Intelligence Tables

```sql
-- Lab Reports (any uploaded medical report)
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL,
  -- 'blood_test', 'urine_analysis', 'imaging', 'ecg',
  -- 'nerve_study', 'bone_density', 'endoscopy', 'other'
  lab_name TEXT,
  doctor_name TEXT,
  raw_text TEXT,
  -- Extracted text from image/PDF
  image_url TEXT,
  -- Original report image stored in Supabase Storage
  ai_summary TEXT,
  -- Claude's plain language summary
  anomaly_count INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed'
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Lab Parameters (individual values extracted from reports)
CREATE TABLE lab_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES lab_reports(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  -- e.g., 'Creatinine', 'eGFR', 'Vitamin D'
  parameter_category TEXT,
  -- e.g., 'kidney', 'liver', 'vitamins', 'cardiac'
  value DECIMAL,
  unit TEXT,
  reference_min DECIMAL,
  reference_max DECIMAL,
  status TEXT CHECK (status IN ('normal', 'borderline_low', 'borderline_high', 'abnormal_low', 'abnormal_high', 'critical')),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening', 'new')),
  -- Compared to previous report
  plain_language_explanation TEXT,
  -- AI generated explanation
  report_date DATE,
  -- Denormalized for efficient trend queries
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Targets (system or doctor set targets per parameter)
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

-- Health Plans (dynamic plans generated from anomalies)
CREATE TABLE health_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT,
  -- 'diet', 'exercise', 'lifestyle', 'medication', 'followup'
  title TEXT NOT NULL,
  description TEXT,
  triggered_by TEXT,
  -- Parameter name that triggered this recommendation
  priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  -- 1: high, 2: medium, 3: low
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

---

### 5.4 Communication Tables

```sql
-- Messages (family to patient)
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
  -- 'observation', 'instruction', 'target_update', 'alert'
  is_visible_to_patient BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  appointment_type TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT,
  -- 'reminder', 'alert', 'milestone', 'family', 'report'
  priority TEXT DEFAULT 'normal',
  -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.5 Gamification Tables

```sql
-- Streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  -- 'walk', 'medications', 'water', 'diet', 'sleep'
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
  UNIQUE(patient_id, score_date)
);
```

---

### 5.6 Row Level Security Policies

```sql
-- Patients can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Family members see only what patient permits
ALTER TABLE lab_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family read access" ON lab_parameters
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM family_members
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = TRUE
      AND access_level >= 2
    )
    OR patient_id = auth.uid()
  );

-- Doctors see clinical data only
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctor own notes" ON doctor_notes
  FOR ALL USING (
    doctor_id IN (
      SELECT id FROM doctors
      WHERE email = auth.jwt() ->> 'email'
    )
    OR patient_id = auth.uid()
  );
```

---

## 6. FEATURE SPECIFICATIONS

---

### 6.1 Onboarding Flow

**Step 1 — Welcome**
- WellNest branding and value proposition
- Sign up with email OTP or Google OAuth
- No password required — OTP only for security

**Step 2 — Basic Profile**
- Name, date of birth, gender
- Height and weight
- Profile photo (optional)
- Skip option available — can complete later

**Step 3 — First Report Upload (Key Step)**
- Prompt: "Upload your latest blood test or any medical report"
- Supported formats: JPG, PNG, PDF
- AI processes report in background
- User sees loading state with friendly message
- On completion: Health profile auto-generated from report

**Step 4 — Review Auto-Generated Profile**
- System shows extracted parameters
- Anomalies highlighted with plain language explanations
- User can correct any misread values
- Initial health plan presented

**Step 5 — Add Your Circle (Optional)**
- Invite family members via email or phone
- Set access levels
- Invite doctors
- Can skip and do later

**Step 6 — Set Up Medications (Optional)**
- Add current medications
- Set schedules
- Can import from doctor's prescription photo

**Step 7 — Notification Preferences**
- Set wake time, meal times, sleep time
- System generates smart reminder schedule
- User can customise each reminder

---

### 6.2 Home Dashboard

**Header Section**
- Personalised greeting with time of day
- Today's date
- Quick access to family and settings

**Daily Health Score**
- Circular progress ring — 0 to 100
- Score breakdown: Water, Medications, Exercise, Diet, Sleep
- Colour coded: Green 80+, Yellow 60-79, Red below 60
- Score label: Excellent, Good, Fair, Needs Improvement

**Quick Stats Cards (2x2 grid)**
- Water intake vs daily goal
- Medications taken vs total
- Today's symptom count or status
- Exercise status

**Quick Action Buttons**
- Add Water
- Log Symptom
- Mark Medication
- Add Note

**Active Alerts**
- Any red flag symptoms
- Missed medications
- Upcoming appointments
- Overdue lab tests

**Today's Schedule**
- Time-based task list
- Auto-generated from user's profile
- Check off completed items

**Recent Family Activity**
- Who checked your profile
- Latest messages
- Tap to open full family screen

**Health Plan Highlight**
- Top recommendation for today
- Based on latest anomalies

---

### 6.3 Report Intelligence Engine

**Upload Interface**
- Camera capture button (mobile)
- File upload button
- PDF support
- Multiple pages supported
- Progress indicator during processing

**AI Processing Pipeline**
```
1. Image/PDF received
2. Text extraction (OCR if image)
3. Claude API called with extracted text
4. Parameters identified and parsed
5. Values mapped to standard parameter names
6. Reference ranges looked up by age and gender
7. Status assigned: normal / borderline / abnormal / critical
8. Trend calculated vs previous report (if exists)
9. Plain language explanation generated per anomaly
10. Health plan updated based on new anomalies
11. Notifications sent to patient and family if urgent
12. Report marked as processed
```

**Report Display**
- Original report image viewable
- Extracted parameters in clean table
- Status badges: Normal, Watch, Concern, Critical
- Trend arrows: Improving, Stable, Worsening
- Plain language explanation per parameter
- AI-generated overall summary
- Recommendations section

**Parameter Categories Auto-Detected**
- Kidney Function: Creatinine, eGFR, BUN, Urea
- Liver Function: ALT, AST, ALP, GGT, Bilirubin, Albumin
- Blood Count: Hemoglobin, WBC, Platelets, RBC, MCV
- Lipids: Total Cholesterol, HDL, LDL, Triglycerides
- Diabetes: Fasting Glucose, HbA1c, Post-Prandial Glucose
- Thyroid: TSH, T3, T4
- Vitamins: Vitamin D, Vitamin B12, Folate, Iron, Ferritin
- Cardiac: Troponin, CK-MB, BNP, hs-CRP
- Electrolytes: Sodium, Potassium, Calcium, Magnesium
- Urine: Protein, Glucose, RBC, WBC, Specific Gravity
- Hormones: Testosterone, Estrogen, FSH, LH, Cortisol
- Any other parameter: Extracted and tracked generically

**Trend View**
- Line graph per parameter over time
- Normal range band shown as green zone
- All historical values plotted
- Percentage change from first to latest
- Projected trend line

---

### 6.4 Medication Manager

**Medication List**
- All active medications displayed
- Grouped by time of day
- One-tap mark as taken
- Undo option (30 second window)
- Visual indicator: taken / missed / upcoming

**Add Medication**
- Name (searchable database or custom entry)
- Dose and unit
- Frequency: daily / alternate days / weekly / custom
- Custom schedule builder (specific days of week, specific dates)
- Start and end date
- Linked condition (optional)
- Notes
- Photo of prescription (stored)

**Compliance Tracking**
- Daily compliance percentage
- Weekly compliance graph
- Monthly compliance heat map
- Missed dose log with reasons
- Streak counter per medication

**Smart Features**
- Injection course countdown (Day X of N)
- Refill reminder N days before running out
- Drug interaction warnings (basic — v2 feature)
- Prescription photo storage

---

### 6.5 Symptom Tracker

**Symptom Library**
- Searchable list of common symptoms
- Custom symptom entry
- Organised by body system

**Common Symptoms Included**
- Urinary: Frequency, urgency, color, volume, pain, burning
- Digestive: Heartburn, nausea, bloating, pain
- Neurological: Numbness, tingling, headache, dizziness
- Musculoskeletal: Joint pain, back pain, muscle weakness
- General: Fatigue, fever, weight change, swelling
- Cardiac: Chest pain, palpitations, breathlessness
- Any custom symptom

**Symptom Log Entry**
- Select symptom(s)
- Rate severity 1 to 10
- Add context (location, time, trigger)
- Custom metadata per symptom type
- Notes field

**Pattern Analysis**
- Frequency chart over time
- Severity trend
- Time of day distribution
- Correlation with medications
- Correlation with diet entries
- Correlation with exercise
- Environment factors (weather, location)

**Red Flag Detection**
- Predefined critical symptom combinations
- Auto-alert to patient with doctor contact
- Optional auto-alert to family

---

### 6.6 Water Intake Tracker

**Logging**
- Quick add buttons: 100ml, 200ml, 250ml, 500ml
- Custom amount entry
- Fluid type: Water, Coconut water, Soup, Juice, Other
- Time auto-recorded

**Visual Display**
- Animated progress towards daily goal
- Daily goal configurable (default 2500ml)
- Colour changes as goal approaches
- Streak counter

**Smart Reminders**
- Hourly check if falling behind schedule
- No reminders after user-set bedtime
- Morning reminder to start hydrating
- Contextual: hot weather or exercise detected → extra reminder

---

### 6.7 Exercise Tracker

**Exercise Types**
- Walking (with optional GPS tracking)
- Running
- Cycling
- Swimming
- Yoga / Stretching
- Strength Training
- Custom exercise

**Logging**
- Start / Stop timer
- GPS tracking for outdoor activities
- Manual entry for past activities
- Duration and distance
- Intensity: Light, Moderate, Intense
- Notes

**Specific Therapeutic Exercises**
- Users can add doctor-prescribed exercises
- Set rep and set targets
- Track completion
- Example: Kegel exercises, physiotherapy routines

**Stats**
- Weekly exercise calendar heat map
- Total active minutes this week
- Streak counter
- Distance covered this month
- Calories estimate

---

### 6.8 Diet Tracker

**Daily Compliance**
- User-defined daily diet rules
- Simple checkbox interface
- Compliance score

**Meal Logging**
- Breakfast, Lunch, Dinner, Snacks
- Food search with basic nutritional data
- Photo logging option
- Quick add from recent foods

**Diet Rules (User Defined)**
- Users set their own dietary restrictions
- Based on their conditions and doctor advice
- Examples: No red meat, No caffeine, Eat dinner before 8pm
- System checks logs against rules
- Flags violations

**Food Intelligence (v2)**
- Purine content for uric acid tracking
- Potassium content for kidney patients
- Sodium content for hypertension
- Fibre content for diabetes
- Configurable based on user's conditions

---

### 6.9 Lab Results Dashboard

**Parameter Overview**
- All tracked parameters in one view
- Latest value + trend arrow
- Status badge per parameter
- Last tested date
- Next test due date (system calculated)

**Individual Parameter View**
- Full history graph
- Normal range band
- All data points plotted
- Percentage change over time
- Plain language explanation
- Related parameters linked
- Recommendations section

**Report History**
- All uploaded reports listed
- Sorted by date
- Filter by report type
- View original image
- Re-process option

**Comparison View**
- Select two dates
- Side by side parameter comparison
- What improved, what worsened
- Net health change score

---

### 6.10 Family Circle

**Patient Controls**
- Invite family members
- Set access level per person (1, 2, or 3)
- Toggle visibility per section
- View who accessed data and when
- Remove access anytime
- Pause sharing temporarily

**Family Dashboard (Web Primary)**
- Patient's name and profile photo
- Today's health score — large display
- Status summary: All good / Needs attention / Alert
- Medication compliance today
- Water intake progress
- Exercise done today
- Last app activity timestamp
- Active alerts if any

**Family Activity Feed**
- Real-time updates as patient logs data
- Milestone celebrations
- Weekly summary cards
- Streak achievements

**Messaging**
- Family sends messages and encouragement
- Patient sees messages on home screen
- Quick reactions: Heart, Thumbs up, Muscle, Prayer
- Doctor can send notes visible to family (if permitted)

**Alert System**
- Configurable alerts per family member
- Daily summary: Always on
- Missed medications: Configurable threshold
- Health score below threshold: Configurable
- Red flag symptom: Always on if access level 3
- Milestone achieved: Always on

---

### 6.11 Doctor Portal

**Patient Summary Card**
- Basic demographics
- Active conditions and medications
- Last visit date
- Next appointment

**Clinical Dashboard**
- All lab parameters with trends
- Medication compliance graph
- Symptom frequency patterns
- Recent reports uploaded

**Doctor Notes**
- Add clinical observations
- Mark as visible or private to patient
- Note types: Observation, Instruction, Target Update, Alert
- Timestamp and audit trail

**Target Management**
- Set or update health targets for any parameter
- Override system defaults
- Add clinical context note
- Patient notified of target updates

**Report Generation**
- Full clinical summary PDF
- Date range selectable
- Parameter trend report
- Medication compliance report
- Share via email or download

---

### 6.12 Progress and Achievements

**Health Score History**
- Daily score graph
- 7-day rolling average
- Monthly comparison
- All-time best score

**Streak System**
- Walk streak
- Medication streak
- Water goal streak
- Diet compliance streak
- Sleep goal streak
- Displayed on home screen and family view

**Milestone System**
- System-defined milestones (generic)
  - First report uploaded
  - 7-day medication streak
  - 30-day walk streak
  - First normal result after abnormal
  - Weight goal reached
  - Any parameter reaches target range
- Doctor-defined milestones
- Custom patient milestones
- Milestone notifications to family

**Weight Journey**
- Starting weight recorded
- Target weight set
- Weekly weigh-in prompts
- Progress bar and graph
- Estimated date of goal
- BMI tracker

---

### 6.13 Reports and Export

**Doctor Visit Report**
Auto-generated PDF containing:
- Patient demographics
- Report period covered
- Medication compliance percentage and graph
- Average daily water intake
- Exercise frequency
- Symptom summary with frequency and severity
- All lab results in report period with trends
- Health score trend
- Patient notes and concerns
- Doctor-ready format

**Personal Health Summary**
- Monthly health overview
- Key improvements
- Areas needing attention
- Recommendations for next month

**Export Options**
- PDF download
- Share via WhatsApp
- Share via email
- QR code for doctor to scan
- Print-friendly format

---

## 7. REPORT INTELLIGENCE ENGINE

### 7.1 Claude API Integration

**System Prompt (Report Processing)**
```
You are a medical report parser. Extract all lab parameters 
from the provided medical report text.

For each parameter return:
- parameter_name: standardised name
- value: numeric value only
- unit: measurement unit
- reference_min: lower bound of normal range
- reference_max: upper bound of normal range
- status: normal | borderline_low | borderline_high | 
          abnormal_low | abnormal_high | critical
- plain_language: one sentence explanation in simple terms
- category: kidney | liver | blood | lipids | diabetes | 
            thyroid | vitamins | cardiac | electrolytes | 
            urine | hormones | other

Patient context: Age {age}, Gender {gender}

Return JSON array only. No other text.
```

**Error Handling**
- Illegible report: Ask user to retake photo
- Partial extraction: Show what was extracted, allow manual completion
- Unknown parameters: Extract generically with category 'other'
- Processing failure: Retry once, then flag for manual review

### 7.2 Reference Range Database
- Standard ranges by age group and gender
- Sourced from WHO, ICMR, and major lab standards
- Overridable by doctor for individual patients
- Updated periodically

### 7.3 Anomaly Scoring
Each parameter scored:
- 0: Within normal range
- 1: Borderline (within 10% of limit)
- 2: Mildly abnormal (10-25% outside range)
- 3: Moderately abnormal (25-50% outside range)
- 4: Severely abnormal (>50% outside range)
- 5: Critical (requires immediate attention)

Overall report anomaly score = sum of individual scores

### 7.4 Dynamic Health Plan Generation
When anomaly detected:
1. Look up condition associated with parameter
2. Retrieve relevant dietary recommendations
3. Retrieve relevant exercise modifications
4. Retrieve relevant lifestyle changes
5. Check for conflicts with other active conditions
6. Generate prioritised recommendation list
7. Add to patient's active health plan
8. Set review date (typically next retest date)

---

## 8. API INTEGRATIONS

### 8.1 Claude API
- **Purpose:** Report text extraction and interpretation
- **Model:** claude-sonnet-4-5 (latest available)
- **Usage:** On report upload only — not real-time
- **Cost:** Approximately $0.01-0.05 per report
- **Fallback:** Manual parameter entry if API fails

### 8.2 Supabase
- **Database:** All structured health data
- **Auth:** OTP email login, Google OAuth
- **Storage:** Report images and PDFs
- **Realtime:** Family dashboard live updates
- **Edge Functions:** Scheduled notifications, score calculations

### 8.3 Web Push Notifications
- **Purpose:** Medication reminders, family alerts
- **Implementation:** Service Worker + Push API
- **Fallback:** Email notifications via Supabase

### 8.4 Future Integrations (v3+)
- Apple HealthKit
- Google Fit
- Fitbit / Garmin / Samsung Health
- WhatsApp Business API for alerts

---

## 9. NOTIFICATION SYSTEM

### 9.1 Notification Types

**Reminders (Scheduled)**
Generated from user's set wake time, meal times, and sleep time.
All times are relative — if user wakes at 6am or 8am, 
reminders adjust accordingly.

| Trigger | Message Template |
|---|---|
| Wake time | "Good morning {name}! Time for water and your morning activity 🌅" |
| 30 min after wake | "Breakfast time! Don't forget your morning medications 💊" |
| Injection day | "💉 Injection day — Day {x} of {n}. Arrange with nurse today" |
| Mid morning | "Mid morning check — have you hit 30% of your water goal? 💧" |
| Before lunch | "Lunch reminder — keep it in line with your health plan 🥗" |
| Afternoon | "Afternoon water check — staying hydrated? 💧" |
| Before dinner | "Dinner time! Remember: eat {n} hours before sleep 🍽️" |
| Evening meds | "Evening medications reminder 💊" |
| Pre-sleep | "Wind down time — stop fluids and screens soon 🌙" |
| Weekly weigh-in | "Weekly weigh-in day — hop on the scale! ⚖️" |
| Lab test due | "Your {parameter} retest is due this week 🧪" |

**Alerts (Event Triggered)**

| Event | Priority | Notification |
|---|---|---|
| Critical lab value uploaded | Urgent | Immediate alert with doctor contact |
| Red flag symptom logged | High | Alert with recommended action |
| Medications missed 2+ days | High | Gentle concern message |
| Health score below 40 | Medium | Encouragement + tips |
| Streak broken | Low | Motivational message |

**Milestones (Achievement Triggered)**

| Milestone | Message |
|---|---|
| 7-day medication streak | "One week of perfect medication compliance! 🎉" |
| 30-day walk streak | "30 days of walking — your nerves thank you! 💪" |
| Parameter reaches normal range | "{Parameter} is now in the normal range! 🌟" |
| First kg lost | "First kilogram down — keep going! ⚖️" |
| Report processed | "Your report is ready — {n} items found" |

### 9.2 Family Notifications

**Daily Summary (9 PM)**
```
{Patient name}'s health today:
Score: {score}/100
Medications: {taken}/{total} taken
Water: {amount}ml of {goal}ml
Exercise: {done/not done}
```

**Alert Notifications**
Only sent for access level 3 family members or if patient has enabled.
Urgent alerts sent regardless of access level.

### 9.3 Notification Preferences
- Each notification type can be toggled
- Quiet hours: No notifications between set times
- Urgent alerts bypass quiet hours
- Family can set their own notification preferences
- Doctor notifications: Weekly summary only by default

---

## 10. PRIVACY AND SECURITY

### 10.1 Data Ownership
- Patient owns 100% of their health data
- Data is never sold or shared with third parties
- No advertising based on health data
- Patient can export all data at any time
- Patient can delete account and all data permanently

### 10.2 Access Control
- Row Level Security enforced at database level
- Not just frontend — genuinely secure at data layer
- Family access revocable instantly
- Doctor access revocable instantly
- Audit log of all data access by family and doctors

### 10.3 Authentication
- OTP-based login — no passwords to forget or leak
- Google OAuth option
- Biometric authentication on supported devices
- Session timeout: 30 minutes inactive on web
- Persistent session on mobile (with biometric confirmation)

### 10.4 Data Encryption
- All data encrypted at rest (Supabase default)
- HTTPS enforced for all communications
- Report images encrypted in storage
- No sensitive data in localStorage
- API keys server-side only — never in client

### 10.5 Compliance
- HIPAA-aligned data handling practices
- GDPR-compliant data handling for international users
- Data residency: Supabase region selectable
- No third-party analytics on health data

---

## 11. DEVELOPMENT ROADMAP

### Phase 1 — Foundation (Weeks 1-4)
**Goal: Working app the patient uses daily**

- [ ] Project setup: React + Vite + TypeScript + Tailwind
- [ ] Supabase project creation and schema setup
- [ ] Authentication: OTP email login
- [ ] Basic profile creation
- [ ] Home dashboard with health score
- [ ] Medication tracker with daily logging
- [ ] Water intake tracker
- [ ] Basic symptom logger
- [ ] Push notification system
- [ ] Deploy to Vercel

**Deliverable:** Patient uses app daily for medications, water, symptoms

---

### Phase 2 — Intelligence (Weeks 5-8)
**Goal: Report upload and anomaly detection working**

- [ ] Report upload interface
- [ ] Claude API integration for report parsing
- [ ] Parameter extraction and storage
- [ ] Anomaly detection and flagging
- [ ] Lab results trend graphs
- [ ] Plain language explanations
- [ ] Health plan generation from anomalies
- [ ] Exercise tracker
- [ ] Diet compliance tracker
- [ ] Improved dashboard with insights

**Deliverable:** Upload any report, get instant insights and health plan

---

### Phase 3 — Circle (Weeks 9-12)
**Goal: Family and doctor access working**

- [ ] Family member invitation system
- [ ] Family dashboard (web)
- [ ] Access level configuration
- [ ] Real-time updates via Supabase Realtime
- [ ] Family messaging and reactions
- [ ] Doctor portal
- [ ] Doctor notes system
- [ ] Health target management
- [ ] Doctor visit report PDF generation
- [ ] Appointment calendar

**Deliverable:** Family sees live updates, doctor has clinical view

---

### Phase 4 — Polish (Weeks 13-16)
**Goal: Production-ready, delightful product**

- [ ] PWA: Installable on mobile home screen
- [ ] Offline mode with sync
- [ ] Streak and milestone system
- [ ] Weight tracking
- [ ] Sleep tracker
- [ ] Advanced pattern analysis
- [ ] Comparison view (two dates)
- [ ] Full notification system
- [ ] Performance optimisation
- [ ] Accessibility improvements
- [ ] Dark mode
- [ ] Onboarding flow polish

**Deliverable:** App ready to share with others

---

### Phase 5 — Scale (Month 5+)
**Goal: Generic platform for any user**

- [ ] Multi-language support
- [ ] Smartwatch integration
- [ ] Advanced food database with nutritional data
- [ ] Wearable data import
- [ ] Community features (optional)
- [ ] Healthcare provider integrations
- [ ] App Store and Play Store submission (React Native conversion)
- [ ] Admin dashboard

---

## 12. SUCCESS METRICS

### Product Health Metrics
| Metric | Target (3 months) |
|---|---|
| Daily active usage | 7 days per week |
| Medication compliance logged | > 90% of days |
| Reports uploaded | At least 1 per month |
| Family members active | At least 2 checking weekly |
| Session length | 2-5 minutes per day |
| Report processing accuracy | > 95% parameters correctly extracted |

### Health Outcome Metrics
These are patient-specific and set during onboarding based on anomalies found.
Generic examples:
- Anomalous parameters trending toward normal range
- Medication compliance improving month over month
- Symptom frequency reducing over time
- Exercise consistency increasing
- Weight trending toward target

---

## 13. FOLDER STRUCTURE

```
wellnest/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── CircularProgress.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   └── features/
│   │       ├── dashboard/
│   │       ├── medications/
│   │       ├── symptoms/
│   │       ├── water/
│   │       ├── exercise/
│   │       ├── diet/
│   │       ├── reports/
│   │       ├── family/
│   │       ├── doctor/
│   │       └── progress/
│   ├── screens/               # Full page screens
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
│   │   ├── FamilyScreen.tsx
│   │   ├── DoctorScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── store/                 # Zustand state management
│   │   ├── authStore.ts
│   │   ├── healthStore.ts
│   │   ├── medicationStore.ts
│   │   └── reportStore.ts
│   ├── services/              # External service integrations
│   │   ├── supabase.ts        # Supabase client
│   │   ├── claudeApi.ts       # Claude API calls
│   │   ├── reportParser.ts    # Report processing logic
│   │   └── notifications.ts   # Push notification service
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useHealth.ts
│   │   ├── useMedications.ts
│   │   └── useReports.ts
│   ├── utils/                 # Utility functions
│   │   ├── healthScore.ts     # Score calculation
│   │   ├── anomalyDetection.ts
│   │   ├── referenceRanges.ts # Normal ranges database
│   │   ├── dateHelpers.ts
│   │   └── formatters.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── health.types.ts
│   │   ├── user.types.ts
│   │   └── report.types.ts
│   ├── constants/             # App constants
│   │   ├── symptoms.ts        # Symptom library
│   │   ├── medications.ts     # Common medication database
│   │   └── referenceRanges.ts # Lab reference ranges
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/            # Database migrations
│   │   └── 001_initial_schema.sql
│   ├── functions/             # Supabase Edge Functions
│   │   ├── process-report/    # Report processing
│   │   └── send-notifications/ # Scheduled notifications
│   └── seed.sql               # Development seed data
├── .env.example               # Environment variables template
├── .env.local                 # Local environment (git ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 14. ENVIRONMENT VARIABLES

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API (server-side only — use Supabase Edge Function)
CLAUDE_API_KEY=your_claude_api_key

# App Config
VITE_APP_NAME=WellNest
VITE_APP_URL=https://wellnest.vercel.app
```

---

## 15. README STARTER

```markdown
# 🪺 WellNest

> Your health. Your circle. Your journey.

WellNest is a universal personal health tracking platform.
Upload any medical report, track daily health habits,
and keep your family and doctors informed.

## Features
- 📊 Smart report reading with AI (Claude API)
- 💊 Medication tracking and reminders
- 💧 Water intake tracking
- 📝 Symptom logging with pattern analysis
- 🏃 Exercise tracking
- 👨‍👩‍👧‍👦 Family circle with live updates
- 👨‍⚕️ Doctor portal
- 🏆 Streaks and milestones

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
   # Add your Supabase and Claude API keys

4. Run database migrations
   npx supabase db push

5. Start development server
   npm run dev

## Contributing
See CONTRIBUTING.md

## License
MIT
```

---

*WellNest PRD v2.0 — Generic Platform Edition*
*Created: March 2026*
*Status: Ready for Development*
