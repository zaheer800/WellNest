import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DetectReportTypeBody {
  file_url: string
  raw_text?: string
}

interface DetectReportTypeResult {
  detected_type: string
  detection_confidence: number
  suggested_label: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: DetectReportTypeBody = await req.json()

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
      const fileResponse = await fetch(body.file_url)
      if (!fileResponse.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch file from URL: ${fileResponse.statusText}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      text = await fileResponse.text()
    }

    const { age, gender } = body as { file_url?: string; raw_text?: string; age?: number; gender?: string }

    const prompt = `You are a medical report type detector.
Identify what type of medical report this is.

Return JSON only — no other text:
{
  "detected_type": string,
  "confidence": number,
  "key_indicators": string[],
  "suggested_label": string,
  "pipeline": "lab" | "imaging"
}

Valid detected_type values:
"blood_test", "urine_analysis", "mri_lumbar", "mri_cervical",
"mri_thoracic", "mri_whole_spine", "mri_brain", "mri_joint",
"ct_scan", "ultrasound_abdomen", "ultrasound_pelvis",
"xray_chest", "xray_spine", "echo_cardiac", "ecg",
"endoscopy_upper_gi", "endoscopy_lower_gi", "uroflowmetry",
"ncs_emg", "dexa", "other_lab", "other_imaging"

confidence: 0.0 to 1.0 — how certain you are.
key_indicators: 2–5 words or phrases that led to your decision.
suggested_label: human-readable label e.g. "MRI Lumbar Spine — March 2026".
pipeline: "lab" if the report contains numeric values to extract;
          "imaging" if the report contains descriptive findings.

Patient context: Age ${age ?? 'unknown'}, Gender ${gender ?? 'unknown'}

Report text:
${text}`

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

    // Extract JSON from the response — Claude may wrap it in markdown code fences
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\{[\s\S]*\})/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const parsed = JSON.parse(jsonMatch[1])

    // Normalise response — Claude returns `confidence`, DB expects `detection_confidence`
    const result: DetectReportTypeResult = {
      detected_type: parsed.detected_type,
      detection_confidence: parsed.confidence ?? parsed.detection_confidence ?? 0,
      suggested_label: parsed.suggested_label,
    }

    return new Response(JSON.stringify({ ...parsed, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
