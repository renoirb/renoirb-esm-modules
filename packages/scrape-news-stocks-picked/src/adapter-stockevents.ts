import type { NewsFeedFor } from './types.ts'

/**
 * THIS SHOULD BE REWRITTEN COMPLETELY
 * 
 * Since there's a way using GraphQL
 */

export interface StockEventsNewsRaw {
  date: string
  sourceName: string
  title: string
  url: string
  symbols: string[]
}

export interface StockEventsInitialData {
  data: {
    news: StockEventsNewsRaw[]
    company: {
      symbol: string
      companyName: string
    }
  }
}

export class StockEventsAdapter {
  readonly name = 'stockevents'
  readonly baseUrl = 'https://stockevents.app'
  readonly timezone = 'America/New_York'
  readonly maxItems = 10

  buildUrl(ticker: string): URL {
    return new URL(`/en/stock/${ticker}`, this.baseUrl)
  }

  private extractInitialData(document: Document): StockEventsInitialData {
    // Find the script tag containing window.initialData
    // Using regex to find the data directly in the HTML since DOM parsing might be limited
    const html = document.documentElement.outerHTML

    // Find all script tags
    const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gm
    console.log(
      'Script contents:',
      [...html.matchAll(scriptPattern)].map((m) => m[1].slice(0, 150)),
    )

    const match = html.match(
      /window\.initialData\s*=\s*({[\s\S]*?});(?:\s*window\.|<\/script>)/,
    )

    if (!match?.[1]) {
      throw new Error('Could not find window.initialData in page')
    }

    console.log('Found match:', match[1].slice(0, 100))

    const jsonStr = match[1]
      .replace(/\\'/g, "'") // Handle escaped quotes if any
      .replace(/\n/g, '') // Remove newlines
      .trim()

    try {
      return JSON.parse(jsonStr) as StockEventsInitialData
    } catch (e) {
      throw new Error(`Failed to parse StockEvents initialData: ${e.message}`)
    }
  }

  async extractNews(document: Document): Promise<NewsFeedFor> {
    const initialData = this.extractInitialData(document)

    const news = initialData.data.news
      .slice(0, this.maxItems)
      .map((item) => ({
        date: item.date,
        title: item.title,
        // Optional body not available in StockEvents
        body: undefined,
      }))

    return {
      source: this.buildUrl(initialData.data.company.symbol).toString(),
      date: new Date().toISOString().split('T')[0], // Current date as YYYY-MM-DD
      news,
    }
  }
}
