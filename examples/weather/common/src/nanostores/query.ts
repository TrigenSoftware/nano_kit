import { nanoquery } from '@nanostores/query'

const DEDUPE_TIME = 60_000 // 1 minute

export const [createFetcherStore] = nanoquery({
  dedupeTime: DEDUPE_TIME
})
