import { corsHeaders } from './auth.ts'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type ImageType = typeof IMAGE_TYPES[number]

const isImageType = (type: string): type is ImageType => (IMAGE_TYPES as readonly string[]).includes(type)

/** Base64 in 32 KB slices: spreading a whole photo into fromCharCode overflows the stack, and std's encoder takes ~8 s for 20 MB. */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

const MAX_BYTES = 20 * 1024 * 1024 // matches the `reports` bucket limit

type MediaBlock =
  | { type: 'image'; source: { type: 'base64'; media_type: ImageType; data: string } }
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

  if (type === 'application/pdf' || isImageType(type)) {
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) {
      throw new Response(
        JSON.stringify({ error: 'File is too large to process (max 20 MB)' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const data = toBase64(buffer)
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
