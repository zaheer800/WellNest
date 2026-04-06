import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { HeartPulse, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const GOALS = [
  { id: 'condition',  emoji: '🏥', title: 'Managing a condition',      sub: 'Track symptoms, meds & reports' },
  { id: 'wellness',   emoji: '🌱', title: 'General health & wellness',  sub: 'Build healthy daily habits' },
  { id: 'family',     emoji: '👨‍👩‍👧', title: 'Supporting a family member', sub: 'Stay connected to their health' },
  { id: 'recovery',   emoji: '💊', title: 'Post-treatment recovery',    sub: 'Monitor progress after treatment' },
]

const TOTAL_STEPS = 8 // 0 = welcome, 7 = finale

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cmToFtIn(cm: number): string {
  const totalIn = cm / 2.54
  const ft = Math.floor(totalIn / 12)
  const inches = Math.round(totalIn % 12)
  return `${ft}′ ${inches}″`
}

function calcBmi(cm: number, kg: number): number {
  const m = cm / 100
  return Math.round((kg / (m * m)) * 10) / 10
}

function bmiLabel(bmi: number): { text: string; color: string } {
  if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-400' }
  if (bmi < 25)   return { text: 'Healthy', color: 'text-emerald-400' }
  if (bmi < 30)   return { text: 'Overweight', color: 'text-amber-400' }
  return                  { text: 'Obese', color: 'text-red-400' }
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

// ─── Stepper with hold-to-fast-scroll ──────────────────────────────────────────

function Stepper({
  value, min, max, onChange, display, sub,
}: {
  value: number; min: number; max: number
  onChange: (v: number) => void
  display: React.ReactNode
  sub?: React.ReactNode
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null)

  const startHold = useCallback((dir: 1 | -1) => {
    const tick = () => onChange(Math.min(max, Math.max(min, value + dir)))
    tick()
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(tick, 80)
    }, 400)
  }, [value, min, max, onChange])

  const endHold = () => {
    if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => () => endHold(), [])

  const btnClass = 'w-16 h-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all select-none'

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        className={btnClass}
        onPointerDown={() => startHold(1)}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        aria-label="Increase"
      >
        <ChevronUp className="w-7 h-7" />
      </button>

      <div className="text-center min-w-[180px]">
        {display}
        {sub && <div className="mt-2">{sub}</div>}
      </div>

      <button
        className={btnClass}
        onPointerDown={() => startHold(-1)}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        aria-label="Decrease"
      >
        <ChevronDown className="w-7 h-7" />
      </button>
    </div>
  )
}

// ─── DOB Drum Column ────────────────────────────────────────────────────────────

function DrumColumn({
  value, min, max, display, label, onChange,
}: {
  value: number; min: number; max: number
  display: (v: number) => string
  label: string
  onChange: (v: number) => void
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null)

  const startHold = (dir: 1 | -1) => {
    const tick = () => {
      onChange(
        dir === 1
          ? (value < max ? value + 1 : min)
          : (value > min ? value - 1 : max)
      )
    }
    tick()
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(tick, 80)
    }, 400)
  }

  const endHold = () => {
    if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => () => endHold(), [])

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</p>
      <button
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition select-none"
        onPointerDown={() => startHold(1)}
        onPointerUp={endHold}
        onPointerLeave={endHold}
      >
        <ChevronUp className="w-4 h-4 text-white/70" />
      </button>
      <div className="text-3xl font-black text-white w-full text-center leading-tight">
        {display(value)}
      </div>
      <button
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition select-none"
        onPointerDown={() => startHold(-1)}
        onPointerUp={endHold}
        onPointerLeave={endHold}
      >
        <ChevronDown className="w-4 h-4 text-white/70" />
      </button>
    </div>
  )
}

// ─── Animation variants ─────────────────────────────────────────────────────────

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

const transition = { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const }

