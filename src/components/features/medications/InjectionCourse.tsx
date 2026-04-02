import React from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { InjectionCourseWithProgress } from '@/types/injection.types'
import { today } from '@/utils/dateHelpers'

interface InjectionCourseProps {
  course: InjectionCourseWithProgress
  onMarkDose?: () => void
}

const InjectionCourse: React.FC<InjectionCourseProps> = ({ course, onMarkDose }) => {
  const progressPct = Math.round(course.progress_pct)
  const todayStr = today()
  const isToday = course.next_dose_date === todayStr

  const dots = Array.from({ length: course.total_doses }, (_, i) => i < course.doses_completed)

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            Injection Course #{course.doses_completed + 1}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {course.doses_completed} of {course.total_doses} doses completed
          </p>
        </div>
        {course.is_active ? (
          <Badge label="Active" color="green" />
        ) : (
          <Badge label="Completed" color="gray" />
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Dose markers */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {dots.map((administered, i) => (
          <div
            key={i}
            title={`Dose ${i + 1}: ${administered ? 'Administered' : 'Pending'}`}
            className={[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition',
              administered
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-white border-gray-300 text-gray-300',
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

      {/* Next dose date */}
      {course.next_dose_date && (
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-500">Next dose</span>
          <span className={`font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
            {isToday ? 'Today' : formatDate(course.next_dose_date)}
          </span>
        </div>
      )}

      {/* Post-course medication note */}
      {course.post_course_medication_id && (
        <div className="bg-blue-50 rounded-xl p-2.5 mb-3">
          <p className="text-xs text-blue-700">
            A follow-up medication has been prescribed after this course completes.
          </p>
        </div>
      )}

      {/* Notes */}
      {course.notes && (
        <p className="text-xs text-gray-400 mb-3">{course.notes}</p>
      )}

      {/* Mark dose button */}
      {course.is_active && isToday && onMarkDose && (
        <Button variant="primary" fullWidth onClick={onMarkDose}>
          Mark Today's Dose
        </Button>
      )}
    </Card>
  )
}

export default InjectionCourse
