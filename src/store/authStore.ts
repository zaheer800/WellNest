import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase, getUser, upsertUser, getFamilyMemberByUserId, getDoctorByUserId } from '@/services/supabase'
import type { User, UserProfile, FamilyMember } from '@/types/user.types'

export type AppRole = 'patient' | 'family' | 'doctor' | null

interface AuthState {
  user: User | null
  familyMemberRecord: FamilyMember | null
  doctorRecord: Record<string, any> | null
  /** Currently active view role */
  role: AppRole
  /** All roles this auth account has access to */
  roles: AppRole[]
  session: Session | null
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signInWithOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  acceptInvite: (token: string) => Promise<void>
  acceptDoctorInvite: (token: string) => Promise<void>
  /** Switch active view between patient, family, and doctor roles */
  switchRole: (newRole: AppRole) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ─── Initial state ──────────────────────────────────────────────────────────
  user: null,
  familyMemberRecord: null,
  doctorRecord: null,
  role: null,
  roles: [],
  session: null,
  loading: false,
  initialized: false,

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Called once on app mount. Loads the current session and user profile,
   * then subscribes to Supabase auth state changes for the lifetime of the app.
   */
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      let user: User | null = null
      let familyMemberRecord: FamilyMember | null = null
      let role: AppRole = null

      const detectedRoles: AppRole[] = []
      let doctorRecord: Record<string, any> | null = null

      if (session?.user) {
        try {
          // Check all three roles in parallel — a user can be patient, family member, and/or doctor
          const [familyRecord, existingUser, doctorRec] = await Promise.all([
            getFamilyMemberByUserId(session.user.id),
            getUser(session.user.id),
            getDoctorByUserId(session.user.id),
          ])

          if (familyRecord) {
            familyMemberRecord = familyRecord as unknown as FamilyMember
            detectedRoles.push('family')
          }

          if (doctorRec) {
            doctorRecord = doctorRec
            detectedRoles.push('doctor')
          }

          // The DB trigger auto-creates a stub users row (name='') for every OTP signup,
          // including doctors and family members. Only treat as patient if they have a
          // non-empty name (completed onboarding) OR have no other role yet.
          const isOnboardedPatient = existingUser && (existingUser.name ?? '').trim() !== ''
          const hasOtherRole = !!familyRecord || !!doctorRec

          if (isOnboardedPatient) {
            user = existingUser!
            detectedRoles.push('patient')
          } else if (!hasOtherRole) {
            // New user with no other roles — treat as patient, send through onboarding
            user = existingUser ?? await upsertUser(session.user.id, { email: session.user.email ?? '' })
            detectedRoles.push('patient')
          }

          // Default active role priority: patient > doctor > family
          role = detectedRoles.includes('patient') ? 'patient'
            : detectedRoles.includes('doctor') ? 'doctor'
            : (detectedRoles[0] ?? null)
        } catch {
          user = null
        }
      }

      set({ session, user, familyMemberRecord, doctorRecord, role, roles: detectedRoles, initialized: true })

      // Keep state in sync with Supabase auth events (token refresh, sign-out, etc.)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT') {
          set({ session: null, user: null, familyMemberRecord: null, doctorRecord: null, role: null, roles: [] })
          return
        }

        if (newSession?.user) {
          let updatedUser: User | null = null
          let updatedFamilyRecord: FamilyMember | null = null
          let updatedDoctorRecord: Record<string, any> | null = null
          let updatedRole: AppRole = null
          const updatedRoles: AppRole[] = []
          try {
            const [familyRecord, existingUser, doctorRec] = await Promise.all([
              getFamilyMemberByUserId(newSession.user.id),
              getUser(newSession.user.id),
              getDoctorByUserId(newSession.user.id),
            ])

            if (familyRecord) {
              updatedFamilyRecord = familyRecord as unknown as FamilyMember
              updatedRoles.push('family')
            }

            if (doctorRec) {
              updatedDoctorRecord = doctorRec
              updatedRoles.push('doctor')
            }

            const isOnboardedPatient = existingUser && (existingUser.name ?? '').trim() !== ''
            const hasOtherRole = !!familyRecord || !!doctorRec

            if (isOnboardedPatient) {
              updatedUser = existingUser!
              updatedRoles.push('patient')
            } else if (!hasOtherRole) {
              updatedUser = existingUser ?? await upsertUser(newSession.user.id, { email: newSession.user.email ?? '' })
              updatedRoles.push('patient')
            }

            updatedRole = updatedRoles.includes('patient') ? 'patient'
              : updatedRoles.includes('doctor') ? 'doctor'
              : (updatedRoles[0] ?? null)
          } catch {
            updatedUser = null
          }
          set({ session: newSession, user: updatedUser, familyMemberRecord: updatedFamilyRecord, doctorRecord: updatedDoctorRecord, role: updatedRole, roles: updatedRoles })
        } else {
          set({ session: newSession, user: null, familyMemberRecord: null, doctorRecord: null, role: null, roles: [] })
        }
      })
    } catch (err) {
      set({ initialized: true })
    }
  },

  /**
   * Sends a one-time password to the given email address.
   * Throws on error so the UI can display the message.
   */
  signInWithOtp: async (email: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
    } finally {
      set({ loading: false })
    }
  },

  /**
   * Verifies the OTP token submitted by the user.
   * On success the onAuthStateChange listener above will update the store.
   */
  verifyOtp: async (email: string, token: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error
    } finally {
      set({ loading: false })
    }
  },

  /**
   * Initiates the Google OAuth flow. Supabase redirects the browser;
   * the onAuthStateChange listener handles the resulting session.
   */
  signInWithGoogle: async () => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } finally {
      set({ loading: false })
    }
  },

  /**
   * Signs out the current user and clears state.
   */
  signOut: async () => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, session: null })
    } finally {
      set({ loading: false })
    }
  },

  /**
   * Links the current auth account to a family member invite token.
   * Called after login on the /join route.
   */
  acceptInvite: async (token: string) => {
    const { session, roles } = get()
    if (!session?.user) throw new Error('Must be logged in to accept an invite')
    const { acceptFamilyInvite } = await import('@/services/supabase')
    const record = await acceptFamilyInvite(token, session.user.id)
    const newRoles: AppRole[] = [...roles.filter((r) => r !== 'family'), 'family']
    set({
      familyMemberRecord: record as unknown as FamilyMember,
      role: 'family',
      roles: newRoles,
    })
  },

  acceptDoctorInvite: async (token: string) => {
    const { session, roles } = get()
    if (!session?.user) throw new Error('Must be logged in to accept an invite')
    const { acceptDoctorInvite: dbAccept } = await import('@/services/supabase')
    const record = await dbAccept(token, session.user.id)
    const newRoles: AppRole[] = [...roles.filter((r) => r !== 'doctor'), 'doctor']
    set({ doctorRecord: record, role: 'doctor', roles: newRoles })
  },

  switchRole: (newRole: AppRole) => {
    const { roles } = get()
    if (!roles.includes(newRole)) return
    set({ role: newRole })
  },

  /**
   * Persists profile changes to the `users` table and refreshes local state.
   */
  updateProfile: async (profile: Partial<UserProfile>) => {
    const { session } = get()
    if (!session?.user) throw new Error('Not authenticated')

    set({ loading: true })
    try {
      const updatedUser = await upsertUser(session.user.id, profile)
      set({ user: updatedUser })
    } finally {
      set({ loading: false })
    }
  },
}))
