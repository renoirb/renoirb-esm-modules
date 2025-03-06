const RUNTIMES = ['browser', 'core', 'cloudflare', 'node', 'deno'] as const

type Runtime = (typeof RUNTIMES)[number]

interface BarrelConfig {
  runtimes: Runtime[]
  extensions: string[]
}

const ELEMENT_SUFFIX = '-element' as const

const TOP_OF_FILE = `//
// This file is automatically generated
//` as const

async function validateElementPackage(packagePath: string): Promise<boolean> {
  const pkgName = packagePath.split('/').pop()!

  // Validate package naming
  if (!pkgName.endsWith(ELEMENT_SUFFIX)) {
    console.error(`Package "${pkgName}" must end with "${ELEMENT_SUFFIX}"`)
    return false
  }

  // Validate browser/element.mjs exists
  const elementPath = `${packagePath}/src/browser/element.mjs`
  try {
    const stat = await Deno.stat(elementPath)
    if (!stat.isFile) {
      const message = `${elementPath} must be a file`
      throw new Error(message)
    }
  } catch {
    const message = `Element file not found: ${elementPath}`
    throw new Error(message)
  }

  return true
}

export async function generateBarrels(
  packagePath: string,
  config: BarrelConfig,
) {
  const pkgName = packagePath.split('/').pop()!
  console.log(`\nProcessing ${pkgName}...`)

  // If it's an element (ends with -element), validate its structure
  if (pkgName.endsWith(ELEMENT_SUFFIX)) {
    if (!(await validateElementPackage(packagePath))) {
      throw new Error(`Invalid element package: ${pkgName}`)
    }
  }

  // Main entry points for each runtime
  for (const runtime of config.runtimes) {
    const runtimePath = `${packagePath}/src/${runtime}`

    try {
      await Deno.stat(runtimePath)
    } catch {
      console.log(`Creating directory: ${runtimePath}`)
      await Deno.mkdir(runtimePath, { recursive: true })
    }

    const barrel = TOP_OF_FILE + `\nexport * from './src/${runtime}/index.mjs'`
    const filePath = `${packagePath}/${runtime}.mjs`
    console.log(`Writing ${filePath}`)
    await Deno.writeTextFile(filePath, barrel)
  }

  // Source index
  const sourceExports = config.runtimes
    .map((runtime) => `export * from './${runtime}/index.mjs'`)
    .join('\n')
  await Deno.writeTextFile(
    `${packagePath}/src/index.mjs`,
    TOP_OF_FILE + `\n// Index\n` + sourceExports + '\n',
  )

  // Runtime-specific barrels
  for (const runtime of config.runtimes) {
    const files = await Deno.readDir(`${packagePath}/src/${runtime}`)
    const exports = [TOP_OF_FILE]

    for await (const file of files) {
      if (file.isFile && !file.name.startsWith('index.')) {
        const extension = file.name.split('.').pop()
        const basename = file.name.slice(0, -(extension?.length ?? 0) - 1)
        let message = `Found "${basename}" "${extension}"`
        if (!/\.test$/.test(basename)) {
          exports.push(`export * from './${basename}.${extension}'`)
          message += ' and not a test file'
        } else if (/-element$/.test(basename)) {
          exports.push(`export { default } from './${basename}.${extension}'`)
          message += ' is a component'
        }
        console.log(message)
      }
    }

    if (exports.length <= 1) {
      console.log(`No exports found for ${runtime}`)
      continue
    }

    await Deno.writeTextFile(
      `${packagePath}/src/${runtime}/index.mjs`,
      exports.join('\n') + '\n',
    )
  }
}
