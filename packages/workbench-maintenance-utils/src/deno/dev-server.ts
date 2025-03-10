import { serve } from 'https://deno.land/std/http/server.ts'
import { join } from 'https://deno.land/std/path/mod.ts'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
}

export type DevServerOptions = {
  port?: number
  defaultPackage?: string
  componentShowcaseScriptAsString: string
}

async function listPackagesWithWorkbench(
  projectRoot: string,
): Promise<string[]> {
  const packages: string[] = []
  for await (const entry of Deno.readDir(join(projectRoot, 'packages'))) {
    if (entry.isDirectory) {
      try {
        await Deno.stat(
          join(projectRoot, 'packages', entry.name, 'workbench.html'),
        )
        packages.push(entry.name)
      } catch {
        // No workbench.html in this package
      }
    }
  }
  return packages
}

const HTML_HEAD_TEMPLATE = `
  <script type="module">
    import {
      /*                    */
      init,
    } from '/packages/workbench-maintenance-utils/browser.mjs'
    await init(window)
  </script>
`

const WRAPPER_TAGS = ['app-layout']
const RE_HTML_NAVIGATION = new RegExp(`</(${WRAPPER_TAGS.join('|')})>`, 'i')

async function handleRequest(
  request: Request,
  options: DevServerOptions,
): Promise<Response> {
  const url = new URL(request.url)
  const projectRoot = Deno.cwd()

  // Get package from query parameter or default
  const packageName =
    url.searchParams.get('package') ??
    options.defaultPackage ??
    'notice-box-element'

  let filepath = url.pathname
  if (filepath === '/') {
    filepath = `/packages/${packageName}/workbench.html`
    console.log(`Using workbench for package: ${packageName}`)
  }

  console.log(`Request for: ${filepath}`)

  try {
    const normalizedPath = join(
      projectRoot,
      filepath.startsWith('/') ? filepath.slice(1) : filepath,
    )

    /*
    console.log(
      `Looking for:\n  path: ${filepath}\n  normalizedPath: ${normalizedPath}\n`,
    )
    */

    try {
      const file = await Deno.readFile(normalizedPath)
      const ext = filepath.substring(filepath.lastIndexOf('.'))
      const contentType = MIME_TYPES[ext] || 'text/plain'

      if (ext === '.html') {
        const content = new TextDecoder().decode(file)
        const importMapPath = join(projectRoot, 'import_map_workbench.json')
        const importMap = await Deno.readTextFile(importMapPath)

        let modified = content
          .replace('<head>', '<head>' + HTML_HEAD_TEMPLATE)
          .replace(
            '<head>',
            `<head>\n<script type="importmap">${importMap}</script>\n<script type="module">${options.componentShowcaseScriptAsString}</script>\n`,
          )

        // Get list of packages with workbench.html
        const packages = (await listPackagesWithWorkbench(projectRoot)).sort()
        const packagesListAsString = packages.join(
          /* Stringify list of packages the same way we stringify a classList */ ' ',
        )
        const HTML_NAVIGATION = `
          <workbench-nav
            data-workbench-current="${packageName}"
            data-workbench-list="${packagesListAsString}"
          >
          </workbench-nav>
        `

        const match = content.match(RE_HTML_NAVIGATION)

        if (match) {
          // Use the captured tag name in replacement
          const [fullMatch, tagName] = match
          modified = modified.replace(
            fullMatch,
            `\n${HTML_NAVIGATION}\n</${tagName}>\n`,
          )
        } else {
          // Fallback to body if no wrapper tags found
          modified = modified.replace(
            '</body>',
            `\n${HTML_NAVIGATION}\n</body>\n`,
          )
        }

        return new Response(modified, {
          headers: { 'content-type': contentType },
        })
      }

      return new Response(file, { headers: { 'content-type': contentType } })
    } catch (localError) {
      // If this is an import from our mapped URLs, try to resolve it locally first
      if (filepath.startsWith('/esm-modules/')) {
        console.warn('Import map miss:', filepath)
        return new Response('Not found', { status: 404 })
      }

      // For other files, check if it's in our import map
      const importMapPath = join(projectRoot, 'import_map_workbench.json')
      const importMapText = await Deno.readTextFile(importMapPath)
      const importMap = JSON.parse(importMapText)

      // Try to find a matching import map entry
      const matchingImport = Object.entries(importMap.imports).find(([key]) =>
        filepath.includes(key.replace('https://renoirb.com', '')),
      )

      if (matchingImport) {
        // If found in import map, serve the local file
        const [importKey, localPath] = matchingImport
        const localFilePath = join(
          projectRoot,
          localPath.startsWith('./') ? localPath.slice(2) : localPath,
        )
        console.log(`Serving mapped file from: ${localFilePath}`)

        try {
          const file = await Deno.readFile(localFilePath)
          const ext = localPath.substring(localPath.lastIndexOf('.'))
          const contentType = MIME_TYPES[ext] || 'text/plain'
          return new Response(file, {
            headers: { 'content-type': contentType },
          })
        } catch (mappedError) {
          console.error(
            `Failed to read mapped file: ${localFilePath}`,
            mappedError,
          )
          return new Response('Not found', { status: 404 })
        }
      }

      console.warn(`Resource not found: ${filepath}`)
      return new Response('Not found', { status: 404 })
    }
  } catch (error) {
    console.error('Server error:', error)
    return new Response('Server error', { status: 500 })
  }
}

export const devServer = async (options: DevServerOptions = {}) => {
  const { port = 8000 } = options
  console.log(`Dev server running at http://localhost:${port}`)
  console.log(
    `Default package: ${options.defaultPackage ?? 'notice-box-element'}`,
  )
  console.log('Change package by adding ?package=package-name to the URL')
  await serve((req) => handleRequest(req, options), { port })
}

if (import.meta.main) {
  devServer({ port: 8000 })
}
