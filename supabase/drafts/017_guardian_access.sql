-- Migration 017: Guardian access + managed (login-less) profiles
--
-- DRAFT — not applied. Lives in supabase/drafts/ on purpose; move to migrations/ when approved. See docs/GUARDIAN_ACCESS_PLAN.md before running.
--
-- Goals
--   1. A guardian (an existing family_members row with can_edit = true) can read AND
--      write a patient's health data, not just view a dashboard.
--   2. A patient record can exist without its own login (children, parents).
--   3. A managed person can later claim their record through the existing invite link.
--
-- Design notes
--   * Existing users are untouched: their users.id already equals their auth id and
--     can_manage(their id) is true through the `pid = auth.uid()` branch.
--   * access_level (1-3) is not read by any app code today, so a separate can_edit flag
--     is used instead of overloading it.

-- ─────────────────────────────────────────────
-- 1. family_members: guardian flag
-- ─────────────────────────────────────────────
alter table public.family_members
  add column if not exists can_edit boolean not null default false;

-- ─────────────────────────────────────────────
-- 2. users: allow rows with no auth account
-- ─────────────────────────────────────────────
-- Existing rows keep matching auth.users ids; managed rows get their own uuid.
alter table public.users drop constraint if exists users_id_fkey;
alter table public.users alter column email drop not null;
alter table public.users
  add column if not exists is_managed boolean not null default false,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- A managed profile must not collide with a real login id
alter table public.users
  add constraint users_managed_has_creator
  check (is_managed = false or created_by is not null) not valid;

