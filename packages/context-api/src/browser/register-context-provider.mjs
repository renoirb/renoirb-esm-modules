import { ContextProviderEvent } from './event.mjs'

/**
 * @fileoverview Context provider registration utilities for the W3C Context Protocol.
 *
 * Simplifies the registration of context providers and handles late provider resolution
 * by automatically announcing provider availability. Supports both static values and
 * dynamic handlers, eliminating boilerplate for the common pattern of listening for
 * context requests and announcing provider readiness.
 *
 * Key features:
 * - Automatic provider announcement via ContextProviderEvent
 * - Support for both static values and async handlers
 * - Bulk registration of multiple contexts
 * - Proper cleanup with removal functions
 * - AbortSignal support for lifecycle management
 *
 * @example <caption>Manual approach (without this module)</caption>
 * ```js
 * // Early in document <head>
 * new ContextRoot().attach(document.body)
 *
 * // Later in document, register provider manually
 *
 * // Example of a Context for jsonresume-basics payload
 * const contextName = 'jsonresume-basics'
 * const basics = {
 *   name: 'Renoir Boulanger',
 *   email: 'contribs@renoirboulanger.com',
 * }
 * const jsonResumeData = {
 *   basics,
 * }
 *
 * document.addEventListener('context-request', (event) => {
 *   if (event.context === contextName) {
 *     event.stopImmediatePropagation()
 *     event.callback(jsonResumeData.basics)
 *   }
 * })
 *
 * // Must manually announce provider
 * document.body.dispatchEvent(
 *   new ContextProviderEvent(contextName, document.body)
 * )
 * // Which will replay anything the ContextRoot had for the present context-request
 * ```
 *
 * @example <caption>With this module</caption>
 * ```js
 * // Same setup, but simpler provider registration
 * const cleanup = registerContextProvider('jsonresume-basics', jsonResumeData.basics);
 * // That's it! Announcement handled automatically
 * ```
 *
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 * @since 2025
 * @license MIT
 * @contributor Claude AI
 */

/**
 * @typedef {Object} ContextRequestEvent
 * @property {string} context - The context identifier
 * @property {Element} contextTarget - The element requesting the context
 * @property {(value: any, unsubscribe?: () => void) => void} callback - Callback to provide the value
 * @property {boolean} [subscribe] - Whether to subscribe to updates
 * @property {() => void} stopPropagation - Stops event propagation
 */

/**
 * @typedef {Object} ProviderOptions
 * @property {Element} [target] - Target element for provider (defaults to document.body)
 * @property {boolean} [stopPropagation=true] - Whether to stop event propagation
 * @property {AbortSignal} [signal] - AbortSignal for cleanup
 */

/**
 * @typedef {(event: ContextRequestEvent) => any | Promise<any>} ContextHandler
 */

/**
 * Registers a context provider and announces its availability.
 * Simplifies the common pattern of listening for context requests and providing values.
 *
 * @param {string} contextName - The context identifier to provide
 * @param {ContextHandler | any} handlerOrValue - Either a handler function or a static value
 * @param {ProviderOptions} [options] - Configuration options
 * @returns {() => void} Cleanup function to remove the provider
 *
 * @example
 * ```js
 * // Static value
 * const cleanup = registerContextProvider(
 *   'user-theme',
 *   { mode: 'dark', primary: '#000' },
 * )
 * ```
 *
 * @example
 * ```js
 * // Dynamic handler
 * const cleanup = registerContextProvider(
 *   'user-data',
 *   async (event) => {
 *     const userId = event.contextTarget.getAttribute('data-user-id')
 *     return await fetchUserData(userId)
 *   },
 * )
 * ```
 *
 * @example
 * ```js
 * // With options
 * const cleanup = registerContextProvider(
 *   'app-config',
 *   getConfig(),
 *   { target: myCustomElement }
 * )
 * ```
 *
 * @example
 * ```js
 * // Component providing its OWN internal state as context
 * // NOTE: Components should only provide contexts for data they inherently own,
 * // not act as data fetching controllers. External data should be provided at
 * // the application level, not by components.
 * class ColorPicker extends HTMLElement {
 *   controller = new AbortController()
 *   #selectedColor = '#000000'
 *
 *   connectedCallback() {
 *     // Providing component's OWN state - this is OK!
 *     this.cleanup = registerContextProvider(
 *       'selected-color',
 *       () => this.#selectedColor,
 *       {
 *         target: this, // Scoped to this component's subtree
 *         signal: this.controller.signal
 *       }
 *     )
 *   }
 *
 *   disconnectedCallback() {
 *     this.controller.abort()
 *   }
 *
 *   // Component updates its own state
 *   handleColorChange(newColor) {
 *     this.#selectedColor = newColor
 *     // Re-announce to update consumers
 *     this.dispatchEvent(new ContextProviderEvent('selected-color', this))
 *   }
 * }
 * ```
 */
export const registerContextProvider = (
  contextName,
  handlerOrValue,
  options = {},
) => {
  const {
    target = document.body,
    stopPropagation = true,
    signal
  } = options

  // Determine if we have a handler function or static value
  const isHandler = typeof handlerOrValue === 'function'

  /**
   * @param {ContextRequestEvent} event
   */
  const contextListener = async (event) => {
    if (event.context !== contextName) {
      return void 0
    }
    if (stopPropagation) {
      event.stopImmediatePropagation()
    }

    try {
      const value = isHandler
        ? await handlerOrValue(event)
        : handlerOrValue

      if (value !== undefined) {
        event.callback(value)
      }
    } catch (error) {
      console.error(`Context provider error for "${contextName}":`, error)
      // Optionally provide error to callback
      // event.callback(null, () => {})
    }
  }

  // Add listener
  const listenerTarget = target.getRootNode() || document
  listenerTarget.addEventListener('context-request', contextListener, { signal })

  // Announce provider availability
  target.dispatchEvent(
    new ContextProviderEvent(contextName, target)
  )

  // Return cleanup function
  return () => {
    listenerTarget.removeEventListener('context-request', contextListener)
  }
}

/**
 * Registers multiple context providers at once.
 *
 * @param {Record<string, ContextHandler | any>} providers - Map of context names to handlers/values
 * @param {ProviderOptions} [options] - Configuration options applied to all providers
 * @returns {() => void} Cleanup function to remove all providers
 *
 * @example
 * ```js
 * const cleanup = registerContextProviders({
 *   'user-theme': { mode: 'dark' },
 *   'user-profile': async (event) => await fetchProfile(),
 *   'app-config': getConfig()
 * })
 * ```
 */
export const registerContextProviders = (
  providers,
  options = {},
) => {
  const cleanups = Object.entries(providers).map(
    ([contextName, handlerOrValue]) =>
      registerContextProvider(contextName, handlerOrValue, options),
  )

  return () => cleanups.forEach((cleanup) => cleanup())
}

/**
 * Creates a typed context provider factory for better type safety.
 *
 * @template T
 * @param {string} contextName - The context identifier
 * @returns {{
 *   provide: (value: T | ((event: ContextRequestEvent) => T | Promise<T>), options?: ProviderOptions) => () => void,
 *   context: string
 * }}
 *
 * @example
 * ```js
 * const ThemeContext = createContextProvider('app-theme')
 *
 * // Later...
 * const cleanup = ThemeContext.provide({ mode: 'dark', primary: '#000' })
 * ```
 */
export const createContextProvider = (
  contextName,
) => {
  return {
    context: contextName,
    provide: (valueOrHandler, options) =>
      registerContextProvider(contextName, valueOrHandler, options),
  }
}
