# NoticeBoxElement

A versatile notification component for displaying status messages, warnings, or
informational content.

- Simple UI component to display notices or alerts.
- Supports 'info', 'warn', and 'error' variants to represent different levels of
  importance or severity.
- The component's appearance changes dynamically based on the `variant`
  attribute, demonstrating attribute observation and dynamic rendering.

Written in plain JavaScript and using standard Web APIs as a native Web
Component for runtime independence and reusability.

## Setup

Register the element under the name you need

```js
import { NoticeBoxElement } from 'https://renoirb.com/esm-modules/notice-box-element'
customElements.define('notice-card', NoticeBoxElement)
```

Then you can use it.

```html
<notice-card variant="warn">
  <strong slot="header">Important Notice</strong>
  <p>Your message here...</p>
</notice-card>
```

If your existing code base has the same type of component, you should be able to
replace your component with this import.
