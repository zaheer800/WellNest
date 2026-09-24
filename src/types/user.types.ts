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
  invite_token: string | null
  invited_at: string
  accepted_at: string | null
  last_seen_at: string | null
  is_active: boolean
  /** Guardian: may read and write the patient's data */
  can_edit?: boolean
  /** The person themself (claimed their own managed profile) */
  is_self?: boolean
  /** Guardian whose rights ended when the person turned 18 */
  former_guardian?: boolean
}

/** A person the signed-in account manages (own record, child, parent...) */
export interface ManagedProfile {
  patientId: string
  name: string
  dateOfBirth: string | null
  /** Guardianship over a child ends on this date (their 18th birthday) */
  guardianshipEndsOn: string | null
  /** True when this person has claimed the profile and is the signed-in account */
  isSelf: boolean
  /** The guardian's relationship to this person, e.g. "Mother" */
  relationship: string | null
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
  user_id: string | null
  name: string
  specialty: DoctorSpecialty | null
  hospital: string | null
  phone: string | null
  email: string | null
  notes: string | null
  invite_token: string | null
  added_at: string
  is_active: boolean
}

/** Minimal user fields returned by the `users!patient_id(id, name, email)` join */
export interface JoinedPatientUser {
  id: string
  name: string
  email: string
}

export interface FamilyMemberWithUser extends FamilyMember {
  users: JoinedPatientUser | null
}

export interface DoctorWithUser extends Doctor {
  users: JoinedPatientUser | null
}
