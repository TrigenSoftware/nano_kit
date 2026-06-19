import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  effect,
  signal,
  isSignal,
  computed,
  batch
} from 'agera'
import { record } from './record.js'
import {
  atIndex,
  updateArray
} from './array.js'

describe('kida', () => {
  describe('array', () => {
    it('should get item by index', () => {
      const $array = signal([
        1,
        2,
        3
      ])

      expect($array()).toEqual([
        1,
        2,
        3
      ])
      expect(atIndex($array, 0)).toSatisfy(isSignal)
      expect(atIndex($array, 1)).toSatisfy(isSignal)
      expect(atIndex($array, 2)).toSatisfy(isSignal)

      expect(atIndex($array, 0)()).toBe(1)
      expect(atIndex($array, 1)()).toBe(2)
      expect(atIndex($array, 2)()).toBe(3)
    })

    it('should update root by child', () => {
      const $array = signal([
        1,
        2,
        3
      ])

      expect(atIndex($array, 1)()).toBe(2)

      atIndex($array, 1)(4)

      expect(atIndex($array, 1)()).toBe(4)
      expect($array()).toEqual([
        1,
        4,
        3
      ])
    })

    it('should update root by child and notify listeners', () => {
      const $array = signal([
        1,
        2,
        3
      ])
      const rootListener = vi.fn()
      const childListener = vi.fn()
      const off = effect(() => {
        rootListener($array())
      })
      const offChild = effect(() => {
        childListener(atIndex($array, 1)())
      })

      expect(rootListener).toHaveBeenCalledTimes(1)
      expect(childListener).toHaveBeenCalledTimes(1)

      atIndex($array, 1)(4)

      expect(rootListener).toHaveBeenCalledTimes(2)
      expect(rootListener).toHaveBeenCalledWith([
        1,
        4,
        3
      ])
      expect(childListener).toHaveBeenCalledTimes(2)
      expect(childListener).toHaveBeenCalledWith(4)

      off()
      offChild()
    })

    it('should update child by root', () => {
      const $array = signal([
        1,
        2,
        3
      ])

      expect(atIndex($array, 1)()).toBe(2)

      updateArray($array, (array) => {
        array[1] = 4
      })

      expect(atIndex($array, 1)()).toBe(4)
    })

    it('should update child by root and notify listeners', () => {
      const $array = signal([
        1,
        2,
        3
      ])
      const rootListener = vi.fn()
      const childListener = vi.fn()
      const off = effect(() => {
        rootListener($array())
      })
      const offChild = effect(() => {
        childListener(atIndex($array, 1)())
      })

      expect(rootListener).toHaveBeenCalledTimes(1)
      expect(childListener).toHaveBeenCalledTimes(1)

      expect(atIndex($array, 1)()).toBe(2)

      updateArray($array, (array) => {
        array[1] = 4
      })

      expect(rootListener).toHaveBeenCalledTimes(2)
      expect(rootListener).toHaveBeenCalledWith([
        1,
        4,
        3
      ])
      expect(childListener).toHaveBeenCalledTimes(2)
      expect(childListener).toHaveBeenCalledWith(4)

      off()
      offChild()
    })

    it('should get item by dynamic index', () => {
      const $array = signal([
        1,
        2,
        3
      ])
      const $key = signal(1)
      const $item = atIndex($array, $key)

      expect($item()).toBe(2)

      $key(2)

      expect($item()).toBe(3)
    })

    it('should get item by index from computed store', () => {
      const $item = signal(2)
      const $array = computed(() => [
        1,
        $item(),
        3
      ])

      expect($array()).toEqual([
        1,
        2,
        3
      ])
      expect(atIndex($array, 1)()).toBe(2)

      $item(4)

      expect($array()).toEqual([
        1,
        4,
        3
      ])
      expect(atIndex($array, 1)()).toBe(4)
    })

    it('should be fitable for loop', () => {
      const $array = signal([
        'one',
        'two',
        'three'
      ])
      const $oneIndex = signal(0)
      const $twoIndex = signal(1)
      const $threeIndex = signal(2)
      const $one = atIndex($array, $oneIndex)
      const $two = atIndex($array, $twoIndex)
      const $three = atIndex($array, $threeIndex)
      const onArrayChange = vi.fn((v) => {
        batch(() => {
          $oneIndex(v.indexOf('one'))
          $twoIndex(v.indexOf('two'))
          $threeIndex(v.indexOf('three'))
        })
      })
      const onOneChange = vi.fn()
      const onTwoChange = vi.fn()
      const onThreeChange = vi.fn()
      const offList = effect((warmup) => {
        const v = $array()

        if (!warmup) {
          onArrayChange(v)
        }
      })
      const offOne = effect((warmup) => {
        const v = $one()

        if (!warmup) {
          onOneChange(v)
        }
      })
      const offTwo = effect((warmup) => {
        const v = $two()

        if (!warmup) {
          onTwoChange(v)
        }
      })
      const offThree = effect((warmup) => {
        const v = $three()

        if (!warmup) {
          onThreeChange(v)
        }
      })

      $array([
        'three',
        'one',
        'two'
      ])

      expect(onArrayChange).toHaveBeenCalledTimes(1)
      expect(onOneChange).toHaveBeenCalledTimes(0)
      expect(onTwoChange).toHaveBeenCalledTimes(0)
      expect(onThreeChange).toHaveBeenCalledTimes(0)

      offList()
      offOne()
      offTwo()
      offThree()
    })

    it('should work with record', () => {
      const users = [
        {
          name: 'Dan',
          location: 'Batumi'
        },
        {
          name: 'Savva',
          location: 'Tallinn'
        },
        {
          name: 'Diman',
          location: 'Novosibirsk'
        }
      ]
      const $array = signal(users)

      expect($array()).toEqual(users)
      expect(atIndex($array, 1)()).toEqual(users[1])
      expect(record(atIndex($array, 1)).$name()).toBe('Savva')

      record(atIndex($array, 1)).$name('Savva B')

      expect($array()).toEqual([
        {
          name: 'Dan',
          location: 'Batumi'
        },
        {
          name: 'Savva B',
          location: 'Tallinn'
        },
        {
          name: 'Diman',
          location: 'Novosibirsk'
        }
      ])
      expect(atIndex($array, 1)()).toEqual({
        name: 'Savva B',
        location: 'Tallinn'
      })
      expect(record(atIndex($array, 1)).$name()).toBe('Savva B')
    })
  })
})
