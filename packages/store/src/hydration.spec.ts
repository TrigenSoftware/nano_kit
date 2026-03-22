import {
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  mountable,
  InjectionContext,
  run,
  inject,
  provide,
  onMount
} from 'kida'
import { TasksRunner$ } from './tasks.js'
import {
  Hydrator$,
  hydratable,
  dehydrate,
  isHydrated,
  hydrator,
  activeHydrator
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

    it('should hydrate', () => {
      const dehydrated = Object.entries({
        user: {
          name: 'John'
        }
      })
      const context = new InjectionContext([
        provide(Hydrator$, hydrator(dehydrated))
      ])
      const { $user } = run(context, () => inject(User$))

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
        provide(Hydrator$, hydrator(dehydrated))
      ])
      const { $user } = run(context, () => inject(User$))

      expect(isHydrated($user)).toBe(true)

      $user({
        name: 'Jane'
      })

      expect(isHydrated($user)).toBe(false)
    })

    it('should re-hydrate when snapshot signal changes with activeHydrator', () => {
      const $snapshot = signal<[string, unknown][]>(Object.entries({
        user: {
          name: 'John'
        }
      }))
      const context = new InjectionContext([
        provide(Hydrator$, activeHydrator($snapshot))
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

      $snapshot(Object.entries({
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
