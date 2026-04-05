# WellNest 🪺

> **"Your health. Your circle. Your journey."**

A universal personal health tracking platform that transforms medical reports into actionable insights, tracks daily health habits, connects patients with their family support circle, and keeps doctors informed — all in one privacy-first application.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Forms | React Hook Form |
| Charts | Recharts |
| Routing | React Router v6 |
| Build | Vite + PWA |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (OTP + Google OAuth) |
| Storage | Supabase Storage |
| AI | Claude API (Anthropic) via Edge Functions |
| Hosting | Vercel |

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
# App runs at http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build (tsc + vite)
npm run preview      # Preview production build
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

```bash
# .env.local (never commit)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only (Supabase Edge Functions)
CLAUDE_API_KEY=your_claude_api_key

# Feature flags
VITE_ENABLE_IMAGING=true
VITE_ENABLE_CONDITION_WEB=true
VITE_ENABLE_POSTURE_TRACKER=true
VITE_ENABLE_INJECTION_COURSE=true
VITE_ENABLE_VISIT_PREP=true
VITE_ENABLE_SIDE_EFFECT_MONITOR=true
VITE_ENABLE_SPINE_MAP=true
VITE_ENABLE_SYMPTOM_BACKDATING=true
VITE_ENABLE_ENVIRONMENTAL_TRIGGERS=true
```

> `CLAUDE_API_KEY` is server-side only — never in the browser bundle. Use only inside Supabase Edge Functions.

---

## Project Structure

```
wellnest/
├── src/
│   ├── screens/           # Full-page route targets (17 screens)
│   ├── components/
│   │   ├── ui/            # Stateless UI components
│   │   ├── layout/        # Header, BottomNav, PageWrapper
│   │   └── features/      # Feature-specific component groups
│   ├── store/             # Zustand state stores (10 stores)
│   ├── services/          # External service integrations
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Pure utility functions
│   ├── types/             # TypeScript type definitions
│   └── constants/         # App-wide constants
├── supabase/
│   ├── migrations/        # SQL schema migrations
│   └── functions/         # Edge Functions (Deno/TypeScript)
├── tests/
│   └── e2e/               # Playwright E2E tests
└── docs/                  # Project documentation
```

---

## Features

### Core Health Tracking
- **Dashboard** — Daily health score (0-100) across 5 components
- **Medications** — Schedule tracking, compliance logging, injection courses, side effect monitoring
- **Symptoms** — Log with severity, backdated onset, urine color, environment capture
- **Water** — Fluid intake tracking vs daily goal
- **Exercise** — Activity logging with physiotherapy tracking and restriction enforcement
- **Posture** — Sit-stand timer, compliance scoring, sleep position logger

### Medical Intelligence
- **Reports** — Upload any medical report; auto type-detection via Claude API
- **Lab Results** — Parameter extraction, anomaly detection, critical value alerts
- **Imaging** — Finding extraction, whole spine visual map
- **Conditions** — AI-generated condition connections and relationships

### Care Circle
- **Appointments** — Schedule management, AI-generated visit preparation, post-visit logging
- **Family** — Family dashboard with health score visibility and engagement tracking
- **Doctor Portal** — Specialty-filtered views (Nephrology, Urology, Neurology, Cardiology)

### Analytics
- **Progress** — Health score trends, symptom progression, streaks, lab value trends
- **Environmental Triggers** — Correlation analysis (AC, location, activity vs symptoms)

---

## Completion Status

> Last validated: 2026-04-04 against `docs/WellNest_PRD_v2.2.md`

### Overall Progress

| Phase | Features | Implemented | Partial | Missing | Score |
|-------|----------|-------------|---------|---------|-------|
| Foundation (v1) | 6 | 6 | 0 | 0 | **100%** |
| v2.1 Features | 14 | 8 | 4 | 2 | **71%** |
| v2.2 Features | 12 | 7 | 3 | 2 | **75%** |
| **Total** | **32** | **21** | **7** | **4** | **72%** |

### Screen Status

| Screen | Route | Status |
|--------|-------|--------|
| Splash | `/` | ✅ Full |
| Login (OTP + Google) | `/login` | ✅ Full |
| Onboarding | `/onboarding` | ✅ Full |
| Dashboard | `/dashboard` | ✅ Full |
| Medications + Injections | `/medications` | ✅ Full |
| Water Intake | `/water` | ✅ Full |
| Symptoms + Backdating + Urine | `/symptoms` | ✅ Full |
| Exercise + Physiotherapy | `/exercise` | ✅ Full |
| Posture + Sleep Position | `/posture` | ✅ Full |
| Appointments + Visit Prep | `/appointments` | ✅ Full |
| Reports + Spine Map | `/reports` | ⚠️ Partial — pipeline not end-to-end |
| Imaging | `/imaging` | ⚠️ Partial — stub screen |
| Conditions | `/conditions` | ⚠️ Partial — empty states |
| Progress | `/progress` | ⚠️ Partial — no charts yet |
| Family | `/family` | ⚠️ Partial — DB not wired |
| Doctor Portal | `/doctor` | ⚠️ Partial — DB not wired |
| Diet | `/diet` | ❌ Stub only |

