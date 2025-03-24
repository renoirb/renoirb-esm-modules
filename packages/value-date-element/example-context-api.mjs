import {
  /*                                  */
  createMemoizedLoader,
  ThrottledProcessor,
} from '@renoirb/element-utils'
import {
  /*                                  */
  ContextRequest_DateConversion,
  assertIsDateConversionContextPayload,
} from '@renoirb/value-date-element'

const loadDayjs = createMemoizedLoader(
  'https://cdn.skypack.dev/dayjs',
  async (module) => {
    const dayjs = module.default

    // Import and configure plugins in parallel for efficiency
    const [
      { default: weekdayPlugin },
      { default: customParseFormatPlugin },
      // Add other plugins as needed
    ] = await Promise.all([
      import('https://cdn.skypack.dev/dayjs/plugin/weekday'),
      /**
       * https://day.js.org/docs/en/plugin/custom-parse-format
       * https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens
       */
      import('https://cdn.skypack.dev/dayjs/plugin/customParseFormat'),
      // Add other imports as needed
    ])

    // Configure all plugins
    dayjs.extend(weekdayPlugin)
    dayjs.extend(customParseFormatPlugin)

    return dayjs
  },
)

// Create shared processor for date conversions
const taskQueue = new ThrottledProcessor({ maxConcurrent: 5 })

export const contextRequestListener = async (event) => {
  if (event.context !== ContextRequest_DateConversion) {
    return
  }
  event.stopPropagation()

  await taskQueue.add(async () => {
    const dayjsModule = await loadDayjs()
    const dayjs = dayjsModule.default

    let date

    try {
      const contextTarget = event.contextTarget
      const format = contextTarget.dataset.dateFormat || 'MMM D, YYYY'
      const formatLocale = contextTarget.dataset.dateLocale || 'en'
      date = contextTarget.getAttribute('datetime')
      if (date) {
        const formatter = dayjs(date)
        const unixEpoch = formatter.unix()
        const isoString = formatter.toISOString()
        const human = formatter
          .locale(formatLocale)
          .format(format, formatLocale)
        const payload = { date, human, isoString, unixEpoch }
        assertIsDateConversionContextPayload(payload)
        event.callback(payload)
      }
    } catch (error) {
      console.error('Error processing date conversion:', error)
      // Even on error, we should provide a valid payload to avoid breaking components
      event.callback({
        date,
        human: date,
        isoString: date,
        unixEpoch: 0,
      })
    }
  })
}

if (typeof window !== 'undefined') {
  const currentUrl = new URL(import.meta.url)
  const setup = currentUrl.searchParams.has('setup')
  if (setup) {
    window.document.addEventListener(
      'context-request',
      contextRequestListener,
    )
    loadDayjs().catch((error) => {
      console.warn('Failed to pre-load dayjs:', error)
    })
    window.addEventListener('unload', () => {
      window.document.removeEventListener(
        'context-request',
        contextRequestListener,
      )
      taskQueue.destroy()
    })
  }
}