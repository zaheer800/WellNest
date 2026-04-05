import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getDoctorByToken } from '@/services/supabase'
import { Stethoscope, Loader2, AlertCircle } from 'lucide-react'

export default function JoinDoctorScreen() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { session, roles, acceptDoctorInvite, signInWithOtp, verifyOtp, switchRole, loading } = useAuthStore()

  const [invite, setInvite] = useState<{ name: string; specialty: string | null; patient_name: string } | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [step, setStep] = useState<'loading' | 'login' | 'otp' | 'accepting' | 'done' | 'error'>('loading')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  useEffect(() => {
    if (!token) { setStep('error'); setInviteError('No invite token found in link.'); return }
    getDoctorByToken(token)
      .then((record: any) => {
        setInvite({
          name: record.name,
          specialty: record.specialty,
          patient_name: record.users?.name ?? 'your patient',
        })
        if (session) {
          setStep('accepting')
          acceptDoctorInvite(token)
            .then(() => { switchRole('doctor'); setStep('done') })
            .catch((e: Error) => { setInviteError(e.message); setStep('error') })
        } else {
          setStep('login')
        }
      })
      .catch(() => {
        setInviteError('This invite link is invalid or has already been used.')
        setStep('error')
      })
  }, [token])

  useEffect(() => {
    if (roles.includes('doctor')) navigate('/doctor-dashboard', { replace: true })
  }, [roles])

  const handleSendOtp = async () => {
    if (!email.trim()) return
    setFormError(null)
    try {
      await signInWithOtp(email.trim())
      setStep('otp')
    } catch (e: any) {
      setFormError(e.message ?? 'Could not send verification code. Please try again.')
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return
    setFormError(null)
    try {
      await verifyOtp(email.trim(), otp.trim())
      setStep('accepting')
      await acceptDoctorInvite(token)
      switchRole('doctor')
      setStep('done')
    } catch (e: any) {
      // OTP wrong → stay on otp step and show inline error
      // Invite accept failure → go to error step
      const msg = e.message ?? 'Something went wrong.'
      if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('invite')) {
        setInviteError(msg); setStep('error')
      } else {
        setFormError(msg)
      }
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'

  const specialtyLabel = invite?.specialty
    ? invite.specialty.charAt(0).toUpperCase() + invite.specialty.slice(1)
    : 'Specialist'

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">WellNest Doctor Portal</h1>
        </div>

        {step === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
          </div>
        )}

        {step === 'login' && invite && (
          <div className="space-y-4">
            <div className="bg-teal-50 rounded-2xl p-4 text-center space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-teal-700">{invite.patient_name}</span> has invited you to view their health data.
              </p>
              <p className="text-xs text-gray-400">{specialtyLabel} access</p>
            </div>
            <p className="text-sm text-gray-500 text-center">Enter your email to access the portal</p>
            <input type="email" className={inputClass} placeholder="doctor@hospital.com" value={email} onChange={(e) => { setEmail(e.target.value); setFormError(null) }} onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()} />
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{formError}</p>
              </div>
            )}
            <button
              onClick={handleSendOtp}
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send verification code'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Enter the 6-digit code sent to <span className="font-medium text-gray-800">{email}</span></p>
            <input
              type="text"
              inputMode="numeric"
              className={`${inputClass} text-center text-xl tracking-[0.5em] font-bold`}
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setFormError(null) }}
            />
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{formError}</p>
              </div>
            )}
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify & access portal'}
            </button>
            <button onClick={() => setStep('login')} className="w-full text-xs text-gray-400 hover:text-gray-600">
              Use a different email
            </button>
          </div>
        )}

        {step === 'accepting' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            <p className="text-sm text-gray-500">Setting up your portal…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-4 space-y-3">
            <p className="text-2xl">🩺</p>
            <p className="font-semibold text-gray-800">Portal ready</p>
            <p className="text-sm text-gray-500">You can now view {invite?.patient_name}'s clinical data.</p>
            <button onClick={() => navigate('/doctor-dashboard', { replace: true })} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm">
              Open portal
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
