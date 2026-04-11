import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import { useMedicationStore } from '@/store/medicationStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
  getMessages,
} from '@/services/supabase'
import { today } from '@/utils/dateHelpers'
import { shouldTakeMedicationToday } from '@/utils/healthScore'
import { Users, Pencil, Trash2, X, MessageCircle, Sparkles, Loader2, Link2, Check } from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  email: string | null
  relationship: string | null
  accepted_at: string | null
  last_seen_at: string | null
  visibility_config: Record<string, boolean>
  invite_token: string | null
}

interface Message {
  id: string
  message: string
  sent_at: string
  family_members: { name: string; relationship: string | null } | null
}

const VISIBILITY_OPTIONS = [
  { key: 'health_score', label: 'Daily Health Score', description: 'Overall score and trends' },
  { key: 'medications', label: 'Medication Compliance', description: 'Whether medications are taken on time' },
  { key: 'critical_alerts', label: 'Critical Alerts', description: 'Abnormal values and urgent findings' },
  { key: 'reports', label: 'Detailed Reports', description: 'Full lab and imaging report data' },
]

const AVATAR_COLORS = ['bg-brand-teal', 'bg-pink-400', 'bg-emerald-400', 'bg-amber-400', 'bg-cyan-400', 'bg-violet-400']

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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

const defaultVisibility = { health_score: true, medications: true, critical_alerts: true, reports: false }

function InviteLinkPanel({ link, label, copied, onCopy }: {
  link: string
  label: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="mt-2 bg-brand-teal-light border border-indigo-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-medium text-brand-navy">{label}</p>
      <div className="flex items-center gap-2">
        <p className="flex-1 text-xs text-gray-700 bg-white rounded-lg px-2.5 py-1.5 border border-indigo-200 truncate font-mono select-all">{link}</p>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg text-xs font-semibold flex-shrink-0 transition"
        >
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Link2 className="w-3 h-3" /> Copy</>}
        </button>
      </div>
    </div>
  )
}

