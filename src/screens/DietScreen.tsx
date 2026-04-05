import React from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { Utensils } from 'lucide-react'

export default function DietScreen() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <PageWrapper title="Diet">
      <div className="px-4 pt-4 space-y-4">
        <Card>
          <div className="text-center py-10 text-gray-400 flex flex-col items-center">
            <Utensils className="w-10 h-10 mb-3 text-gray-300" />
            <p className="font-medium">Diet Compliance Tracking</p>
            <p className="text-xs mt-2">Coming soon</p>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
