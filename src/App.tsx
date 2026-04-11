import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'

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
import MoreScreen from '@/screens/MoreScreen'
import ProfileScreen from '@/screens/ProfileScreen'
import SOSScreen from '@/screens/SOSScreen'
import MedicalIdScreen from '@/screens/MedicalIdScreen'
import AuthCallbackScreen from '@/screens/AuthCallbackScreen'
import JoinScreen from '@/screens/JoinScreen'
import JoinDoctorScreen from '@/screens/JoinDoctorScreen'
import FamilyDashboardScreen from '@/screens/FamilyDashboardScreen'
import DoctorDashboardScreen from '@/screens/DoctorDashboardScreen'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore()
  if (!initialized) return null
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Only accessible to users who have the family role */
function FamilyRoute({ children }: { children: React.ReactNode }) {
  const { session, roles, initialized } = useAuthStore()
  if (!initialized) return null
  if (!session) return <Navigate to="/login" replace />
  if (!roles.includes('family')) {
    if (roles.includes('doctor')) return <Navigate to="/doctor-dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

/** Only accessible to users who have the doctor role */
function DoctorRoute({ children }: { children: React.ReactNode }) {
  const { session, roles, initialized } = useAuthStore()
  if (!initialized) return null
  if (!session) return <Navigate to="/login" replace />
  if (!roles.includes('doctor')) {
    if (roles.includes('family')) return <Navigate to="/family-dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

/** Only accessible to users who have the patient role */
function PatientRoute({ children }: { children: React.ReactNode }) {
  const { session, roles, initialized } = useAuthStore()
  if (!initialized) return null
  if (!session) return <Navigate to="/login" replace />
  if (!roles.includes('patient')) {
    if (roles.includes('doctor')) return <Navigate to="/doctor-dashboard" replace />
    if (roles.includes('family')) return <Navigate to="/family-dashboard" replace />
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const handleOffline = () => useHealthStore.getState().setOffline(true)
    const handleOnline = () => {
      useHealthStore.getState().setOffline(false)
      useHealthStore.getState().syncPendingLogs()
    }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/auth/callback" element={<AuthCallbackScreen />} />
        <Route path="/join" element={<JoinScreen />} />
        <Route path="/join-doctor" element={<JoinDoctorScreen />} />
        <Route path="/medical-id/:token" element={<MedicalIdScreen />} />

        {/* Family member portal */}
        <Route path="/family-dashboard" element={<FamilyRoute><FamilyDashboardScreen /></FamilyRoute>} />

        {/* Doctor portal */}
        <Route path="/doctor-dashboard" element={<DoctorRoute><DoctorDashboardScreen /></DoctorRoute>} />

        {/* Patient-only routes */}
        <Route path="/dashboard" element={<PatientRoute><DashboardScreen /></PatientRoute>} />
        <Route path="/medications" element={<PatientRoute><MedicationsScreen /></PatientRoute>} />
        <Route path="/water" element={<PatientRoute><WaterScreen /></PatientRoute>} />
        <Route path="/symptoms" element={<PatientRoute><SymptomsScreen /></PatientRoute>} />
        <Route path="/exercise" element={<PatientRoute><ExerciseScreen /></PatientRoute>} />
        <Route path="/posture" element={<PatientRoute><PostureScreen /></PatientRoute>} />
        <Route path="/diet" element={<PatientRoute><DietScreen /></PatientRoute>} />
        <Route path="/appointments" element={<PatientRoute><AppointmentsScreen /></PatientRoute>} />
        <Route path="/reports" element={<PatientRoute><ReportsScreen /></PatientRoute>} />
        <Route path="/imaging" element={<PatientRoute><ImagingScreen /></PatientRoute>} />
        <Route path="/conditions" element={<PatientRoute><ConditionsScreen /></PatientRoute>} />
        <Route path="/progress" element={<PatientRoute><ProgressScreen /></PatientRoute>} />
        <Route path="/family" element={<PatientRoute><FamilyScreen /></PatientRoute>} />
        <Route path="/doctor" element={<PatientRoute><DoctorScreen /></PatientRoute>} />
        <Route path="/more" element={<PatientRoute><MoreScreen /></PatientRoute>} />
        <Route path="/profile" element={<PatientRoute><ProfileScreen /></PatientRoute>} />
        <Route path="/sos" element={<PatientRoute><SOSScreen /></PatientRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
