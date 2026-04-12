-- Migration 012: Replace family/doctor storage SELECT policies with signed URL approach
--
-- The SELECT policies for family/doctor allow them to LIST files in the patient's
-- storage folder, which triggers Supabase's "anyone can list files" warning.
-- Fix: drop those policies. File access for family/doctor is granted via short-lived
-- signed URLs generated server-side (patient's session or Edge Function), not via
-- direct storage SELECT policies.

DROP POLICY IF EXISTS "Family members read linked patient report files" ON storage.objects;
DROP POLICY IF EXISTS "Doctors read linked patient report files" ON storage.objects;
