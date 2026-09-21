import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { User, Baby } from 'lucide-react'

/**
 * "Whose health are you viewing?" Shown to anyone who manages other people (children, parents).
 * A banner makes it obvious when the screen is showing someone other than yourself, so
 * nothing is logged against the wrong person by accident.
 */
export default function PersonSwitcher() {
  const { user, managedProfiles, activePatientId, setActivePatient } = useAuthStore()
  const navigate = useNavigate()

  const options = [
    ...(user?.name ? [{ id: user.id, label: 'Me', self: true }] : []),
    ...managedProfiles.map((m) => ({ id: m.patientId, label: m.name.split(' ')[0], self: false })),
  ]
  if (options.length < 2) return null

  const active = options.find((o) => o.id === activePatientId) ?? options[0]

  return (
    <div className="px-4 pb-2 space-y-2">
      <div role="tablist" aria-label="Whose health are you viewing?" className="flex gap-2 overflow-x-auto">
        {options.map((o) => {
          const selected = o.id === active.id
          return (
            <button
              key={o.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActivePatient(o.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors',
                selected
                  ? 'bg-brand-teal text-white border-brand-teal'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              ].join(' ')}
            >
              {o.self ? <User className="w-3.5 h-3.5" /> : <Baby className="w-3.5 h-3.5" />}
              {o.label}
            </button>
          )
        })}
        <button
          onClick={() => navigate('/people')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-dashed border-gray-300 text-gray-500"
        >
          + Manage
        </button>
      </div>

      {!active.self && (
        <p className="text-xs text-brand-navy bg-brand-teal-light rounded-lg px-3 py-2" role="status">
          You're viewing and updating <span className="font-semibold">{active.label}'s</span> health, not your own.
        </p>
      )}
    </div>
  )
}
