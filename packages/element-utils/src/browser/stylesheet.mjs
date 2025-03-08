/**
 * Optimizes loading external CSS by fetching once and applying to both
 * Shadow DOM and document head.
 *
 * @param {Window} window - Window object from the component's context
 * @param {string[]} urls - Array of CSS URLs to load
 * @param {Object} options - Configuration options
 * @param {string} options.componentName - Name for tracking duplicate styles
 * @param {boolean} options.avoidDuplicates - Whether to check for existing styles
 * @returns {Promise<{shadow: CSSStyleSheet|HTMLStyleElement, document: HTMLStyleElement}>}
 */
export const optimizedExternalStyles = async (
  window,
  urls = [],
  options = {},
) => {
  // Ensure we have proper document/window context
  if (!window || typeof window !== 'object') {
    throw new TypeError('Valid Window object required')
  }
  const document = window.document

  // Validate inputs
  if (!Array.isArray(urls)) {
    throw new TypeError('Invalid argument: urls must be an array')
  }

  const invalidItems = urls.filter(
    (item) => typeof item !== 'string' || !/^https?:\/\//.test(item),
  )
  if (invalidItems.length > 0) {
    const items = invalidItems.join(', ')
    const message = `Invalid URLs found: all items must be strings starting with http:// or https://\nInvalid items: ${items}`
    throw new TypeError(message)
  }

  const { componentName = 'custom-component', avoidDuplicates = true } = options

  try {
    // Fetch all stylesheets in parallel
    const styleTexts = await Promise.all(
      urls.map((url) =>
        window
          .fetch(url)
          .then((res) => (res.ok ? res.text() : ''))
          .catch((error) => {
            console.warn(`Failed to load ${url}:`, error)
            return ''
          }),
      ),
    )

    const css = styleTexts.filter((text) => text.trim()).join('\n')
    if (!css) {
      return { shadow: null, document: null }
    }

    // Create Shadow DOM style
    let shadowStyle
    const supportsAdoptedStyleSheets =
      'adoptedStyleSheets' in Document.prototype &&
      typeof window.CSSStyleSheet === 'function'

    if (supportsAdoptedStyleSheets) {
      try {
        const sheet = new window.CSSStyleSheet()
        sheet.replaceSync(css)
        shadowStyle = sheet
      } catch (error) {
        const el = document.createElement('style')
        el.textContent = css
        shadowStyle = el
      }
    } else {
      const el = document.createElement('style')
      el.textContent = css
      shadowStyle = el
    }

    // Create document style with deduplication if requested
    let documentStyle = null

    if (avoidDuplicates) {
      const selector = `style[data-source="${componentName}"]`
      documentStyle = document.head.querySelector(selector)

      if (!documentStyle) {
        documentStyle = document.createElement('style')
        documentStyle.dataset.source = componentName
        documentStyle.textContent = css
      }
    } else {
      // Always create a new style element
      documentStyle = document.createElement('style')
      documentStyle.dataset.source = componentName
      documentStyle.textContent = css
    }

    return { shadow: shadowStyle, document: documentStyle }
  } catch (error) {
    console.error('Failed to optimize external styles:', error)
    throw error
  }
}
