import type {
  AnyAccessorOrSignal,
  AnySignal
} from 'agera'
import { child } from './child.js'
import { assignKey } from './utils.js'

export type AnyRecordStore = AnyAccessorOrSignal & Partial<Record<PropertyKey, AnySignal>>

export interface RecordStore {
  record?: AnyRecordStore
}

/* @__NO_SIDE_EFFECTS__ */
export function createProxyHandler(
  ext: ($signal: AnySignal) => AnySignal
): ProxyHandler<AnyRecordStore> {
  return {
    get($signal, key: string) {
      if (!(key in $signal) && key[0] === '$') {
        return $signal[key] = ext(child(
          $signal,
          key.slice(1),
          assignKey
        ))
      }

      return $signal[key]
    }
  }
}

/* @__NO_SIDE_EFFECTS__ */
export function recordBase(
  $source: AnyAccessorOrSignal & RecordStore,
  handler: ProxyHandler<AnyRecordStore>
): AnyRecordStore {
  let cached = $source.record

  if (!cached) {
    $source.record = cached = new Proxy($source as AnyRecordStore, handler)
  }

  return cached
}
