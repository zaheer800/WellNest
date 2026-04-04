import React from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

export default function DietScreen() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <PageWrapper title="Diet">
      <div className="px-4 pt-4 space-y-4">
        <Card>
          <div className="text-center py-10 text-gray-400">
            <p className="text-2xl mb-2">🍽️</p>
            <p className="font-medium">Diet Compliance Tracking</p>
            <p className="text-xs mt-2">Coming soon</p>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
