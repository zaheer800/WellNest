# WellNest roadmap

Written 2026-09-21 for autonomous runs (`run WellNest: Do roadmap item N in docs/ROADMAP.md ...`).

## Context every run must know

- WellNest is a personal health record. First users: the owner's family (two adults, two children,
  the owner's parents, then a brother's family and close relatives). Not a public product, so no marketing,
  monetization or scale work. Quality and safety of health data come first.
- Read first: `CLAUDE.md` (repo), `docs/CLAUDE.md`, `docs/GUARDIAN_ACCESS_PLAN.md`, and the VM's
  `~/projects/CLAUDE.md` (the autonomous build loop you must follow).
- Guardian model already built and live (migration 017): `can_manage(patient_id)`, managed profiles,
  18-year cut-off, `useActivePatient()` hook, `PersonSwitcher`, `PeopleScreen`. **Always use
  `useActivePatient()` for the patient id, never `user.id`.** Any new table needs a `patient_id` and RLS via
  `can_manage(patient_id)`.
- Live project: Supabase `toubicsctomhyfgdtwnx`. Pushing to `main` deploys `wellnest.zakapedia.in` via Vercel.
- Tools already on this VM: local PostgreSQL + `supabase/tests/run-local.sh` (applies all migrations to a
  scratch DB and runs a test file), Playwright + Chromium (`tests/e2e/guardian.spec.ts` shows the mocked-Supabase
  pattern), vitest (`npm test -- --run`), `npm run type-check`, `npm run build`.
- ContextForge (MCP `contextforge`) holds project history; `recall` a specific term before rediscovering things.

## Rules for every item

1. Do exactly one item per run. Keep it small enough to finish in about 15 minutes; if it will not fit, finish a
   coherent first slice, commit it, and say what is left.
2. **Database changes:** write a numbered migration in `supabase/migrations/`, add a test in `supabase/tests/`,
   and run it with `run-local.sh` first. Apply to the live project only after the local tests pass, using
   `apply_migration`, then verify with read-only SELECTs. Never rewrite or delete existing rows.
3. **Edge functions:** deploy with `deploy_edge_function`, preserving each function's current `verify_jwt`. Only
   redeploy the functions you changed.
4. Tests are part of done: unit tests for logic, a Playwright test (mocked Supabase) for new UI, DB tests for new
   rules. `npm run type-check`, `npm test -- --run` and `npm run build` must pass. Do not add lint errors
   (`npx eslint src` baseline is about 109 errors, all pre-existing).
5. Out of scope for every item: new paid services or API keys, new Supabase projects, anything on the Proxmox
   host or docker-lxc, secrets in the repo (the repo is public).
6. When finished, tick the item below (`[x]`, date, one-line result) and commit that with the work.

## Items

### Wave 1: make the core trustworthy

- [ ] **1. Test the edge functions properly.** Deno is not installed and the functions have never been run or
  type-checked. Install Deno for the `claude` user (no root), run `deno check` on every function, and add Deno
  tests for `supabase/functions/_shared/document.ts` (text file, PDF, PNG/JPEG, file over 20 MB rejected, a 5 MB
  image encodes without a stack overflow, non-2xx fetch). Fix what they find. Document how to run them in
  `docs/CLAUDE.md`.
- [ ] **2. Report review screen and code-computed status.** After a lab or imaging report is processed, show the
  extracted values in an editable list (name, value, unit, range) that the user confirms before it is saved.
  Compute normal/borderline/abnormal/critical **in code** from the range printed on the report, falling back to
  `src/constants/referenceRanges.ts` and `criticalValues.ts`; the AI only extracts values and writes the plain
  explanation. Update the `process-lab-report` prompt and parsing accordingly. Unit-test the status logic,
  including boundaries, missing ranges and one-sided ranges (e.g. eGFR above 60).
- [ ] **3. Doctor invite claim.** Family invites were broken because the claim was a direct UPDATE hidden by RLS
  (fixed in 017 with `claim_family_invite`). Check the doctor flow (`acceptDoctorInvite`, `005_doctor_access.sql`)
  for the same bug and the same over-permissive update policy; if present, fix with a `claim_doctor_invite`
  function and drop the broad policy. Test in `supabase/tests/`.
