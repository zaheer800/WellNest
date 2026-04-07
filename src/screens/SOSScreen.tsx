import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Phone, MessageCircle, ArrowLeft, ShieldCheck } from 'lucide-react'

const HOLD_DURATION = 3000 // ms to hold before activating

export default function SOSScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [activated, setActivated] = useState(false)
  const [holding, setHolding]     = useState(false)
  const [progress, setProgress]   = useState(0) // 0–100

  const holdStart   = useRef<number>(0)
  const rafRef      = useRef<number>(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const contacts = user?.emergency_contacts ?? []

  // Animate progress ring while holding
  const startHold = () => {
    if (activated) return
    setHolding(true)
    holdStart.current = performance.now()

    const tick = () => {
      const elapsed = performance.now() - holdStart.current
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setActivated(true)
        setHolding(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const cancelHold = () => {
    if (activated) return
    setHolding(false)
    setProgress(0)
    cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const whatsappContact = (phone: string, name: string) => {
    const msg = encodeURIComponent(
      `🆘 Emergency! ${user?.name ?? 'Someone'} needs help. Please call immediately.`
    )
    // Normalise phone: strip non-digits, keep leading +
    const cleaned = phone.replace(/[^\d+]/g, '')
    window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank')
  }

  // SVG ring dimensions
  const SIZE   = 200
  const R      = 86
  const CIRC   = 2 * Math.PI * R
  const stroke = CIRC - (progress / 100) * CIRC

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 via-red-600 to-rose-700 flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-safe pt-5 pb-4 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-white tracking-wide">Emergency SOS</h1>
      </div>

      <AnimatePresence mode="wait">
        {!activated ? (
          /* ── Hold-to-activate view ── */
          <motion.div
            key="hold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-10"
          >
            <div className="text-center space-y-2">
              <p className="text-white/80 text-base font-medium">Hold the button below for 3 seconds</p>
              <p className="text-white/50 text-sm">Your emergency contacts will be shown to call</p>
            </div>

            {/* Hold button with progress ring */}
            <div className="relative select-none">
              <svg width={SIZE} height={SIZE} className="-rotate-90">
                {/* Track */}
                <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
                {/* Progress */}
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke="white"
                  strokeWidth={10}
                  strokeDasharray={CIRC}
                  strokeDashoffset={stroke}
                  strokeLinecap="round"
                  style={{ transition: holding ? 'none' : 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>

              {/* Inner button */}
              <button
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                className={[
                  'absolute inset-0 m-auto w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1 transition-all',
                  holding
                    ? 'bg-white scale-95 shadow-[0_0_60px_rgba(255,255,255,0.4)]'
                    : 'bg-white/20 border-2 border-white/40 active:scale-95',
                ].join(' ')}
                style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
                aria-label="Hold for SOS"
              >
                <span className={`text-3xl font-black ${holding ? 'text-red-600' : 'text-white'}`}>SOS</span>
                <span className={`text-xs font-semibold ${holding ? 'text-red-400' : 'text-white/60'}`}>
                  {holding ? `${Math.ceil(((100 - progress) / 100) * 3)}s…` : 'Hold'}
                </span>
              </button>
            </div>

            {contacts.length === 0 && (
              <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-center max-w-xs mx-auto">
                <p className="text-white/80 text-sm font-medium">No emergency contacts added yet.</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-2 text-white text-sm font-bold underline underline-offset-2"
                >
                  Add contacts in Profile →
                </button>
              </div>
            )}

            <button
              onClick={() => navigate(-1)}
              className="text-white/50 text-sm font-medium py-2 hover:text-white/80 transition"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          /* ── Activated: show contacts ── */
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col px-5 gap-6 pb-10 overflow-y-auto"
          >
            <div className="text-center pt-2">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-5 py-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-white font-extrabold text-sm tracking-wide uppercase">SOS Activated</span>
              </motion.div>
              <p className="text-white/70 text-sm mt-3 font-medium">Call or message your emergency contacts</p>
            </div>

            <div className="space-y-4">
              {contacts.length > 0 ? contacts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 border border-white/20 rounded-3xl p-5 space-y-4"
                >
                  <div>
                    <p className="text-white font-extrabold text-xl leading-tight">{c.name}</p>
                    <p className="text-white/60 text-sm font-medium mt-0.5">{c.relationship} · {c.phone}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => callContact(c.phone)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 font-bold py-3.5 rounded-2xl text-sm shadow-lg hover:bg-red-50 active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </button>
                    <button
                      onClick={() => whatsappContact(c.phone, c.name)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg hover:bg-green-400 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center">
                  <p className="text-white/70 text-sm">No contacts saved. Add them in your Profile.</p>
                  <button onClick={() => navigate('/profile')} className="mt-2 text-white font-bold text-sm underline">
                    Go to Profile
                  </button>
                </div>
              )}
            </div>

            {/* I'm Safe button */}
            <button
              onClick={() => navigate(-1)}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-white/20 border-2 border-white/40 text-white font-extrabold py-4 rounded-2xl text-base hover:bg-white/30 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-5 h-5" /> I'm Safe — Cancel SOS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
