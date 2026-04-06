import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import { HeartPulse } from 'lucide-react'

interface EmailForm { email: string }
interface OtpForm { otp: string }

export default function LoginScreen() {
  const navigate = useNavigate()
  const { signInWithOtp, verifyOtp, signInWithGoogle, loading } = useAuthStore()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const emailForm = useForm<EmailForm>()
  const otpForm = useForm<OtpForm>()

  const handleSendOtp = async (data: EmailForm) => {
    setError('')
    try {
      await signInWithOtp(data.email)
      setEmail(data.email)
      setStep('otp')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP')
    }
  }

  const handleVerifyOtp = async (data: OtpForm) => {
    setError('')
    try {
      await verifyOtp(email, data.otp)
      navigate('/onboarding', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative background bloom */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.75rem] shadow-[0_8px_30px_rgba(99,102,241,0.35)] flex items-center justify-center">
              <HeartPulse className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">WellNest</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Your health. Your circle. Your journey.</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sign in or create an account. We'll send a one-time code to your email.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                {...emailForm.register('email', { required: 'Email is required' })}
              />
              {emailForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{emailForm.formState.errors.email.message}</p>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Send Code
            </Button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-3 text-gray-300 text-xs font-medium">or</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition active:scale-95"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Check your email</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">One-time code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="w-full border border-gray-200 rounded-xl px-4 py-4 text-2xl text-center tracking-[0.5em] font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                {...otpForm.register('otp', {
                  required: 'Code is required',
                  minLength: { value: 6, message: 'Enter the full 6-digit code' },
                })}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-red-500 text-xs mt-1.5">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Verify
            </Button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError('') }}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-1"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
