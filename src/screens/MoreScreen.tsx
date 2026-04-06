import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import PageWrapper from '@/components/layout/PageWrapper'
import { Activity, Utensils, Calendar, LineChart, ChevronRight, UserCircle, LogOut } from 'lucide-react'
import { useState } from 'react'

interface Feature {
  label: string
  icon: React.ReactNode
  path: string
  description: string
  color: string
}

const SECTIONS: { title: string; features: Feature[] }[] = [
  {
    title: 'Account',
    features: [
      {
        label: 'My Profile',
        icon: <UserCircle className="w-5 h-5 text-indigo-600" />,
        path: '/profile',
        description: 'Edit name, height, weight and personal details',
        color: 'bg-indigo-50 border-indigo-100',
      },
    ],
  },
  {
    title: 'Daily Tracking',
    features: [
      { label: 'Exercise', icon: <Activity className="w-5 h-5 text-green-600" />, path: '/exercise', description: 'Activity log, physiotherapy sessions', color: 'bg-green-50 border-green-100' },
      { label: 'Diet', icon: <Utensils className="w-5 h-5 text-lime-600" />, path: '/diet', description: 'Meal compliance tracking', color: 'bg-lime-50 border-lime-100' },
      { label: 'Appointments', icon: <Calendar className="w-5 h-5 text-sky-600" />, path: '/appointments', description: 'Upcoming visits, pre-visit prep', color: 'bg-sky-50 border-sky-100' },
    ],
  },
  {
    title: 'Analytics',
    features: [
      { label: 'Progress', icon: <LineChart className="w-5 h-5 text-indigo-600" />, path: '/progress', description: 'Trends, streaks, score history', color: 'bg-indigo-50 border-indigo-100' },
    ],
  },
]

export default function MoreScreen() {
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <PageWrapper title="More">
      <div className="px-4 pt-4 pb-10 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.features.map((f) => (
                <button
                  key={f.path}
                  onClick={() => navigate(f.path)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border ${f.color} text-left transition active:scale-95`}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-full shadow-sm">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{f.description}</p>
                  </div>
                  <ChevronRight className="ml-auto w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Session</h2>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-red-100 bg-red-50 text-left transition active:scale-95 disabled:opacity-60"
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-full shadow-sm">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-red-600">
              {signingOut ? 'Signing out…' : 'Sign out'}
            </p>
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
