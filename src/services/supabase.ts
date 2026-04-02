import { createClient } from '@supabase/supabase-js'
import type { User, UserProfile } from '@/types/user.types'

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
    console.error('[supabase] getUser error:', error.message)
    throw error
  }

  return data as User | null
}

/**
 * Insert or update a user profile row. Uses upsert so it works for both
 * first-time creation (after sign-up) and subsequent updates.
 */
export async function upsertUser(
  uid: string,
  profile: Partial<UserProfile> & { email?: string }
): Promise<User> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: uid,
        ...profile,
        updated_at: now,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('[supabase] upsertUser error:', error.message)
    throw error
  }

  return data as User
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
