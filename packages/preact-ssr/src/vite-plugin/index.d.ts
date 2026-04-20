import type { Plugin } from 'vite'
import type { SsrPluginOptions } from '@nano_kit/ssr/vite-plugin'

export * from '@nano_kit/ssr/vite-plugin'

/**
 * A Vite plugin for nano_kit Preact SSR capabilities.
 * @param options
 * @returns Vite plugin
 */
export default function PreactSsrPlugin(options: SsrPluginOptions): Plugin[]
