import React, { useEffect, useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { useReportStore } from '@/store/reportStore'
import ReportUpload from '@/components/features/reports/ReportUpload'
import LabReportView from '@/components/features/reports/LabParameterView'
import ImagingReportView from '@/components/features/reports/ImagingFindingView'
import CriticalValueAlert from '@/components/features/reports/CriticalValueAlert'
import WholeSpineMap from '@/components/features/reports/WholeSpineMap'
import { getReportDownloadUrl } from '@/services/supabase'
import { Download } from 'lucide-react'

export default function ReportsScreen() {
  const { user } = useAuthStore()
  const {
    labReports,
    imagingReports,
    selectedReport,
    selectedParameters,
    selectedFindings,
    criticalParameters,
    loading,
    processingStatus,
    processingError,
    fetchLabReports,
    fetchImagingReports,
    processReport,
    selectReport,
    fetchReportDetails,
    clearProcessingState,
  } = useReportStore()

  const [viewMode, setViewMode] = useState<'upload' | 'lab' | 'imaging'>('upload')
  const [acknowledgedCriticals, setAcknowledgedCriticals] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user?.id) return
    fetchLabReports(user.id)
    fetchImagingReports(user.id)
  }, [user?.id])

  if (!user) return null

  const getUserAge = () => {
    if (!user.date_of_birth) return undefined
    const dob = new Date(user.date_of_birth)
    return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  }

  const handleUploadComplete = (fileUrl: string, pipeline: 'lab' | 'imaging', filePath: string) => {
    clearProcessingState()
    processReport(user.id, fileUrl, pipeline, getUserAge(), user.gender ?? undefined, filePath)
    setViewMode(pipeline === 'lab' ? 'lab' : 'imaging')
  }

  const handleDownload = async (filePath: string, filename: string) => {
    try {
      const url = await getReportDownloadUrl(filePath)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      // fallback — open in new tab
      window.open(await getReportDownloadUrl(filePath), '_blank', 'noopener,noreferrer')
    }
  }

  const handleSelectReport = async (report: any, pipeline: 'lab' | 'imaging') => {
    selectReport(report)
    await fetchReportDetails(report.id, pipeline)
  }

  const isSpinalReport = (report: any) =>
    report?.detected_type?.startsWith('mri') ||
    report?.imaging_type?.startsWith('mri') ||
    report?.detected_type === 'xray_spine'

  return (
    <PageWrapper title="Reports">
      <div className="space-y-4">

        {/* Critical alerts — always visible */}
        {criticalParameters.length > 0 && (
          <div className="space-y-2">
            {criticalParameters.map((p: any) => (
              <CriticalValueAlert
                key={p.name}
                parameter={p}
                acknowledged={acknowledgedCriticals.has(p.name)}
                onAcknowledge={() =>
                  setAcknowledgedCriticals((prev) => new Set([...prev, p.name]))
                }
              />
            ))}
          </div>
        )}

        {/* Processing banner */}
        {processingStatus === 'processing' && (
          <div className="flex items-center gap-3 bg-brand-teal-light border border-indigo-100 rounded-2xl px-4 py-3">
            <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Analysing your report…</p>
              <p className="text-xs text-brand-teal mt-0.5">This takes 20–40 seconds. You can browse other screens.</p>
            </div>
          </div>
        )}

        {processingStatus === 'rate_limited' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <p className="text-sm font-semibold text-amber-700">Please wait a moment</p>
            <p className="text-xs text-amber-600 mt-0.5">{processingError}</p>
          </div>
        )}

        {processingStatus === 'failed' && processingError && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex justify-between items-start gap-3">
            <div>
              <p className="text-sm font-semibold text-red-700">Processing failed</p>
              <p className="text-xs text-red-600 mt-0.5">{processingError}</p>
            </div>
            <button
              onClick={clearProcessingState}
              className="text-red-300 hover:text-red-500 text-lg leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {processingStatus === 'completed' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold text-green-700">Report processed successfully</p>
            <button onClick={clearProcessingState} className="ml-auto text-green-300 hover:text-green-500 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Tab selector */}
        <div className="flex gap-2 border-b border-gray-200">
          {([
            { key: 'upload', label: 'Upload' },
            { key: 'lab', label: `Lab ${labReports.length > 0 ? `(${labReports.length})` : ''}` },
            { key: 'imaging', label: `Imaging ${imagingReports.length > 0 ? `(${imagingReports.length})` : ''}` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                viewMode === tab.key
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload */}
        {viewMode === 'upload' && (
          <ReportUpload patientId={user.id} onUploadComplete={handleUploadComplete} />
        )}

        {/* Lab results */}
        {viewMode === 'lab' && (
          <div className="space-y-4">
            {loading && (
              <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
            )}
            {!loading && labReports.length === 0 && (
              <Card className="text-center py-12">
                <p className="text-gray-500 text-sm">No lab reports yet.</p>
                <button
                  onClick={() => setViewMode('upload')}
                  className="mt-3 text-sm text-brand-teal font-medium"
                >
                  Upload one now
                </button>
              </Card>
            )}
            {labReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => handleSelectReport(report, 'lab')}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-gray-800">
                      {report.ai_summary || report.detected_type || 'Lab Report'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.report_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {report.anomaly_count > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {report.anomaly_count} abnormal
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      report.processing_status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : report.processing_status === 'failed'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {report.processing_status}
                    </span>
                  </div>
                </div>
                {report.file_path && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(report.file_path, report.ai_summary || 'lab-report') }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-brand-teal font-medium hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download original file
                  </button>
                )}
              </Card>
            ))}

            {selectedReport && selectedParameters.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">Parameters</h3>
                <div className="space-y-3">
                  {selectedParameters.map((p: any) => (
                    <LabReportView key={p.id} parameter={p} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Imaging */}
        {viewMode === 'imaging' && (
          <div className="space-y-4">
            {loading && (
              <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
            )}
            {!loading && imagingReports.length === 0 && (
              <Card className="text-center py-12">
                <p className="text-gray-500 text-sm">No imaging reports yet.</p>
                <button
                  onClick={() => setViewMode('upload')}
                  className="mt-3 text-sm text-brand-teal font-medium"
                >
                  Upload one now
                </button>
              </Card>
            )}
            {imagingReports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-md transition">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => handleSelectReport(report, 'imaging')}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-gray-800">
                      {report.ai_summary
                        ? report.ai_summary.slice(0, 60) + (report.ai_summary.length > 60 ? '…' : '')
                        : report.imaging_type || 'Imaging Report'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.report_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {report.body_region ? ` · ${report.body_region}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {report.surgical_urgency && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse font-semibold">
                        ⚠️ Urgent
                      </span>
                    )}
                    {report.abnormal_findings?.length > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {report.abnormal_findings.length} findings
                      </span>
                    )}
                  </div>
                </div>
                {report.file_path && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(report.file_path, report.ai_summary || 'imaging-report') }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-brand-teal font-medium hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download original file
                  </button>
                )}
              </Card>
            ))}

            {selectedReport && (
              <>
                {selectedFindings.length > 0 && (
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-3">Findings</h3>
                    <div className="space-y-3">
                      {selectedFindings.map((f: any) => (
                        <ImagingReportView key={f.id} finding={f} />
                      ))}
                    </div>
                  </Card>
                )}
                {isSpinalReport(selectedReport) && (
                  <WholeSpineMap patientId={user.id} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
