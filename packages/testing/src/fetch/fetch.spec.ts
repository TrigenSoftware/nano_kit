import {
  vi,
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import type { App } from './fetch.types.js'
import { virtualFetch } from './fetch.js'

function plants(app: App) {
  app.get('/plants', c => c.json(['Boston fern']))
}

function named(app: App, name: string, count: number) {
  app.get('/plant', c => c.json({
    name,
    count
  }))
}

function hanging(app: App) {
  app.get('/plants', () => new Promise<never>(() => { /* never settles */ }))
}

describe('testing', () => {
  describe('fetch', () => {
    describe('virtualFetch', () => {
      it('should answer by the routes of the handlers', async () => {
        const fetch = virtualFetch([plants])
        const response = await fetch('/plants')

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual(['Boston fern'])
      })

      it('should give the handlers its arguments after the app', async () => {
        const fetch = virtualFetch([named], 'Boston fern', 2)

        expect(await (await fetch('/plant')).json()).toEqual({
          name: 'Boston fern',
          count: 2
        })
      })

      it('should run the handlers in order', async () => {
        const runs: string[] = []
        const fetch = virtualFetch([
          (app, log: string[]) => {
            log.push('first')
            plants(app)
          },
          (_, log: string[]) => {
            log.push('second')
          }
        ], runs)

        await fetch('/plants')

        expect(runs).toEqual(['first', 'second'])
      })

      it('should put the routes of a later handler before the ones of an earlier one', async () => {
        const fetch = virtualFetch([
          plants,
          (app) => {
            app.get('/plants', c => c.json(['Lavender']))
          }
        ])

        expect(await (await fetch('/plants')).json()).toEqual(['Lavender'])
      })

      it('should let the middleware of a later handler wrap the routes of an earlier one', async () => {
        const fetch = virtualFetch([
          plants,
          (app) => {
            app.use(async (c, next) => {
              await next()
              c.header('x-layer', 'later')
            })
          }
        ])

        expect((await fetch('/plants')).headers.get('x-layer')).toBe('later')
      })

      it('should skip a falsy handler', async () => {
        const fetch = virtualFetch([false, plants, null, undefined, 0, ''])

        expect(await (await fetch('/plants')).json()).toEqual(['Boston fern'])
      })

      it('should put the routes on the app once, on the first request', async () => {
        const handler = vi.fn(plants)
        const fetch = virtualFetch([handler])

        expect(handler).not.toHaveBeenCalled()

        await fetch('/plants')
        await fetch('/plants')

        expect(handler).toHaveBeenCalledTimes(1)
      })

      it('should reject what a handler throws and put the routes on again on the next request', async () => {
        let fails = true
        const fetch = virtualFetch([
          (app) => {
            if (fails) {
              throw new Error('No routes')
            }

            plants(app)
          }
        ])

        await expect(fetch('/plants')).rejects.toThrow('No routes')

        fails = false

        expect((await fetch('/plants')).status).toBe(200)
      })

      it('should take a relative address', async () => {
        const fetch = virtualFetch([plants])

        expect((await fetch('plants')).status).toBe(200)
      })

      it('should route an absolute address by its path', async () => {
        const fetch = virtualFetch([plants])

        expect((await fetch('https://api.example.com/plants')).status).toBe(200)
      })

      it('should take a request', async () => {
        const fetch = virtualFetch([plants])

        expect((await fetch(new Request('http://localhost/plants'))).status).toBe(200)
      })

      it('should hand the method and the body of the request on to the routes', async () => {
        const fetch = virtualFetch([
          (app) => {
            app.post('/plants', async c => c.json(await c.req.json(), 201))
          }
        ])
        const response = await fetch('/plants', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Boston fern'
          })
        })

        expect(response.status).toBe(201)
        expect(await response.json()).toEqual({
          name: 'Boston fern'
        })
      })

      it('should fill the address of the response', async () => {
        const fetch = virtualFetch([plants])

        expect((await fetch('plants?lastId=1')).url).toBe('http://localhost/plants?lastId=1')
      })

      it('should return a promise when a route answers at once', async () => {
        const fetch = virtualFetch([plants])
        const response = fetch('/plants')

        expect(response).toBeInstanceOf(Promise)
        await expect(response).resolves.toBeInstanceOf(Response)
      })

      it('should reject with the reason when the request is aborted before it is sent', async () => {
        const controller = new AbortController()
        const fetch = virtualFetch([plants])

        controller.abort()

        await expect(fetch('/plants', {
          signal: controller.signal
        })).rejects.toMatchObject({
          name: 'AbortError'
        })
      })

      it('should reject with the reason as soon as the request is aborted', async () => {
        const controller = new AbortController()
        const reason = new Error('Left the page')
        const fetch = virtualFetch([hanging])
        const response = fetch('/plants', {
          signal: controller.signal
        })

        controller.abort(reason)

        await expect(response).rejects.toBe(reason)
      })

      it('should let go of the signal once the request is answered', async () => {
        const controller = new AbortController()
        const fetch = virtualFetch([plants])
        const response = await fetch('/plants', {
          signal: controller.signal
        })

        controller.abort()

        expect(response.status).toBe(200)
      })

      it('should answer 404 and warn when no route answers', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const fetch = virtualFetch([plants])
        const response = await fetch('/gardens', {
          method: 'DELETE'
        })

        expect(response.status).toBe(404)
        expect(warn).toHaveBeenCalledWith('virtualFetch: no route answers DELETE /gardens')
        warn.mockRestore()
      })

      it('should answer 500 when a route throws', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const fetch = virtualFetch([
          (app) => {
            app.get('/plants', () => {
              throw new Error('Broken route')
            })
          }
        ])

        expect((await fetch('/plants')).status).toBe(500)
        expect(error).toHaveBeenCalledWith(new Error('Broken route'))
        error.mockRestore()
      })

      it('should be typed as a fetch', () => {
        expectTypeOf(virtualFetch([plants])).toEqualTypeOf<typeof fetch>()
      })

      it('should not take a handler that needs an argument it was not given', () => {
        // @ts-expect-error the name and the count are missing
        expect(virtualFetch([named])).toBeTypeOf('function')
        // @ts-expect-error the count is not a string
        expect(virtualFetch([named], 'Boston fern', '2')).toBeTypeOf('function')
      })
    })
  })
})
