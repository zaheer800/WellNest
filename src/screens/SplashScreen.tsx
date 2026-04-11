import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import WellNestIcon from '@/components/ui/WellNestIcon'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { initialized, session, user, role } = useAuthStore()

  useEffect(() => {
    if (!initialized) return
    if (!session) {
      navigate('/login', { replace: true })
    } else if (role === 'doctor') {
      navigate('/doctor-dashboard', { replace: true })
    } else if (role === 'family') {
      navigate('/family-dashboard', { replace: true })
    } else if (user?.name) {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  }, [initialized, session, user, role, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-navy">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-2">
          <WellNestIcon size={96} className="shadow-2xl" />
        </div>
        <h1 className="text-4xl font-semibold text-white tracking-tight">WellNest</h1>
        <p className="text-white/50 text-sm font-medium">Health Records. Smarter Insights. Better Decisions.</p>
      </div>
      <div className="absolute bottom-16 flex space-x-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-teal animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
