import {
  Document,
  DOMParser,
} from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts'
import { StockEventsAdapter } from './adapter-stockevents.ts'

// #TODO: This should be specific to handling logic in any environment

export async function main(ticker: string) {
  const adapter = new StockEventsAdapter()
  // ^ This should be configurable
  const url = adapter.buildUrl(ticker)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const html = await response.text()
  console.log('Response length:', html.length)
  console.log('First 200 chars:', html.slice(0, 200))

  const parser = new DOMParser()
  const document: Document = parser.parseFromString(html, 'text/html')
  console.log('Parsed document:', document ? 'yes' : 'no')

  return await adapter.extractNews(document)
}

// #TODO: Below should be specific in a file to run as CLI in another file
if (import.meta.main) {
  const ticker = Deno.args[0]
  if (!ticker) {
    console.error('Please provide a ticker symbol')
    Deno.exit(1)
  }

  try {
    const news = await main(ticker)
    console.log(JSON.stringify(news, null, 2))
  } catch (error) {
    console.error('Error:', (<Error> error).message)
    Deno.exit(1)
  }
}
