import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateConditionConnectionsBody {
  patient_id: string
  all_findings: object
  age?: number
  gender?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: GenerateConditionConnectionsBody = await req.json()

    if (!body.patient_id || !body.all_findings) {
      return new Response(
        JSON.stringify({ error: 'patient_id and all_findings are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are a medical knowledge engine.
Given a patient's health findings, identify meaningful
causal or correlational connections between them.

Patient findings:
${JSON.stringify(body.all_findings, null, 2)}

For each meaningful connection return:
{
  "source_condition": string,
  "source_label": string,
  "target_condition": string,
  "target_label": string,
  "connection_type": "causes" | "worsens" | "correlates" | "compounds",
  "plain_language": string,
  "evidence_source": "lab_report" | "imaging" | "symptom_pattern" | "clinical"
}

source_condition / target_condition: short code e.g. "low_b12",
  "l4_l5_disc_bulge", "peripheral_neuropathy", "urinary_frequency".
source_label / target_label: human-readable e.g. "Low Vitamin B12".
plain_language: one simple sentence e.g.
  "Low B12 damages the protective myelin sheath around nerves,
  slowing their conduction speed."

Only include connections that are clinically meaningful and
supported by the patient's actual findings.
Do not invent connections not supported by the data.

Patient context: Age ${body.age ?? 'unknown'}, Gender ${body.gender ?? 'unknown'}
Return a JSON array only. No preamble, no explanation.`

    const apiKey = Deno.env.get('CLAUDE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'CLAUDE_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const anthropic = new Anthropic({ apiKey })

    let message
    try {
      message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })
    } catch (apiError: any) {
      if (apiError?.status === 429) {
        return new Response(
          JSON.stringify({ error: 'RATE_LIMIT', message: 'Too many requests. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw apiError
    }

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    const jsonMatch =
      responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\[[\s\S]*\])/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const connections = JSON.parse(jsonMatch[1])

    return new Response(
      JSON.stringify({ patient_id: body.patient_id, connections }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
