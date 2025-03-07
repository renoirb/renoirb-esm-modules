# ESM Modules Collection

A collection of standalone ESM/MJS modules and Web Components for modern web
development. Each module is designed to be imported directly in browsers or
other JavaScript runtimes.

> **Current Status**: This repository is being established to manage existing
> modules that are already published at `renoirb.com/esm-modules/`. The modules
> listed below are currently available but will be migrated to this new
> management structure.

## Design Philosophy

Each module is:

- Self-contained with minimal dependencies
- Written using standard Web
  <abbr title="Application Programming Interface">API</abbr>s
- Flexible for different use cases
- Framework-agnostic

Web Components are:

- Exported as native classes without registration
- Customizable through standard patterns
- Designed for composition

## Available Modules

#### Abbreviations Dictionary Element

Utilities to correctly wrap known abbreviations with HTML abbr tags and text to
describe them

<!-- TODO: Migrate

- https://github.com/renoirb/site/blob/2020/lib/model/abbreviations.ts

Other possible names:
- abbr-injector
- abbr-expander
- abbr-processor
- abbr-annotator

Input:

```html
<abbr-dictionary>
  It's best we leverage HTML by its original principles first before *trying* to reimplement what's native
</abbr-dictionary>
```

Output:

```html
<abbr-dictionary>
  It's best we leverage <abbr title="Hyper Text Markup Language">HTML</abbr> by its original principles first before *trying* to reimplement what's native
</abbr-dictionary>
```
-->

#### [Application Layout Element](./packages/app-layout-element/README.md)

A customizable application shell component providing consistent navigation and
structure across pages.

<!-- TODO: Migrate AppLayoutElement
-->

### [Component Showcase Element](./packages/component-showcase-element/README.md)

Visualize many variations of usage of a web component.

### [Context API](./packages/context-api/README.md)

Implementation of the W3C Web Components Community Group Context API protocol.

There's [more to come](./packages/context-api/README.md#more-to-come) to be
migrated and version upgraded.

<!-- TODO: ^ -->

### [Element Utils](./packages/element-utils/README.md)

Helper functions for Web Component registration and common DOM operations.

<!-- TODO: Migrate

- DOM Coercion
  - https://gist.github.com/renoirb/3cb1622d7304efc713e3a8ff28b828d3
    - coerceGlobalWindow
    - coerceOwnerDocument
    - assertsIsDocument
  - https://gist.github.com/renoirb/850de479d101af6928643775c12524b1#file-reactivity-ts-L7-L37
    - assertsIsScalarOnlyRecord
    - assertsIsRecord
  - https://gist.github.com/renoirb/16f391e0cbd4e4e04f368c06b396e650#isobject
    - isObject
    - isHtmlElement
    - isElement
    - isNode
    - createReadOnlySet
-->

### [Inline Note Element](./packages/inline-note-element/README.md)

Wrap text to add comments, remove or add section in the text. It can be used to
do hilighting or commenting.

### Layout Variant

An utility to flip className on the page body and an event emitter to listen to
to adjust parts of the page when a variant change occurs

<!-- TODO: Migrate

- https://gist.github.com/renoirb/850de479d101af6928643775c12524b1?permalink_comment_id=3769449#gistcomment-3769449
  - See notes about Observable from vue/runtime-dom-tests and microsoft/fast observables
- https://gist.github.com/renoirb/16f391e0cbd4e4e04f368c06b396e650#layoutvariant
- https://renoirb.com/esm-modules/layout-variant.mjs

-->

### Load From GitHub

Load and render markdown content from GitHub Gists.

<!-- TODO: Migrate loadFromGitHub -->

### Markdown Content Element

A markdown rendering container that lets you use your preferred markdown parser.

<!-- TODO: Migrate

- MarkdownContentElement markdown-content
- https://gist.github.com/renoirb/21e31aab8d4cbcebb24afede7c49e449 and currency amount
-->

### Stateful Purgatory

An utilty to keep track of things we should keep in mind until we haven't seen
them so we no longer need to care for them anymore.

<!-- TODO: Migrate

- https://gist.github.com/renoirb/400c50986eaefd9b9b8936d44a6e670b

With notificaiton channel? https://gist.github.com/renoirb/e9d82c18077e45dbd09de4e0936773a7

-->

### Taxonomy

<!-- TODO: Migrate

That'll also be the first in TypeScript to remain in TypeScript, to work on transpilation.

- labeler https://github.com/renoirb/site/blob/2020/lib/model/labeler.ts
- https://github.com/renoirb/site/blob/2020/lib/model/taxonomy.ts
- display tags https://github.com/renoirb/site/blob/2020/components/AppArticleTags.vue
- `nuxtPageAsyncDataForTaxonomyList`  https://github.com/renoirb/site/blob/2020/lib/model/content/model.ts#L253

-->

### [Notice Box Element](./packages/notice-box-element/README.md)

A versatile notification component for displaying status messages, warnings, or
informational content.

### [Value Date Element](./packages/value-date-element/README.md)

Batteries non include element specialized for displaying date related values.

There's
[more to come that isn't migrated](./packages/value-date-element/README.md#more-to-come)

<!-- TODO: moar -->

### Value Trinary Element

Visual representation of a boolean (plus one) state value using icons.

<!-- TODO: Migrate ValueBooleanElement

- https://gist.github.com/renoirb/8f32a7c4738bbdee7479c78fd0d2bffe

-->

### Focus By

Creates a menu button that opens a menu of links, refactoring WAI’s example as
an example for reusability.

<!-- TODO: Migrate

- https://gist.github.com/renoirb/c14050700e634099646823abead68c8f

-->

### WayBack Enabled Anchor

Add WayBack Machine links beside link to allow comparing with past versions.

<!-- TODO: Migrate

- https://github.com/renoirb/site/blob/2020/components/global/AppLinkCompareItem.ts

Other possible names:
- archive-linked-anchor
- wayback-enabled-anchor
- version-history-anchor


Input example:

```html
<p>
  Lorem Ipsum dolor
  <a
    href="https://example.org/foo/bar"
    data-wayback="111111 222222 333333"
   >
     sit amet
   </a>
   etcetera
</p>
```

Output:

```html
<p>
  Lorem Ipsum dolor
  <span data-with-alternate-versions>
    <a href="https://example.org/foo/bar">sit amet</a>
    <small>(
      <a href="https://web.archive.org/web/111111/http://example.org/" title="WayBack Machine as of 111111">😀</a>
    )</small>
  </span>
  etcetera
</p>
```
-->

### [Workbench Maintenance Utils](./packages/workbench-maintenance-utils/README.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and setup
instructions.

## License

[MIT License](./LICENSE.md)
