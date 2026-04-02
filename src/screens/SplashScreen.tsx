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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center space-y-4">
        <div className="text-7xl mb-2">🪺</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">WellNest</h1>
        <p className="text-indigo-100 text-base">Your health. Your circle. Your journey.</p>
      </div>
      <div className="absolute bottom-16 flex space-x-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
