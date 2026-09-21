import { assert, assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { documentContent, loadDocument } from './document.ts'

/** Replaces global fetch for one test with a canned response. */
async function withFetch(res: Response, fn: () => Promise<void>) {
  const original = globalThis.fetch
  globalThis.fetch = () => Promise.resolve(res)
  try {
    await fn()
  } finally {
    globalThis.fetch = original
  }
}

const respond = (body: BodyInit, type: string, init: ResponseInit = {}) =>
  new Response(body, { ...init, headers: { 'Content-Type': type } })

/** Runs loadDocument and returns the Response it threw. */
async function thrown(): Promise<Response> {
  const err = await assertRejects(() => loadDocument('https://example.test/f'))
  assert(err instanceof Response, 'expected a thrown Response')
  return err
}

Deno.test('text file is returned as text with no media block', async () => {
  await withFetch(respond('Hemoglobin 13.2 g/dL', 'text/plain; charset=utf-8'), async () => {
    const doc = await loadDocument('https://example.test/f.txt')
    assertEquals(doc.text, 'Hemoglobin 13.2 g/dL')
    assertEquals(doc.block, undefined)
    assertEquals(documentContent(doc, 'prompt'), 'prompt')
  })
})

Deno.test('PDF becomes a base64 document block', async () => {
  const bytes = new TextEncoder().encode('%PDF-1.4 test')
  await withFetch(respond(bytes, 'application/pdf'), async () => {
    const doc = await loadDocument('https://example.test/f.pdf')
    assertEquals(doc.text, undefined)
    assertEquals(doc.block, {
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: btoa('%PDF-1.4 test') },
    })
    const content = documentContent(doc, 'prompt') as unknown[]
    assertEquals(content.length, 2)
    assertEquals(content[1], { type: 'text', text: 'prompt' })
  })
})

for (const type of ['image/png', 'image/jpeg']) {
  Deno.test(`${type} becomes a base64 image block`, async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 255, 128])
    await withFetch(respond(bytes, type), async () => {
      const doc = await loadDocument('https://example.test/f')
      assertEquals(doc.block, {
        type: 'image',
        source: { type: 'base64', media_type: type, data: btoa(String.fromCharCode(...bytes)) },
      })
    })
  })
}

Deno.test('content-type parameters and case are ignored', async () => {
  await withFetch(respond(new Uint8Array([1, 2, 3]), 'IMAGE/PNG; charset=binary'), async () => {
    const doc = await loadDocument('https://example.test/f')
    assertEquals(doc.block?.type, 'image')
  })
})

Deno.test('file over 20 MB is rejected with 413', async () => {
  const big = new Uint8Array(20 * 1024 * 1024 + 1)
  await withFetch(respond(big, 'application/pdf'), async () => {
    const res = await thrown()
    assertEquals(res.status, 413)
    assertEquals((await res.json()).error, 'File is too large to process (max 20 MB)')
  })
})

Deno.test('file of exactly 20 MB is accepted', async () => {
  const limit = new Uint8Array(20 * 1024 * 1024)
  await withFetch(respond(limit, 'application/pdf'), async () => {
    const doc = await loadDocument('https://example.test/f')
    assertEquals(doc.block?.type, 'document')
  })
})

Deno.test('5 MB image encodes without a stack overflow', async () => {
  const size = 5 * 1024 * 1024
  const bytes = new Uint8Array(size).map((_, i) => i % 251)
  await withFetch(respond(bytes, 'image/jpeg'), async () => {
    const doc = await loadDocument('https://example.test/photo.jpg')
    assert(doc.block?.type === 'image')
    const data = doc.block.source.data
    assertEquals(data.length, Math.ceil(size / 3) * 4)
    // round-trips to the original bytes
    const decoded = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    assertEquals(decoded.byteLength, size)
    assertEquals(decoded[1000], bytes[1000])
    assertEquals(decoded[size - 1], bytes[size - 1])
  })
})

Deno.test('non-2xx fetch response throws a 502 with CORS headers', async () => {
  await withFetch(respond('nope', 'text/plain', { status: 404, statusText: 'Not Found' }), async () => {
    const res = await thrown()
    assertEquals(res.status, 502)
    assertEquals((await res.json()).error, 'Failed to fetch file: Not Found')
    assertEquals(res.headers.get('Content-Type'), 'application/json')
    assert(res.headers.has('Access-Control-Allow-Origin'))
  })
})
