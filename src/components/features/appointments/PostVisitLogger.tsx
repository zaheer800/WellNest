import React, { useState } from 'react'
import type { Appointment } from '@/types/appointment.types'
import Button from '@/components/ui/Button'

interface PostVisitLoggerProps {
  appointment: Appointment
  onSave: (notes: string, tasks: string[]) => void
  loading?: boolean
}

const PostVisitLogger: React.FC<PostVisitLoggerProps> = ({ appointment, onSave, loading = false }) => {
  const [notes, setNotes] = useState(appointment.post_visit_notes ?? '')
  const [tasks, setTasks] = useState<string[]>(
    (appointment.follow_up_tasks as string[]).length > 0
      ? (appointment.follow_up_tasks as string[])
      : [''],
  )

  const addTask = () => setTasks([...tasks, ''])
  const removeTask = (i: number) => setTasks(tasks.filter((_, idx) => idx !== i))
  const updateTask = (i: number, val: string) =>
    setTasks(tasks.map((t, idx) => (idx === i ? val : t)))

  const handleSave = () => {
    const validTasks = tasks.filter((t) => t.trim().length > 0)
    onSave(notes.trim(), validTasks)
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block font-medium">
          What did the doctor say?
        </label>
        <textarea
          className={`${inputClass} min-h-[100px] resize-none`}
          placeholder="e.g. Doctor reviewed MRI findings, adjusted medication, recommended physiotherapy…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Follow-up tasks</label>
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${inputClass} flex-1`}
                placeholder={`Task ${i + 1}…`}
                value={task}
                onChange={(e) => updateTask(i, e.target.value)}
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTask(i)}
                  className="text-gray-300 hover:text-red-400 px-2 transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTask}
          className="mt-2 text-xs text-indigo-500 font-medium hover:text-indigo-700 transition"
        >
          + Add task
        </button>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleSave}
        loading={loading}
        disabled={!notes.trim()}
      >
        Save Visit Notes
      </Button>
    </div>
  )
}

export default PostVisitLogger
