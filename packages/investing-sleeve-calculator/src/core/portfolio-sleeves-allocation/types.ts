/**
 * Portfolio Rebalancing Framework - Type Definitions
 *
 * Pure domain types with no runtime dependencies.
 * Designed for use across CLI, Web, or document generation contexts.
 */

import { sleeveHoldings } from './builders.ts'

// ============================================================================
// Primitives & Branded Types
// ============================================================================

/**
 * Currency codes supported in the system.
 */
export type CurrencyCode = 'CAD' | 'USD'

/**
 * Monetary value with currency.
 * All internal calculations normalize to CAD.
 */
export interface Money {
  readonly amount: number
  readonly currency: CurrencyCode
}

/**
 * Percentage expressed as decimal (0.30 = 30%).
 */
export type Percentage = number

/**
 * Exchange rates keyed by source currency.
 * Value represents units of CAD per 1 unit of source.
 */
export type ExchangeRates = Readonly<Record<CurrencyCode, number>>

// ============================================================================
// Allocation Categories
// ============================================================================

/**
 * Top-level allocation categories from the framework.
 */
export type AllocationCategory =
  | 'reserves'
  | 'stocks'
  | 'realEstate'
  | 'speculation'

/**
 * Target allocation percentages.
 * Must sum to 1.0 (100%).
 */
export interface TargetAllocation {
  readonly reserves: Percentage
  readonly stocks: Percentage
  readonly realEstate: Percentage
  readonly speculation: Percentage
}

/**
 * Default allocation from framework:
 * 30% Reserves, 30% Stocks, 30% Real Estate, 10% Speculation
 */
export const DEFAULT_TARGET_ALLOCATION: TargetAllocation = {
  reserves: 0.3,
  stocks: 0.3,
  realEstate: 0.3,
  speculation: 0.1,
} as const

// ============================================================================
// Sleeve Definitions
// ============================================================================

/**
 * Ensure SleeveId matches the naming convention.
 *
 * A Sleeve is one alphanumeric word.
 * If there's a variant of the same intention, add a dash and another alphanumeric word.
 *
 * In other words:
 * One alphanumeric word (e.g. foo) as a sleeve Identifier, OR
 * One alphanumeric word (e.g. foo) AND a dash AND another alphanumeric word (e.g. foo-USD)
 */
export type assertIsSleeveId = (
  input: unknown,
) => asserts input is SleeveId;

/**
 * A Sleeve is one alphanumeric word.
 * A variant of a Sleeve has an extra alphanumeric and a dash in between.
 * 
 * @see {@link assertIsSleeveId}
 */
export type SleeveId = 
  | string
  /** ^ @TODO: RTFM how to make a RegEx based type */

/**
 * Mapping from sleeve to allocation category.
 */
export type SleeveCategoryMapping = Readonly<
  Partial<
    Record<SleeveId, AllocationCategory>
  >
>

/**
 * Default sleeve-to-category mapping.
 * Can be overridden (e.g., treating growth as speculation).
 */
export const DEFAULT_SLEEVE_CATEGORY_MAPPING: SleeveCategoryMapping = {
  core: 'stocks',
  'core-USD': 'stocks',
  'core-RBCDI': 'stocks',
  bullion: 'reserves',
  'bullion-USD': 'reserves',
  bonds: 'reserves',
  defensive: 'reserves',
  income: 'stocks',
  quality: 'speculation',
  growth: 'speculation',
  'growth-USD': 'speculation',
  stocks: 'speculation',
  crypto: 'reserves',
} as const

// ============================================================================
// Account Types
// ============================================================================

/**
 * Registered account types in Canadian context.
 */
export type AccountType =
  | 'TFSA'
  | 'RRSP'
  | 'RESP'
  | 'Crypto'
  | 'Chequing'
  | 'Managed'

/**
 * Account constraints for rebalancing.
 */
export interface AccountConstraints {
  /** Can funds be moved out to other accounts? */
  readonly canTransferOut: boolean
  /** Can funds be moved in from other accounts? */
  readonly canTransferIn: boolean
  /** Is the account locked from rebalancing? */
  readonly isLocked: boolean
  /** Estimated stock percentage for managed accounts */
  readonly managedStockPercent?: Percentage
}

/**
 * Default constraints by account type.
 */
