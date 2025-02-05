import {
  basename,
  dirname,
  join,
  resolve,
} from 'https://deno.land/std/path/mod.ts'

type FormatOptions = {
  prefix: string
  mode: 'all' | 'staged' | 'modified' | 'diff'
}

const DEFAULT_OPTIONS: FormatOptions = {
  prefix: '.',
  mode: 'all',
}

async function getLanguageFromPath(path: string): Promise<string> {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  const langMap: Record<string, string> = {
    ts: 'ts',
    js: 'js',
    mjs: 'js',
    py: 'python',
    rs: 'rust',
    cs: 'cs',
    css: 'css',
    html: 'html',
    md: 'md',
    json: 'json',
    sh: 'sh',
    yaml: 'yaml',
    yml: 'yaml',
  }
  return langMap[ext] ?? 'txt'
}

async function isGitRepo(path: string): Promise<boolean> {
  try {
    const process = new Deno.Command('git', {
      args: ['rev-parse', '--is-inside-work-tree'],
      cwd: path,
    })
    const { success } = await process.output()
    return success
  } catch {
    return false
  }
}

async function getGitFiles(
  mode: FormatOptions['mode'],
  cwd: string,
): Promise<string[]> {
  const gitArgs = {
    staged: ['diff', '--staged', '--name-only'],
    modified: ['ls-files', '--modified'],
    diff: ['diff', '--name-only'],
    all: ['ls-files'],
  }

  const process = new Deno.Command('git', {
    args: gitArgs[mode],
    cwd,
  })
  const { stdout } = await process.output()
  const output = new TextDecoder().decode(stdout)
  return output.split('\n').filter(Boolean)
}

async function formatFile(path: string): Promise<string> {
  const content = await Deno.readTextFile(path)
  const lang = await getLanguageFromPath(path)
  const cwdPrefix = Deno.cwd()
  const strippedPath = path.replace(cwdPrefix + '/', '')
  return `**File: ${strippedPath}**\n\`\`\`${lang}[File: ${strippedPath}]\n${content}\n\`\`\`\n`
}

async function main(options: Partial<FormatOptions> = {}): Promise<string> {
  const opts: FormatOptions = { ...DEFAULT_OPTIONS, ...options }
  const absPath = resolve(opts.prefix)

  if (!(await isGitRepo(absPath))) {
    throw new Error('Not a git repository')
  }

  const files = await getGitFiles(opts.mode, absPath)
  const output: string[] = []

  for (const file of files) {
    const fullPath = join(absPath, file)
    try {
      const formatted = await formatFile(fullPath)
      output.push(formatted)
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }

  return output.join('\n')
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args
  const options: Partial<FormatOptions> = {}

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--prefix':
        options.prefix = args[++i]
        break
      case '--mode':
        options.mode = args[++i] as FormatOptions['mode']
        break
    }
  }

  try {
    const output = await main(options)
    console.log(output)
  } catch (error) {
    console.error('Error:', error.message)
    Deno.exit(1)
  }
}

export default main
