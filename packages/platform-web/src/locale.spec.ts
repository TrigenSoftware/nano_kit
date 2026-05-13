import {
  describe,
  expect,
  it
} from 'vitest'
import {
  browserLocale,
  parseLocales
} from './locale.js'

describe('platform-web', () => {
  describe('locale', () => {
    describe('parseLocales', () => {
      it('should parse accept-language headers', () => {
        expect(parseLocales('ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7')).toEqual({
          language: 'ru-RU',
          languages: ['ru-RU', 'ru', 'en-US', 'en']
        })
      })

      it('should ignore whitespace in accept-language headers', () => {
        expect(parseLocales(' ru-RU , ru ; q = 0.9 , en-US ; q=0.8 ')).toEqual({
          language: 'ru-RU',
          languages: ['ru-RU', 'ru', 'en-US']
        })
      })

      it('should sort languages by quality', () => {
        expect(parseLocales('en;q=0.5,ru;q=1,fr;q=0.8')).toEqual({
          language: 'ru',
          languages: ['ru', 'fr', 'en']
        })
      })

      it('should preserve declaration order for equal quality values', () => {
        expect(parseLocales('en;q=0.8,ru;q=0.8,fr;q=0.8')).toEqual({
          language: 'en',
          languages: ['en', 'ru', 'fr']
        })
      })

      it('should ignore languages with zero or invalid quality', () => {
        expect(parseLocales('en;q=0,ru;q=bad,fr;q=0.5')).toEqual({
          language: 'fr',
          languages: ['fr']
        })
      })

      it('should fallback to english when header is empty', () => {
        expect(parseLocales('')).toEqual({
          language: 'en',
          languages: ['en']
        })
      })

      it('should create a container compatible with browserLocale', () => {
        expect(browserLocale(
          parseLocales('en;q=0.5,ru;q=1'),
          ['en', 'ru']
        )).toBe('ru')
      })
    })
  })
})
