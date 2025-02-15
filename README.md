# ESM Modules Collection

A collection of standalone ESM/MJS modules and Web Components for modern web
development. Each module is designed to be imported directly in browsers or
other JavaScript runtimes.

> **Current Status**: This repository is being established to manage existing
> modules that are already published at `renoirb.com/esm-modules/`. The modules
> listed below are currently available but will be migrated to this new
> management structure.

## Available Modules

### Web Components

#### [Notice Box Element](./packages/notice-box-element/README.md)

A versatile notification component for displaying status messages, warnings, or
informational content.

#### [Component Showcase Element](./packages/component-showcase-element/README.md)

Visualize many variations of usage of a web component.

#### [Inline Note Element](./packages/inline-note-element/README.md)

Wrap text to add comments, remove or add section in the text. It can be used to
do hilighting or commenting.

#### Application Layout Element

A customizable application shell component providing consistent navigation and
structure across pages.

<!-- TODO: Migrate AppLayoutElement -->

#### Value Boolean Element

Visual representation of boolean states using icons.

<!-- TODO: Migrate ValueBooleanElement -->

#### Markdown Content Element

A markdown rendering container that lets you use your preferred markdown parser.

<!-- TODO: Migrate MarkdownContentElement markdown-content -->

### Utility Modules

#### [Element Utils](./packages/element-utils/README.md)

Helper functions for Web Component registration and common DOM operations.

#### [Context API](./packages/context-api/README.md)

Implementation of the W3C Web Components Community Group Context API protocol.

<!-- TODO: Upgrade version as the documented version was before it got released in @lit/context -->

#### Load From GitHub

Load and render markdown content from GitHub Gists.

<!-- TODO: Migrate loadFromGitHub -->

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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and setup
instructions.

## License

[MIT License](./LICENSE.md)
