import type { Plugin } from 'vite'
import type { SsrPluginOptions } from '@nano_kit/ssr/vite-plugin'

export * from '@nano_kit/ssr/vite-plugin'

/**
 * A Vite plugin for nano_kit Svelte SSR capabilities.
 * @param options
 * @returns Vite plugin
 */
export default function SvelteSsrPlugin(options: SsrPluginOptions): Plugin[]
