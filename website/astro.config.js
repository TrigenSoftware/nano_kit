import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import llmsTxt from 'starlight-llms-txt'
import { viewTransitions } from 'astro-vtbot/starlight-view-transitions'

export default defineConfig({
  site: 'https://nano-kit.js.org',
  integrations: [
    starlight({
      title: 'Nano Kit',
      titleDelimiter: '✧',
      description: 'A lightweight, modular, and performant state management ecosystem for building modern web applications.',
      logo: {
        dark: './src/assets/universe_white.svg',
        light: './src/assets/universe_black.svg'
      },
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://nano-kit.js.org/og-image.jpg'
          }
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:width',
            content: '1200'
          }
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:height',
            content: '630'
          }
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:type',
            content: 'image/jpeg'
          }
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image'
          }
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://nano-kit.js.org/og-image.jpg'
          }
        },
        {
          tag: 'script',
          attrs: {
            'src': 'https://cloud.umami.is/script.js',
            'data-website-id': 'b40b9738-ecaf-4c4b-968d-6c9fbc91cede',
            'defer': true
          }
        },
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'JbpBLn9A_qAr4OqSunPoFWeahyME9dMplBMUsaOK_I4'
          }
        }
      ],
      social: [
        {
          label: 'GitHub',
          icon: 'github',
          href: 'https://github.com/TrigenSoftware/nano_kit'
        }
      ],
      editLink: {
        baseUrl: 'https://github.com/TrigenSoftware/nano_kit/edit/main/website/'
      },
      plugins: [llmsTxt(), viewTransitions()],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: {
            directory: 'getting-started'
          }
        },
        {
          label: 'Store',
          autogenerate: {
            directory: 'store'
          }
        },
        {
          label: 'Query',
          autogenerate: {
            directory: 'query'
          }
        },
        {
          label: 'Router',
          autogenerate: {
            directory: 'router'
          }
        },
        {
          label: 'SSR',
          autogenerate: {
            directory: 'ssr'
          }
        },
        {
          label: 'Integrations',
          autogenerate: {
            directory: 'integrations'
          }
        },
        {
          label: 'Tutorial',
          autogenerate: {
            directory: 'tutorial'
          }
        },
        {
          label: 'Examples',
          autogenerate: {
            directory: 'examples'
          }
        }
      ],
      customCss: ['./src/styles/global.css'],
      expressiveCode: {
        themes: ['github-dark-high-contrast', 'github-light-default'],
        frames: {
          extractFileNameFromCode: false
        }
      }
    })
  ]
})
