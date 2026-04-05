import path from 'node:path'
import {
  rm,
  readFile
} from 'node:fs/promises'
import {
  describe,
  it,
  expect,
  afterAll
} from 'vitest'
import { build } from 'vite'
import SsrPlugin from './index.js'

const testDir = path.join(import.meta.dirname, '..', '..', 'test')
const testAppDir = path.join(testDir, 'app')
const outDir = path.join(testAppDir, 'dist')
const adapter = {
  clientPath: 'virtual-client.js',
  rendererPath: 'virtual-renderer.js',
  loadClient: () => readFile(path.join(testAppDir, 'virtual-client.js'), 'utf-8'),
  loadRenderer: () => readFile(path.join(testAppDir, 'virtual-renderer.js'), 'utf-8')
}
const input = path.join(testAppDir, 'index.js')
const plugin = SsrPlugin({
  index: input
}, adapter)

describe('ssr', () => {
  describe('vite-plugin', () => {
    afterAll(async () => {
      await rm(outDir, {
        recursive: true,
        force: true
      })
    })

    it('should remove exported Stores$ and Cache$ functions from client bundle', async () => {
      const clientTransformPlugin = plugin.find(p => p.name === '@nano_kit/ssr/vite-plugin:transform:client')!
      const result: any = await build({
        root: testAppDir,
        logLevel: 'silent',
        build: {
          outDir,
          minify: false,
          rollupOptions: {
            input
          }
        },
        plugins: [clientTransformPlugin]
      })
      const output = result.output.filter((c: any) => c.facadeModuleId?.includes('ssr/test/app'))

      expect(output[0].code).not.toContain('Stores$')
      expect(output[0].code).not.toContain('Cache$')
      expect(output[1].code).not.toContain('Stores$')
      expect(output[1].code).not.toContain('Cache$')
      expect(output[2].code).not.toContain('Stores$')
      expect(output[2].code).not.toContain('Cache$')
    }, 30000)

    it('should attach chunk name to dynamic imports in server bundle', async () => {
      const plugins = plugin.filter(
        p => p.name === '@nano_kit/ssr/vite-plugin:transform:server' || p.name === '@nano_kit/ssr/vite-plugin:virtual'
      )
      const result: any = await build({
        root: testAppDir,
        logLevel: 'silent',
        build: {
          ssr: true,
          outDir,
          minify: false,
          rollupOptions: {
            input
          }
        },
        plugins
      })
      const chunk = result.output.find((c: any) => c.type === 'chunk' && c.isEntry)

      expect(chunk).toBeDefined()
      expect(chunk.code).toContain('__attachChunkname')
      expect(chunk.code).toContain('"home.js"')
      expect(chunk.code).toContain('"about.js"')
    })

    it('should work with index option', async () => {
      const clientResult: any = await build({
        root: testAppDir,
        logLevel: 'silent',
        plugins: plugin,
        build: {
          minify: false,
          ssr: false
        }
      })
      const rendererResult: any = await build({
        root: testAppDir,
        logLevel: 'silent',
        plugins: plugin,
        build: {
          minify: false,
          ssr: true
        }
      })
      const clientChunk = clientResult.output.find((c: any) => c.facadeModuleId === adapter.clientPath)

      expect(clientChunk).toBeDefined()
      expect(clientChunk.code).toContain('console.log("App index"')
      expect(clientChunk.code).toContain('console.log("Virtual client:"')
      expect(clientChunk.code).not.toContain('__attachChunkname')

      const clientPageChunk = clientResult.output.find((c: any) => c.facadeModuleId?.endsWith('home.js'))

      expect(clientPageChunk).toBeDefined()
      expect(clientPageChunk.code).toContain('"Home Page"')
      expect(clientPageChunk.code).not.toContain('Stores$')

      const manifest = clientResult.output.find((c: any) => c.fileName === '.vite/manifest.json')

      expect(manifest).toBeDefined()

      const rendererChunk = rendererResult.output.find((c: any) => c.facadeModuleId === adapter.rendererPath)

      expect(rendererChunk).toBeDefined()
      expect(rendererChunk.code).toContain('console.log("App index"')
      expect(rendererChunk.code).toContain('console.log("Virtual renderer:"')
      expect(rendererChunk.code).toContain('__attachChunkname')

      const rendererPageChunk = rendererResult.output.find((c: any) => c.facadeModuleId?.endsWith('home.js'))

      expect(rendererPageChunk).toBeDefined()
      expect(rendererPageChunk.code).toContain('"Home Page"')
      expect(rendererPageChunk.code).toContain('Stores$')
    })

    it('should work with client and renderer options', async () => {
      const plugin = SsrPlugin({
        client: path.join(testAppDir, 'client.js'),
        renderer: path.join(testAppDir, 'renderer.js')
      }, adapter)
      const clientResult: any = await build({
        root: testAppDir,
        logLevel: 'silent',
        plugins: plugin,
        build: {
          minify: false,
          ssr: false
        }
      })
      const rendererResult: any = await build({
        root: testAppDir,
        logLevel: 'silent',
        plugins: plugin,
        build: {
          minify: false,
          ssr: true
        }
      })
      const clientChunk = clientResult.output.find((c: any) => c.facadeModuleId.endsWith('client.js'))

      expect(clientChunk).toBeDefined()
      expect(clientChunk.code).toContain('console.log("App index"')
      expect(clientChunk.code).toContain('console.log("Client:"')
      expect(clientChunk.code).not.toContain('__attachChunkname')

      const clientPageChunk = clientResult.output.find((c: any) => c.facadeModuleId?.endsWith('home.js'))

      expect(clientPageChunk).toBeDefined()
      expect(clientPageChunk.code).toContain('"Home Page"')
      expect(clientPageChunk.code).not.toContain('Stores$')

      const manifest = clientResult.output.find((c: any) => c.fileName === '.vite/manifest.json')

      expect(manifest).toBeDefined()

      const rendererChunk = rendererResult.output.find((c: any) => c.facadeModuleId.endsWith('renderer.js'))

      expect(rendererChunk).toBeDefined()
      expect(rendererChunk.code).toContain('console.log("App index"')
      expect(rendererChunk.code).toContain('console.log("Renderer:"')
      expect(rendererChunk.code).toContain('__attachChunkname')

      const rendererPageChunk = rendererResult.output.find((c: any) => c.facadeModuleId?.endsWith('home.js'))

      expect(rendererPageChunk).toBeDefined()
      expect(rendererPageChunk.code).toContain('"Home Page"')
      expect(rendererPageChunk.code).toContain('Stores$')
    })
  })
})
