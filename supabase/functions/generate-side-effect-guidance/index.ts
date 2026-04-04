import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY')! })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SideEffectGuidanceBody {
  medication_name: string
  side_effect: string
  severity: string
  source: 'experienced' | 'read_about'
  patient_conditions?: string[]
}

interface SideEffectGuidanceResult {
  guidance: string
  action: 'continue' | 'monitor' | 'contact_doctor' | 'stop_immediately'
  is_expected: boolean
  personalised_context: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: SideEffectGuidanceBody = await req.json()

    const { medication_name, side_effect, severity, source, patient_conditions = [] } = body

    if (!medication_name || !side_effect || !severity || !source) {
      return new Response(
        JSON.stringify({ error: 'medication_name, side_effect, severity, and source are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const experiencingText = source === 'experienced'
      ? 'is currently experiencing'
      : 'has read about and is concerned about'

    const conditionsText = patient_conditions.length > 0
      ? `Patient's known conditions: ${patient_conditions.join(', ')}.`
      : ''

    const prompt = `You are a medication safety advisor helping a patient understand a side effect.

A patient ${experiencingText} the side effect "${side_effect}" (severity: ${severity}) from medication "${medication_name}". ${conditionsText}

Provide clear, reassuring but accurate guidance. Return a JSON object with exactly these fields:
- guidance: string — plain language explanation of this side effect and what it means
- action: one of "continue" | "monitor" | "contact_doctor" | "stop_immediately"
- is_expected: boolean — whether this is a known/common side effect of this medication
- personalised_context: string — any specific considerations given their conditions (or general context if no conditions provided)

Be empathetic, clear, and actionable. Do not be alarmist unless genuinely warranted.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    const jsonMatch =
      responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\{[\s\S]*\})/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const result: SideEffectGuidanceResult = JSON.parse(jsonMatch[1])

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
