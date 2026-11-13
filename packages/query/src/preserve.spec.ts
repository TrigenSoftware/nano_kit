import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  effect,
  signal,
  waitTasks
} from '@nano_kit/store'
import { queryKey } from './cache.js'
import { client } from './client.js'
import { required } from './queries/base.js'
import { preserve } from './preserve.js'

const PlantsKey = queryKey<[gardenId: string, query: string], string[]>('plants')
const gardens: Record<string, string[]> = {
  a: ['rose', 'tulip', 'zinnia'],
  b: ['fern']
}

// oxlint-disable-next-line typescript/require-await
async function findPlants(gardenId: string, query: string) {
  if (query === '!') {
    throw new Error('Bad query')
  }

  return gardens[gardenId].filter(plant => plant.includes(query))
}

function setup() {
  const { query, invalidate } = client()
  const $gardenId = signal<string | undefined>('a')
  const $query = signal('')
  const [$data, $error, , $key] = query(PlantsKey, [required($gardenId), $query], findPlants)

  return {
    invalidate,
    $gardenId,
    $query,
    $data,
    $error,
    $key
  }
}

describe('query', () => {
  describe('preserve', () => {
    it('should preserve the data and the key of the previous key while the current one loads', async () => {
      const { $query, $data, $key } = setup()
      const [$plants, $plantsKey, $preserved] = preserve($data, $key)
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)

      const prevKey = $key()

      $query('z')

      expect($plants()).toEqual(['rose', 'tulip', 'zinnia'])
      expect($plantsKey()).toBe(prevKey)
      expect($preserved()).toBe(true)

      off()
    })

    it('should show the data and the key of the current key once its data comes', async () => {
      const { $query, $data, $key } = setup()
      const [$plants, $plantsKey, $preserved] = preserve($data, $key)
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)
      $query('z')
      await waitTasks($data)

      expect($plants()).toEqual(['zinnia'])
      expect($plantsKey()).toBe($key())
      expect($preserved()).toBe(false)

      off()
    })

    it('should not preserve without data to preserve', () => {
      const { $query, $data, $key } = setup()
      const [$plants, $plantsKey, $preserved] = preserve($data, $key)
      const off = effect(() => {
        $plants()
      })

      $query('z')

      expect($plants()).toBe(null)
      expect($plantsKey()).toBe($key())
      expect($preserved()).toBe(false)

      off()
    })

    it('should not preserve the data of the shown key when it is invalidated', async () => {
      const { invalidate, $data, $key } = setup()
      const [$plants, , $preserved] = preserve($data, $key)
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)
      invalidate(PlantsKey)

      expect($plants()).toBe(null)
      expect($preserved()).toBe(false)

      off()
    })

    it('should pass the current parameters and the parameters of the preserved data to the predicate', async () => {
      const { $query, $data, $key } = setup()
      const keep = vi.fn(() => true)
      const [$plants] = preserve($data, $key, keep)
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)
      $query('z')
      $query('zi')

      expect(keep).toHaveBeenLastCalledWith(['a', 'zi'], ['a', ''])

      off()
    })

    it('should give the predicate missing parameters while the query is skipped', async () => {
      const { $gardenId, $data, $key } = setup()
      const keep = vi.fn(() => true)
      const [$plants] = preserve($data, $key, keep)
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)
      $gardenId(undefined)

      expect(keep).toHaveBeenLastCalledWith([], ['a', ''])

      off()
    })

    it('should not preserve the data that the predicate rejects', async () => {
      const { $gardenId, $data, $key } = setup()
      const [$plants, $plantsKey, $preserved] = preserve(
        $data,
        $key,
        ([gardenId], [preservedGardenId]) => gardenId === preservedGardenId
      )
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)
      $gardenId('b')

      expect($plants()).toBe(null)
      expect($plantsKey()).toBe($key())
      expect($preserved()).toBe(false)

      off()
    })

    it('should drop the preserved data once the predicate rejects it', async () => {
      const { $query, $data, $error, $key } = setup()
      const [$plants, $plantsKey, $preserved] = preserve($data, $key, () => !$error())
      const off = effect(() => {
        $plants()
      })

      await waitTasks($data)
      $query('!')
      await waitTasks($data)

      expect($error()).not.toBe(null)
      expect($plants()).toBe(null)
      expect($plantsKey()).toBe($key())
      expect($preserved()).toBe(false)

      off()
    })
  })
})
