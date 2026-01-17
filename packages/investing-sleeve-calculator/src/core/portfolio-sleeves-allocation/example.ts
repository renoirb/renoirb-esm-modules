/**
 * Portfolio Rebalancing Framework - Example Usage
 *
 * Demonstrates constructing input from the provided YAML data
 * and running calculations.
 */

import {
  account,
  hardAsset,
  holdings,
  person,
  portfolioInput,
  sleeveHoldings,
} from './builders.js'

import { calculateRebalancing } from './calculations.js'

import { formatResult, resultToMarkdown } from './formatters.js'

import type {
  Account,
  HardAsset,
  Person,
  PortfolioInput,
  SleeveId,
} from './types.js'

// ============================================================================
// Example: Constructing from YAML-like data
// ============================================================================

/**
 * Build Alice's portfolio from the provided data.
 */
function buildAlicePortfolio(): Person {
  const tfsa: Account = account({
    type: 'TFSA',
    totalValue: 174775,
    sleeves: [
      {
        sleeveId: 'core',
        holdings: [
          { symbol: 'AVDV', totalValue: '7151.15', currency: 'USD' },
          { symbol: 'AVUV', totalValue: '4206.49', currency: 'USD' },
          { symbol: 'STPL', totalValue: '1599.99', currency: 'CAD' },
          { symbol: 'ZEA', totalValue: '1140.03', currency: 'CAD' },
          { symbol: 'ZCN', totalValue: '932.05', currency: 'CAD' },
          { symbol: 'VUN', totalValue: '927.35', currency: 'CAD' },
          { symbol: 'ZEM', totalValue: '780.43', currency: 'CAD' },
          { symbol: 'ZDM', totalValue: '659.96', currency: 'CAD' },
          { symbol: 'VA', totalValue: '234.84', currency: 'CAD' },
          { symbol: 'ZJPN', totalValue: '230', currency: 'CAD' },
          { symbol: 'XCH', totalValue: '219.99', currency: 'CAD' },
        ],
      },
      {
        sleeveId: 'core-USD',
        holdings: [
          { symbol: 'DFAX', totalValue: '3649.18', currency: 'USD' },
          { symbol: 'KXI', totalValue: '1660.77', currency: 'USD' },
          { symbol: 'VTI', totalValue: '1657.99', currency: 'USD' },
          { symbol: 'MAGC', totalValue: '1331.29', currency: 'USD' },
          { symbol: 'VEA', totalValue: '1285.44', currency: 'USD' },
          { symbol: 'DISV', totalValue: '1251.42', currency: 'USD' },
          { symbol: 'VWO', totalValue: '1158.78', currency: 'USD' },
          { symbol: 'DFSV', totalValue: '929.33', currency: 'USD' },
          { symbol: 'EWJ', totalValue: '629.69', currency: 'USD' },
          { symbol: 'VTV', totalValue: '386.26', currency: 'USD' },
        ],
      },
      {
        sleeveId: 'bullion',
        holdings: [{ symbol: 'PHYS', totalValue: '29118', currency: 'CAD' }],
      },
      {
        sleeveId: 'bullion-USD',
        holdings: [
          { symbol: 'OUNZ', totalValue: '10389.35', currency: 'USD' },
          { symbol: 'LITP', totalValue: '9375', currency: 'USD' },
        ],
      },
      {
        sleeveId: 'income',
        holdings: [
          { symbol: 'DFN', totalValue: '9738.8', currency: 'CAD' },
          { symbol: 'UMAX', totalValue: '3912', currency: 'CAD' },
        ],
      },
      {
        sleeveId: 'growth-USD',
        holdings: [{ symbol: 'DFIV', totalValue: '2526', currency: 'USD' }],
      },
      {
        sleeveId: 'stocks',
        holdings: [
          { symbol: 'LULU', totalValue: '12521.4', currency: 'USD' },
          { symbol: 'KHC', totalValue: '4799.05', currency: 'USD' },
          { symbol: 'ARM', totalValue: '4320.4', currency: 'USD' },
          { symbol: 'NVTS', totalValue: '0.01', currency: 'USD' },
        ],
      },
    ],
    unallocated: {
      CAD: 28003,
      USD: 777,
    },
  })

  const rrsp: Account = account({
    type: 'RRSP',
    totalValue: 469471,
    sleeves: [
      {
        sleeveId: 'core',
        holdings: [
          { symbol: 'ZEA', totalValue: '14300.56', currency: 'CAD' },
          { symbol: 'ZCN', totalValue: '11669.05', currency: 'CAD' },
          { symbol: 'STPL', totalValue: '11664.13', currency: 'CAD' },
          { symbol: 'VUN', totalValue: '11610.84', currency: 'CAD' },
          { symbol: 'ZEM', totalValue: '9832.75', currency: 'CAD' },
          { symbol: 'ZDM', totalValue: '8062.35', currency: 'CAD' },
          { symbol: 'ZJPN', totalValue: '2745', currency: 'CAD' },
          { symbol: 'VA', totalValue: '2724.83', currency: 'CAD' },
          { symbol: 'XCH', totalValue: '2680.57', currency: 'CAD' },
          { symbol: 'AVDV', totalValue: '156.13', currency: 'USD' },
        ],
      },
      {
        sleeveId: 'bullion',
        holdings: [
          { symbol: 'PHYS', totalValue: '107741.45', currency: 'CAD' },
          { symbol: 'PSLV', totalValue: '67813', currency: 'CAD' },
          { symbol: 'GPH', totalValue: '4080', currency: 'CAD' },
        ],
      },
      {
        sleeveId: 'bonds',
        holdings: [{ symbol: 'ZGB', totalValue: '22830', currency: 'CAD' }],
      },
      {
        sleeveId: 'stocks',
        holdings: [
          { symbol: 'AMD', totalValue: '12189.04', currency: 'CAD' },
          { symbol: 'IBM', totalValue: '0.28', currency: 'USD' },
        ],
      },
    ],
    unallocated: {
      CAD: 126487,
      USD: 14,
    },
  })

  const crypto: Account = account({
    type: 'Crypto',
    totalValue: 10450,
    sleeves: [
      {
        sleeveId: 'crypto',
        holdings: [{ symbol: 'BTC', totalValue: '10063.09', currency: 'CAD' }],
      },
    ],
    unallocated: { CAD: 0, USD: 0 },
  })

  const tfsaManaged: Account = account({
    type: 'Managed',
    label: 'TFSA Managed',
    totalValue: 5373,
    sleeves: [],
    unallocated: { CAD: 0, USD: 0 },
  })

  const rrspManaged: Account = account({
    type: 'Managed',
    label: 'RRSP Managed',
    totalValue: 13363,
    sleeves: [],
    unallocated: { CAD: 0, USD: 0 },
  })

  const chequing: Account = account({
    type: 'Chequing',
    totalValue: 3519,
    sleeves: [],
    unallocated: { CAD: 3519, USD: 0 },
  })

  const home: HardAsset = hardAsset({
    type: 'realEstate',
    description: 'Home (50% ownership)',
    value: 850000,
    ownershipPercent: 0.5,
    isLiquid: false,
  })

  return person({
    name: 'Alice',
    accounts: [tfsa, rrsp, crypto, tfsaManaged, rrspManaged, chequing],
    hardAssets: [home],
  })
}

