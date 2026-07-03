/**
 * Portfolio Rebalancing Framework - Calculation Functions
 *
 * Pure functions with no side effects.
 * All monetary values normalized to CAD internally.
 */

import type {
  Account,
  AccountDeployment,
  AllocationCategory,
  AllocationGap,
  CategoryAllocation,
  DeploymentRecommendation,
  ExchangeRates,
  HardAsset,
  Holding,
  Money,
  Percentage,
  Person,
  PersonAllocationResult,
  PortfolioInput,
  RebalancingResult,
  SleeveCategoryMapping,
  SleeveHoldings,
  SleeveId,
  TargetAllocation,
  AmountPerCurrencyMap,
} from './types.ts'

import {
  DEFAULT_SLEEVE_CATEGORY_MAPPING,
  DEFAULT_TARGET_ALLOCATION,
} from './types.ts'

// ============================================================================
// Money Utilities
// ============================================================================

/**
 * Convert Money to CAD using exchange rates.
 */
export function toCAD(money: Money, rates: ExchangeRates): number {
  return money.amount * rates[money.currency]
}

/**
 * Sum holdings to CAD.
 */
export function sumHoldingsToCAD(
  holdings: readonly Holding[],
  rates: ExchangeRates,
): number {
  return holdings.reduce((sum, h) => sum + toCAD(h.totalValue, rates), 0)
}

/**
 * Convert unallocated cash to CAD.
 */
export function unallocatedToCAD(
  unallocated: AmountPerCurrencyMap,
  rates: ExchangeRates,
): number {
  return unallocated.CAD * rates.CAD + unallocated.USD * rates.USD
}

// ============================================================================
// Allocation Category Calculations
// ============================================================================

/**
 * Calculate total value of a sleeve in CAD.
 */
export function sleeveValueCAD(
  sleeve: SleeveHoldings,
  rates: ExchangeRates,
): number {
  return sumHoldingsToCAD(sleeve.holdings, rates)
}

/**
 * Group account holdings by allocation category.
 */
export function accountAllocationByCategory(
  account: Account,
  rates: ExchangeRates,
  mapping: SleeveCategoryMapping,
): CategoryAllocation {
  const result: Record<AllocationCategory, number> = {
    reserves: 0,
    stocks: 0,
    realEstate: 0,
    speculation: 0,
  }

  // Sum sleeve values into categories
  for (const sleeve of account.sleeves) {
    const category = mapping[sleeve.sleeveId]
    const value = sleeveValueCAD(sleeve, rates)
    result[category] += value
  }

  // Unallocated cash counts as reserves
  result.reserves += unallocatedToCAD(account.unallocated, rates)

  // Handle managed accounts
  if (
    account.constraints.isLocked &&
    account.constraints.managedStockPercent !== undefined
  ) {
    const stockPortion =
      account.totalValue * account.constraints.managedStockPercent
    const reservePortion =
      account.totalValue * (1 - account.constraints.managedStockPercent)
    result.stocks += stockPortion
    result.reserves += reservePortion
  }

  return result
}

/**
 * Aggregate allocation across all accounts for a person.
 */
export function personAllocationByCategory(
  person: Person,
  rates: ExchangeRates,
  mapping: SleeveCategoryMapping,
): CategoryAllocation {
  const result: Record<AllocationCategory, number> = {
    reserves: 0,
    stocks: 0,
    realEstate: 0,
    speculation: 0,
  }

  // Sum from accounts
  for (const account of person.accounts) {
    const accountAlloc = accountAllocationByCategory(account, rates, mapping)
    result.reserves += accountAlloc.reserves
    result.stocks += accountAlloc.stocks
    result.realEstate += accountAlloc.realEstate
    result.speculation += accountAlloc.speculation
  }

  // Add hard assets
  for (const asset of person.hardAssets) {
    const effectiveValue = asset.value * asset.ownershipPercent
    result[asset.category] += effectiveValue
  }

  return result
}

// ============================================================================
// Total Value Calculations
// ============================================================================

