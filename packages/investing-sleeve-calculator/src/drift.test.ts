import {
  //
  assertEquals,
  assertThrows,
} from '@std/assert'
import {
  //
  DriftCalculator,
  SleeveCalculator,
} from './index.ts'
import type {
  //
  CalculationResult,
} from './types.ts'
import {
  //
  EXAMPLE_SLEEVES_CONFIG,
} from './sleeves.examples.ts'

// Test fixture - create a sample calculation result
const createTestCalculation = (): CalculationResult => {
  const calculator = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG)
  return calculator.calculate(
    'core',
    5000,
    1.42,
  )
}

Deno.test('DriftCalculator - Constructor and initialization', async (t) => {
  const calculation = createTestCalculation()

  await t.step('accepts valid calculation result', () => {
    const drift = new DriftCalculator(calculation)
    assertEquals(drift.getCalculationResult().sleeveName, 'core')
  })

  await t.step('initializes with empty actuals', () => {
    const drift = new DriftCalculator(calculation)
    const actuals = drift.getActuals()
    assertEquals(Object.keys(actuals).length, 0)
  })

  await t.step('preserves all targets from calculation', () => {
    const drift = new DriftCalculator(calculation)
    const tasks = drift.getTasks()
    assertEquals(tasks.length, calculation.targets.length)
  })
})

Deno.test('DriftCalculator - setCurrentlyOwning', async (t) => {
  const calculation = createTestCalculation()

  await t.step('sets actual holding for valid security', () => {
    const drift = new DriftCalculator(calculation)
    drift.setCurrentlyOwning('AVDV', 350)

    const actuals = drift.getActuals()
    assertEquals(actuals['AVDV'], 350)
  })

  await t.step('allows updating existing holding', () => {
    const drift = new DriftCalculator(calculation)
    drift.setCurrentlyOwning('AVDV', 350)
    drift.setCurrentlyOwning('AVDV', 400)

    const actuals = drift.getActuals()
    assertEquals(actuals['AVDV'], 400)
  })

  await t.step('rejects unknown security symbol', () => {
    const drift = new DriftCalculator(calculation)

    assertThrows(
      () => drift.setCurrentlyOwning('INVALID', 100),
      Error,
      'Security "INVALID" not found in targets',
    )
  })

  await t.step('accepts zero holdings', () => {
    const drift = new DriftCalculator(calculation)
    drift.setCurrentlyOwning('AVDV', 0)

    const actuals = drift.getActuals()
    assertEquals(actuals['AVDV'], 0)
  })
})

Deno.test('DriftCalculator - getDelta', async (t) => {
  const calculation = createTestCalculation()

  await t.step('calculates buy delta when under-allocated', () => {
    const drift = new DriftCalculator(calculation)
    // Set AVDV below target to trigger buy (target ~211 USD)
    drift.setCurrentlyOwning('AVDV', 150)

    const delta = drift.getDelta('AVDV')!
    assertEquals(delta.symbol, 'AVDV')
    assertEquals(delta.from, 150)
    assertEquals(delta.action, 'buy')
    assertEquals(delta.currency, 'USD')
    assertEquals(delta.delta > 0, true) // Should be positive
  })

  await t.step('calculates sell delta when over-allocated', () => {
    const drift = new DriftCalculator(calculation)
    // Set VUN holding above its target to trigger sell
    drift.setCurrentlyOwning('VUN', 2000)

    const delta = drift.getDelta('VUN')!
    assertEquals(delta.action, 'sell')
    assertEquals(delta.currency, 'CAD')
    assertEquals(delta.delta < 0, true) // Should be negative
  })

  await t.step('returns hold when within threshold (0.01)', () => {
    const drift = new DriftCalculator(calculation)
    const avdvTarget = calculation.targets.find((t) => t.symbol === 'AVDV')!

    // Set to exact target
    drift.setCurrentlyOwning('AVDV', avdvTarget.targetAmount)

    const delta = drift.getDelta('AVDV')!
    assertEquals(delta.action, 'hold')
    assertEquals(Math.abs(delta.delta), 0)
  })

  await t.step('returns hold when delta less than 1 cent', () => {
    const drift = new DriftCalculator(calculation)
    const avdvTarget = calculation.targets.find((t) => t.symbol === 'AVDV')!

    // Set to target + 0.005 (half a cent)
    drift.setCurrentlyOwning('AVDV', avdvTarget.targetAmount + 0.005)

    const delta = drift.getDelta('AVDV')!
    assertEquals(delta.action, 'hold')
  })

  await t.step('returns null for unknown security', () => {
    const drift = new DriftCalculator(calculation)
    const delta = drift.getDelta('INVALID')
    assertEquals(delta, null)
  })

  await t.step('treats missing holding as zero', () => {
    const drift = new DriftCalculator(calculation)
    const delta = drift.getDelta('AVDV')!

    assertEquals(delta.from, 0)
    assertEquals(delta.action, 'buy')
  })
})

