import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateVisitPreparationBody {
  appointment_id: string
  patient_id: string
}

interface ReportSummary {
  name: string
  date: string
  is_new: boolean
}

interface SymptomEntry {
  symptom: string
  onset: string
  severity: string
  notes: string
}

interface MedicationConcern {
  medication: string
  concern: string
}

interface VisitPreparation {
  reports_to_carry: ReportSummary[]
  symptoms_to_mention: SymptomEntry[]
  questions_to_ask: string[]
  what_doctor_will_check: string[]
  medications_to_discuss: MedicationConcern[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: GenerateVisitPreparationBody = await req.json()

    if (!body.appointment_id || !body.patient_id) {
      return new Response(
        JSON.stringify({ error: 'appointment_id and patient_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch all required data in parallel
    const [
      appointmentResult,
      labReportsResult,
      imagingReportsResult,
      symptomLogsResult,
      medicationsResult,
      restrictionsResult,
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('id', body.appointment_id)
        .eq('patient_id', body.patient_id)
        .single(),

      supabase
        .from('lab_reports')
        .select('id, created_at, name, type')
        .eq('patient_id', body.patient_id)
        .order('created_at', { ascending: false })
        .limit(3),

      supabase
        .from('imaging_reports')
        .select('id, created_at, name, modality')
        .eq('patient_id', body.patient_id)
        .order('created_at', { ascending: false })
        .limit(3),

      supabase
        .from('symptom_logs')
        .select('symptom, onset, severity, notes, logged_at')
        .eq('patient_id', body.patient_id)
        .order('logged_at', { ascending: false })
        .limit(30),

      supabase
        .from('medications')
        .select('name, dosage, frequency, purpose')
        .eq('patient_id', body.patient_id)
        .eq('is_active', true),

      supabase
        .from('activity_restrictions')
        .select('activity, restriction_level, notes')
        .eq('patient_id', body.patient_id)
        .eq('is_active', true),
    ])

    const appointment = appointmentResult.data
    const recentLabReports = labReportsResult.data ?? []
    const recentImagingReports = imagingReportsResult.data ?? []
    const symptoms = symptomLogsResult.data ?? []
    const medications = medicationsResult.data ?? []
    const restrictions = restrictionsResult.data ?? []

    const recentReports = [
      ...recentLabReports.map((r) => ({ ...r, report_category: 'lab' })),
      ...recentImagingReports.map((r) => ({ ...r, report_category: 'imaging' })),
    ]

    const prompt = `You are preparing a patient for their doctor visit. Based on the following health data, generate a visit preparation guide. Return JSON with: reports_to_carry (array of {name, date, is_new}), symptoms_to_mention (array of {symptom, onset, severity, notes}), questions_to_ask (array of strings), what_doctor_will_check (array of strings), medications_to_discuss (array of {medication, concern}). Health data: ${JSON.stringify({ appointment, recentReports, symptoms, medications, restrictions })}`

    const apiKey = Deno.env.get('CLAUDE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'CLAUDE_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const anthropic = new Anthropic({ apiKey })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    // Extract JSON from the response
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\{[\s\S]*\})/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const visitPreparation: VisitPreparation = JSON.parse(jsonMatch[1])

    return new Response(JSON.stringify(visitPreparation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
