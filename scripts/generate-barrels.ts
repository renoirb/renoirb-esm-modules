import { generateBarrels } from '@renoirb/workbench-maintenance-utils/deno.ts'

export const packages = [
  /*                    */
  'app-layout-element',
  'component-showcase-element',
  'context-api',
  'element-utils',
  'http-utils',
  'inline-note-element',
  'jsonresume-element',
  'jsonresume-utils',
  'notice-box-element',
  'value-date-element',
  'workbench-maintenance-utils',
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
