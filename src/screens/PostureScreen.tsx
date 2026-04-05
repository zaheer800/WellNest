import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePostureStore } from '@/store/postureStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import CircularProgress from '@/components/ui/CircularProgress'
import ProgressBar from '@/components/ui/ProgressBar'
import { today } from '@/utils/dateHelpers'
import { UserCheck, BellRing, PersonStanding, Flag, Loader, CheckCircle } from 'lucide-react'

const POSTURE_TIPS = [
  'Keep your lumbar spine supported — use a cushion or lumbar roll.',
  'Screen should be at eye level — your neck should not tilt down.',
  'Feet flat on the floor, knees at 90° — no crossing legs.',
]

const CHECKLIST_ITEMS = [
  { key: 'lumbar', label: 'Lumbar support in use' },
  { key: 'screen', label: 'Screen at eye level' },
  { key: 'feet', label: 'Feet flat on floor' },
]

export default function PostureScreen() {
  const { user } = useAuthStore()
  const { isTracking, activeSession, lastStandBreak, standBreakGoal, postureLogs, startSitting, recordStandBreak, endSession, fetchTodayLogs, getSittingDurationMinutes } = usePostureStore()

  const [sittingMins, setSittingMins] = useState(0)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({ lumbar: false, screen: false, feet: false })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patientId = user?.id ?? ''
  const date = today()

  const resetBreaks = async () => {
    if (!patientId) return
    if (confirm("Are you sure you want to reset today's posture logs?")) {
      setIsLoading(true)
      try {
        await usePostureStore.getState().resetTodayBreaks(patientId, date)
        setChecklist({ lumbar: false, screen: false, feet: false })
      } catch (err) {
        setError("Failed to reset logs")
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (patientId) fetchTodayLogs(patientId, date)
  }, [patientId, date])

  // Live sitting timer
  useEffect(() => {
    if (!isTracking) return
    const interval = setInterval(() => setSittingMins(getSittingDurationMinutes()), 30000)
    setSittingMins(getSittingDurationMinutes())
    return () => clearInterval(interval)
  }, [isTracking])

  const breaksTaken = postureLogs.reduce((s, l) => s + l.stand_breaks_taken, 0) + (activeSession?.stand_breaks_taken ?? 0)
  const compliancePct = Math.min(100, Math.round((breaksTaken / standBreakGoal) * 100))

  const lastBreakMins = lastStandBreak ? Math.floor((Date.now() - lastStandBreak.getTime()) / 60000) : null

  const toggleCheck = (key: string) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleStartSitting = async () => {
    if (!patientId) {
      setError('User not authenticated')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await startSitting(patientId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start posture tracking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStandBreak = async () => {
    if (!patientId) {
      setError('User not authenticated')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      if (!isTracking) {
        await startSitting(patientId)
      }
      await recordStandBreak(patientId)
      setSittingMins(0)
      // Reset posture checklist so user re-verifies when they sit back down
      setChecklist({ lumbar: false, screen: false, feet: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record stand break')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!patientId) {
      setError('User not authenticated')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await endSession(patientId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end posture session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper title="Posture & Desk Health">
      <div className="px-4 pt-2 space-y-6 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* ─── NOT TRACKING STATE ─── */}
        {!isTracking ? (
          <div className="space-y-6">
            <div className="pt-8 pb-10 px-6 text-center bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-[2rem] shadow-sm relative overflow-hidden">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-6 text-indigo-500 relative z-10">
                <UserCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 relative z-10">Ready for work?</h2>
              <p className="text-gray-500 mb-8 text-[15px] leading-relaxed relative z-10">
                Start tracking to monitor your continuous sitting time and get reminders to stretch every 45 minutes.
              </p>
              
              <button 
                type="button" 
                onClick={handleStartSitting} 
                disabled={isLoading} 
                className="relative z-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-bold text-lg shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up...' : 'Start Tracking'}
              </button>
            </div>

            {/* Daily Progress summary available outside tracking too */}
            <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">Daily Goal</h3>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={resetBreaks} className="cursor-pointer text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 px-2 py-1 rounded-md active:scale-95">Reset</button>
                    <span className="text-sm font-extrabold text-emerald-600">{breaksTaken} <span className="text-gray-400 font-medium">/ {standBreakGoal} breaks</span></span>
                  </div>
                </div>
                <ProgressBar value={compliancePct} color="green" height="md" />
              </div>
            </div>
          </div>
        ) : (
          /* ─── ACTIVELY TRACKING STATE ─── */
          <div className="space-y-6">
            
            {/* The Timer Dashboard */}
            <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-[2rem] p-8 text-center text-white relative shadow-xl overflow-hidden">
              {/* Animated background blob */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-50"></div>
              
              <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/20 rounded-full px-3 py-1.5 backdrop-blur-md border border-white/10">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-xs font-bold tracking-widest uppercase text-indigo-100">Tracking</span>
              </div>
              
              <div className="flex justify-center mb-8 mt-10 relative z-10">
                <CircularProgress
                  value={(sittingMins / 45) * 100}
                  size={180}
                  strokeWidth={12}
                  color={sittingMins >= 45 ? "#f87171" : "#a78bfa"}
                  trackColor="rgba(255,255,255,0.1)"
                  label={
                    <div className="flex flex-col items-center">
                       <span className="text-6xl font-extrabold tracking-tighter text-white">{sittingMins}</span>
                       <span className="text-indigo-200 text-sm font-bold uppercase tracking-widest mt-1">min</span>
                    </div>
                  }
                />
              </div>

              <div className="relative z-10 min-h-[40px]">
                {sittingMins >= 45 ? (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl px-5 py-2.5 font-bold text-red-100 inline-flex items-center gap-2 shadow-lg animate-bounce">
                     <BellRing className="w-5 h-5" /> Time to stand up & stretch!
                  </div>
                ) : (
                  <p className="text-indigo-200 font-medium text-lg">Goal: Stand up every 45m</p>
                )}
              </div>
            </div>

            {/* The primary action the user is here for */}
            <button
              type="button"
              onClick={handleStandBreak}
              disabled={isLoading}
              className={`cursor-pointer w-full text-white rounded-[1.5rem] py-5 font-bold text-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 border border-white/20 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
            >
              <span className="text-3xl drop-shadow-sm flex items-center justify-center">{isLoading ? <Loader className="w-8 h-8 animate-spin" /> : <PersonStanding className="w-8 h-8" />}</span>
              {isLoading ? 'Recording...' : 'I am taking a Break!'}
            </button>

            {/* Interactive elements */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Setup Checklist
              </h3>
              <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checklist[item.key]
                  return (
                    <label 
                      key={item.key} 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleCheck(item.key);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-[1.25rem] cursor-pointer transition-all border-2 select-none ${isChecked ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] active:scale-[0.98]'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-inner transition-transform duration-300 ${isChecked ? 'bg-indigo-600 scale-110' : 'bg-gray-100'}`}>
                        {isChecked && (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-[15px] font-semibold transition-colors duration-300 ${isChecked ? 'text-indigo-900 line-through decoration-indigo-200 decoration-2' : 'text-gray-700'}`}>{item.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Secondary Action - tucked away at the bottom */}
            <div className="pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={handleEndSession} 
                disabled={isLoading} 
                className="cursor-pointer w-full bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl py-4 font-semibold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-gray-200"
              >
                <Flag className="w-5 h-5 inline-block mr-2" /> Finish Tracking for Today
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
