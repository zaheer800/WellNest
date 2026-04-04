import React, { useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export default function DoctorScreen() {
  const { user } = useAuthStore()
  const [doctors, setDoctors] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  if (!user) return null

  return (
    <PageWrapper title="Doctor Access">
      <div className="space-y-4">
        {/* Add doctor section */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">My Doctors</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-indigo-500 hover:text-indigo-600 text-sm font-medium"
            >
              {showAddForm ? 'Cancel' : 'Add Doctor'}
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Doctor name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Select specialty...</option>
                <option>Nephrology</option>
                <option>Urology</option>
                <option>Neurology</option>
                <option>Spine</option>
                <option>Cardiology</option>
                <option>General</option>
                <option>Other</option>
              </select>
              <input
                type="email"
                placeholder="doctor@hospital.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 px-3 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition"
                >
                  Add Doctor
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Doctor list */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Doctor List</h3>
          {doctors.length === 0 ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No doctors added yet</p>
              <p className="text-xs text-gray-400 mt-2">Add your doctors to share your health data with them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor: any) => (
                <div key={doctor.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{doctor.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{doctor.specialty}</p>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-xs font-medium">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Doctor access levels */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">What Do Doctors See?</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="font-medium text-gray-700 text-sm">Clinical Data Shared:</p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Lab results with reference ranges</li>
                <li>Imaging reports and findings</li>
                <li>Medication list and compliance</li>
                <li>Symptom history with severity</li>
                <li>Activity restrictions and capabilities</li>
                <li>Doctor notes from past visits</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="font-medium text-gray-700 text-sm">What They Can Do:</p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Add clinical notes</li>
                <li>Set health targets</li>
                <li>Prescribe restrictions</li>
                <li>View patient timeline</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Specialty-specific views */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Specialty Views</h3>
          <p className="text-xs text-gray-600 mb-3">
            Each specialty has a customized view focused on relevant clinical data:
          </p>
          <div className="space-y-2">
            {[
              { specialty: 'Nephrology', focus: 'Kidney function, electrolytes, fluid intake' },
              { specialty: 'Urology', focus: 'Urinary logs, urine color, uroflow studies' },
              { specialty: 'Neurology', focus: 'Nerve conduction studies, symptom progression' },
              { specialty: 'Spine', focus: 'Spine imaging, activity restrictions, pain logs' },
              { specialty: 'Cardiology', focus: 'Lipids, cardiac markers, blood pressure' },
            ].map((item) => (
              <div key={item.specialty} className="text-sm py-2 border-b border-gray-100 last:border-0">
                <p className="font-medium text-gray-700">{item.specialty}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.focus}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
