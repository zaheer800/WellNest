import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { InjectionCourseWithProgress } from '@/types/injection.types'
import { today, formatDate } from '@/utils/dateHelpers'

interface InjectionCourseProps {
  course: InjectionCourseWithProgress & { medication?: { name: string } }
  onMarkDose?: () => void
  onViewDetails?: () => void
}

const InjectionCourse: React.FC<InjectionCourseProps> = ({ course, onMarkDose, onViewDetails }) => {
  const [showDetails, setShowDetails] = useState(false)
  const progressPct = Math.round(course.progress_pct)
  const todayStr = today()
  const isToday = course.next_dose_date === todayStr

  const dots = Array.from({ length: course.total_doses }, (_, i) => i < course.doses_completed)

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">
            {course.medication?.name || 'Unknown Medication'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {course.doses_completed} of {course.total_doses} doses completed
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {onViewDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="text-gray-400 hover:text-gray-600 p-1 transition"
              title="View course details"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
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

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {course.medication?.name || 'Unknown Medication'}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Total Doses</label>
                    <p className="font-medium">{course.total_doses}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Completed</label>
                    <p className="font-medium">{course.doses_completed}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Frequency</label>
                    <p className="font-medium capitalize">{course.frequency.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <Badge
                      label={course.is_active ? 'Active' : 'Completed'}
                      color={course.is_active ? 'green' : 'gray'}
                      size="sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <p className="font-medium">{formatDate(course.start_date)}</p>
                </div>

                {course.end_date && (
                  <div>
                    <label className="text-xs text-gray-500">End Date</label>
                    <p className="font-medium">{formatDate(course.end_date)}</p>
                  </div>
                )}

                {course.next_dose_date && (
                  <div>
                    <label className="text-xs text-gray-500">Next Dose</label>
                    <p className={`font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {isToday ? 'Today' : formatDate(course.next_dose_date)}
                    </p>
                  </div>
                )}

                {course.notes && (
                  <div>
                    <label className="text-xs text-gray-500">Notes</label>
                    <p className="text-sm text-gray-700 mt-1">{course.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button variant="secondary" fullWidth onClick={() => setShowDetails(false)}>
                      Close
                    </Button>
                    {course.is_active && isToday && onMarkDose && (
                      <Button variant="primary" fullWidth onClick={() => { onMarkDose(); setShowDetails(false); }}>
                        Mark Today's Dose
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default InjectionCourse
