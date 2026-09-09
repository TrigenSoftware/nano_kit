import YAML from 'yaml'

const FRONTMATTER_RE = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n/

// Splits a markdown source into its parsed YAML frontmatter and the body
export function frontmatter(source) {
  const match = FRONTMATTER_RE.exec(source)

  return match
    ? [YAML.parse(match[1]) ?? {}, source.slice(match[0].length)]
    : [{}, source]
}
