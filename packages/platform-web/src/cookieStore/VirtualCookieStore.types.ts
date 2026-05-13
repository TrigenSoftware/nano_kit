export interface VirtualCookieInit extends CookieInit {
  maxAge?: number | null
  secure?: boolean
}

export interface VirtualCookieListItem extends CookieListItem {
  domain?: string | null
  expires?: number | null
  partitioned?: boolean
  path?: string
  sameSite?: CookieSameSite
  secure?: boolean
}

export interface CookieEntry {
  knownScope: boolean
  name: string
  value: string
  domain: string | null
  expires: number | null
  maxAge: number | null
  partitioned: boolean
  path: string | null
  sameSite?: CookieSameSite
  secure: boolean
}
