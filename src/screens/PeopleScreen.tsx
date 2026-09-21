import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  createManagedProfile,
  createClaimInvite,
  createGuardianInvite,
  getGuardians,
  removeGuardian,
} from '@/services/supabase'
import type { ManagedProfile } from '@/types/user.types'
import { ageFrom, eighteenthBirthday } from '@/utils/age'
import { Users, Link2, Check, Trash2, Loader2 } from 'lucide-react'

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal'

const appUrl = () => import.meta.env.VITE_APP_URL ?? window.location.origin
const joinLink = (token: string) => `${appUrl()}/join?token=${token}`

/** Formats a YYYY-MM-DD date without a timezone shift (new Date('2036-02-28') is UTC midnight). */
const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Supabase errors are plain objects with a message, not Error instances. */
const errorMessage = (e: unknown, fallback: string) => {
  if (e instanceof Error && e.message) return e.message
  if (typeof e === 'object' && e && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return fallback
}

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-2">
      <p className="flex-1 text-xs text-gray-700 truncate font-mono">{link}</p>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link)
          } catch {
            prompt('Copy this link:', link)
          }
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        }}
        className="flex items-center gap-1 text-xs font-semibold text-brand-teal px-2 py-1"
      >
        {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Link2 className="w-3.5 h-3.5" /> Copy</>}
      </button>
    </div>
  )
}

