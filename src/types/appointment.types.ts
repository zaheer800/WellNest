export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string | null
  appointment_date: string
  appointment_type: string | null
  notes: string | null
  reminder_sent: boolean
  completed: boolean
  pre_visit_report_generated: boolean
  post_visit_notes: string | null
  follow_up_tasks: unknown[]
  completed_follow_up_tasks: string[]
  created_at: string
}

export interface VisitPreparation {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string | null
  reports_to_carry: unknown[]
  symptoms_to_mention: unknown[]
  questions_to_ask: unknown[]
  what_doctor_will_check: unknown[]
  medications_to_discuss: unknown[]
  generated_at: string
  viewed_by_patient: boolean
}
