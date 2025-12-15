import type {
  //
  CalculationResult,
  CurrencyCode,
  SecurityTarget,
  SleeveDefinition,
  SleevesConfig,
} from './types.ts'

/**
 * Pure calculation engine for portfolio sleeve target amounts
 *
 * @example
 * ```typescript
 * const calculator = new SleeveCalculator(parsedSleevesYaml);
 * const result = calculator.calculate('core', 5000, 1.42);
 * ```
 */
export class SleeveCalculator {
  private config: SleevesConfig

  /**
   * Create a new sleeve calculator
   *
   * @param config - Parsed sleeves configuration (from sleeves.yaml)
   * @throws {Error} If configuration is invalid
   */
  constructor(config: SleevesConfig) {
    this.validateConfig(config)
    this.config = config
  }

  /**
   * Calculate target amounts for a sleeve
   *
   * @param sleeveName - Name of the sleeve (e.g., 'core', 'core-USD')
   * @param totalAmountCAD - Total allocation in CAD
   * @param exchangeRate - Exchange rate (CAD per USD, e.g., 1.42)
   * @returns Calculation result with targets and summary
   * @throws {Error} If parameters are invalid
   */
  calculate(
    sleeveName: string,
    totalAmountCAD: number,
    exchangeRate: number,
  ): CalculationResult {
    // Validate parameters
    this.validateCalculateParams(sleeveName, totalAmountCAD, exchangeRate)

    const sleeve = this.config.sleeves[sleeveName]
    const usdSymbols = new Set(sleeve.usd_symbols || [])

    // Filter out zero and near-zero weights (< 0.1 are "watching" positions)
    const activeWeights = Object.entries(sleeve.weights)
      .filter(([_, weight]) => weight >= 0.1)

    // Calculate total weight from active positions
    const totalWeight = activeWeights.reduce(
      (sum, [_, weight]) => sum + weight,
      0,
    )

    if (totalWeight === 0) {
      throw new Error(
        `Sleeve "${sleeveName}" has no active positions (all weights < 0.1)`,
      )
    }

    // Calculate target for each security
    const targets: SecurityTarget[] = activeWeights.map(([symbol, weight]) => {
      const isUSD = usdSymbols.has(symbol)
      const normalizedWeight = weight / totalWeight
      const targetInCAD = totalAmountCAD * normalizedWeight

      // Convert to USD if needed
      const targetAmount = isUSD ? targetInCAD / exchangeRate : targetInCAD
      const currency: CurrencyCode = isUSD ? 'USD' : 'CAD'

      return {
        symbol,
        targetAmount,
        currency,
        weight,
        normalizedWeight,
      }
    })

    // Calculate summary
    const totalCAD = targets
      .filter((t) => t.currency === 'CAD')
      .reduce((sum, t) => sum + t.targetAmount, 0)

    const totalUSD = targets
      .filter((t) => t.currency === 'USD')
      .reduce((sum, t) => sum + t.targetAmount, 0)

    return {
      sleeveName,
      totalAmountCAD,
      exchangeRate,
      targets,
      summary: {
        totalCAD,
        totalUSD,
        totalUSDInCAD: totalUSD * exchangeRate,
      },
    }
  }

  /**
   * Get list of available sleeve names
   */
  getSleeveNames(): string[] {
    return Object.keys(this.config.sleeves)
  }

  /**
   * Check if a sleeve exists
   */
  hasSleeve(sleeveName: string): boolean {
    return sleeveName in this.config.sleeves
  }

  /**
   * Validate configuration structure and weights
   */
  private validateConfig(config: SleevesConfig): void {
    if (!config || typeof config !== 'object') {
      throw new Error('Config must be an object')
    }

    if (!config.sleeves || typeof config.sleeves !== 'object') {
      throw new Error('Config must have a "sleeves" object')
    }

    const sleeveNames = Object.keys(config.sleeves)
    if (sleeveNames.length === 0) {
      throw new Error('Config must have at least one sleeve')
    }

    // Validate each sleeve
    for (const [sleeveName, sleeve] of Object.entries(config.sleeves)) {
      this.validateSleeve(sleeveName, sleeve)
    }
  }

  /**
   * Validate a single sleeve definition
   */
  private validateSleeve(sleeveName: string, sleeve: SleeveDefinition): void {
    if (!sleeve.weights || typeof sleeve.weights !== 'object') {
      throw new Error(`Sleeve "${sleeveName}" must have a "weights" object`)
    }

    const weights = Object.values(sleeve.weights)
    if (weights.length === 0) {
      throw new Error(`Sleeve "${sleeveName}" must have at least one weight`)
    }

    // Check that weights are numbers
    for (const [symbol, weight] of Object.entries(sleeve.weights)) {
      if (typeof weight !== 'number' || isNaN(weight)) {
        throw new Error(
          `Sleeve "${sleeveName}" has invalid weight for ${symbol}: ${weight}`,
        )
      }
      if (weight < 0) {
        throw new Error(
          `Sleeve "${sleeveName}" has negative weight for ${symbol}: ${weight}`,
        )
      }
    }

    // Validate weight sum (exclude zero and near-zero weights)
    const activeWeights = weights.filter((w) => w >= 0.1)
    const totalWeight = activeWeights.reduce((sum, w) => sum + w, 0)

    // Allow tolerance of ±0.1% for rounding
    const tolerance = 0.1
    if (Math.abs(totalWeight - 100) > tolerance) {
      throw new Error(
        `Sleeve "${sleeveName}" weights sum to ${
          totalWeight.toFixed(2)
        }%, expected ~100%`,
      )
    }

    // Validate usd_symbols if present
    if (sleeve.usd_symbols !== undefined) {
      if (!Array.isArray(sleeve.usd_symbols)) {
        throw new Error(
          `Sleeve "${sleeveName}" usd_symbols must be an array`,
        )
      }
      for (const symbol of sleeve.usd_symbols) {
        if (typeof symbol !== 'string') {
          throw new Error(
            `Sleeve "${sleeveName}" usd_symbols must contain only strings`,
          )
        }
      }
    }
  }

  /**
   * Validate calculate method parameters
   */
  private validateCalculateParams(
    sleeveName: string,
    totalAmountCAD: number,
    exchangeRate: number,
  ): void {
    if (!this.hasSleeve(sleeveName)) {
      const available = this.getSleeveNames().join(', ')
      throw new Error(
        `Sleeve "${sleeveName}" not found. Available: ${available}`,
      )
    }

    if (typeof totalAmountCAD !== 'number' || isNaN(totalAmountCAD)) {
      throw new Error(`Total amount must be a number, got: ${totalAmountCAD}`)
    }

    if (totalAmountCAD <= 0) {
      throw new Error(
        `Total amount must be greater than 0, got: ${totalAmountCAD}`,
      )
    }

    if (typeof exchangeRate !== 'number' || isNaN(exchangeRate)) {
      throw new Error(`Exchange rate must be a number, got: ${exchangeRate}`)
    }

    if (exchangeRate <= 0) {
      throw new Error(
        `Exchange rate must be greater than 0, got: ${exchangeRate}`,
      )
    }
  }
}
