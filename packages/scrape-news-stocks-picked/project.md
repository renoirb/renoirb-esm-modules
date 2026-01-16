# Scrape News Exposed From Stock Ticker Pages

Please help me write a Deno so I can get JSON output of news events from a stock market ticker detail page which has news listed related to that security somewhere on the page.

1. Architecture:
   - Main program with adapter pattern
   - Each adapter handles site-specific details
   - Minimal dependencies, preferring JSR over NPM
   - Async operations for web scraping
   - Command-line interface


2. Core Components:
   - Abstract base adapter interface
   - Site-specific adapters (starting with FinViz)
   - Date parsing/formatting utilities
   - Main orchestration logic
   - CLI handler

3. Adapter Responsibilities:
   - URL construction from ticker
   - CSS selector definitions
   - Date format parsing
   - Extraction logic for news items
   - Timezone handling

4. Key Features:
   - Configurable timezone per adapter
   - ISO8601 date standardization
   - Consistent JSON output format
   - Error handling
   - Modular design for easy addition of new sites

5. Intended sites
    - https://FinViz.com/
    - https://StockEvents.app/

6. Vvalidation of input symbols
  The HTTP response status might be just sufficient. 
  - FinViz returns a 404 when it is unknown.
  - StockEvents returns a 300 class when it doesn't find
  - Yahoo Finance


Code should be able to run from CLI, or as a CloudFlare Worker, or on a simple web page. We should separate assumptions.


## Desired Output

- News
  - When processing news in whichever mean available
  - Limit to a configurable maximum of 10.
  - We don't need no pagination.

### Interfaces

See [src/types.ts](./src/types.ts)


## Sites to Write Adapters For

### FinViz

Example with **OUNZ**: <https://finviz.com/quote.ashx?p=d&t=OUNZ>

The page has only date and news headline and URL available.

#### Date

The date is unintelligible (e.g. "Feb-03-25 08:00AM"), I want it into ISO8601 (e.g. "2025-02-03T01:00:00Z", that is assuming that's valid UTC). Assume New-York Time Zone as input and transform in UTC, but make it configurable per adapter, here it'll be for FinViz.

#### News Entry

- **Date**: Feb-03-25 08:00AM
- **Headline**: Gold ETF (OUNZ) Hits New 52-Week High
- **URL**: https://finance.yahoo.com/news/gold-etf-ounz-hits-52-130000120.html

```html
<tr class="cursor-pointer has-label" onclick="trackAndOpenNews(event, 'Zacks', 'https://finance.yahoo.com/news/gold-etf-ounz-hits-52-130000120.html');">
  <td width="130" align="right">Feb-03-25 08:00AM</td>
  <td align="left">
    <div class="news-link-container">
      <div class="news-link-left">
        <a class="tab-link-news" href="https://finance.yahoo.com/news/gold-etf-ounz-hits-52-130000120.html" target="_blank" rel="nofollow">Gold ETF (OUNZ) Hits New 52-Week High</a>
      </div>
      <div class="news-link-right">
        <span>(Zacks)</span>
      </div>
    </div>
  </td>
</tr>
```



### StockEvents

Example with **OUNZ**: <https://stockevents.app/en/stock/OUNZ>

The page has only date and news headline and URL available.

#### Date

The date is unintelligible (e.g. "Feb-03-25 08:00AM"), I want it into ISO8601 (e.g. "2025-02-03T01:00:00Z", that is assuming that's valid UTC). Assume New-York Time Zone as input and transform in UTC, but make it configurable per adapter, here it'll be for FinViz.

#### News Entry


##### Using GraphQL

Using cURL:

```bash
curl 'https://stockevents.app/api/graphql' -H 'origin: https://stockevents.app' --data-raw '{"query":"query( $symbols: [String], $topics: [String], $titles: [String], $dateFrom: DateTime, $dateTo: DateTime) { news( symbols: $symbols, topics: $topics, titles: $titles, dateFrom: $dateFrom, dateTo: $dateTo ) { symbols date title summary url imageUrl sentiment type sourceName topics }}","variables":{"symbols":["OUNZ"]}}'
```

Response

```json
{
  "data": {
    "news": [
      {
        "date": "2024-07-18T12:00:00Z",
        "imageUrl": "https://assets.stockevents.app/images/xl/2762c0a3-8ca8-4f0e-987b-039ba880b929.webp",
        "sentiment": "",
        "sourceName": "Business Wire",
        "summary": "",
        "symbols": [
          "GDX",
          "GDXJ",
          "OUNZ"
        ],
        "title": "VanEck Merk Gold Trust (OUNZ) Passes $1B in Assets Under Management",
        "topics": [],
        "type": "Article",
        "url": "https://finance.yahoo.com/news/vaneck-merk-gold-trust-ounz-120000159.html"
      }
    ]
  }
}
```


### Yahoo Finance

URLs to check:
- https://finance.yahoo.com/quote/OUNZ/news/
- https://finance.yahoo.com/quote/OUNZ/

Potential sources:
- https://finance.yahoo.com/news/rssindex
