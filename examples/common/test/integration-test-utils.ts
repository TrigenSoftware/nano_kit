/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  type ChildProcess,
  spawn
} from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  writeFile
} from 'node:fs/promises'
import {
  dirname,
  join,
  relative,
  resolve
} from 'node:path'
import {
  beforeEach,
  afterEach,
  afterAll,
  beforeAll
} from 'vitest'
import type {
  Page,
  Route
} from 'playwright'

type IntegrationTestCacheData = Record<string, true>
type ProcessEnv = Record<string, string | undefined>

interface NetworkCacheEntry {
  status: number
  headers: Record<string, string>
  body: string
}

const URL_PATTERN = /https?:\/\/[^\s]+/
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1B\[[0-?]*[ -/]*[@-~]/g
const CLOSED_TARGET_PATTERN = /target page, context or browser has been closed/i
const networkMemoryCache = new Map<string, NetworkCacheEntry>()
const children = new Set<ChildProcess>()

function closeChild(child: ChildProcess) {
  children.delete(child)
}

function trackChild(child: ChildProcess) {
  children.add(child)
  child.once('exit', () => closeChild(child))
  child.once('error', () => closeChild(child))

  return child
}

function stopChildren() {
  for (const child of children) {
    stopProcess(child)
  }
}

function forwardSignal(signal: NodeJS.Signals) {
  stopChildren()
  process.kill(process.pid, signal)
}

process.once('exit', stopChildren)
process.once('SIGINT', forwardSignal)
process.once('SIGTERM', forwardSignal)

function runScript(
  cwd: string,
  script: string,
  env: ProcessEnv = {}
): Promise<void> {
  const child = trackChild(spawn('pnpm', ['run', script], {
    cwd,
    detached: true,
    env: {
      ...process.env,
      ...env
    },
    stdio: [
      'ignore',
      'ignore',
      'pipe'
    ]
  }))

  return new Promise((resolve, reject) => {
    const errors: Buffer[] = []

    child.stderr?.on('data', chunk => errors.push(chunk))
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
      } else {
        const details = Buffer.concat(errors).toString().trim()

        reject(new Error(
          [
            signal
              ? `pnpm run ${script} exited with signal ${signal}`
              : `pnpm run ${script} exited with code ${code}`,
            details
          ].filter(Boolean).join('\n\n')
        ))
      }
    })
  })
}

function stopProcess(child: ChildProcess) {
  if (child.pid && !child.killed) {
    try {
      process.kill(-child.pid)
    } catch {
      child.kill()
    }
  }

  closeChild(child)
}

export async function build(
  cwd: string,
  env: ProcessEnv = {},
  script = 'build:only',
  dist = 'dist'
): Promise<string> {
  await runScript(cwd, script, {
    NODE_ENV: 'production',
    ...env
  })

  return await hashDirFast(join(cwd, dist))
}

export async function serve(
  cwd: string,
  env: ProcessEnv = {},
  script = 'preview'
): Promise<[url: string, close: () => void]> {
  const url = Promise.withResolvers<string>()
  const server = trackChild(spawn('pnpm', ['run', script], {
    cwd,
    detached: true,
    env: {
      ...process.env,
      TEST: '',
      ...env
    },
    stdio: [
      'ignore',
      'pipe',
      'pipe'
    ]
  }))
  const errors: Buffer[] = []
  const close = () => stopProcess(server)

  server.stdout?.on('data', (chunk: Buffer) => {
    const output = chunk.toString().replace(ANSI_PATTERN, '')
    const match = output.match(URL_PATTERN)

    if (match) {
      url.resolve(match[0])
    }
  })
  server.stderr?.on('data', chunk => errors.push(chunk))
  server.once('error', url.reject)
  server.once('exit', (code, signal) => {
    const details = Buffer.concat(errors).toString().trim()

    url.reject(new Error(
      [
        signal
          ? `pnpm run ${script} exited with signal ${signal}`
          : `pnpm run ${script} exited with code ${code}`,
        details
      ].filter(Boolean).join('\n\n')
    ))
  })

  return [await url.promise, close]
}

export async function useNetworkMemoryCache(
  page: Page,
  resources: (string | RegExp)[]
) {
  const ignoreIfClosed = (error: unknown) => {
    if (
      page.isClosed()
      || (
        error instanceof Error
        && CLOSED_TARGET_PATTERN.test(error.message)
      )
    ) {
      return
    }

    throw error
  }
  const disposable = await page.route('**/*', async (route: Route) => {
    try {
      const request = route.request()
      const url = request.url()

      if (
        !resources.some(
          resource => (
            typeof resource === 'string'
              ? url.startsWith(resource)
              : resource.test(url)
          )
        )
      ) {
        await route.fallback()
        return
      }

      const cached = networkMemoryCache.get(url)

      if (cached) {
        await route.fulfill(cached)
        return
      }

      const response = await route.fetch()
      const entry = {
        status: response.status(),
        headers: response.headers(),
        body: await response.text()
      }

      networkMemoryCache.set(url, entry)
      await route.fulfill(entry)
    } catch (error) {
      ignoreIfClosed(error)
    }
  })

  return async () => {
    await disposable.dispose()

    if (!page.isClosed()) {
      await page.unrouteAll({
        behavior: 'ignoreErrors'
      })
    }
  }
}

