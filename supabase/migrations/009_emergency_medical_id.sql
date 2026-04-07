-- ─── Emergency contacts + Medical ID fields ─────────────────────────────────
-- Adds blood_type, allergies, medical_id_token, emergency_contacts to users.
-- medical_id_token is a permanent public token — scanning it shows the
-- Medical ID page without requiring a login.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS blood_type      text,
  ADD COLUMN IF NOT EXISTS allergies       text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS medical_id_token uuid   NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS emergency_contacts jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Unique index so we can look up by token efficiently
CREATE UNIQUE INDEX IF NOT EXISTS users_medical_id_token_idx
  ON public.users (medical_id_token);

-- ─── Public RPC: get_medical_id_data ─────────────────────────────────────────
-- SECURITY DEFINER so it bypasses RLS — intentional, the token is the
-- access control mechanism (like a physical medical alert card).
-- Returns null if the token does not exist.

CREATE OR REPLACE FUNCTION public.get_medical_id_data(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'name',               u.name,
    'blood_type',         u.blood_type,
    'allergies',          COALESCE(u.allergies, '{}'),
    'emergency_contacts', COALESCE(u.emergency_contacts, '[]'::jsonb),
    'medications', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name',      m.name,
            'dose',      m.dose,
            'unit',      m.unit,
            'frequency', m.frequency
          ) ORDER BY m.created_at
        )
        FROM medications m
        WHERE m.patient_id = u.id
          AND m.is_active    = true
          AND m.is_injection = false
      ),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM public.users u
  WHERE u.medical_id_token = p_token;

  RETURN v_result;
END;
$$;

-- Grant execute to anonymous callers (needed for Edge Function / public page)
GRANT EXECUTE ON FUNCTION public.get_medical_id_data(uuid) TO anon, authenticated;
