import React, { useState } from 'react'

interface DetectionResult {
  detected_type: string
  detection_confidence: number
  suggested_label: string
}

interface ReportTypeDetectorProps {
  detected: DetectionResult | null
  onConfirm: (type: string) => void
  onOverride: (type: string) => void
  loading: boolean
}

const REPORT_TYPES = [
  { value: 'lab_blood', label: 'Lab — Blood Test' },
  { value: 'lab_urine', label: 'Lab — Urine Analysis' },
  { value: 'mri', label: 'MRI' },
  { value: 'ct', label: 'CT Scan' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'ncs', label: 'NCS / EMG' },
  { value: 'xray', label: 'X-Ray' },
  { value: 'ecg', label: 'ECG' },
  { value: 'echo', label: 'Echo' },
  { value: 'other', label: 'Other' },
]

const ReportTypeDetector: React.FC<ReportTypeDetectorProps> = ({
  detected,
  onConfirm,
  onOverride,
  loading,
}) => {
  const [showOverride, setShowOverride] = useState(false)
  const [overrideType, setOverrideType] = useState('')

  const confidencePct = detected ? Math.round(detected.detection_confidence * 100) : 0
  const confidenceColor =
    confidencePct >= 90 ? 'text-green-600' : confidencePct >= 70 ? 'text-yellow-600' : 'text-orange-600'

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <p className="text-sm text-gray-600">Analysing report type…</p>
      </div>
    )
  }

  if (!detected) return null

  return (
    <div className="space-y-3">
      {/* Detection result */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Detected type</p>
            <p className="text-base font-semibold text-gray-800 mt-0.5">{detected.suggested_label}</p>
          </div>
          <span className={`text-sm font-bold ${confidenceColor}`}>{confidencePct}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(detected.detected_type)}
          className="flex-1 py-2.5 px-4 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setShowOverride(!showOverride)}
          className="py-2.5 px-4 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-300 transition"
        >
          Override
        </button>
      </div>

      {/* Override selector */}
      {showOverride && (
        <div className="space-y-2">
          <select
            value={overrideType}
            onChange={(e) => setOverrideType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select correct type…</option>
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {overrideType && (
            <button
              type="button"
              onClick={() => {
                onOverride(overrideType)
                setShowOverride(false)
              }}
              className="w-full py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition"
            >
              Use this type
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ReportTypeDetector
