import { useNavigate } from 'react-router-dom'
import { useAuthStore, type AppRole } from '@/store/authStore'
import { User, Users, Stethoscope } from 'lucide-react'

/**
 * Shown when the logged-in user has more than one role.
 * Renders a tab row to switch between available roles.
 */
export default function RoleSwitcher() {
  const { role, roles, switchRole, familyMemberRecord, doctorRecord } = useAuthStore()
  const navigate = useNavigate()

  // Only render when there are multiple roles
  if (roles.filter(Boolean).length < 2) return null

  const familyPatientName = familyMemberRecord?.users?.name ?? 'Family'
  const doctorPatientName = doctorRecord?.users?.name ?? 'Patient'

  const roleLabel = (r: string) => {
    if (r === 'patient') return 'My Health'
    if (r === 'family') return `${familyPatientName.split(' ')[0]}'s Circle`
    if (r === 'doctor') return `Dr. View · ${doctorPatientName.split(' ')[0]}`
    return r
  }

  const roleIcon = (r: string) => {
    if (r === 'patient') return <User className="w-3.5 h-3.5" />
    if (r === 'family') return <Users className="w-3.5 h-3.5" />
    if (r === 'doctor') return <Stethoscope className="w-3.5 h-3.5" />
    return null
  }

  const rolePath = (r: string) => {
    if (r === 'patient') return '/dashboard'
    if (r === 'family') return '/family-dashboard'
    if (r === 'doctor') return '/doctor-dashboard'
    return '/dashboard'
  }

  const availableRoles = roles.filter((r): r is Exclude<AppRole, null> => r !== null)

  return (
    <div className="flex items-center gap-1.5 bg-gray-100 rounded-2xl p-1 mx-4 mb-2">
      {availableRoles.map((r) => {
        const active = role === r
        return (
          <button
            key={r}
            onClick={() => {
              if (active) return
              switchRole(r)
              navigate(rolePath(r), { replace: true })
            }}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all',
              active
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
            aria-pressed={active}
          >
            {roleIcon(r)}
            <span className="truncate">{roleLabel(r)}</span>
          </button>
        )
      })}
    </div>
  )
}
