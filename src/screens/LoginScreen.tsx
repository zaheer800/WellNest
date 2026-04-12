import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import WellNestIcon from '@/components/ui/WellNestIcon'

// ─── OTP input — 6 individual boxes ──────────────────────────────────────────

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handleChange = (i: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[i] = digit || ' '
    const next = arr.join('').trimEnd()
    onChange(next)
    if (digit && i < 5) {
      inputs.current[i + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      inputs.current[Math.min(pasted.length, 5)]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={[
            'w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all',
            'focus:outline-none focus:border-brand-teal focus:bg-brand-teal-light/50',
            value[i] ? 'border-brand-teal bg-brand-teal-light text-brand-navy' : 'border-gray-200 bg-gray-50 text-gray-800',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type FlowStep = 'input' | 'otp'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { signInWithOtp, verifyOtp, signInWithGoogle, loading } = useAuthStore()

  const [flowStep, setFlowStep] = useState<FlowStep>('input')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const canSubmitEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canVerify = otp.replace(/\s/g, '').length === 6

  // Auto-submit OTP when all 6 digits are entered
  useEffect(() => {
    if (canVerify && flowStep === 'otp') {
      handleVerify()
    }
  }, [otp])

  const handleSendOtp = async () => {
    setError('')
    try {
      await signInWithOtp(email)
      setFlowStep('otp')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code. Please try again.')
    }
  }

  const handleVerify = async () => {
    setError('')
    try {
      await verifyOtp(email, otp.trim())
      navigate('/onboarding', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Incorrect code. Please try again.')
    }
  }

  const handleBack = () => {
    setFlowStep('input')
    setOtp('')
    setError('')
  }

  // ── OTP verification screen ────────────────────────────────────────────────

  if (flowStep === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-teal-light/50 via-white to-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-teal-light rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="w-full max-w-sm space-y-8 relative">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-teal-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Enter the code</h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <OtpBoxes value={otp} onChange={setOtp} />

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
              {error}
            </p>
          )}

          <Button variant="primary" fullWidth onClick={handleVerify} loading={loading} disabled={!canVerify}>
            Verify & Continue
          </Button>

          <div className="text-center space-y-2">
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="text-sm text-brand-teal hover:text-brand-navy font-medium"
            >
              Resend code
            </button>
            <br />
            <button
              onClick={handleBack}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Change email
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Input screen ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-teal-light/50 via-white to-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-teal-light rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="w-full max-w-sm space-y-7 relative">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <WellNestIcon size={80} className="shadow-[0_8px_30px_rgba(14,165,183,0.25)]" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">WellNest</h1>
          <p className="text-gray-400 text-sm mt-1">Health Records. Smarter Insights. Better Decisions.</p>
        </div>

        {/* Email input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canSubmitEmail && handleSendOtp()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-2">We'll email you a magic link to sign in instantly</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          fullWidth
          loading={loading}
          disabled={!canSubmitEmail}
          onClick={handleSendOtp}
        >
          Send Code
        </Button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 text-gray-300 text-xs font-medium">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        {/* Google */}
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
      </div>
    </div>
  )
}
