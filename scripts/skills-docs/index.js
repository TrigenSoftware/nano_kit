#!/usr/bin/env node
import {
  readFile,
  writeFile
} from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { generate } from './generate.js'

/**
 * Generates a documentation file next to every agent skill that declares `metadata.docs`
 * in its `SKILL.md` frontmatter. `docs.paths` lists Starlight docs pages (`.md` or `.mdx`) or directories in
 * reading order (a directory expands to its pages sorted by `sidebar.order`); `docs.tabs`
 * lists tab labels the skill prefers, and together with `--tabs` they decide which tab of a
 * `Tabs` group is kept, groups without a preferred tab are flattened with their labels.
 *
 * skills-docs [--docs <dir>] [--skills <dir>] [--site <url>] [--tabs <labels>] [--out <name>] [--drop <titles>] [--check]
 *
 * `--docs` is the Starlight content directory (default `website/src/content/docs`), `--skills`
 * the directory with the skills (default `skills`), both relative to the working directory.
 * `--site` makes links absolute; without it, links into the documentation are unwrapped to their
 * text and only external links and same-page anchors stay. `--tabs` is a comma-separated list of tab labels
 * every skill prefers, `--out` the generated file name (default `DOCS.md`), `--drop` a
 * comma-separated list of section and page titles to leave out (a section ends at the next
 * heading of the same or a higher level), `--check` fails when a generated file is stale.
 */
const { values: options } = parseArgs({
  options: {
    docs: {
      type: 'string',
      default: 'website/src/content/docs'
    },
    skills: {
      type: 'string',
      default: 'skills'
    },
    site: {
      type: 'string',
      default: ''
    },
    tabs: {
      type: 'string',
      default: ''
    },
    out: {
      type: 'string',
      default: 'DOCS.md'
    },
    drop: {
      type: 'string',
      default: ''
    },
    check: {
      type: 'boolean',
      default: false
    }
  }
})

function list(value) {
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

const files = await generate({
  docs: resolve(options.docs),
  skills: resolve(options.skills),
  site: options.site.replace(/\/$/, ''),
  tabs: list(options.tabs),
  drop: list(options.drop),
  out: options.out
})

async function current(target) {
  try {
    return await readFile(target, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

async function check({ name, target, content }) {
  const stale = await current(target) !== content

  if (stale) {
    console.error(`${name}/${options.out} is stale`)
  }

  return stale
}

async function write({ name, target, content }) {
  await writeFile(target, content)
  console.info(`${name}/${options.out}: ${content.length} chars`)
}

if (options.check) {
  const results = await Promise.all(files.map(check))

  if (results.includes(true)) {
    process.exit(1)
  }
} else {
  await Promise.all(files.map(write))
}
