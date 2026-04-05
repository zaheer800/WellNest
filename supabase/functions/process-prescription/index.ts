import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPrescriptionBody {
  file_url?: string
  raw_text?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: ProcessPrescriptionBody = await req.json()

    if (!body.file_url && !body.raw_text) {
      return new Response(
        JSON.stringify({ error: 'Either file_url or raw_text must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const apiKey = Deno.env.get('CLAUDE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'CLAUDE_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const anthropic = new Anthropic({ apiKey })

    let text: string

    if (body.raw_text) {
      text = body.raw_text
    } else {
      const fileResponse = await fetch(body.file_url!)
      if (!fileResponse.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch file: ${fileResponse.statusText}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
      // For images, pass as base64; for text/PDF, read as text
      const contentType = fileResponse.headers.get('content-type') ?? ''
      if (contentType.startsWith('image/')) {
        const buffer = await fileResponse.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: contentType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 },
              },
              { type: 'text', text: prescriptionPrompt() },
            ],
          }],
        })
        return buildResponse(message)
      } else {
        text = await fileResponse.text()
      }
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: `${prescriptionPrompt()}\n\nPrescription text:\n${text}` }],
    })

    return buildResponse(message)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

function prescriptionPrompt(): string {
  return `You are a prescription parser. Extract all medications from this prescription.

For each medication return an object in this exact shape:
{
  "name": string,
  "dose": string,
  "unit": string,
  "frequency": "daily" | "alternate_days" | "weekly",
  "notes": string
}

name: Generic or brand name of the medication.
dose: Numeric dose only e.g. "500", "10", "0.5".
unit: One of: "mg", "g", "ml", "IU", "mcg", "tablet", "capsule", "drop".
frequency: Map the prescribed frequency to the closest option:
  - Once daily / OD / 1-0-0 / 0-1-0 / 0-0-1 → "daily"
  - Every other day / alternate days / EOD → "alternate_days"
  - Once weekly / OW → "weekly"
  - If twice or three times daily → "daily" (note the timing in notes)
notes: Any additional instructions e.g. "Take with food", "Morning dose", "After meals", "1-0-1".
  Leave empty string if no special instructions.

Return a JSON array only. No preamble, no explanation.
If no medications can be identified, return an empty array [].`
}

function buildResponse(message: Anthropic.Message): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      JSON.stringify({ medications: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const medications = JSON.parse(jsonMatch[1])
    return new Response(
      JSON.stringify({ medications }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch {
    return new Response(
      JSON.stringify({ medications: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
}
