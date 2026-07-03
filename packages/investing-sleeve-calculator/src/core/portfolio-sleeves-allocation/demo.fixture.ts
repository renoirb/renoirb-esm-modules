import {
  type Account,
  type Holding,
  type SleeveId,
} from './index.ts'

export const FIXTURE_HOLDINGS_ALICE_TFSA = (): Account => {
  const accountLabel = 'TFSA'

  const expectedPositionsTotalValue = 174775
  const unallocated = {
    CAD: 28003,
    USD: 777,
  }
  const allocated = {
    CAD: 0,
    USD: 0,
  }

  /**
   * @TODO The sleeveId should not be here, some other mapper should do what's hardcoded here.
   */
  const positions: (Holding & { sleeveId: SleeveId })[] = [
    {
      symbol: 'AVDV',
      totalValue: '7151.15',
      currency: 'USD',
      sleeveId: 'core',
    },
    {
      symbol: 'AVUV',
      totalValue: '4206.49',
      currency: 'USD',
      sleeveId: 'core',
    },
    {
      symbol: 'STPL',
      totalValue: '1599.99',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'VA',
      totalValue: '234.84',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'VUN',
      totalValue: '927.35',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'XCH',
      totalValue: '219.99',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'ZCN',
      totalValue: '932.05',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'ZDM',
      totalValue: '659.96',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'ZEA',
      totalValue: '1140.03',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'ZEM',
      totalValue: '780.43',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'ZJPN',
      totalValue: '230',
      currency: 'CAD',
      sleeveId: 'core',
    },
    {
      symbol: 'DFAX',
      totalValue: '3649.18',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'KXI',
      totalValue: '1660.77',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'VTI',
      totalValue: '1657.99',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'MAGC',
      totalValue: '1331.29',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'VEA',
      totalValue: '1285.44',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'DISV',
      totalValue: '1251.42',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'VWO',
      totalValue: '1158.78',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'DFSV',
      totalValue: '929.33',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'EWJ',
      totalValue: '629.69',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'VTV',
      totalValue: '386.26',
      currency: 'USD',
      sleeveId: 'core-USD',
    },
    {
      symbol: 'PHYS',
      totalValue: '29118',
      currency: 'CAD',
      sleeveId: 'bullion',
    },
    {
      symbol: 'OUNZ',
      totalValue: '10389.35',
      currency: 'USD',
      sleeveId: 'bullion-USD',
    },
    {
      symbol: 'LITP',
      totalValue: '9375',
      currency: 'USD',
      sleeveId: 'bullion-USD',
    },
    {
      symbol: 'DFN',
      totalValue: '9738.8',
      currency: 'CAD',
      sleeveId: 'income',
    },
    {
      symbol: 'UMAX',
      totalValue: '3912',
      currency: 'CAD',
      sleeveId: 'income',
    },
    {
      symbol: 'DFIV',
      totalValue: '2526',
      currency: 'USD',
      sleeveId: 'growth-USD',
    },
    {
      symbol: 'LULU',
      totalValue: '12521.4',
      currency: 'USD',
      sleeveId: 'stocks',
    },
    {
      symbol: 'KHC',
      totalValue: '4799.05',
      currency: 'USD',
      sleeveId: 'stocks',
    },
    {
      symbol: 'ARM',
      totalValue: '4320.4',
      currency: 'USD',
      sleeveId: 'stocks',
    },
    {
      symbol: 'NVTS',
      totalValue: '0.01',
      currency: 'USD',
      sleeveId: 'stocks',
    },
  ] as (Holding & { sleeveId: SleeveId })[]

  // as per above fixture data, `totalValue` should be 174775
  // But this is wrong bcause there's no currency conversion check
  let totalValue = 0
  for (const position of positions) {
    totalValue += +position.totalValue
    if ((position as Holding).currency)
  }
  console.assert(totalValue === 174775)

  const out: Account = {
    type: accountLabel,
    totalValue,
    sleeves: [
      {
        sleeveId: 'core',
        holdings: positions.filter((p) =>
          p.sleeveId === 'core'
        ),
      },
      {
        sleeveId: 'core-USD',
        holdings: positions.filter((p) =>
          p.sleeveId === 'core-USD'
        ),
      },
      {
        sleeveId: 'bullion',
        holdings: positions.filter((p) =>
          p.sleeveId === 'bullion'
        ),
      },
      {
        sleeveId: 'bullion-USD',
        holdings: positions.filter((p) =>
          p.sleeveId === 'bullion-USD'
        ),
      },
      {
        sleeveId: 'income',
        holdings: positions.filter((p) =>
          p.sleeveId === 'income'
        ),
      },
      {
        sleeveId: 'growth-USD',
        holdings: positions.filter((p) =>
          p.sleeveId === 'growth-USD'
        ),
      },
      {
        sleeveId: 'stocks',
        holdings: positions.filter((p) =>
          p.sleeveId === 'stocks'
        ),
      },
    ],
    unallocated,
  } as unknown as Account

  return out
}

