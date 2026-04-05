# CLAUDE.md — WellNest AI Assistant Guide

> This file provides AI assistants (Claude, Copilot, etc.) with the context needed to contribute effectively to the WellNest codebase.

---

## Project Overview

**WellNest** is a universal personal health tracking platform. It transforms medical reports into actionable insights, tracks daily health habits, connects patients with their family support circle, and keeps doctors informed — all in one privacy-first application.

**Tagline:** "Your health. Your circle. Your journey."

**Current Status:** Pre-implementation. The repository contains the full Product Requirements Document (`WellNest_PRD_v2.2.md`) and is ready for development. No source code exists yet.

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript (all source files are `.ts` / `.tsx`) |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Forms | React Hook Form |
| Charts | Recharts |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Build Tool | Vite |
| PWA | Vite PWA Plugin |

### Backend / Infrastructure
| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL) with Row Level Security |
| Authentication | Supabase Auth — OTP email login + Google OAuth |
| File Storage | Supabase Storage (reports, PDFs) |
| Realtime | Supabase Realtime (family dashboard live updates) |
| Report AI | Claude API (Anthropic) — `claude-sonnet-4-6` or latest |
| Edge Functions | Supabase Edge Functions (Deno/TypeScript) |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

### Development Tools
| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code quality and formatting |
| Vitest | Unit testing |
| Playwright | End-to-end testing |
| TypeScript | Static typing (`tsc --noEmit` for type checks) |

---

## Folder Structure

