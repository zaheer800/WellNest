# CLAUDE.md — WellNest AI Assistant Guide

> This file provides AI assistants (Claude, Copilot, etc.) with the context needed to contribute effectively to the WellNest codebase.

---

## Project Overview

**WellNest** is a universal personal health tracking platform. It transforms medical reports into actionable insights, tracks daily health habits, connects patients with their family support circle, and keeps doctors informed — all in one privacy-first application.

**Tagline:** "Your health. Your circle. Your journey."

**Current Status:** Pre-implementation. The repository contains the full Product Requirements Document (`WellNest_PRD_v2.md`) and is ready for development. No source code exists yet.

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
│   │   │   └── Badge.tsx
│   │   ├── layout/            # Page-level structural components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   └── features/          # Feature-specific component groups
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
│   │   ├── FamilyScreen.tsx
│   │   ├── DoctorScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── store/                 # Zustand state stores
│   │   ├── authStore.ts
│   │   ├── healthStore.ts
│   │   ├── medicationStore.ts
│   │   └── reportStore.ts
│   ├── services/              # External service integrations
│   │   ├── supabase.ts        # Supabase client setup
│   │   ├── claudeApi.ts       # Claude API integration
│   │   ├── reportParser.ts    # Report processing pipeline
│   │   └── notifications.ts   # Push notification service
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useHealth.ts
│   │   ├── useMedications.ts
│   │   └── useReports.ts
│   ├── utils/                 # Pure utility functions
│   │   ├── healthScore.ts     # Score calculation logic
│   │   ├── anomalyDetection.ts
│   │   ├── referenceRanges.ts
│   │   ├── dateHelpers.ts
│   │   └── formatters.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── health.types.ts
│   │   ├── user.types.ts
│   │   └── report.types.ts
│   ├── constants/             # App-wide constants
│   │   ├── symptoms.ts        # Symptom library
│   │   ├── medications.ts     # Common medication database
│   │   └── referenceRanges.ts # Lab reference ranges
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── functions/
│   │   ├── process-report/    # Edge Function: Claude API report processing
│   │   └── send-notifications/ # Edge Function: scheduled reminders
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
- One store per domain: `authStore`, `healthStore`, `medicationStore`, `reportStore`.
- Stores handle async actions internally (no separate thunks/sagas).
- Prefer co-locating selectors near their store definition.

### Data Fetching
- All Supabase queries live in `src/services/supabase.ts` or feature-specific service files.
- Custom hooks in `src/hooks/` wrap service calls and expose loading/error/data state.
- Never call Supabase directly from component render logic.

### Claude API
- All Claude API calls are routed through the `process-report` Supabase Edge Function.
- The frontend calls the Edge Function endpoint, not the Claude API directly.
- Service layer in `src/services/claudeApi.ts` handles the Edge Function call.

---

## Database Schema Summary

Core tables (full SQL in `supabase/migrations/001_initial_schema.sql`):

**Users & Access**
- `users` — patient profiles (id, email, name, dob, gender, height, weight)
- `family_members` — family access with patient-controlled visibility flags
- `doctors` — doctor profiles linked to patients

**Daily Health Tracking**
- `medications` — medication schedules
- `medication_logs` — daily compliance records
- `water_logs` — fluid intake
- `symptom_logs` — symptom entries with severity
- `exercise_logs` — activity (type, duration, distance)
- `weight_logs` — weight over time
- `diet_logs` — meal compliance
- `sleep_logs` — sleep duration and quality

**Report Intelligence**
- `lab_reports` — uploaded report metadata
- `lab_parameters` — individual extracted parameters with status (normal/borderline/abnormal/critical)
- `health_targets` — system/doctor-defined targets per parameter
- `health_plans` — AI-generated recommendations

**Communication**
- `messages` — family encouragement messages
- `doctor_notes` — clinical notes
- `appointments` — scheduled appointments
- `notifications` — in-app notification records

**Gamification**
- `streaks` — consecutive-day streaks per activity
- `milestones` — achievements unlocked
- `daily_scores` — daily health score breakdown (0–100)

