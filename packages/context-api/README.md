# Context API Web Component Utilities

Utilities to allow separating the concern handled by a dependency closer to the
application and further from the web component that can request for it.

## Setup

For example, say we want to update components that supports displaying date by
responding with an object with formatted dates (e.g. `date`, `isoString`,
`unixExpoch`, `human`) such as
[value-date-element][renoirb-value-date-element-readme], we can simply setup our
web application to respond and update the components.

Note that the shape of an object with the properties: `date`, `isoString`,
`unixExpoch`, `human` as example is the only requirement.

```js
import dayjs from 'https://esm.archive.org/dayjs'
import { ContextRequest_DateConversion } from 'https://renoirb.com/esm-modules/value-date-element/browser.mjs'

window.document.addEventListener('context-request', (event) => {
  if (event.context === ContextRequest_DateConversion) {
    event.stopPropagation()
    const date = event.target.getAttribute('date')
    if (date) {
      const data = dayjs(date)
      const unixEpoch = data.unix()
      const isoString = data.toISOString()
      const human = data.format('MMM D, YYYY')
      event.callback({ date, isoString, unixEpoch, human })
    }
  }
})
```

## References

### Bookmarks

- https://github.com/renoirb/blogtini/commit/b1ff915a1dc9b2971700da5dd5d89068f43dcd9f
- https://github.com/traceypooh/blogtini/pull/5/files

### Context API Protocol

This is following the ContextAPI community protocol, to read more about it

- [**W3C** Web Components Community Group — **Context Protocol**](https://github.com/webcomponents-cg/community-protocols/blob/d81a5fb5/proposals/context.md)

[renoirb-value-date-element-readme]:
  https://renoirb.com/esm-modules/value-date-element/README.md