```
wellnest/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable, stateless UI components
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── CircularProgress.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ColorPicker.tsx          # v2.2 — urine color picker
│   │   │   ├── BodyDiagram.tsx          # v2.1 — spine/body diagram
│   │   │   └── SpineMap.tsx             # v2.2 — whole spine SVG (moved from reports)
│   │   ├── layout/            # Page-level structural components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   └── features/          # Feature-specific component groups
│   │       ├── dashboard/
│   │       ├── medications/
│   │       │   ├── MedicationList.tsx
│   │       │   ├── InjectionCourse.tsx          # v2.2
│   │       │   ├── InjectionCourseLog.tsx       # v2.2
│   │       │   └── SideEffectMonitor.tsx        # v2.2
│   │       ├── symptoms/
│   │       │   ├── SymptomLogger.tsx
│   │       │   ├── BackdateSelector.tsx         # v2.2
│   │       │   ├── EnvironmentCapture.tsx       # v2.2
│   │       │   ├── UrineColorLogger.tsx         # v2.2
│   │       │   ├── SymptomProgression.tsx       # v2.2
│   │       │   ├── NeurologicalSymptoms.tsx     # v2.1
│   │       │   └── SpinalSymptoms.tsx           # v2.1
│   │       ├── water/
│   │       ├── exercise/
│   │       │   ├── ExerciseLogger.tsx
│   │       │   ├── PhysiotherapyTracker.tsx     # v2.1
│   │       │   ├── SafeExerciseList.tsx         # v2.1
│   │       │   └── RestrictionWarning.tsx       # v2.1
│   │       ├── diet/
│   │       ├── reports/
│   │       │   ├── ReportUpload.tsx             # v2.2 — unified upload (lab + imaging)
│   │       │   ├── ReportTypeDetector.tsx       # v2.2 — auto-detect report type
│   │       │   ├── LabReportView.tsx            # v2.2 — was LabParameterView
│   │       │   ├── ImagingReportView.tsx        # v2.2 — was ImagingFindingView
│   │       │   ├── CriticalValueAlert.tsx       # v2.2
│   │       │   └── WholeSpineMap.tsx            # v2.2
│   │       ├── conditions/                      # v2.1
│   │       │   ├── ConditionWeb.tsx             # Visual graph
│   │       │   ├── ConditionCard.tsx            # List view
│   │       │   └── ConnectionDetail.tsx
│   │       ├── posture/                         # v2.1
│   │       │   ├── PostureTracker.tsx
│   │       │   ├── SitStandTimer.tsx
│   │       │   ├── PostureChecklist.tsx
│   │       │   └── SleepPositionLogger.tsx      # v2.2
│   │       ├── restrictions/                    # v2.1
│   │       │   ├── RestrictionsList.tsx
│   │       │   └── ActivityWarning.tsx
│   │       ├── appointments/                    # v2.2
│   │       │   ├── AppointmentCard.tsx
│   │       │   ├── VisitPreparation.tsx         # v2.2
│   │       │   └── PostVisitLogger.tsx          # v2.2
│   │       ├── family/
│   │       │   ├── FamilyCircle.tsx
│   │       │   ├── FamilyDashboard.tsx
│   │       │   └── FamilyImpact.tsx             # v2.2
│   │       ├── doctor/
│   │       │   ├── DoctorPortal.tsx
│   │       │   ├── NephrologyView.tsx           # v2.1
│   │       │   ├── UrologyView.tsx              # v2.1
│   │       │   ├── NeurologyView.tsx            # v2.1
│   │       │   └── CardiologyView.tsx           # v2.1
│   │       └── progress/
│   ├── screens/               # Full-page screen components
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
│   │   ├── ImagingScreen.tsx                    # v2.1
│   │   ├── ConditionsScreen.tsx                 # v2.1
│   │   ├── PostureScreen.tsx                    # v2.1
│   │   ├── AppointmentsScreen.tsx               # v2.2
│   │   ├── FamilyScreen.tsx
│   │   ├── DoctorScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── store/                 # Zustand state stores
│   │   ├── authStore.ts
│   │   ├── healthStore.ts
│   │   ├── medicationStore.ts
│   │   ├── injectionStore.ts                    # v2.2
│   │   ├── reportStore.ts
│   │   ├── imagingStore.ts                      # v2.1
│   │   ├── postureStore.ts                      # v2.1
│   │   ├── conditionStore.ts                    # v2.1
│   │   ├── appointmentStore.ts                  # v2.2
│   │   └── symptomProgressionStore.ts           # v2.2
│   ├── services/              # External service integrations
│   │   ├── supabase.ts              # Supabase client setup
│   │   ├── claudeApi.ts             # Claude API integration
│   │   ├── reportTypeDetector.ts    # Auto report type detection (v2.2)
│   │   ├── labReportParser.ts       # Lab report processing pipeline
│   │   ├── imagingReportParser.ts   # Imaging report processing pipeline (v2.1)
│   │   ├── criticalValueChecker.ts  # Critical value alerts (v2.2)
│   │   ├── conditionConnections.ts  # Condition connection engine (v2.1)
│   │   ├── visitPreparation.ts      # Doctor visit prep assistant (v2.2)
│   │   ├── sideEffectGuidance.ts    # Medication side effect guidance (v2.2)
│   │   ├── sleepPositionRecommender.ts  # Sleep position recommendations (v2.2)
│   │   └── notifications.ts         # Push notification service
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useHealth.ts
│   │   ├── useMedications.ts
│   │   ├── useInjectionCourse.ts                # v2.2
│   │   ├── useReports.ts
│   │   ├── useImaging.ts                        # v2.1
│   │   ├── usePosture.ts                        # v2.1
│   │   ├── useConditions.ts                     # v2.1
│   │   ├── useSymptomProgression.ts             # v2.2
│   │   ├── useEnvironmentalTriggers.ts          # v2.2
│   │   └── useVisitPreparation.ts               # v2.2
│   ├── utils/                 # Pure utility functions
│   │   ├── healthScore.ts           # Score calculation logic
│   │   ├── anomalyDetection.ts
│   │   ├── criticalValueLogic.ts                # v2.2
│   │   ├── imagingAnalysis.ts                   # v2.1
│   │   ├── spineMapRenderer.ts                  # v2.2
│   │   ├── conditionConnections.ts              # v2.1
│   │   ├── spineAnalysis.ts                     # v2.1
│   │   ├── exerciseRestrictions.ts              # v2.1
│   │   ├── urineColorGuidance.ts                # v2.2
│   │   ├── symptomBackdating.ts                 # v2.2
│   │   ├── referenceRanges.ts
│   │   ├── dateHelpers.ts
│   │   └── formatters.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── health.types.ts
│   │   ├── user.types.ts
│   │   ├── report.types.ts
│   │   ├── imaging.types.ts                     # v2.1
│   │   ├── injection.types.ts                   # v2.2
│   │   └── appointment.types.ts                 # v2.2
│   ├── constants/             # App-wide constants
│   │   ├── symptoms.ts        # Symptom library (updated v2.1 — neurological + spinal)
│   │   ├── imagingTypes.ts                      # v2.1
│   │   ├── spineFindings.ts                     # v2.1
│   │   ├── exerciseLibrary.ts                   # v2.1
│   │   ├── urineColors.ts                       # v2.2
│   │   ├── sideEffects.ts                       # v2.2
│   │   ├── sleepPositions.ts                    # v2.2
│   │   ├── criticalValues.ts                    # v2.2
│   │   ├── medications.ts     # Common medication database
│   │   └── referenceRanges.ts # Lab reference ranges
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_imaging_schema.sql               # v2.1
│   │   └── 003_v22_additions.sql                # v2.2
│   ├── functions/
│   │   ├── detect-report-type/          # Edge Function: auto report type detection (v2.2)
│   │   ├── process-lab-report/          # Edge Function: Claude API lab report processing
│   │   ├── process-imaging-report/      # Edge Function: Claude API imaging processing (v2.1)
│   │   ├── check-critical-values/       # Edge Function: critical value alerts (v2.2)
│   │   ├── generate-condition-connections/  # Edge Function: condition engine (v2.1)
│   │   ├── generate-visit-preparation/  # Edge Function: doctor visit prep (v2.2)
│   │   ├── generate-side-effect-guidance/   # Edge Function: side effect guidance (v2.2)
│   │   └── send-notifications/          # Edge Function: scheduled reminders
│   └── seed.sql
├── .env.example
├── .env.local                 # Git-ignored; never commit
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## NPM Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build locally
npm run type-check   # TypeScript check (tsc --noEmit)
npm run lint         # ESLint over src/
npm run format       # Prettier over src/
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run db:push      # Apply Supabase migrations
npm run db:seed      # Seed development database
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values. Never commit `.env.local`.

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API — server-side only, used in Supabase Edge Functions
CLAUDE_API_KEY=your_claude_api_key

# App
VITE_APP_NAME=WellNest
VITE_APP_URL=https://wellnest.vercel.app

# Feature Flags (v2.1)
VITE_ENABLE_IMAGING=true
VITE_ENABLE_CONDITION_WEB=true
VITE_ENABLE_POSTURE_TRACKER=true
VITE_POSTURE_REMINDER_INTERVAL_MINUTES=45

# Feature Flags (v2.2)
VITE_ENABLE_INJECTION_COURSE=true
VITE_ENABLE_VISIT_PREP=true
VITE_ENABLE_SIDE_EFFECT_MONITOR=true
VITE_ENABLE_SPINE_MAP=true
VITE_ENABLE_SYMPTOM_BACKDATING=true
VITE_ENABLE_ENVIRONMENTAL_TRIGGERS=true
```

