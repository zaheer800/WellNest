# CLAUDE.md — WellNest AI Assistant Guide

> This file provides AI assistants (Claude, Copilot, etc.) with the context needed to contribute effectively to the WellNest codebase.

---

## Project Overview

**WellNest** is a universal personal health tracking platform. It transforms medical reports into actionable insights, tracks daily health habits, connects patients with their family support circle, and keeps doctors informed — all in one privacy-first application.

**Tagline:** "Your health. Your circle. Your journey."

**Current Status:** Pre-implementation. The repository contains the full Product Requirements Document (`WellNest_PRD_v2.1.md`) and is ready for development. No source code exists yet.

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
│   │   │   └── BodyDiagram.tsx        # v2.1 — spine/body diagram
│   │   ├── layout/            # Page-level structural components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   └── features/          # Feature-specific component groups
│   │       ├── dashboard/
│   │       ├── medications/
│   │       ├── symptoms/
│   │       │   ├── SymptomLogger.tsx
│   │       │   ├── NeurologicalSymptoms.tsx    # v2.1
│   │       │   └── SpinalSymptoms.tsx           # v2.1
│   │       ├── water/
│   │       ├── exercise/
│   │       │   ├── ExerciseLogger.tsx
│   │       │   ├── PhysiotherapyTracker.tsx    # v2.1
│   │       │   ├── SafeExerciseList.tsx         # v2.1
│   │       │   └── RestrictionWarning.tsx       # v2.1
│   │       ├── diet/
│   │       ├── reports/
│   │       │   ├── LabReportUpload.tsx
│   │       │   ├── ImagingReportUpload.tsx      # v2.1
│   │       │   ├── LabParameterView.tsx
│   │       │   ├── ImagingFindingView.tsx       # v2.1
│   │       │   └── SpineMap.tsx                 # v2.1
│   │       ├── conditions/                       # v2.1
│   │       │   ├── ConditionWeb.tsx             # Visual graph
│   │       │   ├── ConditionCard.tsx            # List view
│   │       │   └── ConnectionDetail.tsx
│   │       ├── posture/                          # v2.1
│   │       │   ├── PostureTracker.tsx
│   │       │   ├── SitStandTimer.tsx
│   │       │   ├── PostureChecklist.tsx
│   │       │   └── SleepPositionLogger.tsx
│   │       ├── restrictions/                     # v2.1
│   │       │   ├── RestrictionsList.tsx
│   │       │   └── ActivityWarning.tsx
│   │       ├── family/
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
│   │   ├── FamilyScreen.tsx
│   │   ├── DoctorScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── store/                 # Zustand state stores
│   │   ├── authStore.ts
│   │   ├── healthStore.ts
│   │   ├── medicationStore.ts
│   │   ├── reportStore.ts
│   │   ├── imagingStore.ts                      # v2.1
│   │   ├── postureStore.ts                      # v2.1
│   │   └── conditionStore.ts                    # v2.1
│   ├── services/              # External service integrations
│   │   ├── supabase.ts        # Supabase client setup
│   │   ├── claudeApi.ts       # Claude API integration
│   │   ├── labReportParser.ts        # Lab report processing pipeline
│   │   ├── imagingReportParser.ts    # Imaging report processing pipeline (v2.1)
│   │   ├── conditionConnections.ts   # Condition connection engine (v2.1)
│   │   └── notifications.ts   # Push notification service
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useHealth.ts
│   │   ├── useMedications.ts
│   │   ├── useReports.ts
│   │   ├── useImaging.ts                        # v2.1
│   │   ├── usePosture.ts                        # v2.1
│   │   └── useConditions.ts                     # v2.1
│   ├── utils/                 # Pure utility functions
│   │   ├── healthScore.ts     # Score calculation logic
│   │   ├── anomalyDetection.ts
│   │   ├── imagingAnalysis.ts                   # v2.1
│   │   ├── conditionConnections.ts              # v2.1
│   │   ├── spineAnalysis.ts                     # v2.1
│   │   ├── exerciseRestrictions.ts              # v2.1
│   │   ├── referenceRanges.ts
│   │   ├── dateHelpers.ts
│   │   └── formatters.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── health.types.ts
│   │   ├── user.types.ts
│   │   ├── report.types.ts
│   │   └── imaging.types.ts                     # v2.1
│   ├── constants/             # App-wide constants
│   │   ├── symptoms.ts        # Symptom library (updated v2.1 — neurological + spinal)
│   │   ├── imagingTypes.ts                      # v2.1
│   │   ├── spineFindings.ts                     # v2.1
│   │   ├── exerciseLibrary.ts                   # v2.1
│   │   ├── medications.ts     # Common medication database
│   │   └── referenceRanges.ts # Lab reference ranges
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_imaging_schema.sql               # v2.1
│   ├── functions/
│   │   ├── process-lab-report/    # Edge Function: Claude API lab report processing
│   │   ├── process-imaging-report/ # Edge Function: Claude API imaging report processing (v2.1)
│   │   ├── generate-condition-connections/ # Edge Function: condition connection engine (v2.1)
│   │   └── send-notifications/    # Edge Function: scheduled reminders
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
- One store per domain: `authStore`, `healthStore`, `medicationStore`, `reportStore`, `imagingStore`, `postureStore`, `conditionStore`.
- Stores handle async actions internally (no separate thunks/sagas).
- Prefer co-locating selectors near their store definition.

### Data Fetching
- All Supabase queries live in `src/services/supabase.ts` or feature-specific service files.
- Custom hooks in `src/hooks/` wrap service calls and expose loading/error/data state.
- Never call Supabase directly from component render logic.

