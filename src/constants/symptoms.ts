import type { SymptomCategory } from '@/types/health.types'

export interface SymptomEntry {
  name: string
  category: SymptomCategory
}

export const SymptomLibrary: SymptomEntry[] = [
  // Urinary
  { name: 'Urinary frequency', category: 'urinary' },
  { name: 'Urinary urgency', category: 'urinary' },
  { name: 'Nocturia', category: 'urinary' },
  { name: 'Burning urination', category: 'urinary' },
  { name: 'Incomplete bladder emptying', category: 'urinary' },
  { name: 'Weak urine stream', category: 'urinary' },
  { name: 'Urinary incontinence', category: 'urinary' },

  // Neurological
  { name: 'Numbness', category: 'neurological' },
  { name: 'Tingling / pins and needles', category: 'neurological' },
  { name: 'Muscle weakness', category: 'neurological' },
  { name: 'Balance issues', category: 'neurological' },
  { name: 'Falls', category: 'neurological' },
  { name: 'Memory problems', category: 'neurological' },
  { name: 'Headache', category: 'neurological' },
  { name: 'Brain fog', category: 'neurological' },

  // Spinal
  { name: 'Lower back pain', category: 'spinal' },
  { name: 'Upper back pain', category: 'spinal' },
  { name: 'Neck pain', category: 'spinal' },
  { name: 'Radiating leg pain (sciatica)', category: 'spinal' },
  { name: 'Morning stiffness', category: 'spinal' },
  { name: 'Pain on prolonged sitting', category: 'spinal' },

  // General
  { name: 'Fatigue', category: 'general' },
  { name: 'Dizziness', category: 'general' },
  { name: 'Nausea', category: 'general' },
  { name: 'Chest pain', category: 'general' },
  { name: 'Shortness of breath', category: 'general' },
  { name: 'Palpitations', category: 'general' },
  { name: 'Swelling in legs / ankles', category: 'general' },
  { name: 'Fever', category: 'general' },
  { name: 'Unintentional weight loss', category: 'general' },

  // Digestive
  { name: 'Heartburn / acid reflux', category: 'digestive' },
  { name: 'Bloating', category: 'digestive' },
  { name: 'Constipation', category: 'digestive' },
  { name: 'Diarrhea', category: 'digestive' },
  { name: 'Abdominal pain', category: 'digestive' },
]
