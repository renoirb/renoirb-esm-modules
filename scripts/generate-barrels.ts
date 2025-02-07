import { generateBarrels } from 'https://renoirb.com/esm-modules/monorepo-maintenance-utils/generate-barrels.ts'

export const packages = [
  /*                    */
  'component-showcase-element',
  'context-api',
  'element-utils',
  'inline-note-element',
  'monorepo-maintenance-utils',
  'notice-box-element',
  'value-date-element',
]

// Usage:
for (const pkg of packages) {
  try {
    await generateBarrels(`./packages/${pkg}`, {
      runtimes: ['browser', 'core'],
      extensions: ['.mjs', '.ts'],
    })
    console.log(`✓ Successfully processed ${pkg}`)
  } catch (error) {
    console.error(`✗ Failed to process ${pkg}:`, error.message)
  }
}
