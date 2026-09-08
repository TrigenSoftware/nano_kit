import {
  type HeadDescriptor,
  type Location,
  type PageRef,
  PermanentReplaceHistoryAction,
  toHtmlAttribute
} from '@nano_kit/router'
import {
  type EmptyValue,
  get,
  isEmpty
} from '@nano_kit/store'
import type { ResponseStatusCode } from './renderer.types.js'
import {
  FOUND_STATUS,
  MOVED_PERMANENTLY_STATUS,
  NOT_FOUND_STATUS,
  SUCCESS_STATUS
} from './constants.js'

const ESCAPE_HTML_RE = /[&<>"]/

/**
 * Escapes a string for HTML text content and double-quoted attribute values.
 * A string without special characters is returned as is.
 * @param value - The raw string.
 * @returns The escaped string.
 */
export function escapeHtml(value: string) {
  const match = ESCAPE_HTML_RE.exec(value)

  if (!match) {
    return value
  }

  let html = ''
  let lastIndex = 0
  let escape: string

  for (let index = match.index, len = value.length; index < len; index++) {
    /* oxlint-disable eslint/no-magic-numbers */
    switch (value.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;'
        break
      case 38: // &
        escape = '&amp;'
        break
      case 60: // <
        escape = '&lt;'
        break
      case 62: // >
        escape = '&gt;'
        break
      default:
        continue
    }
    /* oxlint-enable eslint/no-magic-numbers */

    if (lastIndex !== index) {
      html += value.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += escape
  }

  return lastIndex !== value.length
    ? html + value.substring(lastIndex)
    : html
}

export function headDescriptorToHtml(descriptor: HeadDescriptor): string {
  const { tag } = descriptor
  let html = ''
  let code = ''

  if ('props' in descriptor) {
    html = `<${tag}`

    Object.entries(descriptor.props).forEach(([key, value]) => {
      const resolvedValue = get(value) as string | boolean | EmptyValue

      if (!isEmpty(resolvedValue)) {
        if (key === 'code') {
          code = String(resolvedValue)
        } else {
          html += ` ${toHtmlAttribute(key)}="${escapeHtml(String(resolvedValue))}"`
        }
      }
    })

    html += ' />'

    if (tag === 'script') {
      html += `${code}</${tag}>`
    }
  }

  return html
}

export function responseRedirect(
  location: Location
): [typeof MOVED_PERMANENTLY_STATUS | typeof FOUND_STATUS, string] | null {
  const { action } = location

  if (action) {
    if (action === PermanentReplaceHistoryAction) {
      return [MOVED_PERMANENTLY_STATUS, location.href]
    }

    return [FOUND_STATUS, location.href]
  }

  return null
}

export function responseStatus(
  location: Location,
  page: PageRef<unknown> | null
): [ResponseStatusCode, string | null] {
  const redirect = responseRedirect(location)

  if (redirect) {
    return redirect
  }

  return [
    page
      ? (page.statusCode as ResponseStatusCode) ?? SUCCESS_STATUS
      : NOT_FOUND_STATUS,
    null
  ]
}
