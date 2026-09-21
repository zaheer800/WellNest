-- Guardian access tests. Run through supabase/tests/run-local.sh (plain Postgres + shim).
-- Every check raises on failure, so a clean run means everything passed.

grant all on all tables in schema public to authenticated;
grant all on all tables in schema storage to authenticated;
grant execute on all functions in schema public to authenticated;

create or replace function pg_temp.as_user(u uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', u::text, false);
  perform set_config('request.jwt.claim.email', u::text || '@test.local', false);
  execute 'set role authenticated';
end $$;

create or replace function pg_temp.as_admin() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', false);
end $$;

-- expect_fail(sql, needle): the statement must raise, and the message must contain needle
create or replace function pg_temp.expect_fail(stmt text, needle text default '') returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if needle <> '' and position(lower(needle) in lower(sqlerrm)) = 0 then
      raise exception 'FAILED: "%" raised the wrong error: %', stmt, sqlerrm;
    end if;
    return;
  end;
  raise exception 'FAILED: expected an error but statement succeeded: %', stmt;
end $$;

create or replace function pg_temp.count_rows(stmt text) returns bigint language plpgsql as $$
declare n bigint;
begin execute 'select count(*) from (' || stmt || ') s' into n; return n; end $$;

create or replace function pg_temp.check(cond boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(cond, false) then raise exception 'FAILED: %', msg; end if; end $$;

-- ── Fixtures (as superuser) ─────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'alice@test.local'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'bob@test.local'),
  ('cccccccc-0000-0000-0000-000000000003', 'carol@test.local'),
  ('dddddddd-0000-0000-0000-000000000004', 'dave@test.local');   -- the teen, later
update public.users set name = split_part(email, '@', 1);

\echo == 1. Existing behaviour is unchanged for normal users
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.medications (patient_id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice med');
select pg_temp.check(pg_temp.count_rows('select 1 from public.medications') = 1, 'alice sees her medication');
select pg_temp.as_user('cccccccc-0000-0000-0000-000000000003');
select pg_temp.check(pg_temp.count_rows('select 1 from public.medications') = 0, 'carol does not see alice data');
select pg_temp.expect_fail($q$insert into public.medications (patient_id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'x')$q$, 'row-level security');

\echo == 2. Guardian creates a child profile and manages its data
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select set_config('t.kid', public.create_managed_profile('Kid', (current_date - interval '10 years')::date, 'female', 'Mother', true)::text, false);
insert into public.medications (patient_id, name) values (current_setting('t.kid')::uuid, 'Kid med');
insert into public.water_logs (patient_id, amount_ml) values (current_setting('t.kid')::uuid, 200);
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 1, 'alice sees kid med');
select pg_temp.check((select guardianship_ends_on from public.users where id = current_setting('t.kid')::uuid) = (current_date + interval '8 years')::date, 'guardianship ends at 18');
select pg_temp.check((select name from public.users where id = current_setting('t.kid')::uuid) = 'Kid', 'alice can read the managed profile');

\echo == 3. Unrelated users see nothing of the child
select pg_temp.as_user('cccccccc-0000-0000-0000-000000000003');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 0, 'carol sees no kid meds');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.users where id = current_setting('t.kid')::uuid$q$) = 0, 'carol cannot read kid profile');
select pg_temp.expect_fail($q$insert into public.medications (patient_id, name) values (current_setting('t.kid')::uuid, 'evil')$q$, 'row-level security');
select pg_temp.expect_fail($q$select public.create_managed_profile('X', null, 'male', null, true)$q$, 'Date of birth');
select pg_temp.expect_fail($q$select public.create_claim_invite(current_setting('t.kid')::uuid)$q$, 'Not allowed');

