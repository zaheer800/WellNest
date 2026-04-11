/**
 * get-medical-id Edge Function
 *
 * Public endpoint — no auth required.
 * Accepts: GET /functions/v1/get-medical-id?token=<uuid>
 * Returns: JSON medical ID data or 404.
 *
 * The token is a permanent per-user UUID. It acts like a physical
 * medical alert card — anyone who has it can read the data.
 * No PHI beyond what the patient explicitly chose to share.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url    = new URL(req.url)
    const token  = url.searchParams.get('token')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(token)) {
      return new Response(
        JSON.stringify({ error: 'invalid token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service-role client so the SECURITY DEFINER RPC works correctly
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await supabase.rpc('get_medical_id_data', { p_token: token })

    if (error) {
      console.error('[get-medical-id] RPC error:', error.message)
      return new Response(
        JSON.stringify({ error: 'Failed to load medical ID' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Medical ID not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // Cache for 60s — short enough to reflect updates, long enough to survive slow networks
          'Cache-Control': 'public, max-age=60',
        },
      }
    )
  } catch (err) {
    console.error('[get-medical-id] Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
