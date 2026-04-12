-- Migration 016: Medical ID token rotation
--
-- medical_id_token was previously permanent with no way to revoke it.
-- If a user's Medical ID URL was shared or indexed, their medical data
-- (name, blood type, allergies, emergency contacts, medications) would be
-- permanently exposed. This migration adds a rotation RPC so users can
-- invalidate the old token and generate a new one from the settings screen.

CREATE OR REPLACE FUNCTION public.rotate_medical_id_token()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_token uuid;
BEGIN
  -- Caller must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_new_token := gen_random_uuid();

  UPDATE public.users
  SET medical_id_token = v_new_token
  WHERE id = auth.uid();

  RETURN v_new_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rotate_medical_id_token() TO authenticated;
