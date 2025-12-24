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
     * **Five Factor Investing with ETFs Portfolio**
     *
     * Source: Benjamin Felix, Portfolio Manager at PWL Capital
     * - PWL Capital: https://pwlcapital.com/our-team/benjamin-felix/
     * - Rational Reminder Podcast Episode 129 (December 17, 2020)
     *   https://rationalreminder.ca/podcast/129
     *
     * Implements the Fama-French Five-Factor Model using ETFs.
     *
     * **DISCLAIMER:** This is example data for software demonstration only.
     * Not financial advice. Consult qualified financial professionals for investment decisions.
     */
    core: {
      /**
       */
      weights: {
        AVDV:  6, // Avantis® International Small Cap Value ETF (USD)
        AVUV: 10, // Avantis® U.S. Small Cap Value ETF (USD)
        VUN:  30, // Vanguard US Total Market ETF (CAD-hedged)
        XEC:   8, // Core MSCI EM IMI (Emerging Markets)
        XEF:  16, // Core MSCI EAFE IMI ETF (International Developed)
        XIC:  30, // Core S&P/TSX Capped Composite ETF (Canadian)
      },
      usd_symbols: [
        // Only these 2 require USD→CAD conversion
        'AVDV',
        'AVUV',
      ],
    },

    /**
     * Precious metals sleeve for CAD-denominated account
     *
     * **Sprott Physical Bullion Trusts**
     *
     * Source: Sprott Asset Management
     * - Physical Bullion Funds: https://sprott.com/investment-strategies/exchange-listed-products/physical-bullion-funds/
     *
     * These closed-end funds provide exposure to physical precious metals:
     * - Fully allocated and unencumbered metals held at Royal Canadian Mint
     * - Redeemable for physical metal (subject to minimum thresholds)
     * - Traded on NYSE Arca and TSX exchanges
     *
     * **Allocation Strategy:**
     * - Physical gold (PHYS): 60%
     * - Physical silver (PSLV): 40%
     *
     * **Currency Mix:**
     * - All CAD-traded (no currency conversion required)
     *
     * **DISCLAIMER:** This is example data for software demonstration only.
     * Not financial advice. Consult qualified financial professionals for investment decisions.
     */
    bullion: {
      weights: {
        PHYS: 60, // Sprott Physical Gold Trust - https://sprott.com/investment-strategies/physical-bullion-trusts/gold/
        PSLV: 40, // Sprott Physical Silver Trust - https://sprott.com/investment-strategies/exchange-listed-products/physical-bullion-funds/silver/
      },
      usd_symbols: [
        // No USD securities in this sleeve
      ],
    },
  },
}

/**
 * Five Factor Portfolio configuration (core sleeve only)
 *
 * Convenience export containing ONLY the Ben Felix Five Factor Portfolio.
 * Useful for examples and testing focused specifically on this portfolio.
 *
 * Source: Benjamin Felix, Rational Reminder Podcast Episode 129
 * URL: https://rationalreminder.ca/podcast/129
 */
export const SLEEVES_FIVE_FACTOR: SleevesConfig = {
  sleeves: {
    core: EXAMPLE_SLEEVES_CONFIG.sleeves.core,
  },
}
