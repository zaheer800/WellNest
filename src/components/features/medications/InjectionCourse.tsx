import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { InjectionCourseWithProgress } from '@/types/injection.types'
import { today, formatDate } from '@/utils/dateHelpers'

interface InjectionCourseProps {
  course: InjectionCourseWithProgress & { medication?: { name: string } }
  onLogDose?: (administeredAt: string, administeredBy: 'self' | 'nurse' | 'doctor' | 'family') => void
}

type AdminBy = 'self' | 'nurse' | 'doctor' | 'family'

const ADMIN_BY_OPTIONS: { value: AdminBy; label: string; emoji: string }[] = [
  { value: 'self',   label: 'Myself',  emoji: '🙋' },
  { value: 'nurse',  label: 'Nurse',   emoji: '👩‍⚕️' },
  { value: 'doctor', label: 'Doctor',  emoji: '🩺' },
  { value: 'family', label: 'Family',  emoji: '👨‍👩‍👧' },
]

const InjectionCourse: React.FC<InjectionCourseProps> = ({ course, onLogDose }) => {
  const todayStr = today()
  const progressPct = Math.round(course.progress_pct)

  // A dose is "due" if scheduled date exists and is on or before today
  const isDue = course.is_active &&
    course.next_dose_date !== null &&
    course.next_dose_date <= todayStr

  const isOverdue = isDue && course.next_dose_date !== todayStr

  // ── Log Dose sheet state ────────────────────────────────────────────────────
  const [showLogSheet, setShowLogSheet] = useState(false)
  // Default date to the scheduled date; if somehow null, fall back to today
  const defaultDate = course.next_dose_date ?? todayStr
  const [logDate, setLogDate]       = useState(defaultDate)
  const [logBy, setLogBy]           = useState<AdminBy>('self')
  const [saving, setSaving]         = useState(false)

  const openSheet = () => {
    setLogDate(course.next_dose_date ?? todayStr)
    setLogBy('self')
    setShowLogSheet(true)
  }

  const handleConfirm = async () => {
    if (!onLogDose) return
    setSaving(true)
    try {
      // Combine chosen date with current time so timestamp is meaningful
      const administeredAt = `${logDate}T${new Date().toTimeString().slice(0, 8)}`
      await onLogDose(administeredAt, logBy)
      setShowLogSheet(false)
    } finally {
      setSaving(false)
    }
  }

  const dots = Array.from({ length: course.total_doses }, (_, i) => i < course.doses_completed)

  return (
    <>
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm truncate">
              {course.medication?.name || 'Unknown Medication'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {course.doses_completed} of {course.total_doses} doses completed
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            {course.is_active ? (
              <Badge label="Active" color="green" />
            ) : (
              <Badge label="Completed" color="gray" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-teal rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Dose dots */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dots.map((administered, i) => (
            <div
              key={i}
              title={`Dose ${i + 1}: ${administered ? 'Done' : 'Pending'}`}
              className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition',
                administered
                  ? 'bg-brand-teal border-brand-teal text-white'
                  : 'bg-white border-gray-300 text-gray-400',
              ].join(' ')}
            >
              {administered ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Next dose row */}
        {course.next_dose_date && (
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-500">
              {isOverdue ? 'Overdue since' : 'Next dose'}
            </span>
            <span className={`font-semibold ${isOverdue ? 'text-red-500' : course.next_dose_date === todayStr ? 'text-brand-teal' : 'text-gray-700'}`}>
              {course.next_dose_date === todayStr ? 'Today' : formatDate(course.next_dose_date)}
              {isOverdue && ' ⚠️'}
            </span>
          </div>
        )}

        {/* Post-course note */}
        {course.post_course_medication_id && (
          <div className="bg-blue-50 rounded-xl p-2.5 mb-3">
            <p className="text-xs text-blue-700">
              A follow-up medication has been prescribed after this course completes.
            </p>
          </div>
        )}

        {course.notes && (
          <p className="text-xs text-gray-400 mb-3">{course.notes}</p>
        )}

        {/* Log Dose button — visible whenever a dose is due (today) or overdue */}
        {isDue && onLogDose && (
          <button
            onClick={openSheet}
            className={[
              'w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95',
              isOverdue
                ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-brand-teal text-white shadow-[0_4px_14px_rgba(14,165,183,0.3)] hover:bg-brand-teal-dark',
            ].join(' ')}
          >
            {isOverdue ? 'Log Overdue Dose' : "Log Today's Dose"}
          </button>
        )}
      </Card>

      {/* ── Log Dose bottom sheet ─────────────────────────────────────────────── */}
      {showLogSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogSheet(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-safe pb-8 shadow-2xl space-y-5">
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

            <div>
              <h3 className="text-lg font-bold text-gray-900">Log Dose</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {course.medication?.name || 'Injection'} · Dose {course.doses_completed + 1} of {course.total_doses}
              </p>
            </div>

            {/* Date picker */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                When did you take it?
              </label>
              <input
                type="date"
                value={logDate}
                min={course.start_date}
                max={todayStr}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-teal bg-gray-50"
              />
              {logDate !== (course.next_dose_date ?? todayStr) && (
                <p className="text-xs text-amber-600 mt-1.5">
                  Scheduled for {formatDate(course.next_dose_date ?? todayStr)} — logging on a different date.
                </p>
              )}
            </div>

            {/* Administered by */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Who administered it?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ADMIN_BY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLogBy(opt.value)}
                    className={[
                      'flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-semibold transition-all',
                      logBy === opt.value
                        ? 'border-brand-teal bg-brand-teal-light text-brand-navy'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={saving || !logDate}
              className="w-full py-4 bg-brand-teal text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(14,165,183,0.3)] hover:bg-brand-teal-dark active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Confirm Dose Taken'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default InjectionCourse
