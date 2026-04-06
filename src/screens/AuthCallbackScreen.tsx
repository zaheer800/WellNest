import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { HeartPulse } from 'lucide-react'

/**
 * Handles the OAuth redirect from Google (and any future OAuth providers).
 *
 * Supabase appends the token as a URL hash fragment (#access_token=...).
 * The SPA router would otherwise swallow this on the wildcard catch-all route
 * before onAuthStateChange can process it.
 *
 * This screen gives the Supabase client time to exchange the token, then
 * redirects the user to the right place.
 */
export default function AuthCallbackScreen() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const handleCallback = async () => {
      // Give Supabase's onAuthStateChange a moment to process the hash fragment
      // before we poll getSession()
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (cancelled) return

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (cancelled) return

        if (sessionError) {
          setError('Sign-in failed. Please try again.')
          setTimeout(() => navigate('/login', { replace: true }), 2500)
          return
        }

        if (session) {
          // Let the auth store's onAuthStateChange listener update state,
          // then navigate. SplashScreen will redirect to /onboarding or
          // /dashboard based on profile completeness.
          navigate('/', { replace: true })
        } else {
          // No session after waiting — token may have been invalid or expired
          navigate('/login', { replace: true })
        }
      } catch {
        if (!cancelled) {
          setError('Something went wrong. Redirecting to login…')
          setTimeout(() => navigate('/login', { replace: true }), 2000)
        }
      }
    }

    handleCallback()
    return () => { cancelled = true }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-white to-white flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[1.75rem] shadow-xl flex items-center justify-center">
          <HeartPulse className="w-10 h-10 text-white" />
        </div>

        {error ? (
          <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-4 py-3">{error}</p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">Signing you in…</p>
          </div>
        )}
      </div>
    </div>
  )
}
