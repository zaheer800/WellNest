import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Screens
import SplashScreen from '@/screens/SplashScreen'
import LoginScreen from '@/screens/LoginScreen'
import OnboardingScreen from '@/screens/OnboardingScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import MedicationsScreen from '@/screens/MedicationsScreen'
import WaterScreen from '@/screens/WaterScreen'
import SymptomsScreen from '@/screens/SymptomsScreen'
import ExerciseScreen from '@/screens/ExerciseScreen'
import PostureScreen from '@/screens/PostureScreen'
import AppointmentsScreen from '@/screens/AppointmentsScreen'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore()
  if (!initialized) return null
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/medications" element={<ProtectedRoute><MedicationsScreen /></ProtectedRoute>} />
        <Route path="/water" element={<ProtectedRoute><WaterScreen /></ProtectedRoute>} />
        <Route path="/symptoms" element={<ProtectedRoute><SymptomsScreen /></ProtectedRoute>} />
        <Route path="/exercise" element={<ProtectedRoute><ExerciseScreen /></ProtectedRoute>} />
        <Route path="/posture" element={<ProtectedRoute><PostureScreen /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><AppointmentsScreen /></ProtectedRoute>} />

        {/* Fallback stubs for nav links not yet implemented */}
        <Route path="/reports" element={<ProtectedRoute><PlaceholderScreen title="Reports" icon="📋" /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><PlaceholderScreen title="Progress" icon="📈" /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function PlaceholderScreen({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-20">
      <p className="text-5xl mb-4">{icon}</p>
      <h1 className="text-xl font-bold text-gray-700">{title}</h1>
      <p className="text-gray-400 text-sm mt-2">Coming in Phase 2</p>
    </div>
  )
}
