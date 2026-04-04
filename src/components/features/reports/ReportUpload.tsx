import React, { useState, useRef } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ReportTypeDetector from './ReportTypeDetector'
import { detectReportType } from '@/services/reportTypeDetector'
import { supabase } from '@/services/supabase'

interface DetectionResult {
  detected_type: string
  detection_confidence: number
  suggested_label: string
}

interface ReportUploadProps {
  patientId: string
  onUploadComplete: (fileUrl: string, reportType: string) => void
}

const ReportUpload: React.FC<ReportUploadProps> = ({ patientId, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectionResult | null>(null)
  const [confirmedType, setConfirmedType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setDetected(null)
    setConfirmedType(null)
    setError(null)

    // Upload to Supabase Storage
    setUploading(true)
    try {
      const path = `${patientId}/${Date.now()}-${f.name}`
      const { error: uploadErr } = await supabase.storage
        .from('reports')
        .upload(path, f, { contentType: f.type })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('reports').getPublicUrl(path)
      const fileUrl = urlData.publicUrl

      // Auto-detect report type
      setDetecting(true)
      const result = await detectReportType(fileUrl)
      setDetected({ ...result, detected_type: result.detected_type, detection_confidence: result.detection_confidence, suggested_label: result.suggested_label })

      // Store fileUrl for later
      sessionStorage.setItem('pending_report_url', fileUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setDetecting(false)
    }
  }

  const handleConfirm = (type: string) => {
    setConfirmedType(type)
    const fileUrl = sessionStorage.getItem('pending_report_url') ?? ''
    onUploadComplete(fileUrl, type)
  }

  return (
    <Card>
      <h3 className="font-semibold text-gray-800 mb-3">Upload Report</h3>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* File drop zone */}
      {!file && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm font-medium">Tap to upload report</span>
          <span className="text-xs">PDF or image (JPG, PNG)</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File selected */}
      {file && !uploading && (
        <div className="flex items-center gap-3 py-2">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => { setFile(null); setDetected(null); setConfirmedType(null) }}
            className="text-gray-300 hover:text-red-400 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 py-3 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Uploading…
        </div>
      )}

      {/* Type detection */}
      {(detecting || detected) && !confirmedType && (
        <div className="mt-3">
          <ReportTypeDetector
            detected={detected}
            onConfirm={handleConfirm}
            onOverride={handleConfirm}
            loading={detecting}
          />
        </div>
      )}

      {confirmedType && (
        <div className="mt-3 flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium">Report ready for processing</p>
        </div>
      )}
    </Card>
  )
}

export default ReportUpload