async function lsFiles(
  dir: string,
  ignore?: RegExp,
  root = resolve(dir)
): Promise<string[]> {
  const entries = await readdir(dir, {
    withFileTypes: true
  })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name)
      const relativePath = relative(root, path)

      if (ignore?.test(relativePath)) {
        return []
      }

      if (entry.isDirectory()) {
        return await lsFiles(path, ignore, root)
      }

      return entry.isFile()
        ? [path]
        : []
    })
  )

  return files.flat()
}

export async function hashDirFast(
  dir: string,
  ignore?: RegExp
): Promise<string> {
  const root = resolve(dir)
  const files = (await lsFiles(root, ignore, root)).sort()
  const hash = createHash('sha256')

  for (const file of files) {
    hash.update(relative(root, file))
    hash.update('\0')
  }

  return hash.digest('hex')
}

export async function hashDir(
  dir: string,
  ignore?: RegExp
): Promise<string> {
  const root = resolve(dir)
  const files = (await lsFiles(root, ignore, root)).sort()
  const hash = createHash('sha256')

  for (const file of files) {
    hash.update(relative(root, file))
    hash.update('\0')
    hash.update(await readFile(file))
    hash.update('\0')
  }

  return hash.digest('hex')
}

export async function lsImplementations(dir: string): Promise<{
  path: string
  name: string
}[]> {
  const entries = await readdir(dir, {
    withFileTypes: true
  })

  return entries
    .filter(entry => entry.isDirectory() && entry.name !== 'common')
    .map((entry) => {
      const name = entry.name

      return {
        path: resolve(dir, name),
        name
      }
    })
}

export class IntegrationTestCache {
  #file: string
  #data: IntegrationTestCacheData | undefined

  constructor(dir: string) {
    this.#file = join(dir, 'integration-test-cache.json')
  }

  async #load() {
    if (this.#data) {
      return this.#data
    }

    try {
      this.#data = JSON.parse(await readFile(this.#file, 'utf8')) as IntegrationTestCacheData
    } catch (error) {
      if (
        error
        && typeof error === 'object'
        && 'code' in error
        && error.code === 'ENOENT'
      ) {
        this.#data = {}
        await this.#write()
      } else {
        throw error
      }
    }

    return this.#data
  }

  async #write() {
    await mkdir(dirname(this.#file), {
      recursive: true
    })
    await writeFile(this.#file, `${JSON.stringify(this.#data ?? {}, null, 2)}\n`)
  }

  async cached(hash: string | false | null | undefined): Promise<boolean> {
    if (!hash) {
      return false
    }

    const data = await this.#load()

    return data[hash] === true
  }

  async save(hash: string | false | null | undefined): Promise<void> {
    if (!hash) {
      return
    }

    this.#data ??= {}
    this.#data[hash] = true
    await this.#write()
  }
}

// eslint-disable-next-line consistent-this
export async function implementations({
  self,
  root
}: {
  self: string
  root: string
}): Promise<{
  name: string
  start(
    env?: ProcessEnv,
    distDir?: (path: string) => string
  ): Promise<string | false>
}[]> {
  const utilsHash = hashDir(import.meta.dirname)
  const testsHash = hashDir(self, /integration-test-cache\.json$/)
  const cache = new IntegrationTestCache(self)
  let implementations = await lsImplementations(root)

  if (process.env.ONLY) {
    implementations = implementations.filter(({ name }) => name === process.env.ONLY)
  }

  const start = (
    path: string,
    env?: ProcessEnv,
    distDir: (path: string) => string = () => 'dist'
  ) => {
    const urlResolver = Promise.withResolvers<string | false>()
    let cached: boolean
    let hash: string | false
    let url: string
    let passed = true
    let stop: () => void

    beforeAll(async () => {
      hash = process.env.BUILD !== 'false' && `${await build(path, env, 'build:only', distDir(path))}_${await utilsHash}_${await testsHash}`
      cached = await cache.cached(hash)

      if (!cached) {
        [url, stop] = await serve(path, env)
        urlResolver.resolve(url)
      } else {
        urlResolver.resolve(false)
      }
    }, 60_000)

    beforeEach((ctx) => {
      if ('skip' in ctx && cached && hash) {
        ctx.skip(`cached build with hash ${hash.slice(0, 8)} - skipping tests`)
      }
    })

    afterEach(({ task }) => {
      if (task.result?.state === 'fail') {
        passed = false
      }
    })

    afterAll(async () => {
      stop?.()

      if (passed && !cached) {
        await cache.save(hash)
      }
    })

    return urlResolver.promise
  }

  return implementations.map(({ path, name }) => ({
    name,
    start: (
      env?: ProcessEnv,
      distDir?: (path: string) => string
    ) => start(path, env, distDir)
  }))
}
