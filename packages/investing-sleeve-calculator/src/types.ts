/**
 * Core type definitions for sleeve calculator
 */

export type CurrencyCode = 'CAD' | 'USD'

/**
 * Weights configuration for a sleeve
 * 
 * Maps security symbol to its weight percentage 
 * 
 * @remarks
 * - Weights should sum to 100 for each sleeve
 * - Can be fractional (e.g., 33.33)
 *
 * @example
 * ```ts
 * const weights: SleeveWeights = {
 *   PHYS: 60.05, // Sprott Physical Gold Trust
 *   PSLV: 39.95, // Sprott Physical Silver Trust
 * }
 * ```
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

/**
 * Brokerage holding structure (from JSON files)
 * Can be passed directly to PortfolioAggregate.addHolding()
 *
 * @remarks
 * - String values preserve precision from brokerage data
 * - Supports both traditional securities and crypto (with "coins" suffix)
 *
 * @example
 * ```ts
 * const holding: HoldingInput = {
 *   symbol: 'PHYS',
 *   name: 'Sprott Physical Gold Trust',
 *   totalValue: '+56628.00',
 *   currency: 'CAD',
 *   shares: '1,200',
 *   currentPrice: '+47.19',
 *   allTimeReturn: {
 *     value: '+14139.57',
 *     percent: '+33.28',
 *   },
 * }
 * ```
 */
export interface HoldingInput {
  /** Security symbol (e.g., 'PHYS', 'VUN', 'BTC') */
  symbol: string

  /** Full security name */
  name: string

  /** Total value as string (e.g., "+56628.00") */
  totalValue: string

  /** Currency the security trades in */
  currency: CurrencyCode

  /** Share count as string (e.g., "1,200" or "0.0745 coins") */
  shares: string

  /** Current price (optional, preserved but not used) */
  currentPrice?: string

  /** Current day diff percentage (optional, preserved but not used) */
  currentDiffPercent?: string

  /** All-time return (optional, preserved but not used) */
  allTimeReturn?: {
    /** Return value as string (e.g., "+14139.57") */
    value: string
    /** Return percentage as string (e.g., "+33.28") */
    percent: string
  }
}

/**
 * Complete brokerage snapshot file structure
 *
 * @example
 * ```ts
 * const snapshot: BrokerageSnapshot = {
 *   timestamp: '2025-01-15T14:30:22GMT-5',
 *   account: {
 *     totals: {
 *       CAD: '29250.00',
 *       USD: '1765.00',
 *     },
 *   },
 *   holdings: [...],
 * }
 * ```
 */
export interface BrokerageSnapshot {
  /** Timestamp of snapshot */
  timestamp: string

  /** Account totals */
  account: {
    totals: {
      /** Total CAD value as string */
      CAD: string
      /** Total USD value as string */
      USD: string
    }
  }

  /** Array of holdings */
  holdings: HoldingInput[]
}

/**
 * Allocation configuration (from allocation.yaml)
 * Maps person → account → sleeve → allocated amount in CAD
 *
 * @example
 * ```ts
 * const allocations: AllocationsConfig = {
 *   Bob: {
 *     RRSP: {
 *       core: 72000,
 *       bullion: 139000,
 *       'growth-USD': 7300,
 *     },
 *     TFSA: {
 *       core: 32000,
 *       income: 7500,
 *     },
 *   },
 * }
 * ```
 */
export interface AllocationsConfig {
  [person: string]: {
    [account: string]: {
      /** Allocated CAD amount for each sleeve */
      [sleeveName: string]: number
    }
  }
}

/**
 * Weight analysis for a single security
 */
export interface WeightAnalysis {
  /** Security symbol */
  symbol: string

  /** Total value in native currency */
  totalValue: number

  /** Total value converted to CAD */
  totalValueCAD: number

  /** Current actual weight percentage (e.g., 52.1 for 52.1%) */
  currentWeight: number

  /** Target weight from sleeve definition (e.g., 60 for 60%) */
  targetWeight: number

  /** Weight drift: currentWeight - targetWeight (e.g., -7.9) */
  weightDrift: number

  /** Currency the security trades in */
  currency: CurrencyCode
}

/**
 * Complete sleeve analysis result
 */
export interface SleeveAnalysisResult {
  /** Name of the sleeve analyzed */
  sleeveName: string

  /** Total value of all holdings in CAD */
  totalValueCAD: number

  /** Total value of USD holdings (in USD, not CAD) */
  totalValueUSD: number

  /** Per-security weight analysis */
  analysis: WeightAnalysis[]
}

/**
 * Simplified holding summary (parsed numeric values)
 */
export interface HoldingSummary {
  /** Security symbol */
  symbol: string

  /** Security name */
  name: string

  /** Total value (parsed number) */
  totalValue: number

  /** Currency */
  currency: CurrencyCode

  /** Share count (parsed number) */
  shares: number
}

/**
 * Complete state for a sleeve within an account
 */
export interface AccountSleeveState {
  /** Name of the sleeve */
  sleeveName: string

  /** Allocated amount from allocation.yaml (target) */
  allocated: number

  /** Actual current value (sum of holdings) */
  actual: number

  /** Drift: allocated - actual (undeployed cash if positive) */
  drift: number

  /** Holdings in this sleeve */
  holdings: HoldingSummary[]

  /** Weight analysis (current vs target weights) */
  weightAnalysis: SleeveAnalysisResult
}
