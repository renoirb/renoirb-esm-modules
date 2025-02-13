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

console.log(`Need to rework this script to work for both Deno and Browser, you have to do it yourself until it’s fixed.`)
Deno.exit(1)

// Usage:
for (const pkg of packages) {
  try {
    await generateBarrels(`./packages/${pkg}`, {
      runtimes: ['browser', 'core'],
      extensions: ['.mjs', '.ts'],
    })
    console.log(`✓ Successfully processed ${pkg}`)
  } catch (error) {
    console.error(`✗ Failed to process ${pkg}:`, (<Error> error).message)
  }
}
