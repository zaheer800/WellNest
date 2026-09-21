import { encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
import { corsHeaders } from './auth.ts'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 20 * 1024 * 1024 // matches the `reports` bucket limit

type MediaBlock =
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }

export interface LoadedDocument {
  /** Set for plain-text files; embed it in the prompt. */
  text?: string
  /** Set for PDFs and images; send it as a content block alongside the prompt. */
  block?: MediaBlock
}

/**
 * Fetches an uploaded report and prepares it for Claude.
 * Text is read as text; PDFs and images are sent as base64 blocks so Claude
 * reads them natively instead of receiving binary garbage from `.text()`.
 * Throws a Response on failure so callers can `return` it.
 */
export async function loadDocument(fileUrl: string): Promise<LoadedDocument> {
  const res = await fetch(fileUrl)
  if (!res.ok) {
    throw new Response(
      JSON.stringify({ error: `Failed to fetch file: ${res.statusText}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()

  if (type === 'application/pdf' || IMAGE_TYPES.includes(type)) {
    const buffer = new Uint8Array(await res.arrayBuffer())
    if (buffer.byteLength > MAX_BYTES) {
      throw new Response(
        JSON.stringify({ error: 'File is too large to process (max 20 MB)' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const data = encode(buffer) // chunk-safe; String.fromCharCode(...buf) overflows the stack on photos
    return type === 'application/pdf'
      ? { block: { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } } }
      : { block: { type: 'image', source: { type: 'base64', media_type: type, data } } }
  }

  return { text: await res.text() }
}

/** Builds the `content` for messages.create from a loaded document and a prompt. */
export function documentContent(doc: LoadedDocument, prompt: string) {
  return doc.block ? [doc.block, { type: 'text' as const, text: prompt }] : prompt
}
