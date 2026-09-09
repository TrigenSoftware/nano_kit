import {
  readdir,
  readFile
} from 'node:fs/promises'
import { join } from 'node:path'
import { frontmatter } from './frontmatter.js'

const PAGE_RE = /\.mdx?$/

function isStringList(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

async function readFrontmatter(path) {
  return frontmatter(await readFile(path, 'utf8'))[0]
}

async function skillOf(directory, name, tabs) {
  const path = join(directory, name, 'SKILL.md')
  let metadata

  try {
    ({ metadata = {} } = await readFrontmatter(path))
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }

    throw error
  }

  if (metadata.docs === undefined) {
    return []
  }

  const { docs } = metadata

  if (!isStringList(docs?.paths) || !docs.paths.length || docs.tabs !== undefined && !isStringList(docs.tabs)) {
    throw new Error(`${path}: metadata.docs needs a non-empty \`paths\` list and an optional \`tabs\` list of strings`)
  }

  return [{
    name,
    entries: docs.paths,
    tabs: new Set([
      ...tabs,
      ...docs.tabs ?? []
    ])
  }]
}

// Skills that declare `metadata.docs.paths`, with their pages and the tab labels they prefer
export async function skillsOf(directory, tabs) {
  const entries = await readdir(directory, {
    withFileTypes: true
  })
  const skills = await Promise.all(entries.filter(entry => entry.isDirectory()).map(entry => skillOf(directory, entry.name, tabs)))

  return skills.flat()
}

// Expands a docs entry into page paths: a directory yields its pages sorted by `sidebar.order`
export async function pagesOf(docs, entry) {
  const path = join(docs, entry)

  if (PAGE_RE.test(entry)) {
    return [path]
  }

  const names = (await readdir(path)).filter(name => PAGE_RE.test(name))
  const orders = await Promise.all(names.map(async name => Number((await readFrontmatter(join(path, name))).sidebar?.order ?? Infinity)))

  return names
    .map((name, index) => [join(path, name), orders[index]])
    .sort((a, b) => a[1] - b[1])
    .map(([page]) => page)
}
