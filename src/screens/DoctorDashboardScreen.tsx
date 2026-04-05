import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getDoctorNotes, addDoctorNote } from '@/services/supabase'
import {
  Stethoscope, LogOut, Loader2, FileText, Activity, Pill,
  AlertTriangle, CheckCircle2, FlaskConical, Scan, ClipboardList,
  ChevronDown, ChevronUp, Send,
} from 'lucide-react'
import RoleSwitcher from '@/components/ui/RoleSwitcher'

const SPECIALTY_CATEGORIES: Record<string, string[]> = {
  nephrology: ['kidney', 'electrolytes', 'urine'],
  urology: ['urine', 'kidney'],
  neurology: ['blood', 'vitamins', 'other'],
  spine: ['blood', 'vitamins', 'other'],
  cardiology: ['cardiac', 'lipids', 'blood'],
  general: ['kidney', 'liver', 'blood', 'lipids', 'diabetes', 'thyroid', 'vitamins', 'cardiac', 'electrolytes', 'urine', 'hormones', 'other'],
}

const STATUS_COLORS: Record<string, string> = {
  normal: 'text-green-700 bg-green-50',
  borderline_low: 'text-amber-700 bg-amber-50',
  borderline_high: 'text-amber-700 bg-amber-50',
  abnormal_low: 'text-orange-700 bg-orange-50',
  abnormal_high: 'text-orange-700 bg-orange-50',
  critical_low: 'text-red-700 bg-red-50 animate-pulse',
  critical_high: 'text-red-700 bg-red-50 animate-pulse',
}

const STATUS_LABELS: Record<string, string> = {
  normal: 'Normal',
  borderline_low: 'Watch ↓',
  borderline_high: 'Watch ↑',
  abnormal_low: 'Low ↓↓',
  abnormal_high: 'High ↑↑',
  critical_low: '⚠ Critical Low',
  critical_high: '⚠ Critical High',
}

