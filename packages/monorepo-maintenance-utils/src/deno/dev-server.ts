import { serve } from 'https://deno.land/std/http/server.ts'
import { resolve, join, dirname } from 'https://deno.land/std/path/mod.ts'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
}

type DevServerOptions = {
  port?: number
  defaultPackage?: string
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

async function generatePackageList(
  packages: string[],
  currentPackage: string,
): string {
  const links = packages
    .map(
      (pkg) =>
        `<li><a href="/?package=${pkg}" ${
          pkg === currentPackage ? 'class="current"' : ''
        }>${pkg}</a></li>`,
    )
    .join('\n')

  return `
    <style>
      .package-list { padding: 1em; background: #f0f0f0; margin-bottom: 1em; }
      .current { font-weight: bold; }
    </style>
    <div class="package-list">
      <h3>Available Packages:</h3>
      <ul>${links}</ul>
    </div>
  `
}

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
    console.log(
      `Looking for:\n  path: ${filepath}\n  normalizedPath: ${normalizedPath}\n`,
    )

    try {
      const file = await Deno.readFile(normalizedPath)
      const ext = filepath.substring(filepath.lastIndexOf('.'))
      const contentType = MIME_TYPES[ext] || 'text/plain'

      if (ext === '.html') {
        const content = new TextDecoder().decode(file)
        const importMapPath = join(projectRoot, 'import_map.json')
        const importMap = await Deno.readTextFile(importMapPath)

        // Get list of packages with workbench.html
        const packages = await listPackagesWithWorkbench(projectRoot)
        const packageList = await generatePackageList(packages, packageName)

        const modified = content
          .replace(
            '<head>',
            `<head>\n<script type="importmap">${importMap}</script>`,
          )
          .replace('<body>', `<body>\n${packageList}`)

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
      const importMapPath = join(projectRoot, 'import_map.json')
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
