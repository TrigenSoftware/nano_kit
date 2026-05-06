import {
  client,
  dedupeTime
} from '@nano_kit/query'

const DEDUPE_TIME = 60_000 // 1 minute

export function QueryClient$() {
  return client(
    dedupeTime(DEDUPE_TIME)
  )
}
