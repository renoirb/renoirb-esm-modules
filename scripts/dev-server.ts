/* file: scripts/dev-server.ts */

import { serve } from 'https://deno.land/std/http/server.ts'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const filepath =
    url.pathname === '/'
      ? '/packages/notice-box-element/workbench.html'
      : url.pathname

  try {
    const file = await Deno.readFile(`.${filepath}`)
    const ext = filepath.substring(filepath.lastIndexOf('.'))
    const contentType = MIME_TYPES[ext] || 'text/plain'

    // Inject import map for HTML files
    if (ext === '.html') {
      const content = new TextDecoder().decode(file)
      const importMap = await Deno.readTextFile('./import_map.json')
      const modified = content.replace(
        '<head>',
        `<head>\n<script type="importmap">${importMap}</script>`,
      )
      return new Response(modified, {
        headers: { 'content-type': contentType },
      })
    }

    return new Response(file, {
      headers: { 'content-type': contentType },
    })
  } catch (error) {
    console.error(error)
    return new Response('Not found', { status: 404 })
  }
}

await serve(handleRequest, { port: 8000 })
