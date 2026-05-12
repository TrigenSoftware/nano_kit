import { vi } from 'vitest'
import {
  resetPage,
  setPageUrl
} from './app-state.js'

interface GotoOptions {
  replaceState?: boolean
}

type AfterNavigateCallback = () => void

const afterNavigateCallbacks = new Set<AfterNavigateCallback>()

export const goto = vi.fn(async (
  _url: string | URL,
  _options?: GotoOptions
) => undefined)

export function afterNavigate(callback: AfterNavigateCallback) {
  afterNavigateCallbacks.add(callback)

  return () => {
    afterNavigateCallbacks.delete(callback)
  }
}

export function resetNavigation() {
  goto.mockReset()
  afterNavigateCallbacks.clear()
  resetPage()
}

export function triggerAfterNavigate(url?: string | URL) {
  if (url) {
    setPageUrl(url)
  }

  for (const callback of afterNavigateCallbacks) {
    callback()
  }
}
