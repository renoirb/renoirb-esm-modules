# ESM Modules Collection

A collection of standalone ESM/MJS modules and Web Components for modern web
development. Each module is designed to be imported directly in browsers or
other JavaScript runtimes.

> **Current Status**: This repository is being established to manage existing
> modules that are already published at `renoirb.com/esm-modules/`. The modules
> listed below are currently available but will be migrated to this new
> management structure.

## Quick Start

Import and use components directly in your HTML:

```html
<my-app-layout>
  <notice-card variant="warn">
    <strong slot="header">Document status: DRAFT</strong>
    <p>The contents of this page are currently in draft status.</p>
  </notice-card>
</my-app-layout>

<script type="module">
  import AppLayout from 'https://renoirb.com/esm-modules/app-layout-element.mjs'
  import NoticeBox from 'https://renoirb.com/esm-modules/notice-box-element.mjs'
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils.mjs'

  registerCustomElement('my-app-layout', AppLayout)
  registerCustomElement('notice-card', NoticeBox)
</script>
```

## Available Modules

### Web Components

#### [Notice Box Element](./packages/notice-box-element/README.md)

A versatile notification component for displaying status messages, warnings, or
informational content.

#### Application Layout Element

A customizable application shell component providing consistent navigation and
structure across pages.

```html
<my-app-layout>
  <!-- Your page content -->
</my-app-layout>
```

#### Value Boolean Element

Visual representation of boolean states using icons.

```html
<dl>
  <dt>Status</dt>
  <dd><value-boolean value="true"></value-boolean></dd>
</dl>
```

The person could see equivalent of;

```html
<dl>
  <dt>Read</dt>
  <dd><span label="Yes">👍</span></dd>
</dl>
```

#### Markdown Content Element

A markdown rendering container that lets you use your preferred markdown parser.

<!-- prettier-ignore-start -->
```html
  <kool-mark-a-dawn>

# My Cool Page

Hello **World**.

  </kool-mark-a-dawn>

<script type="module">
  import {
    ContextRequest_MarkdownContent,
    default as MarkdownContentElement,
  } from 'https://renoirb.com/esm-modules/markdown-content.mjs'
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils.mjs'

  registerCustomElement('kool-mark-a-dawn', MarkdownContentElement)

  // Handle markdown conversion with your preferred library
  const handler = (event) => {
    if (event.context === ContextRequest_MarkdownContent) {
      event.stopPropagation()
      // Use your markdown parser here
      event.callback({
        markdown: event.target.innerHTML,
        html: convertMarkdown(event.target.innerHTML),
      })
    }
  }
  document.addEventListener('context-request', handler)
</script>
```
<!-- prettier-ignore-end -->

### Utility Modules

#### [Element Utils](./packages/element-utils/README.md)

Helper functions for Web Component registration and common DOM operations.

#### [Context API](./packages/context-api/README.md)

Implementation of the W3C Web Components Community Group Context API protocol.

#### Load From GitHub

Load and render markdown content from GitHub Gists.

```javascript
import loadFromGitHub from 'https://renoirb.com/esm-modules/load-from-github.mjs'

loadFromGitHub(
  document.querySelector('#target'),
  'gist-id',
  'filename.md',
  true,
)
```

## Design Philosophy

Each module is:

- Self-contained with minimal dependencies
- Written using standard Web APIs
- Flexible for different use cases
- Framework-agnostic

Web Components are:

- Exported as native classes without registration
- Customizable through standard patterns
- Designed for composition

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and setup
instructions.

## License

[MIT License](./LICENSE.md)
