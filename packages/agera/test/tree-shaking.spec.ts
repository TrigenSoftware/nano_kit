import {
  rm,
  writeFile,
  mkdir
} from 'node:fs/promises'
import {
  join,
  resolve
} from 'node:path'
import {
  beforeAll,
  describe,
  expect,
  it
} from 'vitest'
import { build as build7 } from 'vite-7'
import { build as build8 } from 'vite'

const root = resolve(import.meta.dirname, '..')
const entry = resolve(root, 'src/index.ts')
const outDir = resolve(root, 'test/build')

async function bundle(
  name: string,
  imports: string,
  build: (options: {
    input: string
    outDir: string
    name: string
  }) => Promise<any>
) {
  const input = join(outDir, `${name}.js`)
  const source = `import ${imports} from ${JSON.stringify(entry)}\n\nconsole.log(${imports})`

  await mkdir(outDir, {
    recursive: true
  })
  await writeFile(input, source)

  const result: any = await build({
    input,
    outDir,
    name
  })
  const output = Array.isArray(result)
    ? result.flatMap(item => item.output)
    : result.output
  const chunk = output.find((item: any) => item.type === 'chunk')

  return chunk.code
}

function vite7(name: string, imports: string) {
  return bundle(name, imports, async ({ input, outDir, name }) => build7({
    configFile: false,
    logLevel: 'silent',
    build: {
      target: 'esnext',
      minify: false,
      emptyOutDir: false,
      outDir,
      rollupOptions: {
        input,
        output: {
          entryFileNames: `${name}.vite7.js`
        }
      }
    }
  }))
}

async function vite8(name: string, imports: string) {
  return bundle(name, imports, async ({ input, outDir, name }) => build8({
    configFile: false,
    logLevel: 'silent',
    build: {
      target: 'esnext',
      minify: false,
      emptyOutDir: false,
      outDir,
      rolldownOptions: {
        input,
        output: {
          entryFileNames: `${name}.vite8.js`
        }
      }
    }
  }))
}

describe('agera', () => {
  describe('tree-shaking', () => {
    beforeAll(async () => {
      await rm(outDir, {
        force: true,
        recursive: true
      })
    })

    describe('Vite 7', () => {
      it('should remove mountable effect count helpers when mountable is not imported', async () => {
        const signal = await vite7('signal', '{ signal }')
        const mountableSignal = await vite7('mountable-signal', '{ mountable, signal }')

        expect(mountableSignal).toContain('pushNoMount')
        expect(mountableSignal).toContain('popNoMount')
        expect(mountableSignal).toContain('incrementEffectCount')
        expect(mountableSignal).toContain('decrementEffectCount')

        expect(signal).not.toContain('pushNoMount')
        expect(signal).not.toContain('popNoMount')
        expect(signal).not.toContain('incrementEffectCount')
        expect(signal).not.toContain('decrementEffectCount')
      })
    })

    // https://github.com/rolldown/rolldown/issues/9272
    // https://github.com/rolldown/rolldown/issues/9279
    describe('Vite 8 [fails]', () => {
      it.fails('should remove mountable effect count helpers when mountable is not imported', async () => {
        const signal = await vite8('signal', '{ signal }')
        const mountableSignal = await vite8('mountable-signal', '{ mountable, signal }')

        expect(mountableSignal).toContain('pushNoMount')
        expect(mountableSignal).toContain('popNoMount')
        expect(mountableSignal).toContain('incrementEffectCount')
        expect(mountableSignal).toContain('decrementEffectCount')

        expect(signal).not.toContain('pushNoMount')
        expect(signal).not.toContain('popNoMount')
        expect(signal).not.toContain('incrementEffectCount')
        expect(signal).not.toContain('decrementEffectCount')
      })
    })
  })
})