**Security rule:** `CLAUDE_API_KEY` must only be used inside Supabase Edge Functions, never exposed to the browser. Vite exposes any variable prefixed with `VITE_` to the client bundle.

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `DashboardScreen.tsx`, `CircularProgress.tsx` |
| Utility files | camelCase | `healthScore.ts`, `dateHelpers.ts` |
| Type definition files | PascalCase with `.types.ts` | `health.types.ts` |
| Zustand stores | camelCase with `Store` suffix | `authStore.ts` |
| Custom hooks | camelCase with `use` prefix | `useAuth.ts`, `useReports.ts` |
| Constants | PascalCase for exported values | `SymptomLibrary`, `ReferenceRanges` |
| Database tables | snake_case | `medication_logs`, `lab_parameters` |
| TypeScript interfaces | PascalCase | `LabReport`, `HealthScore` |

---

## Architecture Conventions

### Components
- All components are functional with hooks — no class components.
- `src/components/ui/` — purely presentational, no data fetching.
- `src/components/features/` — may use hooks and stores.
- `src/screens/` — top-level route targets; compose features and layout components.

### State Management (Zustand)
- One store per domain: `authStore`, `healthStore`, `medicationStore`, `injectionStore`, `reportStore`, `imagingStore`, `postureStore`, `conditionStore`, `appointmentStore`, `symptomProgressionStore`.
- Stores handle async actions internally (no separate thunks/sagas).
- Prefer co-locating selectors near their store definition.

### Data Fetching
- All Supabase queries live in `src/services/supabase.ts` or feature-specific service files.
- Custom hooks in `src/hooks/` wrap service calls and expose loading/error/data state.
- Never call Supabase directly from component render logic.

### Claude API
- All Claude API calls are routed through Supabase Edge Functions.
- Report type detection → `detect-report-type` Edge Function (v2.2).
- Lab reports → `process-lab-report` Edge Function.
- Imaging reports → `process-imaging-report` Edge Function (v2.1).
- Critical value checking → `check-critical-values` Edge Function (v2.2).
- Condition connections → `generate-condition-connections` Edge Function (v2.1).
- Visit preparation → `generate-visit-preparation` Edge Function (v2.2).
- Side effect guidance → `generate-side-effect-guidance` Edge Function (v2.2).
- The frontend calls Edge Function endpoints, not the Claude API directly.
- Service layer in `src/services/claudeApi.ts` handles Edge Function calls.

---

## Database Schema Summary

Core tables (full SQL in `supabase/migrations/`):

**Users & Access**
- `users` — patient profiles (id, email, name, dob, gender, height, weight)
- `family_members` — family access with patient-controlled visibility flags
- `doctors` — doctor profiles linked to patients with specialty tagging

**Daily Health Tracking**
- `medications` — medication schedules (includes `known_side_effects` field)
- `medication_logs` — daily compliance records
- `injection_courses` — injection course config: total doses, frequency, start/end dates, post-course transition (v2.2)
- `injection_course_logs` — per-dose records with who administered and side effects noted (v2.2)
- `medication_side_effect_logs` — side effect logging with severity and source (experienced vs read-about) (v2.2)
- `water_logs` — fluid intake
- `symptom_logs` — symptom entries with severity, backdated onset, and environment metadata (v2.2)
- `symptom_progression` — aggregated per-symptom trend tracking over time (v2.2)
- `exercise_logs` — activity (type, duration, distance, physiotherapy flag)
- `weight_logs` — weight over time
- `diet_logs` — meal compliance
- `sleep_logs` — sleep duration, quality, position compliance, and head elevation flag (v2.2)

