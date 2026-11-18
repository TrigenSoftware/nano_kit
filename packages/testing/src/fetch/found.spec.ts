import {
  vi,
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import { HTTPException } from 'hono/http-exception'
import { virtualFetch } from './fetch.js'
import { found } from './found.js'

interface Plant {
  id: string
  name: string
}

const plants: Plant[] = [
  {
    id: '1',
    name: 'Boston fern'
  }
]

describe('testing', () => {
  describe('fetch', () => {
    describe('found', () => {
      it('should return the record', () => {
        expect(found(plants[0])).toBe(plants[0])
      })

      it('should throw a 404 when there is no record', () => {
        expect(() => found(undefined)).toThrow(HTTPException)
        expect(() => found(undefined)).toThrow(expect.objectContaining({
          status: 404
        }))
      })

      it('should throw a 404 when the record is null', () => {
        expect(() => found(null)).toThrow(expect.objectContaining({
          status: 404
        }))
      })

      it('should make a route answer 404 without the warning of a missing route', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const fetch = virtualFetch([
          (app) => {
            app.get('/plants/:id', c => c.json(found(plants.find(plant => plant.id === c.req.param('id')))))
          }
        ])

        expect((await fetch('/plants/1')).status).toBe(200)
        expect((await fetch('/plants/2')).status).toBe(404)
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
      })

      it('should be typed as the record without undefined and null', () => {
        expectTypeOf(found(plants.find(plant => plant.id === '1'))).toEqualTypeOf<Plant>()
        expectTypeOf(found(plants.find(plant => plant.id === '1') ?? null)).toEqualTypeOf<Plant>()
      })
    })
  })
})
