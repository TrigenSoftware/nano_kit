import {
  vi,
  describe,
  expect,
  it
} from 'vitest'
import {
  resolved,
  signal
} from '@nano_kit/store'
import type { NamespaceLoader } from './types.js'
import { IntlContext } from './context.js'
import { format } from './format/format.js'
import { number } from './format/number.js'
import { params } from './format/params.js'
import { text } from './format/text.js'

interface Translations {
  user: {
    title: string
    greeting: string
  }
  settings: {
    title: string
  }
  stats: {
    count: number
  }
}

const staticTranslations = {
  user: {
    title: 'Profile',
    greeting: 'Hello, {name}!'
  },
  settings: {
    title: 'Settings'
  },
  stats: {
    count: 1234.5
  }
} satisfies Translations
const localeTranslations = {
  'en-US': staticTranslations,
  'de-DE': {
    user: {
      title: 'Profil',
      greeting: 'Hallo, {name}!'
    },
    settings: {
      title: 'Einstellungen'
    },
    stats: {
      count: 1234.5
    }
  }
}

describe('intl', () => {
  describe('context', () => {
    describe('loader', () => {
      it('should expose static full data loader state', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )

        expect(ctx.$loading()).toBe(false)
        expect(ctx.$error()).toBeUndefined()
      })

      it('should resolve async full data loader state', async () => {
        const {
          promise,
          resolve
        } = Promise.withResolvers<Translations>()
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(promise)
        )

        expect(ctx.$loading()).toBe(true)
        expect(ctx.$error()).toBeUndefined()

        resolve(staticTranslations)
        await promise

        expect(ctx.$loading()).toBe(false)
        expect(ctx.$error()).toBeUndefined()
      })

      it('should expose rejected full data loader errors', async () => {
        const error = new Error('translations failed')
        const {
          promise,
          reject
        } = Promise.withResolvers<Translations>()
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(promise)
        )

        expect(ctx.$loading()).toBe(true)
        expect(ctx.$error()).toBeUndefined()

        reject(error)
        await promise.catch(() => {})

        expect(ctx.$loading()).toBe(false)
        expect(ctx.$error()).toBe(error)
      })

      it('should keep global loader state settled for namespace loaders', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          (namespace => resolved(staticTranslations[namespace])) as NamespaceLoader<Translations>
        )

        expect(ctx.$loading()).toBe(false)
        expect(ctx.$error()).toBeUndefined()
      })

      it('should resolve async namespace loader state', async () => {
        const {
          promise,
          resolve
        } = Promise.withResolvers<Translations['user']>()
        const namespaceData: {
          [K in keyof Translations]: Translations[K] | Promise<Translations[K]>
        } = {
          user: promise,
          settings: staticTranslations.settings,
          stats: staticTranslations.stats
        }
        const ctx = new IntlContext(
          () => 'en-US',
          (namespace => resolved(namespaceData[namespace])) as NamespaceLoader<Translations>
        )
        const [$t, $pending, $error] = ctx.messages('user', {
          title: text()
        })

        expect(ctx.$loading()).toBe(false)
        expect(ctx.$error()).toBeUndefined()
        expect($pending()).toBe(true)
        expect($error()).toBeUndefined()
        expect($t().title).toBeUndefined()

        resolve(staticTranslations.user)
        await promise

        expect(ctx.$loading()).toBe(false)
        expect(ctx.$error()).toBeUndefined()
        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Profile')
      })

      it('should react to locale changes in full data loader', () => {
        const $locale = signal<keyof typeof localeTranslations>('en-US')
        const ctx = new IntlContext(
          $locale,
          resolved(() => localeTranslations[$locale()])
        )
        const [$t] = ctx.messages('user', {
          title: text()
        })

        expect($t().title).toBe('Profile')

        $locale('de-DE')

        expect($t().title).toBe('Profil')
      })

      it('should use the given locale until the first translations load', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(Promise.withResolvers<Translations>().promise)
        )

        expect(ctx.$locale()).toBe('en-US')
      })

      it('should show cached translations read first while they revalidate', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          [signal(localeTranslations['en-US']), signal(undefined), signal(true)] as const
        )
        const [$t] = ctx.messages('user', {
          title: text()
        })

        expect($t().title).toBe('Profile')
      })

      it('should keep the previous locale and translations while the next locale loads', () => {
        const $locale = signal<keyof typeof localeTranslations>('en-US')
        const $data = signal<Translations | null>(localeTranslations['en-US'])
        const $loading = signal(false)
        const ctx = new IntlContext(
          $locale,
          [$data, signal(undefined), $loading] as const
        )
        const [$user] = ctx.messages('user', {
          title: text()
        })
        const [$stats] = ctx.messages('stats', {
          count: number()
        })

        expect($user().title).toBe('Profile')
        expect($stats().count).toBe('1,234.5')

        $locale('de-DE')
        $data(null)
        $loading(true)

        expect(ctx.$locale()).toBe('en-US')
        expect($user().title).toBe('Profile')
        expect($stats().count).toBe('1,234.5')

        $data(localeTranslations['de-DE'])
        $loading(false)

        expect(ctx.$locale()).toBe('de-DE')
        expect($user().title).toBe('Profil')
        expect($stats().count).toBe('1.234,5')
      })

      it('should keep the previous locale while stale translations of the next one are pending', async () => {
        const {
          promise,
          resolve
        } = Promise.withResolvers<Translations>()
        const $locale = signal<keyof typeof localeTranslations>('en-US')
        const ctx = new IntlContext(
          $locale,
          resolved(() => ($locale() === 'en-US' ? localeTranslations['en-US'] : promise))
        )
        const [$t] = ctx.messages('stats', {
          count: number()
        })

        expect($t().count).toBe('1,234.5')

        $locale('de-DE')

        expect(ctx.$loading()).toBe(true)
        expect($t().count).toBe('1,234.5')

        resolve(localeTranslations['de-DE'])
        await promise

        expect(ctx.$locale()).toBe('de-DE')
        expect($t().count).toBe('1.234,5')
      })

      it('should keep the previous locale when the next one fails to load', () => {
        const $locale = signal<keyof typeof localeTranslations>('en-US')
        const $data = signal<Translations | null>(localeTranslations['en-US'])
        const $error = signal<unknown>(undefined)
        const ctx = new IntlContext(
          $locale,
          [$data, $error, signal(false)] as const
        )
        const [$t] = ctx.messages('user', {
          title: text()
        })

        expect($t().title).toBe('Profile')

        $locale('de-DE')
        $data(null)
        $error(new Error('translations failed'))

        expect(ctx.$locale()).toBe('en-US')
        expect($t().title).toBe('Profile')
      })
    })

    describe('messages', () => {
      it('should create formatted messages from static full data loader', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t, $pending, $error] = ctx.messages('user', {
          title: text(),
          greeting: params({
            name: text()
          })
        })

        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Profile')
        expect($t().greeting({
          name: 'Ada'
        })).toBe('Hello, Ada!')
      })

      it('should create fallback messages from missing values', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t, $pending, $error] = ctx.messages('settings', {
          title: text('Fallback'),
          missing: text('Missing')
        })

        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Settings')
        expect($t().missing).toBe('Missing')
      })

      it('should warn about a missing message', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t] = ctx.messages('settings', {
          missing: text('Missing')
        })

        expect($t().missing).toBe('Missing')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('"settings.missing"'))
        warn.mockRestore()
      })

      it('should not warn about a formatter message', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t] = ctx.messages('settings', {
          number: format(number())
        })

        expect($t().number(1234.5)).toBe('1,234.5')
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
      })

      it('should expose raw messages from partial scheme', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t, $pending, $error] = ctx.messages('user', {
          greeting: params({
            name: text()
          })
        })

        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Profile')
        expect($t.$title()).toBe('Profile')
        expect($t().greeting({
          name: 'Ada'
        })).toBe('Hello, Ada!')
        expect($t.greeting({
          name: 'Ada'
        })()).toBe('Hello, Ada!')
      })

      it('should expose raw messages from empty scheme', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t, $pending, $error] = ctx.messages('settings')

        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Settings')
        expect($t.$title()).toBe('Settings')
      })

      it('should create computed messages without translation values', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t, $pending, $error] = ctx.messages('settings', {
          title: text(),
          number: format(number())
        })

        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Settings')
        expect($t().number(1234.5)).toBe('1,234.5')
      })

      it('should create formatted messages from static namespace loader', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          (namespace => resolved(staticTranslations[namespace])) as NamespaceLoader<Translations>
        )
        const [$t, $pending, $error] = ctx.messages('user', {
          title: text()
        })

        expect($pending()).toBe(false)
        expect($error()).toBeUndefined()
        expect($t().title).toBe('Profile')
      })

      it('should expose signal props and param shortcuts', () => {
        const $locale = signal<keyof typeof localeTranslations>('en-US')
        const ctx = new IntlContext(
          $locale,
          resolved(() => localeTranslations[$locale()])
        )
        const [$t] = ctx.messages('user', {
          title: text(),
          greeting: params({
            name: text()
          })
        })

        expect($t.$title()).toBe('Profile')
        expect($t.greeting({
          name: 'Ada'
        })()).toBe('Hello, Ada!')

        $locale('de-DE')

        expect($t.$title()).toBe('Profil')
        expect($t.greeting({
          name: 'Ada'
        })()).toBe('Hallo, Ada!')
      })

      it('should subscribe a param shortcut of a formatter message to a signal', () => {
        const ctx = new IntlContext(
          () => 'en-US',
          resolved(staticTranslations)
        )
        const [$t] = ctx.messages('settings', {
          number: format(number())
        })
        const $value = signal(1234.5)
        const $number = $t.number($value)

        expect($number()).toBe('1,234.5')

        $value(42)

        expect($number()).toBe('42')
      })

      it('should react to locale changes in message formats', () => {
        const $locale = signal('en-US')
        const ctx = new IntlContext(
          $locale,
          resolved(staticTranslations)
        )
        const [$t] = ctx.messages('stats', {
          count: number()
        })

        expect($t().count).toBe('1,234.5')

        $locale('de-DE')

        expect($t().count).toBe('1.234,5')
      })
    })
  })
})
