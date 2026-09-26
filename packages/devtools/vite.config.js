import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

const STYLES_ID = 'virtual:styles'
const STYLES_RESOLVED_ID = '\0virtual:styles'
const STYLES_STAND_IN = '__NANO_KIT_DEVTOOLS_STYLES__'

/**
 * The styles of the panel as one string in the bundle, `virtual:styles`: the panel adopts them into its shadow
 * root, and the bundler of an application gets no CSS to process. The entry that imports them is left out of
 * the stories and the specs, so the library build is the only one that has them.
 * @returns The plugin.
 */
function inlineStyles() {
  return {
    name: 'devtools:inline-styles',
    // Storybook takes the plugins of this config into its own build, without `build.lib`
    apply: (config, { command }) => command === 'build' && Boolean(config.build?.lib),
    resolveId(id) {
      return id === STYLES_ID ? STYLES_RESOLVED_ID : undefined
    },
    load(id) {
      // The styles are known once the whole bundle is built: a stand-in until then
      return id === STYLES_RESOLVED_ID ? `export default ${JSON.stringify(STYLES_STAND_IN)}` : undefined
    },
    generateBundle: {
      // After `vite:css-post`, which emits the CSS
      order: 'post',
      handler(_options, bundle) {
        let css = ''

        for (const name in bundle) {
          if (name.endsWith('.css')) {
            css += bundle[name].source
            delete bundle[name]
          }
        }

        for (const file of Object.values(bundle)) {
          if (file.type === 'chunk') {
            file.code = file.code.replace(new RegExp(`(["'])${STYLES_STAND_IN}\\1`), JSON.stringify(css))
          }
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [inlineStyles()],
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: './src/index.ts'
      }
    },
    rolldownOptions: {
      external: [/^nanoviews/, /^@nano_kit\//],
      output: {
        topLevelVar: false
      }
    },
    sourcemap: true,
    minify: false,
    // The styles end up in a string, which the minifier of an application never touches
    cssMinify: true,
    emptyOutDir: false
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['@nanoviews/testing-library/vitest'],
    server: {
      deps: {
        // Externalized, nanoviews would be run by Node, which cannot resolve
        // the workspace kida and agera sources it is overridden to.
        inline: [/\/nanoviews\//, /@nanoviews\//]
      }
    },
    exclude: [...configDefaults.exclude, './package', './dist', './storybook-static'],
    coverage: {
      provider: 'v8',
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*'],
      // The entry imports the styles only the library build makes: no spec loads it
      exclude: ['src/**/*.stories.ts', 'src/devtools.ts']
    }
  }
})
