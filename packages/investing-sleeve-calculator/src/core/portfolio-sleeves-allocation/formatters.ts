/**
 * Portfolio Rebalancing Framework - Formatters
 *
 * Pure functions for formatting calculation results.
 * Produces structured output suitable for rendering in various contexts.
 */

import type {
  AccountDeployment,
  AllocationGap,
  CategoryAllocation,
  PersonAllocationResult,
  RebalancingResult,
} from './types.ts'

import { formatCurrency, formatPercent } from './calculations.ts'

// ============================================================================
// Structured Output Types (for programmatic consumption)
// ============================================================================

/**
 * Formatted gap row for tables.
 */
export interface FormattedGapRow {
  readonly category: string
  readonly current: string
  readonly target: string
  readonly delta: string
  readonly deltaSign: 'over' | 'under' | 'balanced'
  readonly action: string
}

/**
 * Formatted allocation breakdown.
 */
export interface FormattedAllocation {
  readonly category: string
  readonly value: string
  readonly percent: string
}

/**
 * Formatted person summary.
 */
export interface FormattedPersonSummary {
  readonly name: string
  readonly totalPortfolio: string
  readonly investable: string
  readonly realEstate: string
  readonly realEstatePercent: string
  readonly realEstateStatus: 'overweight' | 'at-target' | 'underweight'
  readonly adjustedTargets: readonly FormattedAllocation[]
  readonly currentAllocation: readonly FormattedAllocation[]
  readonly gaps: readonly FormattedGapRow[]
}

/**
 * Formatted deployment recommendation.
 */
export interface FormattedDeployment {
  readonly accountType: string
  readonly accountLabel?: string
  readonly availableCash: string
  readonly actions: readonly {
    readonly category: string
    readonly sleeve: string
    readonly amount: string
    readonly rationale: string
  }[]
}

/**
 * Complete formatted output.
 */
