import React, { useEffect, useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import { useMedicationStore } from '@/store/medicationStore'
import { usePostureStore } from '@/store/postureStore'
import { useSymptomProgressionStore } from '@/store/symptomProgressionStore'
import { useReportStore } from '@/store/reportStore'
import { today } from '@/utils/dateHelpers'
import { shouldTakeMedicationToday } from '@/utils/healthScore'
import { Pill, CupSoda, Activity, UserCheck, Zap, Check, X } from 'lucide-react'

export default function ProgressScreen() {
  const { user } = useAuthStore()
  const { dailyScore } = useHealthStore()
  const { medications } = useMedicationStore()
  const { postureLogs } = usePostureStore()
  const { progressions } = useSymptomProgressionStore()
  const { labReports } = useReportStore()
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month')
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)

  const patientId = user?.id ?? ''
  const date = today()

  useEffect(() => {
    if (patientId) {
      // Fetch data for progress display
      // Note: Most data is already fetched by other screens, but we could add specific progress data fetching here
    }
  }, [patientId])

  // Calculate date range based on timeframe
  const getDateRange = () => {
    const endDate = date
    const daysToSubtract = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365
    const startDateObj = new Date(date)
    startDateObj.setDate(startDateObj.getDate() - daysToSubtract)
    const startDate = startDateObj.toISOString().slice(0, 10)
    return { startDate, endDate }
  }

  const { startDate, endDate } = getDateRange()

  // Calculate streaks (simplified - in real app would fetch from database)
  const calculateStreaks = () => {
    // This is a placeholder - real implementation would query streak data
    return {
      medications: 0, // Would calculate from medication logs
      water: 0, // Would calculate from water logs
      exercise: 0, // Would calculate from exercise logs
      posture: 0, // Would calculate from posture logs
      physiotherapy: 0, // Would calculate from physiotherapy logs
    }
  }

  const streaks = calculateStreaks()

  const todayDate = new Date(date)
  const dueTodayMeds = medications.filter(m => m.is_active && shouldTakeMedicationToday(m, todayDate))
  const medicationCompliance = dueTodayMeds.length > 0
    ? Math.round((dueTodayMeds.filter(m => m.log?.taken).length / dueTodayMeds.length) * 100)
    : 100

  if (!user) return null

  return (
    <PageWrapper title="Progress">
      <div className="space-y-4">
        {/* Timeframe selector */}
        <Card>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                timeframe === 'week'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                timeframe === 'month'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                timeframe === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </Card>

        {/* Health Score Trend */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Health Score Trend</h3>
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-6 text-white text-center">
            <p className="text-5xl font-bold">{dailyScore?.total ?? '—'}</p>
            <p className="text-sm mt-2 opacity-90">
              {dailyScore ? `Last updated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No data available'}
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Medications</span>
              <span className="font-medium">{dailyScore?.medication ?? 0}/25</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Water</span>
              <span className="font-medium">{dailyScore?.water ?? 0}/20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Exercise</span>
              <span className="font-medium">{dailyScore?.exercise ?? 0}/20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Diet</span>
              <span className="font-medium">{dailyScore?.diet ?? 0}/20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Posture</span>
              <span className="font-medium">{dailyScore?.posture ?? 0}/15</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Track your overall health score across medication compliance, water intake, exercise, diet, and posture.
          </p>
        </Card>

        {/* Symptom Progression */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Symptom Progression</h3>
          <div className="space-y-3">
            {progressions.length > 0 ? (
              progressions.slice(0, 5).map((symptom) => {
                const daysSinceLast = symptom.last_logged_at ? 
                  Math.floor((new Date().getTime() - new Date(symptom.last_logged_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
                return (
                  <div key={symptom.symptom_name} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{symptom.symptom_name}</p>
                      <p className="text-xs text-gray-500">
                        Current severity: {symptom.current_severity ?? 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {symptom.total_episodes} episodes
                      </p>
                      <p className="text-xs text-gray-400">
                        {daysSinceLast === 0 ? 'Today' : `${daysSinceLast} days ago`}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm">No symptom data yet. Log symptoms in the Symptoms screen to see trends.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Habit Streaks */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Streaks</h3>
          <div className="space-y-2">
            {[
              { name: 'Medications', streak: streaks.medications, icon: <Pill className="w-5 h-5 text-indigo-500" /> },
              { name: 'Water Intake', streak: streaks.water, icon: <CupSoda className="w-5 h-5 text-blue-500" /> },
              { name: 'Exercise', streak: streaks.exercise, icon: <Activity className="w-5 h-5 text-green-500" /> },
              { name: 'Posture', streak: streaks.posture, icon: <UserCheck className="w-5 h-5 text-teal-500" /> },
              { name: 'Physiotherapy', streak: streaks.physiotherapy, icon: <Zap className="w-5 h-5 text-yellow-500" /> },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">{item.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{item.streak}</p>
                  <p className="text-xs text-gray-400">days</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lab Value Trends */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Lab Value Trends</h3>
          {labReports.length > 0 ? (
            <div className="space-y-3">
              {labReports.slice(0, 3).map((report) => (
                <div key={report.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{report.report_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {report.anomaly_count} anomalies
                    </p>
                    <p className="text-xs text-gray-400">
                      {report.processing_status}
                    </p>
                  </div>
                </div>
              ))}
              {labReports.length > 3 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{labReports.length - 3} more reports
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">Upload lab reports to see parameter trends over time.</p>
            </div>
          )}
        </Card>

        {/* Medication Compliance */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Medication Compliance</h3>
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{medicationCompliance}%</p>
              <p className="text-xs text-gray-600 mt-1">Today's compliance</p>
            </div>
            {medications.filter(m => m.is_active).length > 0 && (
              <div className="space-y-2">
                {medications.filter(m => m.is_active).map((med) => {
                  const dueToday = shouldTakeMedicationToday(med, todayDate)
                  return (
                    <div key={med.id} className="flex items-center justify-between py-2">
                      <span className={`text-sm ${dueToday ? 'text-gray-700' : 'text-gray-400'}`}>{med.name}</span>
                      {dueToday ? (
                        <span className={`text-sm font-medium flex items-center gap-1 ${med.log?.taken ? 'text-green-600' : 'text-red-500'}`}>
                          {med.log?.taken ? <><Check className="w-4 h-4" /> Taken</> : <><X className="w-4 h-4" /> Missed</>}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not due today</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Environmental Triggers */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Environmental Triggers</h3>
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-sm">Log environmental factors when you record symptoms to identify patterns.</p>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
