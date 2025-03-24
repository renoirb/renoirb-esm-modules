import {
  /*                                  */
  createMemoizedLoader,
} from '@renoirb/element-utils'

const VERSION_SHOWDOWN = '2.1.0'
const IMPORT_DEP_SHOWDOWN = `https://ga.jspm.io/npm:showdown@${VERSION_SHOWDOWN}/dist/showdown.js`

const loadParser = createMemoizedLoader(
  IMPORT_DEP_SHOWDOWN,
  async (module) => {
    await Promise.resolve()

    const showdown = module?.default
    const converter = new showdown.Converter({ metadata: true })
    converter.setOption('openLinksInNewWindow', true)

    return showdown
  },
)

// Create shared processor for date conversions
const taskQueue = new ThrottledProcessor({ maxConcurrent: 5 })

export const contextRequestListener = async (event) => {
  if (event.context !== 'markdown-content-context') {
    return
  }
  event.stopPropagation()

  let html = ''

  await taskQueue.add(async () => {
    try {
      const host = event.contextTarget
      const markdown = host.innerHTML
      const parser = await loadParser()
      html = parser.makeHtml(markdown)
      event.callback({ markdown, html })
    } catch (error) {
      html = `<pre>${error}</pre>`
      event.callback({ markdown, html })
    }
  })
}

if (typeof window !== 'undefined') {
  const currentUrl = new URL(import.meta.url)
  const setup = currentUrl.searchParams.has('setup')
  if (setup) {
    window.document.addEventListener(
      'context-request',
      contextRequestListener,
    )
    loadParser().catch((error) => {
      console.warn('Failed to pre-load:', error)
    })
    window.addEventListener('unload', () => {
      window.document.removeEventListener(
        'context-request',
        contextRequestListener,
      )
      taskQueue.destroy()
    })
  }
}