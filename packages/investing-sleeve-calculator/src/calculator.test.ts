import {
  //
  assertEquals,
  assertThrows,
} from '@std/assert'
import SleeveCalculator from './index.ts'
import type { SleevesConfig } from './types.ts'
import { EXAMPLE_SLEEVES_CONFIG } from './sleeves.examples.ts'

// Test fixture - simplified sleeves config
const testConfig: SleevesConfig = {
  sleeves: {
    ...EXAMPLE_SLEEVES_CONFIG.sleeves,
    'test-with-zeros': {
      weights: {
        ACTIVE1: 50,
        ACTIVE2: 50,
        WATCHING: 0.01, // Below 0.1 threshold
        DISABLED: 0,
      },
    },
  },
}

Deno.test('SleeveCalculator - Constructor validation', async (t) => {
  await t.step('accepts valid config', () => {
    const calculator = new SleeveCalculator(testConfig)
    assertEquals(calculator.getSleeveNames().length, 4)
  })

  await t.step('rejects config without sleeves object', () => {
    assertThrows(
      () => new SleeveCalculator({} as SleevesConfig),
      Error,
      'Config must have a "sleeves" object',
    )
  })

  await t.step('rejects sleeve without weights', () => {
    const badConfig = {
      sleeves: {
        bad: {} as any,
      },
    }
    assertThrows(
      () => new SleeveCalculator(badConfig),
      Error,
      'must have a "weights" object',
    )
  })

  await t.step('rejects sleeve with weights not summing to 100', () => {
    const badConfig: SleevesConfig = {
      sleeves: {
        bad: {
          weights: {
            A: 30,
            B: 30, // Only 60% total
          },
        },
      },
    }
    assertThrows(
      () => new SleeveCalculator(badConfig),
      Error,
      'weights sum to 60.00%, expected ~100%',
    )
  })

  await t.step('rejects negative weights', () => {
    const badConfig: SleevesConfig = {
      sleeves: {
        bad: {
          weights: {
            A: 100,
            B: -10,
          },
        },
      },
    }
    assertThrows(
      () => new SleeveCalculator(badConfig),
      Error,
      'has negative weight',
    )
  })
})

Deno.test('SleeveCalculator - Calculate method', async (t) => {
  const calculator = new SleeveCalculator(testConfig)

  await t.step('calculates CAD-only sleeve correctly', () => {
    const result = calculator.calculate('bullion', 1000, 1.42)

    console.log('result', result)
    assertEquals(result.sleeveName, 'bullion')
    assertEquals(result.totalAmountCAD, 1000)
    assertEquals(result.exchangeRate, 1.42)
    assertEquals(result.targets.length, 2)

    // Check PHYS (60%)
    const phys = result.targets.find((t) => t.symbol === 'PHYS')!
    assertEquals(phys.currency, 'CAD')
    assertEquals(phys.weight, 60)
    assertEquals(phys.normalizedWeight, 0.6)
    assertEquals(phys.targetAmount, 600)

    // Check PSLV (40%)
    const pslv = result.targets.find((t) => t.symbol === 'PSLV')!
    assertEquals(pslv.currency, 'CAD')
    assertEquals(pslv.weight, 40)
    assertEquals(pslv.normalizedWeight, 0.4)
    assertEquals(pslv.targetAmount, 400)

    // Summary
    assertEquals(result.summary.totalCAD, 1000)
    assertEquals(result.summary.totalUSD, 0)
    assertEquals(result.summary.totalUSDInCAD, 0)
  })

  await t.step('calculates USD-only sleeve correctly', () => {
    const result = calculator.calculate('core-USD', 1000, 1.42)

    assertEquals(result.sleeveName, 'core-USD')
    assertEquals(result.targets.length, 10)

    // All targets should be USD
    for (const target of result.targets) {
      assertEquals(target.currency, 'USD')
    }

    // Check one security - VTI (13%)
    const vti = result.targets.find((t) => t.symbol === 'VTI')!
    assertEquals(vti.weight, 13)
    assertEquals(vti.normalizedWeight, 0.13)
    // 1000 CAD * 0.13 = 130 CAD → 130 / 1.42 = 91.55 USD
    assertEquals(Math.round(vti.targetAmount * 100) / 100, 91.55)

    // Summary - all USD
    assertEquals(result.summary.totalCAD, 0)
    assertEquals(Math.round(result.summary.totalUSD), 704) // ~1000/1.42
  })

  await t.step('calculates mixed CAD/USD sleeve correctly', () => {
    const result = calculator.calculate('core', 5000, 1.42)

    assertEquals(result.sleeveName, 'core')
    assertEquals(result.targets.length, 11)

    // Check USD security - AVDV (10%)
    const avdv = result.targets.find((t) => t.symbol === 'AVDV')!
    assertEquals(avdv.currency, 'USD')
    assertEquals(avdv.weight, 10)
    assertEquals(avdv.normalizedWeight, 0.10)
    // 5000 CAD * 0.10 = 500 CAD → 500 / 1.42 = 352.11 USD
    assertEquals(Math.round(avdv.targetAmount * 100) / 100, 352.11)

    // Check CAD security - VUN (13%)
    const vun = result.targets.find((t) => t.symbol === 'VUN')!
    assertEquals(vun.currency, 'CAD')
    assertEquals(vun.weight, 13)
    assertEquals(vun.normalizedWeight, 0.13)
    assertEquals(vun.targetAmount, 650) // 5000 * 0.13

    // Summary should have both CAD and USD
    assertEquals(result.summary.totalCAD > 0, true)
    assertEquals(result.summary.totalUSD > 0, true)
    // Total should equal input (CAD + USD-in-CAD)
    const total = result.summary.totalCAD + result.summary.totalUSDInCAD
    assertEquals(Math.round(total), 5000)
  })

  await t.step('filters out zero and near-zero weights', () => {
    const result = calculator.calculate('test-with-zeros', 1000, 1.42)

    // Should only include ACTIVE1 and ACTIVE2 (not WATCHING or DISABLED)
    assertEquals(result.targets.length, 2)
    assertEquals(result.targets.some((t) => t.symbol === 'WATCHING'), false)
    assertEquals(result.targets.some((t) => t.symbol === 'DISABLED'), false)

    // Weights should be renormalized to 100%
    const active1 = result.targets.find((t) => t.symbol === 'ACTIVE1')!
    assertEquals(active1.normalizedWeight, 0.5)
    assertEquals(active1.targetAmount, 500)
  })

  await t.step('handles large allocations', () => {
    const result = calculator.calculate('core', 70000, 1.42)
    assertEquals(result.totalAmountCAD, 70000)

    const avdv = result.targets.find((t) => t.symbol === 'AVDV')!
    // 70000 * 0.10 / 1.42 = 4929.58 USD
    assertEquals(Math.round(avdv.targetAmount * 100) / 100, 4929.58)
  })

  await t.step('handles different exchange rates', () => {
    const rate1 = calculator.calculate('core', 5000, 1.30)
    const rate2 = calculator.calculate('core', 5000, 1.50)

    const avdv1 = rate1.targets.find((t) => t.symbol === 'AVDV')!
    const avdv2 = rate2.targets.find((t) => t.symbol === 'AVDV')!

    // Same CAD amount (500) but different USD amounts due to rate
    // 500/1.30 = 384.62 vs 500/1.50 = 333.33
    assertEquals(Math.round(avdv1.targetAmount * 100) / 100, 384.62)
    assertEquals(Math.round(avdv2.targetAmount * 100) / 100, 333.33)
  })
})

