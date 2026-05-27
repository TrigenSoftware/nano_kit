import {
  describe,
  expect,
  it
} from 'vitest'
import { deflat } from './deflat.js'

interface DeflatedStringRecord {
  [key: string]: string | DeflatedStringRecord
}

describe('intl', () => {
  describe('deflat', () => {
    it('should deflat dotted keys', () => {
      const output = deflat({
        'A.title': 'Hello, {name}!',
        'A.greeting': 'Welcome to our website.',
        'B.title': 'Goodbye, {name}!',
        'B.farewell': 'Thank you for visiting.',
        'B.guests.one': 'You have {count} guest.',
        'B.guests.other': 'You have {count} guests.'
      })
      const typed: {
        A: {
          title: 'Hello, {name}!'
          greeting: 'Welcome to our website.'
        }
        B: {
          title: 'Goodbye, {name}!'
          farewell: 'Thank you for visiting.'
          guests: {
            one: 'You have {count} guest.'
            other: 'You have {count} guests.'
          }
        }
      } = output

      expect(typed).toEqual({
        A: {
          title: 'Hello, {name}!',
          greeting: 'Welcome to our website.'
        },
        B: {
          title: 'Goodbye, {name}!',
          farewell: 'Thank you for visiting.',
          guests: {
            one: 'You have {count} guest.',
            other: 'You have {count} guests.'
          }
        }
      })
    })

    it('should deflat dotted keys from depth', () => {
      const output = deflat({
        A: {
          title: 'Hello, {name}!',
          greeting: 'Welcome to our website.'
        },
        B: {
          'title': 'Goodbye, {name}!',
          'farewell': 'Thank you for visiting.',
          'guests.one': 'You have {count} guest.',
          'guests.other': 'You have {count} guests.'
        }
      }, 1)
      const typed: {
        A: {
          title: 'Hello, {name}!'
          greeting: 'Welcome to our website.'
        }
        B: {
          title: 'Goodbye, {name}!'
          farewell: 'Thank you for visiting.'
          guests: {
            one: 'You have {count} guest.'
            other: 'You have {count} guests.'
          }
        }
      } = output

      expect(typed).toEqual({
        A: {
          title: 'Hello, {name}!',
          greeting: 'Welcome to our website.'
        },
        B: {
          title: 'Goodbye, {name}!',
          farewell: 'Thank you for visiting.',
          guests: {
            one: 'You have {count} guest.',
            other: 'You have {count} guests.'
          }
        }
      })
    })

    it('should deflat anonymous records', () => {
      const output = deflat<Record<string, string>>({
        'A.title': 'Hello, {name}!',
        'A.greeting': 'Welcome to our website.',
        'B.title': 'Goodbye, {name}!',
        'B.guests.one': 'You have {count} guest.',
        'B.guests.other': 'You have {count} guests.'
      })
      const typed: DeflatedStringRecord = output

      expect(typed).toEqual({
        A: {
          title: 'Hello, {name}!',
          greeting: 'Welcome to our website.'
        },
        B: {
          title: 'Goodbye, {name}!',
          guests: {
            one: 'You have {count} guest.',
            other: 'You have {count} guests.'
          }
        }
      })
    })

    it('should deflat nested anonymous records from depth', () => {
      const output = deflat<Record<string, Record<string, string>>>({
        A: {
          title: 'Hello, {name}!',
          greeting: 'Welcome to our website.'
        },
        B: {
          'title': 'Goodbye, {name}!',
          'farewell': 'Thank you for visiting.',
          'guests.one': 'You have {count} guest.',
          'guests.other': 'You have {count} guests.'
        }
      }, 1)
      const typed: DeflatedStringRecord = output

      expect(typed).toEqual({
        A: {
          title: 'Hello, {name}!',
          greeting: 'Welcome to our website.'
        },
        B: {
          title: 'Goodbye, {name}!',
          farewell: 'Thank you for visiting.',
          guests: {
            one: 'You have {count} guest.',
            other: 'You have {count} guests.'
          }
        }
      })
    })
  })
})
