import {
  client,
  dedupeTime
} from '@nano_kit/query'

export interface Page<T> {
  items: T[]
  totalPages: number
}

const DEDUPE_TIME = 3000_000 // 5 minutes

export const { query } = client(
  dedupeTime(DEDUPE_TIME)
)