function PersonCard({ person, myId, onViewed }: { person: ManagedProfile; myId: string; onViewed: () => void }) {
  const { setActivePatient, refreshManagedProfiles } = useAuthStore()
  const navigate = useNavigate()
  const [guardians, setGuardians] = useState<Awaited<ReturnType<typeof getGuardians>>>([])
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coName, setCoName] = useState('')
  const [coRel, setCoRel] = useState('')

  const age = ageFrom(person.dateOfBirth)
  const loadGuardians = useCallback(() => getGuardians(person.patientId).then(setGuardians).catch(() => {}), [person.patientId])
  useEffect(() => { if (open) loadGuardians() }, [open, loadGuardians])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try { await fn() } catch (e) { setError(errorMessage(e, 'Something went wrong')) } finally { setBusy(false) }
  }

  const view = async () => {
    await setActivePatient(person.patientId)
    onViewed()
    navigate('/dashboard')
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{person.name}{person.isSelf ? ' (you)' : ''}</p>
          <p className="text-xs text-gray-500">
            {age !== undefined ? `${age} years old` : 'Age not set'}
            {person.relationship ? ` · You: ${person.relationship}` : ''}
          </p>
          {person.guardianshipEndsOn && (
            <p className="text-xs text-amber-700 mt-1">
              You manage this profile until their 18th birthday ({formatDate(person.guardianshipEndsOn)}). After that
              they must take it over with their own login.
            </p>
          )}
        </div>
        <Button size="sm" variant="primary" onClick={view}>View</Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {!person.isSelf && (
          <Button size="sm" variant="secondary" loading={busy}
            onClick={() => run(async () => setLink(joinLink(await createClaimInvite(person.patientId))))}>
            Invite them to use WellNest
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide guardians' : 'Guardians'}
        </Button>
      </div>

      {link && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-500">Send this to {person.name.split(' ')[0]}. It works once, and they sign in with their own email.</p>
          <CopyLink link={link} />
        </div>
      )}

      {open && (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
          <p className="text-xs text-gray-500">
            Guardians can read and update this profile. Anyone here can remove anyone else, but at least one must remain.
          </p>
          {guardians.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-800">
                  {g.user_id === myId ? 'You' : g.name}
                  {g.is_self ? ' · the person themself' : g.relationship ? ` · ${g.relationship}` : ''}
                </p>
                {!g.user_id && g.invite_token && <CopyLink link={joinLink(g.invite_token)} />}
              </div>
              <button
                aria-label={`Remove ${g.name}`}
                className="p-1.5 text-gray-400 hover:text-red-500"
                onClick={() => {
                  if (!window.confirm(`Remove ${g.user_id === myId ? 'yourself' : g.name} as a guardian of ${person.name}?`)) return
                  run(async () => {
                    await removeGuardian(g.id)
                    await loadGuardians()
                    if (g.user_id === myId) await refreshManagedProfiles()
                  })
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">Add another guardian</p>
            <div className="flex gap-2">
              <input className={inputClass} placeholder="Name" value={coName} onChange={(e) => setCoName(e.target.value)} />
              <input className={inputClass} placeholder="e.g. Father" value={coRel} onChange={(e) => setCoRel(e.target.value)} />
            </div>
            <Button size="sm" variant="secondary" disabled={!coName.trim()} loading={busy}
              onClick={() => run(async () => {
                await createGuardianInvite(person.patientId, coName.trim(), coRel.trim() || null)
                setCoName(''); setCoRel('')
                await loadGuardians()
              })}>
              Create invite link
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2" role="alert">{error}</p>}
    </Card>
  )
}

export default function PeopleScreen() {
  const { user, managedProfiles, refreshManagedProfiles, setActivePatient } = useAuthStore()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(managedProfiles.length === 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', dob: '', gender: '' as '' | 'male' | 'female' | 'other', relationship: '', isMinor: false,
  })

  const computedAge = useMemo(() => ageFrom(form.dob || null), [form.dob])
  // A date of birth under 18 always means a child profile; otherwise the guardian decides.
  const isMinor = computedAge !== undefined ? computedAge < 18 : form.isMinor
  const dobMissingForMinor = isMinor && !form.dob

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const id = await createManagedProfile({
        name: form.name.trim(),
        dateOfBirth: form.dob || null,
        gender: form.gender || null,
        relationship: form.relationship.trim() || null,
        isMinor,
      })
      await refreshManagedProfiles()
      await setActivePatient(id)
      setForm({ name: '', dob: '', gender: '', relationship: '', isMinor: false })
      setShowAdd(false)
      navigate('/dashboard')
    } catch (e) {
      setError(errorMessage(e, 'Could not add this person'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper title="People I manage" showBackButton>
      <div className="px-4 pt-4 space-y-4">
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <Users className="w-4 h-4 mt-0.5 text-brand-teal flex-shrink-0" />
          Add children or parents and keep their health records here. Each person can take over their own profile with
          their own login whenever they want.
        </p>

        {managedProfiles.map((p) => (
          <PersonCard key={p.patientId} person={p} myId={user?.id ?? ''} onViewed={() => {}} />
        ))}

        {showAdd ? (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">Add a person</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block" htmlFor="p-name">Name *</label>
                <input id="p-name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block" htmlFor="p-dob">Date of birth</label>
                  <input id="p-dob" type="date" max={new Date().toISOString().slice(0, 10)} className={inputClass}
                    value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block" htmlFor="p-gender">Gender</label>
                  <select id="p-gender" className={inputClass} value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })}>
                    <option value="">Not set</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block" htmlFor="p-rel">Your relationship to them</label>
                <input id="p-rel" className={inputClass} placeholder="e.g. Mother, Son, Daughter"
                  value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
              </div>
              {computedAge === undefined && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.isMinor} onChange={(e) => setForm({ ...form, isMinor: e.target.checked })} />
                  This person is under 18
                </label>
              )}
              {isMinor && (
                <p className="text-xs text-amber-700">
                  Guardianship of a child ends on their 18th birthday{form.dob ? ` (${formatDate(eighteenthBirthday(form.dob))})` : ''}.
                  {dobMissingForMinor && ' Add their date of birth to continue.'}
                </p>
              )}
              {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
              <div className="flex gap-2">
                <Button variant="primary" fullWidth loading={saving} disabled={!form.name.trim() || dobMissingForMinor} onClick={submit}>
                  Add person
                </Button>
                {managedProfiles.length > 0 && (
                  <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Button variant="secondary" fullWidth onClick={() => setShowAdd(true)}>+ Add a person</Button>
        )}
        {saving && <Loader2 className="w-4 h-4 animate-spin mx-auto text-brand-teal" />}
      </div>
    </PageWrapper>
  )
}
