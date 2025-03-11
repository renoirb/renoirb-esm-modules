
// This is a type guard to check if a constructor has dependentElements
export const hasDependentElements = (
  ctor/*: typeof HTMLElement */,
)/*: ctor is typeof HTMLElement & WithDependentElements */ => {
  return 'dependentElements' in ctor;
}

/**
 * Registers a component and all its dependencies
 *
 * @param {object} context - The window or context containing customElements registry
 * @param {string} elementName - The name of the custom element to register
 * @param {Function} ElementClass - The element class to register
 * @returns {Promise<void>} - A promise that resolves when registration is complete
 */
export async function registerComponentWithDependencies(
  context,
  elementName,
  ElementClass,
) {
  // Skip if already registered
  if (context.customElements.get(elementName)) {
    return;
  }

  try {
    // Check for runtime dependencies
    if (hasDependentElements(ElementClass)) {
      const dependencies = ElementClass.dependentElements;

      if (dependencies && typeof dependencies === 'object') {
        // Register all dependencies first
        await Promise.all(
          Object.entries(dependencies).map(async ([depName, depUrl]) => {
            // Skip if already registered
            if (context.customElements.get(depName)) {
              return;
            }

            try {
              // Import the dependency
              const module = await import(depUrl);

              // Find the component class (default export or named export)
              const DepElementClass = findElementClass(module, depName);

              if (DepElementClass) {
                // Recursively register this dependency
                await registerComponentWithDependencies(context, depName, DepElementClass);
              } else {
                console.warn(`Could not find element class for ${depName}`);
              }
            } catch (error) {
              console.error(`Error loading dependency ${depName}:`, error);
            }
          })
        );
      }
    }

    // Register the component
    context.customElements.define(elementName, ElementClass);
  } catch (error) {
    console.error(`Failed to register ${elementName}:`, error);
    throw error;
  }
}

/**
 * Find element class in module exports
 *
 * @param {object} module - The imported module
 * @param {string} elementName - The custom element name (e.g., 'value-date')
 * @returns {Function|null} - The element class or null if not found
 */
function findElementClass(
  module,
  elementName,
) {
  // Try default export first
  if (module.default && typeof module.default === 'function' &&
      (module.default.prototype instanceof HTMLElement ||
       module.default.toString().includes('extends HTMLElement'))) {
    return module.default;
  }

  // Convert kebab-case to PascalCase + Element suffix
  const className = elementName
    .split('-')
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('') + 'Element';

  // Look for matching export
  for (const [exportName, exportValue] of Object.entries(module)) {
    if (typeof exportValue !== 'function') continue;

    // Check if it's an HTMLElement class
    const isElement = exportValue.prototype instanceof HTMLElement ||
                      exportValue.toString().includes('extends HTMLElement');

    // Match by name or by being an HTMLElement subclass with matching name pattern
    if (isElement && (exportName === className || exportValue.name === className)) {
      return exportValue;
    }
  }

  // Last resort - find any HTMLElement subclass
  for (const exportValue of Object.values(module)) {
    if (typeof exportValue === 'function' &&
        (exportValue.prototype instanceof HTMLElement ||
         exportValue.toString().includes('extends HTMLElement'))) {
      return exportValue;
    }
  }

  return null;
}