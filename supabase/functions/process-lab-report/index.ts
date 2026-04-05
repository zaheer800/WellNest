import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY')! })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessLabReportBody {
  report_id: string
  file_url?: string
  raw_text?: string
  age?: number
  gender?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: ProcessLabReportBody = await req.json()

    if (!body.report_id) {
      return new Response(
        JSON.stringify({ error: 'report_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.file_url && !body.raw_text) {
      return new Response(
        JSON.stringify({ error: 'Either file_url or raw_text must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let text: string

    if (body.raw_text) {
      text = body.raw_text
    } else {
      const fileResponse = await fetch(body.file_url!)
      if (!fileResponse.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch file: ${fileResponse.statusText}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      text = await fileResponse.text()
    }

    const prompt = `You are a medical lab report parser.
Extract all numeric parameters from this report.

For each parameter return an object in this exact shape:
{
  "parameter_name": string,
  "value": number,
  "unit": string,
  "reference_min": number | null,
  "reference_max": number | null,
  "status": "normal" | "borderline_low" | "borderline_high" |
            "abnormal_low" | "abnormal_high" |
            "critical_low" | "critical_high",
  "plain_language": string,
  "category": "kidney" | "liver" | "blood" | "lipids" |
              "diabetes" | "thyroid" | "vitamins" | "cardiac" |
              "electrolytes" | "urine" | "hormones" | "other"
}

Status rules:
- normal: within reference range
- borderline_low / borderline_high: within 10% of the limit
- abnormal_low / abnormal_high: outside range but not critical
- critical_low / critical_high: dangerously outside range
  (e.g. sodium < 125, potassium > 6.5, glucose < 50)

plain_language: one sentence in simple non-clinical English
  explaining what this value means for the patient.

parameter_name: use the standardised English name
  (e.g. "Creatinine", "eGFR", "Vitamin D", "Hemoglobin").

Patient context: Age ${body.age ?? 'unknown'}, Gender ${body.gender ?? 'unknown'}
Return a JSON array only. No preamble, no explanation.

Report text:
${text}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

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

    const parameters = JSON.parse(jsonMatch[1])

    return new Response(
      JSON.stringify({ report_id: body.report_id, parameters }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
