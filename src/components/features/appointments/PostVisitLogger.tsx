import React, { useRef, useState } from 'react'
import type { Appointment } from '@/types/appointment.types'
import Button from '@/components/ui/Button'
import { Plus, X, Paperclip, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { uploadPrescription, extractMedicationsFromPrescription } from '@/services/prescriptionParser'
import { useAuthStore } from '@/store/authStore'

export interface NewMedication {
  name: string
  dose: string
  unit: string
  frequency: 'daily' | 'alternate_days' | 'weekly'
  notes: string
}

interface PostVisitLoggerProps {
  appointment: Appointment
  onSave: (notes: string, tasks: string[], medications: NewMedication[]) => void
  loading?: boolean
}

const UNITS = ['mg', 'g', 'ml', 'IU', 'mcg', 'tablet', 'capsule', 'drop']

const emptyMed = (): NewMedication => ({ name: '', dose: '', unit: 'mg', frequency: 'daily', notes: '' })

const PostVisitLogger: React.FC<PostVisitLoggerProps> = ({ appointment, onSave, loading = false }) => {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [notes, setNotes] = useState(appointment.post_visit_notes ?? '')
  const [tasks, setTasks] = useState<string[]>(
    (appointment.follow_up_tasks as string[]).length > 0
      ? (appointment.follow_up_tasks as string[])
      : [''],
  )
  const [medications, setMedications] = useState<NewMedication[]>([])
  const [showMedForm, setShowMedForm] = useState(false)

  // Prescription upload state
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'extracting' | 'done' | 'error'>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const addTask = () => setTasks([...tasks, ''])
  const removeTask = (i: number) => setTasks(tasks.filter((_, idx) => idx !== i))
  const updateTask = (i: number, val: string) => setTasks(tasks.map((t, idx) => (idx === i ? val : t)))

  const handlePrescriptionSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setPrescriptionFile(file)
    setUploadError(null)
    setUploadState('uploading')
    try {
      const url = await uploadPrescription(user.id, file)
      setPrescriptionUrl(url)
      setUploadState('extracting')
      const extracted = await extractMedicationsFromPrescription(url)
      if (extracted.length > 0) {
        setMedications((prev) => {
          // Merge: keep manually added ones, append extracted ones that aren't duplicates
          const existing = new Set(prev.map((m) => m.name.toLowerCase()))
          const newOnes = extracted.filter((m) => !existing.has(m.name.toLowerCase()))
          return [...prev, ...newOnes]
        })
      }
      setUploadState('done')
    } catch (err: any) {
      setUploadError(err?.message ?? 'Failed to process prescription')
      setUploadState('error')
    }
  }

  const addMed = () => { setMedications([...medications, emptyMed()]); setShowMedForm(true) }
  const removeMed = (i: number) => {
    const updated = medications.filter((_, idx) => idx !== i)
    setMedications(updated)
    if (updated.length === 0) setShowMedForm(false)
  }
  const updateMed = (i: number, field: keyof NewMedication, val: string) =>
    setMedications(medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const handleSave = () => {
    const validTasks = tasks.filter((t) => t.trim().length > 0)
    const validMeds = medications.filter((m) => m.name.trim().length > 0)
    onSave(notes.trim(), validTasks, validMeds)
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="space-y-4">
      {/* Outcome notes */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block font-medium">What did the doctor say?</label>
        <textarea
          className={`${inputClass} min-h-[90px] resize-none`}
          placeholder="e.g. Doctor reviewed MRI findings, adjusted medication, recommended physiotherapy…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Prescription upload */}
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-2">Prescription</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handlePrescriptionSelect}
        />
        {uploadState === 'idle' || uploadState === 'error' ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition"
          >
            <Paperclip className="w-4 h-4" />
            Upload prescription (photo or PDF)
          </button>
        ) : uploadState === 'uploading' || uploadState === 'extracting' ? (
          <div className="flex items-center gap-3 py-3 px-4 bg-indigo-50 rounded-xl">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-700">
                {uploadState === 'uploading' ? 'Uploading…' : 'Reading prescription…'}
              </p>
              <p className="text-xs text-indigo-400">
                {uploadState === 'extracting' ? 'AI is extracting medications' : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-3 px-4 bg-green-50 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-700">Prescription uploaded</p>
              <p className="text-xs text-gray-500 truncate">{prescriptionFile?.name}</p>
            </div>
            <button
              type="button"
              onClick={() => { setPrescriptionFile(null); setPrescriptionUrl(null); setUploadState('idle'); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {uploadState === 'error' && uploadError && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {uploadError} — medications not extracted, please add them manually.
          </div>
        )}
      </div>

      {/* Medications prescribed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500 font-medium">Medications prescribed</label>
          <button
            type="button"
            onClick={addMed}
            className="flex items-center gap-1 text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {medications.length === 0 ? (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-3 text-center">
            Tap Add if the doctor prescribed any new medications
          </p>
        ) : (
          <div className="space-y-3">
            {medications.map((med, i) => (
              <div key={i} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-700">Medication {i + 1}</span>
                  <button type="button" onClick={() => removeMed(i)} className="text-gray-400 hover:text-red-400 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Medication name *"
                  value={med.name}
                  onChange={(e) => updateMed(i, 'name', e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Dose"
                    value={med.dose}
                    onChange={(e) => updateMed(i, 'dose', e.target.value)}
                  />
                  <select
                    className="w-24 border border-gray-200 rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={med.unit}
                    onChange={(e) => updateMed(i, 'unit', e.target.value)}
                  >
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <select
                  className={inputClass}
                  value={med.frequency}
                  onChange={(e) => updateMed(i, 'frequency', e.target.value as NewMedication['frequency'])}
                >
                  <option value="daily">Daily</option>
                  <option value="alternate_days">Alternate days</option>
                  <option value="weekly">Weekly</option>
                </select>
                <input
                  className={inputClass}
                  placeholder="Instructions (optional) e.g. Take with food"
                  value={med.notes}
                  onChange={(e) => updateMed(i, 'notes', e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up tasks */}
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
                <button type="button" onClick={() => removeTask(i)} className="text-gray-300 hover:text-red-400 px-2 transition">
                  <X className="w-4 h-4" />
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

      <Button variant="primary" fullWidth onClick={handleSave} loading={loading} disabled={!notes.trim()}>
        Save outcome
      </Button>
    </div>
  )
}

export default PostVisitLogger