// ─── Main component ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const navigate  = useNavigate()
  const { user, updateProfile, loading } = useAuthStore()

  const [step,      setStep]      = useState(0)
  const [direction, setDirection] = useState(1)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // Collected data
  const [name,      setName]      = useState('')
  const [day,       setDay]       = useState(1)
  const [month,     setMonth]     = useState(1)
  const [year,      setYear]      = useState(1990)
  const [gender,    setGender]    = useState<'male' | 'female' | 'other' | null>(null)
  const [heightCm,  setHeightCm]  = useState(170)
  const [weightKg,  setWeightKg]  = useState(70)
  const [goal,      setGoal]      = useState<string | null>(null)

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.name && user?.height_cm && user?.weight_kg) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  // Clamp day when month/year changes
  useEffect(() => {
    const maxDay = daysInMonth(month, year)
    if (day > maxDay) setDay(maxDay)
  }, [month, year])

  const goNext = () => { setDirection(1);  setStep((s) => s + 1) }
  const goBack = () => { setDirection(-1); setStep((s) => s - 1) }

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      await updateProfile({
        name: name.trim(),
        date_of_birth: dob,
        gender: gender ?? undefined,
        height_cm: heightCm,
        weight_kg: weightKg,
      })
      goNext()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => navigate('/dashboard', { replace: true })

  // Progress bar fill (steps 1–6 are "data" steps)
  const progress = step === 0 ? 0 : step >= 7 ? 100 : Math.round(((step) / 7) * 100)

  // ── Background: dark for welcome/finale, light for data steps ─────────────
  const isDark = step === 0 || step === 7
  const bgClass = isDark
    ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950'
    : 'bg-gradient-to-b from-indigo-50/40 via-white to-white'

  // ── Step content ────────────────────────────────────────────────────────────

  const bmi      = calcBmi(heightCm, weightKg)
  const bmiInfo  = bmiLabel(bmi)
  const maxDay   = daysInMonth(month, year)
  const currentYear = new Date().getFullYear()

  const stepContent: React.ReactNode = (() => {
    switch (step) {

      // ── 0: Welcome ────────────────────────────────────────────────────────
      case 0:
        return (
          <div className="flex flex-col items-center justify-center text-center gap-8 px-6 py-16">
            <div className="relative">
              <div className="w-28 h-28 bg-white/15 rounded-[2rem] backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <HeartPulse className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">✓</span>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                Your health,<br />your way.
              </h1>
              <p className="text-indigo-200 text-base leading-relaxed max-w-xs mx-auto">
                WellNest tracks your medications, symptoms, reports and daily habits — all in one place.
              </p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <button
                onClick={goNext}
                className="w-full bg-white text-indigo-700 font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:bg-indigo-50 active:scale-95 transition-all"
              >
                Get started →
              </button>
              <button
                onClick={handleSkip}
                className="w-full text-indigo-300/70 text-sm font-medium py-2 hover:text-indigo-200 transition"
              >
                Skip setup for now
              </button>
            </div>
          </div>
        )

      // ── 1: Name ───────────────────────────────────────────────────────────
      case 1:
        return (
          <div className="flex flex-col gap-8 px-6 py-8">
            <div>
              <p className="text-indigo-500 text-sm font-semibold mb-2">Step 1 of 6</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">What should<br />we call you?</h2>
              <p className="text-gray-500 text-sm mt-2">We'll use your name throughout the app.</p>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 border-0 border-b-2 border-gray-200 focus:border-indigo-500 pb-3 focus:outline-none bg-transparent placeholder:text-gray-300 transition-colors"
            />

            <button
              onClick={goNext}
              disabled={!name.trim()}
              className="w-full bg-indigo-600 text-white font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none mt-auto"
            >
              Continue →
            </button>
          </div>
        )

      // ── 2: Date of birth ──────────────────────────────────────────────────
      case 2:
        return (
          <div className="flex flex-col gap-8 px-6 py-8">
            <div>
              <p className="text-indigo-500 text-sm font-semibold mb-2">Step 2 of 6</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                When were<br />you born,{' '}
                <span className="text-indigo-600">{name.split(' ')[0]}</span>?
              </h2>
              <p className="text-gray-500 text-sm mt-2">Helps us personalise your health reference ranges.</p>
            </div>

            <div className="flex gap-4 justify-center bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-[0_8px_30px_rgba(99,102,241,0.3)]">
              <DrumColumn
                label="Day"
                value={day}
                min={1}
                max={maxDay}
                display={(v) => String(v).padStart(2, '0')}
                onChange={setDay}
              />
              <div className="w-px bg-white/20 self-stretch" />
              <DrumColumn
                label="Month"
                value={month}
                min={1}
                max={12}
                display={(v) => MONTHS[v - 1]}
                onChange={setMonth}
              />
              <div className="w-px bg-white/20 self-stretch" />
              <DrumColumn
                label="Year"
                value={year}
                min={1920}
                max={currentYear - 1}
                display={(v) => String(v)}
                onChange={setYear}
              />
            </div>

            <button
              onClick={goNext}
              className="w-full bg-indigo-600 text-white font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Continue →
            </button>
          </div>
        )

      // ── 3: Gender ─────────────────────────────────────────────────────────
      case 3:
        return (
          <div className="flex flex-col gap-8 px-6 py-8">
            <div>
              <p className="text-indigo-500 text-sm font-semibold mb-2">Step 3 of 6</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">How do<br />you identify?</h2>
              <p className="text-gray-500 text-sm mt-2">Used for accurate health reference ranges.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'male',   emoji: '👨', label: 'Male'   },
                { value: 'female', emoji: '👩', label: 'Female' },
                { value: 'other',  emoji: '🧑', label: 'Other'  },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={[
                    'flex flex-col items-center gap-3 py-6 rounded-2xl border-2 transition-all active:scale-95',
                    gender === opt.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-[0_4px_16px_rgba(99,102,241,0.2)]'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  ].join(' ')}
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className={`text-sm font-bold ${gender === opt.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={!gender}
              className="w-full bg-indigo-600 text-white font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none mt-auto"
            >
              Continue →
            </button>
          </div>
        )

      // ── 4: Height ─────────────────────────────────────────────────────────
      case 4:
        return (
          <div className="flex flex-col gap-8 px-6 py-8">
            <div>
              <p className="text-indigo-500 text-sm font-semibold mb-2">Step 4 of 6</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">How tall<br />are you?</h2>
              <p className="text-gray-500 text-sm mt-2">Used to calculate BMI and personalise your plan.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-[0_8px_30px_rgba(99,102,241,0.3)] flex items-center justify-center">
              <Stepper
                value={heightCm}
                min={50}
                max={250}
                onChange={setHeightCm}
                display={
                  <div>
                    <span className="text-7xl font-black text-white">{heightCm}</span>
                    <span className="text-2xl font-bold text-white/60 ml-2">cm</span>
                  </div>
                }
                sub={<p className="text-white/50 text-base font-semibold">{cmToFtIn(heightCm)}</p>}
              />
            </div>

            <button
              onClick={goNext}
              className="w-full bg-indigo-600 text-white font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Continue →
            </button>
          </div>
        )

      // ── 5: Weight ─────────────────────────────────────────────────────────
      case 5:
        return (
          <div className="flex flex-col gap-8 px-6 py-8">
            <div>
              <p className="text-indigo-500 text-sm font-semibold mb-2">Step 5 of 6</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">What do<br />you weigh?</h2>
              <p className="text-gray-500 text-sm mt-2">We'll calculate your BMI and track changes over time.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-[0_8px_30px_rgba(99,102,241,0.3)] flex items-center justify-center">
              <Stepper
                value={weightKg}
                min={10}
                max={300}
                onChange={setWeightKg}
                display={
                  <div>
                    <span className="text-7xl font-black text-white">{weightKg}</span>
                    <span className="text-2xl font-bold text-white/60 ml-2">kg</span>
                  </div>
                }
                sub={
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-white/60 text-sm font-medium">BMI {bmi}</span>
                    <span className={`text-sm font-bold ${bmiInfo.color}`}>{bmiInfo.text}</span>
                  </div>
                }
              />
            </div>

            <button
              onClick={goNext}
              className="w-full bg-indigo-600 text-white font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Continue →
            </button>
          </div>
        )

      // ── 6: Goal ───────────────────────────────────────────────────────────
      case 6:
        return (
          <div className="flex flex-col gap-6 px-6 py-8">
            <div>
              <p className="text-indigo-500 text-sm font-semibold mb-2">Step 6 of 6</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">What brings<br />you here?</h2>
              <p className="text-gray-500 text-sm mt-2">We'll personalise your dashboard around your goal.</p>
            </div>

            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={[
                    'w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]',
                    goal === g.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-[0_4px_16px_rgba(99,102,241,0.15)]'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  ].join(' ')}
                >
                  <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${goal === g.id ? 'text-indigo-800' : 'text-gray-800'}`}>{g.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.sub}</p>
                  </div>
                  {goal === g.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={!goal || saving || loading}
              className="w-full bg-indigo-600 text-white font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {saving || loading ? 'Saving…' : 'Finish setup →'}
            </button>
          </div>
        )

      // ── 7: Finale ─────────────────────────────────────────────────────────
      case 7: {
        const goalData = GOALS.find((g) => g.id === goal)
        const trackingItems = {
          condition: ['Medications & doses', 'Symptoms & severity', 'Lab & imaging reports'],
          wellness:  ['Daily health score', 'Water & exercise', 'Progress trends'],
          family:    ['Family health circle', 'Shared updates', 'Appointment tracking'],
          recovery:  ['Post-treatment meds', 'Recovery milestones', 'Doctor check-ins'],
        }[goal ?? 'wellness']

        return (
          <div className="flex flex-col items-center text-center gap-8 px-6 py-16">
            <div className="space-y-3">
              <div className="text-5xl mb-2">🎉</div>
              <h1 className="text-4xl font-black text-white leading-tight">
                You're all set,<br />
                <span className="text-indigo-300">{name.split(' ')[0] || 'friend'}</span>!
              </h1>
              <p className="text-indigo-200 text-base leading-relaxed">
                Your WellNest is personalised and ready to go.
              </p>
            </div>

            {goalData && (
              <div className="w-full bg-white/10 border border-white/20 rounded-3xl p-5 text-left space-y-3">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  {goalData.emoji} {goalData.title}
                </p>
                {trackingItems?.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-400/30 border border-indigo-400/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/80 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full space-y-3">
              <button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full bg-white text-indigo-700 font-bold text-base py-4 rounded-2xl shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:bg-indigo-50 active:scale-95 transition-all"
              >
                Go to my dashboard →
              </button>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  })()

  // ── Shell ────────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col transition-colors duration-500 overflow-hidden`}>

      {/* Top bar: progress + back */}
      {step > 0 && step < 7 && (
        <div className="flex items-center gap-3 px-5 pt-safe pt-5 pb-2 flex-shrink-0">
          <button
            onClick={goBack}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-gray-200/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <button
            onClick={handleSkip}
            className={`text-xs font-semibold transition ${
              isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Skip
          </button>
        </div>
      )}

      {/* Step content with slide animation */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 flex flex-col overflow-y-auto"
          >
            {stepContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
