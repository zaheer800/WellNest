import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getPatientDataForFamily, getMessages } from '@/services/supabase'
import {
  Heart, Pill, AlertTriangle, FileText, Send, Loader2,
  CheckCircle2, XCircle, TrendingUp, LogOut,
} from 'lucide-react'
import RoleSwitcher from '@/components/ui/RoleSwitcher'

interface PatientData {
  id: string
  name: string
  email: string
}

interface Message {
  id: string
  message: string
  sent_at: string
  family_members: { name: string; relationship: string | null } | null
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function FamilyDashboardScreen() {
  const { familyMemberRecord, signOut } = useAuthStore()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<PatientData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  const visibility: Record<string, boolean> = (familyMemberRecord as any)?.visibility_config ?? {}
  const patientId: string = (familyMemberRecord as any)?.patient_id ?? ''

  // Snapshot data passed via familyMemberRecord's linked patient
  const linkedPatient = (familyMemberRecord as any)?.users

  useEffect(() => {
    if (!patientId) return
    loadData()
  }, [patientId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [patientData, msgs] = await Promise.all([
        getPatientDataForFamily(patientId),
        getMessages(patientId, 10),
      ])
      setPatient(patientData as PatientData)
      setMessages(msgs as Message[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !patientId) return
    setSendingMessage(true)
    try {
      const { supabase } = await import('@/services/supabase')
      await supabase.from('messages').insert({
        patient_id: patientId,
        sender_family_id: (familyMemberRecord as any)?.id,
        message: messageText.trim(),
        sent_at: new Date().toISOString(),
      })
      setMessageText('')
      setMessageSent(true)
      setTimeout(() => setMessageSent(false), 3000)
      await loadData()
    } catch {
      // silent
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!familyMemberRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center space-y-3">
          <p className="text-gray-600 font-medium">No family access found.</p>
          <button onClick={() => navigate('/login')} className="text-indigo-600 text-sm underline">Go to login</button>
        </div>
      </div>
    )
  }

  const patientName = linkedPatient?.name ?? patient?.name ?? 'your family member'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Family View</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{patientName}'s Health</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      <div className="pt-2">
        <RoleSwitcher />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

          {/* Access summary */}
          <div className="bg-indigo-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-indigo-700 font-medium">
              You have been given access to view {patientName}'s health data.
              Only sections they've permitted are shown below.
            </p>
          </div>

          {/* Health Score */}
          {visibility.health_score && (
            <SectionCard
              icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
              title="Daily Health Score"
              patientId={patientId}
            />
          )}

          {/* Medication Compliance */}
          {visibility.medications && (
            <MedicationSection patientId={patientId} />
          )}

          {/* Critical Alerts */}
          {visibility.critical_alerts && (
            <CriticalAlertsSection patientId={patientId} />
          )}

          {/* Detailed Reports */}
          {visibility.reports && (
            <ReportsSection patientId={patientId} />
          )}

          {/* No sections permitted */}
          {!visibility.health_score && !visibility.medications && !visibility.critical_alerts && !visibility.reports && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No sections shared yet</p>
              <p className="text-xs text-gray-400 mt-1">{patientName} hasn't shared any data with you yet.</p>
            </div>
          )}

          {/* Send a message */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h2 className="font-semibold text-gray-800 text-sm">Send Encouragement</h2>
            <p className="text-xs text-gray-400">Your message will appear in {patientName}'s Family Circle.</p>

            {/* Previous messages */}
            {messages.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-indigo-50 rounded-xl px-3 py-2">
                    <p className="text-sm text-gray-700">"{msg.message}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {msg.family_members?.name ?? 'You'} · {timeAgo(msg.sent_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {messageSent && (
              <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700 font-medium">Message sent!</p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Encourage ${patientName}…`}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl disabled:opacity-50 transition"
                aria-label="Send message"
              >
                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function SectionCard({ icon, title, patientId }: { icon: React.ReactNode; title: string; patientId: string }) {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    if (!patientId) return
    import('@/services/supabase').then(({ supabase }) => {
      supabase
        .from('daily_scores')
        .select('total_score')
        .eq('patient_id', patientId)
        .order('score_date', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) setScore((data as any).total_score)
        })
    })
  }, [patientId])

  const color = score === null ? 'text-gray-400' : score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  const bg = score === null ? 'bg-gray-50' : score >= 80 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          {score !== null ? (
            <p className={`text-2xl font-bold ${color}`}>{score}<span className="text-sm font-normal text-gray-400">/100</span></p>
          ) : (
            <p className="text-sm text-gray-400">No data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MedicationSection({ patientId }: { patientId: string }) {
  const [taken, setTaken] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!patientId) return
    import('@/services/supabase').then(({ supabase }) => {
      const today = new Date().toISOString().split('T')[0]
      supabase
        .from('medication_logs')
        .select('taken')
        .eq('patient_id', patientId)
        .eq('scheduled_date', today)
        .then(({ data }) => {
          if (data) {
            setTotal(data.length)
            setTaken(data.filter((d: any) => d.taken).length)
          }
        })
    })
  }, [patientId])

  const pct = total ? Math.round((taken! / total) * 100) : null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Pill className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">Medication Compliance</p>
          {pct !== null ? (
            <>
              <p className={`text-2xl font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {pct}%
              </p>
              <p className="text-xs text-gray-400">{taken} of {total} taken today</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No medications logged today</p>
          )}
        </div>
        {pct !== null && (
          pct >= 80
            ? <CheckCircle2 className="w-6 h-6 text-green-400" />
            : <XCircle className="w-6 h-6 text-red-400" />
        )}
      </div>
    </div>
  )
}

function CriticalAlertsSection({ patientId }: { patientId: string }) {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!patientId) return
    import('@/services/supabase').then(({ supabase }) => {
      supabase
        .from('notifications')
        .select('id, title, body, created_at, acknowledged_at')
        .eq('patient_id', patientId)
        .eq('priority', 'critical')
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) setAlerts(data)
        })
    })
  }, [patientId])

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <p className="text-sm font-semibold text-gray-700">Critical Alerts</p>
      </div>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700">No critical alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className={`rounded-xl px-3 py-2 ${a.acknowledged_at ? 'bg-gray-50' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm font-medium text-gray-800">{a.title}</p>
              {a.body && <p className="text-xs text-gray-500 mt-0.5">{a.body}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {timeAgo(a.created_at)}
                {a.acknowledged_at && ' · Acknowledged'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReportsSection({ patientId }: { patientId: string }) {
  const [labReports, setLabReports] = useState<any[]>([])
  const [imagingReports, setImagingReports] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedData, setExpandedData] = useState<any[]>([])
  const [expandedType, setExpandedType] = useState<'lab' | 'imaging'>('lab')
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (!patientId) return
    import('@/services/supabase').then(({ supabase }) => {
      Promise.all([
        supabase
          .from('lab_reports')
          .select('id, ai_summary, report_date, detected_type, processing_status')
          .eq('patient_id', patientId)
          .order('report_date', { ascending: false })
          .limit(5)
          .then(({ data }) => data ?? []),
        supabase
          .from('imaging_reports')
          .select('id, ai_summary, report_date, imaging_type, detected_type, surgical_urgency, processing_status')
          .eq('patient_id', patientId)
          .order('report_date', { ascending: false })
          .limit(5)
          .then(({ data }) => data ?? []),
      ]).then(([lab, imaging]) => {
        setLabReports(lab)
        setImagingReports(imaging)
      })
    })
  }, [patientId])

  const handleExpand = async (id: string, pipeline: 'lab' | 'imaging') => {
    if (expandedId === id) { setExpandedId(null); setExpandedData([]); return }
    setExpandedId(id)
    setExpandedType(pipeline)
    setExpandedData([])
    setLoadingDetails(true)
    const { supabase } = await import('@/services/supabase')
    if (pipeline === 'lab') {
      const { data } = await supabase
        .from('lab_parameters')
        .select('id, parameter_name, value, unit, status, plain_language_explanation')
        .eq('report_id', id)
        .order('parameter_name')
      setExpandedData(data ?? [])
    } else {
      const { data } = await supabase
        .from('imaging_findings')
        .select('id, location, finding_type, severity, plain_language, spinal_level')
        .eq('imaging_report_id', id)
        .order('severity', { ascending: false })
      setExpandedData(data ?? [])
    }
    setLoadingDetails(false)
  }

  const statusDot = (status: string) =>
    status === 'completed' ? 'bg-green-100 text-green-700'
    : status === 'failed' ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700'

  const paramColor = (status: string) =>
    status?.includes('critical') ? 'text-red-600 font-semibold'
    : status?.includes('abnormal') ? 'text-orange-600'
    : status?.includes('borderline') ? 'text-amber-600'
    : 'text-green-600'

  const allReports = [
    ...labReports.map((r) => ({ ...r, _pipeline: 'lab' as const })),
    ...imagingReports.map((r) => ({ ...r, _pipeline: 'imaging' as const })),
  ].sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-violet-500" />
        <p className="text-sm font-semibold text-gray-700">Recent Reports</p>
      </div>
      {allReports.length === 0 ? (
        <p className="text-sm text-gray-400">No reports uploaded yet</p>
      ) : (
        <div className="space-y-1">
          {allReports.map((r) => (
            <div key={r.id}>
              <button
                className="w-full flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 text-left"
                onClick={() => handleExpand(r.id, r._pipeline)}
              >
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {r.ai_summary
                      ? r.ai_summary.slice(0, 50) + (r.ai_summary.length > 50 ? '…' : '')
                      : r.detected_type ?? r.imaging_type ?? (r._pipeline === 'lab' ? 'Lab Report' : 'Imaging Report')}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.report_date && <span className="text-xs text-gray-400">{new Date(r.report_date).toLocaleDateString()}</span>}
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400 capitalize">{r._pipeline}</span>
                    {r.surgical_urgency && <span className="text-xs text-red-600 font-semibold">⚠️ Urgent</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusDot(r.processing_status)}`}>
                  {r.processing_status ?? 'pending'}
                </span>
              </button>

              {/* Expanded details */}
              {expandedId === r.id && (
                <div className="mb-2 ml-11 bg-gray-50 rounded-xl p-3">
                  {loadingDetails ? (
                    <p className="text-xs text-gray-400">Loading…</p>
                  ) : expandedData.length === 0 ? (
                    <p className="text-xs text-gray-400">No details available</p>
                  ) : expandedType === 'lab' ? (
                    <div className="space-y-1.5">
                      {expandedData.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 flex-1 truncate">{p.parameter_name}</span>
                          <span className={`text-xs font-medium ${paramColor(p.status)}`}>
                            {p.value} {p.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {expandedData.map((f: any) => (
                        <div key={f.id}>
                          <p className="text-xs font-medium text-gray-700">
                            {f.spinal_level ? `${f.spinal_level} · ` : ''}{f.finding_type?.replace(/_/g, ' ')}
                          </p>
                          {f.plain_language && <p className="text-xs text-gray-500 mt-0.5">{f.plain_language}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
