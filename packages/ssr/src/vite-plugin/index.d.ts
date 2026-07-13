import './virtual.js'
import type { Plugin } from 'vite'

export interface SsrPluginAdapter {
  /**
   * Virtual module ID for the client entry.
   */
  clientPath: string
  /**
   * Virtual module ID for the renderer entry.
   */
  rendererPath: string
  /**
   * Load the client entry content.
   * @returns The client entry content.
   */
  loadClient(): Promise<string>
  /**
   * Load the renderer entry content.
   * @returns The renderer entry content.
   */
  loadRenderer(): Promise<string>
}

export interface BaseSsrPluginOptions {
  /**
   * Use Rolldown's native MagicString for transforms.
   * @default true
   */
  nativeMagicString?: boolean
  /**
   * Directory inside the build output for client assets.
   * @default 'client'
   */
  clientDir?: string
  /**
   * Directory inside the build output for renderer assets.
   * @default 'renderer'
   */
  rendererDir?: string
  /**
   * Path to the server entry file. When set, this file is bundled instead of the
   * renderer (into `serverDir`), and the renderer is exposed to it through the
   * `virtual:app-renderer` module.
   */
  server?: string
  /**
   * Directory inside the build output for server assets. Used only when the
   * `server` option is set.
   * @default 'server'
   */
  serverDir?: string
  /**
   * Development options.
   */
  dev?: {
    /**
     * Whether to dehydrate the state in development mode.
     * @default true
     */
    dehydrate?: boolean
  }
  inject?: {
    /**
     * Whether to inject a CookieStore-compatible virtual implementation during SSR.
     * @default false
     */
    cookieStore?: boolean
    /**
     * Weather to detect and inject the browser locale from the `Accept-Language` header.
     * @default false
     */
    browserLocale?: boolean
    /**
     * Whether to inject the browser user agent from the `User-Agent` header.
     * @default false
     */
    userAgent?: boolean
  }
}

export interface EjectedSsrPluginOptions extends BaseSsrPluginOptions {
  /**
   * Path to the client entry file.
   */
  client: string
  /**
   * Path to the renderer entry file.
   */
  renderer: string
}

export interface IndexSsrPluginOptions extends BaseSsrPluginOptions, Parital<Pick<EjectedSsrPluginOptions, 'client' | 'renderer'>> {
  /**
   * Path to the app index file which exports the app routes and pages.
   */
  index: string
}

export type SsrPluginOptions = EjectedSsrPluginOptions | IndexSsrPluginOptions

/**
 * A Vite plugin for nano_kit SSR capabilities.
 * @param options
 * @returns Vite plugin
 */
export default function SsrPlugin(options: SsrPluginOptions, adapter: SsrPluginAdapter): Plugin[]
