import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase, getUser, upsertUser, generateMedicalIdToken, getFamilyMemberByUserId, getDoctorByUserId, setAccessToken, getManagedProfiles, expireGuardianships, updateManagedProfile } from '@/services/supabase'
import type { User, UserProfile, ManagedProfile, FamilyMemberWithUser, DoctorWithUser } from '@/types/user.types'

export type AppRole = 'patient' | 'family' | 'doctor' | null

interface AuthState {
  user: User | null
  familyMemberRecord: FamilyMemberWithUser | null
  doctorRecord: DoctorWithUser | null
  /** Currently active view role */
  role: AppRole
  /** All roles this auth account has access to */
  roles: AppRole[]
  session: Session | null
  loading: boolean
  initialized: boolean
  /** People this account manages (children, parents, or its own claimed profile) */
  managedProfiles: ManagedProfile[]
  /** The person whose health data is on screen. Defaults to the signed-in user. */
  activePatientId: string | null
  activeProfile: User | null
}

interface AuthActions {
  initialize: () => Promise<void>
  signInWithOtp: (email: string, redirectTo?: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signInWithPhone: (phone: string) => Promise<void>
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  generateMedicalId: () => Promise<void>
  acceptInvite: (token: string) => Promise<void>
  acceptDoctorInvite: (token: string) => Promise<void>
  /** Switch active view between patient, family, and doctor roles */
  switchRole: (newRole: AppRole) => void
  /** Choose which managed person's data to view and edit */
  setActivePatient: (patientId: string) => Promise<void>
  /** Reload the list of managed people (after adding, removing or claiming one) */
  refreshManagedProfiles: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

const ACTIVE_PATIENT_KEY = 'wn.activePatientId'

interface ResolvedAccount {
  user: User | null
  familyMemberRecord: FamilyMemberWithUser | null
  doctorRecord: AuthState['doctorRecord']
  role: AppRole
  roles: AppRole[]
  managedProfiles: ManagedProfile[]
  activePatientId: string | null
  activeProfile: User | null
}

/**
 * Works out everything about a signed-in account: its roles, the people it manages and
 * which person is currently being viewed. Shared by startup and auth-state changes.
 */
async function resolveAccount(authUser: { id: string; email?: string | null }): Promise<ResolvedAccount> {
  // Ends guardianship over anyone who has turned 18. Idempotent; the nightly job does the same.
  expireGuardianships().catch(() => {})

  const [familyRecord, existingUser, doctorRec, managedProfiles] = await Promise.all([
    getFamilyMemberByUserId(authUser.id),
    getUser(authUser.id),
    getDoctorByUserId(authUser.id),
    getManagedProfiles(authUser.id),
  ])

  const roles: AppRole[] = []
  let familyMemberRecord: FamilyMemberWithUser | null = null
  let doctorRecord: AuthState['doctorRecord'] = null
  let user: User | null = null

  if (familyRecord) {
    familyMemberRecord = familyRecord
    roles.push('family')
  }
  if (doctorRec) {
    doctorRecord = doctorRec
    roles.push('doctor')
  }

  const isOnboardedPatient = !!existingUser && (existingUser.name ?? '').trim() !== ''
  const hasOtherRole = !!familyRecord || !!doctorRec
  const managesOthers = managedProfiles.length > 0

  if (isOnboardedPatient) {
    user = existingUser!
    roles.push('patient')
  } else if (managesOthers || !hasOtherRole) {
    user = existingUser ?? await upsertUser(authUser.id, { email: authUser.email ?? '' })
    roles.push('patient')
  }

  const role: AppRole = roles.includes('patient') ? 'patient'
    : roles.includes('doctor') ? 'doctor'
    : (roles[0] ?? null)

  // Who is being viewed: the remembered choice if still valid, else yourself, else the first managed person.
  const candidates = [...(isOnboardedPatient ? [authUser.id] : []), ...managedProfiles.map((m) => m.patientId)]
  const remembered = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_PATIENT_KEY) : null
  const activePatientId = roles.includes('patient')
    ? (remembered && candidates.includes(remembered) ? remembered : (candidates[0] ?? authUser.id))
    : null

  let activeProfile: User | null = user
  if (activePatientId && activePatientId !== authUser.id) {
    try { activeProfile = await getUser(activePatientId) } catch { activeProfile = null }
  }

  return { user, familyMemberRecord, doctorRecord, role, roles, managedProfiles, activePatientId, activeProfile }
}

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
  managedProfiles: [],
  activePatientId: null,
  activeProfile: null,

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Called once on app mount. Loads the current session and user profile,
   * then subscribes to Supabase auth state changes for the lifetime of the app.
   */
  initialize: async () => {
    // Guard against double-initialization (React Strict Mode runs effects twice in dev,
    // which would stack two onAuthStateChange listeners and double all DB queries).
    if (get().initialized) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      let resolved: ResolvedAccount | null = null
      if (session?.user) {
        try {
          resolved = await resolveAccount(session.user)
        } catch {
          resolved = null
        }
      }

      // Cache the token immediately so invokeFunction can use it without calling getSession()
      setAccessToken(session?.access_token ?? null)
      set({
        session,
        user: resolved?.user ?? null,
        familyMemberRecord: resolved?.familyMemberRecord ?? null,
        doctorRecord: resolved?.doctorRecord ?? null,
        role: resolved?.role ?? null,
        roles: resolved?.roles ?? [],
        managedProfiles: resolved?.managedProfiles ?? [],
        activePatientId: resolved?.activePatientId ?? null,
        activeProfile: resolved?.activeProfile ?? null,
        initialized: true,
      })

      // Keep state in sync with Supabase auth events.
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        // Always keep the cached token current — invokeFunction reads this instead of calling getSession()
        setAccessToken(newSession?.access_token ?? null)

        if (event === 'SIGNED_OUT') {
          set({ session: null, user: null, familyMemberRecord: null, doctorRecord: null, role: null, roles: [], managedProfiles: [], activePatientId: null, activeProfile: null })
          return
        }

        // TOKEN_REFRESHED fires every ~50 minutes automatically.
        // Only the JWT changes — the user profile hasn't changed.
        // Running 3 DB queries here causes race conditions with ongoing CRUD operations,
        // because the subsequent set() can clobber in-flight optimistic state updates.
        if (event === 'TOKEN_REFRESHED') {
          set({ session: newSession })
          return
        }

        // For SIGNED_IN and USER_UPDATED: re-fetch the full profile.
        if (newSession?.user) {
          try {
            const r = await resolveAccount(newSession.user)
            set({
              session: newSession,
              user: r.user,
              familyMemberRecord: r.familyMemberRecord,
              doctorRecord: r.doctorRecord,
              role: r.role,
              roles: r.roles,
              managedProfiles: r.managedProfiles,
              activePatientId: r.activePatientId,
              activeProfile: r.activeProfile,
            })
          } catch {
            set({ session: newSession, user: null, familyMemberRecord: null, doctorRecord: null, role: null, roles: [], managedProfiles: [], activePatientId: null, activeProfile: null })
          }
        } else {
          set({ session: newSession, user: null, familyMemberRecord: null, doctorRecord: null, role: null, roles: [], managedProfiles: [], activePatientId: null, activeProfile: null })
        }
      })
    } catch {
      set({ initialized: true })
    }
  },

  /**
   * Sends a one-time password to the given email address.
   * Throws on error so the UI can display the message.
   */
  signInWithOtp: async (email: string, redirectTo?: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
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
   * Sends a one-time password via SMS to the given phone number.
   * Phone must be in E.164 format: +[country code][number] e.g. +919876543210
   */
  signInWithPhone: async (phone: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
    } finally {
      set({ loading: false })
    }
  },

  /**
   * Verifies the SMS OTP token submitted by the user.
   */
  verifyPhoneOtp: async (phone: string, token: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
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
      if (typeof localStorage !== 'undefined') localStorage.removeItem(ACTIVE_PATIENT_KEY)
      set({ user: null, session: null, managedProfiles: [], activePatientId: null, activeProfile: null })
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
    const record = await acceptFamilyInvite(token)

    // A guardian / "claim your own profile" invite gives full access, not the read-only circle view.
    if (record?.can_edit) {
      const r = await resolveAccount(session.user)
      if (typeof localStorage !== 'undefined' && record.patient_id) {
        localStorage.setItem(ACTIVE_PATIENT_KEY, record.patient_id)
      }
      const activePatientId = record.patient_id ?? r.activePatientId
      set({
        user: r.user,
        managedProfiles: r.managedProfiles,
        activePatientId,
        activeProfile: activePatientId && activePatientId !== session.user.id ? await getUser(activePatientId) : r.user,
        role: 'patient',
        roles: [...roles.filter((x) => x !== 'patient'), 'patient'],
      })
      return
    }

    const newRoles: AppRole[] = [...roles.filter((r) => r !== 'family'), 'family']
    set({
      familyMemberRecord: record as unknown as FamilyMemberWithUser,
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

  setActivePatient: async (patientId: string) => {
    const { session, user, managedProfiles } = get()
    if (!session?.user) return
    const allowed = patientId === session.user.id || managedProfiles.some((m) => m.patientId === patientId)
    if (!allowed) return
    if (typeof localStorage !== 'undefined') localStorage.setItem(ACTIVE_PATIENT_KEY, patientId)
    const profile = patientId === session.user.id ? user : await getUser(patientId)
    set({ activePatientId: patientId, activeProfile: profile })
  },

  refreshManagedProfiles: async () => {
    const { session } = get()
    if (!session?.user) return
    const managedProfiles = await getManagedProfiles(session.user.id)
    const { activePatientId } = get()
    const stillValid = !activePatientId || activePatientId === session.user.id || managedProfiles.some((m) => m.patientId === activePatientId)
    set({ managedProfiles, ...(stillValid ? {} : { activePatientId: session.user.id, activeProfile: get().user }) })
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
    const { session, activePatientId } = get()
    if (!session?.user) throw new Error('Not authenticated')

    // Editing a managed person (child / parent): write to their record, not the signed-in user's.
    if (activePatientId && activePatientId !== session.user.id) {
      const updated = await updateManagedProfile(activePatientId, profile)
      set({ activeProfile: updated as User })
      return
    }

    // Loading is managed by the calling component — updateProfile just performs the write
    // and updates the store. This prevents the global loading flag from blocking unrelated UI.
    const updatedUser = await upsertUser(session.user.id, {
      ...profile,
      email: session.user.email ?? undefined,
    })
    set({ user: updatedUser, activeProfile: updatedUser, activePatientId: session.user.id })
  },

  generateMedicalId: async () => {
    const { session, user } = get()
    if (!session?.user) throw new Error('Not authenticated')

    set({ loading: true })
    try {
      const token = await generateMedicalIdToken()
      set({ user: user ? { ...user, medical_id_token: token } : user })
    } finally {
      set({ loading: false })
    }
  },
}))
