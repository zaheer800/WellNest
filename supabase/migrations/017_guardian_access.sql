-- Migration 017: Guardian access, managed (login-less) profiles, 18-year cut-off
--
-- Goals
--   1. A guardian (family_members row with can_edit = true) can read AND write the health
--      data of the people they manage, not just view a dashboard.
--   2. A patient record can exist without its own login (children, parents).
--   3. A managed person claims their record later through an invite link; guardian and
--      claimed person can remove each other, but a profile always keeps one guardian.
--   4. Guardianship over a child ends on their 18th birthday (users.guardianship_ends_on).
--
-- Existing users are untouched: their users.id already equals their auth id and
-- can_manage(their id) is true through the `pid = auth.uid()` branch.

-- ─────────────────────────────────────────────
-- 1. Columns
-- ─────────────────────────────────────────────
alter table public.family_members
  add column if not exists can_edit boolean not null default false,
  add column if not exists is_self boolean not null default false,          -- the person themself (claimed invite)
  add column if not exists former_guardian boolean not null default false;  -- guardian whose rights ended at 18

-- Managed rows have their own uuid; existing rows keep matching auth.users ids.
alter table public.users drop constraint if exists users_id_fkey;
alter table public.users alter column email drop not null;
alter table public.users
  add column if not exists is_managed boolean not null default false,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists guardianship_ends_on date;

-- ─────────────────────────────────────────────
-- 2. Central access check
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
        join public.users u on u.id = fm.patient_id
        where fm.patient_id = pid
          and fm.user_id = auth.uid()
          and fm.is_active = true
          and fm.can_edit = true
          -- the person themself never expires; guardians stop at 18
          and (fm.is_self or u.guardianship_ends_on is null or u.guardianship_ends_on > current_date)
      );
$$;

