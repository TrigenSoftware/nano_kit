import {
  describe,
  it,
  expect
} from 'vitest'
import { isEmptyOrFalse } from './utils.js'

describe('kida', () => {
  describe('internals', () => {
    describe('utils', () => {
      describe('isEmptyOrFalse', () => {
        it('should return true for empty values and false', () => {
          expect(isEmptyOrFalse(null)).toBe(true)
          expect(isEmptyOrFalse(undefined)).toBe(true)
          expect(isEmptyOrFalse(false)).toBe(true)
        })

        it('should return false for other values', () => {
          expect(isEmptyOrFalse(true)).toBe(false)
          expect(isEmptyOrFalse(0)).toBe(false)
          expect(isEmptyOrFalse('')).toBe(false)
        })
      })
    })
  })
})
