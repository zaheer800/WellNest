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
import ReportsScreen from '@/screens/ReportsScreen'
import ImagingScreen from '@/screens/ImagingScreen'
import ConditionsScreen from '@/screens/ConditionsScreen'
import ProgressScreen from '@/screens/ProgressScreen'
import FamilyScreen from '@/screens/FamilyScreen'
import DoctorScreen from '@/screens/DoctorScreen'
import DietScreen from '@/screens/DietScreen'

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
        <Route path="/diet" element={<ProtectedRoute><DietScreen /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><AppointmentsScreen /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsScreen /></ProtectedRoute>} />
        <Route path="/imaging" element={<ProtectedRoute><ImagingScreen /></ProtectedRoute>} />
        <Route path="/conditions" element={<ProtectedRoute><ConditionsScreen /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressScreen /></ProtectedRoute>} />
        <Route path="/family" element={<ProtectedRoute><FamilyScreen /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute><DoctorScreen /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
