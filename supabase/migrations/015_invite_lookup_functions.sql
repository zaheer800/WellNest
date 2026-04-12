-- Migration 015: SECURITY DEFINER functions for invite token lookups
--
-- getFamilyMemberByToken and getDoctorByToken previously did a direct SELECT
-- on family_members / doctors. No RLS policy allows that query for an
-- unauthenticated visitor or a family member who hasn't been linked yet —
-- the SELECT returned 0 rows, .single() threw, and the UI showed
-- "This invite link is invalid or has already been used."
--
-- Fix: two SECURITY DEFINER RPCs that bypass RLS and return only the
-- fields the join screens need (id, name, patient_name). The invite_token
-- UUID acts as the access credential, same pattern as get_medical_id_data.

-- ─── Family invite lookup ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_family_invite_details(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id',           fm.id,
    'name',         fm.name,
    'patient_name', COALESCE(u.name, 'your family member')
  )
  INTO v_result
  FROM public.family_members fm
  LEFT JOIN public.users u ON u.id = fm.patient_id
  WHERE fm.invite_token = p_token
    AND fm.is_active = true;

  RETURN v_result;   -- NULL when token not found / inactive
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_family_invite_details(uuid) TO anon, authenticated;

-- ─── Doctor invite lookup ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_doctor_invite_details(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id',           d.id,
    'name',         d.name,
    'specialty',    d.specialty,
    'patient_name', COALESCE(u.name, 'your patient')
  )
  INTO v_result
  FROM public.doctors d
  LEFT JOIN public.users u ON u.id = d.patient_id
  WHERE d.invite_token = p_token
    AND d.is_active = true;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_doctor_invite_details(uuid) TO anon, authenticated;
