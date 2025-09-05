# AppLayoutElement

A responsive application shell Web Component that provides consistent navigation
structure and content layout across web applications.

Handles the "chrome" of your application - navigation bars, sidebars, footer -
without routing concerns.

## Features

- **Responsive Layout**: Desktop navigation bar, mobile with a slide-out sidebar
- **Interactive Navigation**: Functional "hamburger" menu with accessibility
  support
- **Slot-Based Customization**: Configure navigation and content areas
- **Print Optimization**: Automatically hides navigation and optimizes layout
  for printing
- **Accessibility**: ARIA states, focus management, keyboard navigation (ESC to
  close)
- **Framework Agnostic**: Works with any JavaScript framework or vanilla HTML
- **Shadow DOM Encapsulation**: Isolated styling with external stylesheet
  support

## Installation

```html
<!-- importMap in the document head as early as possible -->
<script type="importmap">
  {
    "imports": {
      "@renoirb/app-layout-element": "https://dist.renoirb.com/esm/own/app-layout-element/v1.0.0/browser.mjs",
      "@renoirb/element-utils": "https://dist.renoirb.com/esm/own/element-utils/v0.5.0/browser.mjs"
    }
  }
</script>
<script type="module">
  import { AppLayoutAlphaElement } from '@renoirb/app-layout-element'
  customElements.define('app-layout', AppLayoutAlphaElement)
</script>
```

## Basic Usage

```html
<app-layout>
  <span slot="top-left">My Application</span>

  <nav slot="top-right">
    <a href="/dashboard">Dashboard</a>
    <a href="/settings">Settings</a>
    <a href="/profile">Profile</a>
  </nav>

  <nav slot="left-bottom-sidebar">
    <a href="/admin">Admin</a>
    <a href="/reports">Reports</a>
    <a href="/help">Help</a>
  </nav>

  <main>
    <h1>Welcome to My App</h1>
    <p>Your main content goes here...</p>
  </main>
</app-layout>
```

## Available Slots

| Slot Name             | Purpose                  | Responsive Behavior                          |
| --------------------- | ------------------------ | -------------------------------------------- |
| `top-left`            | Brand, logo, or app name | Always visible in header                     |
| `top-right`           | Primary navigation links | Visible on desktop, hidden on mobile         |
| `left-bottom-sidebar` | Secondary navigation     | Slide-out panel on mobile, hidden on desktop |
| `footer-left`         | Footer content and links | Always visible in footer                     |
| (default)             | Main application content | Always visible                               |

## Responsive Behavior

**Desktop (≥768px)**

- Header with `top-left` and `top-right` slots visible
- `left-bottom-sidebar` slot hidden
- Full-width main content area

**Mobile (<768px)**

- Header with `top-left` slot and hamburger menu button
- `top-right` slot hidden
- `left-bottom-sidebar` becomes slide-out navigation
- Tap hamburger to open, tap overlay or press ESC to close

<!--
## Events

The component dispatches custom events for navigation state changes:

```js
document.querySelector('app-layout').addEventListener('app-layout', (event) => {
  console.log('Navigation event:', event.detail.eventName) // 'slide-out-nav:open' or 'slide-out-nav:close'
  console.log('Is open:', event.detail.isOpen)
})
```

## Styling

The component loads external stylesheets automatically and provides CSS custom properties for theming:

```css
app-layout {
  --bg: #f5f5f5;
  --color-title: #262626;
  --color-primary: #333;
  --color-container: #ffffff;
  --color-sandwich-text: #000;
}
```
-->

## Print Support

When printing, the component automatically:

- Hides all navigation elements
- Removes fixed positioning
- Optimizes layout for paper
- Shows full URLs for links

## Requirements

- Modern browser with Web Components support
- ES Module support (or appropriate polyfills)
- The component should be a direct child of `<body>` for optimal layout

## Architecture Notes

This component focuses exclusively on **layout structure** and does not include:

- ❌ Routing or navigation logic
- ❌ State management beyond UI layout
- ❌ Data fetching or API integration
- ❌ Application-specific business logic

It's designed to be the ([MicroFrontend](https://micro-frontends.org/))
"_shell_" that wraps your application content, letting you handle routing and
state management with your preferred tools.

## Development

[Originally developed in Vue.js](https://github.com/renoirb/site/commits/2020/layouts/default.vue)
and ported to native Web Components for maximum compatibility and performance.

## License

MIT

---

_Part of the
[@renoirb ESM modules collection](https://dist.renoirb.com/esm/own/)_