Deno.test('DriftCalculator - getTasks', async (t) => {
  const calculation = createTestCalculation()

  await t.step('returns tasks for all securities in targets', () => {
    const drift = new DriftCalculator(calculation)
    const tasks = drift.getTasks()

    assertEquals(tasks.length, calculation.targets.length)

    // All should be buy actions (no actuals set)
    for (const task of tasks) {
      assertEquals(task.action, 'buy')
      assertEquals(task.from, 0)
    }
  })

  await t.step('returns mixed buy/sell/hold actions', () => {
    const drift = new DriftCalculator(calculation)

    // Set various holdings to trigger different actions
    drift.setCurrentlyOwning('AVUV', 200)   // Below target → buy
    drift.setCurrentlyOwning('AVDV', 100)   // Below target → buy
    drift.setCurrentlyOwning('VUN', 2000)   // Above target → sell
    drift.setCurrentlyOwning('XIC', 2000)   // Above target → sell

    const tasks = drift.getTasks()

    const actions = new Set(tasks.map((t) => t.action))
    assertEquals(actions.has('buy'), true)
    assertEquals(actions.has('sell'), true)
  })

  await t.step('preserves currency information', () => {
    const drift = new DriftCalculator(calculation)
    const tasks = drift.getTasks()

    // Check we have both CAD and USD tasks
    const currencies = new Set(tasks.map((t) => t.currency))
    assertEquals(currencies.has('CAD'), true)
    assertEquals(currencies.has('USD'), true)
  })
})

Deno.test('DriftCalculator - getActionableTasks', async (t) => {
  const calculation = createTestCalculation()

  await t.step('filters out hold actions', () => {
    const drift = new DriftCalculator(calculation)

    // Set some holdings at exact target
    const avdvTarget = calculation.targets.find((t) => t.symbol === 'AVDV')!
    drift.setCurrentlyOwning('AVDV', avdvTarget.targetAmount)

    const allTasks = drift.getTasks()
    const actionable = drift.getActionableTasks()

    assertEquals(actionable.length < allTasks.length, true)

    // No hold actions in actionable list
    for (const task of actionable) {
      assertEquals(task.action !== 'hold', true)
    }
  })

  await t.step('returns empty array when all balanced', () => {
    const drift = new DriftCalculator(calculation)

    // Set all to exact targets
    for (const target of calculation.targets) {
      drift.setCurrentlyOwning(target.symbol, target.targetAmount)
    }

    const actionable = drift.getActionableTasks()
    assertEquals(actionable.length, 0)
  })
})

Deno.test('DriftCalculator - Serialization (toJSON/fromJSON)', async (t) => {
  const calculation = createTestCalculation()

  await t.step('serializes to JSON correctly', () => {
    const drift = new DriftCalculator(calculation)
    drift.setCurrentlyOwning('AVDV', 350)
    drift.setCurrentlyOwning('VUN', 600)

    const state = drift.toJSON()

    assertEquals(state.calculationResult.sleeveName, 'core')
    assertEquals(state.actuals['AVDV'], 350)
    assertEquals(state.actuals['VUN'], 600)
  })

  await t.step('rehydrates from JSON correctly', () => {
    const drift1 = new DriftCalculator(calculation)
    drift1.setCurrentlyOwning('AVDV', 350)
    drift1.setCurrentlyOwning('VUN', 600)

    const state = drift1.toJSON()
    const drift2 = DriftCalculator.fromJSON(state)

    const actuals = drift2.getActuals()
    assertEquals(actuals['AVDV'], 350)
    assertEquals(actuals['VUN'], 600)
  })

  await t.step('preserves tasks after rehydration', () => {
    const drift1 = new DriftCalculator(calculation)
    drift1.setCurrentlyOwning('AVDV', 350)
    drift1.setCurrentlyOwning('VUN', 600)

    const tasks1 = drift1.getTasks()

    const state = drift1.toJSON()
    const drift2 = DriftCalculator.fromJSON(state)
    const tasks2 = drift2.getTasks()

    assertEquals(tasks1.length, tasks2.length)

    // Compare specific task details
    const avdv1 = tasks1.find((t) => t.symbol === 'AVDV')!
    const avdv2 = tasks2.find((t) => t.symbol === 'AVDV')!

    assertEquals(avdv1.from, avdv2.from)
    assertEquals(avdv1.to, avdv2.to)
    assertEquals(avdv1.delta, avdv2.delta)
    assertEquals(avdv1.action, avdv2.action)
  })
})

