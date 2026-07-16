import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import starlight from '@astrojs/starlight'
import llmsTxt from 'starlight-llms-txt'
import { viewTransitions } from 'astro-vtbot/starlight-view-transitions'
import { rehypeNormalizeContent } from './rehype.js'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  site: 'https://nano-kit.js.org',
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeNormalizeContent]
    })
  },
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
          // GitHub Pages can't set COOP/COEP headers, which StackBlitz
          // WebContainers embeds require; this service worker injects them
          tag: 'script',
          attrs: {
            src: '/coi-serviceworker.js'
          }
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://nano-kit.js.org/og-image-v2.jpg'
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
            content: 'https://nano-kit.js.org/og-image-v2.jpg'
          }
        },
        {
          tag: 'meta',
          attrs: {
            name: 'format-detection',
            content: 'telephone=no'
          }
        },
        isProduction && {
          tag: 'script',
          attrs: {
            'src': 'https://cloud.umami.is/script.js',
            'data-website-id': '6b792c30-fae6-48d2-95fa-c1d39706f328',
            'defer': true,
            // Required to pass the COEP require-corp check
            'crossorigin': 'anonymous'
          }
        },
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'JbpBLn9A_qAr4OqSunPoFWeahyME9dMplBMUsaOK_I4'
          }
        }
      ].filter(Boolean),
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
          items: [
            {
              autogenerate: {
                directory: 'getting-started'
              }
            }
          ]
        },
        {
          label: 'Store',
          items: [
            {
              autogenerate: {
                directory: 'store'
              }
            }
          ]
        },
        {
          label: 'Query',
          items: [
            {
              autogenerate: {
                directory: 'query'
              }
            }
          ]
        },
        {
          label: 'Router',
          items: [
            {
              autogenerate: {
                directory: 'router'
              }
            }
          ]
        },
        {
          label: 'Internationalization',
          items: [
            {
              autogenerate: {
                directory: 'intl'
              }
            }
          ]
        },
        {
          label: 'SSR',
          items: [
            {
              autogenerate: {
                directory: 'ssr'
              }
            }
          ]
        },
        {
          label: 'Platforms',
          items: [
            {
              autogenerate: {
                directory: 'platform'
              }
            }
          ]
        },
        {
          label: 'Integrations',
          items: [
            {
              autogenerate: {
                directory: 'integrations'
              }
            }
          ]
        },
        {
          label: 'Tutorial',
          items: [
            {
              autogenerate: {
                directory: 'tutorial'
              }
            }
          ]
        },
        {
          label: 'Examples',
          items: [
            {
              autogenerate: {
                directory: 'examples'
              }
            }
          ]
        }
      ],
      customCss: ['./src/styles/global.css'],
      expressiveCode: {
        themes: ['github-dark-high-contrast', 'github-light-default']
      }
    })
  ]
})
