import React, { useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export default function ImagingScreen() {
  const { user } = useAuthStore()
  const [imagingReports, setImagingReports] = useState<any[]>([])

  if (!user) return null

  return (
    <PageWrapper title="Imaging">
      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Imaging Reports</h3>
          <p className="text-xs text-gray-600 mb-4">
            Upload imaging reports (MRI, CT, Ultrasound, X-Ray, NCS) to extract findings and track changes over time.
          </p>

          {imagingReports.length === 0 ? (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No imaging reports yet</p>
              <p className="text-xs text-gray-400 mt-2">Upload your first imaging report to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {imagingReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{report.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    {report.findings_count && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {report.findings_count} findings
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Spine Mapping (for spinal imaging)</h3>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">Upload an MRI or similar spine imaging to see your spine visualization</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Common Imaging Types</h3>
          <div className="space-y-2">
            {[
              { type: 'MRI', desc: 'Magnetic Resonance Imaging' },
              { type: 'CT', desc: 'Computed Tomography' },
              { type: 'Ultrasound', desc: 'Ultrasound Imaging' },
              { type: 'X-Ray', desc: 'X-Ray Imaging' },
              { type: 'NCS/EMG', desc: 'Nerve Conduction Study' },
            ].map((item) => (
              <div key={item.type} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                <span className="font-medium text-gray-700">{item.type}</span>
                <span className="text-xs text-gray-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
