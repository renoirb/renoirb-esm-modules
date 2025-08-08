export const getFirstSuccessfulResponse = async (urls) => {
  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        // 200-299 range
        return await response
      }
      console.warn(`HTTP ${response.status} for ${url}`)
    } catch (error) {
      console.warn(`Network error for ${url}:`, error.message)
    }
  }
  throw new Error(`All URLs failed: ${urls.join(', ')}`)
}
