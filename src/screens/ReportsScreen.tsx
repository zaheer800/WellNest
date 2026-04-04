import React, { useEffect, useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useReportStore } from '@/store/reportStore'
import ReportUpload from '@/components/features/reports/ReportUpload'
import LabParameterView from '@/components/features/reports/LabParameterView'
import ImagingFindingView from '@/components/features/reports/ImagingFindingView'
import CriticalValueAlert from '@/components/features/reports/CriticalValueAlert'
import WholeSpineMap from '@/components/features/reports/WholeSpineMap'

export default function ReportsScreen() {
  const { user } = useAuthStore()
  const { labReports, imagingReports, selectedReport, loading } = useReportStore()
  const [viewMode, setViewMode] = useState<'upload' | 'lab' | 'imaging'>('upload')
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!user?.id) return
    // Fetch reports on mount
    // useReportStore.fetchLabReports(user.id)
    // useReportStore.fetchImagingReports(user.id)
  }, [user?.id])

  if (!user) return null

  return (
    <PageWrapper title="Reports">
      <div className="space-y-4">
        {/* Tab selector */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setViewMode('upload')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              viewMode === 'upload'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Upload Report
          </button>
          <button
            onClick={() => setViewMode('lab')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              viewMode === 'lab'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Lab Results {labReports.length > 0 && `(${labReports.length})`}
          </button>
          <button
            onClick={() => setViewMode('imaging')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              viewMode === 'imaging'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Imaging {imagingReports.length > 0 && `(${imagingReports.length})`}
          </button>
        </div>

        {/* Critical alerts section */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            {criticalAlerts.map((alert, idx) => (
              <CriticalValueAlert key={idx} parameter={alert} acknowledged={false} onAcknowledge={() => {}} />
            ))}
          </div>
        )}

        {/* Upload mode */}
        {viewMode === 'upload' && (
          <Card>
            <ReportUpload
              patientId={user.id}
              onUploadComplete={() => {
                // Handle upload completion
                // - Process lab or imaging based on reportType
                // - Update reports in store
                // - Check for critical values
              }}
            />
          </Card>
        )}

        {/* Lab results mode */}
        {viewMode === 'lab' && (
          <div className="space-y-4">
            {labReports.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 text-sm">No lab reports yet. Upload one to get started.</p>
              </Card>
            ) : (
              <>
                {/* Report list */}
                <div className="space-y-3">
                  {labReports.map((report) => (
                    <Card
                      key={report.id}
                      onClick={() => {
                        const reportStore = useReportStore()
                        reportStore.selectReport(report)
                      }}
                      className="cursor-pointer hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">Lab Report</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {report.id}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Selected report details */}
                {selectedReport && (
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-4">Report Details</h3>
                    <p className="text-sm text-gray-600">Lab report has been uploaded and processed.</p>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Imaging mode */}
        {viewMode === 'imaging' && (
          <div className="space-y-4">
            {imagingReports.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 text-sm">No imaging reports yet. Upload one to get started.</p>
              </Card>
            ) : (
              <>
                {/* Imaging list */}
                <div className="space-y-3">
                  {imagingReports.map((report: any) => (
                    <Card key={report.id} className="cursor-pointer hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{report.detected_type}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {report.finding_count && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            {report.finding_count} findings
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Spine map for spinal-specific reports */}
                {selectedReport?.id && (
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-4">Spine Map</h3>
                    <WholeSpineMap patientId={user.id} />
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
