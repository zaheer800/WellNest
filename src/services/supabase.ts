import { createClient } from '@supabase/supabase-js'
import type { User, UserProfile } from '@/types/user.types'
import type { VisitPreparation } from '@/types/appointment.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── User helpers ──────────────────────────────────────────────────────────────

/**
 * Fetch the user profile row from the `users` table for the given auth uid.
 * Returns null if no row exists yet.
 */
export async function getUser(uid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as User | null
}

/**
 * Insert or update a user profile row.
 * 
 * On first sign-up: Creates a row with the provided profile + email.
 * On subsequent updates: Updates only the fields provided, preserving existing values.
 */
export async function upsertUser(
  uid: string,
  profile: Partial<UserProfile> & { email?: string }
): Promise<User> {
  const now = new Date().toISOString()

  // First check if user exists
  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', uid)
    .maybeSingle()

  if (fetchError) {
    throw fetchError
  }

  if (existing) {
    // User exists: update only provided fields
    const updateData: any = { updated_at: now }
    
    if (profile.email) updateData.email = profile.email
    if (profile.name !== undefined && profile.name !== '') updateData.name = profile.name
    if (profile.date_of_birth !== undefined) updateData.date_of_birth = profile.date_of_birth
    if (profile.gender !== undefined) updateData.gender = profile.gender
    if (profile.height_cm !== undefined) updateData.height_cm = profile.height_cm
    if (profile.weight_kg !== undefined) updateData.weight_kg = profile.weight_kg

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', uid)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as User
  } else {
    // User doesn't exist: create with all provided fields
    const insertData: any = { id: uid, updated_at: now }
    
    if (profile.email) insertData.email = profile.email
    if (profile.name !== undefined) insertData.name = profile.name || ''
    if (profile.date_of_birth !== undefined) insertData.date_of_birth = profile.date_of_birth
    if (profile.gender !== undefined) insertData.gender = profile.gender
    if (profile.height_cm !== undefined) insertData.height_cm = profile.height_cm
    if (profile.weight_kg !== undefined) insertData.weight_kg = profile.weight_kg

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as User
  }
}

// ─── Medications ───────────────────────────────────────────────────────────────