/**
 * Calculate total portfolio value for a person.
 */
export function totalPortfolioValue(
  person: Person,
  rates: ExchangeRates,
): number {
  let total = 0

  // Sum accounts
  for (const account of person.accounts) {
    total += account.totalValue
  }

  // Sum hard assets (ownership-adjusted)
  for (const asset of person.hardAssets) {
    total += asset.value * asset.ownershipPercent
  }

  return total
}

/**
 * Calculate investable (liquid) value for a person.
 * Excludes illiquid hard assets.
 */
export function investableValue(person: Person, rates: ExchangeRates): number {
  let total = 0

  for (const account of person.accounts) {
    total += account.totalValue
  }

  // Only include liquid hard assets
  for (const asset of person.hardAssets) {
    if (asset.isLiquid) {
      total += asset.value * asset.ownershipPercent
    }
  }

  return total
}

/**
 * Calculate total real estate value (ownership-adjusted).
 */
export function realEstateValue(person: Person): number {
  return person.hardAssets
    .filter((a) => a.category === 'realEstate')
    .reduce((sum, a) => sum + a.value * a.ownershipPercent, 0)
}

// ============================================================================
// Target Adjustment (Step 2 from Framework)
// ============================================================================

/**
 * Check if real estate is overweight.
 */
export function isRealEstateOverweight(
  person: Person,
  rates: ExchangeRates,
  targets: TargetAllocation,
): boolean {
  const totalValue = totalPortfolioValue(person, rates)
  const reValue = realEstateValue(person)
  const rePercent = reValue / totalValue

  return rePercent > targets.realEstate
}

/**
 * Calculate adjusted targets when RE is overweight.
 * Normalizes remaining categories to 100% of investable assets.
 */
export function adjustedTargets(
  targets: TargetAllocation,
  reOverweight: boolean,
): CategoryAllocation {
  if (!reOverweight) {
    return {
      reserves: targets.reserves,
      stocks: targets.stocks,
      realEstate: targets.realEstate,
      speculation: targets.speculation,
    }
  }

  // RE is treated as exactly at target; rebase others
  const remaining = 1 - targets.realEstate

  return {
    reserves: targets.reserves / remaining,
    stocks: targets.stocks / remaining,
    realEstate: 0, // Not applicable to investable assets
    speculation: targets.speculation / remaining,
  }
}

// ============================================================================
// Gap Analysis (Step 5 from Framework)
// ============================================================================

/**
 * Calculate allocation gaps.
 */
export function calculateGaps(
  currentAllocation: CategoryAllocation,
  targetAllocation: CategoryAllocation,
  investableTotal: number,
): readonly AllocationGap[] {
  const categories: AllocationCategory[] = ['reserves', 'stocks', 'speculation']

  return categories.map((category) => {
    const current = currentAllocation[category]
    const targetPercent = targetAllocation[category]
    const target = investableTotal * targetPercent
    const delta = current - target
    const percentDelta = target > 0 ? delta / target : 0

    return {
      category,
      current,
      target,
      delta,
      percentDelta,
    }
  })
}

// ============================================================================
// Person-Level Calculation
// ============================================================================

/**
 * Calculate complete allocation result for a person.
 */
export function calculatePersonAllocation(
  person: Person,
  rates: ExchangeRates,
  targets: TargetAllocation,
  mapping: SleeveCategoryMapping,
): PersonAllocationResult {
  const totalValue = totalPortfolioValue(person, rates)
  const invValue = investableValue(person, rates)
  const reValue = realEstateValue(person)
  const rePercent = reValue / totalValue
  const reOverweight = rePercent > targets.realEstate

  const adjTargets = adjustedTargets(targets, reOverweight)

  // Get current allocation (excluding RE for investable comparison)
  const fullAllocation = personAllocationByCategory(person, rates, mapping)
  const currentInvestable: CategoryAllocation = {
    reserves: fullAllocation.reserves,
    stocks: fullAllocation.stocks,
    realEstate: 0,
    speculation: fullAllocation.speculation,
  }

  const gaps = calculateGaps(currentInvestable, adjTargets, invValue)

  return {
    personName: person.name,
    totalPortfolioValue: totalValue,
    investableValue: invValue,
    realEstateValue: reValue,
    realEstatePercent: rePercent,
    isRealEstateOverweight: reOverweight,
    adjustedTargets: adjTargets,
    currentAllocation: currentInvestable,
    gaps,
  }
}

