import {
  client,
  dedupeTime,
  persistence,
  ssr
} from '@nano_kit/query'
import { memoryStorage } from './memoryStorage'

export interface Page<T> {
  items: T[]
  totalPages: number
}

const DEDUPE_TIME = 3000_000 // 5 minutes
const storage = typeof window === 'undefined' ? memoryStorage() : null

export function Client$() {
  return client(
    dedupeTime(DEDUPE_TIME),
    ssr(),
    persistence(storage, Infinity)
  )
}
