import {
  /*                                  */
  ThrottledProcessor,
} from '@renoirb/element-utils'

const VERSION_SHOWDOWN = '2.1.0'
const IMPORT_DEP_SHOWDOWN = `https://ga.jspm.io/npm:showdown@${VERSION_SHOWDOWN}/dist/showdown.js`

export const loadParser = (() => {
  // Instead of '@renoirb/element-utils'’ createMemoizedLoader because we want to have the parser configured
  let parserPromise = null

  return async (opts = {}) => {
    await Promise.resolve()
    if (parserPromise === null) {
      parserPromise = (async () => {
        const imported = await import(IMPORT_DEP_SHOWDOWN)
        const showdown = imported?.default
        const converter = new showdown.Converter({ metadata: true, ...opts })
        converter.setOption('openLinksInNewWindow', true)
        return converter
      })()
    }
    return parserPromise
  }
})()

// Let’s use a queue to ensure processing is throttled
const taskQueue = new ThrottledProcessor({ maxConcurrent: 5 })

export const contextRequestListener = async (event) => {
  if (event.context !== 'markdown-content-context') {
    return
  }
  event.stopPropagation()

  let html = ''
  let markdown = ''

  await taskQueue.add(async () => {
    try {
      const parser = await loadParser()
      const host = event.contextTarget
      markdown = host.innerHTML
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
    loadParser().catch((error) => {
      console.warn('Failed to pre-load:', error)
    })
    const setupListener = () => {
      document.addEventListener(
        'context-request',
        contextRequestListener,
      )
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupListener)
    } else {
      setupListener()
    }
    window.addEventListener('unload', () => {
      window.document.removeEventListener(
        'context-request',
        contextRequestListener,
      )
      taskQueue.destroy()
    })
  }
}