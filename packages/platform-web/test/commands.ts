import type { BrowserCommand } from 'vitest/node'

declare module 'vitest/browser' {
  interface BrowserCommands {
    clearPermissions(): Promise<void>
    grantPermissions(permissions: string[]): Promise<void>
    setLocalStorage(key: string, value: string): Promise<void>
    setGeolocation(latitude: number, longitude: number): Promise<void>
    setSessionStorage(key: string, value: string): Promise<void>
  }
}

export const clearPermissions: BrowserCommand = async ({ context }) => {
  await context.clearPermissions()
}

export const grantPermissions: BrowserCommand<[string[]]> = async (
  { context },
  permissions
) => {
  await context.grantPermissions(permissions)
}

export const setLocalStorage: BrowserCommand<[string, string]> = async (
  { frame },
  key,
  value
) => {
  await (await frame()).evaluate(([nextKey, nextValue]) => {
    const iframe = document.createElement('iframe')

    document.body.append(iframe)
    iframe.contentWindow!.localStorage[nextKey] = nextValue
    iframe.remove()
  }, [key, value])
}

export const setGeolocation: BrowserCommand<[number, number]> = async (
  { context },
  latitude,
  longitude
) => {
  await context.setGeolocation({
    latitude,
    longitude
  })
}

export const setSessionStorage: BrowserCommand<[string, string]> = async (
  { frame },
  key,
  value
) => {
  await (await frame()).evaluate(([nextKey, nextValue]) => {
    const iframe = document.createElement('iframe')

    document.body.append(iframe)
    iframe.contentWindow!.sessionStorage[nextKey] = nextValue
    iframe.remove()
  }, [key, value])
}
