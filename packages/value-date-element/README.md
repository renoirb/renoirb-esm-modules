# Value Date Element

Batteries non included element specialized for displaying date related values.

## Setup

Leverage [**Context API**][renoirb-context-api-readme], to handle date
formatting.

```js
import dayjs from 'https://esm.archive.org/dayjs'
import { ContextRequest_DateConversion } from 'https://renoirb.com/esm-modules/value-date-element/browser.mjs'

window.document.addEventListener('context-request', (event) => {
  if (event.context === ContextRequest_DateConversion) {
    event.stopPropagation()
    const date = event.target.getAttribute('date')
    if (date) {
      const data = dayjs(date)
      const dateUnix = data.unix()
      const dateIsoString = data.toISOString()
      const dateHuman = data.format('MMM D, YYYY') // TODO: Make format configurable
      event.callback({ date, dateIsoString, dateUnix, dateHuman })
    }
  }
})
```

## References

[renoirb-context-api-readme]:
  https://renoirb.com/esm-modules/context-api/README.md
