import {
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
