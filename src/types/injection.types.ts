export interface InjectionCourse {
  id: string
  medication_id: string
  patient_id: string
  total_doses: number
  frequency: 'daily' | 'alternate_days' | 'weekly'
  start_date: string
  end_date: string | null
  doses_completed: number
  is_active: boolean
  post_course_medication_id: string | null
  notes: string | null
  created_at: string
}

export interface InjectionCourseLog {
  id: string
  course_id: string
  patient_id: string
  dose_number: number
  scheduled_date: string
  administered: boolean
  administered_at: string | null
  administered_by: 'self' | 'nurse' | 'doctor' | 'family' | null
  site: string | null
  side_effects_noted: string | null
  notes: string | null
}

export interface MedicationSideEffectLog {
  id: string
  medication_id: string
  patient_id: string
  side_effect: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  source: 'experienced' | 'read_about'
  guidance: string | null
  action_taken: 'continued' | 'stopped' | 'contacted_doctor' | 'monitored' | null
  resolved: boolean
  resolved_at: string | null
  logged_at: string
}

export interface InjectionCourseWithProgress extends InjectionCourse {
  next_dose_date: string | null
  progress_pct: number
}
