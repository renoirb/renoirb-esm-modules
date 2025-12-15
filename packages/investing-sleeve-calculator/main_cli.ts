import { parse as parseYAML } from '@std/yaml'

import {
  //
  EXAMPLE_SLEEVES_CONFIG,
} from './src/sleeves.examples.ts'
import {
  //
  DriftCalculator,
  SleeveCalculator,
  SleevesConfig,
} from './src/index.ts'
import type {
  //
  CalculationResult,
  DeltaResult,
} from './src/types.ts'

/**
 * Interactive CLI for portfolio sleeve calculator
 *
 * Prompts user for:
 * - Sleeve name
 * - Total CAD allocation
 * - Exchange rate
 * - Current holdings for each security
 *
 * Then displays rebalancing tasks
 */

const promptForNumber = (
  message: string,
  defaultValue?: number,
): number | null => {
  const defaultStr = defaultValue !== undefined
    ? ` (default: ${defaultValue})`
    : ''
  const input = prompt(`${message}${defaultStr}:`)

  if (input === null) {
    return null // User cancelled
  }

  if (input.trim() === '' && defaultValue !== undefined) {
    return defaultValue
  }

  const num = Number(input)
  if (Number.isNaN(num)) {
    console.error(`Invalid number: "${input}"`)
    return promptForNumber(message, defaultValue)
  }

  return num
}

const promptForString = (
  message: string,
  defaultValue?: string,
): string | null => {
  const defaultStr = defaultValue !== undefined
    ? ` (default: ${defaultValue})`
    : ''
  const input = prompt(`${message}${defaultStr}:`)

  if (input === null) {
    return null // User cancelled
  }

  if (input.trim() === '' && defaultValue !== undefined) {
    return defaultValue
  }

  return input.trim()
}

const formatTasks = (tasks: DeltaResult[]): void => {
  console.log('\n=== Rebalancing Tasks ===\n')

  // Group by action
  const buyTasks = tasks.filter((t) => t.action === 'buy')
  const sellTasks = tasks.filter((t) => t.action === 'sell')
  const holdTasks = tasks.filter((t) => t.action === 'hold')

  // SELL first (to free up liquidity)
  if (sellTasks.length > 0) {
    console.log('SELL:')
    console.table(
      sellTasks.map(({ symbol, delta, currency }) => ({
        symbol,
        amount: Math.abs(delta).toFixed(2),
        currency,
      })),
    )
  }

  // Then BUY
  if (buyTasks.length > 0) {
    console.log(sellTasks.length > 0 ? '\nBUY:' : 'BUY:')
    console.table(
      buyTasks.map(({ symbol, delta, currency }) => ({
        symbol,
        amount: Math.abs(delta).toFixed(2),
        currency,
      })),
    )
  }

  // Finally HOLD
  if (holdTasks.length > 0) {
    console.log(`\nHOLD: ${holdTasks.map((t) => t.symbol).join(', ')}`)
  }
}

const formatCalculationResult = (result: CalculationResult): void => {
  console.log('\n=== Calculation Result ===\n')
  console.log(`Sleeve: ${result.sleeveName}`)
  console.log(`Total allocation: $${result.totalAmountCAD.toFixed(2)} CAD`)
  console.log(`Exchange rate: ${result.exchangeRate} CAD/USD`)
  console.log(`\nTargets (${result.targets.length} securities):\n`)

  console.table(
    result.targets.map(({ symbol, targetAmount, currency, weight }) => ({
      symbol,
      target: targetAmount.toFixed(2),
      currency,
      weight: `${weight}%`,
    })),
  )
}

const maybeLoadSleevesYaml = async (path: string): Promise<SleevesConfig> => {
  let out: SleevesConfig
  // Load sleeves.yaml from parent directory
  const sleevesYaml = await Deno.readTextFile(path)
  out = parseYAML(sleevesYaml) as SleevesConfig

  return out
}

export const runInteractiveCLI = async (): Promise<void> => {
  let sleevesConfig: SleevesConfig = {}

  const [ possibleSleevesYamlPath ] = Deno.args
  if (possibleSleevesYamlPath) {
    try {
      sleevesConfig = await maybeLoadSleevesYaml(possibleSleevesYamlPath)
    } catch {
      console.error(`Could not load sleeves.yaml from "${possibleSleevesYamlPath}"`)
    }
  } else {
    sleevesConfig = EXAMPLE_SLEEVES_CONFIG
  }

  const calculator = new SleeveCalculator(sleevesConfig)

  console.log('=== Portfolio Sleeve Calculator ===\n')

  // List available sleeves
  const sleeves = calculator.getSleeveNames()
  console.log('Available sleeves:', sleeves.join(', '))

  // Prompt for sleeve name
  const sleeveName = promptForString('\nEnter sleeve name', 'core')
  if (sleeveName === null) {
    console.log('Cancelled.')
    return
  }

  if (!calculator.hasSleeve(sleeveName)) {
    console.error(`Error: Sleeve "${sleeveName}" not found.`)
    return
  }

  // Prompt for total CAD allocation
  const totalAmountCAD = promptForNumber(
    'Enter total CAD allocation',
    5000,
  )
  if (totalAmountCAD === null) {
    console.log('Cancelled.')
    return
  }

  // Prompt for exchange rate
  const exchangeRate = promptForNumber(
    'Enter CAD/USD exchange rate',
    1.42,
  )
  if (exchangeRate === null) {
    console.log('Cancelled.')
    return
  }

  // Calculate targets
  let calculation: CalculationResult
  try {
    calculation = calculator.calculate(
      sleeveName,
      totalAmountCAD,
      exchangeRate,
    )
  } catch (error) {
    console.error(`Calculation error: ${error?.message ?? error}`)
    return
  }

  // Display calculation result
  formatCalculationResult(calculation)

  // Ask if user wants to enter current holdings
  const enterHoldings = promptForString(
    '\nEnter current holdings? (y/n)',
    'y',
  )

  if (enterHoldings?.toLowerCase() !== 'y') {
    console.log('Done. No holdings entered.')
    return
  }

  // Create drift calculator
  const drift = new DriftCalculator(calculation)

  // Prompt for each security's current holding
  console.log('\nEnter current holdings for each security:')
  console.log('(Press Enter to skip, or enter 0 for zero holdings)\n')

  for (const target of calculation.targets) {
    const holding = promptForNumber(
      `  ${target.symbol} (${target.currency})`,
      0,
    )

    if (holding === null) {
      console.log('Cancelled.')
      return
    }

    drift.setCurrentlyOwning(target.symbol, holding)
  }

  // Calculate and display tasks
  const tasks = drift.getTasks()
  formatTasks(tasks)

  // Summary
  const actionable = drift.getActionableTasks()
  console.log(
    `\nSummary: ${actionable.length} actions needed, ${
      tasks.length - actionable.length
    } holdings balanced.`,
  )

  // Output minified state (for logging/reproduction)
  const state = drift.toJSON()
  console.log('\n=== State (minified) ===\n')
  console.log(JSON.stringify(state))
}

// Export for testing or programmatic use
export default runInteractiveCLI

// Run if executed directly
if (import.meta.main) {
  await runInteractiveCLI()
}
