# Context API Web Component Utilities

Implementation of the W3C Web Components Community Group Context API protocol.

Utilities to allow separating the concern handled by a dependency closer to the
application and further from the web component that can request for it.

## Setup

### From a component

For example, you want to create your own element to display a date yourself. You
may have found
'`[https://renoirb.com/esm-modules/value-date-element](https://renoirb.com/esm-modules/value-date-element)`',
but you want it differently.

Assuming you just need to have data formatted as ISO, UNIX Epoch, and a human
readable for your component.

The shape of data we want, a "_contextResponse_" could look like
`{ date: '...', isoString: '...', unixEpoch: '...', human: '...' }`, and we
define a name, say `'date-conversion'`.

```js
import { ContextRequestEvent } from 'https://renoirb.com/esm-modules/context-api'

export class SomeExampleElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const template = document.createElement('template')
    template.innerHTML = `
      <time datetime>
        <!-- rest of your implementation -->
      </time>
    `
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    const datetime = this.getAttribute('datetime')
    if (datetime) {
      const subjectEl = this.shadowRoot.querySelector('time')
      subjectEl.innerText = datetime
      subjectEl.setAttribute('datetime', datetime)
      this.dispatchEvent(
        new ContextRequestEvent(
          'date-conversion',
          this._onDateConversionContextEvent,
        ),
      )
    }
  }

  _onDateConversionContextEvent = (contextResponse) => {
    const { human, isoString, unixEpoch } = contextResponse
    const timeEl = this.shadowRoot.querySelector('time')
    if (isoString) {
      timeEl.setAttribute('datetime', isoString)
    }
    if (human) {
      timeEl.textContent = human
    }
    if (unixEpoch) {
      timeEl.setAttribute('data-unix-epoch', unixEpoch)
    }
  }
}
```

### Setup ContextRequest Event Listener

**WARNING** Make sure this is bound to the document earlier than the elements
making use for that `ContextEvent`

```js
import dayjs from 'https://cdn.skypack.dev/dayjs'

window.document.addEventListener('context-request', (event) => {
  if (event.context === 'date-conversion') {
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

The shape `{ date: '...', isoString: '...', unixEpoch: '...', human: '...' }` is
the data for the `'date-conversion'` context.

## References

### Bookmarks

- https://github.com/renoirb/blogtini/commit/b1ff915a1dc9b2971700da5dd5d89068f43dcd9f
- https://github.com/traceypooh/blogtini/pull/5/files

### Context API Protocol

This is following the ContextAPI community protocol, to read more about it

- [**W3C** Web Components Community Group — **Context Protocol**](https://github.com/webcomponents-cg/community-protocols/blob/d81a5fb5/proposals/context.md)

[renoirb-value-date-element-readme]:
  https://renoirb.com/esm-modules/value-date-element/README.md
