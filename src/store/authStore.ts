import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase, getUser, upsertUser } from '@/services/supabase'
import type { User, UserProfile } from '@/types/user.types'

interface AuthState {
  user: User | null
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
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ─── Initial state ──────────────────────────────────────────────────────────
  user: null,
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
      if (session?.user) {
        try {
          user = await getUser(session.user.id)

          // If no profile row yet, seed one with just the email so we have a record
          if (!user) {
            user = await upsertUser(session.user.id, {
              email: session.user.email ?? '',
            })
          }
        } catch {
          // Non-fatal: profile fetch failed; proceed without profile data
          user = null
        }
      }

      set({ session, user, initialized: true })

      // Keep state in sync with Supabase auth events (token refresh, sign-out, etc.)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT') {
          set({ session: null, user: null })
          return
        }

        if (newSession?.user) {
          let updatedUser: User | null = null
          try {
            updatedUser = await getUser(newSession.user.id)

            if (!updatedUser) {
              updatedUser = await upsertUser(newSession.user.id, {
                email: newSession.user.email ?? '',
              })
            }
          } catch {
            updatedUser = null
          }
          set({ session: newSession, user: updatedUser })
        } else {
          set({ session: newSession, user: null })
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
