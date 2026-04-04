import React from 'react'
import type { VisitPreparation as VisitPreparationType } from '@/types/appointment.types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface VisitPreparationProps {
  preparation: VisitPreparationType | null
  loading: boolean
  onGenerate: () => void
}

function Section({ title, icon, items, numbered }: {
  title: string
  icon: string
  items: string[]
  numbered?: boolean
}) {
  if (items.length === 0) return null
  return (
    <Card padding="sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {icon} {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="flex-shrink-0 text-indigo-400 font-medium mt-0.5">
              {numbered ? `${i + 1}.` : '•'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function SkeletonSection() {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  )
}

const VisitPreparation: React.FC<VisitPreparationProps> = ({ preparation, loading, onGenerate }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <SkeletonSection key={i} />)}
      </div>
    )
  }

  if (!preparation) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-4xl">📋</p>
        <p className="text-sm text-gray-500">Your AI-powered visit preparation guide will appear here.</p>
        <p className="text-xs text-gray-400">It analyses your recent reports, symptoms, and medications to prepare you for the consultation.</p>
        <Button variant="primary" onClick={onGenerate}>
          Generate Preparation Guide
        </Button>
      </div>
    )
  }

  const reportsToCarry = (preparation.reports_to_carry as Array<{ name?: string; date?: string; is_new?: boolean }>)
    .map((r) => `${r.name ?? 'Report'}${r.date ? ` — ${r.date}` : ''}${r.is_new ? ' (NEW)' : ''}`)

  const symptomsToMention = (preparation.symptoms_to_mention as Array<{ symptom?: string; onset?: string; severity?: number; notes?: string }>)
    .map((s) => `${s.symptom ?? 'Symptom'}${s.onset ? ` (started ${s.onset})` : ''}${s.severity ? ` — severity ${s.severity}/10` : ''}`)

  const questionsToAsk = (preparation.questions_to_ask as string[])

  const whatDoctorWillCheck = (preparation.what_doctor_will_check as string[])

  const medicationsToDiscuss = (preparation.medications_to_discuss as Array<{ medication?: string; concern?: string }>)
    .map((m) => `${m.medication ?? 'Medication'}${m.concern ? ` — ${m.concern}` : ''}`)

  return (
    <div className="space-y-3">
      <Section title="Reports to Carry" icon="📄" items={reportsToCarry} />
      <Section title="Symptoms to Mention" icon="💬" items={symptomsToMention} />
      <Section title="Questions to Ask" icon="❓" items={questionsToAsk} numbered />
      <Section title="What the Doctor Will Check" icon="🔍" items={whatDoctorWillCheck} />
      <Section title="Medications to Discuss" icon="💊" items={medicationsToDiscuss} />

      {!preparation.viewed_by_patient && (
        <p className="text-xs text-center text-gray-400">Generated {new Date(preparation.generated_at).toLocaleDateString()}</p>
      )}
    </div>
  )
}

export default VisitPreparation
