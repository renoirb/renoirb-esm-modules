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
 * ```ts
 * import { SleeveCalculator } from './calculator.ts'
 * import { EXAMPLE_SLEEVES_CONFIG } from './sleeves.examples.ts'
 * const calculator = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG)
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
     * =======================  **WARNING:  This is NOT financial advice** =======================
     * This is just an example configuration so I can re-balance my own portfolio, less manually.
     * But if you like want to know where I've learned about this portoflio allocation;
     * Lookup Ben Felix <https://pwlcapital.com/our-team/benjamin-felix/> from PWL Capital's YouTube channel.
     * Particularly his videos on the work from Portfolio theory by Fama-French named "Five Factor" investing.
     */
    core: {
      /**
       */
      weights: {
        AVDV:  6, // Avantis® International Small Cap Value ETF (USD)
        AVUV: 10, // Avantis® U.S. Small Cap Value ETF (USD)
        VUN:  30, // Vanguard US Total Market ETF (CAD-hedged)
        XIC:  30, // Core S&P/TSX Capped Composite ETF (Canadian)
        XEF:  16, // Core MSCI EAFE IMI ETF (International Developed)
        XEC:   8, // Core MSCI EM IMI (Developed Markets)
      },
      usd_symbols: [
        // Only these 2 require USD→CAD conversion
        'AVDV',
        'AVUV',
      ],
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
 * import { EXAMPLE_SLEEVES_CONFIG } from './sleeves.examples.ts'
 * import { SleeveCalculator } from './calculator.ts'
 * const calculator = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG)
 * const calcResult = calculator.calculate('core', 10000, 1.35)
 * // AVDV (10%): CAD $1,000 / 1.35 = USD $740.74
 * // AVUV (6%): CAD $600 / 1.35 = USD $444.44
 * // VUN (13%): CAD $1,300 (stays in CAD)
 * ```
 *
 * **Example 2: USD-only sleeve**
 * ```typescript ignore
 * // ... using the same calculator instance as above
 * const calcResult = calculator.calculate('core-USD', 10000, 1.35);
 * // All allocations in USD, no conversion needed
 * // VTI (13%): USD $1,300
 * ```
 *
 * **Example 3: CAD-only sleeve**
 * ```typescript ignore
 * // ... using the same calculator instance as above
 * const calcResult = calculator.calculate('bullion', 5000, 1.35);
 * // PHYS (60%): CAD $3,000
 * // PSLV (40%): CAD $2,000
 * // Exchange rate unused
 * ```
 */
