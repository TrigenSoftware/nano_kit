import { vi } from 'vitest'

export const mockNavigation = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  pathname: '/',
  search: '',
  reset() {
    this.push.mockReset()
    this.replace.mockReset()
    this.back.mockReset()
    this.forward.mockReset()
    this.pathname = '/'
    this.search = ''
  }
}

export const RedirectType = {
  push: 'push',
  replace: 'replace'
}

export const mockNavigationModule = {
  useRouter: () => mockNavigation,
  usePathname: () => mockNavigation.pathname,
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
  redirect: vi.fn(),
  RedirectType
}

export const mockAsyncStorage = {
  url: {
    pathname: '/',
    search: ''
  },
  getStore: () => ({
    url: mockAsyncStorage.url
  }),
  reset() {
    mockAsyncStorage.url.pathname = '/'
    mockAsyncStorage.url.search = ''
  }
}

export const mockEntryBaseModule = {
  workUnitAsyncStorage: mockAsyncStorage
}
