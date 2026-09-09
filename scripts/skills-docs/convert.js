import { readFile } from 'node:fs/promises'
import {
  basename,
  relative
} from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkStringify from 'remark-stringify'
import { defaultHandlers } from 'mdast-util-to-markdown'
import { frontmatter } from './frontmatter.js'
import {
  BLOCK_TYPES,
  DROPPED_TYPES,
  blockquote,
  code,
  heading,
  hoist,
  paragraph,
  strong,
  text
} from './mdast.js'

const CONTAINER_TYPES = new Set(['blockquote', 'list', 'listItem'])
const STRINGIFY_OPTIONS = {
  bullet: '-',
  emphasis: '*',
  fences: true,
  listItemIndent: 'one',
  rule: '-',
  handlers: {
    // Underscores inside words (`@nano_kit`) stay readable; the other escapes are kept
    text: (node, parent, state, info) => defaultHandlers.text(node, parent, state, info).replace(/(?<=\w)\\_(?=\w)/g, '_')
  }
}
const mdx = unified().use(remarkParse).use(remarkGfm).use(remarkMdx).use(remarkStringify, STRINGIFY_OPTIONS)
const md = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, STRINGIFY_OPTIONS)

function location(page, node) {
  return `${page.path}:${node.position?.start.line ?? '?'}`
}

// Static value of a JSX attribute: a string, or a string literal or substitution-free template expression
function attribute(node, name, page) {
  const found = node.attributes.find(item => item.type === 'mdxJsxAttribute' && item.name === name)

  if (!found || typeof found.value === 'string') {
    return found?.value
  }

  const expression = found.value.data?.estree?.body[0]?.expression

  if (expression?.type === 'Literal' && typeof expression.value === 'string') {
    return expression.value
  }

  if (expression?.type === 'TemplateLiteral' && !expression.expressions.length) {
    return expression.quasis[0].value.cooked
  }

  throw new Error(`${location(page, node)}: the \`${name}\` attribute of <${node.name}> must be a static string`)
}

function label(kind) {
  return kind[0].toUpperCase() + kind.slice(1)
}

// Tab items of a group, including compact ones that MDX wraps in paragraphs
function tabItems(node) {
  return node.children.flatMap((child) => {
    if (child.name === 'TabItem') {
      return [child]
    }

    return child.type === 'paragraph'
      ? child.children.filter(item => item.name === 'TabItem')
      : []
  })
}

// Keeps the preferred tab of a group, or flattens every tab with its label when none is preferred
function convertTabs(node, page) {
  const items = tabItems(node)
  const labels = items.map(item => attribute(item, 'label', page) ?? '')
  const preferred = labels.some(item => page.tabs.has(item))

  return items.flatMap((item, index) => {
    if (preferred && !page.tabs.has(labels[index])) {
      return []
    }

    const children = hoist(convertNodes(item.children, page))

    return preferred || items.length === 1
      ? children
      : [strong(labels[index]), ...children]
  })
}

function convertAside(node, page) {
  const children = hoist(convertNodes(node.children, page))
  const prefix = `${attribute(node, 'title', page) ?? label(attribute(node, 'type', page) ?? 'note')}: `
  const first = children[0]?.type === 'paragraph' ? children[0].children[0] : undefined

  if (first?.type === 'text') {
    first.value = prefix + first.value.trimStart()
  } else if (children[0]?.type === 'paragraph') {
    children[0].children.unshift(text(prefix))
  } else {
    children.unshift(paragraph([text(prefix.trim())]))
  }

  return [blockquote(children)]
}

// Turns a Starlight component into plain markdown nodes
function convertElement(node, page) {
  switch (node.name) {
    case 'Tabs':
      return convertTabs(node, page)
    case 'Aside':
      return convertAside(node, page)
    case 'Code':
      return [code(
        attribute(node, 'lang', page),
        attribute(node, 'code', page) ?? '',
        attribute(node, 'title', page) ? `title="${attribute(node, 'title', page)}"` : undefined
      )]
    case 'Card':
      return [strong(attribute(node, 'title', page) ?? ''), ...hoist(convertNodes(node.children, page))]
    case 'Image':
      return []
    case 'Steps':
    case 'CardGrid':
    case 'TabItem':
      return hoist(convertNodes(node.children, page))
    default:
      console.warn(`${location(page, node)}: unwrapped <${node.name}>`)
      return hoist(convertNodes(node.children, page))
  }
}

function convertNodes(nodes, page) {
  return nodes.flatMap((node) => {
    if (DROPPED_TYPES.has(node.type)) {
      return []
    }

    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      return convertElement(node, page)
    }

    if (node.type === 'link' || node.type === 'definition') {
      if (page.url) {
        node.url = new URL(node.url, page.url).href
      } else if (node.type === 'link' && isInternal(node.url)) {
        return convertNodes(node.children, page)
      }
    }

    if (node.children) {
      node.children = convertNodes(node.children, page)

      if (node.type === 'paragraph' && node.children.some(child => BLOCK_TYPES.has(child.type))) {
        return hoist(node.children)
      }

      if (node.type === 'paragraph' && !node.children.length) {
        return []
      }
    }

    return [node]
  })
}

// A link into the documentation itself: no scheme, not protocol-relative, not a same-page anchor
function isInternal(url) {
  return !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('//') && !url.startsWith('#')
}

function textOf(node) {
  return node.value ?? node.children?.map(textOf).join('') ?? ''
}

// Removes the sections whose heading is listed, up to the next heading of the same or a higher level
function dropSections(nodes, dropped) {
  let depth = 0

  return nodes.filter((node) => {
    if (node.type === 'heading' && node.depth <= depth) {
      depth = 0
    }

    if (node.type === 'heading' && !depth && dropped.has(textOf(node).trim().toLowerCase())) {
      ({ depth } = node)
    }

    if (!depth && CONTAINER_TYPES.has(node.type)) {
      node.children = dropSections(node.children, dropped)

      return node.children.length > 0
    }

    return !depth
  })
}

// Public URL of a docs page on the site, for resolving links when `--site` is given
function pageUrl(site, docs, path) {
  const slug = relative(docs, path).replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '')

  return `${site}/${slug ? `${slug}/` : ''}`
}

// Converts one page into markdown: a title and description from the frontmatter, then the body;
// a page whose title is listed in `drop` yields `null`
export async function convertPage(path, { docs, site, tabs, drop }) {
  const [data, source] = frontmatter(await readFile(path, 'utf8'))
  const title = data.title ?? basename(path).replace(/\.mdx?$/, '')
  const dropped = new Set(drop.map(item => item.toLowerCase()))

  if (dropped.has(title.toLowerCase())) {
    return null
  }

  const processor = path.endsWith('.mdx') ? mdx : md
  const tree = processor.parse(source)
  const page = {
    path,
    tabs,
    url: site ? pageUrl(site, docs, path) : ''
  }
  const head = [heading(1, title)]

  if (data.description) {
    head.push(paragraph([text(data.description)]))
  }

  tree.children = [...head, ...dropSections(convertNodes(tree.children, page), dropped)]

  return processor.stringify(tree).trim()
}
