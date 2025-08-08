# @renoirb/context-api: Web Component Context Protocol Utilities

This package provides utilities for implementing the
[W3C Web Components Community Group's Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md).
This protocol offers a lightweight, framework-agnostic way for web components to
request contextual data from ancestor elements, avoiding prop drilling and
promoting loose coupling. It's _distinct_ from React's Context API.

## What is the _Context_ Protocol?

The _Context_ Protocol is a standardized way for web components to request data
~~or services~~ from their ancestors in the DOM tree _without_ needing to know
exactly where that data comes from. Components fire a `context-request` event,
and any ancestor element can listen for and respond to that event, providing the
requested data.

**Key Benefits:**

- **Reduced Coupling:** Components don't need direct references to data
  providers.
- **Simplified Components:** Avoids "prop drilling" (passing data down through
  multiple levels of components).
- **Framework Agnostic:** Works with any web component library or framework (or
  no framework at all).
- **Testability:** Easier to test components in isolation by providing mock
  context providers.

## Implementation Notes

This package provides zero-dependency implementations of core **Context Protocol** utilities:

- `ContextRequestEvent` - For components to request context
- `ContextProviderEvent` - For providers to announce availability
- `ContextRoot` - For buffering requests before providers are ready
- Helper utilities for simplified provider registration

These implementations are inspired by and compatible with
[Lit's @lit/context](https://lit.dev/docs/data/context/) package,
but simplified to remove framework dependencies.
While Lit offers a complete reactive system with ValueNotifier and
Controllers for automatic updates, this package focuses on the core
event-based communication pattern.

**Key differences from Lit:**
- No automatic reactive updates (no ValueNotifier)
- No lifecycle management (no Controllers)
- Pure JavaScript, no framework required
- Same Context Protocol compliance

This makes the Context Protocol accessible to any project without
requiring a specific framework.

## Setup

This section demonstrates how to use `@renoirb/context-api` to provide and
consume contextual data, simplifying component development and avoiding code
duplication.

We'll use the example of a component that needs to display a formatted date.

However, keep in mind that this is just _one example_ of how the W3C Context API
protocol can be used. The power of this protocol lies in its ability to define
_multiple, named contexts_, each with its own specific data shape.

### 1. Defining a Context: The "date-conversion" Example

The W3C Context API protocol allows you to create _named contexts_ to share data
between components.

Each context has a defined _data shape_ (the structure of the object it
provides).

For our example, we'll define a `date-conversion` context. This context provides
pre-formatted date strings to components, eliminating the need for each
component to handle its own date formatting logic.

Here's the data shape for the `date-conversion` context:

```json
{
  "date": "...",   // The original date string (acts as the "input" or "key").
  "isoString": "", // The date formatted as an ISO 8601 string (e.g., "2025-03-21T14:30:00Z").
  "unixEpoch": "", // The date as a Unix timestamp (seconds since the epoch).
  "human": ""      // The date formatted in a human-readable way (e.g., "Mar 21, 2025").
}
```

You could create other named contexts, such as:

- user-profile: Might contain `{ name, email, avatarUrl, ... }`.
- product-details: Might contain
  `{ id, name, price, description, imageUrl, ... }`.
- theme-settings: Might contain
  `{ primaryColor, secondaryColor, fontFamily, ... }`.

Each of these contexts would have its own defined data shape, allowing
components to request the specific contextual information they need.

### 2. Requesting Context (in a Component)

Imagine you're building a custom element, `<my-date>`, to display dates.

You _could_ handle all the date formatting logic directly within the component,
but that would make it less reusable, harder to test, and potentially lead to
duplicated code if other components also need formatted dates.

Instead, you can use the Context API protocol to _request_ the pre-formatted
date strings from an ancestor element. This keeps the `<my-date>` component
simple and focused on _displaying_ the date, not formatting it. The component
doesn't need to know _where_ the formatting logic lives, only that it can
request the `date-conversion` context.

**NOTE**: The following is a simplified implementation of
[@renoirb/value-date-element](../value-date-element/) to illustrate the
mechanics.

```javascript
// Hypothetical location: https://example.org/esm/my-date-component.mjs

import { ContextRequestEvent } from 'https://dist.renoirb.com/esm/own/context-api/v1.0.0/browser.mjs'

export class MyDateComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
      <time></time>
      <style>
        :host { display: inline-block; }
      </style>
    `
  }

  connectedCallback() {
    const datetime = this.getAttribute('datetime')
    if (!datetime) {
      return // No datetime attribute, nothing to do.
    }
    this.dispatchEvent(
      new ContextRequestEvent(
        'date-conversion',   // The context key (imported or defined here), later found as: event.context
        this,                // The requesting element, later found as: event.contextTarget.
        this.handleDateData, // Callback to receive the data, later found as: event.callback.
      ),
    )
  }

  // Use a named method for the callback.
  handleDateData = (contextData) => {
    const { human, isoString, unixEpoch } = contextData
    const timeEl = this.shadowRoot.querySelector('time')

    if (isoString) {
      timeEl.setAttribute('datetime', isoString)
    }
    if (human) {
      timeEl.textContent = human
    }
    if (unixEpoch) {
      timeEl.dataset.unixEpoch = unixEpoch
    }
  }
}

