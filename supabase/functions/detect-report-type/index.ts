import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY')! })

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

    const prompt = `You are a medical report classifier. Analyse this medical report text and determine its type. Return JSON with: detected_type (one of: lab_blood, lab_urine, mri, ct, ultrasound, ncs, xray, ecg, echo, other), detection_confidence (0-1), suggested_label (short human-readable label). Report text: ${text}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
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

    // Extract JSON from the response — Claude may wrap it in markdown code fences
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\{[\s\S]*\})/)

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Claude response', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result: DetectReportTypeResult = JSON.parse(jsonMatch[1])

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
