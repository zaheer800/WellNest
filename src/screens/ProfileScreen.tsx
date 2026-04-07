import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { LogOut, User, Ruler, Weight, QrCode, Copy, Check, Plus, Trash2, Phone, ExternalLink } from 'lucide-react'
import type { EmergencyContact } from '@/types/user.types'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const RELATIONSHIPS = ['Parent', 'Spouse', 'Child', 'Sibling', 'Friend', 'Other']

interface ProfileForm {
  name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | ''
  height_cm: string
  weight_kg: string
  blood_type: string
}

function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}′ ${inches}″`
}

function calcBmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100
  return Math.round((weightKg / (h * h)) * 10) / 10
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' }
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' }
  return { label: 'Obese', color: 'text-red-600' }
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user, updateProfile, signOut, loading } = useAuthStore()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [copied, setCopied] = useState(false)

  // Allergies state
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState('')

  // Emergency contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  const { register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm<ProfileForm>({
    defaultValues: {
      name: '',
      date_of_birth: '',
      gender: '',
      height_cm: '',
      weight_kg: '',
      blood_type: '',
    },
  })

  // Populate form once user is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        date_of_birth: user.date_of_birth ?? '',
        gender: user.gender ?? '',
        height_cm: user.height_cm ? String(user.height_cm) : '',
        weight_kg: user.weight_kg ? String(user.weight_kg) : '',
        blood_type: user.blood_type ?? '',
      })
      setAllergies(user.allergies ?? [])
      setContacts(user.emergency_contacts ?? [])
    }
  }, [user, reset])

  const heightVal = Number(watch('height_cm'))
  const weightVal = Number(watch('weight_kg'))
  const genderVal = watch('gender')

  const bmi = heightVal > 0 && weightVal > 0 ? calcBmi(heightVal, weightVal) : null
  const bmiInfo = bmi ? bmiCategory(bmi) : null
  const heightDisplay = heightVal > 50 ? cmToFeetInches(heightVal) : null

  const addAllergy = () => {
    const val = allergyInput.trim()
    if (!val || allergies.includes(val)) { setAllergyInput(''); return }
    setAllergies([...allergies, val])
    setAllergyInput('')
  }

  const removeAllergy = (a: string) => setAllergies(allergies.filter((x) => x !== a))

  const addContact = () => {
    if (contacts.length >= 3) return
    setContacts([...contacts, { name: '', phone: '', relationship: 'Parent' }])
  }
  const removeContact = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i))
  const updateContact = (i: number, field: keyof EmergencyContact, val: string) =>
    setContacts(contacts.map((c, idx) => idx === i ? { ...c, [field]: val } : c))

  const medicalIdUrl = user?.medical_id_token
    ? `${window.location.origin}/medical-id/${user.medical_id_token}`
    : null

  const qrUrl = medicalIdUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(medicalIdUrl)}`
    : null

  const copyLink = async () => {
    if (!medicalIdUrl) return
    await navigator.clipboard.writeText(medicalIdUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onSubmit = async (data: ProfileForm) => {
    setSubmitError(null)
    setSuccessMsg(null)
    const validContacts = contacts.filter((c) => c.name.trim() && c.phone.trim())
    try {
      await updateProfile({
        name: data.name,
        date_of_birth: data.date_of_birth || undefined,
        gender: (data.gender as ProfileForm['gender']) || undefined,
        height_cm: data.height_cm ? Number(data.height_cm) : undefined,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
        blood_type: data.blood_type || undefined,
        allergies,
        emergency_contacts: validContacts,
      })
      setSuccessMsg('Profile updated')
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not save changes. Please try again.')
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      setSigningOut(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  // Avatar initials
  const initials = (user?.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <PageWrapper title="My Profile">
      <div className="px-4 pt-4 pb-10 space-y-5">

        {/* Avatar + email */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              {initials ? (
                <span className="text-xl font-bold text-white">{initials}</span>
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-base truncate">{user?.name || 'Your name'}</p>
              <p className="text-sm text-gray-400 truncate mt-0.5">{user?.email}</p>
              <p className="text-xs text-gray-300 mt-0.5">Email is managed by your sign-in provider</p>
            </div>
          </div>
        </Card>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl px-4 py-3">
            ✓ {successMsg}
          </div>
        )}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {submitError}
          </div>
        )}

        {/* Identity section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal Info</p>
            <div className="space-y-4">

              <div>
                <label className={labelClass}>Full name</label>
                <input
                  className={inputClass}
                  placeholder="Your name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Date of birth</label>
                <input
                  type="date"
                  className={inputClass}
                  {...register('date_of_birth')}
                />
              </div>

              <div>
                <label className={labelClass}>Gender</label>
                <div className="flex gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <label key={g} className="flex-1 cursor-pointer">
                      <input type="radio" value={g} className="sr-only" {...register('gender')} />
                      <div className={[
                        'text-center py-3 rounded-xl border text-sm font-medium capitalize transition',
                        genderVal === g
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600',
                      ].join(' ')}>
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Body measurements */}
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Body Measurements</p>
            <div className="space-y-4">

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                  {heightDisplay && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> {heightDisplay}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="170"
                  {...register('height_cm', {
                    min: { value: 50, message: 'Must be at least 50 cm' },
                    max: { value: 300, message: 'Must be less than 300 cm' },
                  })}
                />
                {errors.height_cm && <p className="text-red-500 text-xs mt-1">{errors.height_cm.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                  {bmi && bmiInfo && (
                    <span className={`text-xs font-semibold flex items-center gap-1 ${bmiInfo.color}`}>
                      <Weight className="w-3 h-3" /> BMI {bmi} · {bmiInfo.label}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  placeholder="70"
                  {...register('weight_kg', {
                    min: { value: 10, message: 'Must be at least 10 kg' },
                    max: { value: 500, message: 'Must be less than 500 kg' },
                  })}
                />
                {errors.weight_kg && <p className="text-red-500 text-xs mt-1">{errors.weight_kg.message}</p>}
              </div>
            </div>
          </Card>

          {/* Blood type */}
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Medical Info</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Blood type</label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <label key={bt} className="cursor-pointer">
                      <input type="radio" value={bt} className="sr-only" {...register('blood_type')} />
                      <div className={[
                        'px-3 py-2 rounded-xl border text-sm font-bold transition',
                        watch('blood_type') === bt
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600',
                      ].join(' ')}>
                        {bt}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Allergies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy() } }}
                    placeholder="e.g. Penicillin, Peanuts"
                    className={inputClass + ' flex-1'}
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-indigo-600 active:scale-95 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((a) => (
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold rounded-full">
                        {a}
                        <button type="button" onClick={() => removeAllergy(a)} className="text-amber-400 hover:text-amber-700 transition">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Emergency contacts */}
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Emergency Contacts</p>
            <p className="text-xs text-gray-400 mb-4">Shown on your Medical ID when scanned.</p>
            <div className="space-y-4">
              {contacts.map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Contact {i + 1}</span>
                    </div>
                    <button type="button" onClick={() => removeContact(i)} className="text-gray-300 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={c.name}
                    onChange={(e) => updateContact(i, 'name', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={c.phone}
                    onChange={(e) => updateContact(i, 'phone', e.target.value)}
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateContact(i, 'relationship', r)}
                        className={[
                          'px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                          c.relationship === r
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-gray-200 text-gray-600',
                        ].join(' ')}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {contacts.length < 3 && (
                <button
                  type="button"
                  onClick={addContact}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-500 font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 transition"
                >
                  <Plus className="w-4 h-4" /> Add contact
                </button>
              )}
            </div>
          </Card>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Save Changes
          </Button>
        </form>

        {/* Medical ID QR */}
        {medicalIdUrl && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <p className="text-sm font-bold text-gray-800">Medical ID</p>
              <span className="ml-auto text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">Public</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Anyone who scans this QR code can view your emergency medical info — no login needed. Share it on your phone lock screen or print it on a card.
            </p>
            <div className="flex flex-col items-center gap-4">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="Medical ID QR code"
                  className="w-44 h-44 rounded-2xl border border-gray-100 shadow-sm"
                />
              )}
              <div className="flex gap-2 w-full">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <a
                  href={medicalIdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" /> Preview
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* Sign out */}
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 py-3 px-1 text-red-500 hover:text-red-600 transition disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </Card>

      </div>
    </PageWrapper>
  )
}
