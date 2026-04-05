import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LabParameter {
  name: string
  value: string | number
  status: string
  unit: string
  reference_min?: number
  reference_max?: number
}

interface EnrichedCriticalParameter {
  name: string
  status: string
  value: string | number
  action: string
  urgency: 'monitor' | 'contact_doctor_today' | 'emergency'
}

interface CheckCriticalValuesBody {
  patient_id: string
  report_id: string
  parameters: LabParameter[]
}

interface CheckCriticalValuesResult {
  critical_found: boolean
  critical_parameters: EnrichedCriticalParameter[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: CheckCriticalValuesBody = await req.json()

    if (!body.parameters || !Array.isArray(body.parameters)) {
      return new Response(
        JSON.stringify({ error: 'parameters must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const criticals = body.parameters.filter(
      (p) => p.status === 'critical_low' || p.status === 'critical_high'
    )

    if (criticals.length === 0) {
      const result: CheckCriticalValuesResult = {
        critical_found: false,
        critical_parameters: [],
      }
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prompt = `You are a clinical decision support system. For each critical lab value, provide the appropriate action. Patient has these critical values: ${JSON.stringify(criticals)}. Return JSON array where each item has: name, status, value, action (what patient should do in plain language), urgency ('monitor'|'contact_doctor_today'|'emergency')`

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
        max_tokens: 512,
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

    // Extract JSON array from the response
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\[[\s\S]*\])/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const enrichedCriticals: EnrichedCriticalParameter[] = JSON.parse(jsonMatch[1])

    const result: CheckCriticalValuesResult = {
      critical_found: true,
      critical_parameters: enrichedCriticals,
    }

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
