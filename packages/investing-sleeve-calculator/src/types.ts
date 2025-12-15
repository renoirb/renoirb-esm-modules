/**
 * Core type definitions for sleeve calculator
 */

export type CurrencyCode = 'CAD' | 'USD'

/**
 * Weights configuration for a sleeve
 * Maps security symbol to its weight percentage (e.g., { AVDV: 10, VUN: 13 })
 */
export interface SleeveWeights {
  [symbol: string]: number
}

/**
 * Configuration for a single sleeve
 */
export interface SleeveDefinition {
  /** Weight percentages for each security */
  weights: SleeveWeights

  /** List of symbols that trade in USD (optional, defaults to empty array) */
  usd_symbols?: string[]

  /** Optional metadata (preserved but not used by calculator) */
  name?: string
  doc?: string
  parent_model?: string
  description?: string
}

/**
 * Complete sleeves configuration (parsed from sleeves.yaml)
 */
export interface SleevesConfig {
  sleeves: {
    [sleeveName: string]: SleeveDefinition
  }
}

/**
 * Target amount for a single security
 */
export interface SecurityTarget {
  /** Security symbol (e.g., 'AVDV', 'VUN') */
  symbol: string

  /** Target amount in the security's native currency */
  targetAmount: number

  /** Currency the security trades in */
  currency: CurrencyCode

  /** Original weight from configuration (e.g., 10 for 10%) */
  weight: number

  /** Normalized weight as decimal (e.g., 0.10 for 10%) */
  normalizedWeight: number
}

/**
 * Result of a sleeve calculation
 */
export interface CalculationResult {
  /** Name of the sleeve that was calculated */
  sleeveName: string

  /** Total allocation amount in CAD that was used */
  totalAmountCAD: number

  /** Exchange rate that was used (CAD per USD) */
  exchangeRate: number

  /** Target amounts for each security */
  targets: SecurityTarget[]

  /** Summary totals */
  summary: {
    /** Sum of all CAD security targets */
    totalCAD: number

    /** Sum of all USD security targets (in USD) */
    totalUSD: number

    /** USD total converted to CAD at the given exchange rate */
    totalUSDInCAD: number
  }
}

/**
 * Action to take for a security (buy or sell)
 */
export type DriftAction = 'buy' | 'sell' | 'hold'

/**
 * Result of comparing target vs actual holding for a security
 */
export interface DeltaResult {
  /** Security symbol */
  symbol: string

  /** Current holding amount (in native currency) */
  from: number

  /** Target amount (in native currency) */
  to: number

  /** Difference (positive = buy, negative = sell) */
  delta: number

  /** Action to take */
  action: DriftAction

  /** Currency the security trades in */
  currency: CurrencyCode
}

/**
 * State for DriftCalculator (used for serialization/rehydration)
 */
export interface DriftCalculatorState {
  /** Calculation result with targets */
  calculationResult: CalculationResult

  /** Current actual holdings (symbol -> amount in native currency) */
  actuals: Record<string, number>
}