\echo == 4. Second guardian (spouse) joins through an invite
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.family_members (patient_id, name, relationship, invite_token, can_edit, is_active)
  values (current_setting('t.kid')::uuid, 'Bob', 'Father', 'tok-bob', true, true);
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000002');
select public.claim_family_invite('tok-bob');
insert into public.medications (patient_id, name) values (current_setting('t.kid')::uuid, 'Bob added');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 2, 'bob sees and writes kid data');

\echo == 5. Privilege escalation is blocked
-- carol is invited as a view-only relative and tries to promote herself / redirect the row
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.family_members (patient_id, name, relationship, invite_token, can_edit, is_active)
  values (current_setting('t.kid')::uuid, 'Carol', 'Aunt', 'tok-carol', false, true);
select pg_temp.as_user('cccccccc-0000-0000-0000-000000000003');
-- direct updates of an unclaimed invite match nothing (row is invisible, claim policy is gone)
update public.family_members set user_id = 'cccccccc-0000-0000-0000-000000000003', can_edit = true where invite_token = 'tok-carol';
update public.family_members set user_id = 'cccccccc-0000-0000-0000-000000000003', patient_id = 'aaaaaaaa-0000-0000-0000-000000000001' where invite_token = 'tok-carol';
select pg_temp.expect_fail($q$insert into public.family_members (patient_id, name, can_edit) values (current_setting('t.kid')::uuid, 'Carol2', true)$q$, '');
select pg_temp.as_admin();
select pg_temp.check((select user_id is null and not can_edit and patient_id = current_setting('t.kid')::uuid from public.family_members where invite_token = 'tok-carol'), 'carol invite row untouched by direct updates');
select pg_temp.as_user('cccccccc-0000-0000-0000-000000000003');
select pg_temp.expect_fail($q$select public.claim_family_invite('no-such-token')$q$, 'invalid or has already been used');
select public.claim_family_invite('tok-carol');                        -- legit claim: view-only
select pg_temp.expect_fail($q$select public.claim_family_invite('tok-carol')$q$, 'invalid or has already been used');  -- single use
select pg_temp.expect_fail($q$insert into public.medications (patient_id, name) values (current_setting('t.kid')::uuid, 'still no write')$q$, 'row-level security');
update public.family_members set can_edit = true where invite_token = 'tok-carol';                 -- 0 rows
select pg_temp.expect_fail($q$insert into public.medications (patient_id, name) values (current_setting('t.kid')::uuid, 'still no write 2')$q$, 'row-level security');
-- nobody can move guardianship dates or flip is_managed
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.expect_fail($q$update public.users set guardianship_ends_on = current_date + 9999 where id = current_setting('t.kid')::uuid$q$, 'cannot be changed');
select pg_temp.expect_fail($q$update public.users set is_managed = true where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, 'cannot be changed');
update public.users set name = 'Kid Renamed' where id = current_setting('t.kid')::uuid;  -- normal edits still work

\echo == 6. Mutual removal, but the last guardian stays
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000002');
delete from public.family_members where patient_id = current_setting('t.kid')::uuid and user_id = 'aaaaaaaa-0000-0000-0000-000000000001';  -- bob removes alice
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 0, 'alice lost access after removal');
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000002');
select pg_temp.expect_fail($q$delete from public.family_members where patient_id = current_setting('t.kid')::uuid and user_id = 'bbbbbbbb-0000-0000-0000-000000000002'$q$, 'at least one guardian');
select pg_temp.expect_fail($q$update public.family_members set is_active = false where patient_id = current_setting('t.kid')::uuid and user_id = 'bbbbbbbb-0000-0000-0000-000000000002'$q$, 'at least one guardian');
-- bob re-adds alice, then alice can remove bob (mutual)
insert into public.family_members (patient_id, name, relationship, invite_token, can_edit, is_active)
  values (current_setting('t.kid')::uuid, 'Alice', 'Mother', 'tok-alice', true, true);
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select public.claim_family_invite('tok-alice');
delete from public.family_members where patient_id = current_setting('t.kid')::uuid and user_id = 'bbbbbbbb-0000-0000-0000-000000000002';
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 2, 'alice back with access');

