import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthContext {
  health_score?: number
  medication_compliance?: number
  water_pct?: number
  streak_days?: number
  trend?: 'improving' | 'stable' | 'declining'
  name?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const context: HealthContext = await req.json()

    const scoreLine = context.health_score != null
      ? `Health score today: ${context.health_score}/100.` : ''
    const medLine = context.medication_compliance != null
      ? `Medication compliance: ${context.medication_compliance}%.` : ''
    const waterLine = context.water_pct != null
      ? `Water intake: ${context.water_pct}% of daily goal.` : ''
    const streakLine = context.streak_days != null && context.streak_days > 0
      ? `Current streak: ${context.streak_days} days.` : ''
    const trendLine = context.trend ? `Overall trend: ${context.trend}.` : ''

    const prompt = `You are a warm, empathetic health companion for a patient managing a chronic condition.
Based on their health data below, write ONE short motivational message (2-3 sentences max).
Be specific to their data — mention what they're doing well. Be warm, not clinical.
Do not use hashtags, bullet points, or markdown. Plain text only.

Patient name: ${context.name ?? 'friend'}
${[scoreLine, medLine, waterLine, streakLine, trendLine].filter(Boolean).join('\n')}

Write the message directly, no preamble.`

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
        max_tokens: 200,
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

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    return new Response(
      JSON.stringify({ message: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