export default function FamilyScreen() {
  const { user } = useAuthStore()
  const { dailyScore } = useHealthStore()
  const { medications } = useMedicationStore()

  const [members, setMembers] = useState<FamilyMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [aiMessage, setAiMessage] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', relationship: '', visibility: { ...defaultVisibility } })
  const [addSaving, setAddSaving] = useState(false)
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null)
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false)

  const [viewingInviteId, setViewingInviteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', relationship: '', visibility: { ...defaultVisibility } })
  const [editSaving, setEditSaving] = useState(false)

  const patientId = user?.id ?? ''
  const date = today()

  useEffect(() => {
    if (!patientId) return
    loadData()
  }, [patientId])

  const loadData = async () => {
    setLoadingMembers(true)
    try {
      const [mems, msgs] = await Promise.all([
        getFamilyMembers(patientId),
        getMessages(patientId, 10),
      ])
      setMembers(mems as FamilyMember[])
      setMessages(msgs as Message[])
      // Generate AI message if no family messages exist.
      // Cache in sessionStorage so navigating back doesn't re-call the API.
      if ((msgs as Message[]).length === 0) {
        const cached = sessionStorage.getItem(`ai_msg_${patientId}`)
        if (cached) {
          setAiMessage(cached)
        } else {
          generateAiMessage()
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingMembers(false)
    }
  }

  const generateAiMessage = async () => {
    setAiLoading(true)
    try {
      const todayDate = new Date(date)
      const dueTodayMeds = medications.filter((m) => m.is_active && shouldTakeMedicationToday(m, todayDate))
      const medCompliance = dueTodayMeds.length > 0
        ? Math.round((dueTodayMeds.filter((m) => m.log?.taken).length / dueTodayMeds.length) * 100)
        : 100

      const { invokeFunction } = await import('@/services/supabase')
      const data = await invokeFunction('generate-motivational-message', {
        health_score: dailyScore?.total,
        medication_compliance: medCompliance,
        name: user?.name?.split(' ')[0],
      })
      if (data?.message) {
        setAiMessage(data.message)
        sessionStorage.setItem(`ai_msg_${patientId}`, data.message)
      }
    } catch {
      setAiMessage("You're doing great — every small step in managing your health counts. Keep going!")
    } finally {
      setAiLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!addForm.name.trim() || !patientId) return
    setAddSaving(true)
    try {
      const newMember = await addFamilyMember({
        patient_id: patientId,
        name: addForm.name.trim(),
        email: addForm.email.trim() || null,
        relationship: addForm.relationship.trim() || null,
        visibility_config: addForm.visibility,
      })
      setMembers((prev) => [...prev, newMember as FamilyMember])
      const token = (newMember as any).invite_token
      if (token) setNewInviteLink(`${window.location.origin}/join?token=${token}`)
      setAddForm({ name: '', email: '', relationship: '', visibility: { ...defaultVisibility } })
      setShowAdd(false)
    } catch {
      // TODO: show error
    } finally {
      setAddSaving(false)
    }
  }

  const startEdit = (member: FamilyMember) => {
    setEditingId(member.id)
    setEditForm({
      name: member.name,
      relationship: member.relationship ?? '',
      visibility: { ...defaultVisibility, ...member.visibility_config },
    })
  }

  const handleEditSave = async () => {
    if (!editingId) return
    setEditSaving(true)
    try {
      const updated = await updateFamilyMember(editingId, {
        name: editForm.name.trim(),
        relationship: editForm.relationship.trim() || null,
        visibility_config: editForm.visibility,
      })
      setMembers((prev) => prev.map((m) => m.id === editingId ? (updated as FamilyMember) : m))
      setEditingId(null)
    } finally {
      setEditSaving(false)
    }
  }

  const toggleInvitePanel = (member: FamilyMember) => {
    setViewingInviteId((prev) => (prev === member.id ? null : member.id))
  }

  const copyLink = async (link: string, id: string) => {
    await navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this person from your family circle?')) return
    await removeFamilyMember(id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal'

  const VisibilityToggles = ({
    visibility,
    onChange,
  }: {
    visibility: Record<string, boolean>
    onChange: (key: string, val: boolean) => void
  }) => (
    <div className="space-y-2 mt-2">
      {VISIBILITY_OPTIONS.map((opt) => (
        <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={visibility[opt.key] ?? false}
            onChange={(e) => onChange(opt.key, e.target.checked)}
            className="rounded accent-indigo-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">{opt.label}</p>
            <p className="text-xs text-gray-400">{opt.description}</p>
          </div>
        </label>
      ))}
    </div>
  )

  if (!user) return null

  return (
    <PageWrapper
      title="Family Circle"
      headerRight={
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={[
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
            showAdd
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-brand-teal text-white hover:bg-brand-teal-dark active:scale-95',
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

        {/* Add member form */}
        {showAdd && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">Add Family Member</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                <input className={inputClass} placeholder="e.g. Sarah Ahmed" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Relationship</label>
                <input className={inputClass} placeholder="e.g. Wife, Son, Mother" value={addForm.relationship} onChange={(e) => setAddForm({ ...addForm, relationship: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email (optional)</label>
                <input type="email" className={inputClass} placeholder="family@example.com" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">What can they see?</p>
                <VisibilityToggles
                  visibility={addForm.visibility}
                  onChange={(key, val) => setAddForm({ ...addForm, visibility: { ...addForm.visibility, [key]: val } })}
                />
              </div>
              <Button variant="primary" fullWidth onClick={handleAdd} loading={addSaving} disabled={!addForm.name.trim()}>
                Add to Circle
              </Button>
            </div>
          </Card>
        )}

        {/* Invite link banner */}
        {newInviteLink && (
          <div className="bg-brand-teal-light border border-indigo-200 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-brand-navy">Share this invite link</p>
            <p className="text-xs text-gray-500">Send this link to your family member so they can join your circle.</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-700 bg-white rounded-xl px-3 py-2 border border-indigo-200 truncate font-mono">{newInviteLink}</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(newInviteLink)
                  setInviteLinkCopied(true)
                  setTimeout(() => setInviteLinkCopied(false), 2500)
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-teal text-white rounded-xl text-xs font-semibold flex-shrink-0"
              >
                {inviteLinkCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <button onClick={() => setNewInviteLink(null)} className="text-xs text-gray-400 hover:text-gray-600 w-full text-right">Dismiss</button>
          </div>
        )}

        {/* Family circle members */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Your Circle</h3>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-brand-teal animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No family members added yet</p>
              <p className="text-xs text-gray-400 mt-1">Tap Add to invite someone to your circle</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member, i) => (
                <div key={member.id}>
                  {editingId === member.id ? (
                    /* Inline edit form */
                    <div className="border border-indigo-100 rounded-2xl p-4 space-y-3 bg-brand-teal-light/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Edit member</p>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Name</label>
                        <input className={inputClass} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Relationship</label>
                        <input className={inputClass} placeholder="e.g. Wife, Son" value={editForm.relationship} onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">What can they see?</p>
                        <VisibilityToggles
                          visibility={editForm.visibility}
                          onChange={(key, val) => setEditForm({ ...editForm, visibility: { ...editForm.visibility, [key]: val } })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSave}
                          disabled={editSaving || !editForm.name.trim()}
                          className="flex-1 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold disabled:opacity-60"
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
                    {/* Member card */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-bold">{getInitials(member.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${member.accepted_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {member.accepted_at ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{member.relationship ?? 'Family'}</p>
                        {member.email && <p className="text-xs text-gray-400 truncate">{member.email}</p>}
                      {!member.accepted_at && (
                        <p className="text-xs text-amber-600 mt-0.5">Invite not yet accepted</p>
                      )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!member.accepted_at && member.invite_token && (
                          <button
                            onClick={() => toggleInvitePanel(member)}
                            className={`p-1.5 rounded-lg transition ${viewingInviteId === member.id ? 'text-brand-teal bg-brand-teal-light' : 'text-gray-400 hover:text-brand-teal hover:bg-brand-teal-light'}`}
                            aria-label="Show invite link"
                            title="Show invite link"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(member)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal-light transition"
                          aria-label="Edit access"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(member.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          aria-label="Remove from circle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Invite link panel */}
                    {viewingInviteId === member.id && member.invite_token && (
                      <InviteLinkPanel
                        link={`${window.location.origin}/join?token=${member.invite_token}`}
                        label={`Send this link to ${member.name}`}
                        copied={copiedId === member.id}
                        onCopy={() => copyLink(`${window.location.origin}/join?token=${member.invite_token!}`, member.id)}
                      />
                    )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Messages from circle / AI fallback */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-brand-teal" />
            <h3 className="font-semibold text-gray-800">Messages from Your Circle</h3>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-brand-teal-light rounded-2xl px-4 py-3">
                  <p className="text-sm text-gray-700">"{msg.message}"</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {msg.family_members?.name ?? 'Family'}
                    {msg.family_members?.relationship ? ` · ${msg.family_members.relationship}` : ''}
                    {' · '}{timeAgo(msg.sent_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : aiLoading ? (
            <div className="flex items-center gap-3 py-4 px-3 bg-purple-50 rounded-2xl">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
              <p className="text-sm text-purple-600">Your AI companion is crafting a message for you…</p>
            </div>
          ) : aiMessage ? (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl px-4 py-3 border border-purple-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">From your AI companion</p>
              </div>
              <p className="text-sm text-gray-700">{aiMessage}</p>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Family members can send encouragement from their view</p>
            </div>
          )}
        </Card>

      </div>
    </PageWrapper>
  )
}
