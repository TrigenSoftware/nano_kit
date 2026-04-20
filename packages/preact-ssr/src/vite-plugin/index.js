import path from 'node:path'
import fs from 'node:fs/promises'
import SsrPlugin from '@nano_kit/ssr/vite-plugin'

const adapter = {
  clientPath: 'client-entry.jsx',
  rendererPath: 'renderer-entry.jsx',
  loadClient() {
    return this.clientFile ??= fs.readFile(path.join(import.meta.dirname, '..', 'client.jsx'), 'utf-8')
  },
  loadRenderer() {
    return this.rendererFile ??= fs.readFile(path.join(import.meta.dirname, '..', 'renderer.jsx'), 'utf-8')
  }
}

/**
 * A Vite plugin for nano_kit Preact SSR capabilities.
 * @param {import('./index.d.ts').SsrPluginOptions} options
 * @returns Vite plugin
 */
export default function PreactSsrPlugin(options) {
  return SsrPlugin(options, adapter)
}