export const FIXTURE_HOLDINGS_ALICE_RRSP = (): Account => {
  const accountLabel = 'RRSP'

  const unallocated = {
    CAD: 126487,
    USD: 14,
  }

  /**
   * @TODO The sleeveId should not be here, some other mapper should do what's hardcoded here.
   */
  const positions =
    [] as readonly (Holding & { sleeveId: string })[]

  // as per above fixture data, `totalValue` should be 469471
  let totalValue = 0
  for (const position of positions) {
    totalValue += +position.totalValue
  }
  console.assert(totalValue === 174775)

  // totalValue: 469471,

  const out: Account = {
    type: accountLabel,
    totalValue,
    sleeves: [
      {
        sleeveId: 'core',
        holdings: [
          {
            symbol: 'ZEA',
            totalValue: '14300.56',
            currency: 'CAD',
          },
          {
            symbol: 'ZCN',
            totalValue: '11669.05',
            currency: 'CAD',
          },
          {
            symbol: 'STPL',
            totalValue: '11664.13',
            currency: 'CAD',
          },
          {
            symbol: 'VUN',
            totalValue: '11610.84',
            currency: 'CAD',
          },
          {
            symbol: 'ZEM',
            totalValue: '9832.75',
            currency: 'CAD',
          },
          {
            symbol: 'ZDM',
            totalValue: '8062.35',
            currency: 'CAD',
          },
          {
            symbol: 'ZJPN',
            totalValue: '2745',
            currency: 'CAD',
          },
          {
            symbol: 'VA',
            totalValue: '2724.83',
            currency: 'CAD',
          },
          {
            symbol: 'XCH',
            totalValue: '2680.57',
            currency: 'CAD',
          },
          {
            symbol: 'AVDV',
            totalValue: '156.13',
            currency: 'USD',
          },
        ],
      },
      {
        sleeveId: 'bullion',
        holdings: [
          {
            symbol: 'PHYS',
            totalValue: '107741.45',
            currency: 'CAD',
          },
          {
            symbol: 'PSLV',
            totalValue: '67813',
            currency: 'CAD',
          },
          {
            symbol: 'GPH',
            totalValue: '4080',
            currency: 'CAD',
          },
        ],
      },
      {
        sleeveId: 'bonds',
        holdings: [{
          symbol: 'ZGB',
          totalValue: '22830',
          currency: 'CAD',
        }],
      },
      {
        sleeveId: 'stocks',
        holdings: [
          {
            symbol: 'AMD',
            totalValue: '12189.04',
            currency: 'CAD',
          },
          {
            symbol: 'IBM',
            totalValue: '0.28',
            currency: 'USD',
          },
        ],
      },
    ],
    unallocated,
  } as unknown as Account

  return out
}

/*
export const FIXTURE_HOLDINGS_ALICE_CRYPTO = (): Account => {
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
*/