export const DEFAULT_ACCOUNT_CONSTRAINTS: Readonly<
  Record<AccountType, AccountConstraints>
> = {
  TFSA: {
    canTransferOut: false,
    canTransferIn: true,
    isLocked: false,
  },
  RRSP: {
    canTransferOut: false,
    canTransferIn: true,
    isLocked: false,
  },
  RESP: {
    canTransferOut: false,
    canTransferIn: true,
    isLocked: false,
  },
  Crypto: {
    canTransferOut: false,
    canTransferIn: false,
    isLocked: true,
  },
  Chequing: {
    canTransferOut: true,
    canTransferIn: true,
    isLocked: false,
  },
  Managed: {
    canTransferOut: false,
    canTransferIn: false,
    isLocked: true,
    managedStockPercent: 0.9,
  },
} as const

// ============================================================================
// Holdings & Accounts
// ============================================================================

/**
 * Single security holding.
 */
export interface Holding {
  readonly symbol: string
  readonly currency: string
  readonly totalValue: Money
  readonly comment?: string
}

/**
 * Holdings grouped by sleeve within an account.
 */
export interface SleeveHoldings {
  readonly sleeveId: SleeveId
  readonly holdings: readonly Holding[]
}

/**
 * Amounts per currency.
 * In other words, instead of making a total in one given currency, 
 */
export interface AmountPerCurrencyMap {
  readonly CAD: number
  readonly USD: number
}

/**
 * Complete account state.
 */
export interface Account {
  readonly type: AccountType
  readonly label?: string
  readonly totalValue: number // in CAD
  readonly sleeves: readonly SleeveHoldings[]
  readonly unallocated: AmountPerCurrencyMap
  readonly constraints: AccountConstraints
}

// ============================================================================
// Hard Assets
// ============================================================================

/**
 * Hard asset types.
 */
export type HardAssetType = 'realEstate' | 'vehicle' | 'other'

/**
 * Illiquid/hard asset.
 */
export interface HardAsset {
  readonly type: HardAssetType
  readonly description: string
  readonly value: number // in CAD
  readonly ownershipPercent: Percentage
  readonly isLiquid: boolean
  readonly category: AllocationCategory
}

// ============================================================================
// Person & Portfolio
// ============================================================================

/**
 * Individual portfolio holder.
 */
export interface Person {
  readonly name: string
  readonly accounts: readonly Account[]
  readonly hardAssets: readonly HardAsset[]
}

/**
 * Complete portfolio input for calculation.
 */
export interface PortfolioInput {
  readonly persons: readonly Person[]
  readonly exchangeRates: ExchangeRates
  readonly targetAllocation: TargetAllocation
  readonly sleeveCategoryMapping: SleeveCategoryMapping
}

// ============================================================================
// Calculation Results
// ============================================================================

/**
 * Allocation breakdown by category.
 */
export interface CategoryAllocation {
  readonly reserves: number
  readonly stocks: number
  readonly realEstate: number
  readonly speculation: number
}

/**
 * Gap between current and target allocation.
 */
export interface AllocationGap {
  readonly category: AllocationCategory
  readonly current: number
  readonly target: number
  readonly delta: number
  readonly percentDelta: Percentage
}

/**
 * Per-person calculation result.
 */
export interface PersonAllocationResult {
  readonly personName: string
  readonly totalPortfolioValue: number
  readonly investableValue: number
  readonly realEstateValue: number
  readonly realEstatePercent: Percentage
  readonly isRealEstateOverweight: boolean
  readonly adjustedTargets: CategoryAllocation
  readonly currentAllocation: CategoryAllocation
  readonly gaps: readonly AllocationGap[]
}

/**
 * Deployment recommendation for a single account.
 */
export interface AccountDeployment {
  readonly accountType: AccountType
  readonly accountLabel?: string
  readonly availableCash: number
  readonly recommendations: readonly DeploymentRecommendation[]
}

/**
 * Single deployment action.
 */
export interface DeploymentRecommendation {
  readonly targetCategory: AllocationCategory
  readonly targetSleeve: SleeveId
  readonly amount: number
  readonly rationale: string
}

/**
 * Complete calculation output.
 */
export interface RebalancingResult {
  readonly timestamp: string
  readonly exchangeRates: ExchangeRates
  readonly personResults: readonly PersonAllocationResult[]
  readonly deploymentRecommendations: readonly AccountDeployment[]
}
