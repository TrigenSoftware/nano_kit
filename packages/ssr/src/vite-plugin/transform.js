import MagicString from 'magic-string'
import * as Chunkname from './chunkname.js'

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression'
])

/**
 * @param {any} node
 * @returns {boolean}
 */
function isFunctionWithReturn(node) {
  if (!FUNCTION_TYPES.has(node.type)) {
    return false
  }

  // An arrow function with an expression for its body returns it
  if (node.expression) {
    return true
  }

  let found = false

  walk(node.body, {
    ReturnStatement() {
      found = true
    }
  }, true)

  return found
}

/**
 * @param {any[]} body
 * @param {string} name
 * @returns {boolean}
 */
function hasBindingWithFunction(body, name) {
  for (const node of body) {
    if (
      node.type === 'FunctionDeclaration'
      && node.id?.name === name
      && isFunctionWithReturn(node)
    ) {
      return true
    }

    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        if (
          decl.id?.name === name
          && decl.init
          && isFunctionWithReturn(decl.init)
        ) {
          return true
        }
      }
    }
  }

  return false
}

/**
 * @param {any} node
 * @param {Record<string, (node: any) => void>} visitors
 * @param {boolean} skipNestedFunctions
 * @returns {void}
 */
function walk(
  node,
  visitors,
  skipNestedFunctions = false
) {
  if (!node || typeof node !== 'object') {
    return
  }

  if (node.type && visitors[node.type]) {
    visitors[node.type](node)
  }

  for (const key of Object.keys(node)) {
    const child = node[key]

    if (Array.isArray(child)) {
      for (const c of child) {
        if (c && typeof c === 'object' && 'type' in c) {
          walk(c, visitors, skipNestedFunctions)
        }
      }
    } else if (child && typeof child === 'object' && 'type' in child) {
      if (skipNestedFunctions && FUNCTION_TYPES.has(child.type)) {
        continue
      }

      walk(child, visitors, skipNestedFunctions)
    }
  }
}

export const serverTransformFilter = {
  id: {
    include: /\.(js|ts|jsx|tsx)$/,
    exclude: /^\0|node_modules/
  },
  code: {
    include: /\bimport\s*\(/
  }
}

/**
 * @param {string} id
 * @param {string} code
 * @returns {boolean}
 */
export function serverTransformFilterFallback(id, code) {
  return (
    serverTransformFilter.id.include.test(id)
    && !serverTransformFilter.id.exclude.test(id)
    && serverTransformFilter.code.include.test(code)
  )
}

/**
 * Attach chunk names to dynamic imports for SSR to know which chunks to preload.
 * @param {import('rolldown').RolldownMagicString | null} magicString
 * @param {any} ast
 * @param {string} code
 * @param {(source: string) => Promise<string | null>} resolve
 * @returns {{ code: string, map: import('magic-string').SourceMap } | null} Transformed code
 */
export async function transformServer(magicString, ast, code, resolve) {
  const imports = []

  walk(ast, {
    ImportExpression(node) {
      const imp = node
      const src = imp.source

      if (src.type === 'Literal' && typeof src.value === 'string') {
        imports.push({
          start: imp.start,
          end: imp.end,
          source: src.value
        })
      }
    }
  })

  if (!imports.length) {
    return null
  }

  const resolved = (await Promise.all(
    imports.map(async (imp) => {
      const chunk = await resolve(imp.source)

      return chunk
        ? {
          ...imp,
          chunk
        }
        : null
    })
  )).filter(Boolean)

  if (!resolved.length) {
    return null
  }

  const s = magicString ?? new MagicString(code)

  for (const imp of resolved) {
    const original = code.slice(imp.start, imp.end)

    s.overwrite(
      imp.start,
      imp.end,
      Chunkname.INVOKE(original, imp.chunk)
    )
  }

  if (!code.includes(Chunkname.VIRTUAL_ID)) {
    s.prepend(Chunkname.IMPORT)
  }

  return {
    code: s.toString(),
    map: s.generateMap({
      hires: true
    })
  }
}

export const clientTransformFilter = {
  id: {
    include: /\.(js|ts|jsx|tsx)$/,
    exclude: /^\0|node_modules/
  },
  code: {
    include: [/\bexport\b/, /\bdefault\b/, /\b(?:Stores|Cache|Status)\$/]
  }
}

/**
 * @param {string} id
 * @param {string} code
 * @returns {boolean}
 */
export function clientTransformFilterFallback(id, code) {
  return (
    clientTransformFilter.id.include.test(id)
    && !clientTransformFilter.id.exclude.test(id)
    && clientTransformFilter.code.include.every(r => r.test(code))
  )
}

const SSR_ONLY_EXPORTS = new Set(['Stores$', 'Cache$', 'Status$'])

/**
 * Remove SSR-only exports (`Stores$`, `Cache$`, `Status$`) from page modules for client build,
 * since they are only used for SSR and can cause issues if left in.
 * A page module is one with a default export. Any other module is left as it is: what only
 * the removed exports use there is dropped by tree-shaking.
 * @param {import('rolldown').RolldownMagicString | null} magicString
 * @param {any} ast
 * @param {string} code
 * @returns {{ code: string, map: import('magic-string').SourceMap } | null} Transformed code
 */
export function transformClient(magicString, ast, code) {
  /** @type {[start: number, end: number, replacement: string][]} */
  const edits = []
  let page = false

  for (const node of ast.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      page = true
      continue
    }

    if (node.type !== 'ExportNamedDeclaration') {
      continue
    }

    const decl = node.declaration

    if (decl) {
      const fn = decl.type === 'VariableDeclaration' && decl.declarations.length === 1
        ? decl.declarations[0]
        : decl
      const name = fn.id?.name

      if (SSR_ONLY_EXPORTS.has(name) && isFunctionWithReturn(fn.init || fn)) {
        edits.push([node.start, node.end, ''])
      }

      continue
    }

    const specs = node.specifiers
    const kept = []

    for (const spec of specs) {
      const name = spec.exported.name

      if (
        !SSR_ONLY_EXPORTS.has(name)
        // The function of a re-export is in another module, so its name is all there is to go by
        || !node.source && !hasBindingWithFunction(ast.body, spec.local.name)
      ) {
        page ||= name === 'default'
        kept.push(code.slice(spec.start, spec.end))
      }
    }

    if (kept.length < specs.length) {
      edits.push(
        kept.length
          ? [specs[0].start, specs[specs.length - 1].end, kept.join(', ')]
          : [node.start, node.end, '']
      )
    }
  }

  if (!page || !edits.length) {
    return null
  }

  const s = magicString ?? new MagicString(code)

  for (const [start, end, replacement] of edits) {
    if (replacement) {
      s.overwrite(start, end, replacement)
    } else {
      s.remove(start, end)
    }
  }

  return {
    code: s.toString(),
    map: s.generateMap({
      hires: true
    })
  }
}
