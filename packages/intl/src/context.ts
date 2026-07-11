import {
  type Accessor,
  type ReadableSignal,
  type EmptyValue,
  type AnySignal,
  isFunction,
  signal,
  computed
} from '@nano_kit/store'
import type {
  TranslationData,
  Loader,
  MessagesScheme,
  Messages,
  AnyNamespaceTranslationData,
  AnyTranslationData,
  MessagesAccessor
} from './types.js'

type AnySignalRecord = AnySignal & Record<string, unknown>

const proxyHandler: ProxyHandler<AnySignalRecord> = {
  /* oxlint-disable */
  get($signal, key: string, receiver) {
    if (!(key in $signal)) {
      if (key[0] === '$') {
        const prop = key.slice(1)

        return $signal[key] = computed(() => $signal()[prop])
      } else if (typeof key === 'string') {
        const $prop = receiver[`$${key}`]

        return $signal[key] = (params: unknown) => computed(
          () => $prop()(params)
        )
      }
    }

    return $signal[key]
  }
  /* oxlint-enable */
}

/**
 * Runtime context used by message formats.
 *
 * It owns the active locale, loads translation data, and exposes messages helpers
 * that bind a messages scheme to the current namespace data.
 * @template T - Translation data shape keyed by namespace name.
 */
export class IntlContext<
  L extends string,
  T extends TranslationData<T> = AnyTranslationData
> {
  readonly #loader: Loader<T>
  /**
   * Active locale accessor.
   */
  readonly $locale: Accessor<L>
  /**
   * Loading state for full-data loaders.
   */
  readonly $loading: ReadableSignal<boolean>
  /**
   * Loading error for full-data loaders.
   */
  readonly $error: ReadableSignal<unknown>

  /**
   * Creates an internationalization context.
   * @param $locale - Active locale accessor.
   * @param loader - Messages loader bound to the active locale.
   */
  constructor(
    $locale: Accessor<L>,
    loader: Loader<T>
  ) {
    this.$locale = $locale
    this.#loader = loader

    if (isFunction(loader)) {
      this.$loading = signal(false)
      this.$error = signal(undefined)
    } else {
      [, this.$error, this.$loading] = loader
    }
  }

  /**
   * Creates reactive messages for a single namespace.
   * @param namespace - Namespace key to read from loaded translation data.
   * @param scheme - Messages scheme compatible with the namespace data shape.
   * @returns A tuple with formatted messages, pending state, and loading error.
   */
  messages<K extends keyof T, S extends MessagesScheme<T[K]> = {}>(
    namespace: K,
    scheme: S = {} as S
  ) {
    const entries = Object.entries(scheme)
    const loaderResult = this.#loader
    let $data: ReadableSignal<T[K] | EmptyValue>
    let $error: ReadableSignal<unknown>
    let $pending: ReadableSignal<boolean>

    if (isFunction(loaderResult)) {
      [$data, $error, $pending] = loaderResult(namespace, entries)
    } else {
      let $translations

      [$translations, $error, $pending] = loaderResult

      $data = computed(() => $translations()?.[namespace])
    }

    const $messages = computed(() => {
      const data: AnyNamespaceTranslationData | EmptyValue = $data()
      let result: Record<string, unknown> = data ?? {}

      if (entries.length > 0) {
        result = {
          ...result
        }

        for (const [key, format] of entries) {
          result[key] = format(this, data?.[key])
        }
      }

      return result as Messages<T[K], S>
    })

    return [
      new Proxy($messages as AnySignalRecord, proxyHandler) as MessagesAccessor<T[K], S>,
      $pending,
      $error
    ] as const
  }
}
