import path from 'node:path'
import { build } from 'vite'
import * as Chunkname from './chunkname.js'
import {
  clientTransformFilter,
  clientTransformFilterFallback,
  serverTransformFilter,
  serverTransformFilterFallback,
  transformClient,
  transformServer
} from './transform.js'

/**
 * A Vite plugin for nano_kit SSR posibilities.
 * @param {import('./index').SsrPluginOptions} options
 * @param {import('./index').SsrPluginAdapter} adapter
 * @returns {import('vite').Plugin[]} Vite plugin
 */
export default function SsrPlugin(options, adapter) {
  const {
    index: appIndex,
    client: clientPath = adapter.clientPath,
    renderer: rendererPath = adapter.rendererPath,
    clientDir = 'client',
    rendererDir = 'renderer',
    dev = {}
  } = options
  let baseUrl = '/'
  let sourceConfig = {}
  let isSsrBuild

  return [
    {
      name: '@nano_kit/ssr/vite-plugin:transform:client',
      apply: 'build',

      transform: {
        filter: clientTransformFilter,
        handler(code, id, options) {
          if (options?.ssr || !clientTransformFilterFallback(id, code)) {
            return null
          }

          const ast = this.parse(code)

          return transformClient(ast, code)
        }
      }
    },
    {
      name: '@nano_kit/ssr/vite-plugin:transform:server',
      apply: 'build',

      resolveId(id) {
        if (id === Chunkname.VIRTUA_ID) {
          return Chunkname.RESOLVED_VIRTUAL_ID
        }
      },

      load(id) {
        if (id === Chunkname.RESOLVED_VIRTUAL_ID) {
          return Chunkname.CODE
        }
      },

      transform: {
        filter: serverTransformFilter,
        handler(code, id, options) {
          if (!options?.ssr || !serverTransformFilterFallback(id, code)) {
            return null
          }

          const ast = this.parse(code)
          const root = this.environment.config.root
          const resolve = async (source) => {
            const result = await this.resolve(source, id)

            if (!result) {
              return null
            }

            return path.relative(root, result.id)
          }

          return transformServer(ast, code, resolve)
        }
      }
    },
    {
      name: '@nano_kit/ssr/vite-plugin:virtual',
      configResolved(config) {
        baseUrl = config.base
      },
      resolveId(id) {
        if (id === 'virtual:app-index') {
          return this.resolve(appIndex)
        }

        if (
          id === adapter.clientPath || id === `${baseUrl}${adapter.clientPath}`
        ) {
          return adapter.clientPath
        }

        if (
          id === adapter.rendererPath || id === `${baseUrl}${adapter.rendererPath}`
        ) {
          return adapter.rendererPath
        }
      },
      load(id) {
        if (id === adapter.clientPath) {
          return adapter.loadClient()
        }

        if (id === adapter.rendererPath) {
          return adapter.loadRenderer()
        }
      }
    },
    {
      name: '@nano_kit/ssr/vite-plugin:serve',
      apply: 'serve',

      configureServer(server) {
        const { logger } = server.config

        return () => {
          server.middlewares.use(async (req, res, next) => {
            try {
              const url = req.originalUrl || '/'

              logger.info(`handling ${req.originalUrl}`, {
                timestamp: true
              })

              const started = Date.now()
              const { renderer } = await server.ssrLoadModule(rendererPath)

              renderer.options.dehydrate = dev.dehydrate !== false
              renderer.manifest[clientPath] = {
                file: clientPath,
                name: 'client',
                src: clientPath,
                isEntry: true
              }

              const result = await renderer.render(url)

              if (result.redirect) {
                logger.info(`redirecting ${url} to ${result.redirect} with status ${result.statusCode} in ${Date.now() - started}ms`, {
                  timestamp: true
                })

                res.writeHead(result.statusCode, {
                  Location: result.redirect
                })
                res.end()
              } else if (result.html !== null) {
                const html = await server.transformIndexHtml(url, result.html)

                logger.info(`rendered ${url} in ${Date.now() - started}ms`, {
                  timestamp: true
                })

                res.writeHead(result.statusCode, {
                  'Content-Type': 'text/html'
                })
                res.end(html)
              } else {
                logger.info(`route ${url} not found`, {
                  timestamp: true
                })
                next()
              }
            } catch (e) {
              server.ssrFixStacktrace(e)
              res.writeHead(500, {
                'Content-Type': 'text/html'
              })
              next(e)
            }
          })
        }
      }
    },
    {
      name: '@nano_kit/ssr/vite-plugin:build',
      apply: 'build',

      config(config, env) {
        sourceConfig = config
        isSsrBuild = env.isSsrBuild

        const outDir = config.build?.outDir || 'dist'
        const outClientDir = path.join(outDir, clientDir)
        const outRendererDir = path.join(outDir, rendererDir)
        const manifestOption = config.build?.manifest || true
        const manifestPath = typeof manifestOption === 'string'
          ? path.join(outClientDir, manifestOption)
          : path.join(outClientDir, '.vite', 'manifest.json')
        const define = {
          'import.meta.env.MANIFEST': JSON.stringify(manifestPath)
        }

        if (isSsrBuild) {
          return {
            define,
            build: {
              sourcemap: true,
              rollupOptions: {
                input: rendererPath,
                output: {
                  entryFileNames: 'index.js'
                }
              },
              outDir: outRendererDir
            }
          }
        }

        return {
          define,
          build: {
            rollupOptions: {
              input: clientPath
            },
            outDir: outClientDir,
            manifest: manifestOption
          }
        }
      },

      async closeBundle(error) {
        if (!error && !isSsrBuild && sourceConfig.build?.ssr !== false) {
          await build({
            ...sourceConfig,
            configFile: false,
            build: {
              ...sourceConfig.build,
              ssr: true
            }
          })
        }
      }
    }
  ]
}
