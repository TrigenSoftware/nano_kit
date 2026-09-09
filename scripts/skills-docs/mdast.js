export const DROPPED_TYPES = new Set(['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression', 'image', 'yaml'])
export const BLOCK_TYPES = new Set(['blockquote', 'code', 'heading', 'html', 'list', 'paragraph', 'table', 'thematicBreak'])

export function text(value) {
  return {
    type: 'text',
    value
  }
}

export function paragraph(children) {
  return {
    type: 'paragraph',
    children
  }
}

export function heading(depth, value) {
  return {
    type: 'heading',
    depth,
    children: [text(value)]
  }
}

export function strong(value) {
  return paragraph([{
    type: 'strong',
    children: [text(value)]
  }])
}

export function blockquote(children) {
  return {
    type: 'blockquote',
    children
  }
}

export function code(lang, value, meta) {
  return {
    type: 'code',
    lang,
    meta,
    value
  }
}

// Splits phrasing content around the block nodes that inline components produced
export function hoist(children) {
  const result = []
  let phrasing = []
  const flush = () => {
    const first = phrasing[0]
    const last = phrasing.at(-1)

    if (first?.type === 'text') {
      first.value = first.value.trimStart()
    }

    if (last?.type === 'text') {
      last.value = last.value.trimEnd()
    }

    if (phrasing.some(node => node.type !== 'text' || node.value)) {
      result.push(paragraph(phrasing))
    }

    phrasing = []
  }

  for (const child of children) {
    if (BLOCK_TYPES.has(child.type)) {
      flush()
      result.push(child)
    } else {
      phrasing.push(child)
    }
  }

  flush()

  return result
}
