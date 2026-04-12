export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  height_cm: number | null
  weight_kg: number | null
  profile_photo_url: string | null
  blood_type: string | null
  allergies: string[]
  medical_id_token: string | null
  emergency_contacts: EmergencyContact[]
  created_at: string
  updated_at: string
}

export interface UserProfile {
  name?: string
  phone?: string
  consent_accepted_at?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  height_cm?: number
  weight_kg?: number
  blood_type?: string
  allergies?: string[]
  emergency_contacts?: EmergencyContact[]
}

export interface FamilyMember {
  id: string
  patient_id: string
  name: string
  email: string | null
  phone: string | null
  relationship: string | null
  access_level: 1 | 2 | 3
  visibility_config: Record<string, boolean>
  invited_at: string
  accepted_at: string | null
  last_seen_at: string | null
  is_active: boolean
}

export type DoctorSpecialty =
  | 'nephrology'
  | 'urology'
  | 'neurology'
  | 'spine'
  | 'cardiology'
  | 'general'
  | 'other'

export interface Doctor {
  id: string
  patient_id: string
  name: string
  specialty: DoctorSpecialty | null
  hospital: string | null
  phone: string | null
  email: string | null
  notes: string | null
  added_at: string
  is_active: boolean
}