// Do NOT call customElements.define here.  This allows for:
// 1. Renaming:  customElements.define('my-date', MyDateComponent);
// 2. Extending: class MySpecialDate extends MyDateComponent { ... }
// 3. Conditional Registration: if (someCondition) { ... }

export default MyDateComponent
```

### 3. Providing Context (in an Ancestor)

An ancestor element (or `window.document`) needs to listen for `context-request`
events and provide the data for the `date-conversion` context.

This provider is typically a higher-level component in your application, or part
of your application's setup. The provider is responsible for:

1.  Listening for `context-request` events.
2.  Checking if the requested context is one it can provide (`date-conversion`
    in this case).
3.  Retrieving any necessary data from the requesting component (like the date
    string and desired format).
4.  Performing the formatting logic (using `dayjs` in this example).
5.  Calling the `callback` function provided in the `ContextRequestEvent` with
    the formatted data.

Importantly, the context provider must be registered _before_ any components
request the context. This is typically done in the `<head>` of your HTML
document, or very early in your application's initialization.

```js
// Hypothetical location: https://example.org/my-date-component-resolver.mjs

import dayjs from 'https://cdn.skypack.dev/dayjs'

export const contextRequestListener = async (event) => {
  if (event.context !== 'date-conversion') {
    return
  }
  event.stopImmediatePropagation() // Updated from stopPropagation

  const contextTarget = event.contextTarget
  const format = contextTarget.dataset.dateFormat || 'MMM D, YYYY'
  const formatLocale = contextTarget.dataset.dateLocale || 'en'
  const date = contextTarget.getAttribute('datetime')
  if (date) {
    const formatter = dayjs(date)
    const unixEpoch = formatter.unix()
    const isoString = formatter.toISOString()
    const human = formatter.locale(formatLocale).format(format, formatLocale)
    const payload = { date, human, isoString, unixEpoch }
    event.callback(payload)
  }
}

/**
 * IMPORTANT: Make sure this is bound to the document earlier as possible
 */
window.document.addEventListener('context-request', contextRequestListener)
```

### 4. Using

To use the MyDateComponent, you need to first set up the Context Provider, then
register your component.

**IMPORTANT**: Make sure that you do not `customElements.define` before setting
the this is bound to the document earlier as possible

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Context Example</title>
    <script type="importmap">
      {
        "imports": {
          "@renoirb/context-api": "https://dist.renoirb.com/esm/own/context-api/v1.0.0/browser.mjs",
          "my-date": "https://example.org/esm/my-date-component.mjs"
        }
      }
    </script>
    <script type="module">
      // Attach the listener VERY EARLY, in the <head>.
      const contextRequestListener = async (event) => {
        /* Earlier contextRequestListener example */
      }
      window.document.addEventListener(
        'context-request',
        contextRequestListener,
      )
    </script>
  </head>
  <body>
    <h1>Context API Example</h1>
    <my-date-c datetime="2024-07-15" data-date-format="YYYY-MM-DD"></my-date-c>
    <my-date-c datetime="2025-01-01"></my-date-c>
    <script type="module">
      import MyDateComponent from 'my-date'
      customElements.define('my-date-c', MyDateComponent)
    </script>
  </body>
</html>
```

## Other implementations

### Microsoft’s [FAST](https://fast.design/) Design System

[@microsoft/fast](https://www.npmjs.com/package/@microsoft/fast-element) NPM
package ([site](https://fast.design/)) now also has a
[Context API](https://github.com/microsoft/fast/blob/dd87b12b/packages/web-components/fast-element/src/context.ts)
([docs](https://fast.design/docs/api/fast-element/context/fast-element))

> Enables using:
> [W3C Community Context protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md).

([source](https://fast.design/docs/api/fast-element/context/fast-element#:~:text=Enables%20using:%20W3C%20Community%20Context%20protocol))

<!--
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
-->

### [Lit.dev](https://lit.dev/)

### [Lit.dev](https://lit.dev/) (Reference Implementation)

Lit provides the most complete Context API implementation with full reactive capabilities. This `@renoirb/context-api` package draws inspiration from Lit's design while providing a minimal, framework-free alternative.

Look for `ContextConsumer`, `ContextProvider`, and `ContextRoot` in the [@lit/context package](https://github.com/lit/lit/tree/main/packages/context).

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

[renoirb-value-date-element-readme]: ../value-date-element/
