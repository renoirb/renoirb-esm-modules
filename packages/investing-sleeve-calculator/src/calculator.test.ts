import {
  //
  assertEquals,
  assertThrows,
} from '@std/assert'
import SleeveCalculator from './index.ts'
import type { SleevesConfig } from './types.ts'
import {
  //
  EXAMPLE_SLEEVES_CONFIG,
  EXAMPLE_CORE_SLEEVE_DEFINITION,
} from './sleeves.examples.ts'

// Test fixture - simplified sleeves config
const testConfig: SleevesConfig = {
  sleeves: {
    ...EXAMPLE_SLEEVES_CONFIG.sleeves,
    'testing': {
      weights: {
        ACTIVE1:  50,
        ACTIVE2:  50,
        WATCHING:  0.01, // Below 0.1 threshold
        DISABLED:  0,
      },
    },
    /**
     * USD-only variant of the Five Factor Portfolio for testing.
     *
     * This sleeve uses US-listed ETFs exclusively, suitable for USD-denominated
     * accounts or US-based investors. All securities require currency conversion
     * when calculating from CAD total amounts.
     *
     * **Comparison:**
     * - CAD variant (core): Uses VUN, XIC, XEF, XEC with 2 USD securities
     * - USD variant (this): Uses VTI, VEA, VWO - all 5 securities in USD
     *
     * @see {@link https://www.optimizedportfolio.com/ben-felix-model-portfolio/ Ben Felix USD Portfolio Variant}
     * @see {@link EXAMPLE_CORE_SLEEVE_DEFINITION} for CAD-hedged variant
     */
    'core-USD': {
      weights: {
        AVDV:  8,
        AVUV: 14,
        VEA:  24,
        VTI:  42,
        VWO:  12,
      },
      usd_symbols: [
        'AVDV',
        'AVUV',
        'VEA',
        'VTI',
        'VWO',
      ],
    }
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
        bad: {}, // Missing weights property
      },
    }
    assertThrows(
      () => new SleeveCalculator(badConfig as unknown as SleevesConfig),
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
    const coreUsdSleeve = testConfig.sleeves['core-USD']
    const totalCAD = 1000
    const exchangeRate = 1.42
    const result = calculator.calculate('core-USD', totalCAD, exchangeRate)

    assertEquals(result.sleeveName, 'core-USD')
    assertEquals(result.targets.length, Object.keys(coreUsdSleeve.weights).length)

    // All targets should be USD
    for (const target of result.targets) {
      assertEquals(target.currency, 'USD')
    }

    // Check one security - VTI (weight from source)
    const vtiWeight = coreUsdSleeve.weights.VTI
    const vti = result.targets.find((t) => t.symbol === 'VTI')!
    assertEquals(vti.weight, vtiWeight)
    assertEquals(vti.normalizedWeight, vtiWeight / 100)

    // Verify calculation: totalCAD * weight% / exchangeRate
    const expectedVtiAmount = (totalCAD * vtiWeight / 100) / exchangeRate
    assertEquals(vti.targetAmount, expectedVtiAmount)

    // Summary - all USD
    assertEquals(result.summary.totalCAD, 0)
    assertEquals(Math.round(result.summary.totalUSD), Math.round(totalCAD / exchangeRate))
  })

  await t.step('calculates mixed CAD/USD sleeve correctly', () => {
    const coreSleeve = EXAMPLE_CORE_SLEEVE_DEFINITION
    const totalCAD = 5000
    const exchangeRate = 1.42
    const result = calculator.calculate('core', totalCAD, exchangeRate)

    assertEquals(result.sleeveName, 'core')
    assertEquals(result.targets.length, Object.keys(coreSleeve.weights).length)

    // Check USD security - AVDV (weight from source)
    const avdvWeight = coreSleeve.weights.AVDV
    const avdv = result.targets.find((t) => t.symbol === 'AVDV')!
    assertEquals(avdv.currency, 'USD')
    assertEquals(avdv.weight, avdvWeight)
    assertEquals(avdv.normalizedWeight, avdvWeight / 100)

    // Verify calculation: totalCAD * weight% / exchangeRate
    const expectedAvdvAmount = (totalCAD * avdvWeight / 100) / exchangeRate
    assertEquals(avdv.targetAmount, expectedAvdvAmount)

    // Check CAD security - VUN (weight from source)
    const vunWeight = coreSleeve.weights.VUN
    const vun = result.targets.find((t) => t.symbol === 'VUN')!
    assertEquals(vun.currency, 'CAD')
    assertEquals(vun.weight, vunWeight)
    assertEquals(vun.normalizedWeight, vunWeight / 100)

    // Calculate expected amount: totalCAD * weight%
    const expectedVunAmount = totalCAD * vunWeight / 100
    assertEquals(vun.targetAmount, expectedVunAmount)

    // Summary should have both CAD and USD
    assertEquals(result.summary.totalCAD > 0, true)
    assertEquals(result.summary.totalUSD > 0, true)
    // Total should equal input (CAD + USD-in-CAD)
    const total = result.summary.totalCAD + result.summary.totalUSDInCAD
    assertEquals(Math.round(total), totalCAD)
  })

  await t.step('filters out zero and near-zero weights', () => {
    const result = calculator.calculate('testing', 1000, 1.42)

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
    const coreSleeve = EXAMPLE_CORE_SLEEVE_DEFINITION
    const totalCAD = 70000
    const exchangeRate = 1.42
    const result = calculator.calculate('core', totalCAD, exchangeRate)

    assertEquals(result.totalAmountCAD, totalCAD)

    const avdvWeight = coreSleeve.weights.AVDV
    const avdv = result.targets.find((t) => t.symbol === 'AVDV')!

    // Verify calculation: totalCAD * weight% / exchangeRate
    const expectedAvdvAmount = (totalCAD * avdvWeight / 100) / exchangeRate
    assertEquals(avdv.targetAmount, expectedAvdvAmount)
  })

  await t.step('handles different exchange rates', () => {
    const coreSleeve = EXAMPLE_CORE_SLEEVE_DEFINITION
    const totalCAD = 5000
    const exchangeRate1 = 1.30
    const exchangeRate2 = 1.50

    const rate1 = calculator.calculate('core', totalCAD, exchangeRate1)
    const rate2 = calculator.calculate('core', totalCAD, exchangeRate2)

    const avdv1 = rate1.targets.find((t) => t.symbol === 'AVDV')!
    const avdv2 = rate2.targets.find((t) => t.symbol === 'AVDV')!

    // Verify: Same CAD amount but different USD amounts due to exchange rate
    const avdvWeight = coreSleeve.weights.AVDV
    const cadAmount = totalCAD * avdvWeight / 100
    const expectedAmount1 = cadAmount / exchangeRate1
    const expectedAmount2 = cadAmount / exchangeRate2

    assertEquals(avdv1.targetAmount, expectedAmount1)
    assertEquals(avdv2.targetAmount, expectedAmount2)
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
      ['bullion', 'core', 'core-USD', 'testing'].sort(),
    )
  })

  await t.step('hasSleeve correctly identifies existing sleeves', () => {
    assertEquals(calculator.hasSleeve('core'), true)
    assertEquals(calculator.hasSleeve('core-USD'), true)
    assertEquals(calculator.hasSleeve('unknown'), false)
  })
})

