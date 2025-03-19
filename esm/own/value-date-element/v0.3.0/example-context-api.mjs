import {
  /*                                  */
  ContextRequest_DateConversion,
  assertIsDateConversionContextPayload,
} from '@renoirb/value-date-element'

import dayjs from 'https://cdn.skypack.dev/dayjs'
import 'https://cdn.skypack.dev/dayjs/locale/pt'
import weekday from 'https://cdn.skypack.dev/dayjs/plugin/weekday'
// https://day.js.org/docs/en/plugin/custom-parse-format
// https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens
import customParseFormat from 'https://cdn.skypack.dev/dayjs/plugin/customParseFormat'
dayjs.extend(weekday)
dayjs.extend(customParseFormat)

/**
 * From the client-side, and early in the document, we
 * register handlers for each supported context-request data models
 * and that's where we mount any dependencies
 */
export const contextRequestListener = (event) => {
  if (!event.context === ContextRequest_DateConversion) {
    return
  }
  event.stopPropagation()
  const host = event.contextTarget
  const date = host.getAttribute('datetime')
  const format = host.dataset.dateFormat || 'MMM D, YYYY'
  const formatLocale = host.dataset.dateLocale || 'en'
  if (date) {
    const formatter = dayjs(date)
    const unixEpoch = formatter.unix()
    const isoString = formatter.toISOString()
    const human = formatter.locale(formatLocale).format(format, formatLocale)
    const payload = { date, human, isoString, unixEpoch }
    assertIsDateConversionContextPayload(payload)
    event.callback(payload)
  }
}

if (window?.document?.body) {
  const currentUrl = new URL(import.meta.url)
  const setup = currentUrl.searchParams.has('setup')
  if (setup) {
    window.document.body.addEventListener(
      'context-request',
      contextRequestListener,
    )
  }
}