**Lab Report Intelligence**
- `lab_reports` — uploaded lab report metadata (includes auto-detected type and confidence, v2.2)
- `lab_parameters` — individual extracted numeric parameters with split `critical_low`/`critical_high` status (v2.2)
- `health_targets` — system/doctor-defined targets per parameter
- `health_plans` — AI-generated recommendations (includes posture, physiotherapy, spine plan types)

**Imaging Report Intelligence (v2.1)**
- `imaging_reports` — uploaded imaging report metadata with auto-detected type (v2.2)
- `imaging_findings` — individual findings with standardised spinal level and region fields (v2.2)

**Activity & Posture (v2.1)**
- `activity_restrictions` — doctor-prescribed activity restrictions with severity
- `posture_logs` — sit-stand session compliance tracking

**Condition Intelligence (v2.1)**
- `condition_connections` — causal/correlational links between conditions, findings, and symptoms

**Communication**
- `messages` — family encouragement messages
- `family_engagement_logs` — family check-in activity log for impact tracking (v2.2)
- `family_impact_scores` — daily correlation between family engagement and patient health score (v2.2)
- `doctor_notes` — clinical notes
- `appointments` — scheduled appointments with pre-visit report and post-visit notes fields (v2.2)
- `visit_preparations` — AI-generated pre-visit guide per appointment (v2.2)
- `notifications` — in-app notification records with `critical` priority and acknowledgment requirement (v2.2)

**Gamification**
- `streaks` — consecutive-day streaks per activity (includes posture and physiotherapy)
- `milestones` — achievements unlocked
- `daily_scores` — daily health score breakdown (0–100, includes posture score)

### Row Level Security (RLS)
All tables have RLS enabled. Security policies enforce:
- Patients read/write only their own rows.
- Family members read only sections the patient has permitted.
- Doctors read only clinical data for their linked patients (filtered by specialty).
- Never bypass RLS in application code — enforce at the database level.

---

## Report Intelligence Pipeline

### Report Type Auto-Detection (v2.2)
Before processing, every uploaded report goes through auto-detection:

1. File uploaded to Supabase Storage.
2. Frontend calls `detect-report-type` Edge Function.
3. Claude reads the report and returns `detected_type` and `detection_confidence` (0–1).
4. User confirms or corrects — then the appropriate processing pipeline runs.

Target accuracy: >95% correct type detection.

### Lab Reports (Numeric Values)
When a user uploads a lab report (blood test, urine analysis):

1. File uploaded to Supabase Storage.
2. Frontend calls `process-lab-report` Edge Function with file reference.
3. Edge Function reads file, performs OCR if needed.
4. Text sent to Claude API with structured lab extraction prompt.
5. Claude returns extracted parameters (name, value, unit, reference range, status).
6. Parameters saved to `lab_parameters` table.
7. Anomaly detection flags borderline/abnormal/critical values.
8. `check-critical-values` Edge Function triggers bidirectional critical alerts if needed (v2.2).
9. Health plan updated in `health_plans` based on anomalies.
10. Condition connection engine triggered.
11. Notifications dispatched if critical values found — require acknowledgment if critical (v2.2).
12. Dashboard health score recalculated.

Target accuracy: >95% of parameters correctly extracted.

### Imaging Reports (Descriptive Findings — v2.1)
When a user uploads an imaging report (MRI, CT, Ultrasound, NCS, etc.):

1. File uploaded to Supabase Storage.
2. Frontend calls `process-imaging-report` Edge Function.
3. Edge Function reads file, performs OCR if needed.
4. Text sent to Claude API with structured imaging extraction prompt.
5. Claude returns normal findings, abnormal findings (with location, severity, nerves affected, linked symptoms), and critical findings.
6. Findings saved to `imaging_reports` and `imaging_findings` tables.
7. Surgical urgency language detected — immediate alert if found.
8. Condition connection engine triggered.
9. Health plan updated with imaging-specific guidance.
10. Notifications dispatched if critical finding detected.

Target accuracy: >90% of findings correctly extracted.

### Condition Connection Engine (v2.1)
After every report processed:

1. `generate-condition-connections` Edge Function called with all patient findings.
2. Claude identifies causal/correlational links between findings, symptoms, and lab values.
3. New connections stored in `condition_connections` table.
4. Patient notified of new connections in plain language.
5. Family and doctor see specialty-appropriate connection summaries.

---

## Health Score Calculation

Daily health score (0–100) breaks down across components:

| Component | Points |
|---|---|
| Medication compliance | 25 |
| Water intake vs goal | 20 |
| Exercise completion | 20 |
| Diet compliance | 20 |
| Posture compliance (v2.1) | 15 |

Logic lives in `src/utils/healthScore.ts`.

---

## User Roles