Deno.test('DriftCalculator - clearActuals', async (t) => {
  const calculation = createTestCalculation()

  await t.step('removes all actual holdings', () => {
    const drift = new DriftCalculator(calculation)
    drift.setCurrentlyOwning('AVDV', 350)
    drift.setCurrentlyOwning('VUN', 600)

    drift.clearActuals()

    const actuals = drift.getActuals()
    assertEquals(Object.keys(actuals).length, 0)
  })

  await t.step('resets all tasks to buy from zero', () => {
    const drift = new DriftCalculator(calculation)
    drift.setCurrentlyOwning('AVDV', 350)

    drift.clearActuals()

    const tasks = drift.getTasks()
    for (const task of tasks) {
      assertEquals(task.from, 0)
      assertEquals(task.action, 'buy')
    }
  })
})

Deno.test('DriftCalculator - Real-world rebalancing scenario', async (t) => {
  await t.step('calculates realistic rebalancing tasks', () => {
    const calculator = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG)
    const calculation = calculator.calculate('core', 5000, 1.42)

    const drift = new DriftCalculator(calculation)

    // Set realistic current holdings (some under, some over, some at target)
    drift.setCurrentlyOwning('AVUV', 400)   // Below target → buy
    drift.setCurrentlyOwning('AVDV', 150)   // Below target → buy
    drift.setCurrentlyOwning('VUN', 1500)   // At target (5000 * 30% = 1500)
    drift.setCurrentlyOwning('XEC', 300)    // Below target → buy
    drift.setCurrentlyOwning('XEF', 900)    // Above target → sell
    drift.setCurrentlyOwning('XIC', 1800)   // Above target → sell

    const tasks = drift.getTasks()

    // Verify we have all securities from Five Factor Portfolio
    assertEquals(tasks.length, 6)

    // Test the calculation logic, not hardcoded values
    const actions = new Set(tasks.map((t) => t.action))
    assertEquals(actions.has('buy'), true)   // Has at least one buy
    assertEquals(actions.has('sell'), true)  // Has at least one sell
    assertEquals(actions.has('hold'), true)  // Has at least one hold

    // Verify specific security actions match what we set
    const avdv = tasks.find((t) => t.symbol === 'AVDV')!
    assertEquals(avdv.action, 'buy')
    assertEquals(avdv.currency, 'USD')
    assertEquals(avdv.from, 150)

    const vun = tasks.find((t) => t.symbol === 'VUN')!
    assertEquals(vun.action, 'hold')  // At target
    assertEquals(vun.currency, 'CAD')

    const xef = tasks.find((t) => t.symbol === 'XEF')!
    assertEquals(xef.action, 'sell')  // Over target
    assertEquals(xef.currency, 'CAD')
  })
})

Deno.test('DriftCalculator - Edge cases', async (t) => {
  const calculation = createTestCalculation()

  await t.step('handles very small target amounts', () => {
    const drift = new DriftCalculator(calculation)

    // Find smallest target
    const targets = calculation.targets.sort((a, b) =>
      a.targetAmount - b.targetAmount
    )
    const smallest = targets[0]

    drift.setCurrentlyOwning(smallest.symbol, smallest.targetAmount)

    const delta = drift.getDelta(smallest.symbol)!
    assertEquals(delta.action, 'hold')
  })

  await t.step('handles large holdings differences', () => {
    const drift = new DriftCalculator(calculation)

    // Set holding way over target (VUN target ~1500 CAD)
    drift.setCurrentlyOwning('VUN', 10000)

    const delta = drift.getDelta('VUN')!
    const vunTarget = calculation.targets.find((t) => t.symbol === 'VUN')!

    // Verify it's a sell action with large negative delta
    assertEquals(delta.action, 'sell')
    assertEquals(delta.from, 10000)
    assertEquals(delta.to, vunTarget.targetAmount)
    assertEquals(delta.delta, vunTarget.targetAmount - 10000) // Negative, large magnitude
  })

  await t.step('handles fractional amounts correctly', () => {
    const drift = new DriftCalculator(calculation)

    // USD securities often have fractional shares
    drift.setCurrentlyOwning('AVDV', 350.5678)

    const delta = drift.getDelta('AVDV')!
    assertEquals(typeof delta.delta, 'number')
    assertEquals(delta.from, 350.5678)
  })
})

Deno.test('DriftCalculator - Currency handling', async (t) => {
  const calculation = createTestCalculation()

  await t.step('CAD securities use CAD currency', () => {
    const drift = new DriftCalculator(calculation)
    const vun = drift.getDelta('VUN')!

    assertEquals(vun.currency, 'CAD')
  })

  await t.step('USD securities use USD currency', () => {
    const drift = new DriftCalculator(calculation)
    const avdv = drift.getDelta('AVDV')!

    assertEquals(avdv.currency, 'USD')
  })

  await t.step('preserves currency in all task results', () => {
    const drift = new DriftCalculator(calculation)
    const tasks = drift.getTasks()

    for (const task of tasks) {
      assertEquals(
        task.currency === 'CAD' || task.currency === 'USD',
        true,
      )
    }
  })
})
