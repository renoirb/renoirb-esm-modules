export class HttpClientWithCache {
  #responseCache = new Map() // URL -> raw text

  getCachedResponseText = async (url) => {
    if (this.#responseCache.has(url)) {
      return this.#responseCache.get(url)
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`)
    }
    // Is in 200-299 range
    const text = await response.text() // Always works!
    this.#responseCache.set(url, text)
    return text
  }

  /**
   * Same implementation of getFirstSuccessfulResponse,
   * but instead of returning a response,
   * we're caching and returning the text for later parsing.
   */
  getFirstSuccessful = async (urls) => {
    for (const url of urls) {
      try {
        const maybeCachedText = await this.getCachedResponseText(url)
        if (maybeCachedText && maybeCachedText !== '') {
          return maybeCachedText
        }
        throw new Error(`Empty response for ${url}`)
      } catch (error) {
        throw new Error(error.message)
      }
    }
    throw new Error(`All URLs failed: ${urls.join(', ')}`)
  }
}
