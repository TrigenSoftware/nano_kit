import {
  client,
  dedupeTime,
  mutations
} from '@nano_kit/query'

const DEDUPE_TIME = 300_000 // 5 minutes

export const {
  query,
  mutation,
  $data
} = client(
  dedupeTime(DEDUPE_TIME),
  mutations()
)