revoke all on function public.can_manage(uuid) from public, anon;
grant execute on function public.can_manage(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 3. Create a managed profile (guardian action)
-- ─────────────────────────────────────────────
create or replace function public.create_managed_profile(
  p_name text,
  p_date_of_birth date default null,
  p_gender text default null,
  p_relationship text default null,   -- the guardian's relationship, e.g. 'Mother'
  p_is_minor boolean default false    -- true: guardianship ends on the 18th birthday
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid := gen_random_uuid();
  ends_on date;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Name is required';
  end if;
  if p_gender is not null and p_gender not in ('male', 'female', 'other') then
    raise exception 'Invalid gender';
  end if;

  if p_is_minor then
    if p_date_of_birth is null then
      raise exception 'Date of birth is required for a child profile';
    end if;
    ends_on := (p_date_of_birth + interval '18 years')::date;
    if ends_on <= current_date then
      raise exception 'This person is already 18 or older; create an adult profile instead';
    end if;
  end if;

  perform set_config('wellnest.system', 'on', true);

  insert into public.users (id, name, date_of_birth, gender, is_managed, created_by, guardianship_ends_on)
  values (new_id, trim(p_name), p_date_of_birth, p_gender, true, auth.uid(), ends_on);

  insert into public.family_members
    (patient_id, name, relationship, user_id, can_edit, accepted_at, is_active)
  values
    (new_id, coalesce((select name from public.users where id = auth.uid()), 'Guardian'),
     p_relationship, auth.uid(), true, now(), true);

  return new_id;
end;
$$;

revoke all on function public.create_managed_profile(text, date, text, text, boolean) from public, anon;
grant execute on function public.create_managed_profile(text, date, text, text, boolean) to authenticated;

-- ─────────────────────────────────────────────
-- 4. Claim invite for the person themself
-- ─────────────────────────────────────────────
-- Callable by a current guardian, or by a former guardian (rights ended at 18) so the parent
-- can still hand the profile over. Returns the token for /join?token=...
create or replace function public.create_claim_invite(p_patient uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  tok text := gen_random_uuid()::text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not (
    public.can_manage(p_patient)
    or exists (
      select 1 from public.family_members fm
      where fm.patient_id = p_patient and fm.user_id = auth.uid() and fm.former_guardian
    )
  ) then
    raise exception 'Not allowed';
  end if;

  if not exists (select 1 from public.users where id = p_patient and is_managed) then
    raise exception 'Not a managed profile';
  end if;

  if exists (
    select 1 from public.family_members
    where patient_id = p_patient and is_self and user_id is not null and is_active
  ) then
    raise exception 'This profile has already been claimed';
  end if;

  perform set_config('wellnest.system', 'on', true);

  delete from public.family_members
  where patient_id = p_patient and is_self and user_id is null;

  insert into public.family_members
    (patient_id, name, relationship, invite_token, can_edit, is_self, is_active, visibility_config)
  values
    (p_patient, (select name from public.users where id = p_patient), 'self', tok, true, true, true, '{}');

  return tok;
end;
$$;

revoke all on function public.create_claim_invite(uuid) from public, anon;
grant execute on function public.create_claim_invite(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 4b. Claiming any family invite (viewer or guardian)
-- ─────────────────────────────────────────────
-- The old flow was `UPDATE family_members ... WHERE invite_token = ...` under the policy
-- "Family members claim invite" (004). Unclaimed rows are hidden by the SELECT policy, so
-- that update matched nothing, and the policy let an invitee rewrite any column of the row.
-- Replace both with one function that can only set user_id and accepted_at.
drop policy if exists "Family members claim invite" on public.family_members;

create or replace function public.claim_family_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.family_members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.family_members
     set user_id = auth.uid(), accepted_at = now()
   where invite_token = p_token
     and user_id is null
     and is_active = true
  returning * into rec;

  if not found then
    raise exception 'This invite is invalid or has already been used';
  end if;

  return to_jsonb(rec);
end;
$$;

revoke all on function public.claim_family_invite(text) from public, anon;
grant execute on function public.claim_family_invite(text) to authenticated;

-- ─────────────────────────────────────────────
-- 5. 18-year cut-off
-- ─────────────────────────────────────────────
-- can_manage() already stops honouring guardians on the date itself. This also switches off
-- their remaining view-through access (family dashboards use family_members.is_active).
create or replace function public.expire_guardianships()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  perform set_config('wellnest.system', 'on', true);
  with expired as (
    update public.family_members fm
       set can_edit = false, is_active = false, former_guardian = true
      from public.users u
     where u.id = fm.patient_id
       and fm.can_edit and not fm.is_self and fm.is_active
       and u.guardianship_ends_on is not null
       and u.guardianship_ends_on <= current_date
    returning fm.id
  )
  select count(*) into n from expired;
  return n;
end;
$$;

revoke all on function public.expire_guardianships() from public, anon;
grant execute on function public.expire_guardianships() to authenticated;

-- Nightly job where pg_cron exists; the app also calls this on sign-in as a fallback.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('wellnest-expire-guardianships', '15 0 * * *', 'select public.expire_guardianships()');
exception when others then
  raise notice 'pg_cron not available (%); relying on the app calling expire_guardianships()', sqlerrm;
end $$;

-- ─────────────────────────────────────────────
-- 6. Rewrite owner-only policies to use can_manage()
-- ─────────────────────────────────────────────
-- ALTER POLICY keeps names and commands. family_members is handled separately below.
do $$
declare
  r record;
  changed int := 0;
begin
  for r in
    select schemaname, tablename, policyname, qual, with_check
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
-- 7. users: guardians read/update the profiles they manage
-- ─────────────────────────────────────────────
create policy "Guardians read managed profiles"
  on public.users for select
  using (is_managed = true and public.can_manage(id));

create policy "Guardians update managed profiles"
  on public.users for update
  using (is_managed = true and public.can_manage(id))
  with check (is_managed = true and public.can_manage(id));

-- Nobody but the system may change the fields that decide who is a guardian and until when.
create or replace function public.users_guard_managed_fields()
returns trigger
language plpgsql
as $$
begin
  if current_setting('wellnest.system', true) = 'on' or auth.uid() is null then
    return new;
  end if;
  if new.is_managed is distinct from old.is_managed
     or new.created_by is distinct from old.created_by
     or new.guardianship_ends_on is distinct from old.guardianship_ends_on then
    raise exception 'This field cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_users_guard_managed_fields on public.users;
create trigger trg_users_guard_managed_fields
  before update on public.users
  for each row execute procedure public.users_guard_managed_fields();

-- ─────────────────────────────────────────────
-- 8. family_members: guardians manage the circle (mutual)
-- ─────────────────────────────────────────────
create policy "Managers manage circle"
  on public.family_members for all
  using (public.can_manage(patient_id))
  with check (public.can_manage(patient_id));

-- Guard 1: non-managers (an invitee claiming their row) may only set user_id / accepted_at /
-- last_seen_at. Without this, the claim policy from 004 would let an invitee change patient_id
-- or can_edit on their own row and take over someone else's profile.
create or replace function public.family_members_guard_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('wellnest.system', true) = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if (new.can_edit or new.is_self or new.former_guardian) and not public.can_manage(new.patient_id) then
      raise exception 'Only a guardian can grant edit access';
    end if;
    return new;
  end if;

  if not public.can_manage(old.patient_id) then
    if new.patient_id is distinct from old.patient_id
       or new.can_edit is distinct from old.can_edit
       or new.is_self is distinct from old.is_self
       or new.former_guardian is distinct from old.former_guardian
       or new.is_active is distinct from old.is_active
       or new.invite_token is distinct from old.invite_token
       or new.visibility_config is distinct from old.visibility_config then
      raise exception 'Only a guardian can change this';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_family_members_guard_columns on public.family_members;
create trigger trg_family_members_guard_columns
  before insert or update on public.family_members
  for each row execute procedure public.family_members_guard_columns();

-- Guard 2: a managed profile always keeps at least one active guardian (or the person
-- themself). Mutual removal is allowed; removing the last one is not.
create or replace function public.family_members_keep_a_guardian()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  removing boolean;
begin
  if current_setting('wellnest.system', true) = 'on' then
    return coalesce(new, old);
  end if;
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
-- 9. Storage: folder name is the patient id
-- ─────────────────────────────────────────────
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

-- Post-run check (run manually): policies still pinned to auth.uid() on patient_id.
--   select tablename, policyname from pg_policies
--   where schemaname = 'public' and (qual like '(patient_id = auth.uid())'
--      or with_check like '(patient_id = auth.uid())');
--   -- expect only family_members "Patients manage own family"