\echo == 7. Storage follows can_manage
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
insert into storage.objects (bucket_id, name) values ('reports', current_setting('t.kid') || '/report.pdf');
select pg_temp.as_user('cccccccc-0000-0000-0000-000000000003');
select pg_temp.expect_fail($q$insert into storage.objects (bucket_id, name) values ('reports', current_setting('t.kid') || '/evil.pdf')$q$, 'row-level security');
select pg_temp.check(pg_temp.count_rows($q$select 1 from storage.objects where name like current_setting('t.kid') || '/%'$q$) = 0, 'carol cannot list kid files');
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.check(pg_temp.count_rows($q$select 1 from storage.objects where name like current_setting('t.kid') || '/%'$q$) = 1, 'alice can list kid files');

\echo == 8. Teen claims the profile; guardian and teen can remove each other
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select set_config('t.claim', public.create_claim_invite(current_setting('t.kid')::uuid), false);
select pg_temp.as_user('dddddddd-0000-0000-0000-000000000004');
select public.claim_family_invite(current_setting('t.claim'));
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 2, 'dave sees his own data after claiming');
insert into public.medications (patient_id, name) values (current_setting('t.kid')::uuid, 'Dave added');
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.expect_fail($q$select public.create_claim_invite(current_setting('t.kid')::uuid)$q$, 'already been claimed');
select pg_temp.as_user('dddddddd-0000-0000-0000-000000000004');
delete from public.family_members where patient_id = current_setting('t.kid')::uuid and user_id = 'aaaaaaaa-0000-0000-0000-000000000001';  -- teen removes guardian
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid')::uuid$q$) = 0, 'alice lost access after teen removed her');

\echo == 9. The 18-year cut-off
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select set_config('t.kid2', public.create_managed_profile('Almost 18', (current_date - interval '18 years' + interval '1 day')::date, 'male', 'Mother', true)::text, false);
insert into public.medications (patient_id, name) values (current_setting('t.kid2')::uuid, 'before 18');
select pg_temp.expect_fail($q$select public.create_managed_profile('Adult', (current_date - interval '19 years')::date, 'male', 'Mother', true)$q$, 'already 18');
-- move the clock: the child turns 18 today
select pg_temp.as_admin();
update public.users set guardianship_ends_on = current_date where id = current_setting('t.kid2')::uuid;
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid2')::uuid$q$) = 0, 'alice cannot read after 18');
select pg_temp.expect_fail($q$insert into public.medications (patient_id, name) values (current_setting('t.kid2')::uuid, 'after 18')$q$, 'row-level security');
select pg_temp.check(public.expire_guardianships() = 1, 'expire_guardianships flips the guardian row');
select pg_temp.check((select former_guardian from public.family_members where patient_id = current_setting('t.kid2')::uuid and user_id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'row marked former_guardian');
select pg_temp.check(public.expire_guardianships() = 0, 'expire is idempotent');
-- a former guardian can still hand the profile over, but nothing else
select set_config('t.claim2', public.create_claim_invite(current_setting('t.kid2')::uuid), false);
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000002');
select public.claim_family_invite(current_setting('t.claim2'));
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid2')::uuid$q$) = 1, 'the 18-year-old (claimed) keeps their history');
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.check(pg_temp.count_rows($q$select 1 from public.medications where patient_id = current_setting('t.kid2')::uuid$q$) = 0, 'former guardian still locked out');

\echo == 10. Every owner-only policy was converted
select pg_temp.as_admin();
select pg_temp.check((select count(*) from pg_policies where schemaname = 'public'
  and (qual = '(patient_id = auth.uid())' or with_check = '(patient_id = auth.uid())')) = 1,
  'only family_members "Patients manage own family" keeps the raw owner check');

\echo ALL GUARDIAN TESTS PASSED
