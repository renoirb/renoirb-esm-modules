import {
  //
  type SleevesConfig,
} from './types.ts'

/**
 * Example Sleeves Configuration for Testing and Documentation
 *
 * This file provides realistic sleeve configurations that demonstrate:
 * - How to structure sleeves data for the SleeveCalculator
 * - Multi-currency portfolio management (CAD/USD)
 * - Different asset allocation strategies
 * - Edge cases and validation scenarios
 *
 * @example **Usage in tests:**
 * ```typescript
 * import { EXAMPLE_SLEEVES_CONFIG } from './sleeves.examples.ts';
 * const calculator = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG);
 * ```
 *
 * @remark
 * **Note:** This module should NOT be included in production builds.
 * It exists solely for testing and documentation purposes.
 */

/**
 * Example sleeves configuration mimicking a real-world `sleeves.yaml` file.
 *
 * **Structure:**
 * - Each sleeve represents a distinct investment strategy or account type
 * - Weights are percentage allocations (must sum to ~100 per sleeve)
 * - usd_symbols identifies which securities trade in USD (others assumed CAD)
 *
 * **Sleeves Included:**
 * 1. **core** - Primary equity allocation in CAD account
 *    - Mix of Canadian, US, and International equities
 *    - Contains 2 USD-traded securities (AVDV, AVUV) requiring conversion
 *    - Diversified across regions and market caps
 *
 * 2. **core-USD** - Primary equity allocation in USD account
 *    - All securities trade in USD (no currency conversion needed)
 *    - Similar diversification strategy to 'core' but USD-native
 *    - Demonstrates 100% USD allocation pattern
 *
 * 3. **bullion** - Precious metals allocation
 *    - All CAD-traded (no usd_symbols array)
 *    - Simpler structure with only 2 holdings
 *    - Demonstrates CAD-only sleeve pattern
 *
 * **Business Rules Demonstrated:**
 * - Weight percentages should sum to 100 (±0.1% tolerance acceptable)
 * - usd_symbols array can be empty, partial, or complete
 * - Symbol names should match keys in the weights object
 * - Missing usd_symbols means all securities trade in CAD
 */
export const EXAMPLE_SLEEVES_CONFIG: SleevesConfig = {
  sleeves: {
    /**
     * Core equity sleeve for CAD-denominated account
     *
     * **Allocation Strategy:**
     * - Canadian equities (ZCN): 13%
     * - US equities (VUN, AVUV): 19% total
     * - International developed (AVDV, ZEA, ZDM, ZJPN, VA): 41% total
     * - Emerging markets (ZEM): 11%
     * - Real assets (STPL, XCH): 16% total
     *
     * **Currency Mix:**
     * - USD-traded: AVDV (10%), AVUV (6%) = 16% requires conversion
     * - CAD-traded: All others = 84%
     *
     * **Total Weight:** 100% (13+6+13+13+16+9+11+13+3+3+3)
     */
    core: {
      weights: {
        AVDV: 10, // Avantis International Small Cap Value (USD)
        AVUV: 6, // Avantis US Small Cap Value (USD)
        VUN: 13, // Vanguard US Total Market (CAD-hedged)
        ZCN: 13, // BMO S&P/TSX Capped Composite (Canadian)
        ZEA: 16, // BMO MSCI EAFE (International Developed)
        ZDM: 9, // BMO International Dividend (Developed Markets)
        ZEM: 11, // BMO MSCI Emerging Markets (Emerging)
        STPL: 13, // Spider Global Natural Resources (Real Assets)
        ZJPN: 3, // BMO MSCI Japan (Regional)
        VA: 3, // Vanguard FTSE Developed All Cap ex US (International)
        XCH: 3, // iShares China Index (Regional)
      },
      usd_symbols: ['AVDV', 'AVUV'], // Only these 2 require USD→CAD conversion
    },

    /**
     * Core equity sleeve for USD-denominated account
     *
     * **Allocation Strategy:**
     * - US equities (VTI, DFSV, DISV, VTV): 32% total
     * - International developed (DFAX, VEA, EWJ): 43% total
     * - Emerging markets (VWO): 9%
     * - Real assets (KXI, DRAG): 16% total
     *
     * **Currency Mix:**
     * - All securities trade in USD (100%)
     * - No currency conversion required
     *
     * **Total Weight:** 100% (10+6+13+30+10+9+13+3+3+3)
     *
     * **Note:** This demonstrates a sleeve where usd_symbols contains ALL symbols,
     * meaning the calculator should handle 100% USD allocation correctly.
     */
    'core-USD': {
      weights: {
        DISV: 10, // Dimensional International Small Cap Value
        DFSV: 6, // Dimensional US Small Cap Value
        VTI: 13, // Vanguard Total Stock Market
        DFAX: 30, // Dimensional World ex US Core Equity
        VEA: 10, // Vanguard FTSE Developed Markets
        VWO: 9, // Vanguard FTSE Emerging Markets
        KXI: 13, // iShares Global Consumer Staples
        EWJ: 3, // iShares MSCI Japan
        DRAG: 3, // Dracaris Resources (Real Assets)
        VTV: 3, // Vanguard Value
      },
      usd_symbols: [
        'VTI',
        'VEA',
        'VWO',
        'DFSV',
        'DISV',
        'KXI',
        'EWJ',
        'VTV',
        'DFAX',
        'DRAG',
      ], // All symbols trade in USD
    },

    /**
     * Precious metals sleeve for CAD-denominated account
     *
     * **Allocation Strategy:**
     * - Physical gold (PHYS): 60%
     * - Physical silver (PSLV): 40%
     *
     * **Currency Mix:**
     * - All CAD-traded (no usd_symbols array = all CAD)
     * - No currency conversion required
     *
     * **Total Weight:** 100% (60+40)
     *
     * **Note:** This demonstrates the simplest sleeve pattern:
     * - Only 2 holdings
     * - All CAD-denominated
     * - Missing usd_symbols field (interpreted as empty array)
     */
    bullion: {
      weights: {
        PHYS: 60, // Sprott Physical Gold Trust
        PSLV: 40, // Sprott Physical Silver Trust
      },
      // No usd_symbols field - all securities assumed CAD
    },
  },
}

/**
 * Expected behavior examples for testing:
 *
 * **Example 1: CAD sleeve with USD securities**
 * ```typescript
 * const calc = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG);
 * const result = calc.calculate('core', 10000, 1.35);
 * // AVDV (10%): CAD $1,000 / 1.35 = USD $740.74
 * // AVUV (6%): CAD $600 / 1.35 = USD $444.44
 * // VUN (13%): CAD $1,300 (stays in CAD)
 * ```
 *
 * **Example 2: USD-only sleeve**
 * ```typescript
 * const result = calc.calculate('core-USD', 10000, 1.35);
 * // All allocations in USD, no conversion needed
 * // VTI (13%): USD $1,300
 * ```
 *
 * **Example 3: CAD-only sleeve**
 * ```typescript
 * const result = calc.calculate('bullion', 5000, 1.35);
 * // PHYS (60%): CAD $3,000
 * // PSLV (40%): CAD $2,000
 * // Exchange rate unused
 * ```
 */
