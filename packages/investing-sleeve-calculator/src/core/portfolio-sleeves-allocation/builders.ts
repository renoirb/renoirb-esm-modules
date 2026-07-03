/**
 * Portfolio Rebalancing Framework - Builders
 *
 * Factory functions for constructing domain objects from raw data.
 * Handles normalization and validation.
 */

import type {
  Account,
  AccountConstraints,
  AccountType,
  AllocationCategory,
  CurrencyCode,
  ExchangeRates,
  HardAsset,
  HardAssetType,
  Holding,
  Money,
  Percentage,
  Person,
  PortfolioInput,
  SleeveCategoryMapping,
  SleeveHoldings,
  SleeveId,
  TargetAllocation,
  AmountPerCurrencyMap,
} from './types.ts'

import {
  DEFAULT_ACCOUNT_CONSTRAINTS,
  DEFAULT_SLEEVE_CATEGORY_MAPPING,
  DEFAULT_TARGET_ALLOCATION,
} from './types.ts'

// ============================================================================
// Money Builder
// ============================================================================

/**
 * Create Money from amount and currency.
 */
export function money(amount: number, currency: CurrencyCode = 'CAD'): Money {
  return {
    amount,
    currency,
  }
}

/**
 * Parse money from string value (handles "12345.67" format).
 */
export function parseMoney(
  value: string | number,
  currency: CurrencyCode = 'CAD',
): Money {
  const amount = typeof value === 'string' ? parseFloat(value) : value
  return money(amount, currency)
}

// ============================================================================
// Holding Builder
// ============================================================================

/**
 * Create a holding from raw data.
 */
export function holding(params: {
  symbol: string
  totalValue: number | string
  currency: CurrencyCode
  comment?: string | null
}): Holding {
  return {
    symbol: params.symbol,
    totalValue: parseMoney(params.totalValue, params.currency),
    comment: params.comment ?? undefined,
  }
}

/**
 * Create holdings from array of raw data.
 * unused?
 */
function holdings(
  items: ReadonlyArray<{
    symbol: string
    totalValue: number | string
    currency: CurrencyCode
    comment?: string | null
  }>,
): readonly Holding[] {
  return items.map(holding)
}

// ============================================================================
// Sleeve Holdings Builder
// ============================================================================

/**
 * Create SleeveHoldings from raw data.
 * unused?
 */
function sleeveHoldings(params: {
  sleeveId: SleeveId
  holdings: ReadonlyArray<{
    symbol: string
    totalValue: number | string
    currency: CurrencyCode
    comment?: string | null
  }>
}): SleeveHoldings {
  return {
    sleeveId: params.sleeveId,
    holdings: holdings(params.holdings),
  }
}

// ============================================================================
// Account Builder
// ============================================================================

/**
 * Create Account from raw data.
 */
export function account(params: {
  type: AccountType
  label?: string
  totalValue: number
  sleeves?: ReadonlyArray<{
    sleeveId: SleeveId
    holdings: ReadonlyArray<{
      symbol: string
      totalValue: number | string
      currency: CurrencyCode
      comment?: string | null
    }>
  }>
  unallocated?: {
    CAD?: number
    USD?: number
  }
  constraints?: Partial<AccountConstraints>
}): Account {
  const defaultConstraints = DEFAULT_ACCOUNT_CONSTRAINTS[params.type]

  return {
    type: params.type,
    label: params.label,
    totalValue: params.totalValue,
    sleeves: params.sleeves?.map(sleeveHoldings) ?? [],
    unallocated: {
      CAD: params.unallocated?.CAD ?? 0,
      USD: params.unallocated?.USD ?? 0,
    },
    constraints: {
      ...defaultConstraints,
      ...params.constraints,
    },
  }
}

// ============================================================================
// Hard Asset Builder
// ============================================================================

/**
 * Create HardAsset from raw data.
 */
export function hardAsset(params: {
  type: HardAssetType
  description: string
  value: number
  ownershipPercent?: Percentage
  isLiquid?: boolean
  category?: AllocationCategory
}): HardAsset {
  return {
    type: params.type,
    description: params.description,
    value: params.value,
    ownershipPercent: params.ownershipPercent ?? 1.0,
    isLiquid: params.isLiquid ?? false,
    category: params.category ?? inferCategory(params.type),
  }
}

/**
 * Infer category from hard asset type.
 */
function inferCategory(type: HardAssetType): AllocationCategory {
  switch (type) {
    case 'realEstate':
      return 'realEstate'
    case 'vehicle':
      return 'speculation' // Depreciating, speculative
    case 'other':
      return 'reserves'
  }
}

// ============================================================================
// Person Builder
// ============================================================================

/**
 * Create Person from raw data.
 */
export function person(params: {
  name: string
  accounts: readonly Account[]
  hardAssets?: readonly HardAsset[]
}): Person {
  return {
    name: params.name,
    accounts: params.accounts,
    hardAssets: params.hardAssets ?? [],
  }
}

// ============================================================================
// Portfolio Input Builder
// ============================================================================

export interface PortfolioInputParams {
  persons: readonly Person[]
  exchangeRates?: ExchangeRates
  targetAllocation?: Partial<TargetAllocation>
  sleeveCategoryMapping?: Partial<SleeveCategoryMapping>
}

/**
 * Create PortfolioInput with defaults.
 */
export const portfolioInput = (
  params: PortfolioInputParams,
): PortfolioInput => {
  return {
    persons: params.persons,
    exchangeRates: params.exchangeRates ?? { CAD: 1.0, USD: 1.38 },
    targetAllocation: {
      ...DEFAULT_TARGET_ALLOCATION,
      ...params.targetAllocation,
    },
    sleeveCategoryMapping: {
      ...DEFAULT_SLEEVE_CATEGORY_MAPPING,
      ...params.sleeveCategoryMapping,
    },
  }
}

// ============================================================================
// Sleeve Category Mapping Override Builder
// ============================================================================

/**
 * Create a mapping override that treats certain sleeves as speculation.
 * Useful for "treat growth/quality/stocks as speculation" scenarios.
 */
export function speculationOverrides(
  sleeves: readonly SleeveId[],
): Partial<SleeveCategoryMapping> {
  const overrides: Partial<Record<SleeveId, AllocationCategory>> = {}

  for (const sleeve of sleeves) {
    overrides[sleeve] = 'speculation'
  }

  return overrides
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate that target allocation sums to 1.0.
 */
export function validateTargetAllocation(targets: TargetAllocation): {
  valid: boolean
  sum: number
  message?: string
} {
  const sum =
    targets.reserves + targets.stocks + targets.realEstate + targets.speculation

  const valid = Math.abs(sum - 1.0) < 0.001

  return {
    valid,
    sum,
    message: valid
      ? undefined
      : `Target allocation must sum to 100%, got ${(sum * 100).toFixed(1)}%`,
  }
}

/**
 * Validate sleeve ID is known.
 */
export function isValidSleeveId(id: string): id is SleeveId {
  const validIds: readonly string[] = [
    'core',
    'core-USD',
    'core-RBCDI',
    'bullion',
    'bullion-USD',
    'bonds',
    'defensive',
    'income',
    'quality',
    'growth',
    'growth-USD',
    'stocks',
    'crypto',
  ]

  return validIds.includes(id)
}
