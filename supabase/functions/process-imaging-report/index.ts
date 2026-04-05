import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessImagingReportBody {
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
    const body: ProcessImagingReportBody = await req.json()

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

    const prompt = `You are a medical imaging report parser.
First identify the report type, then extract all findings.

Return a single JSON object in this exact shape — no other text:
{
  "detected_type": string,
  "detection_confidence": number,
  "suggested_label": string,
  "imaging_type": string,
  "body_region": string,
  "normal_findings": string[],
  "abnormal_findings": [
    {
      "location": string,
      "spinal_level": string | null,
      "spinal_region": "cervical" | "thoracic" | "lumbar" | "sacral" | null,
      "finding_type": string,
      "severity": "mild" | "moderate" | "severe",
      "laterality": "left" | "right" | "bilateral" | "central" | "not_applicable",
      "description": string,
      "plain_language": string,
      "nerves_affected": string[],
      "linked_symptoms": string[],
      "surgical_urgency": boolean
    }
  ],
  "critical_findings": string[],
  "surgical_urgency": boolean,
  "follow_up_recommended": boolean,
  "follow_up_timeline": string | null,
  "overall_summary": string
}

detected_type: one of "mri_lumbar", "mri_cervical", "mri_thoracic", "mri_whole_spine",
  "mri_brain", "mri_joint", "ct_scan", "ultrasound_abdomen", "ultrasound_pelvis",
  "xray_chest", "xray_spine", "echo_cardiac", "ecg", "endoscopy_upper_gi",
  "endoscopy_lower_gi", "uroflowmetry", "ncs_emg", "dexa", "other_imaging"
detection_confidence: 0.0 to 1.0
suggested_label: human-readable label e.g. "MRI Lumbar Spine — March 2026"

spinal_level: use standard notation e.g. "L4-L5", "C5-C6", "D8-D9".
  Null if not a spinal finding.
finding_type: short descriptor e.g. "disc_bulge", "disc_protrusion",
  "nerve_compression", "osteophyte", "facet_arthrosis", "polyp", "cyst",
  "fatty_liver", "hiatus_hernia", "cord_compression", "schmorls_node".
description: radiologist's exact words from the report.
plain_language: one sentence in simple non-clinical English.
nerves_affected: list nerve levels e.g. ["L4", "L5", "S1"].
linked_symptoms: list symptoms this finding may cause
  e.g. ["leg_pain", "urinary_frequency", "numbness", "back_pain"].
surgical_urgency: true only if report contains language such as
  "cauda equina", "cord compression with signal change",
  "complete canal stenosis", "malignant", "metastasis", "urgent surgical".
overall_summary: 2–3 sentences plain-language summary for the patient.

Patient context: Age ${body.age ?? 'unknown'}, Gender ${body.gender ?? 'unknown'}
Return JSON only. No preamble, no explanation.

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
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
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
      responseText.match(/(\{[\s\S]*\})/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: any
    try {
      result = JSON.parse(jsonMatch[1])
    } catch {
      return new Response(
        JSON.stringify({ error: 'JSON parse failed', raw: jsonMatch[1].slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ report_id: body.report_id, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