export default function DoctorDashboardScreen() {
  const { doctorRecord, signOut } = useAuthStore()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<any>(null)
  const [labParameters, setLabParameters] = useState<any[]>([])
  const [labReports, setLabReports] = useState<any[]>([])
  const [imagingReports, setImagingReports] = useState<any[]>([])
  const [symptomLogs, setSymptomLogs] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState('observation')
  const [visibleToPatient, setVisibleToPatient] = useState(true)
  const [savingNote, setSavingNote] = useState(false)

  const [expandedSection, setExpandedSection] = useState<string | null>('labs')

  const patientId: string = doctorRecord?.patient_id ?? (doctorRecord as any)?.users?.id ?? ''
  const specialty: string = doctorRecord?.specialty ?? 'general'
  const patientName: string = (doctorRecord as any)?.users?.name ?? 'Patient'
  const doctorName: string = doctorRecord?.name ?? 'Doctor'
  const doctorId: string = doctorRecord?.id ?? ''

  // Categories relevant to this specialty
  const relevantCategories = SPECIALTY_CATEGORIES[specialty] ?? SPECIALTY_CATEGORIES.general

  useEffect(() => {
    if (!patientId || !doctorId) return
    loadData()
  }, [patientId, doctorId])

  const loadData = async () => {
    setLoading(true)
    try {
      const { supabase } = await import('@/services/supabase')

      const [patientRes, paramsRes, labRes, imagingRes, symptomsRes, notesRes] = await Promise.all([
        supabase.from('users').select('id, name, email').eq('id', patientId).single(),
        supabase
          .from('lab_parameters')
          .select('id, parameter_name, value, unit, status, reference_min, reference_max, parameter_category, plain_language_explanation, created_at')
          .eq('patient_id', patientId)
          .in('parameter_category', relevantCategories)
          .order('created_at', { ascending: false })
          .limit(80),
        supabase
          .from('lab_reports')
          .select('id, ai_summary, report_date, detected_type, processing_status')
          .eq('patient_id', patientId)
          .order('report_date', { ascending: false })
          .limit(10),
        supabase
          .from('imaging_reports')
          .select('id, ai_summary, report_date, imaging_type, detected_type, surgical_urgency, processing_status')
          .eq('patient_id', patientId)
          .order('report_date', { ascending: false })
          .limit(10),
        supabase
          .from('symptom_logs')
          .select('id, symptom_name, severity, notes, logged_at')
          .eq('patient_id', patientId)
          .order('logged_at', { ascending: false })
          .limit(20),
        getDoctorNotes(patientId, doctorId),
      ])

      if (patientRes.data) setPatient(patientRes.data)
      if (paramsRes.data) setLabParameters(paramsRes.data)
      if (labRes.data) setLabReports(labRes.data)
      if (imagingRes.data) setImagingReports(imagingRes.data)
      if (symptomsRes.data) setSymptomLogs(symptomsRes.data)
      setNotes(notesRes)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !patientId || !doctorId) return
    setSavingNote(true)
    try {
      const saved = await addDoctorNote({
        patient_id: patientId,
        doctor_id: doctorId,
        note: newNote.trim(),
        note_type: noteType,
        is_visible_to_patient: visibleToPatient,
      })
      setNotes((prev) => [saved, ...prev])
      setNewNote('')
    } catch {
      // silent
    } finally {
      setSavingNote(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const toggleSection = (s: string) => setExpandedSection((prev) => (prev === s ? null : s))

  const specialtyLabel = specialty.charAt(0).toUpperCase() + specialty.slice(1)

  // Group lab parameters by category
  const paramsByCategory = labParameters.reduce<Record<string, any[]>>((acc, p) => {
    const cat = p.parameter_category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const criticalParams = labParameters.filter((p) =>
    p.status === 'critical_low' || p.status === 'critical_high'
  )

  if (!doctorRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500 text-sm">No doctor access found. <button onClick={() => navigate('/login')} className="text-teal-600 underline">Sign in</button></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-start justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Doctor Portal · {specialtyLabel}</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{patientName}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dr. {doctorName}</p>
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
          <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">

          {/* Critical alerts banner */}
          {criticalParams.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4" role="alert" aria-live="assertive">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-800 text-sm">
                  {criticalParams.length} Critical Value{criticalParams.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-1">
                {criticalParams.map((p) => (
                  <p key={p.id} className="text-sm text-red-700">
                    <span className="font-medium">{p.parameter_name}</span>: {p.value} {p.unit} — {STATUS_LABELS[p.status]}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Lab Parameters */}
          <Section
            id="labs"
            icon={<FlaskConical className="w-4 h-4 text-teal-500" />}
            title="Lab Parameters"
            count={labParameters.length}
            expanded={expandedSection === 'labs'}
            onToggle={() => toggleSection('labs')}
          >
            {Object.keys(paramsByCategory).length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No lab parameters in relevant categories</p>
            ) : (
              Object.entries(paramsByCategory).map(([cat, params]) => (
                <div key={cat} className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                    {cat.replace(/_/g, ' ')}
                  </p>
                  <div className="space-y-2">
                    {params.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{p.parameter_name}</p>
                          <p className="text-xs text-gray-400">{p.plain_language_explanation}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-800">{p.value} <span className="text-xs font-normal text-gray-400">{p.unit}</span></p>
                          {p.reference_min != null && p.reference_max != null && (
                            <p className="text-xs text-gray-400">Ref: {p.reference_min}–{p.reference_max}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[p.status] ?? 'text-gray-500 bg-gray-100'}`}>
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </Section>

          {/* Lab Reports */}
          <Section
            id="reports"
            icon={<FileText className="w-4 h-4 text-violet-500" />}
            title="Lab Reports"
            count={labReports.length}
            expanded={expandedSection === 'reports'}
            onToggle={() => toggleSection('reports')}
          >
            {labReports.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No lab reports uploaded</p>
            ) : (
              labReports.map((r) => (
                <div key={r.id} className="py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">
                      {r.ai_summary
                        ? r.ai_summary.slice(0, 60) + (r.ai_summary.length > 60 ? '…' : '')
                        : r.detected_type ?? 'Lab Report'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.processing_status === 'completed' ? 'bg-green-100 text-green-700'
                      : r.processing_status === 'failed' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>{r.processing_status ?? 'pending'}</span>
                  </div>
                  {r.report_date && <p className="text-xs text-gray-400">{new Date(r.report_date).toLocaleDateString()}</p>}
                </div>
              ))
            )}
          </Section>

          {/* Imaging Reports */}
          <Section
            id="imaging"
            icon={<Scan className="w-4 h-4 text-blue-500" />}
            title="Imaging Reports"
            count={imagingReports.length}
            expanded={expandedSection === 'imaging'}
            onToggle={() => toggleSection('imaging')}
          >
            {imagingReports.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No imaging reports uploaded</p>
            ) : (
              imagingReports.map((r) => (
                <ImagingReportRow key={r.id} report={r} patientId={patientId ?? ''} />
              ))
            )}
          </Section>

          {/* Symptoms */}
          <Section
            id="symptoms"
            icon={<Activity className="w-4 h-4 text-rose-500" />}
            title="Symptom Log"
            count={symptomLogs.length}
            expanded={expandedSection === 'symptoms'}
            onToggle={() => toggleSection('symptoms')}
          >
            {symptomLogs.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No symptoms logged</p>
            ) : (
              symptomLogs.map((s) => (
                <div key={s.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 capitalize">{s.symptom_name?.replace(/_/g, ' ')}</p>
                    {s.notes && <p className="text-xs text-gray-400 mt-0.5">{s.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-700">{s.severity}<span className="text-xs text-gray-400">/10</span></p>
                    <p className="text-xs text-gray-400">{new Date(s.logged_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </Section>

          {/* Doctor Notes */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-semibold text-gray-800 flex-1">Clinical Notes</p>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{notes.length}</span>
            </div>

            {/* New note input */}
            <div className="p-4 border-b border-gray-50 space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a clinical note…"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex items-center gap-2">
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="observation">Observation</option>
                  <option value="recommendation">Recommendation</option>
                  <option value="prescription">Prescription</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="referral">Referral</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleToPatient}
                    onChange={(e) => setVisibleToPatient(e.target.checked)}
                    className="rounded accent-teal-500"
                  />
                  Visible to patient
                </label>
                <button
                  onClick={handleAddNote}
                  disabled={savingNote || !newNote.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition flex-shrink-0"
                >
                  {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Add
                </button>
              </div>
            </div>

            {/* Existing notes */}
            <div className="divide-y divide-gray-50">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
              ) : (
                notes.map((n: any) => (
                  <div key={n.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium capitalize">
                        {n.note_type?.replace(/_/g, ' ')}
                      </span>
                      {!n.is_visible_to_patient && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Private</span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── Imaging report row with expandable findings ─────────────────────────────

function ImagingReportRow({ report, patientId }: { report: any; patientId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [findings, setFindings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleExpand = async () => {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (findings.length > 0) return
    setLoading(true)
    try {
      const { supabase } = await import('@/services/supabase')
      const { data } = await supabase
        .from('imaging_findings')
        .select('id, location, spinal_level, finding_type, severity, laterality, plain_language, nerves_affected, linked_symptoms')
        .eq('imaging_report_id', report.id)
        .order('severity', { ascending: false })
      setFindings(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const severityColor = (s: string) =>
    s === 'severe' ? 'text-red-600' : s === 'moderate' ? 'text-orange-500' : 'text-amber-500'

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button className="w-full py-3 text-left" onClick={handleExpand}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {report.ai_summary
                ? report.ai_summary.slice(0, 70) + (report.ai_summary.length > 70 ? '…' : '')
                : report.imaging_type ?? report.detected_type ?? 'Imaging Report'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {report.report_date && <span className="text-xs text-gray-400">{new Date(report.report_date).toLocaleDateString()}</span>}
              {report.surgical_urgency && <span className="text-xs text-red-600 font-semibold">⚠️ Urgent</span>}
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-0.5">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="mb-3 bg-gray-50 rounded-xl p-3 space-y-3">
          {loading ? (
            <p className="text-xs text-gray-400">Loading findings…</p>
          ) : findings.length === 0 ? (
            <p className="text-xs text-gray-400">No abnormal findings recorded</p>
          ) : (
            findings.map((f) => (
              <div key={f.id}>
                <div className="flex items-center gap-2">
                  {f.spinal_level && <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{f.spinal_level}</span>}
                  <span className={`text-xs font-semibold ${severityColor(f.severity)}`}>{f.severity}</span>
                  <span className="text-xs text-gray-600">{f.finding_type?.replace(/_/g, ' ')}</span>
                  {f.laterality && f.laterality !== 'not_applicable' && <span className="text-xs text-gray-400">{f.laterality}</span>}
                </div>
                {f.plain_language && <p className="text-xs text-gray-500 mt-1">{f.plain_language}</p>}
                {f.nerves_affected?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">Nerves: {f.nerves_affected.join(', ')}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  id, icon, title, count, expanded, onToggle, children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition"
        aria-expanded={expanded}
      >
        {icon}
        <p className="text-sm font-semibold text-gray-800 flex-1 text-left">{title}</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}