| Role | Data Access |
|---|---|
| Patient | Full read/write own data; controls family/doctor visibility |
| Family Member | Read-only; only sections patient permits; can send messages |
| Doctor | Read-only clinical data filtered by specialty; can add notes, set targets and restrictions |

### Doctor Specialty Views (v2.1)
- **Nephrologist** — kidney parameters, electrolytes, urine analysis, fluid intake
- **Urologist** — urinary frequency logs, environmental trigger correlation (AC vs non-AC), urine color trend, uroflowmetry, bladder diary, PSA, ultrasound findings (v2.2: env triggers + color)
- **Neurologist/Spine Specialist** — NCS results, whole spine visual map, symptom logs with onset dates, symptom progression charts, leg symptom history (backdated), exercise compliance, activity restrictions, sleep position compliance, environmental triggers (v2.2: full progression + backdating + spine map)
- **Cardiologist** — lipid profile, cardiac markers, ECG/Echo findings, blood pressure, exercise logs
- **General** — full clinical summary, all reports, all medications

---

## Security Rules

- OTP-based authentication only (no password storage).
- `CLAUDE_API_KEY` is server-side only — Supabase Edge Function context.
- All RLS policies enforced at the database level, not the frontend.
- Supabase Anon Key is safe to expose to the browser; it is scoped by RLS.
- File uploads validated by type and size before sending to Supabase Storage.
- Session timeout: 30 minutes inactivity on web.
- Never log PHI (personally identifiable health information) to console or external services.
- Imaging report access follows the same RLS rules as lab data.

---

## Development Phases

| Phase | Weeks | Goal |
|---|---|---|
| 1 — Foundation | 1–4 | Auth, Dashboard (with posture score), Medication/Water/Symptom trackers (with backdating + urine color), Injection course manager, Activity restrictions display, Posture sit-stand timer, Sleep position logger |
| 2 — Intelligence | 5–8 | Auto report type detection, Lab + Imaging report Claude parsing, Critical value bidirectional alerts, Anomaly detection, Whole spine visual map, Symptom severity progression, Environmental trigger tracking, Condition connection engine, Posture tracker, Physiotherapy tracker, Side effect monitor |
| 3 — Circle | 9–12 | Family dashboard (with spine map + impact tracking), Multi-specialist Doctor portal, Restriction management, Physiotherapy prescription, Doctor visit preparation assistant, Post-visit logger |
| 4 — Polish | 13–16 | PWA, offline mode, all streaks (posture + PT), dark mode, performance |
| 5 — Scale | Month 5+ | Multi-language, wearables, app stores |

---

## Testing

- Unit tests: Vitest, co-located with source or in a `tests/` directory.
- E2E tests: Playwright, in `tests/e2e/`.
- Run `npm test` before committing. Run `npm run type-check` and `npm run lint` as well.
- Key areas to test: health score calculation (including posture component), lab report parameter extraction, imaging report finding extraction, auto report type detection accuracy, critical value alert triggering, condition connection logic, RLS policy correctness, medication compliance logic, injection course scheduling, symptom backdating logic, environmental trigger correlation, visit preparation generation, anomaly detection edge cases, surgical urgency detection.

---

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/<short-description>`
- The active development branch: `claude/review-v2.2-changes-EQx4n`
- Commit messages: imperative mood, present tense (`Add imaging report pipeline`, `Fix health score calculation`)
- Never commit `.env.local`, API keys, or PHI test data.

---

## Claude API Prompt Templates

Use these exact prompts in the corresponding Edge Functions. Do not paraphrase or shorten them — precision matters for medical data extraction.

### Report Type Detection Prompt

```
You are a medical report type detector.
Identify what type of medical report this is.

Return JSON only — no other text:
{
  "detected_type": string,
  "confidence": number,
  "key_indicators": string[],
  "suggested_label": string,
  "pipeline": "lab" | "imaging"
}

Valid detected_type values:
"blood_test", "urine_analysis", "mri_lumbar", "mri_cervical",
"mri_thoracic", "mri_whole_spine", "mri_brain", "mri_joint",
"ct_scan", "ultrasound_abdomen", "ultrasound_pelvis",
"xray_chest", "xray_spine", "echo_cardiac", "ecg",
"endoscopy_upper_gi", "endoscopy_lower_gi", "uroflowmetry",
"ncs_emg", "dexa", "other_lab", "other_imaging"

confidence: 0.0 to 1.0 — how certain you are.
key_indicators: 2–5 words or phrases that led to your decision.
suggested_label: human-readable label e.g. "MRI Lumbar Spine — March 2026".
pipeline: "lab" if the report contains numeric values to extract;
          "imaging" if the report contains descriptive findings.

Patient context: Age {age}, Gender {gender}
```

### Lab Report Extraction Prompt

```
You are a medical lab report parser.
Extract all numeric parameters from this report.