- [ ] **4. Report processing on the server.** The browser currently chains extraction, critical-value checks and
  condition connections with two hard-coded 12 second waits, so closing the tab strands the report. Move the
  chain into one server-side step (an orchestrating edge function, or the existing functions called in order
  server-side) that updates `lab_reports.processing_status`; the app shows progress by reading that status.
  Remove the waits. Add a note in the docs that the Claude API tier must allow the request rate.
- [ ] **5. Failure handling and recovery.** Clear, specific error messages for upload and processing failures
  (too large, unsupported type, could not read, rate limited). A report stuck in `processing` for more than 10
  minutes shows as failed with a Retry button. A small "Report a problem" action that records the error and
  context in a table the owner can read. New table + RLS + tests.

### Wave 2: cut the typing

- [ ] **6. Prescription scan on Medications.** Add "Scan or upload prescription" to `MedicationsScreen`. Reuse
  `prescriptionParser.ts` and the `PostVisitLogger` flow. Show extracted medicines as an editable review list;
  one tap adds them all for the active patient. Handles PDF and phone photos.
- [ ] **7. Changes since last report.** On each report, show per-parameter direction versus the previous value
  of the same parameter (up/down/same, with the delta), and a short "what changed" summary at the top. Pure
  client logic over existing data.
- [ ] **8. One-tap and remembered entries.** "Same as last time" and sensible defaults on water, symptom,
  medication and appointment forms: time defaults to now, last-used values are remembered per person.
- [ ] **9. Reminders.** `send-notifications` is an empty function. Implement medicine reminders with Web Push
  (Taken / Skip actions that log the dose), sent to the patient and to guardians of managed profiles. Migration
  for subscriptions and schedules, a Supabase cron, and a service-worker handler. Test on Android Chrome and note
  the iPhone limitations (installed PWA only) in the docs.
- [ ] **10. Lighter onboarding.** Name and one goal are required; everything else is skippable and can be filled
  in later from the profile. First run shows today's medicines and the next appointment. Update existing tests.

### Wave 3: doctor visits

- [ ] **11. One-page visit summary.** A screen and shareable, printable page: current medicines, the latest
  reports with changes since the last visit, symptoms since the last appointment, open questions, allergies.
  Build on `generate-visit-preparation` and `visitPreparation.ts`. Works from a phone in a waiting room, and as
  PDF or print.
- [ ] **12. Condition timelines.** Per condition or parameter, a Recharts trend over time with the reference
  range shaded, for lab values and symptom severity.
- [ ] **13. Fast post-visit entry.** One screen after a visit: what the doctor said, new or changed medicines
  (with the prescription scan from item 6), the next appointment, and tests to do. Improve `PostVisitLogger`.
- [ ] **14. Download everything.** A per-person "Download all my data" (JSON plus CSVs, and the original report
  files) for the active patient, plus a short docs page on backing up the Supabase project. No new secrets.

### Wave 4: ready for the whole family

- [ ] **15. Family-friendly interface.** A "large text and simple" setting per person; a simplified home for
  non-technical users showing only today's medicines, next appointment and last report; plain wording; a
  keyboard and screen-reader pass on the new screens (PersonSwitcher, PeopleScreen).
- [ ] **16. Children's reference ranges and managed-profile medical ID.** Age-aware ranges for children so their
  results are not flagged against adult ranges (prefer the range printed on the report). Make the medical ID
  work for managed profiles: `rotate_medical_id_token()` uses `auth.uid()`, so add a `can_manage`-based
  variant. Migration + tests.
- [ ] **17. Systematic privacy tests.** Extend `supabase/tests/guardian_access_test.sql` to loop over **every**
  table with a `patient_id` column and prove that a stranger reads 0 rows and cannot insert, update or delete,
  and that a guardian can, for the same person. Include storage. Fix anything it finds.
- [ ] **18. Consent, disclaimers, deletion.** A plain medical disclaimer, clear text about reports being sent to
  an AI provider (build on `014_consent.sql`), and "delete this person's data" for guardians and for the person
  themself. Update the privacy page. Migration + tests.
- [ ] **19. Tidy the menu.** Group the More screen, and let each person hide features they do not use (posture,
  diet, exercise), stored per person.

### Parked (needs the owner)

- WhatsApp intake of reports and prescriptions through the CRM: the WhatsApp Business API costs money, so it
  needs a decision.
- Splitting large files (`supabase.ts`, 800-line screens) and the 109 pre-existing lint errors: worthwhile,
  low urgency, do after Wave 4.
