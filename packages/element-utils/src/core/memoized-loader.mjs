/**
 * Creates a memoized loader for a module
 *
 * Created with assistance from Claude (Anthropic), 2025-03-19
 * Pattern implementation for front-end component optimization
 *
 * @author Renoir Boulanger
 * @contributor Claude AI
 *
 * @param {string} moduleUrl URL to load the module from
 * @param {Function} [setupFn] Optional function to run on the module after loading
 * @returns {Function} Async function that returns the loaded module
 */
export const createMemoizedLoader = (moduleUrl, setupFn) => {
  let modulePromise = null

  return async () => {
    if (modulePromise === null) {
      modulePromise = (async () => {
        const module = await import(moduleUrl)

        // Run setup function if provided
        if (setupFn && typeof setupFn === 'function') {
          await setupFn(module)
        }

        return module
      })()
    }

    return modulePromise
  }
}
