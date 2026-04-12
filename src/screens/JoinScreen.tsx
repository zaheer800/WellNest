import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getFamilyMemberByToken } from '@/services/supabase'
import { HeartHandshake, Loader2, AlertCircle, Mail } from 'lucide-react'

export default function JoinScreen() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { session, roles, acceptInvite, signInWithOtp, switchRole, loading } = useAuthStore()

  const [invite, setInvite] = useState<{ name: string; patient_name: string } | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [step, setStep] = useState<'loading' | 'login' | 'sent' | 'accepting' | 'done' | 'error'>('loading')
  const [email, setEmail] = useState('')

  // Load invite details. If already authenticated (magic link return), go straight to accepting.
  useEffect(() => {
    if (!token) { setStep('error'); setInviteError('No invite token found in link.'); return }
    getFamilyMemberByToken(token)
      .then((record: any) => {
        setInvite({
          name: record.name,
          patient_name: record.users?.name ?? 'your family member',
        })
        if (session) {
          runAccept()
        } else {
          setStep('login')
        }
      })
      .catch(() => {
        setInviteError('This invite link is invalid or has already been used.')
        setStep('error')
      })
  }, [token])

  // React when session arrives after the magic link redirect
  useEffect(() => {
    if (session && (step === 'login' || step === 'sent')) runAccept()
  }, [session])

  // Once the family role is active, redirect to family dashboard
  useEffect(() => {
    if (roles.includes('family')) navigate('/family-dashboard', { replace: true })
  }, [roles])

  const runAccept = async () => {
    setStep('accepting')
    try {
      await acceptInvite(token)
      switchRole('family')
      setStep('done')
    } catch (e: any) {
      setInviteError(e.message ?? 'Could not accept invite.')
      setStep('error')
    }
  }

  const handleSendLink = async () => {
    if (!email.trim()) return
    setFormError(null)
    try {
      const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
      const redirectTo = `${appUrl}/auth/callback?returnTo=${encodeURIComponent(`/join?token=${token}`)}`
      await signInWithOtp(email.trim(), redirectTo)
      setStep('sent')
    } catch (e: any) {
      setFormError(e.message ?? 'Could not send sign-in link. Please try again.')
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-8 h-8 text-brand-teal" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">WellNest Family</h1>
        </div>

        {step === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-brand-teal animate-spin" />
          </div>
        )}

        {step === 'login' && invite && (
          <div className="space-y-4">
            <div className="bg-brand-teal-light rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-brand-navy">{invite.patient_name}</span> has invited you to their WellNest health circle.
              </p>
            </div>
            <p className="text-sm text-gray-500 text-center">Enter your email to receive a sign-in link</p>
            <input
              type="email"
              className={inputClass}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFormError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
            />
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{formError}</p>
              </div>
            )}
            <button
              onClick={handleSendLink}
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-brand-teal text-white rounded-xl font-semibold text-sm hover:bg-brand-teal-dark disabled:opacity-60 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send sign-in link'}
            </button>
          </div>
        )}

        {step === 'sent' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 bg-brand-teal-light rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-brand-teal" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Check your email</p>
              <p className="text-sm text-gray-500 mt-1">
                We sent a sign-in link to{' '}
                <span className="font-medium text-gray-700">{email}</span>.
                Open it on this device to continue.
              </p>
            </div>
            <p className="text-xs text-gray-400">The link expires in 1 hour. Check your spam folder if you don't see it.</p>
            <button onClick={() => setStep('login')} className="text-xs text-brand-teal hover:text-brand-navy font-medium">
              Use a different email
            </button>
          </div>
        )}

        {step === 'accepting' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-6 h-6 text-brand-teal animate-spin" />
            <p className="text-sm text-gray-500">Joining the circle…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-4 space-y-3">
            <p className="text-2xl">🎉</p>
            <p className="font-semibold text-gray-800">You're in!</p>
            <p className="text-sm text-gray-500">You can now see {invite?.patient_name}'s health updates.</p>
            <button onClick={() => navigate('/family-dashboard', { replace: true })} className="w-full py-3 bg-brand-teal text-white rounded-xl font-semibold text-sm">
              Go to dashboard
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="flex items-start gap-3 bg-red-50 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{inviteError ?? 'Something went wrong. Please ask for a new invite link.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
