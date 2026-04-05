import {
  type HeadDescriptor,
  type Location,
  type PageRef,
  PermanentReplaceHistoryAction
} from '@nano_kit/router'
import {
  type EmptyValue,
  get,
  isEmpty
} from '@nano_kit/store'
import {
  FOUND_STATUS,
  MOVED_PERMANENTLY_STATUS,
  NOT_FOUND_STATUS,
  SUCCESS_STATUS
} from './constants.js'

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
          html += ` ${key.toLowerCase()}="${String(resolvedValue).replace(/"/g, '\\"')}"`
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
): [number, string] | null {
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
): [number, string | null] {
  const redirect = responseRedirect(location)

  if (redirect) {
    return redirect
  }

  return [
    page
      ? page.statusCode ?? SUCCESS_STATUS
      : NOT_FOUND_STATUS,
    null
  ]
}
