-- Symptom progression tracking table
-- One row per patient+symptom pair, upserted each time a symptom is logged

CREATE TABLE IF NOT EXISTS symptom_progressions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symptom_name       text NOT NULL,
  first_onset_date   date,
  current_severity   smallint CHECK (current_severity BETWEEN 1 AND 10),
  baseline_severity  smallint CHECK (baseline_severity BETWEEN 1 AND 10),
  trend              text CHECK (trend IN ('improving', 'stable', 'worsening', 'resolved', 'new')),
  total_episodes     integer NOT NULL DEFAULT 1,
  last_logged_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (patient_id, symptom_name)
);

ALTER TABLE symptom_progressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_own_progressions" ON symptom_progressions
  FOR ALL USING (auth.uid() = patient_id);
