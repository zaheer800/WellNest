import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import { useMedicationStore } from '@/store/medicationStore'
import { usePostureStore } from '@/store/postureStore'
import { useAppointmentStore } from '@/store/appointmentStore'
import { Star, Pill, Droplet, Activity, Salad, Armchair, Stethoscope, Ban, AlertTriangle, MapPin, Users, UserRoundCog, FlaskConical, HeartPulse, Link2, Sparkles, Bell, Calendar, ChevronRight, Utensils, LineChart } from 'lucide-react'
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
  const { appointments, fetchAppointments } = useAppointmentStore()

  const date = today()
  const patientId = user?.id ?? ''

  useEffect(() => {
    if (!patientId) return
    const load = async () => {
      await Promise.all([
        fetchMedications(patientId, date),
        fetchTodayLogs(patientId, date),
        fetchAppointments(patientId),
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

  const [bellOpen, setBellOpen] = useState(false)

  // Upcoming appointments — next 7 days, not completed
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingAppts = appointments
    .filter((a) => !a.completed && new Date(a.appointment_date) >= now && new Date(a.appointment_date) <= in7Days)
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    .slice(0, 3)

  // Pending follow-up tasks from completed appointments
  const pendingTasks = appointments
    .filter((a) => a.completed && Array.isArray(a.follow_up_tasks) && (a.follow_up_tasks as string[]).length > 0)
    .flatMap((a) => (a.follow_up_tasks as string[]).map((t) => ({ task: t, apptType: a.appointment_type ?? 'Appointment' })))
    .slice(0, 5)

  const notifCount = upcomingAppts.length + pendingTasks.length

  const quickActions = [
    { label: 'Add Water', icon: <Droplet className="w-6 h-6" />, path: '/water', color: 'text-blue-600' },
    { label: 'Symptom', icon: <Stethoscope className="w-6 h-6" />, path: '/symptoms', color: 'text-orange-600' },
    { label: 'Medications', icon: <Pill className="w-6 h-6" />, path: '/medications', color: 'text-brand-teal' },
    { label: 'Posture', icon: <Armchair className="w-6 h-6" />, path: '/posture', color: 'text-green-600' },
  ]

  return (
    <PageWrapper>
      <div className="px-5 pt-8 pb-32 space-y-8 bg-gray-50/30 min-h-screen">
        
        {/* Header Section */}
        <div className="flex items-start justify-between pb-1">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{formatDate(date)}</span>
            </div>
          </div>
          <button
            onClick={() => setBellOpen((o) => !o)}
            aria-label="Notifications"
            className={[
              'relative mt-1 w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition-all active:scale-95',
              bellOpen
                ? 'bg-brand-teal border-brand-teal text-white'
                : 'bg-white border-gray-200 text-gray-500 hover:text-brand-teal hover:border-brand-teal',
            ].join(' ')}
          >
            <Bell className="w-5 h-5" />
            {!bellOpen && notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification panel */}
        {bellOpen && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-sm font-bold text-gray-800">Notifications</p>
              <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {upcomingAppts.length === 0 && pendingTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">You're all caught up 🎉</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcomingAppts.map((appt) => {
                  const dt = new Date(appt.appointment_date)
                  const isToday = dt.toDateString() === now.toDateString()
                  const dayLabel = isToday
                    ? 'Today'
                    : dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                  const timeLabel = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  return (
                    <button
                      key={appt.id}
                      onClick={() => { setBellOpen(false); navigate('/appointments') }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isToday ? 'bg-brand-teal text-white' : 'bg-brand-teal-light text-brand-teal'}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{appt.appointment_type ?? 'Appointment'}</p>
                        <p className="text-xs text-gray-400">{dayLabel} · {timeLabel}</p>
                      </div>
                      {isToday && <span className="text-[10px] font-bold text-brand-teal bg-brand-teal-light px-2 py-0.5 rounded-full flex-shrink-0">Today</span>}
                    </button>
                  )
                })}

                {pendingTasks.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-700">Follow-up · {item.apptType}</p>
                      <p className="text-sm text-gray-700 mt-0.5">{item.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(upcomingAppts.length > 0 || pendingTasks.length > 0) && (
              <button
                onClick={() => { setBellOpen(false); navigate('/appointments') }}
                className="w-full text-center text-xs text-brand-teal font-semibold py-3 border-t border-gray-50 hover:bg-gray-50 transition"
              >
                View all appointments →
              </button>
            )}
          </div>
        )}

        {/* Upcoming appointments this week */}
        {upcomingAppts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">This week</span>
              <button onClick={() => navigate('/appointments')} className="flex items-center gap-1 text-xs text-brand-teal font-semibold hover:text-brand-navy transition">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {upcomingAppts.map((appt) => {
                const dt = new Date(appt.appointment_date)
                const isToday = dt.toDateString() === now.toDateString()
                const isTomorrow = dt.toDateString() === new Date(now.getTime() + 86400000).toDateString()
                const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                const timeLabel = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                return (
                  <button
                    key={appt.id}
                    onClick={() => navigate('/appointments')}
                    className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:border-brand-teal/40 active:scale-[0.99] transition-all text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isToday ? 'bg-brand-teal text-white' : 'bg-brand-teal-light text-brand-teal'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{appt.appointment_type ?? 'Appointment'}</p>
                      <p className="text-xs text-gray-400">{dayLabel} · {timeLabel}</p>
                    </div>
                    {isToday && <span className="text-[10px] font-bold text-brand-teal bg-brand-teal-light px-2 py-0.5 rounded-full flex-shrink-0">Today</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-teal rounded-full blur-[80px] opacity-25"></div>
          
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
                      <span className="text-xs font-bold text-brand-teal/50 uppercase tracking-widest mt-1">Score</span>
                    </div>
                  }
                />
              </div>

              {/* Breakdown List */}
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Meds', icon: <Pill className="w-3 h-3" />, value: dailyScore?.medication ?? 0, max: 25, color: 'text-brand-teal/70', bg: 'bg-brand-teal' },
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
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Log</h3>
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
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Today's Progress</h3>
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
              <p className="text-2xl font-black text-brand-teal tracking-tight">{takenCount}<span className="text-brand-teal/70">/{totalMeds}</span></p>
              <p className="text-xs text-brand-teal font-semibold uppercase tracking-wider mb-3">Taken Today</p>
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand-teal" />
                <span className="text-sm font-semibold text-brand-navy">Meds</span>
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
                      <p className="text-base font-bold leading-snug">{r.restriction}</p>
                      <Badge label={r.severity} color={r.severity === 'absolute' ? 'red' : r.severity === 'strict' ? 'yellow' : 'gray'} size="sm" />
                    </div>
                    {r.reason && <p className={`text-xs mt-1.5 font-medium opacity-80`}>{r.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise & Diet */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Lifestyle</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/exercise')}
              className="flex flex-col items-start p-5 rounded-[1.5rem] bg-green-50/60 hover:bg-green-50 border border-green-100 transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-base font-bold text-gray-900">Exercise</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Activity Log</p>
            </button>
            <button
              onClick={() => navigate('/diet')}
              className="flex flex-col items-start p-5 rounded-[1.5rem] bg-lime-50/60 hover:bg-lime-50 border border-lime-100 transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5 text-lime-600" />
              </div>
              <p className="text-base font-bold text-gray-900">Diet</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Meal Tracker</p>
            </button>
          </div>
        </div>

        {/* My Progress */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Analytics</h3>
          <button
            onClick={() => navigate('/progress')}
            className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-gradient-to-r from-brand-teal-light to-indigo-50 border border-indigo-100 hover:border-brand-teal/40 transition-all active:scale-[0.99] text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <LineChart className="w-6 h-6 text-brand-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900">My Progress</p>
              <p className="text-sm text-gray-500 mt-0.5">Trends, streaks &amp; score history</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        {/* Support & Care Team */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">My Care Team</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/family')}
              className="flex flex-col items-start p-5 rounded-[1.5rem] bg-pink-50/50 hover:bg-pink-50 border border-pink-100 transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-3"><Users className="w-5 h-5 text-pink-600" /></div>
              <p className="text-base font-bold text-gray-900">Family</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Share Updates</p>
            </button>
            <button
              onClick={() => navigate('/doctor')}
              className="flex flex-col items-start p-5 rounded-[1.5rem] bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-100 transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mb-3"><UserRoundCog className="w-5 h-5 text-cyan-600" /></div>
              <p className="text-base font-bold text-gray-900">Doctors</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Grant Access</p>
            </button>
          </div>
        </div>

        {/* Medical Records (AI Insights) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Medical Records</h3>
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
              <div className="w-12 h-12 rounded-full bg-brand-teal-light flex items-center justify-center mb-1"><Link2 className="w-6 h-6 text-brand-teal" /></div>
              <p className="text-xs font-bold text-gray-800 text-center">My<br/>Conditions</p>
            </button>
          </div>
        </div>

        {/* Emergency SOS */}
        <button
          onClick={() => navigate('/sos')}
          className="w-full flex items-center justify-center gap-2.5 bg-red-500 text-white font-bold text-sm py-4 rounded-2xl shadow-[0_4px_20px_rgba(239,68,68,0.35)] hover:bg-red-600 active:scale-[0.98] transition-all"
        >
          <span className="text-lg">🆘</span>
          Emergency SOS
        </button>

      </div>

    </PageWrapper>
  )
}
