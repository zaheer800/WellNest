import { useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'

interface Feature {
  label: string
  icon: string
  path: string
  description: string
  color: string
}

const SECTIONS: { title: string; features: Feature[] }[] = [
  {
    title: 'Daily Tracking',
    features: [
      { label: 'Exercise', icon: '🏃', path: '/exercise', description: 'Activity log, physiotherapy sessions', color: 'bg-green-50 border-green-100' },
      { label: 'Diet', icon: '🍽️', path: '/diet', description: 'Meal compliance tracking', color: 'bg-lime-50 border-lime-100' },
      { label: 'Appointments', icon: '📅', path: '/appointments', description: 'Upcoming visits, pre-visit prep', color: 'bg-sky-50 border-sky-100' },
    ],
  },
  {
    title: 'Analytics',
    features: [
      { label: 'Progress', icon: '📊', path: '/progress', description: 'Trends, streaks, score history', color: 'bg-indigo-50 border-indigo-100' },
    ],
  },
]

export default function MoreScreen() {
  const navigate = useNavigate()

  return (
    <PageWrapper title="More">
      <div className="px-4 pt-4 pb-8 space-y-6">
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
                  <span className="text-2xl w-8 text-center flex-shrink-0">{f.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{f.description}</p>
                  </div>
                  <svg className="ml-auto w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
