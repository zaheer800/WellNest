/**
 * MedicalIdScreen — Public page, no auth required.
 * Route: /medical-id/:token
 *
 * Loaded by scanning a QR code. Designed for first responders:
 * large text, high contrast, actionable contact buttons.
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMedicalIdData } from '@/services/supabase'
import { Phone, AlertTriangle, Pill, Heart, User } from 'lucide-react'

type MedicalIdData = {
  name: string
  blood_type: string | null
  allergies: string[]
  emergency_contacts: { name: string; phone: string; relationship: string }[]
  medications: { name: string; dose: string | null; unit: string | null; frequency: string | null }[]
}

export default function MedicalIdScreen() {
  const { token } = useParams<{ token: string }>()
  const [data,    setData]    = useState<MedicalIdData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!token) { setError('Invalid link'); setLoading(false); return }
    getMedicalIdData(token)
      .then((d) => {
        if (!d) setError('Medical ID not found. The link may be invalid or expired.')
        else setData(d)
      })
      .catch(() => setError('Could not load Medical ID. Check your connection and try again.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h1 className="text-xl font-bold text-gray-800">Medical ID Not Found</h1>
        <p className="text-gray-500 text-sm max-w-xs">{error ?? 'This Medical ID link is invalid.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Header */}
      <div className="bg-gradient-to-b from-red-600 to-red-700 text-white px-5 pt-safe pt-8 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-200 uppercase tracking-widest">Medical ID</p>
            <p className="text-xs text-red-200/70">For emergency use · No login required</p>
          </div>
        </div>

        {/* Patient name */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white leading-tight">{data.name}</h1>
          </div>
        </div>

        {/* Blood type — giant badge */}
        {data.blood_type && (
          <div className="mt-5 inline-flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">🩸</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Type</p>
              <p className="text-3xl font-black text-red-600 leading-none">{data.blood_type}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-6">

        {/* Allergies */}
        {data.allergies.length > 0 && (
          <section className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="font-extrabold text-amber-800 text-base uppercase tracking-wide">Allergies</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.allergies.map((a) => (
                <span key={a} className="px-3 py-1.5 bg-amber-200 text-amber-900 font-bold text-sm rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Medications */}
        {data.medications.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Pill className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-gray-800 text-base">Current Medications</h2>
            </div>
            <div className="space-y-2">
              {data.medications.map((m, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{m.name}</p>
                    {m.frequency && <p className="text-xs text-gray-400 font-medium mt-0.5">{m.frequency}</p>}
                  </div>
                  {(m.dose || m.unit) && (
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex-shrink-0">
                      {[m.dose, m.unit].filter(Boolean).join(' ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Emergency Contacts */}
        {data.emergency_contacts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Phone className="w-5 h-5 text-red-500" />
              <h2 className="font-extrabold text-gray-800 text-base">Emergency Contacts</h2>
            </div>
            <div className="space-y-3">
              {data.emergency_contacts.map((c, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{c.name}</p>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">{c.relationship} · {c.phone}</p>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 active:scale-95 transition-all flex-shrink-0"
                    aria-label={`Call ${c.name}`}
                  >
                    <Phone className="w-5 h-5 text-white fill-white" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No allergy / no contact fallback */}
        {data.allergies.length === 0 && data.emergency_contacts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No additional medical information available.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-gray-300 font-medium">Powered by WellNest · Patient-controlled medical data</p>
        </div>
      </div>
    </div>
  )
}