// ============================================================================
// Deployment Recommendations
// ============================================================================

/**
 * Determine which sleeve to deploy into for a category.
 */
export function preferredSleeveForCategory(
  category: AllocationCategory,
  hasCadCash: boolean,
  hasUsdCash: boolean,
): SleeveId {
  switch (category) {
    case 'reserves':
      return hasUsdCash ? 'bullion-USD' : 'bullion'
    case 'stocks':
      return hasUsdCash ? 'core-USD' : 'core'
    case 'speculation':
      return hasUsdCash ? 'growth-USD' : 'growth'
    case 'realEstate':
      return 'stocks' // REITs go in stocks sleeve
  }
}

/**
 * Generate deployment recommendations for an account.
 */
export function generateAccountDeployment(
  account: Account,
  gaps: readonly AllocationGap[],
  rates: ExchangeRates,
): AccountDeployment {
  const availableCash = unallocatedToCAD(account.unallocated, rates)

  if (availableCash <= 0 || account.constraints.isLocked) {
    return {
      accountType: account.type,
      accountLabel: account.label,
      availableCash,
      recommendations: [],
    }
  }

  const recommendations: DeploymentRecommendation[] = []
  let remainingCash = availableCash

  // Sort gaps by deficit (most negative delta first)
  const deficits = gaps
    .filter((g) => g.delta < 0)
    .sort((a, b) => a.delta - b.delta)

  const hasUsdCash = account.unallocated.USD > 0
  const hasCadCash = account.unallocated.CAD > 0

  for (const gap of deficits) {
    if (remainingCash <= 0) break

    const deficit = Math.abs(gap.delta)
    const deployAmount = Math.min(remainingCash, deficit)

    const targetSleeve = preferredSleeveForCategory(
      gap.category,
      hasCadCash,
      hasUsdCash,
    )

    recommendations.push({
      targetCategory: gap.category,
      targetSleeve,
      amount: deployAmount,
      rationale: `${gap.category} under target by ${formatPercent(
        Math.abs(gap.percentDelta),
      )}`,
    })

    remainingCash -= deployAmount
  }

  return {
    accountType: account.type,
    accountLabel: account.label,
    availableCash,
    recommendations,
  }
}

/**
 * Generate all deployment recommendations for a person.
 */
export function generatePersonDeployments(
  person: Person,
  gaps: readonly AllocationGap[],
  rates: ExchangeRates,
): readonly AccountDeployment[] {
  return person.accounts.map((account) =>
    generateAccountDeployment(account, gaps, rates),
  )
}

// ============================================================================
// Main Calculation Entry Point
// ============================================================================

/**
 * Execute complete rebalancing calculation.
 */
export function calculateRebalancing(input: PortfolioInput): RebalancingResult {
  const personResults = input.persons.map((person) =>
    calculatePersonAllocation(
      person,
      input.exchangeRates,
      input.targetAllocation,
      input.sleeveCategoryMapping,
    ),
  )

  const deploymentRecommendations = input.persons.flatMap((person, idx) =>
    generatePersonDeployments(
      person,
      personResults[idx].gaps,
      input.exchangeRates,
    ),
  )

  return {
    timestamp: new Date().toISOString(),
    exchangeRates: input.exchangeRates,
    personResults,
    deploymentRecommendations,
  }
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format number as currency string.
 */
export function formatCurrency(
  value: number,
  currency: 'CAD' | 'USD' = 'CAD',
): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format percentage (0.30 → "30%").
 */
export function formatPercent(value: Percentage): string {
  return `${(value * 100).toFixed(1)}%`
}
