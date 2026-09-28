import {
  client,
  dedupeTime,
  infinites,
  mutations,
  hydratable
} from '@nano_kit/query'

export function Client$() {
  return client(
    dedupeTime(5 * 60 * 1000),
    infinites(),
    mutations(),
    hydratable()
  )
}