-- ─────────────────────────────────────────────
-- 3. Central access check
-- ─────────────────────────────────────────────
create or replace function public.can_manage(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select pid = auth.uid()
      or exists (
        select 1
        from public.family_members fm
        where fm.patient_id = pid
          and fm.user_id = auth.uid()
          and fm.is_active = true
          and fm.can_edit = true
      );
$$;

revoke all on function public.can_manage(uuid) from public;
grant execute on function public.can_manage(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 4. Create a managed profile (guardian action)
-- ─────────────────────────────────────────────
create or replace function public.create_managed_profile(
  p_name text,
  p_date_of_birth date default null,
  p_gender text default null,
  p_relationship text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Name is required';
  end if;

  insert into public.users (id, name, date_of_birth, gender, is_managed, created_by)
  values (new_id, trim(p_name), p_date_of_birth, p_gender, true, auth.uid());

  insert into public.family_members
    (patient_id, name, relationship, user_id, can_edit, accepted_at, is_active)
  values
    (new_id, coalesce((select name from public.users where id = auth.uid()), 'Guardian'),
     p_relationship, auth.uid(), true, now(), true);

  return new_id;
end;
$$;

revoke all on function public.create_managed_profile(text, date, text, text) from public;
grant execute on function public.create_managed_profile(text, date, text, text) to authenticated;

-- ─────────────────────────────────────────────
-- 5. Rewrite the owner-only policies to use can_manage()
-- ─────────────────────────────────────────────
-- Every data table uses the same expression `patient_id = auth.uid()`. Rewrite them in
-- place (ALTER POLICY keeps names and commands). family_members is skipped on purpose:
-- who may change the circle itself is a separate decision (see the plan doc).
do $$
declare
  r record;
  changed int := 0;
begin
  for r in
    select schemaname, tablename, policyname, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename <> 'family_members'
      and (qual = '(patient_id = auth.uid())' or with_check = '(patient_id = auth.uid())')
  loop
    if r.qual = '(patient_id = auth.uid())' and r.with_check = '(patient_id = auth.uid())' then
      execute format('alter policy %I on %I.%I using (public.can_manage(patient_id)) with check (public.can_manage(patient_id))',
        r.policyname, r.schemaname, r.tablename);
    elsif r.qual = '(patient_id = auth.uid())' then
      execute format('alter policy %I on %I.%I using (public.can_manage(patient_id))',
        r.policyname, r.schemaname, r.tablename);
    else
      execute format('alter policy %I on %I.%I with check (public.can_manage(patient_id))',
        r.policyname, r.schemaname, r.tablename);
    end if;
    changed := changed + 1;
  end loop;
  raise notice 'Rewrote % policies to use can_manage()', changed;
end $$;

-- ─────────────────────────────────────────────
-- 6. users table: guardians can read/update managed profiles they manage
-- ─────────────────────────────────────────────
create policy "Guardians read managed profiles"
  on public.users for select
  using (is_managed = true and public.can_manage(id));

create policy "Guardians update managed profiles"
  on public.users for update
  using (is_managed = true and public.can_manage(id))
  with check (is_managed = true and public.can_manage(id));

-- ─────────────────────────────────────────────
-- 6b. family_members: guardians manage the circle (mutual)
-- ─────────────────────────────────────────────
-- Anyone who can manage a patient may add, edit or remove that patient's circle rows,
-- including other guardians. A teen or parent who has claimed their profile therefore
-- has the same power over the guardian as the guardian has over them.
create policy "Managers manage circle"
  on public.family_members for all
  using (public.can_manage(patient_id))
  with check (public.can_manage(patient_id));

-- Guard 1: only someone who can already manage the patient may change can_edit.
-- Stops an invitee from setting can_edit = true while claiming an invite
-- (the "Family members claim invite" policy from 004 would otherwise allow it).
create or replace function public.family_members_guard_can_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.can_edit and not public.can_manage(new.patient_id) then
      raise exception 'Only a guardian can grant edit access';
    end if;
  elsif new.can_edit is distinct from old.can_edit
        and not public.can_manage(old.patient_id) then
    raise exception 'Only a guardian can change edit access';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_family_members_guard_can_edit on public.family_members;
create trigger trg_family_members_guard_can_edit
  before insert or update on public.family_members
  for each row execute procedure public.family_members_guard_can_edit();

-- Guard 2: a managed profile must always keep at least one active guardian.
-- Mutual removal is allowed, but the last one cannot remove themselves or be removed.
create or replace function public.family_members_keep_a_guardian()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  removing boolean;
begin
  if not old.can_edit or old.user_id is null then
    return coalesce(new, old);
  end if;
  if not exists (select 1 from public.users u where u.id = old.patient_id and u.is_managed) then
    return coalesce(new, old);
  end if;

  removing := tg_op = 'DELETE'
              or new.can_edit = false
              or new.is_active = false
              or new.user_id is null;

  if removing and not exists (
    select 1 from public.family_members fm
    where fm.patient_id = old.patient_id
      and fm.id <> old.id
      and fm.can_edit = true
      and fm.is_active = true
      and fm.user_id is not null
  ) then
    raise exception 'A managed profile must keep at least one guardian';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_family_members_keep_a_guardian on public.family_members;
create trigger trg_family_members_keep_a_guardian
  before update or delete on public.family_members
  for each row execute procedure public.family_members_keep_a_guardian();

-- ─────────────────────────────────────────────
-- 7. Storage: folder name is the patient id
-- ─────────────────────────────────────────────
-- Replace the four "own reports" policies from 006 so guardians can use the bucket
-- for the people they manage. The regex guard avoids a uuid cast error on odd paths.
drop policy if exists "Patients upload own reports" on storage.objects;
drop policy if exists "Patients read own reports" on storage.objects;
drop policy if exists "Patients delete own reports" on storage.objects;
drop policy if exists "Patients update own reports" on storage.objects;

create policy "Managers upload reports"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
    and public.can_manage(((storage.foldername(name))[1])::uuid)
  );

create policy "Managers read reports"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
    and public.can_manage(((storage.foldername(name))[1])::uuid)
  );

create policy "Managers delete reports"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
    and public.can_manage(((storage.foldername(name))[1])::uuid)
  );

create policy "Managers update reports"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
    and public.can_manage(((storage.foldername(name))[1])::uuid)
  );

-- ─────────────────────────────────────────────
-- 8. Post-run check (run manually): any policy still pinned to auth.uid() on patient_id
-- ─────────────────────────────────────────────
--   select tablename, policyname from pg_policies
--   where schemaname = 'public' and (qual like '%patient_id = auth.uid()%'
--      or with_check like '%patient_id = auth.uid()%');
--   -- expect only family_members
