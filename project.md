# ESM Modules Development Workbench

A development infrastructure focused on simplicity and modularity for creating
portable JavaScript modules. This workbench emphasizes writing well-tested,
platform-agnostic code that can be easily adapted to any JavaScript runtime
environment.

## Status Indicators

- ☒ Done/Complete
- ▣ In Progress
- ▢ Code ready to migrate
- ⬚ Planned

## Core Principles

### Runtime Independence

- Write once, run anywhere JavaScript runs
- Platform-agnostic core logic
- Runtime-specific entry points
- Current targets include:
  - Browsers (ESM imports over HTTP, e.g.
    `import from 'https://example.org/main.mjs'`)
  - Deno
  - Node.js
  - CloudFlare Workers
  - NGINX JavaScript (ngx_http_js)
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
  - ⬚ Testing framework
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
│   │   │   ├── core/           # Platform-agnostic logic
│   │   │   ├── browser/        # Browser-specific entry
│   │   │   ├── deno/          # Deno-specific entry
│   │   │   └── {runtime}/     # Other runtime entries
│   │   ├── tests/
│   │   │   ├── core/          # Core logic tests
│   │   │   └── runtime/       # Runtime-specific tests
│   │   └── package.json
│   └── ...
└── scripts/
    └── build.ts
```

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
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils.mjs'
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

   - ▣ Basic project structure
   - ⬚ Testing conventions and tooling
   - ⬚ Documentation loading (using existing `loadFromGitHub`)

2. First Components Migration

   - ▢ notice-box
     - Simple UI component
     - Core testing patterns
   - ▢ markdown-content
     - Content handling patterns
     - Integration testing examples
   - ▢ element-utils
     - Support utilities
     - Unit testing foundation

   - ▢ notice-box-element
     - Simple UI component to display notices or alerts.
     - Supports 'info', 'warn', and 'error' variants to represent different
       levels of importance or severity.
     - Implemented as a native Web Component for runtime independence and
       reusability.
     - Styling is currently done via inline styles and TailwindCSS class names,
       with room for improvement in terms of theming and customization.
     - The component logic is written in plain JavaScript, adhering to the
       project's principle of using standard Web APIs.
     - The component's appearance changes dynamically based on the `variant`
       attribute, demonstrating attribute observation and dynamic rendering.

3. Development Tools
   - ⬚ Component workbench (using migrated components)
     - ⬚ README display (using `markdown-content`)
     - ⬚ Component variants (using `notice-box` for status)
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
