# The `dependentElements` Pattern

A pattern for declaring runtime dependencies between web components in browser
environments.

## Purpose

In browser environments, web components often depend on other custom elements
that must be registered before they can be used. The `dependentElements` pattern
provides:

1. **Explicit Dependency Documentation**: Clearly communicate which components
   depend on others
2. **Runtime Resolution**: Enable automatic registration of dependencies at
   runtime
3. **Version Specificity**: Ensure the correct versions of dependencies are
   loaded

This pattern specifically addresses browser runtime concerns and is separate
from development and testing dependencies, which are better handled through
module bundlers or import maps.

## Implementation

### Component Declaration

```javascript
export class ValueDateRangeElement extends HTMLElement {
  /**
   * Declares the custom elements this component requires at runtime
   * @returns {Record<string, string>} Map of element names to their module URLs
   */
  static get dependentElements() {
    return Object.freeze({
      'value-date':
        'https://dist.renoirb.com/esm/main/value-date-element/v1.0.0/browser.mjs',
    })
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    // This component uses value-date internally
    const template = document.createElement('template')
    template.innerHTML = `
      <value-date id="start-date"></value-date> to
      <value-date id="end-date"></value-date>
    `
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  // Rest of implementation...
}
```

### Registration Utility

```javascript
/**
 * Registers a web component and ensures all its runtime dependencies are registered first
 *
 * @param {object} context - The window or context with customElements registry
 * @param {string} elementName - The custom element name to register
 * @param {Function} ElementClass - The element class to register
 * @returns {Promise<void>}
 */
export async function registerComponentWithDependencies(
  context,
  elementName,
  ElementClass,
) {
  // Skip if already registered
  if (context.customElements.get(elementName)) {
    return
  }

  // Check for runtime dependencies
  if (typeof ElementClass.dependentElements === 'function') {
    const dependencies = ElementClass.dependentElements()

    if (dependencies && typeof dependencies === 'object') {
      // Load and register all dependencies first
      await Promise.all(
        Object.entries(dependencies).map(async ([depName, depUrl]) => {
          // Skip if already registered
          if (context.customElements.get(depName)) {
            return
          }

          try {
            // Import the dependency
            const module = await import(depUrl)

            // Find the component class (default export or named export)
            const DepElementClass =
              module.default || findElementClass(module, depName)

            if (DepElementClass) {
              // Recursively register this dependency
              await registerComponentWithDependencies(
                context,
                depName,
                DepElementClass,
              )
            } else {
              console.warn(
                `Could not find element class for ${depName} in ${depUrl}`,
              )
            }
          } catch (error) {
            console.error(
              `Error loading dependency ${depName} from ${depUrl}:`,
              error,
            )
          }
        }),
      )
    }
  }

  // Register the component
  context.customElements.define(elementName, ElementClass)
}
```

## Usage in Applications

```javascript
import { registerComponentWithDependencies } from 'element-utils'

// Import your top-level components
const { ValueDateRangeElement } = await import('./value-date-range.js')

// Register with runtime dependencies
await registerComponentWithDependencies(
  window,
  'value-date-range',
  ValueDateRangeElement,
)

// The system will automatically load and register value-date first
document.body.innerHTML = `
  <value-date-range start="2023-01-01" end="2023-12-31"></value-date-range>
`
```

## When to Use This Pattern

Use the `dependentElements` pattern when:

1. Creating web components that rely on other custom elements
2. Components are loaded and registered dynamically at runtime
3. You want to ensure proper loading and registration order
4. Manual component registration would be error-prone

## When Not to Use This Pattern

Don't use this pattern for:

1. **Development dependencies**: Use your package manager or import map
2. **Testing dependencies**: Use Deno's import resolution in `deno.json`
3. **Non-custom-element dependencies**: Use standard ESM imports
4. **Server-side modules**: No runtime registration is needed

## Best Practices

1. **Keep URLs Versioned**: Always include version information
2. **Use Object.freeze()**: Prevent accidental modification
3. **Provide Fallbacks**: Design components to work even if dependencies fail to
   load
4. **Keep it Browser-Specific**: Use this pattern only in browser code

## Example: Layered Component Architecture

```javascript
// Base component with no dependencies
export class ValueDateElement extends HTMLElement {
  static dependentElements() {
    return Object.freeze({}) // No dependencies
  }
  // Implementation...
}

// Component that depends on ValueDateElement
export class ValueDateRangeElement extends HTMLElement {
  static dependentElements() {
    return Object.freeze({
      'value-date':
        'https://dist.renoirb.com/esm/main/value-date-element/v1.0.0/browser.mjs',
    })
  }
  // Implementation using value-date...
}

// Component that depends on both
export class DatePickerElement extends HTMLElement {
  static dependentElements() {
    return Object.freeze({
      'value-date':
        'https://dist.renoirb.com/esm/main/value-date-element/v1.0.0/browser.mjs',
      'value-date-range':
        'https://dist.renoirb.com/esm/main/value-date-range-element/v1.0.0/browser.mjs',
    })
  }
  // Implementation using both components...
}
```

With the registration utility, you only need to manually register
`DatePickerElement`, and the other components will be registered automatically.
