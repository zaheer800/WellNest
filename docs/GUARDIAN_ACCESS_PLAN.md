# Guardian access & managed profiles — plan

Status: **implemented.** Migration: `supabase/migrations/017_guardian_access.sql`. Database tests: `supabase/tests/` (run `supabase/tests/run-local.sh ../migrations/017_guardian_access.sql guardian_access_test.sql` — needs a local Postgres). Browser tests: `tests/e2e/guardian.spec.ts`.

**Decisions:** guardianship of a child ends on their 18th birthday; guardians and the claimed person can remove each other, but the last guardian cannot leave; guardians manage the circle of the people they manage.

**Also fixed:** the old invite-claim flow (`UPDATE ... WHERE invite_token`) matched no rows under RLS and let an invitee change any column of their invite row. It is replaced by `claim_family_invite()`.

**Not done yet:** medical ID for managed profiles (the rotation function is tied to the signed-in login); reminders to guardians; age-aware lab reference ranges for children.

## Why

WellNest will be used by the owner's family: two adults, two children, the owner's parents,
then a brother's family and close relatives. Children and parents are managed by a guardian
but must be able to use the app themselves later.

Today every patient must be an auth user (`users.id` references `auth.users`), and the family
circle is view-only (read policies + messages). Guardians cannot enter data for someone else.

## Model

- **Guardian** = a `family_members` row with `can_edit = true` and a linked `user_id`.
- **Managed profile** = a `users` row with `is_managed = true` and no auth account.
- **Claim** = the existing invite link (`/join?token=…`). The person signs up and becomes a
  guardian-level member (`can_edit = true`) on their own profile, then switches to it.
  Their auto-created empty `users` row for their own login stays unused.
- Existing users are unchanged.
- `can_manage(patient_id)` is the single access check used by policies and (later) edge functions.

## Database (017)

1. `family_members.can_edit` flag (not `access_level`: no app code reads it today).
2. `users`: drop the FK to `auth.users`, make `email` nullable, add `is_managed`, `created_by`.
3. `can_manage(pid)` security-definer function.
4. `create_managed_profile(...)` RPC — creates the profile and the creator's guardian row.
5. A DO block rewrites every `patient_id = auth.uid()` policy (about 33, ~30 tables) to
   `can_manage(patient_id)`, except `family_members`, which gets its own mutual-management
   policy and two guard triggers.
6. Guardian select/update policies on `users` for managed profiles.
7. Storage policies use `can_manage(folder)` instead of `auth.uid()`.

## App changes (not started)

- `authStore`: add `activePatientId` (default `user.id`) and a list of manageable profiles
  (self + `family_members` where `user_id = me and can_edit`). Add `setActivePatient`.
- Replace `user?.id` as patient id in ~11 screens (Appointments, Water, Dashboard, Exercise,
  Progress, Reports x2, Posture, Family, Symptoms, Medications, Doctor) with `activePatientId`.
  About 30 `user.id` usages exist in total; some are genuinely "the logged-in user" and stay.
- Header "Who are you viewing?" switcher, with an obvious banner when not viewing yourself.
- "Add a person I manage" form → `create_managed_profile` RPC.
- Invite link for a managed profile that grants `can_edit` when claimed.
- Edge functions: `assertOwnership(bodyPatientId, userId)` in `_shared/auth.ts` compares ids
  directly; change it to call `can_manage` with the caller's JWT.
- Reminders: notify guardians for managed profiles.
- Age-aware lab ranges for children (use the report's printed range first).

## Decisions (resolved)

1. **Removal is mutual.** A claimed person (teen/parent) can remove a guardian, and a
   guardian can remove them. Guard: a managed profile must always keep at least one active
   guardian, so the last one cannot be removed or leave (trigger in the draft).
2. **Guardians manage the circle** of the people they manage (`family_members` policy
   "Managers manage circle"). Parents and guardians handle the children's accounts.
3. **Read-only guardians** remain possible (`can_edit = false`).
4. A trigger stops anyone but an existing guardian from setting `can_edit`, so an invitee
   cannot promote themselves while claiming an invite.

Still open: what age or event moves a child's profile from "guardian-managed" to
"self-managed"? Draft assumes it is manual (the child claims via invite and either side may
then remove the other).

## Risks and rollout

- Changes access rules on ~30 tables and storage. Apply to a copy first (Supabase branch or a
  dump restored locally), never straight to the live project.
- Take an export first. The project holds the owner's real records.
- The DO block matches the exact policy text `(patient_id = auth.uid())`. Run the check query
  at the end of the migration; anything left over must be converted by hand.
- Test with three accounts: guardian, child (login-less), unrelated user. The unrelated user
  must see nothing.
- Dropping `users_id_fkey` means deleting an auth user no longer cascades to `users`. Add a
  cleanup path if that matters.

## Order of work

1. Confirm upload fix works (deployed as v7).
2. Review/approve this plan, resolve the decisions above.
3. Apply 017 to a copy; test the policies.
4. App changes: switcher, add-person form, screen updates.
5. Apply to the live project; test with real accounts.
