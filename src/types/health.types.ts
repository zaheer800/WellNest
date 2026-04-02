export interface Medication {
  id: string
  patient_id: string
  name: string
  dose: string | null
  unit: string | null
  frequency: 'daily' | 'alternate_days' | 'weekly' | 'custom'
  schedule_config: Record<string, unknown>
  start_date: string | null
  end_date: string | null
  is_active: boolean
  notes: string | null
  refill_reminder_days: number
  created_at: string
}

export interface MedicationLog {
  id: string
  medication_id: string
  patient_id: string
  scheduled_date: string
  taken: boolean
  taken_at: string | null
  skipped_reason: string | null
  created_at: string
}

export interface MedicationWithLog extends Medication {
  log?: MedicationLog
}

export interface WaterLog {
  id: string
  patient_id: string
  amount_ml: number
  fluid_type: string
  logged_at: string
}

export type SymptomCategory =
  | 'urinary'
  | 'neurological'
  | 'spinal'
  | 'digestive'
  | 'cardiac'
  | 'general'
  | 'other'

export interface SymptomLog {
  id: string
  patient_id: string
  symptom_name: string
  symptom_category: SymptomCategory
  severity: number
  notes: string | null
  metadata: Record<string, unknown>
  linked_finding_id: string | null
  logged_at: string
}

export interface ExerciseLog {
  id: string
  patient_id: string
  exercise_type: string
  is_physiotherapy: boolean
  duration_minutes: number | null
  distance_km: number | null
  notes: string | null
  logged_at: string
}

export interface PostureLog {
  id: string
  patient_id: string
  session_start: string
  session_end: string | null
  sitting_duration_minutes: number | null
  stand_breaks_taken: number
  lumbar_support_used: boolean | null
  screen_at_eye_level: boolean | null
  feet_flat_on_floor: boolean | null
  compliance_score: number | null
  notes: string | null
}

export interface ActivityRestriction {
  id: string
  patient_id: string
  restriction: string
  reason: string | null
  severity: 'advisory' | 'strict' | 'absolute'
  set_by_doctor_id: string | null
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
}

export interface DailyScore {
  id: string
  patient_id: string
  score_date: string
  total_score: number
  water_score: number
  medication_score: number
  exercise_score: number
  diet_score: number
  sleep_score: number
  posture_score: number
}

export interface HealthScoreBreakdown {
  total: number
  medication: number
  water: number
  exercise: number
  diet: number
  posture: number
}

export interface HealthPlan {
  id: string
  patient_id: string
  plan_type:
    | 'diet'
    | 'exercise'
    | 'lifestyle'
    | 'medication'
    | 'followup'
    | 'posture'
    | 'physiotherapy'
    | 'spine'
  title: string
  description: string | null
  triggered_by: string | null
  priority: 1 | 2 | 3
  is_active: boolean
  created_at: string
  expires_at: string | null
}

export interface Streak {
  id: string
  patient_id: string
  streak_type: string
  current_streak: number
  longest_streak: number
  last_logged_date: string | null
  updated_at: string
}
