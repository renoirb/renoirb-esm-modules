export interface NewsItem {
  /**
   * ISO8601 date
   */
  date: string
  title: string
  body?: string
}

export interface NewsFeedFor {
  /**
   * URL
   */
  source: string
  /**
   * ISO8601 date
   */
  date: string
  news: NewsItem[]
}