For each parameter return an object in this exact shape:
{
  "parameter_name": string,
  "value": number,
  "unit": string,
  "reference_min": number | null,
  "reference_max": number | null,
  "status": "normal" | "borderline_low" | "borderline_high" |
            "abnormal_low" | "abnormal_high" |
            "critical_low" | "critical_high",
  "plain_language": string,
  "category": "kidney" | "liver" | "blood" | "lipids" |
              "diabetes" | "thyroid" | "vitamins" | "cardiac" |
              "electrolytes" | "urine" | "hormones" | "other"
}

Status rules:
- normal: within reference range
- borderline_low / borderline_high: within 10% of the limit
- abnormal_low / abnormal_high: outside range but not critical
- critical_low / critical_high: dangerously outside range
  (e.g. sodium < 125, potassium > 6.5, glucose < 50)

plain_language: one sentence in simple non-clinical English
  explaining what this value means for the patient.

parameter_name: use the standardised English name
  (e.g. "Creatinine", "eGFR", "Vitamin D", "Hemoglobin").

Patient context: Age {age}, Gender {gender}
Return a JSON array only. No preamble, no explanation.
```

### Imaging Report Extraction Prompt

```
You are a medical imaging report parser.
Extract all findings from this report.

Return a single JSON object in this exact shape — no other text:
{
  "imaging_type": string,
  "body_region": string,
  "normal_findings": string[],
  "abnormal_findings": [
    {
      "location": string,
      "spinal_level": string | null,
      "spinal_region": "cervical" | "thoracic" | "lumbar" | "sacral" | null,
      "finding_type": string,
      "severity": "mild" | "moderate" | "severe",
      "laterality": "left" | "right" | "bilateral" | "central" | "not_applicable",
      "description": string,
      "plain_language": string,
      "nerves_affected": string[],
      "linked_symptoms": string[],
      "surgical_urgency": boolean
    }
  ],
  "critical_findings": string[],
  "surgical_urgency": boolean,
  "follow_up_recommended": boolean,
  "follow_up_timeline": string | null,
  "overall_summary": string
}

spinal_level: use standard notation e.g. "L4-L5", "C5-C6", "D8-D9".
  Null if not a spinal finding.
finding_type: short descriptor e.g. "disc_bulge", "disc_protrusion",
  "nerve_compression", "osteophyte", "facet_arthrosis", "polyp", "cyst",
  "fatty_liver", "hiatus_hernia", "cord_compression", "schmorls_node".
description: radiologist's exact words from the report.
plain_language: one sentence in simple non-clinical English.
nerves_affected: list nerve levels e.g. ["L4", "L5", "S1"].
linked_symptoms: list symptoms this finding may cause
  e.g. ["leg_pain", "urinary_frequency", "numbness", "back_pain"].
surgical_urgency: true only if report contains language such as
  "cauda equina", "cord compression with signal change",
  "complete canal stenosis", "malignant", "metastasis", "urgent surgical".
overall_summary: 2–3 sentences plain-language summary for the patient.

Patient context: Age {age}, Gender {gender}
Return JSON only. No preamble, no explanation.
```

### Condition Connection Prompt

```
You are a medical knowledge engine.
Given a patient's health findings, identify meaningful
causal or correlational connections between them.

Patient findings:
{all_findings_json}

For each meaningful connection return:
{
  "source_condition": string,
  "source_label": string,
  "target_condition": string,
  "target_label": string,
  "connection_type": "causes" | "worsens" | "correlates" | "compounds",
  "plain_language": string,
  "evidence_source": "lab_report" | "imaging" | "symptom_pattern" | "clinical"
}

source_condition / target_condition: short code e.g. "low_b12",
  "l4_l5_disc_bulge", "peripheral_neuropathy", "urinary_frequency".
source_label / target_label: human-readable e.g. "Low Vitamin B12".
plain_language: one simple sentence e.g.
  "Low B12 damages the protective myelin sheath around nerves,
  slowing their conduction speed."

Only include connections that are clinically meaningful and
supported by the patient's actual findings.
Do not invent connections not supported by the data.

