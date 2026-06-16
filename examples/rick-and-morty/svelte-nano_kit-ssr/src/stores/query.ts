import {
  client,
  dedupeTime,
  ssr
} from '@nano_kit/query'

export interface Page<T> {
  items: T[]
  totalPages: number
}

const DEDUPE_TIME = 300_000 // 5 minutes

export function Client$() {
  return client(
    dedupeTime(DEDUPE_TIME),
    ssr()
  )
}