export async function getMedications(patientId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addMedication(med: {
  patient_id: string
  name: string
  dose?: string
  unit?: string
  frequency?: string
  notes?: string
  start_date?: string
  is_injection?: boolean
  known_side_effects?: string[]
}) {
  const { data, error } = await supabase.from('medications').insert(med).select().single()
  if (error) throw error
  return data
}

export async function deleteMedication(id: string) {
  const { error } = await supabase.from('medications').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

// ─── Medication Logs ───────────────────────────────────────────────────────────

export async function getMedicationLogs(patientId: string, date: string) {
  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', patientId)
    .eq('scheduled_date', date)
  if (error) throw error
  return data ?? []
}

export async function upsertMedicationLog(log: {
  medication_id: string
  patient_id: string
  scheduled_date: string
  taken: boolean
  taken_at?: string | null
}) {
  const { data, error } = await supabase
    .from('medication_logs')
    .upsert(log, { onConflict: 'medication_id,scheduled_date' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Water Logs ────────────────────────────────────────────────────────────────

export async function getWaterLogs(patientId: string, date: string) {
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', `${date}T00:00:00`)
    .lte('logged_at', `${date}T23:59:59`)
    .order('logged_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addWaterLog(log: { patient_id: string; amount_ml: number; fluid_type?: string }) {
  const { data, error } = await supabase
    .from('water_logs')
    .insert({ ...log, logged_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWaterLog(id: string) {
  const { error } = await supabase.from('water_logs').delete().eq('id', id)
  if (error) throw error
}

// ─── Symptom Logs ──────────────────────────────────────────────────────────────

export async function getSymptomLogs(patientId: string, limit = 50) {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('logged_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function addSymptomLog(log: {
  patient_id: string
  symptom_name: string
  symptom_category: string
  severity: number
  notes?: string
  metadata?: Record<string, unknown>
  onset_date?: string | null
  is_backdated?: boolean
  environment?: Record<string, unknown>
}) {
  const { data, error } = await supabase
    .from('symptom_logs')
    .insert({ ...log, logged_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Exercise Logs ─────────────────────────────────────────────────────────────

export async function getExerciseLogs(patientId: string, date: string) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', `${date}T00:00:00`)
    .lte('logged_at', `${date}T23:59:59`)
  if (error) throw error
  return data ?? []
}

export async function addExerciseLog(log: {
  patient_id: string
  exercise_type: string
  is_physiotherapy?: boolean
  duration_minutes?: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .insert({ ...log, logged_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Posture Logs ──────────────────────────────────────────────────────────────

export async function getPostureLogs(patientId: string, date: string) {
  const { data, error } = await supabase
    .from('posture_logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('session_start', `${date}T00:00:00`)
    .lte('session_start', `${date}T23:59:59`)
    .order('session_start', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addPostureLog(log: {
  patient_id: string
  session_start: string
  stand_breaks_taken?: number
}) {
  const { data, error } = await supabase.from('posture_logs').insert(log).select().single()
  if (error) throw error
  return data
}

export async function updatePostureLog(
  id: string,
  updates: Partial<{ session_end: string; sitting_duration_minutes: number; stand_breaks_taken: number; compliance_score: number }>,
) {
  const { data, error } = await supabase.from('posture_logs').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ─── Activity Restrictions ─────────────────────────────────────────────────────

export async function getActivityRestrictions(patientId: string) {
  const { data, error } = await supabase
    .from('activity_restrictions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addActivityRestriction(r: {
  patient_id: string
  restriction: string
  reason?: string
  severity: 'advisory' | 'strict' | 'absolute'
}) {
  const { data, error } = await supabase.from('activity_restrictions').insert(r).select().single()
  if (error) throw error
  return data
}
// Debug function to test injection courses access
export async function debugInjectionCoursesAccess() {
  // Check if user can access injection_courses table at all
  const { data: tableData } = await supabase
    .from('injection_courses')
    .select('*')
    .limit(1)

  // Check medications table access
  const { data: medsData } = await supabase
    .from('medications')
    .select('*')
    .limit(1)

  return { tableData, medsData }
}

export async function getInjectionCourses(patientId: string) {
  try {
    const { data, error } = await supabase
      .from('injection_courses')
      .select(`
        *,
        medication:medications!medication_id(name)
      `)
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.message.includes('permission denied') || error.message.includes('policy')) {
        throw new Error(`RLS policy blocking access to injection_courses. Check Row Level Security policies. Error: ${error.message}`)
      }
      throw new Error(`Database query failed: ${error.message}`)
    }

    return data ?? []
  } catch (err) {
    throw err
  }
}

export async function addInjectionCourse(course: {
  patient_id: string
  medication_id: string
  total_doses: number
  frequency: 'daily' | 'alternate_days' | 'weekly'
  start_date: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('injection_courses')
    .insert(course)
    .select(`
      *,
      medication:medications!medication_id(name)
    `)
    .single()
  if (error) throw error
  return data
}

export async function updateInjectionCourse(
  id: string,
  updates: Partial<{
    total_doses: number
    frequency: 'daily' | 'alternate_days' | 'weekly'
    end_date: string
    is_active: boolean
    doses_completed: number
    post_course_medication_id: string
    notes: string
  }>
) {
  const { data, error } = await supabase
    .from('injection_courses')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      medication:medications!medication_id(name)
    `)
    .single()
  if (error) throw error
  return data
}

// ─── Injection Course Logs ─────────────────────────────────────────────────────

export async function getInjectionCourseLogs(courseId: string) {
  const { data, error } = await supabase
    .from('injection_course_logs')
    .select('*')
    .eq('course_id', courseId)
    .order('dose_number', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addInjectionCourseLog(log: {
  course_id: string
  patient_id: string
  dose_number: number
  scheduled_date: string
}) {
  const { data, error } = await supabase.from('injection_course_logs').insert(log).select().single()
  if (error) throw error
  return data
}

export async function markDoseAdministered(
  logId: string,
  updates: {
    administered_at: string
    administered_by: 'self' | 'nurse' | 'doctor' | 'family'
    site?: string
    side_effects_noted?: string
  },
) {
  const { data, error } = await supabase
    .from('injection_course_logs')
    .update({ ...updates, administered: true })
    .eq('id', logId)
    .select()
    .single()
  if (error) throw error
  return data
}
// ─── Daily Scores ──────────────────────────────────────────────────────────────

export async function getDailyScore(patientId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_scores')
    .select('*')
    .eq('patient_id', patientId)
    .eq('score_date', date)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertDailyScore(score: {
  patient_id: string
  score_date: string
  total_score: number
  water_score: number
  medication_score: number
  exercise_score: number
  diet_score: number
  sleep_score: number
  posture_score: number
}) {
  const { data, error } = await supabase
    .from('daily_scores')
    .upsert(score, { onConflict: 'patient_id,score_date' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Medication Side Effect Logs ───────────────────────────────────────────────

export async function getSideEffectLogs(patientId: string) {
  const { data, error } = await supabase
    .from('medication_side_effect_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('logged_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data ?? []
}

export async function addSideEffectLog(log: {
  patient_id: string
  medication_id: string
  side_effect: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  source: 'experienced' | 'read_about'
  guidance?: string
}) {
  const { data, error } = await supabase
    .from('medication_side_effect_logs')
    .insert({ ...log, logged_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function resolveSideEffect(id: string) {
  const { data, error } = await supabase
    .from('medication_side_effect_logs')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Symptom Progression ───────────────────────────────────────────────────────

export async function getSymptomProgressions(patientId: string) {
  const { data, error } = await supabase
    .from('symptom_progressions')
    .select('*')
    .eq('patient_id', patientId)
    .order('last_logged_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function upsertSymptomProgression(progressionData: {
  patient_id: string
  symptom_name: string
  first_onset_date?: string | null
  current_severity: number
  baseline_severity?: number | null
  trend: 'improving' | 'stable' | 'worsening' | 'resolved' | 'new' | null
  total_episodes?: number
}) {
  const { data, error } = await supabase
    .from('symptom_progressions')
    .upsert(
      { ...progressionData, last_logged_at: new Date().toISOString() },
      { onConflict: 'patient_id,symptom_name' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Appointments ──────────────────────────────────────────────────────────────

export async function getAppointments(patientId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addAppointment(appt: {
  patient_id: string
  doctor_id?: string | null
  appointment_date: string
  appointment_type?: string | null
  notes?: string | null
}) {
  const { data, error } = await supabase.from('appointments').insert(appt).select().single()
  if (error) throw error
  return data
}

export async function updateAppointment(
  id: string,
  updates: Partial<{
    completed: boolean
    post_visit_notes: string
    follow_up_tasks: unknown[]
    pre_visit_report_generated: boolean
  }>,
) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

// ─── Visit Preparations ────────────────────────────────────────────────────────

export async function getVisitPreparation(appointmentId: string) {
  const { data, error } = await supabase
    .from('visit_preparations')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertVisitPreparation(prep: Omit<VisitPreparation, 'id' | 'generated_at'>) {
  const { data, error } = await supabase
    .from('visit_preparations')
    .upsert({ ...prep, generated_at: new Date().toISOString() }, { onConflict: 'appointment_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markPrepViewed(id: string) {
  const { data, error } = await supabase
    .from('visit_preparations')
    .update({ viewed_by_patient: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Family Engagement ─────────────────────────────────────────────────────────

export async function logFamilyEngagement(log: {
  patient_id: string
  family_member_id: string
  engagement_type: string
}) {
  const { data, error } = await supabase
    .from('family_engagement_logs')
    .insert({ ...log, logged_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFamilyImpactScores(patientId: string, limit = 30) {
  const { data, error } = await supabase
    .from('family_impact_scores')
    .select('*')
    .eq('patient_id', patientId)
    .order('score_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
// ─── Lab Reports ───────────────────────────────────────────────────────────────

export async function getLabReports(patientId: string) {
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('patient_id', patientId)
    .order('report_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getLabParameters(reportId: string) {
  const { data, error } = await supabase
    .from('lab_parameters')
    .select('*')
    .eq('report_id', reportId)
    .order('parameter_name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ─── Imaging Reports ───────────────────────────────────────────────────────────

export async function getImagingReports(patientId: string) {
  const { data, error } = await supabase
    .from('imaging_reports')
    .select('*')
    .eq('patient_id', patientId)
    .order('report_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getImagingFindings(reportId: string) {
  const { data, error } = await supabase
    .from('imaging_findings')
    .select('*')
    .eq('report_id', reportId)
    .order('finding', { ascending: true })
  if (error) throw error
  return data ?? []
}