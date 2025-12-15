/**
 * Sleeve Calculator - Pure TypeScript calculation engine for portfolio sleeve targets
 *
 * @module sleeve-calculator
 */

// Default export - the main calculator class
export {
  //
  SleeveCalculator as default,
} from './calculator.ts'

// Named class exports
export {
  //
  SleeveCalculator,
} from './calculator.ts'
export {
  //
  DriftCalculator,
} from './drift.ts'

// Named type exports
export type {
  //
  CalculationResult,
  CurrencyCode,
  DeltaResult,
  DriftAction,
  DriftCalculatorState,
  SecurityTarget,
  SleeveDefinition,
  SleevesConfig,
  SleeveWeights,
} from './types.ts'
