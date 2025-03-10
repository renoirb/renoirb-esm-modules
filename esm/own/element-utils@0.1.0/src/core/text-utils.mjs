/**
 * Take a multi-line back-tick(ed) string, make it one line.
 * 
 * Useful for source-control readibility and separate ideas per line.
 * 
 * @example
 * ```js
 * const message = trimText`
 *     How much wood
 *     could a woodchuck could
 *     chop wood
 *  `
 * ```
 */
export const trimText = (stringContents) => {
  return stringContents.join(' ').replace(/[\n\s]/g, ' ')
}