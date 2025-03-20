import {
  /*                                  */
  ContextRequest_MarkdownContent,
} from '@renoirb/markdown-content-element'

const VERSION_SHOWDOWN = '2.1.0'
const IMPORT_DEP_SHOWDOWN = `https://ga.jspm.io/npm:showdown@${VERSION_SHOWDOWN}/dist/showdown.js`

// IIFE that creates a cached parser promise
export const createParser = (() => {
  let parserPromise = null

  return async (opts = {}) => {
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

export const contextRequestListener = async (event) => {
  if (event.context !== ContextRequest_MarkdownContent) {
    return
  }
  event.stopPropagation()
  const host = event.contextTarget
  const markdown = host.innerHTML
  const parser = await createParser()
  const html = parser.makeHtml(markdown)
  event.callback({ markdown, html })
}

if (window?.document?.body) {
  const currentUrl = new URL(import.meta.url)
  const setup = currentUrl.searchParams.has('setup')
  if (setup) {
    window.document.body.addEventListener(
      'context-request',
      contextRequestListener,
    )
  }
}
