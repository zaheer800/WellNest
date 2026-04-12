import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { LogOut, User, Ruler, Weight, QrCode, Copy, Check, Plus, Trash2, Phone, ExternalLink, ChevronDown } from 'lucide-react'
import type { EmergencyContact } from '@/types/user.types'

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
]

type ContactErrors = { name?: string; phone?: string }[]

const PHONE_RE = /^\+?[\d\s\-(). ]{7,20}$/

function validateContacts(contacts: EmergencyContact[]): ContactErrors {
  return contacts.map((c) => {
    const errs: { name?: string; phone?: string } = {}
    if (!c.name.trim()) errs.name = 'Name is required'
    if (!c.phone.trim()) {
      errs.phone = 'Phone number is required'
    } else if (!PHONE_RE.test(c.phone.trim())) {
      errs.phone = 'Enter a valid phone number'
    }
    return errs
  })
}

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
  const { user, updateProfile, generateMedicalId, signOut, loading } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [copied, setCopied] = useState(false)

  // Allergies state
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState('')

  // Phone state
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneLocal, setPhoneLocal] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  // Emergency contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [contactErrors, setContactErrors] = useState<ContactErrors>([])

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
      // Parse existing phone into country code + local
      if (user.phone) {
        const match = COUNTRY_CODES.find((c) => user.phone!.startsWith(c.code))
        if (match) {
          setCountryCode(match.code)
          setPhoneLocal(user.phone.slice(match.code.length))
        } else {
          setPhoneLocal(user.phone)
        }
      }
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
    const next = [...contacts, { name: '', phone: '', relationship: 'Parent' }]
    setContacts(next)
    setContactErrors(validateContacts(next))
  }
  const removeContact = (i: number) => {
    const next = contacts.filter((_, idx) => idx !== i)
    setContacts(next)
    setContactErrors(validateContacts(next))
  }
  const updateContact = (i: number, field: keyof EmergencyContact, val: string) => {
    const next = contacts.map((c, idx) => idx === i ? { ...c, [field]: val } : c)
    setContacts(next)
    // Only clear the error for this field once user starts typing
    setContactErrors((prev) => {
      const updated = [...prev]
      if (!updated[i]) updated[i] = {}
      if (field === 'name' && val.trim()) delete updated[i].name
      if (field === 'phone' && val.trim()) delete updated[i].phone
      return updated
    })
  }

  const medicalIdUrl = user?.medical_id_token
    ? `${window.location.origin}/medical-id/${user.medical_id_token}`
    : null

  const qrUrl = medicalIdUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(medicalIdUrl)}`
    : null

  const copyLink = async () => {
    if (!medicalIdUrl) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(medicalIdUrl)
      } else {
        // Fallback for non-secure contexts or browsers without clipboard API
        const ta = document.createElement('textarea')
        ta.value = medicalIdUrl
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Last resort: show the URL so the user can copy it manually
      prompt('Copy this link:', medicalIdUrl)
    }
  }

  const openPreview = () => {
    if (!medicalIdUrl) return
    window.open(medicalIdUrl, '_blank', 'noopener,noreferrer')
  }

  const onSubmit = async (data: ProfileForm) => {
    setSubmitError(null)
    setSuccessMsg(null)
    setPhoneError(null)

    // Validate phone (mandatory)
    const localDigits = phoneLocal.replace(/\D/g, '')
    if (!localDigits) {
      setPhoneError('Phone number is required')
      return
    }
    if (localDigits.length < 6) {
      setPhoneError('Enter a valid phone number')
      return
    }

    // Validate contacts — block save if any are partially filled or have invalid phone
    const errs = validateContacts(contacts)
    const hasErrors = errs.some((e) => e.name || e.phone)
    if (hasErrors) {
      setContactErrors(errs)
      setSubmitError('Please fix the errors in Emergency Contacts before saving.')
      return
    }

    const validContacts = contacts.filter((c) => c.name.trim() && c.phone.trim())
    const fullPhone = `${countryCode}${localDigits}`
    setSaving(true)
    try {
      await updateProfile({
        name: data.name,
        phone: fullPhone,
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
    } catch (e: any) {
      // AbortError fires when our 10s fetch timeout triggers
      const isTimeout = e?.name === 'AbortError' || e?.message?.toLowerCase().includes('abort')
      setSubmitError(isTimeout
        ? 'Request timed out. Check your connection and try again.'
        : (e?.message ?? 'Could not save changes. Please try again.'))
    } finally {
      setSaving(false)
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

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal'
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
                <label className={labelClass}>Phone number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(!showCountryPicker)}
                      className="h-full flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal whitespace-nowrap"
                    >
                      <span>{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}</span>
                      <span className="font-medium text-gray-700">{countryCode}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {showCountryPicker && (
                      <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-52 min-w-[200px]">
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => { setCountryCode(c.code); setShowCountryPicker(false) }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition ${countryCode === c.code ? 'bg-brand-teal-light font-semibold text-brand-navy' : 'text-gray-700'}`}
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span className="ml-auto text-gray-400 text-xs">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phoneLocal}
                    onChange={(e) => { setPhoneLocal(e.target.value); setPhoneError(null) }}
                    className={[inputClass, 'flex-1', phoneError ? 'border-red-400 focus:ring-red-400' : ''].join(' ')}
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
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
                          ? 'border-brand-teal bg-brand-teal-light text-brand-navy'
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
                    className="w-11 h-11 rounded-xl bg-brand-teal text-white flex items-center justify-center flex-shrink-0 hover:bg-brand-teal active:scale-95 transition"
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
                  <div>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={c.name}
                      onChange={(e) => updateContact(i, 'name', e.target.value)}
                      className={[inputClass, contactErrors[i]?.name ? 'border-red-400 focus:ring-red-400' : ''].join(' ')}
                    />
                    {contactErrors[i]?.name && (
                      <p className="text-red-500 text-xs mt-1">{contactErrors[i].name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={c.phone}
                      onChange={(e) => updateContact(i, 'phone', e.target.value)}
                      className={[inputClass, contactErrors[i]?.phone ? 'border-red-400 focus:ring-red-400' : ''].join(' ')}
                    />
                    {contactErrors[i]?.phone && (
                      <p className="text-red-500 text-xs mt-1">{contactErrors[i].phone}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateContact(i, 'relationship', r)}
                        className={[
                          'px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                          c.relationship === r
                            ? 'bg-brand-teal border-brand-teal text-white'
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 text-brand-teal font-semibold text-sm hover:border-brand-teal hover:bg-brand-teal-light transition"
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
            loading={saving}
          >
            Save Changes
          </Button>
        </form>

        {/* Medical ID QR */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-5 h-5 text-brand-teal" />
            <p className="text-sm font-bold text-gray-800">Medical ID</p>
            {medicalIdUrl && (
              <span className="ml-auto text-xs text-brand-teal bg-brand-teal-light px-2 py-0.5 rounded-full font-semibold border border-indigo-100">Public</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            A public QR code that shows your emergency medical info — no login needed. Share it on your phone lock screen or print it on a card.
          </p>
          {medicalIdUrl && qrUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={qrUrl}
                alt="Medical ID QR code"
                className="w-44 h-44 rounded-2xl border border-gray-100 shadow-sm"
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button
                  onClick={openPreview}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" /> Preview
                </button>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Reset Medical ID? The current QR code and link will stop working immediately. A new one will be generated.')) {
                    generateMedicalId()
                  }
                }}
                disabled={loading}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition py-1"
              >
                Reset link (invalidates current QR code)
              </button>
            </div>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              loading={loading}
              onClick={() => generateMedicalId()}
            >
              <QrCode className="w-4 h-4 mr-2" /> Generate QR Code
            </Button>
          )}
        </Card>

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
