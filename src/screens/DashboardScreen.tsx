import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import { useMedicationStore } from '@/store/medicationStore'
import { usePostureStore } from '@/store/postureStore'
import { Star, Pill, Droplet, Activity, Salad, Armchair, Stethoscope, Ban, AlertTriangle, MapPin, Users, UserRoundCog, FlaskConical, HeartPulse, Link2, Sparkles } from 'lucide-react'
import CircularProgress from '@/components/ui/CircularProgress'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import PageWrapper from '@/components/layout/PageWrapper'
import { today, getGreeting, formatDate } from '@/utils/dateHelpers'
import { formatMl, getScoreColor } from '@/utils/formatters'
import { shouldTakeMedicationToday } from '@/utils/healthScore'

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { waterLogs, waterGoalMl, activityRestrictions, dailyScore, fetchTodayData } = useHealthStore()
  const { medications, fetchMedications } = useMedicationStore()
  const { postureLogs, activeSession, standBreakGoal, fetchTodayLogs } = usePostureStore()

  const date = today()
  const patientId = user?.id ?? ''

  useEffect(() => {
    if (!patientId) return
    const load = async () => {
      await Promise.all([
        fetchMedications(patientId, date),
        fetchTodayLogs(patientId, date),
      ])
      const meds = useMedicationStore.getState().medications
      const pLogs = usePostureStore.getState().postureLogs
      await fetchTodayData(patientId, date, meds, pLogs)
    }
    load()
  }, [patientId, date])

  const waterTotal = waterLogs.reduce((s, l) => s + l.amount_ml, 0)
  const todayDate = new Date(date)
  const dueTodayMeds = medications.filter((m) => m.is_active && shouldTakeMedicationToday(m, todayDate))
  const takenCount = dueTodayMeds.filter((m) => m.log?.taken).length
  const totalMeds = dueTodayMeds.length
  const breaksTaken = postureLogs.reduce((s, l) => s + l.stand_breaks_taken, 0) + (activeSession?.stand_breaks_taken ?? 0)
  const score = dailyScore?.total ?? 0

  const scoreRingColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'

  const quickActions = [
    { label: 'Add Water', icon: <Droplet className="w-6 h-6" />, path: '/water', color: 'text-blue-600' },
    { label: 'Symptom', icon: <Stethoscope className="w-6 h-6" />, path: '/symptoms', color: 'text-orange-600' },
    { label: 'Medications', icon: <Pill className="w-6 h-6" />, path: '/medications', color: 'text-indigo-600' },
    { label: 'Posture', icon: <Armchair className="w-6 h-6" />, path: '/posture', color: 'text-green-600' },
  ]

  return (
    <PageWrapper>
      <div className="px-5 pt-8 pb-32 space-y-8 bg-gray-50/30 min-h-screen">
        
        {/* Header Section */}
        <div className="pb-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{formatDate(date)}</span>
          </div>
        </div>

        {/* Dynamic Great Day Banner embedded inside Hero Flow */}
        {score >= 80 && (
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[1.5rem] p-5 flex items-center gap-4 text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)]">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm"><Star className="w-5 h-5 fill-white text-white" /></div>
            <div>
              <p className="font-extrabold text-white text-base">Incredible day!</p>
              <p className="text-emerald-50 text-sm font-medium opacity-90">You're crushing your daily health targets. Keep this momentum.</p>
            </div>
          </div>
        )}

        {/* HERO: Health Score Dashboard */}
        <div className="relative bg-gradient-to-br from-indigo-800 via-indigo-900 to-purple-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.15)] overflow-hidden text-white border border-indigo-700/30">
          {/* Decorative background blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500 rounded-full blur-[80px] opacity-25"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-25"></div>
          
          <div className="p-7 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Today's Health Score</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="drop-shadow-2xl">
                <CircularProgress
                  value={score}
                  size={130}
                  strokeWidth={12}
                  color={scoreRingColor}
                  trackColor="rgba(255,255,255,0.1)"
                  label={
                    <div className="flex flex-col items-center justify-center translate-y-1">
                      <span className={`text-4xl font-black tracking-tighter text-white leading-none`}>{score}</span>
                      <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Score</span>
                    </div>
                  }
                />
              </div>

              {/* Breakdown List */}
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Meds', icon: <Pill className="w-3 h-3" />, value: dailyScore?.medication ?? 0, max: 25, color: 'text-indigo-300', bg: 'bg-indigo-400' },
                  { label: 'Water', icon: <Droplet className="w-3 h-3" />, value: dailyScore?.water ?? 0, max: 20, color: 'text-blue-300', bg: 'bg-blue-400' },
                  { label: 'Move', icon: <Activity className="w-3 h-3" />, value: dailyScore?.exercise ?? 0, max: 20, color: 'text-emerald-300', bg: 'bg-emerald-400' },
                  { label: 'Diet', icon: <Salad className="w-3 h-3" />, value: dailyScore?.diet ?? 0, max: 20, color: 'text-orange-300', bg: 'bg-orange-400' },
                  { label: 'Posture', icon: <Armchair className="w-3 h-3" />, value: dailyScore?.posture ?? 0, max: 15, color: 'text-teal-300', bg: 'bg-teal-400' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs drop-shadow-sm flex items-center justify-center">{item.icon}</span>
                        <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold ${item.color}`}>{item.value}<span className="text-white/40">/{item.max}</span></span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ease-out ${item.bg}`} style={{ width: `${(item.value / item.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar - Floating circular buttons */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Log</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.06)] border border-gray-100 transition-all duration-300 group-hover:scale-105 active:scale-95 text-gray-700 bg-white`}>
                  <div className={a.color}>{a.icon}</div>
                </div>
                <span className="text-xs font-medium text-gray-600">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Today's Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Water Stat */}
            <div onClick={() => navigate('/water')} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-[1.5rem] shadow-sm border border-blue-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/60 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <p className="text-2xl font-black text-blue-600 tracking-tight">{formatMl(waterTotal)}</p>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">/ {formatMl(waterGoalMl)} Goal</p>
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-800">Water</span>
              </div>
            </div>
            
            {/* Meds Stat */}
            <div onClick={() => navigate('/medications')} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-[1.5rem] shadow-sm border border-indigo-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform">
               <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/60 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <p className="text-2xl font-black text-indigo-600 tracking-tight">{takenCount}<span className="text-indigo-300">/{totalMeds}</span></p>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-3">Taken Today</p>
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-800">Meds</span>
              </div>
            </div>

            {/* Posture Stat */}
            <div onClick={() => navigate('/posture')} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-[1.5rem] shadow-sm border border-emerald-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform">
               <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/60 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">{breaksTaken}<span className="text-emerald-300">/{standBreakGoal}</span></p>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-3">Stand Breaks</p>
              <div className="flex items-center gap-2">
                <Armchair className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-800">Posture</span>
              </div>
            </div>

            {/* Symptom Log */}
            <div onClick={() => navigate('/symptoms')} className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-[1.5rem] shadow-sm border border-orange-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform">
               <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/60 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <p className="text-2xl font-black text-orange-500 tracking-tight">Log</p>
              <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-3">How you feel</p>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold text-orange-800">Symptoms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Restrictions (High Priority) */}
        {activityRestrictions.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 px-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Important Restrictions</h3>
            <div className="space-y-3">
              {activityRestrictions.map((r) => (
                <div key={r.id} className={`flex items-start gap-3 rounded-[1.25rem] p-4 shadow-sm border ${r.severity === 'absolute' ? 'bg-red-50 border-red-100 text-red-900' : r.severity === 'strict' ? 'bg-orange-50 border-orange-100 text-orange-900' : 'bg-yellow-50 border-yellow-100 text-yellow-900'}`}>
                  <div className="mt-0.5">
                    {r.severity === 'absolute' ? <Ban className="w-5 h-5 text-red-600" /> : r.severity === 'strict' ? <AlertTriangle className="w-5 h-5 text-orange-600" /> : <MapPin className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[15px] font-bold leading-snug">{r.restriction}</p>
                      <Badge label={r.severity} color={r.severity === 'absolute' ? 'red' : r.severity === 'strict' ? 'yellow' : 'gray'} size="sm" />
                    </div>
                    {r.reason && <p className={`text-xs mt-1.5 font-medium opacity-80`}>{r.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support & Care Team */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">My Care Team</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/family')}
              className="flex flex-col items-start p-5 rounded-[1.5rem] bg-pink-50/50 hover:bg-pink-50 border border-pink-100 transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-3"><Users className="w-5 h-5 text-pink-600" /></div>
              <p className="text-[15px] font-bold text-gray-900">Family</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Share Updates</p>
            </button>
            <button
              onClick={() => navigate('/doctor')}
              className="flex flex-col items-start p-5 rounded-[1.5rem] bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-100 transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mb-3"><UserRoundCog className="w-5 h-5 text-cyan-600" /></div>
              <p className="text-[15px] font-bold text-gray-900">Doctors</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Grant Access</p>
            </button>
          </div>
        </div>

        {/* Medical Records (AI Insights) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Medical Records</h3>
            <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 flex items-center justify-center gap-1 py-0.5 rounded-full border border-purple-100"><Sparkles className="w-3 h-3 text-purple-500 fill-purple-400" /> AI Active</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/reports')}
              className="flex flex-col items-center gap-2 py-5 px-2 rounded-[1.5rem] bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-violet-200 transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-1"><FlaskConical className="w-6 h-6 text-violet-600" /></div>
              <p className="text-xs font-bold text-gray-800 text-center">Lab<br/>Reports</p>
            </button>
            <button
              onClick={() => navigate('/imaging')}
              className="flex flex-col items-center gap-2 py-5 px-2 rounded-[1.5rem] bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-fuchsia-200 transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-fuchsia-50 flex items-center justify-center mb-1"><HeartPulse className="w-6 h-6 text-fuchsia-600" /></div>
              <p className="text-xs font-bold text-gray-800 text-center">Imaging<br/>Scans</p>
            </button>
            <button
              onClick={() => navigate('/conditions')}
              className="flex flex-col items-center gap-2 py-5 px-2 rounded-[1.5rem] bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-indigo-200 transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-1"><Link2 className="w-6 h-6 text-indigo-600" /></div>
              <p className="text-xs font-bold text-gray-800 text-center">My<br/>Conditions</p>
            </button>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
