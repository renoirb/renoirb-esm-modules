// dependent-elements.d.ts

/**
 * Mapping of element names to their module URLs
 * 
 * @returns {Record<string, string>} Map of element names to their module URLs
 */
export type DependentElementsMap = Readonly<Record<string, string>>;

/**
 * Registers a component and all its dependencies
 * 
 * @param context - The window or context containing customElements registry
 * @param elementName - The name of the custom element to register
 * @param ElementClass - The element class to register
 * @returns A promise that resolves when registration is complete
 */
export function registerComponentWithDependencies(
  context: { customElements: CustomElementRegistry },
  elementName: string,
  ElementClass: typeof HTMLElement
): Promise<void>;

// Augment the existing interfaces
declare global {
  interface ElementConstructor {
    /**
     * Returns a mapping of element names to their module URLs
     * that this component depends on at runtime
     */
    readonly dependentElements?: DependentElementsMap;
  }
  
  interface HTMLElementTagNameMap {
    // Add your custom elements here if needed
    // 'value-date': ValueDateElement;
    // 'value-date-range': ValueDateRangeElement;
  }
}

// This extends the constructor interface for HTMLElement subclasses
export interface WithDependentElements {
  readonly dependentElements: DependentElementsMap;
}
