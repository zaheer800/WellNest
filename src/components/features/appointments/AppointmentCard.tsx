import React, { useState } from 'react'
import type { Appointment } from '@/types/appointment.types'
import Badge from '@/components/ui/Badge'
import { RefreshCw, Pencil, Trash2 } from 'lucide-react'

interface AppointmentCardProps {
  appointment: Appointment
  onPrepare: (id: string) => void
  onComplete: (id: string) => void
  onReschedule: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onDelete: (id: string) => void
  onDismissTask?: (task: string) => void
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isWithin48Hours(iso: string): boolean {
  const diff = new Date(iso).getTime() - Date.now()
  return diff > 0 && diff <= 48 * 60 * 60 * 1000
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment, onPrepare, onComplete, onReschedule, onEdit, onDelete, onDismissTask,
}) => {
  // Tracks tasks the user has tapped by text — stable across index shifts
  const [checking, setChecking] = useState<Set<string>>(new Set())

  const handleDismissTask = (task: string) => {
    setChecking((prev) => new Set([...prev, task]))
    onDismissTask?.(task)
  }
  const isPast = new Date(appointment.appointment_date) < new Date()
  const isMissed = isPast && !appointment.completed
  const isCompleted = appointment.completed
  const soon = !isPast && isWithin48Hours(appointment.appointment_date)

  const badgeLabel = isCompleted ? 'Completed' : isMissed ? 'Missed' : 'Upcoming'
  const badgeColor = isCompleted ? 'green' : isMissed ? 'red' : 'blue'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">
            {appointment.appointment_type ?? 'Appointment'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(appointment.appointment_date)}</p>
          {appointment.notes && (
            <p className="text-xs text-gray-500 mt-1 truncate">{appointment.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge label={badgeLabel} color={badgeColor} size="sm" />
          {/* Edit / delete only for upcoming */}
          {!isPast && !isCompleted && (
            <>
              <button
                type="button"
                onClick={() => onEdit(appointment)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal-light transition"
                aria-label="Edit appointment"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(appointment.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                aria-label="Delete appointment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upcoming — prepare + mark completed */}
      {!isPast && !isCompleted && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPrepare(appointment.id)}
            className={[
              'flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition',
              soon
                ? 'bg-brand-teal text-white hover:bg-brand-teal animate-pulse'
                : 'bg-brand-teal-light text-brand-teal hover:bg-brand-teal-light',
            ].join(' ')}
          >
            {soon ? '📋 Prepare for Visit' : 'Prepare for Visit'}
          </button>
          <button
            type="button"
            onClick={() => onComplete(appointment.id)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition"
          >
            Mark Completed
          </button>
        </div>
      )}

      {/* Missed — mark completed (late) + reschedule */}
      {isMissed && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onComplete(appointment.id)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition"
          >
            Mark as completed
          </button>
          <button
            type="button"
            onClick={() => onReschedule(appointment)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reschedule
          </button>
        </div>
      )}

      {/* Completed — log outcome if missing */}
      {isCompleted && !appointment.post_visit_notes && (
        <button
          type="button"
          onClick={() => onComplete(appointment.id)}
          className="w-full py-2 px-3 bg-brand-teal-light border border-indigo-100 rounded-xl text-xs font-semibold text-brand-teal hover:bg-brand-teal-light transition"
        >
          Log outcome &amp; medications
        </button>
      )}

      {/* Post-visit notes preview */}
      {appointment.post_visit_notes && (
        <div className="bg-green-50 rounded-xl px-3 py-2">
          <p className="text-xs text-green-600 font-medium mb-0.5">Visit outcome</p>
          <p className="text-xs text-gray-600 line-clamp-2">{appointment.post_visit_notes}</p>
        </div>
      )}

      {/* Follow-up tasks */}
      {(Array.isArray(appointment.follow_up_tasks) && appointment.follow_up_tasks.length > 0) ||
       (Array.isArray(appointment.completed_follow_up_tasks) && appointment.completed_follow_up_tasks.length > 0) ? (
        <div className="bg-amber-50 rounded-xl px-3 py-2.5 space-y-2">
          <p className="text-xs text-amber-700 font-semibold">Follow-up tasks</p>
          {(appointment.follow_up_tasks as string[]).map((task) => {
            const done = checking.has(task)
            return (
              <div key={task} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDismissTask(task)}
                  className={[
                    'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all active:scale-90 flex items-center justify-center',
                    done
                      ? 'bg-amber-400 border-amber-500'
                      : 'border-amber-400 hover:bg-amber-400 hover:border-amber-500',
                  ].join(' ')}
                  aria-label="Mark task done"
                >
                  {done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <p className={`text-xs flex-1 transition-all ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task}</p>
              </div>
            )
          })}
          {/* Completed tasks */}
          {Array.isArray(appointment.completed_follow_up_tasks) && appointment.completed_follow_up_tasks.length > 0 && (
            <>
              {(appointment.follow_up_tasks as string[]).length > 0 && (
                <div className="border-t border-amber-200 pt-2 mt-1" />
              )}
              {appointment.completed_follow_up_tasks.map((task, i) => (
                <div key={`done-${i}`} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-500 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs flex-1 line-through text-gray-400">{task}</p>
                </div>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default AppointmentCard
