import {
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  type Value,
  value
} from './value.js'

interface Settings {
  theme: string
  tags: string[]
}

function createSettings() {
  return value<Settings>({
    theme: 'light',
    tags: ['new']
  })
}

describe('testing', () => {
  describe('value', () => {
    describe('value', () => {
      it('should hold the initial value', () => {
        expect(value<string | null>(null).get()).toBeNull()
      })

      it('should hold nothing without an initial value', () => {
        expect(value<string>().get()).toBeUndefined()
      })

      it('should be typed as maybe undefined without an initial value', () => {
        expectTypeOf(value<string>()).toEqualTypeOf<Value<string | undefined>>()
      })

      it('should be typed as the given type with an initial value', () => {
        expectTypeOf(value<string>('user-1')).toEqualTypeOf<Value<string>>()
      })

      it('should leave the initial value as it was', () => {
        const initial = {
          theme: 'light',
          tags: ['new']
        }

        value<Settings>(initial).get()

        expect(Object.isFrozen(initial)).toBe(false)
      })
    })

    describe('get', () => {
      it('should return a read-only value', () => {
        const settings = createSettings().get()

        expect(() => {
          // @ts-expect-error a value is read-only
          settings.theme = 'dark'
        }).toThrow(TypeError)
        expect(() => settings.tags.push('old')).toThrow(TypeError)
      })

      it('should return the type of the value', () => {
        expectTypeOf(value<string | null>(null).get()).toEqualTypeOf<string | null>()
        expectTypeOf(createSettings().get()).toEqualTypeOf<Readonly<Settings>>()
        expectTypeOf(value<Settings[]>([]).get()).toEqualTypeOf<readonly Readonly<Settings>[]>()
      })

      it('should return a read-only array', () => {
        const tags = value<string[]>(['new']).get()

        expect(() => {
          // @ts-expect-error the array is read-only
          tags.push('old')
        }).toThrow(TypeError)
      })
    })

    describe('set', () => {
      it('should replace the value', () => {
        const session = value<string | null>(null)

        session.set('user-1')

        expect(session.get()).toBe('user-1')
      })

      it('should copy the given value', () => {
        const settings = createSettings()
        const given = {
          theme: 'dark',
          tags: ['old']
        }

        settings.set(given)
        given.tags.push('new')

        expect(settings.get().tags).toEqual(['old'])
      })

      it('should return the value holder', () => {
        const session = value<string | null>()

        expect(session.set('user-1')).toBe(session)
      })
    })

    describe('fork', () => {
      it('should copy the value', () => {
        const session = value<string | null>('user-1')

        expect(session.fork().get()).toBe('user-1')
      })

      it('should share no changes with the value it was made of', () => {
        const session = value<string | null>(null)

        session.fork().set('user-1')

        expect(session.get()).toBeNull()
      })
    })

    describe('reset', () => {
      it('should bring back the value it was made with', () => {
        const session = value<string | null>(null)

        session.set('user-1').reset()

        expect(session.get()).toBeNull()
      })

      it('should bring a fork back to the value it was forked with', () => {
        const fork = value<string | null>('user-1').fork()

        fork.set(null).reset()

        expect(fork.get()).toBe('user-1')
      })

      it('should return the value holder', () => {
        const session = value<string | null>()

        expect(session.reset()).toBe(session)
      })
    })
  })
})
