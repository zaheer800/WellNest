import React, { useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export default function FamilyScreen() {
  const { user } = useAuthStore()
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')

  if (!user) return null

  return (
    <PageWrapper title="Family Circle">
      <div className="space-y-4">
        {/* Add family member section */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Invite Family</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-indigo-500 hover:text-indigo-600 text-sm font-medium"
            >
              {showAddForm ? 'Cancel' : 'Add Member'}
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="family@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // TODO: Invite family member
                    setNewMemberEmail('')
                    setShowAddForm(false)
                  }}
                  className="flex-1 py-2 px-3 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition"
                >
                  Send Invite
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Current family members */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Your Circle</h3>
          {familyMembers.length === 0 ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No family members invited yet</p>
              <p className="text-xs text-gray-400 mt-2">Invite family to support your journey and stay informed of your health</p>
            </div>
          ) : (
            <div className="space-y-3">
              {familyMembers.map((member: any) => (
                <div key={member.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{member.relationship}</p>
                      <p className="text-xs text-gray-400 mt-1">{member.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.accepted_at
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {member.accepted_at ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notifications to family */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">What Can They See?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Daily Health Score</p>
                <p className="text-xs text-gray-500 mt-0.5">Your overall health status and trends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Medication Compliance</p>
                <p className="text-xs text-gray-500 mt-0.5">Whether you're taking your medications on time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Critical Alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">When abnormal values are detected</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Detailed Reports</p>
                <p className="text-xs text-gray-500 mt-0.5">Full lab and imaging report data</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Family support messages */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Messages from Your Circle</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
              <p className="text-sm text-gray-700">"You've got this! Keep up the great work with your medications! 💪"</p>
              <p className="text-xs text-gray-500 mt-2">Mom • 2 days ago</p>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
