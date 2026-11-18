import {
  vi,
  describe,
  it,
  expect,
  expectTypeOf,
  afterEach
} from 'vitest'
import type { Behavior } from './fetch.types.js'
import { virtualFetch } from './fetch.js'
import {
  pending,
  fail,
  offline,
  delay,
  mapJson,
  pass,
  sequence,
  when
} from './behaviors.js'

/* A fetch whose plants go through the behavior, then to the route below it */
function plantsThrough(behavior: Behavior) {
  return virtualFetch([
    (app) => {
      app.get('/plants/:id', behavior)
      app.get('/plants/:id', c => c.json({
        id: c.req.param('id'),
        name: 'Boston fern'
      }, 200, {
        'x-garden': '1'
      }))
    }
  ])
}

async function statuses(fetch: typeof globalThis.fetch, urls: string[]) {
  const result: number[] = []

  for (const url of urls) {
    result.push((await fetch(url)).status)
  }

  return result
}

describe('testing', () => {
  describe('fetch', () => {
    describe('behaviors', () => {
      it('should be typed as behaviors', () => {
        expectTypeOf([
          pending(),
          fail(),
          offline(),
          delay(1),
          mapJson(data => data),
          pass(),
          sequence(pass()),
          when(() => true, pass())
        ]).toEqualTypeOf<Behavior[]>()
      })

      describe('pending', () => {
        it('should never answer', async () => {
          const fetch = plantsThrough(pending())
          const waiting = new Promise((resolve) => {
            setTimeout(resolve, 20, 'waiting')
          })

          await expect(Promise.race([fetch('/plants/1'), waiting])).resolves.toBe('waiting')
        })

        it('should let the request be aborted', async () => {
          const controller = new AbortController()
          const response = plantsThrough(pending())('/plants/1', {
            signal: controller.signal
          })

          controller.abort()

          await expect(response).rejects.toMatchObject({
            name: 'AbortError'
          })
        })
      })

      describe('fail', () => {
        it('should answer 500 with no body by default', async () => {
          const response = await plantsThrough(fail())('/plants/1')

          expect(response.status).toBe(500)
          expect(await response.text()).toBe('')
        })

        it('should answer the given status with the given body as JSON', async () => {
          const response = await plantsThrough(fail(409, {
            error: 'Plant already exists'
          }))('/plants/1')

          expect(response.status).toBe(409)
          expect(await response.json()).toEqual({
            error: 'Plant already exists'
          })
        })
      })

      describe('offline', () => {
        it('should make the fetch reject with a type error', async () => {
          await expect(plantsThrough(offline())('/plants/1')).rejects.toThrow(new TypeError('Failed to fetch'))
        })

        it('should cut the network off under a behavior that hands requests on', async () => {
          await expect(plantsThrough(when(() => true, offline()))('/plants/1')).rejects.toThrow(TypeError)
        })
      })

      describe('delay', () => {
        afterEach(() => {
          vi.useRealTimers()
        })

        it('should hold the request for the given time', async () => {
          vi.useFakeTimers()

          const answered = vi.fn()
          const response = plantsThrough(delay(500))('/plants/1').then(answered)

          await vi.advanceTimersByTimeAsync(499)

          expect(answered).not.toHaveBeenCalled()

          await vi.advanceTimersByTimeAsync(1)
          await response

          expect(answered).toHaveBeenCalledWith(expect.objectContaining({
            status: 200
          }))
        })
      })

      describe('mapJson', () => {
        it('should rewrite the JSON of the answer', async () => {
          const response = await plantsThrough(mapJson(plant => ({
            ...plant,
            name: 'Lavender'
          })))('/plants/1')

          expect(await response.json()).toEqual({
            id: '1',
            name: 'Lavender'
          })
        })

        it('should keep the status and the headers of the answer', async () => {
          const response = await virtualFetch([
            (app) => {
              app.post('/plants', mapJson(() => ({
                id: '2'
              })))
              app.post('/plants', c => c.json({
                id: '1'
              }, 201, {
                'x-garden': '1'
              }))
            }
          ])('/plants', {
            method: 'POST'
          })

          expect(response.status).toBe(201)
          expect(response.headers.get('x-garden')).toBe('1')
          expect(response.headers.get('content-type')).toMatch(/^application\/json/)
        })

        it('should leave an answer that is not JSON as it is', async () => {
          const map = vi.fn()
          const response = await virtualFetch([
            (app) => {
              app.get('/plants/:id', mapJson(map))
              app.get('/plants/:id', c => c.text('Gone', 410))
            }
          ])('/plants/1')

          expect(response.status).toBe(410)
          expect(await response.text()).toBe('Gone')
          expect(map).not.toHaveBeenCalled()
        })
      })

      describe('pass', () => {
        it('should hand the request on to the routes below', async () => {
          const response = await plantsThrough(pass())('/plants/1')

          expect(response.status).toBe(200)
        })
      })

      describe('sequence', () => {
        it('should give the n-th request the n-th step and the requests after the steps to the routes below', async () => {
          const fetch = plantsThrough(sequence(fail(500), fail(503)))

          expect(await statuses(fetch, ['/plants/1', '/plants/1', '/plants/1', '/plants/1'])).toEqual([500, 503, 200, 200])
        })

        it('should count the requests of every path apart', async () => {
          const fetch = plantsThrough(sequence(fail()))

          expect(await statuses(fetch, ['/plants/1', '/plants/2', '/plants/1'])).toEqual([500, 500, 200])
        })

        it('should count a path whatever its query', async () => {
          const fetch = plantsThrough(sequence(fail()))

          expect(await statuses(fetch, ['/plants/1?lastId=1', '/plants/1?lastId=2'])).toEqual([500, 200])
        })

        it('should take a step that hands the request on', async () => {
          const fetch = plantsThrough(sequence(pass(), fail()))

          expect(await statuses(fetch, ['/plants/1', '/plants/1', '/plants/1'])).toEqual([200, 500, 200])
        })
      })

      describe('when', () => {
        it('should apply the behavior to the requests that pass the test and hand the others on', async () => {
          const fetch = plantsThrough(when(c => c.req.param('id') === '1', fail()))

          expect(await statuses(fetch, ['/plants/1', '/plants/2'])).toEqual([500, 200])
        })
      })
    })
  })
})