Deno.test('SleeveCalculator - Validation errors', async (t) => {
  const calculator = new SleeveCalculator(testConfig)

  await t.step('rejects unknown sleeve name', () => {
    assertThrows(
      () => calculator.calculate('unknown', 5000, 1.42),
      Error,
      'Sleeve "unknown" not found',
    )
  })

  await t.step('rejects zero allocation', () => {
    assertThrows(
      () => calculator.calculate('core', 0, 1.42),
      Error,
      'must be greater than 0',
    )
  })

  await t.step('rejects negative allocation', () => {
    assertThrows(
      () => calculator.calculate('core', -1000, 1.42),
      Error,
      'must be greater than 0',
    )
  })

  await t.step('rejects zero exchange rate', () => {
    assertThrows(
      () => calculator.calculate('core', 5000, 0),
      Error,
      'must be greater than 0',
    )
  })

  await t.step('rejects negative exchange rate', () => {
    assertThrows(
      () => calculator.calculate('core', 5000, -1.42),
      Error,
      'must be greater than 0',
    )
  })
})

Deno.test('SleeveCalculator - Helper methods', async (t) => {
  const calculator = new SleeveCalculator(testConfig)

  await t.step('getSleeveNames returns all sleeve names', () => {
    const names = calculator.getSleeveNames()
    assertEquals(
      names.sort(),
      ['bullion', 'core', 'core-USD', 'test-with-zeros'].sort(),
    )
  })

  await t.step('hasSleeve correctly identifies existing sleeves', () => {
    assertEquals(calculator.hasSleeve('core'), true)
    assertEquals(calculator.hasSleeve('core-USD'), true)
    assertEquals(calculator.hasSleeve('unknown'), false)
  })
})

Deno.test('SleeveCalculator - Real-world example', async (t) => {
  await t.step('calculates Renoir total AVDV across accounts', () => {
    const calculator = new SleeveCalculator(testConfig)

    // Renoir TFSA: 5K in core
    const tfsa = calculator.calculate('core', 5000, 1.42)
    const avdvTFSA = tfsa.targets.find((t) => t.symbol === 'AVDV')!

    // Renoir RRSP: 70K in core
    const rrsp = calculator.calculate('core', 70000, 1.42)
    const avdvRRSP = rrsp.targets.find((t) => t.symbol === 'AVDV')!

    // Total AVDV across both accounts
    const totalAVDV = avdvTFSA.targetAmount + avdvRRSP.targetAmount

    // 5K * 0.10 / 1.42 = 352.11 USD
    // 70K * 0.10 / 1.42 = 4929.58 USD
    // Total = 5281.69 USD
    assertEquals(Math.round(totalAVDV * 100) / 100, 5281.69)
  })
})
