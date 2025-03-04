# ESM Modules Development Workbench

A development infrastructure focused on simplicity and modularity for creating
portable JavaScript modules. This workbench emphasizes writing well-tested,
platform-agnostic code that can be easily adapted to any JavaScript runtime
environment.

## Status Indicators

- ⬚ Planned
- ▢ Code ready to migrate
- ▣ In Progress
- ☒ Done/Complete

## Core Principles

### Runtime Independence

- Write once, run anywhere JavaScript runs
- Platform-agnostic core logic
- Runtime-specific entry points
- Current targets include:
  - Browsers (as <abbr title="ECMAScript Modules">ESM</abbr> imports over
    <abbr title="The Hypertext Transfer Protocol">HTTP</abbr>)
  - Deno
  - Node.js
  - CloudFlare Workers
  - <abbr title="Engine X Web Server">NGINX</abbr> JavaScript (ngx_http_js)
  - Future JavaScript platforms

### Development Simplicity

- Isolated, testable core logic
- Pure functions where possible
- Standard Web APIs and patterns
- Self-contained packages
- Clear separation of concerns

### Consumption Flexibility

- No forced dependencies
- Runtime-appropriate entry points
- Direct HTTP imports
- NPM availability when needed
- Versioned distribution

## Development Infrastructure

### Core Tools

- ▣ Deno for development
  - ▣ TypeScript processing
  - ▣ Testing framework
  - ⬚ Build tooling
- ⬚ Minimal build requirements
  - ⬚ Shell scripts or Makefile
  - ⬚ Optional RushJS integration
- ⬚ NPM for distribution (optional)

### Module Structure

```
/
├── packages/
│   ├── {package-name}/
│   │   ├── src/
│   │   │   ├── core/        # Platform-agnostic logic
│   │   │   ├── browser/     # Browser-specific entry
│   │   │   ├── deno/        # Deno-specific entry
│   │   │   └── {runtime}/   # Other runtime entries
│   │   ├── tests/
│   │   │   ├── core/        # Core logic tests
│   │   │   └── runtime/     # Runtime-specific tests
│   │   └── deno.json
│   └── ...
└── scripts/
    └── build.ts
```

Files in `core/` folder are meant to be pure logic that will work anywhere
JavaScript runs.

### Testing Strategy

- Core logic testing in Deno
- Runtime-specific integration tests
- Web Component testing
  - Logic tests in Deno
  - DOM interaction tests
- Performance benchmarks
- Compatibility verification

### Web Components Approach

- Native HTMLElement implementations
- Registration-free class exports
- Core logic separation
- Standard DOM patterns
- Minimal assumptions about runtime

### Distribution Strategy

#### HTTP Direct Access

- ☒ Simple direct imports
  ```js
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils'
  ```
- Current implementation:
  - ☒ Static file hosting
  - ☒ Basic directory structure
  - ☒ Direct file access
- Future enhancements:
  - ⬚ CloudFlare Worker routing
    - ⬚ Path pattern: `/esm-modules/<package-name>@<version>`
    - ⬚ Graceful error handling
    - ⬚ Version negotiation
    - ⬚ Cache management
  - ⬚ Integrity verification
  - ⬚ CORS configuration

#### NPM Registry (Optional)

- Scoped packages
- Version management
- Type definitions
- Platform metadata

## Initial Implementation Priority

1. Core Infrastructure

   - ☒ Basic project structure
   - ▣ Testing conventions and tooling
   - ⬚ Documentation loading (using existing `loadFromGitHub`)

2. First Components, starting by migrating already written ones:

   - ▢ abbr-generator
   - ▣ layout-variant
   - ▣ markdown-content
   - ▢ taxonomy
   - ▣ [element-utils](./packages/element-utils/README.md)
   - ☒ [inline-note-element](./packages/inline-note-element/README.md)
   - ▣ [notice-box-element](./packages/notice-box-element/README.md)
   - ▣ [value-date-element](./packages/value-date-element/README.md)

3. Development Tools
   - ⬚ Component workbench (using migrated components)
     - ⬚ README display (using `markdown-content`)
     - ⬚ Component variants (using
       [notice-box-element](./packages/notice-box-element/README.md) for status)
     - ⬚ Test results visualization

## Development Workflow

### New Module Creation

1. Core logic implementation
2. Test coverage
3. Runtime adaptations
4. Distribution preparation

### Maintenance Process

1. Core updates
2. Test verification
3. Runtime compatibility checks
4. Version management

### Quality Standards

- TypeScript strict mode
- Pure function preference
- Comprehensive testing
- Clear documentation
- Version control hygiene

## Documentation Requirements

### Package Documentation

- Clear purpose statement
- Runtime compatibility matrix
- Usage examples per runtime
- API documentation
- Type definitions

### Web Component Documentation

- Custom element registration
- Properties and attributes
- Events and callbacks
- Slot definitions
- Styling guidelines

## Future Considerations

1. Web Component Development Workbench

   - Simple component preview environment
   - Variant testing interface
   - Runtime behavior verification
   - Lighter alternative to Storybook
   - Live reload capabilities

2. Immediate Migration Priority

   - Existing components migration
     - app-layout
     - notice-box
     - context-api
     - loadFromGitHub
     - value-boolean
     - element-utils

3. Infrastructure Evolution
   - Automated compatibility testing
   - Performance benchmarking suite
   - Documentation site generation
   - Additional runtime support
   - Build process optimization