### v2.2 Feature Status

| Feature | Status | Gap |
|---------|--------|-----|
| Symptom history backdating | ✅ Implemented | Backdated label not shown in log list |
| Injection course manager | ✅ Implemented | Completion celebration not implemented |
| Doctor visit preparation assistant | ✅ Implemented | Auto-add prescriptions post-visit missing |
| Medication side effect monitor | ✅ Implemented | Doctor notification on severe effects missing |
| Urine color visual logger | ✅ Implemented | Historical trend chart not implemented |
| Auto report type detection | ✅ Implemented | Processing pipeline not triggered after detection |
| Sleep position guidance | ✅ Implemented | Score contribution needs verification |
| Whole spine visual map | ✅ Implemented | Not shown in Family Dashboard |
| Symptom severity progression | ⚠️ Partial | Recharts graph not implemented (text only) |
| Environmental trigger tracking | ⚠️ Partial | Computed but not displayed in Progress |
| Family engagement impact | ⚠️ Partial | UI ready; real DB data not fetched |
| Critical value bidirectional alerts | ⚠️ Partial | Dashboard banner and notifications not wired |

### Infrastructure Status

| Area | Status |
|------|--------|
| Database schema (all 3 migrations) | ✅ 100% complete |
| TypeScript types | ✅ 0 errors |
| ESLint | ✅ 0 errors |
| Supabase Edge Functions (7) | ✅ All directories created |
| Auth (OTP + Google OAuth) | ✅ Working |
| RLS policies | ✅ All tables covered |

### Critical Gaps Remaining

| Priority | Issue |
|----------|-------|
| Critical | Report upload pipeline not end-to-end — parameters never reach DB |
| Critical | Critical value alert banner missing from Dashboard |
| Critical | Conditions screen shows empty states — no data loaded |
| High | Family/Doctor data not persisted to DB |
| High | Environmental trigger correlations not displayed |
| High | Symptom progression chart not implemented |
| High | Imaging screen is a stub |
| Medium | Diet screen is a stub |
| Medium | Streak counts are placeholder zeros |

---

## v2.2 New Features

| Feature | Status |
|---------|--------|
| Symptom history backdating | ✅ Implemented |
| Injection course manager | ✅ Implemented |
| Doctor visit preparation assistant | ✅ Implemented |
| Medication side effect monitor | ✅ Implemented |
| Urine color visual logger | ✅ Implemented |
| Auto report type detection | ✅ Implemented |
| Sleep position guidance | ✅ Implemented |
| Whole spine visual map | ✅ Implemented |
| Symptom severity progression | ⚠️ Partial (no chart yet) |
| Environmental trigger tracking | ⚠️ Partial (computed, not displayed) |
| Family engagement impact | ⚠️ Partial (UI ready, DB wiring pending) |
| Critical value bidirectional alerts | ⚠️ Partial (component ready, banner pending) |

---

## Database

Three migration files in `supabase/migrations/`:

| File | Contents |
|------|----------|
| `001_initial_schema.sql` | Core tables: users, medications, water, symptoms, exercise, posture, reports |
| `002_imaging_schema.sql` | Imaging tables + v2.1 additions (conditions, restrictions) |
| `003_v22_additions.sql` | v2.2 tables: injection courses, side effects, symptom progression, visit preparations, family engagement |

---

## Security

- OTP-based authentication (no passwords stored)
- Row Level Security (RLS) on all tables
- `CLAUDE_API_KEY` server-side only via Edge Functions
- PHI never logged to console or external services
- Session timeout: 30 minutes inactivity

---

## Documentation

All detailed documentation is in [`docs/`](./docs/):

| File | Description |
|------|-------------|
| [`docs/PRD_VALIDATION_REPORT.md`](./docs/PRD_VALIDATION_REPORT.md) | Feature-by-feature PRD vs code comparison |
| [`docs/WellNest_PRD_v2.2.md`](./docs/WellNest_PRD_v2.2.md) | Full product specification (ground truth) |
| [`docs/FIXES_APPLIED.md`](./docs/FIXES_APPLIED.md) | Bug fixes and build resolutions changelog |

---

## Contributing

- Branch: `feature/<short-description>`
- Commit messages: imperative mood (`Add imaging pipeline`, `Fix health score`)
- Run `npm run type-check && npm run lint` before committing
- Never commit `.env.local`, API keys, or PHI test data
