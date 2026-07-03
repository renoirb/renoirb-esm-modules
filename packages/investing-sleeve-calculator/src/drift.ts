/**
 * DriftCalculator - Compare target allocations vs actual holdings
 *
 * Self-contained class that:
 * - Stores targets (with currency info)
 * - Tracks actual holdings (mutable state)
 * - Calculates deltas on demand
 * - Supports serialization/rehydration
 */

import type {
  CalculationResult,
  DeltaResult,
  DriftAction,
  DriftCalculatorState,
  SecurityTarget,
} from './types.ts'

export class DriftCalculator {
  private calculationResult: CalculationResult
  private actuals: Map<string, number>
  private targetsMap: Map<string, SecurityTarget>

  /**
   * Create a new DriftCalculator from a calculation result
   */
  constructor(calculationResult: CalculationResult) {
    this.calculationResult = calculationResult
    this.actuals = new Map()

    // Build a map of targets for quick lookup
    this.targetsMap = new Map(
      calculationResult.targets.map((target) => [target.symbol, target]),
    )
  }

  /**
   * Rehydrate a DriftCalculator from saved state
   */
  static fromJSON(state: DriftCalculatorState): DriftCalculator {
    const drift = new DriftCalculator(state.calculationResult)

    // Restore actual holdings
    for (const [symbol, amount] of Object.entries(state.actuals)) {
      drift.actuals.set(symbol, amount)
    }

    return drift
  }

  /**
   * Set current holding amount for a security
   * Currency is inferred from targets
   */
  setCurrentlyOwning(symbol: string, amount: number): void {
    // Validate that this security exists in targets
    if (!this.targetsMap.has(symbol)) {
      throw new Error(
        `Security "${symbol}" not found in targets for sleeve "${this.calculationResult.sleeveName}"`,
      )
    }

    this.actuals.set(symbol, amount)
  }

  /**
   * Get the delta (difference) for a specific security
   * Returns null if security not found in targets
   */
  getDelta(symbol: string): DeltaResult | null {
    const target = this.targetsMap.get(symbol)
    if (!target) {
      return null
    }

    const actual = this.actuals.get(symbol) ?? 0
    const delta = target.targetAmount - actual

    // Determine action
    let action: DriftAction
    if (Math.abs(delta) < 0.01) {
      // Within 1 cent - consider it balanced
      action = 'hold'
    } else if (delta > 0) {
      action = 'buy'
    } else {
      action = 'sell'
    }

    return {
      symbol,
      from: actual,
      to: target.targetAmount,
      delta,
      action,
      currency: target.currency,
    }
  }

  /**
   * Get all deltas (for all securities in targets)
   * Only returns securities with targets (not extra holdings)
   */
  getTasks(): DeltaResult[] {
    const tasks: DeltaResult[] = []

    for (const target of this.calculationResult.targets) {
      const delta = this.getDelta(target.symbol)
      if (delta) {
        tasks.push(delta)
      }
    }

    return tasks
  }

  /**
   * Get tasks that require action (buy or sell, not hold)
   */
  getActionableTasks(): DeltaResult[] {
    return this.getTasks().filter((task) => task.action !== 'hold')
  }

  /**
   * Serialize current state for storage/transmission
   */
  toJSON(): DriftCalculatorState {
    return {
      calculationResult: this.calculationResult,
      actuals: Object.fromEntries(this.actuals),
    }
  }

  /**
   * Get the calculation result (targets)
   */
  getCalculationResult(): CalculationResult {
    return this.calculationResult
  }

  /**
   * Get current actual holdings
   */
  getActuals(): Record<string, number> {
    return Object.fromEntries(this.actuals)
  }

  /**
   * Clear all actual holdings
   */
  clearActuals(): void {
    this.actuals.clear()
  }
}
