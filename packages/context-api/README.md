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
          this,
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

## More To Come

### Upgrade API

The API version changed since the code samples were created, they're released in
@lit/context

The experimentations were mostly written back around 2022.

Among the API changes
[we now have `contextTarget` that's been added](https://github.com/lit/lit/compare/%40lit/context%401.1.3...lit:a66737f#diff-0ac16504b1478a71748d852ad8f58f66301be80264e9caa6307252837992c6e0R30-R78),
that is probably the thing I was trying to remember when I wrote the
`__temporary_hack__` and the ContextEvent to have a reference to the node
emitting the event.

Thoughts:

- It is either I copy-paste from source lit implementation or import
- If it is importing: maybe I'll have to use
  [`deps.ts` pattern to import if I want to extend](https://dotland.deno.dev/manual@v1.32.0/examples/manage_dependencies)

<!--

Probably this won't work like that.

Because I use at root import map full URLs as module, I get the error:

> Warning "imports" and "scopes" field is ignored when "importMap" is specified in the root config file.

```patch
diff --git a/packages/context-api/deno.json b/packages/context-api/deno.json
index 418d..ad79 100644
--- a/packages/context-api/deno.json
+++ b/packages/context-api/deno.json
@@ -4,5 +4,8 @@
   "exports": {
     ".": "./browser.mjs",
     "./browser": "./browser.mjs"
+  },
+  "imports": {
+    "@lit/context": "npm:@lit/context@1.1.4"
   }
 }
\ No newline at end of file
```

-->

### Fast has a "Context"

[@microsoft/fast](https://www.npmjs.com/package/@microsoft/fast-element) NPM
package ([site](https://fast.design/)) now also has a
[Context API](https://github.com/microsoft/fast/blob/dd87b12b/packages/web-components/fast-element/src/context.ts)
([docs](https://fast.design/docs/api/fast-element/context/fast-element))

> Enables using:
> [W3C Community Context protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md).

([source](https://fast.design/docs/api/fast-element/context/fast-element#:~:text=Enables%20using:%20W3C%20Community%20Context%20protocol))

```ts
type Context = Readonly<
    eventType: "context-request";
    for<T = unknown>(name: string): FASTContext<T>;
    create<T_1 = unknown>(name: string, initialValue?: T_1 | undefined): FASTContext<T_1>;
    setDefaultRequestStrategy(strategy: FASTContextRequestStrategy): void;
    get<T_2 extends UnknownContext>(target: EventTarget, context: T_2): ContextType<T_2>;
    request<T_3 extends UnknownContext>(target: EventTarget, context: T_3, callback: ContextCallback<ContextType<T_3>>, multiple?: boolean): void;
    dispatch<T_4 extends UnknownContext>(target: EventTarget, context: T_4, callback: ContextCallback<ContextType<T_4>>, multiple?: boolean): void;
    provide<T_5 extends UnknownContext>(target: EventTarget, context: T_5, value: ContextType<T_5>): void;
    handle<T_6 extends UnknownContext>(target: EventTarget, callback: (event: ContextEvent<T_6>) => void, context?: T_6 | undefined): void;
    defineProperty<T_7 extends UnknownContext>(target: Constructable<EventTarget> | EventTarget, propertyName: string, context: T_7): void;
>
```

([source](https://fast.design/docs/api/fast-element/context/fast-element.context))

### Look for `ContextConsumer` from lit

See example usage in following Gist.

https://gist.github.com/renoirb/d0d92314b04927c8513a86810902a53a

### Other Experiments

There's some bad code in the following gist, but there's also good too.

https://gist.github.com/renoirb/21e31aab8d4cbcebb24afede7c49e449#file-context-api-ts

## References

### Bookmarks

- https://github.com/renoirb/blogtini/commit/b1ff915a1dc9b2971700da5dd5d89068f43dcd9f
- https://github.com/traceypooh/blogtini/pull/5/files

### Context API Protocol

This is following the ContextAPI community protocol, to read more about it

- [**W3C** Web Components Community Group — **Context Protocol**](https://github.com/webcomponents-cg/community-protocols/blob/d81a5fb5/proposals/context.md)

- https://github.com/lit/lit/pull/1955
- https://github.com/lit/lit/blob/%40lit-labs%2Fcontext%400.2.0/packages/labs/context/src/lib/context-request-event.ts
- https://github.com/lit/lit/blob/%40lit-labs/context%400.2.0/packages/labs/context/src/lib/value-notifier.ts
- https://github.com/lit/lit/blob/%40lit-labs/context%400.2.0/packages/labs/context/src/lib/context-root.ts

[renoirb-value-date-element-readme]:
  https://renoirb.com/esm-modules/value-date-element/README.md
