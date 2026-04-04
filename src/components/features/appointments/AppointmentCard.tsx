import React from 'react'
import type { Appointment } from '@/types/appointment.types'
import Badge from '@/components/ui/Badge'

interface AppointmentCardProps {
  appointment: Appointment
  onPrepare: (id: string) => void
  onComplete: (id: string) => void
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

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPrepare, onComplete }) => {
  const soon = !appointment.completed && isWithin48Hours(appointment.appointment_date)

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
        <Badge
          label={appointment.completed ? 'Completed' : 'Upcoming'}
          color={appointment.completed ? 'green' : 'blue'}
          size="sm"
        />
      </div>

      {/* Upcoming actions */}
      {!appointment.completed && (
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
        </div>
      )}

      {/* Completed — log notes if missing */}
      {appointment.completed && !appointment.post_visit_notes && (
        <button
          type="button"
          onClick={() => onComplete(appointment.id)}
          className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          Log visit notes
        </button>
      )}

      {/* Post-visit notes preview */}
      {appointment.post_visit_notes && (
        <div className="bg-green-50 rounded-xl px-3 py-2">
          <p className="text-xs text-green-600 font-medium mb-0.5">Visit notes</p>
          <p className="text-xs text-gray-600 line-clamp-2">{appointment.post_visit_notes}</p>
        </div>
      )}
    </div>
  )
}

export default AppointmentCard