/**
 * Build Bob's portfolio from the provided data.
 */
function buildBobPortfolio(): Person {
  const tfsa: Account = account({
    type: 'TFSA',
    totalValue: 31401,
    sleeves: [
      {
        sleeveId: 'core',
        holdings: [
          { symbol: 'ZEA', totalValue: '1001.68', currency: 'CAD' },
          { symbol: 'ZCN', totalValue: '820.8', currency: 'CAD' },
          { symbol: 'STPL', totalValue: '807.42', currency: 'CAD' },
          { symbol: 'VUN', totalValue: '801.1', currency: 'CAD' },
          { symbol: 'ZEM', totalValue: '657.89', currency: 'CAD' },
          { symbol: 'ZDM', totalValue: '563.81', currency: 'CAD' },
          { symbol: 'AVDV', totalValue: '551.23', currency: 'USD' },
          { symbol: 'AVUV', totalValue: '263.79', currency: 'USD' },
          { symbol: 'VA', totalValue: '191.05', currency: 'CAD' },
          { symbol: 'ZJPN', totalValue: '190.86', currency: 'CAD' },
          { symbol: 'XCH', totalValue: '187.29', currency: 'CAD' },
        ],
      },
      {
        sleeveId: 'bullion',
        holdings: [{ symbol: 'GOLD', totalValue: '6415.5', currency: 'CAD' }],
      },
      {
        sleeveId: 'income',
        holdings: [
          { symbol: 'DFN', totalValue: '11050.24', currency: 'CAD' },
          { symbol: 'UMAX', totalValue: '2243.01', currency: 'CAD' },
        ],
      },
    ],
    unallocated: {
      CAD: 2039,
      USD: 2372,
    },
  })

  const rrsp: Account = account({
    type: 'RRSP',
    totalValue: 277808,
    sleeves: [
      {
        sleeveId: 'core',
        holdings: [
          { symbol: 'ZEA', totalValue: '13946.69', currency: 'CAD' },
          { symbol: 'STPL', totalValue: '11463.6', currency: 'CAD' },
          { symbol: 'ZCN', totalValue: '11397.48', currency: 'CAD' },
          { symbol: 'VUN', totalValue: '11388.25', currency: 'CAD' },
          { symbol: 'ZEM', totalValue: '9581.12', currency: 'CAD' },
          { symbol: 'ZDM', totalValue: '7871.61', currency: 'CAD' },
          { symbol: 'AVDV', totalValue: '6355.09', currency: 'USD' },
          { symbol: 'AVUV', totalValue: '3851.07', currency: 'USD' },
          { symbol: 'VA', totalValue: '2614.81', currency: 'CAD' },
          { symbol: 'ZJPN', totalValue: '2612.77', currency: 'CAD' },
          { symbol: 'XCH', totalValue: '2608.24', currency: 'CAD' },
        ],
      },
      {
        sleeveId: 'bullion',
        holdings: [
          { symbol: 'PHYS', totalValue: '65515.5', currency: 'CAD' },
          { symbol: 'PSLV', totalValue: '30914.75', currency: 'CAD' },
        ],
      },
      {
        sleeveId: 'bonds',
        holdings: [{ symbol: 'ZGB', totalValue: '22830', currency: 'CAD' }],
      },
      {
        sleeveId: 'defensive',
        holdings: [{ symbol: 'TAGS', totalValue: '110.1', currency: 'USD' }],
      },
      {
        sleeveId: 'quality',
        holdings: [{ symbol: 'ZIQ', totalValue: '1031.7', currency: 'CAD' }],
      },
      {
        sleeveId: 'growth-USD',
        holdings: [{ symbol: 'DFIV', totalValue: '1149.21', currency: 'USD' }],
      },
      {
        sleeveId: 'stocks',
        holdings: [
          { symbol: 'AMT', totalValue: '6095.24', currency: 'USD' },
          { symbol: 'ARM', totalValue: '1299.36', currency: 'USD' },
        ],
      },
    ],
    unallocated: {
      CAD: 3841,
      USD: 107,
    },
  })

  const crypto: Account = account({
    type: 'Crypto',
    totalValue: 17734,
    sleeves: [
      {
        sleeveId: 'crypto',
        holdings: [{ symbol: 'BTC', totalValue: '17418.31', currency: 'CAD' }],
      },
    ],
    unallocated: { CAD: 0, USD: 0 },
  })

  const chequing: Account = account({
    type: 'Chequing',
    totalValue: 325,
    sleeves: [],
    unallocated: { CAD: 325, USD: 0 },
  })

  const home: HardAsset = hardAsset({
    type: 'realEstate',
    description: 'Home (50% ownership)',
    value: 850000,
    ownershipPercent: 0.5,
    isLiquid: false,
  })

  return person({
    name: 'Bob',
    accounts: [tfsa, rrsp, crypto, chequing],
    hardAssets: [home],
  })
}

// ============================================================================
// Main Example
// ============================================================================

/**
 * Run the complete calculation example.
 */
export function runExample(): string {
  const alice = buildAlicePortfolio()
  const bob = buildBobPortfolio()

  const input: PortfolioInput = portfolioInput({
    persons: [alice, bob],
    exchangeRates: {
      CAD: 1.0,
      USD: 1.38,
    },
    // Override: treat growth, growth-USD, quality, stocks as speculation
    sleeveCategoryMapping: {
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
    },
  })

  const result = calculateRebalancing(input)
  const formatted = formatResult(result)
  const markdown = resultToMarkdown(formatted)

  return markdown
}

// For direct execution:
// - Deno: deno run src/example.ts
// - Node: npx tsx src/example.ts
//
// Uncomment below for Deno direct execution:
// if (import.meta.main) {
//   console.log(runExample());
// }