### Row Level Security (RLS)
All tables have RLS enabled. Security policies enforce:
- Patients read/write only their own rows.
- Family members read only sections the patient has permitted.
- Doctors read only clinical data for their linked patients.
- Never bypass RLS in application code — enforce at the database level.

---

## Report Intelligence Pipeline

When a user uploads a medical report:

1. File uploaded to Supabase Storage.
2. Frontend calls `process-report` Edge Function with file reference.
3. Edge Function reads file, performs OCR if needed.
4. Text sent to Claude API with a structured extraction prompt.
5. Claude returns extracted parameters (name, value, unit, reference range, status).
6. Parameters saved to `lab_parameters` table.
7. Anomaly detection flags borderline/abnormal/critical values.
8. Health plan updated in `health_plans` based on anomalies.
9. Notifications dispatched to patient and family if critical values found.
10. Dashboard health score recalculated.

Target accuracy: >95% of parameters correctly extracted.

---

## Health Score Calculation

Daily health score (0–100) breaks down across 5 components:

| Component | Weight |
|---|---|
| Medication compliance | Primary |
| Water intake vs goal | Secondary |
| Exercise completion | Secondary |
| Symptom severity (inverse) | Secondary |
| Diet compliance | Secondary |

Logic lives in `src/utils/healthScore.ts`.

---

## User Roles

| Role | Data Access |
|---|---|
| Patient | Full read/write own data; controls family/doctor visibility |
| Family Member | Read-only; only sections patient permits; can send messages |
| Doctor | Read-only clinical data (labs, medications, notes); can add doctor notes and targets |

---

## Security Rules

- OTP-based authentication only (no password storage).
- `CLAUDE_API_KEY` is server-side only — Supabase Edge Function context.
- All RLS policies enforced at the database level, not the frontend.
- Supabase Anon Key is safe to expose to the browser; it is scoped by RLS.
- File uploads validated by type and size before sending to Supabase Storage.
- Session timeout: 30 minutes inactivity on web.
- Never log PHI (personally identifiable health information) to console or external services.

---

## Development Phases

| Phase | Weeks | Goal |
|---|---|---|
| 1 — Foundation | 1–4 | Auth, Dashboard, Medication/Water/Symptom trackers |
| 2 — Intelligence | 5–8 | Report upload, Claude API, anomaly detection |
| 3 — Circle | 9–12 | Family dashboard, Doctor portal, Realtime |
| 4 — Polish | 13–16 | PWA, offline mode, streaks, dark mode, performance |
| 5 — Scale | Month 5+ | Multi-language, wearables, app stores |

---

## Testing

- Unit tests: Vitest, co-located with source or in a `tests/` directory.
- E2E tests: Playwright, in `tests/e2e/`.
- Run `npm test` before committing. Run `npm run type-check` and `npm run lint` as well.
- Key areas to test: health score calculation, report parameter extraction accuracy, RLS policy correctness, medication compliance logic, anomaly detection edge cases.

---

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/<short-description>`
- The active development branch for initial scaffolding: `claude/add-claude-documentation-O1DMX`
- Commit messages: imperative mood, present tense (`Add medication log table`, `Fix health score calculation`)
- Never commit `.env.local`, API keys, or PHI test data.

---

## Key Files for AI Assistants

| File | Purpose |
|---|---|
| `WellNest_PRD_v2.md` | Full product specification — ground truth for all features |
| `src/services/claudeApi.ts` | Claude API integration layer |
| `src/services/supabase.ts` | Supabase client and query helpers |
| `src/utils/healthScore.ts` | Core health score logic |
| `src/utils/anomalyDetection.ts` | Lab parameter anomaly logic |
| `supabase/migrations/001_initial_schema.sql` | Authoritative database schema |
| `supabase/functions/process-report/` | Report processing Edge Function |

When in doubt about feature behaviour, requirements, or data model details, refer to `WellNest_PRD_v2.md` as the authoritative source.
