import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { initialized, session, user } = useAuthStore()

  useEffect(() => {
    if (!initialized) return
    if (!session) {
      navigate('/login', { replace: true })
    } else if (!user?.name) {
      navigate('/onboarding', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }, [initialized, session, user, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-navy">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/icons/wellnest-icon.png"
            alt="WellNest"
            className="w-24 h-24 rounded-[1.75rem] shadow-2xl"
          />
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
