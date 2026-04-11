import React, { useState, useRef } from 'react'
import Card from '@/components/ui/Card'
import { supabase } from '@/services/supabase'

type Pipeline = 'lab' | 'imaging'

interface ReportUploadProps {
  patientId: string
  onUploadComplete: (fileUrl: string, pipeline: Pipeline) => void
}

const PIPELINE_OPTIONS: { value: Pipeline; label: string; hint: string }[] = [
  { value: 'lab', label: 'Lab / Blood Test', hint: 'Blood test, urine analysis, hormone panel…' },
  { value: 'imaging', label: 'Imaging / Scan', hint: 'MRI, CT, X-Ray, Ultrasound, ECG, NCS…' },
]

const ReportUpload: React.FC<ReportUploadProps> = ({ patientId, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pipeline, setPipeline] = useState<Pipeline>('lab')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setFileUrl(null)
    setConfirmed(false)
    setError(null)

    setUploading(true)
    try {
      const path = `${patientId}/${Date.now()}-${f.name}`
      const { error: uploadErr } = await supabase.storage
        .from('reports')
        .upload(path, f, { contentType: f.type })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('reports').getPublicUrl(path)
      setFileUrl(urlData.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = () => {
    if (!fileUrl) return
    setConfirmed(true)
    onUploadComplete(fileUrl, pipeline)
  }

  const handleReset = () => {
    setFile(null)
    setFileUrl(null)
    setConfirmed(false)
    setError(null)
    setPipeline('lab')
  }

  return (
    <Card>
      <h3 className="font-semibold text-gray-800 mb-3">Upload Report</h3>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Drop zone */}
      {!file && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-brand-teal transition"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm font-medium">Tap to upload report</span>
          <span className="text-xs">PDF or image · max 20 MB</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Uploading spinner */}
      {uploading && (
        <div className="flex items-center gap-2 py-3 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          Uploading…
        </div>
      )}

      {/* File ready — pick pipeline */}
      {fileUrl && !confirmed && (
        <div className="mt-1 space-y-4">
          {/* File name row */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-teal-light rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{file?.name}</p>
              <p className="text-xs text-gray-400">{file ? (file.size / 1024).toFixed(0) + ' KB' : ''} · uploaded</p>
            </div>
            <button type="button" onClick={handleReset} className="text-gray-300 hover:text-red-400 p-1">
              ✕
            </button>
          </div>

          {/* Pipeline selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">What type of report is this?</p>
            <div className="space-y-2">
              {PIPELINE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    pipeline === opt.value
                      ? 'border-brand-teal bg-brand-teal-light'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="pipeline"
                    value={opt.value}
                    checked={pipeline === opt.value}
                    onChange={() => setPipeline(opt.value)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.hint}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-brand-teal text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-teal-dark transition"
          >
            Process Report
          </button>
        </div>
      )}

      {/* Done */}
      {confirmed && (
        <div className="mt-3 flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium">Report sent for processing…</p>
        </div>
      )}
    </Card>
  )
}

export default ReportUpload
