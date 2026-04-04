import React, { useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

export default function ConditionsScreen() {
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')

  if (!user) return null

  return (
    <PageWrapper title="Conditions">
      <div className="space-y-4">
        {/* View mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              viewMode === 'graph'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Connection Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Condition List
          </button>
        </div>

        {viewMode === 'graph' && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4">Condition Connections</h3>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-12 text-center">
              <p className="text-gray-500 text-sm">Upload medical reports to see how your conditions and symptoms connect.</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              WellNest will analyze your lab results, imaging findings, and symptom history to identify relationships between your health conditions.
            </p>
          </Card>
        )}

        {viewMode === 'list' && (
          <>
            <Card>
              <h3 className="font-semibold text-gray-800 mb-4">Active Conditions</h3>
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm">No conditions identified yet. Your conditions will appear here as you share medical reports.</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-800 mb-4">Related Findings</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-medium text-gray-700 text-sm">Lab Abnormalities</p>
                  <p className="text-xs text-gray-500 mt-2">No abnormal lab values yet</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-medium text-gray-700 text-sm">Imaging Findings</p>
                  <p className="text-xs text-gray-500 mt-2">No imaging reports yet</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-medium text-gray-700 text-sm">Symptoms</p>
                  <p className="text-xs text-gray-500 mt-2">No symptoms logged yet</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
