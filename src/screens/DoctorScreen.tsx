import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getDoctors, addDoctor, updateDoctor, removeDoctor } from '@/services/supabase'
import { Stethoscope, Pencil, Trash2, X, Link2, Check, Loader2 } from 'lucide-react'

const SPECIALTIES = [
  { value: 'nephrology', label: 'Nephrology', focus: 'Kidney function, electrolytes, fluid intake' },
  { value: 'urology', label: 'Urology', focus: 'Urinary logs, urine color, uroflow studies' },
  { value: 'neurology', label: 'Neurology', focus: 'Nerve conduction studies, symptom progression' },
  { value: 'spine', label: 'Spine', focus: 'Spine imaging, activity restrictions, pain logs' },
  { value: 'cardiology', label: 'Cardiology', focus: 'Lipids, cardiac markers, blood pressure' },
  { value: 'general', label: 'General', focus: 'Full clinical summary, all reports' },
  { value: 'other', label: 'Other', focus: 'General access' },
]

const SPECIALTY_COLORS: Record<string, string> = {
  nephrology: 'bg-blue-100 text-blue-700',
  urology: 'bg-cyan-100 text-cyan-700',
  neurology: 'bg-purple-100 text-purple-700',
  spine: 'bg-amber-100 text-amber-700',
  cardiology: 'bg-red-100 text-red-700',
  general: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
}

