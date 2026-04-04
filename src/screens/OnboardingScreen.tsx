import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'

interface Step1Data { name: string; date_of_birth: string; gender: 'male' | 'female' | 'other' }
interface Step2Data { height_cm: number; weight_kg: number }

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { user, updateProfile, loading } = useAuthStore()
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)

  const form1 = useForm<Step1Data>()
  const form2 = useForm<Step2Data>({ mode: 'onBlur' })

  // If profile is already complete, skip to dashboard
  useEffect(() => {
    if (user?.name && user?.height_cm && user?.weight_kg) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  const handleStep2 = async (data: Step2Data) => {
    try {
      await updateProfile({
        ...(step1Data ?? {}),
        height_cm: Number(data.height_cm),
        weight_kg: Number(data.weight_kg),
      })
      setStep(3)
    } catch (e) {
      // Error handled by store
    }
  }

  const handleSkip = async () => {
    if (step1Data) {
      try { await updateProfile(step1Data) } catch { /* best effort */ }
    }
    navigate('/dashboard', { replace: true })
  }

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12 pb-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-indigo-500' : s < step ? 'w-2 bg-indigo-300' : 'w-2 bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1">
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">About you</h2>
              <p className="text-gray-500 text-sm mt-1">Help us personalise your experience.</p>
            </div>

            <div>
              <label className={labelClass}>Full name</label>
              <input className={inputClass} placeholder="Your name" {...form1.register('name', { required: true })} />
            </div>

            <div>
              <label className={labelClass}>Date of birth</label>
              <input type="date" className={inputClass} {...form1.register('date_of_birth')} />
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <div className="flex gap-3">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <label key={g} className="flex-1 cursor-pointer">
                    <input type="radio" value={g} className="sr-only" {...form1.register('gender')} />
                    <div className={`text-center py-2.5 rounded-xl border text-sm font-medium capitalize transition ${form1.watch('gender') === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                      {g}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button type="submit" variant="primary" fullWidth>Continue</Button>
              <button type="button" onClick={handleSkip} className="w-full text-sm text-gray-400 hover:text-gray-600">
                Skip for now
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Body measurements</h2>
              <p className="text-gray-500 text-sm mt-1">Used to personalise your health scores.</p>
            </div>

            <div>
              <label className={labelClass}>Height (cm)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="170"
                {...form2.register('height_cm', {
                  required: 'Height is required',
                  min: { value: 50, message: 'Height must be at least 50 cm' },
                  max: { value: 300, message: 'Height must be less than 300 cm' }
                })}
              />
              {form2.formState.errors.height_cm && (
                <p className="text-red-500 text-xs mt-1">{form2.formState.errors.height_cm.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                placeholder="70"
                {...form2.register('weight_kg', {
                  required: 'Weight is required',
                  min: { value: 10, message: 'Weight must be at least 10 kg' },
                  max: { value: 500, message: 'Weight must be less than 500 kg' }
                })}
              />
              {form2.formState.errors.weight_kg && (
                <p className="text-red-500 text-xs mt-1">{form2.formState.errors.weight_kg.message}</p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Button type="submit" variant="primary" fullWidth loading={loading}>Continue</Button>
              <button type="button" onClick={handleSkip} className="w-full text-sm text-gray-400 hover:text-gray-600">
                Skip for now
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center space-y-6 pt-8">
            <div className="text-7xl">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
              <p className="text-gray-500 text-sm mt-2">
                Welcome to WellNest{step1Data?.name ? `, ${step1Data.name}` : ''}. Your health journey starts now.
              </p>
            </div>
            <div className="w-full space-y-2 text-left bg-indigo-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">What's next</p>
              {['Log your first medication', 'Set your water goal', 'Track your posture today'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-indigo-900">
                  <span className="text-indigo-400">✓</span> {item}
                </div>
              ))}
            </div>
            <Button variant="primary" fullWidth onClick={() => navigate('/dashboard', { replace: true })}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
