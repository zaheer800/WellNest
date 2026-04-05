import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface AddSideEffectModalProps {
  medicationId: string
  onAdd: (data: {
    medication_id: string
    side_effect: string
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    source: 'experienced' | 'read_about'
    guidance?: string
  }) => Promise<void>
  onClose: () => void
}

const AddSideEffectModal: React.FC<AddSideEffectModalProps> = ({ medicationId, onAdd, onClose }) => {
  const [sideEffect, setSideEffect] = useState('')
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical'>('mild')
  const [source, setSource] = useState<'experienced' | 'read_about'>('experienced')
  const [guidance, setGuidance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!sideEffect.trim()) {
      setError('Please describe the side effect')
      return
    }

    try {
      setLoading(true)
      await onAdd({
        medication_id: medicationId,
        side_effect: sideEffect.trim(),
        severity,
        source,
        guidance: guidance.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add side effect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <Card className="w-full rounded-t-3xl rounded-b-none p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Log Side Effect</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Side Effect Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Side Effect *
            </label>
            <textarea
              value={sideEffect}
              onChange={(e) => setSideEffect(e.target.value)}
              placeholder="e.g., Nausea, Headache, Dizziness..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              rows={3}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="space-y-2">
              {(['mild', 'moderate', 'severe', 'critical'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={s}
                    checked={severity === s}
                    onChange={(e) => setSeverity(e.target.value as typeof s)}
                    disabled={loading}
                    className="w-4 h-4 text-indigo-600 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700 capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How did you learn about this?</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="experienced"
                  checked={source === 'experienced'}
                  onChange={(e) => setSource(e.target.value as typeof source)}
                  disabled={loading}
                  className="w-4 h-4 text-indigo-600 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">I experienced it</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="read_about"
                  checked={source === 'read_about'}
                  onChange={(e) => setSource(e.target.value as typeof source)}
                  disabled={loading}
                  className="w-4 h-4 text-indigo-600 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">I read about it</span>
              </label>
            </div>
          </div>

          {/* Guidance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              placeholder="Any additional notes or instructions..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Side Effect'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default AddSideEffectModal
