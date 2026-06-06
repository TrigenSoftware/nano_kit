import {
  describe,
  it,
  expect
} from 'vitest'
import {
  InjectionContext,
  signal,
  mountable,
  run,
  inject,
  provide,
  onMount
} from 'kida'
import { TasksRunner$ } from './tasks.js'
import { JsonCodec } from './codec.js'
import {
  Hydrator$,
  StaticHydrator,
  ActiveHydrator,
  hydratable,
  dehydrate,
  isHydrated
} from './hydration.js'

interface User {
  name: string
}

function User$() {
  const userTask = inject(TasksRunner$)
  const $user = hydratable('user', mountable(signal<User | null>(null)))

  onMount($user, () => {
    userTask(async () => {
      await Promise.resolve()

      $user({
        name: 'John'
      })
    })
  })

  return {
    $user
  }
}

describe('store', () => {
  describe('hydration', () => {
    it('should dehydrate', async () => {
      const dehydrated = await dehydrate(() => {
        const { $user } = inject(User$)

        return [$user]
      })

      expect(dehydrated).toEqual([
        [
          'user',
          {
            name: 'John'
          }
        ]
      ])
    })

    it('should dehydrate with codec', async () => {
      const dehydrated = await dehydrate(() => {
        const $user = hydratable(
          'user',
          signal<User>({
            name: 'John'
          }),
          JsonCodec
        )

        return [$user]
      })

      expect(dehydrated).toEqual([
        [
          'user',
          '{"name":"John"}'
        ]
      ])
    })

    it('should hydrate', () => {
      const dehydrated = Object.entries({
        user: {
          name: 'John'
        }
      })
      const context = new InjectionContext([
        provide(Hydrator$, new StaticHydrator(dehydrated))
      ])
      const { $user } = run(context, () => inject(User$))

      expect($user()).toEqual({
        name: 'John'
      })
    })

    it('should hydrate with codec', () => {
      const dehydrated = Object.entries({
        user: '{"name":"John"}'
      })
      const context = new InjectionContext([
        provide(Hydrator$, new StaticHydrator(dehydrated))
      ])
      const $user = run(context, () => hydratable(
        'user',
        signal<User | null>(null),
        JsonCodec
      ))

      expect($user()).toEqual({
        name: 'John'
      })
    })

    it('should check hydration status', () => {
      const dehydrated = Object.entries({
        user: {
          name: 'John'
        }
      })
      const context = new InjectionContext([
        provide(Hydrator$, new StaticHydrator(dehydrated))
      ])
      const { $user } = run(context, () => inject(User$))

      expect(isHydrated($user)).toBe(true)

      $user({
        name: 'Jane'
      })

      expect(isHydrated($user)).toBe(false)
    })

    it('should re-hydrate when snapshot signal changes with activeHydrator', () => {
      const hydrator = new ActiveHydrator()

      hydrator.push(Object.entries({
        user: {
          name: 'John'
        }
      }))

      const context = new InjectionContext([
        provide(Hydrator$, hydrator)
      ])
      const { $user } = run(context, () => inject(User$))

      expect($user()).toEqual({
        name: 'John'
      })
      expect(isHydrated($user)).toBe(true)

      $user({
        name: 'Stale'
      })

      expect(isHydrated($user)).toBe(false)

      hydrator.push(Object.entries({
        user: {
          name: 'Jane'
        }
      }))

      expect($user()).toEqual({
        name: 'Jane'
      })
      expect(isHydrated($user)).toBe(true)
    })
  })
})
