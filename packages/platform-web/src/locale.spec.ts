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
    describe('browserLocale', () => {
      it('should return the first language without supported locales', () => {
        expect(browserLocale({
          language: 'ro-RO',
          languages: ['ro-RO', 'en']
        })).toBe('ro-RO')
      })

      it('should use the language when the languages are missing', () => {
        expect(browserLocale({
          language: 'ru'
        }, ['en', 'ru'])).toBe('ru')
      })

      it('should prefer the exact tag to other locales of the language', () => {
        expect(browserLocale({
          language: 'pt-BR'
        }, ['pt', 'pt-BR'])).toBe('pt-BR')
      })

      it('should return english when no language matches', () => {
        expect(browserLocale({
          language: 'de-DE',
          languages: ['de-DE', 'de']
        }, ['ru', 'ro'])).toBe('en')
      })

      it('should return the fallback when no language matches', () => {
        expect(browserLocale({
          language: 'de-DE',
          languages: ['de-DE', 'de']
        }, ['ru', 'ro'], 'ru')).toBe('ru')
      })

      it('should match a regional language with the locale of its language', () => {
        expect(browserLocale({
          language: 'ro-RO'
        }, ['en', 'ro'])).toBe('ro')
      })

      it('should match a language with its regional locale', () => {
        expect(browserLocale({
          language: 'pt'
        }, ['en', 'pt-BR'])).toBe('pt-BR')
      })

      it('should match a regional language with the locale of another region', () => {
        expect(browserLocale({
          language: 'pt-PT'
        }, ['en', 'pt-BR'])).toBe('pt-BR')
      })

      it('should prefer an earlier language to the exact tag of a later one', () => {
        expect(browserLocale({
          language: 'ro-RO',
          languages: ['ro-RO', 'en']
        }, ['en', 'ro'])).toBe('ro')
      })

      it('should try the next language when the first has no locale', () => {
        expect(browserLocale({
          language: 'de-DE',
          languages: ['de-DE', 'ro-RO']
        }, ['en', 'ro'])).toBe('ro')
      })

      it('should choose the locale in the script of the language', () => {
        expect(browserLocale({
          language: 'zh-TW'
        }, ['en', 'zh-Hans', 'zh-Hant'])).toBe('zh-Hant')
      })

      it('should choose the regional locale in the script of the language', () => {
        expect(browserLocale({
          language: 'zh-HK'
        }, ['en', 'zh', 'zh-TW'])).toBe('zh-TW')
      })

      it('should choose the locale in the likely region of the language', () => {
        expect(browserLocale({
          language: 'en'
        }, ['fr', 'en-GB', 'en-US'])).toBe('en-US')
      })

      it('should take the first locale in the script when none is in the likely region', () => {
        expect(browserLocale({
          language: 'en-AU'
        }, ['fr', 'en-GB', 'en-US'])).toBe('en-GB')
      })

      it('should take the first locale of the language when none is in its script', () => {
        expect(browserLocale({
          language: 'zh-TW'
        }, ['en', 'zh-CN', 'zh-SG'])).toBe('zh-CN')
      })

      it('should take the first locale of the language when the tag is malformed', () => {
        expect(browserLocale({
          language: 'zh-*'
        }, ['en', 'zh-Hans', 'zh-Hant'])).toBe('zh-Hans')
      })

      it('should resolve the browser list and the request header to the same locale', () => {
        const supported = ['en', 'ro'] as const

        expect(browserLocale({
          language: 'ro-RO',
          languages: ['ro-RO']
        }, supported)).toBe('ro')
        expect(browserLocale(parseLocales('ro-RO,ro;q=0.9'), supported)).toBe('ro')
      })
    })

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

      it('should fallback to english when header is null', () => {
        expect(parseLocales(null)).toEqual({
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
