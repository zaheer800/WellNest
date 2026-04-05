import React from 'react'
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
  appointment, onPrepare, onComplete, onReschedule, onEdit, onDelete,
}) => {
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
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition"
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
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 animate-pulse'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
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
          className="w-full py-2 px-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
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
    </div>
  )
}

export default AppointmentCard
