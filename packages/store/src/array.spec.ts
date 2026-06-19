import {
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  updateArray
} from 'kida'
import { atFoundIndex } from './array.js'

describe('store', () => {
  describe('array', () => {
    it('should get item by predicate', () => {
      const $array = signal([
        {
          id: 1,
          name: 'Alice'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 3,
          name: 'Charlie'
        }
      ])
      const $bob = atFoundIndex($array, item => item.id === 2)

      expect($bob()).toEqual({
        id: 2,
        name: 'Bob'
      })

      $bob({
        id: 2,
        name: 'Bobby'
      })

      expect($array()).toEqual([
        {
          id: 1,
          name: 'Alice'
        },
        {
          id: 2,
          name: 'Bobby'
        },
        {
          id: 3,
          name: 'Charlie'
        }
      ])
      expect($bob()).toEqual({
        id: 2,
        name: 'Bobby'
      })
    })

    it('should track predicate result changes', () => {
      const $array = signal([
        {
          id: 1,
          name: 'Alice',
          active: false
        },
        {
          id: 2,
          name: 'Bob',
          active: true
        },
        {
          id: 3,
          name: 'Charlie',
          active: false
        }
      ])
      const $firstActive = atFoundIndex($array, item => item.active)

      expect($firstActive()).toEqual({
        id: 2,
        name: 'Bob',
        active: true
      })

      updateArray($array, (array) => {
        [array[0], array[1]] = [array[1], array[0]]
      })

      expect($array()).toEqual([
        {
          id: 2,
          name: 'Bob',
          active: true
        },
        {
          id: 1,
          name: 'Alice',
          active: false
        },
        {
          id: 3,
          name: 'Charlie',
          active: false
        }
      ])

      expect($firstActive()).toEqual({
        id: 2,
        name: 'Bob',
        active: true
      })
    })
  })
})
