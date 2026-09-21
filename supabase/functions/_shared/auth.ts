import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function forbidden(): Response {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Validates the Bearer token in the Authorization header.
 * Returns { userId } on success, or a 401 Response on failure.
 */
export async function requireAuth(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return unauthorized()

  return { userId: user.id }
}

/**
 * Returns a 403 Response unless the caller may act for `bodyPatientId`: either they are that
 * patient, or a guardian who manages them (checked by the can_manage() database function under
 * the caller's own JWT, so the same rules as row-level security apply).
 * Returns null when the caller is allowed.
 */
export async function assertCanManage(
  req: Request,
  bodyPatientId: string,
  userId: string,
): Promise<Response | null> {
  if (bodyPatientId === userId) return null

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  )
  const { data, error } = await supabase.rpc('can_manage', { pid: bodyPatientId })
  if (error || data !== true) return forbidden()
  return null
}

/**
 * Returns a 400 Response if fileUrl is not a Supabase Storage URL.
 * Returns null if the URL is safe.
 * Prevents SSRF by ensuring fetches only hit our own storage bucket.
 */
export function assertSupabaseUrl(fileUrl: string): Response | null {
  const supabaseHost = new URL(Deno.env.get('SUPABASE_URL')!).hostname
  try {
    const target = new URL(fileUrl)
    if (target.hostname !== supabaseHost) {
      return new Response(
        JSON.stringify({ error: 'Invalid file_url: must be a Supabase Storage URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid file_url' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
  return null
}