### Claude API
- All Claude API calls are routed through Supabase Edge Functions.
- Lab reports → `process-lab-report` Edge Function.
- Imaging reports → `process-imaging-report` Edge Function (v2.1).
- Condition connections → `generate-condition-connections` Edge Function (v2.1).
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
- `medications` — medication schedules
- `medication_logs` — daily compliance records
- `water_logs` — fluid intake
- `symptom_logs` — symptom entries with severity (includes neurological + spinal metadata)
- `exercise_logs` — activity (type, duration, distance, physiotherapy flag)
- `weight_logs` — weight over time
- `diet_logs` — meal compliance
- `sleep_logs` — sleep duration, quality, and position

**Lab Report Intelligence**
- `lab_reports` — uploaded lab report metadata
- `lab_parameters` — individual extracted numeric parameters with status (normal/borderline/abnormal/critical)
- `health_targets` — system/doctor-defined targets per parameter
- `health_plans` — AI-generated recommendations (includes posture, physiotherapy, spine plan types)

**Imaging Report Intelligence (v2.1)**
- `imaging_reports` — uploaded imaging report metadata (MRI, CT, Ultrasound, NCS, etc.)
- `imaging_findings` — individual findings with location, severity, linked symptoms, nerves affected

**Activity & Posture (v2.1)**
- `activity_restrictions` — doctor-prescribed activity restrictions with severity
- `posture_logs` — sit-stand session compliance tracking

**Condition Intelligence (v2.1)**
- `condition_connections` — causal/correlational links between conditions, findings, and symptoms

**Communication**
- `messages` — family encouragement messages
- `doctor_notes` — clinical notes
- `appointments` — scheduled appointments
- `notifications` — in-app notification records

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

### Lab Reports (Numeric Values)
When a user uploads a lab report (blood test, urine analysis):

1. File uploaded to Supabase Storage.
2. Frontend calls `process-lab-report` Edge Function with file reference.
3. Edge Function reads file, performs OCR if needed.
4. Text sent to Claude API with structured lab extraction prompt.
5. Claude returns extracted parameters (name, value, unit, reference range, status).
6. Parameters saved to `lab_parameters` table.
7. Anomaly detection flags borderline/abnormal/critical values.
8. Health plan updated in `health_plans` based on anomalies.
9. Condition connection engine triggered.
10. Notifications dispatched if critical values found.
11. Dashboard health score recalculated.

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
- **Urologist** — urinary frequency logs, uroflowmetry, bladder diary, PSA, ultrasound findings
- **Neurologist/Spine Specialist** — NCS results, MRI findings, spinal symptoms, exercise compliance, activity restrictions
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
| 1 — Foundation | 1–4 | Auth, Dashboard (with posture score), Medication/Water/Symptom trackers, Activity restrictions display, Posture sit-stand timer |
| 2 — Intelligence | 5–8 | Lab report upload + Claude parsing, Imaging report upload + Claude parsing, Anomaly detection, Condition connection engine, Posture tracker, Physiotherapy tracker |
| 3 — Circle | 9–12 | Family dashboard (with imaging/condition summaries), Multi-specialist Doctor portal, Restriction management, Physiotherapy prescription |
| 4 — Polish | 13–16 | PWA, offline mode, all streaks (posture + PT), dark mode, performance |
| 5 — Scale | Month 5+ | Multi-language, wearables, app stores |

---

## Testing

- Unit tests: Vitest, co-located with source or in a `tests/` directory.
- E2E tests: Playwright, in `tests/e2e/`.
- Run `npm test` before committing. Run `npm run type-check` and `npm run lint` as well.
- Key areas to test: health score calculation (including posture component), lab report parameter extraction, imaging report finding extraction, condition connection logic, RLS policy correctness, medication compliance logic, anomaly detection edge cases, surgical urgency detection.

---

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/<short-description>`
- The active development branch: `claude/update-claude-md-v2.1-QMdOh`
- Commit messages: imperative mood, present tense (`Add imaging report pipeline`, `Fix health score calculation`)
- Never commit `.env.local`, API keys, or PHI test data.

---

## Key Files for AI Assistants

| File | Purpose |
|---|---|
| `WellNest_PRD_v2.1.md` | Full product specification — ground truth for all features |
| `src/services/claudeApi.ts` | Claude API integration layer |
| `src/services/supabase.ts` | Supabase client and query helpers |
| `src/services/labReportParser.ts` | Lab report processing pipeline |
| `src/services/imagingReportParser.ts` | Imaging report processing pipeline (v2.1) |
| `src/services/conditionConnections.ts` | Condition connection engine service (v2.1) |
| `src/utils/healthScore.ts` | Core health score logic |
| `src/utils/anomalyDetection.ts` | Lab parameter anomaly logic |
| `src/utils/imagingAnalysis.ts` | Imaging finding analysis logic (v2.1) |
| `src/utils/conditionConnections.ts` | Condition connection utilities (v2.1) |
| `supabase/migrations/001_initial_schema.sql` | Core database schema |
| `supabase/migrations/002_imaging_schema.sql` | Imaging + v2.1 additions schema |
| `supabase/functions/process-lab-report/` | Lab report Edge Function |
| `supabase/functions/process-imaging-report/` | Imaging report Edge Function (v2.1) |
| `supabase/functions/generate-condition-connections/` | Condition connection Edge Function (v2.1) |

When in doubt about feature behaviour, requirements, or data model details, refer to `WellNest_PRD_v2.1.md` as the authoritative source.