Patient context: Age {age}, Gender {gender}
Return a JSON array only. No preamble, no explanation.
```

---

## Error Handling Conventions

Apply these patterns consistently across all services, hooks, and components.

### Supabase Errors

```typescript
// Standard pattern for all Supabase calls
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('patient_id', patientId)

  if (error) throw error
  return data
} catch (err) {
  // Log type and code only — never log PHI or raw data
  console.error('[Supabase error]', {
    code: (err as any)?.code,
    message: (err as any)?.message,
  })
  // Surface a safe, generic message to the UI
  throw new Error('Unable to load data. Please try again.')
}
```

Rules:
- RLS violations (`PGRST301`) — treat as "not found", never reveal why.
- Network errors — show retry UI, never show raw error message to user.
- Never log PHI or query result contents to console.
- Log only in development (`import.meta.env.DEV`).

### Claude API / Edge Function Errors

```typescript
// Standard pattern for Edge Function calls
try {
  const response = await fetch('/functions/v1/process-lab-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId }),
  })

  if (!response.ok) {
    throw new Error(`Edge Function error: ${response.status}`)
  }

  return await response.json()
} catch (err) {
  // Mark report as failed in database
  await supabase
    .from('lab_reports')
    .update({ processing_status: 'failed' })
    .eq('id', reportId)

  // Show fallback UI — always offer manual entry
  throw new Error('REPORT_PROCESSING_FAILED')
}
```

Rules:
- Retry once automatically before marking as failed.
- Always provide manual entry fallback when report processing fails.
- Show user: "We could not read this report automatically. You can enter values manually."
- Never silently swallow a Claude API failure.

### Critical Value Errors

- If the `check-critical-values` Edge Function fails — log the failure but still display the raw value to the user with a note to review with their doctor.
- Never suppress a potentially critical value due to a processing error.
- Queue failed critical alerts for retry — do not discard.

### Network Offline

```typescript
// In App.tsx — global offline detection
window.addEventListener('offline', () => {
  useHealthStore.getState().setOffline(true)
})
window.addEventListener('online', () => {
  useHealthStore.getState().setOffline(false)
  useHealthStore.getState().syncPendingLogs()
})
```

Rules:
- Show persistent offline banner when `navigator.onLine === false`.
- Accept all user log actions (medication, water, symptom, exercise) while offline — queue locally.
- Sync silently on reconnection — no user action required.
- Never block the user from logging due to network state.
- Report upload and Claude API calls require connectivity — show clear message if attempted offline.

### Form Validation

- Use React Hook Form validation exclusively — no manual DOM validation.
- Show inline errors immediately on blur, not on submit.
- Never clear a form on a failed submission — preserve user input.
- Medical date fields (onset date, appointment date) must validate against logical ranges — no future dates for onset, no past dates for appointments.

---

## Supabase Realtime Pattern

Use this exact pattern for all realtime subscriptions. Deviating from it causes memory leaks and stale subscriptions.

```typescript
// Example: useFamilyDashboard.ts
import { useEffect } from 'react'
import { supabase } from '@/services/supabase'

