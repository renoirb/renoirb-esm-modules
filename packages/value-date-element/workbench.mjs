import {
  /*                                  */
  ContextRequest_DateConversion,
  assertIsDateConversionContextPayload,
} from '@renoirb/value-date-element'

import dayjs from 'https://cdn.skypack.dev/dayjs'
import 'https://cdn.skypack.dev/dayjs/locale/pt'
import weekday from 'https://cdn.skypack.dev/dayjs/plugin/weekday'
import customParseFormat from 'https://cdn.skypack.dev/dayjs/plugin/customParseFormat'
dayjs.extend(weekday)
dayjs.extend(customParseFormat)

/**
 * From the client-side, and early in the document, we
 * register handlers for each supported context-request data models
 * and that's where we mount any dependencies
 */
const dateConversionContextResponder = (event) => {
  if (event.context === ContextRequest_DateConversion) {
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
}

window.document.body.addEventListener(
  'context-request',
  dateConversionContextResponder,
)