export interface FormattedResult {
  readonly timestamp: string
  readonly exchangeRate: string
  readonly persons: readonly FormattedPersonSummary[]
  readonly deployments: readonly FormattedDeployment[]
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format a gap row.
 */
export function formatGapRow(gap: AllocationGap): FormattedGapRow {
  const deltaSign: 'over' | 'under' | 'balanced' =
    gap.delta > 1000 ? 'over' : gap.delta < -1000 ? 'under' : 'balanced'

  const action =
    deltaSign === 'over'
      ? `Over by ${formatPercent(Math.abs(gap.percentDelta))}`
      : deltaSign === 'under'
      ? `Under by ${formatPercent(Math.abs(gap.percentDelta))}`
      : 'Balanced'

  return {
    category: capitalizeFirst(gap.category),
    current: formatCurrency(gap.current),
    target: formatCurrency(gap.target),
    delta: formatDelta(gap.delta),
    deltaSign,
    action,
  }
}

/**
 * Format category allocation.
 */
export function formatAllocation(
  category: string,
  value: number,
  total: number,
): FormattedAllocation {
  return {
    category: capitalizeFirst(category),
    value: formatCurrency(value),
    percent: formatPercent(value / total),
  }
}

/**
 * Format person allocation result.
 */
export function formatPersonResult(
  result: PersonAllocationResult,
): FormattedPersonSummary {
  const allocationCategories: (keyof CategoryAllocation)[] = [
    'reserves',
    'stocks',
    'speculation',
  ]

  return {
    name: result.personName,
    totalPortfolio: formatCurrency(result.totalPortfolioValue),
    investable: formatCurrency(result.investableValue),
    realEstate: formatCurrency(result.realEstateValue),
    realEstatePercent: formatPercent(result.realEstatePercent),
    realEstateStatus: result.isRealEstateOverweight
      ? 'overweight'
      : result.realEstatePercent < 0.3
      ? 'underweight'
      : 'at-target',
    adjustedTargets: allocationCategories.map((cat) => ({
      category: capitalizeFirst(cat),
      value: formatPercent(result.adjustedTargets[cat]),
      percent: formatPercent(result.adjustedTargets[cat]),
    })),
    currentAllocation: allocationCategories.map((cat) =>
      formatAllocation(
        cat,
        result.currentAllocation[cat],
        result.investableValue,
      ),
    ),
    gaps: result.gaps.map(formatGapRow),
  }
}

/**
 * Format deployment recommendation.
 */
export function formatDeployment(
  deployment: AccountDeployment,
): FormattedDeployment {
  return {
    accountType: deployment.accountType,
    accountLabel: deployment.accountLabel,
    availableCash: formatCurrency(deployment.availableCash),
    actions: deployment.recommendations.map((rec) => ({
      category: capitalizeFirst(rec.targetCategory),
      sleeve: rec.targetSleeve,
      amount: formatCurrency(rec.amount),
      rationale: rec.rationale,
    })),
  }
}

/**
 * Format complete rebalancing result.
 */
export function formatResult(result: RebalancingResult): FormattedResult {
  return {
    timestamp: result.timestamp,
    exchangeRate: `1 USD = ${result.exchangeRates.USD.toFixed(2)} CAD`,
    persons: result.personResults.map(formatPersonResult),
    deployments: result.deploymentRecommendations.map(formatDeployment),
  }
}

// ============================================================================
// Markdown Output
// ============================================================================

/**
 * Generate Markdown table from gaps.
 */
export function gapsToMarkdownTable(gaps: readonly FormattedGapRow[]): string {
  const lines: string[] = [
    '| Category | Current | Target | Delta | Action |',
    '|----------|---------|--------|-------|--------|',
  ]

  for (const gap of gaps) {
    lines.push(
      `| ${gap.category} | ${gap.current} | ${gap.target} | ${gap.delta} | ${gap.action} |`,
    )
  }

  return lines.join('\n')
}

/**
 * Generate Markdown section for a person.
 */
export function personToMarkdown(person: FormattedPersonSummary): string {
  const lines: string[] = [
    `### ${person.name}`,
    '',
    '**Summary:**',
    `- Total Portfolio: ${person.totalPortfolio}`,
    `- Investable: ${person.investable}`,
    `- Real Estate: ${person.realEstate} (${person.realEstatePercent}) — ${person.realEstateStatus}`,
    '',
    '**Adjusted Targets (normalized to investable):**',
    '',
    '| Category | Target % |',
    '|----------|----------|',
  ]

  for (const target of person.adjustedTargets) {
    lines.push(`| ${target.category} | ${target.percent} |`)
  }

  lines.push('', '**Current vs Target:**', '')
  lines.push(gapsToMarkdownTable(person.gaps))

  return lines.join('\n')
}

/**
 * Generate Markdown for deployments.
 */
export function deploymentsToMarkdown(
  deployments: readonly FormattedDeployment[],
): string {
  const lines: string[] = ['### Deployment Recommendations', '']

  for (const dep of deployments) {
    if (dep.actions.length === 0) continue

    const label = dep.accountLabel
      ? `${dep.accountType} (${dep.accountLabel})`
      : dep.accountType

    lines.push(`**${label}** — Available: ${dep.availableCash}`)
    lines.push('')

    for (const action of dep.actions) {
      lines.push(
        `- Deploy ${action.amount} → ${action.sleeve} (${action.category}): ${action.rationale}`,
      )
    }

    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate complete Markdown report.
 */
export function resultToMarkdown(result: FormattedResult): string {
  const lines: string[] = [
    '## Portfolio Rebalancing Report',
    '',
    `Generated: ${result.timestamp}`,
    `Exchange Rate: ${result.exchangeRate}`,
    '',
  ]

  for (const person of result.persons) {
    lines.push(personToMarkdown(person))
    lines.push('')
  }

  lines.push(deploymentsToMarkdown(result.deployments))

  return lines.join('\n')
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Capitalize first letter.
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format delta with sign.
 */
function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatCurrency(value)}`
}