Deno.test('SleeveCalculator - Real-world example', async (t) => {
  await t.step('calculates Alice total AVDV across accounts', () => {
    const calculator = new SleeveCalculator(testConfig)
    const coreSleeve = EXAMPLE_CORE_SLEEVE_DEFINITION
    const exchangeRate = 1.42

    // Alice TFSA: 5K in core
    const tfsaTotal = 5000
    const tfsa = calculator.calculate('core', tfsaTotal, exchangeRate)
    const avdvTFSA = tfsa.targets.find((t) => t.symbol === 'AVDV')!

    // Alice RRSP: 70K in core
    const rrspTotal = 70000
    const rrsp = calculator.calculate('core', rrspTotal, exchangeRate)
    const avdvRRSP = rrsp.targets.find((t) => t.symbol === 'AVDV')!

    // Total AVDV across both accounts
    const totalAVDV = avdvTFSA.targetAmount + avdvRRSP.targetAmount

    // Verify total matches expected calculation from source weight
    const avdvWeight = coreSleeve.weights.AVDV
    const expectedTFSA = (tfsaTotal * avdvWeight / 100) / exchangeRate
    const expectedRRSP = (rrspTotal * avdvWeight / 100) / exchangeRate
    const expectedTotal = expectedTFSA + expectedRRSP

    assertEquals(totalAVDV, expectedTotal)
  })
})
