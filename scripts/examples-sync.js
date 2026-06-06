/* oxlint-disable no-undef, no-console */
import {
  cp,
  readdir,
  rm,
  stat
} from 'node:fs/promises'
import {
  isAbsolute,
  join,
  resolve
} from 'node:path'

const [
  sourceArg,
  rootArg
] = process.argv.slice(2)

if (!sourceArg || !rootArg) {
  throw new Error('Usage: node scripts/examples-sync.js <source-example-dir> <target-root-dir>')
}

const cwd = process.cwd()
const sourceExampleDir = isAbsolute(sourceArg) ? sourceArg : resolve(cwd, sourceArg)
const rootDir = isAbsolute(rootArg) ? rootArg : resolve(cwd, rootArg)
const sourceDir = join(sourceExampleDir, 'src')
const sourceName = sourceExampleDir.split(/[\\/]/).at(-1)
const rootName = rootDir.split(/[\\/]/).at(-1)
const sharedDirs = [
  'common',
  'services'
]
const rootSharedDirs = [
  'api'
]

async function exists(path) {
  try {
    await stat(path)

    return true
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

async function replaceDir(source, target) {
  console.log(`  ${source} -> ${target}`)

  await rm(target, {
    force: true,
    recursive: true
  })
  await cp(source, target, {
    recursive: true
  })
}

async function syncExample(exampleName) {
  const exampleDir = join(rootDir, exampleName)
  const targetSrcDir = join(exampleDir, 'src')

  console.log(`Sync ${exampleName}`)

  for (const dir of rootSharedDirs) {
    const source = join(sourceExampleDir, dir)

    if (await exists(source)) {
      await replaceDir(
        source,
        join(exampleDir, dir)
      )
    }
  }

  for (const dir of sharedDirs) {
    const source = join(sourceDir, dir)

    if (await exists(source)) {
      await replaceDir(
        source,
        join(targetSrcDir, dir)
      )
    }
  }

  if (exampleName.includes('nano_kit')) {
    await replaceDir(
      join(sourceDir, exampleName.includes('ssr') || exampleName.includes('-di') ? 'stores-di' : 'stores'),
      join(targetSrcDir, 'stores')
    )
  } else if (exampleName.includes('nanostores')) {
    await replaceDir(
      join(sourceDir, 'nanostores'),
      join(targetSrcDir, 'stores')
    )
  }

  console.log(`Done ${exampleName}`)
}

const entries = await readdir(rootDir, {
  withFileTypes: true
})

for (const entry of entries) {
  if (entry.isDirectory() && entry.name !== sourceName) {
    await syncExample(entry.name)
  }
}

console.log(`${sourceName} synced in ${rootName}`)