export function useFamilyDashboard(patientId: string) {
  useEffect(() => {
    if (!patientId) return

    const channel = supabase
      .channel(`family-dashboard-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_scores',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          // Handle the incoming change
          // Update local Zustand store — do not call API again
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          // Log and attempt reconnect after delay
          setTimeout(() => channel.subscribe(), 5000)
        }
      })

    // Critical: always clean up on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])
}
```

Rules:
- Channel names must be unique and descriptive: `{feature}-{patientId}`.
- Never subscribe to a table without a `filter` scoped to `patient_id`.
- Always clean up in the `useEffect` return function — no exceptions.
- Handle `CHANNEL_ERROR` with exponential backoff, not infinite retry.
- Family members subscribe only to their linked patient's data — enforce via RLS, not just filter.
- Realtime is used for: `daily_scores`, `messages`, `notifications`, `family_engagement_logs`.
- Realtime is NOT used for: reports (processed async), lab parameters (polled after upload).

---

## PWA and Offline Strategy

### Offline-Capable Features (queue locally, sync on reconnect)

| Feature | Local Storage Key | Sync Priority |
|---|---|---|
| Medication logs | `pending_medication_logs` | High |
| Water intake logs | `pending_water_logs` | High |
| Symptom logs | `pending_symptom_logs` | High |
| Exercise logs | `pending_exercise_logs` | Medium |
| Posture logs | `pending_posture_logs` | Medium |
| Sleep logs | `pending_sleep_logs` | Medium |
| Diet logs | `pending_diet_logs` | Low |

### Requires Connectivity

- Report upload and Claude API processing
- Family dashboard realtime updates
- Doctor visit preparation generation
- Push notification delivery
- Initial authentication

### Offline UI Rules

- Show a persistent top banner when offline: "You're offline — logs will sync when reconnected."
- Pending items show a `⏳` indicator until synced.
- Never block the user from logging — always accept locally.
- On reconnect: sync silently in background, replace `⏳` with `✓`.
- Conflict resolution: server wins for read data; latest `created_at` timestamp wins for user logs.
- Do not cache health data in the Service Worker — only cache the app shell, static assets, and fonts.

### Service Worker Strategy

```javascript
// vite.config.ts — VitePWA plugin config
VitePWA({
  registerType: 'prompt', // Ask user before updating — do not auto-update health apps silently
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'CacheFirst',
      },
    ],
    // Do NOT cache Supabase API calls or Edge Function responses
  },
})
```

---

## Accessibility Standards

WellNest serves patients who may be unwell, elderly family members, and busy doctors. Accessibility is not optional.

### Requirements

- **Touch targets:** Minimum 44 × 44 px on all interactive elements.
- **Color independence:** Never use color as the only indicator of status. Always pair color with an icon and text label (e.g., critical values use red + ⚠️ + "Critical Low" — not just red).
- **Focus visibility:** All interactive elements must have a visible focus ring. Do not use `outline: none` without a custom focus style.
- **Font sizes:** Minimum 14px for body text, 12px for secondary labels. Never go below 11px for any visible text.
- **Contrast:** WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).
- **ARIA labels:** All icon-only buttons must have `aria-label`. All status indicators must have `aria-live` if they update dynamically.
- **Health score ring:** Must include `role="meter"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label="Daily health score"`.
- **Critical alerts:** Must be announced by screen readers immediately — use `role="alert"` or `aria-live="assertive"`.
- **Forms:** All inputs must have associated `<label>` elements — not just placeholders.
- **Images:** All non-decorative images and SVGs must have descriptive `alt` text. Spine map SVG regions must have `aria-label` for each clickable level.

### Screen Reader Priority Flows (test these)

1. Logging a medication as taken
2. Uploading a report and receiving the result
3. Viewing a critical value alert and acknowledging it
4. Reading the daily health score

---

## Medical Status Badge Standard

All lab parameter and imaging finding statuses use a single consistent visual system. Never create inline status styling — always use `src/components/ui/Badge.tsx`.

### Lab Parameter Status

| Status | Color | Icon | Text Label | Badge Variant |
|---|---|---|---|---|
| `normal` | Green | ✓ | Normal | `success` |
| `borderline_low` | Amber | ↓ | Watch | `warning` |
| `borderline_high` | Amber | ↑ | Watch | `warning` |
| `abnormal_low` | Orange | ↓↓ | Low | `caution` |
| `abnormal_high` | Orange | ↑↑ | High | `caution` |
| `critical_low` | Red + pulse | ⚠️ | Critical Low | `critical` |
| `critical_high` | Red + pulse | ⚠️ | Critical High | `critical` |

### Imaging Finding Severity

| Severity | Color | Spine Map Dot |
|---|---|---|
| `normal` | Grey | ○ |
| `mild` | Green | 🟢 |
| `moderate` | Amber | 🟡 |
| `severe` | Orange | 🟠 |
| `critical` | Red + pulse | 🔴 |

### Rules

- `critical` badges always animate with a subtle pulse (`animate-pulse` in Tailwind).
- `critical` notifications require explicit user acknowledgment before they can be dismissed.
- Color is always paired with an icon and text — never color alone.
- Import the `Badge` component: `import { Badge } from '@/components/ui/Badge'`.
- Pass `variant` prop — do not override colors with inline styles.

---

## Key Files for AI Assistants

| File | Purpose |
|---|---|
| `WellNest_PRD_v2.2.md` | Full product specification — ground truth for all features |
| `src/services/claudeApi.ts` | Claude API integration layer |
| `src/services/supabase.ts` | Supabase client and query helpers |
| `src/services/reportTypeDetector.ts` | Auto report type detection (v2.2) |
| `src/services/labReportParser.ts` | Lab report processing pipeline |
| `src/services/imagingReportParser.ts` | Imaging report processing pipeline (v2.1) |
| `src/services/criticalValueChecker.ts` | Critical value alert logic (v2.2) |
| `src/services/conditionConnections.ts` | Condition connection engine service (v2.1) |
| `src/services/visitPreparation.ts` | Doctor visit preparation service (v2.2) |
| `src/services/sideEffectGuidance.ts` | Medication side effect guidance (v2.2) |
| `src/utils/healthScore.ts` | Core health score logic |
| `src/utils/anomalyDetection.ts` | Lab parameter anomaly logic |
| `src/utils/criticalValueLogic.ts` | Critical value classification (v2.2) |
| `src/utils/imagingAnalysis.ts` | Imaging finding analysis logic (v2.1) |
| `src/utils/conditionConnections.ts` | Condition connection utilities (v2.1) |
| `supabase/migrations/001_initial_schema.sql` | Core database schema |
| `supabase/migrations/002_imaging_schema.sql` | Imaging + v2.1 additions schema |
| `supabase/migrations/003_v22_additions.sql` | v2.2 additions schema |
| `supabase/functions/detect-report-type/` | Auto type detection Edge Function (v2.2) |
| `supabase/functions/process-lab-report/` | Lab report Edge Function |
| `supabase/functions/process-imaging-report/` | Imaging report Edge Function (v2.1) |
| `supabase/functions/check-critical-values/` | Critical value alert Edge Function (v2.2) |
| `supabase/functions/generate-condition-connections/` | Condition connection Edge Function (v2.1) |
| `supabase/functions/generate-visit-preparation/` | Visit preparation Edge Function (v2.2) |
| `supabase/functions/generate-side-effect-guidance/` | Side effect guidance Edge Function (v2.2) |

When in doubt about feature behaviour, requirements, or data model details, refer to `WellNest_PRD_v2.2.md` as the authoritative source.
