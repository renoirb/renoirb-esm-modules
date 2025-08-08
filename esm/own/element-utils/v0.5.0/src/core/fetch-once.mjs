/**
 * Get (and cache) a static file, or get another fresh copy without another HTTP request.
 */
export const fetchOnce = (() => {
  let dataPromise = null

  return async (url) => {
    // Return cached promise if available
    if (dataPromise !== null) {
      return dataPromise
    }
    // Create and cache the promise for fetching resume data
    dataPromise = (async () => {
      try {
        const request = new Request(url)
        const response = await fetch(request)

        if (!response.ok) {
          throw new Error(`Failed to fetch resume data: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        console.error('Error loading resume data:', error)
        // Reset cache on error to allow retry
        dataPromise = null
        throw error
      }
    })()

    return dataPromise
  }
})()
