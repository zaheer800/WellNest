-- ─────────────────────────────────────────────────────────────────
-- Migration 004: Family member account linking
-- ─────────────────────────────────────────────────────────────────

-- Link a family member's Supabase auth account to their invite record
alter table public.family_members
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists invite_token text unique;

-- Index for fast lookup by token (used during join flow)
create index if not exists idx_family_members_invite_token
  on public.family_members(invite_token);

-- Index for fast lookup by user_id (used during login role detection)
create index if not exists idx_family_members_user_id
  on public.family_members(user_id);

-- Family members can read their own record (to resolve their linked patient)
create policy "Family members read own record"
  on public.family_members for select
  using (user_id = auth.uid());

-- Allow a new family member to claim an unclaimed invite token
-- (their auth.uid() does not match patient_id, so the default policy blocks this)
create policy "Family members claim invite"
  on public.family_members for update
  using (user_id is null and invite_token is not null)
  with check (user_id = auth.uid());

-- Allow family members to send messages to their linked patient
create policy "Family members send messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.messages.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );

-- Allow family members to read messages on their linked patient's feed
create policy "Family members read linked patient messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.messages.patient_id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );

-- Allow family members to read their linked patient's permitted data.
-- The visibility_config on the family_members row controls what is shown
-- in the application layer; RLS here grants broad read access scoped to
-- the patient_id the family member is linked to.
create policy "Family members read linked patient data"
  on public.users for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.patient_id = public.users.id
        and fm.user_id = auth.uid()
        and fm.is_active = true
    )
  );
