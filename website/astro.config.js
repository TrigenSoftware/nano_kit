import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import llmsTxt from 'starlight-llms-txt'
import { viewTransitions } from 'astro-vtbot/starlight-view-transitions'

const isProduction = process.env.NODE_ENV === 'production'

function visitElements(node, callback) {
  const children = node.children

  if (!Array.isArray(children)) {
    return
  }

  for (let index = 0; index < children.length; index++) {
    const child = children[index]

    if (child.type === 'element') {
      callback(child, index, node)
    }

    visitElements(child, callback, node)
  }
}

function rehypeWrapTables() {
  return (tree) => {
    visitElements(tree, (node, index, parent) => {
      if (
        node.tagName !== 'table'
        || parent?.properties?.className?.includes('nk-table-wrapper')
      ) {
        return
      }

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['nk-table-wrapper']
        },
        children: [node]
      }
    })
  }
}

export default defineConfig({
  site: 'https://nano-kit.js.org',
  markdown: {
    rehypePlugins: [rehypeWrapTables]
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
          label: 'Platforms',
          autogenerate: {
            directory: 'platform'
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
