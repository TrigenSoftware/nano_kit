// This file must stay a script (no top-level import/export), otherwise the
// ambient module declaration below stops being registered globally.

declare module 'virtual:app-renderer' {
  /**
   * The SSR renderer instance, provided by the configured renderer entry.
   * Available to the `server` entry when the `server` plugin option is set.
   */
  // oxlint-disable-next-line typescript/consistent-type-imports
  export const renderer: import('../renderer/index.js').Renderer
}