const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function InviteLinkPanel({ link, label, copied, onCopy, color }: {
  link: string
  label: string
  copied: boolean
  onCopy: () => void
  color: 'teal' | 'indigo'
}) {
  const bg = color === 'teal' ? 'bg-teal-50 border-teal-200' : 'bg-indigo-50 border-indigo-200'
  const text = color === 'teal' ? 'text-teal-800' : 'text-indigo-800'
  const border = color === 'teal' ? 'border-teal-200' : 'border-indigo-200'
  const btn = color === 'teal' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'
  return (
    <div className={`mt-2 ${bg} border rounded-xl p-3 space-y-2`}>
      <p className={`text-xs font-medium ${text}`}>{label}</p>
      <div className="flex items-center gap-2">
        <p className={`flex-1 text-xs text-gray-700 bg-white rounded-lg px-2.5 py-1.5 border ${border} truncate font-mono select-all`}>{link}</p>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 px-2.5 py-1.5 ${btn} text-white rounded-lg text-xs font-semibold flex-shrink-0 transition`}
        >
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Link2 className="w-3 h-3" /> Copy</>}
        </button>
      </div>
    </div>
  )
}

export default function DoctorScreen() {
  const { user } = useAuthStore()
  const patientId = user?.id ?? ''

  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', specialty: '', hospital: '', email: '', notes: '' })
  const [addSaving, setAddSaving] = useState(false)
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null)
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', specialty: '', hospital: '', email: '', notes: '' })
  const [editSaving, setEditSaving] = useState(false)

  const [viewingInviteId, setViewingInviteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return
    getDoctors(patientId)
      .then((data) => setDoctors(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [patientId])

  const handleAdd = async () => {
    if (!addForm.name.trim()) return
    setAddSaving(true)
    try {
      const newDoctor = await addDoctor({
        patient_id: patientId,
        name: addForm.name.trim(),
        specialty: addForm.specialty || null,
        hospital: addForm.hospital.trim() || null,
        email: addForm.email.trim() || null,
        notes: addForm.notes.trim() || null,
      })
      setDoctors((prev) => [...prev, newDoctor])
      const token = (newDoctor as any).invite_token
      if (token) setNewInviteLink(`${window.location.origin}/join-doctor?token=${token}`)
      setAddForm({ name: '', specialty: '', hospital: '', email: '', notes: '' })
      setShowAdd(false)
    } catch {
      // silent
    } finally {
      setAddSaving(false)
    }
  }

  const startEdit = (doc: any) => {
    setEditingId(doc.id)
    setEditForm({ name: doc.name, specialty: doc.specialty ?? '', hospital: doc.hospital ?? '', email: doc.email ?? '', notes: doc.notes ?? '' })
  }

  const handleEditSave = async () => {
    if (!editingId) return
    setEditSaving(true)
    try {
      const updated = await updateDoctor(editingId, {
        name: editForm.name.trim(),
        specialty: editForm.specialty || null,
        hospital: editForm.hospital.trim() || null,
        email: editForm.email.trim() || null,
        notes: editForm.notes.trim() || null,
      })
      setDoctors((prev) => prev.map((d) => d.id === editingId ? updated : d))
      setEditingId(null)
    } finally {
      setEditSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this doctor from your care team?')) return
    await removeDoctor(id)
    setDoctors((prev) => prev.filter((d) => d.id !== id))
  }

  const toggleInvitePanel = (doc: any) => {
    setViewingInviteId((prev) => (prev === doc.id ? null : doc.id))
  }

  const copyLink = async (link: string, docId: string) => {
    await navigator.clipboard.writeText(link)
    setCopiedId(docId)
    setTimeout(() => setCopiedId(null), 2500)
  }

  if (!user) return null

  return (
    <PageWrapper
      title="Doctor Access"
      headerRight={
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={[
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
            showAdd
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
          ].join(' ')}
        >
          {showAdd ? (
            <><X className="w-3 h-3" /> Cancel</>
          ) : (
            <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Add</>
          )}
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-4">

        {/* Add form */}
        {showAdd && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">Add Doctor</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Doctor name *</label>
                <input className={inputClass} placeholder="Dr. Sarah Khan" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Specialty</label>
                <select className={inputClass} value={addForm.specialty} onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}>
                  <option value="">Select specialty…</option>
                  {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Hospital / Clinic</label>
                <input className={inputClass} placeholder="e.g. Aga Khan Hospital" value={addForm.hospital} onChange={(e) => setAddForm({ ...addForm, hospital: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email (for invite)</label>
                <input type="email" className={inputClass} placeholder="doctor@hospital.com" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </div>
              <Button variant="primary" fullWidth onClick={handleAdd} loading={addSaving} disabled={!addForm.name.trim()}>
                Add to Care Team
              </Button>
            </div>
          </Card>
        )}

        {/* Invite link banner */}
        {newInviteLink && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-teal-800">Share portal invite</p>
            <p className="text-xs text-gray-500">Send this link to the doctor so they can access your health data.</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-700 bg-white rounded-xl px-3 py-2 border border-teal-200 truncate font-mono">{newInviteLink}</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(newInviteLink)
                  setInviteLinkCopied(true)
                  setTimeout(() => setInviteLinkCopied(false), 2500)
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold flex-shrink-0"
              >
                {inviteLinkCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <button onClick={() => setNewInviteLink(null)} className="text-xs text-gray-400 hover:text-gray-600 w-full text-right">Dismiss</button>
          </div>
        )}

        {/* Doctor list */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Care Team</h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No doctors added yet</p>
              <p className="text-xs text-gray-400 mt-1">Tap Add to invite a doctor to view your health data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doc) => (
                <div key={doc.id}>
                  {editingId === doc.id ? (
                    <div className="border border-indigo-100 rounded-2xl p-4 space-y-3 bg-indigo-50/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Edit doctor</p>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input className={inputClass} value={editForm.name} placeholder="Doctor name" onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      <select className={inputClass} value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}>
                        <option value="">Select specialty…</option>
                        {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <input className={inputClass} placeholder="Hospital / Clinic" value={editForm.hospital} onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })} />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSave}
                          disabled={editSaving || !editForm.name.trim()}
                          className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-xs font-semibold disabled:opacity-60"
                        >
                          {editSaving ? 'Saving…' : 'Save changes'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                          {doc.specialty && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${SPECIALTY_COLORS[doc.specialty] ?? 'bg-gray-100 text-gray-600'}`}>
                              {doc.specialty}
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${doc.user_id ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {doc.user_id ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        {doc.hospital && <p className="text-xs text-gray-400">{doc.hospital}</p>}
                        {!doc.user_id && <p className="text-xs text-amber-600 mt-0.5">Invite not yet accepted</p>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!doc.user_id && doc.invite_token && (
                          <button
                            onClick={() => toggleInvitePanel(doc)}
                            className={`p-1.5 rounded-lg transition ${viewingInviteId === doc.id ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:text-teal-500 hover:bg-teal-50'}`}
                            aria-label="Show invite link"
                            title="Show invite link"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(doc)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition"
                          aria-label="Edit doctor"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(doc.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          aria-label="Remove doctor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Invite link panel */}
                    {viewingInviteId === doc.id && doc.invite_token && (
                      <InviteLinkPanel
                        link={`${window.location.origin}/join-doctor?token=${doc.invite_token}`}
                        label="Send this link to the doctor"
                        copied={copiedId === doc.id}
                        onCopy={() => copyLink(`${window.location.origin}/join-doctor?token=${doc.invite_token}`, doc.id)}
                        color="teal"
                      />
                    )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Specialty access info */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Specialty Views</h3>
          <div className="space-y-2">
            {SPECIALTIES.filter((s) => s.value !== 'other').map((s) => (
              <div key={s.value} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${SPECIALTY_COLORS[s.value]}`}>
                  {s.label}
                </span>
                <p className="text-xs text-gray-500">{s.focus}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PageWrapper>
  )
}
