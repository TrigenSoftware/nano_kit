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

  let found = false

  walk(node.body, {
    ReturnStatement() {
      found = true
    }
  }, true)

  return found
}

/**
 * @param {any} node
 * @returns {boolean}
 */
function isStoresFunction(node) {
  if (!isFunctionWithReturn(node)) {
    return false
  }

  let found = false

  walk(node.body, {
    Identifier(id) {
      if (id.name[0] === '$' && id.name.length > 1) {
        found = true
      }
    }
  }, true)

  return found
}

/**
 * @param {any[]} body
 * @param {string} name
 * @param {(node: any) => boolean} validator
 * @returns {boolean}
 */
function hasBindingWithFunction(body, name, validator) {
  for (const node of body) {
    if (
      node.type === 'FunctionDeclaration'
      && node.id?.name === name
      && validator(node)
    ) {
      return true
    }

    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        if (
          decl.id?.name === name
          && decl.init
          && validator(decl.init)
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
    include: [/\bexport\b/, /\bdefault\b/, /(?:Stores|Cache)\$/, /\breturn\b/]
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

/** @type {Record<string, (node: any) => boolean>} */
const SSR_ONLY_EXPORTS = {
  Stores$: isStoresFunction,
  Cache$: isFunctionWithReturn
}

/**
 * Remove SSR-only exports (`Stores$`, `Cache$`) from page components for client build,
 * since they are only used for SSR and can cause issues if left in.
 * @param {import('rolldown').RolldownMagicString | null} magicString
 * @param {any} ast
 * @param {string} code
 * @returns {{ code: string, map: import('magic-string').SourceMap } | null} Transformed code
 */
export function transformClient(magicString, ast, code) {
  const s = magicString ?? new MagicString(code)
  let changed = false

  for (const node of ast.body) {
    if (node.type !== 'ExportNamedDeclaration') {
      continue
    }

    const decl = node.declaration

    if (decl && decl.type === 'FunctionDeclaration') {
      const validator = SSR_ONLY_EXPORTS[decl.id?.name]

      if (validator && validator(decl)) {
        s.remove(node.start, node.end)
        changed = true
        continue
      }
    }

    if (
      decl
      && decl.type === 'VariableDeclaration'
      && decl.declarations.length === 1
    ) {
      const d = decl.declarations[0]
      const validator = SSR_ONLY_EXPORTS[d.id?.name]

      if (validator && d.init && validator(d.init)) {
        s.remove(node.start, node.end)
        changed = true
        continue
      }
    }

    if (!decl && node.specifiers) {
      const spec = node.specifiers.find(
        s => s.type === 'ExportSpecifier'
          && (
            SSR_ONLY_EXPORTS[s.local?.name]
            || SSR_ONLY_EXPORTS[s.exported?.name]
          )
      )

      if (!spec) {
        continue
      }

      const exportedName = SSR_ONLY_EXPORTS[spec.exported?.name]
        ? spec.exported.name
        : spec.local.name
      const localName = spec.local?.name ?? exportedName
      const validator = SSR_ONLY_EXPORTS[exportedName]

      if (!hasBindingWithFunction(ast.body, localName, validator)) {
        continue
      }

      if (node.specifiers.length === 1) {
        s.remove(node.start, node.end)
      } else {
        const specs = node.specifiers
        const idx = specs.indexOf(spec)
        const isLast = idx === specs.length - 1
        const start = isLast ? specs[idx - 1].end : spec.start
        const end = isLast ? spec.end : specs[idx + 1].start

        s.remove(start, end)
      }

      changed = true
    }
  }

  if (!changed) {
    return null
  }

  return {
    code: s.toString(),
    map: s.generateMap({
      hires: true
    })
  }
}
