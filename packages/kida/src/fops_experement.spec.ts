import {
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  type Accessor,
  signal,
  computed,
  effect
} from 'agera'
import type { Signalish } from './types.js'
import {
  or,
  some,
  and,
  every,
  not,
  is,
  isNot,
  gt,
  gte,
  lt,
  lte,
  when,
  pick,
  f
} from './fops_experement.js'

describe('kida', () => {
  describe('fops_experement', () => {
    describe('static operands', () => {
      it('should return the plain result when there is no accessor among the operands', () => {
        expect(or(0, 'b')).toBe('b')
        expect(some(0, '', 'c')).toBe('c')
        expect(and(1, 'b')).toBe('b')
        expect(every(1, 'b', 0)).toBe(0)
        expect(not(0)).toBe(true)
        expect(is('a', 'a')).toBe(true)
        expect(isNot('a', 'a')).toBe(false)
        expect(gt(2, 1)).toBe(true)
        expect(gte(1, 1)).toBe(true)
        expect(lt(2, 1)).toBe(false)
        expect(lte(1, 1)).toBe(true)
        expect(when(true, 'then', 'otherwise')).toBe('then')
        expect(when(false, 'then')).toBeUndefined()
      })

      it('should type the plain result', () => {
        expectTypeOf(not(0)).toEqualTypeOf<boolean>()
        expectTypeOf(gt(2, 1)).toEqualTypeOf<boolean>()
        expectTypeOf(when(true, 'then', 1)).toEqualTypeOf<string | number | undefined>()
      })
    })

    describe('accessors among the operands', () => {
      it('should return an accessor that follows them', () => {
        const $a = signal(0)
        const $b = signal(2)
        const $or = or($a, 'fallback')
        const $and = and($a, $b)
        const $some = some($a, 0, $b)
        const $every = every($a, $b)
        const $not = not($a)
        const $is = is($a, 0)
        const $isNot = isNot($a, 0)
        const $gt = gt($b, $a)
        const $gte = gte($a, 1)
        const $lt = lt($a, $b)
        const $lte = lte($a, 0)
        const $when = when($a, 'on', 'off')

        expect([
          $or(),
          $and(),
          $some(),
          $every(),
          $not(),
          $is(),
          $isNot(),
          $gt(),
          $gte(),
          $lt(),
          $lte(),
          $when()
        ]).toEqual([
          'fallback',
          0,
          2,
          0,
          true,
          true,
          false,
          true,
          false,
          true,
          true,
          'off'
        ])

        $a(1)

        expect([
          $or(),
          $and(),
          $some(),
          $every(),
          $not(),
          $is(),
          $isNot(),
          $gt(),
          $gte(),
          $lt(),
          $lte(),
          $when()
        ]).toEqual([
          1,
          2,
          1,
          2,
          false,
          false,
          true,
          true,
          true,
          true,
          false,
          'on'
        ])
      })

      it('should type an accessor, and either for an operand that may be both', () => {
        const $flag = signal(true)
        const maybe = (variant: Signalish<string>) => is(variant, 'primary')

        expectTypeOf(not($flag)).toEqualTypeOf<Accessor<boolean>>()
        expectTypeOf(when($flag, 'on')).toEqualTypeOf<Accessor<'on' | undefined>>()
        expectTypeOf(maybe('primary')).toEqualTypeOf<Signalish<boolean>>()
        expect(maybe('primary')).toBe(true)
        expect((maybe(() => 'secondary') as Accessor<boolean>)()).toBe(false)
      })

      it('should be tracked by an effect', () => {
        const $flag = signal(false)
        const $label = when($flag, 'on', 'off')
        const seen: unknown[] = []
        const stop = effect(() => {
          seen.push($label())
        })

        $flag(true)

        expect(seen).toEqual(['off', 'on'])

        stop()
      })
    })

    describe('pick', () => {
      const styles = {
        primary: 'button_primary',
        secondary: 'button_secondary'
      }

      it('should return the value at a static key', () => {
        const value = pick(styles, 'primary')

        expectTypeOf(value).toEqualTypeOf<string>()
        expect(value).toBe('button_primary')
      })

      it('should follow an accessor key', () => {
        const $variant = signal<'primary' | 'secondary'>('primary')
        const $class = pick(styles, $variant)

        expectTypeOf($class).toEqualTypeOf<Accessor<string>>()
        expect($class()).toBe('button_primary')

        $variant('secondary')

        expect($class()).toBe('button_secondary')
      })

      it('should follow an accessor collection and index', () => {
        const $list = signal(['a', 'b'])
        const $item = pick($list, 1)

        expect($item()).toBe('b')

        $list(['a', 'c'])

        expect($item()).toBe('c')
      })

      it('should return undefined for an empty key', () => {
        const variant: 'primary' | undefined = undefined

        expect(pick(styles, variant)).toBeUndefined()
      })
    })

    describe('f', () => {
      it('should return a string when there are no accessors among the values', () => {
        const text = f`a${1}b${'c'}d${true}`

        expectTypeOf(text).toEqualTypeOf<string>()
        expect(text).toBe('a1bcdtrue')
        expect(f`plain text`).toBe('plain text')
      })

      it('should return an accessor that follows the accessors among the values', () => {
        const $spriteUrl = signal('/sprite.svg')
        const $name = computed(() => 'close')
        const $href = f`${$spriteUrl}#${$name}`

        expectTypeOf($href).toEqualTypeOf<Accessor<string>>()
        expect($href()).toBe('/sprite.svg#close')

        $spriteUrl('/icons.svg')

        expect($href()).toBe('/icons.svg#close')
      })

      it('should return either for a value that may be both', () => {
        const label = (value: Signalish<string>) => f`Toggle ${value}`
        const text = label('menu')
        const $text = label(signal('menu'))

        expectTypeOf(text).toEqualTypeOf<Signalish<string>>()
        expect(text).toBe('Toggle menu')
        expect(($text as Accessor<string>)()).toBe('Toggle menu')
      })

      it('should add nothing for an empty value', () => {
        const $label = signal<string | null | undefined>(null)
        const $text = f`Toggle ${$label}${undefined}!`

        expect($text()).toBe('Toggle !')

        $label('menu')

        expect($text()).toBe('Toggle menu!')
      })
    })
  })
})
