import {
  describe,
  it,
  expect
} from 'vitest'
import {
  hash,
  moniker
} from './naming.moniker.js'

describe('devtools', () => {
  describe('services', () => {
    describe('naming', () => {
      describe('hash', () => {
        it('should be the 32-bit FNV-1a of the text', () => {
          expect(hash('')).toBe(2166136261)
          expect(hash('a')).toBe(3826002220)
          expect(hash('foobar')).toBe(3214735720)
        })
      })

      describe('moniker', () => {
        it('should give two words joined with a dash', () => {
          expect(moniker('cart.ts:18#1')).toMatch(/^[a-z]+-[a-z]+$/)
        })

        it('should give the same name for the same seed', () => {
          expect(moniker('cart.ts:18#1')).toBe(moniker('cart.ts:18#1'))
        })

        it('should spread seeds over many names', () => {
          const names = new Set(Array.from({
            length: 200
          }, (_, index) => moniker(`cart.ts:18#${index}`)))

          expect(names.size).toBeGreaterThan(190)
        })
      })
    })
  })
})
