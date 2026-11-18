import {
  vi,
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  type Collection,
  collection
} from '../collection.js'
import type { VirtualDatabase } from '../database.types.js'
import { value } from '../value.js'
import type { App } from '../fetch/fetch.types.js'
import {
  fail,
  mapJson,
  sequence
} from '../fetch/behaviors.js'
import type {
  BackendRecipe,
  RecipeOf
} from './backend.types.js'
import { virtualBackend } from './backend.js'

interface Garden {
  id: string
  name: string
}

interface Plant {
  id: string
  gardenId: string
  name: string
}

const gardenSchema = {
  gardens: collection<Garden>()
}
const plantSchema = {
  plants: collection<Plant>()
}
const userSchema = {
  session: value<string | null>(null)
}
/* Mock modules, as `import * as gardenMock` gives them */
const gardenMock = {
  schema: gardenSchema,
  seed(db: VirtualDatabase<typeof gardenSchema>) {
    db.gardens.createMany(2, index => ({
      name: `Garden ${index + 1}`
    }))
  },
  routes(app: App, db: VirtualDatabase<typeof gardenSchema>) {
    app.get('/gardens', c => c.json(db.gardens.get()))
  }
}
const plantMock = {
  schema: plantSchema,
  seed(db: VirtualDatabase<typeof plantSchema & typeof gardenSchema>) {
    db.gardens.get().forEach((garden) => {
      db.plants.create({
        gardenId: garden.id,
        name: `Fern of ${garden.name}`
      })
    })
  },
  routes(app: App, db: VirtualDatabase<typeof plantSchema>) {
    app.get('/plants', c => c.json(db.plants.get()))
    app.delete('/plants/:id', c => c.json(db.plants.delete(c.req.param('id'))))
  }
}
const userMock = {
  schema: userSchema,
  routes(app: App, db: VirtualDatabase<typeof userSchema>) {
    app.get('/session', c => c.json({
      session: db.session
    }))
  }
}

function signedIn(_: App, db: VirtualDatabase<typeof userSchema>) {
  db.session = 'user-1'
}

function refusing(app: App) {
  app.get('/gardens', sequence(fail()))
}

async function json(response: Promise<Response>): Promise<unknown> {
  return (await response).json()
}

describe('testing', () => {
  describe('backend', () => {
    describe('virtualBackend', () => {
      it('should be a fetch, a database and a fork', () => {
        const backend = virtualBackend([gardenMock])
        const [fetch, db, fork] = backend

        expect(backend).toHaveLength(3)
        expect(fetch).toBeTypeOf('function')
        expect(db.gardens.get()).toHaveLength(2)
        expect(fork).toBeTypeOf('function')
        expectTypeOf(fetch).toEqualTypeOf<typeof globalThis.fetch>()
      })

      it('should make one database of the schemas of the modules', () => {
        const [, db] = virtualBackend([gardenMock, plantMock, userMock])

        expect(db.gardens.get()).toHaveLength(2)
        expect(db.plants.get()).toHaveLength(2)
        expect(db.session).toBeNull()
        expectTypeOf(db.plants).toEqualTypeOf<Collection<Plant>>()
        expectTypeOf(db.session).toEqualTypeOf<string | null>()
      })

      it('should run the seeds of the modules in their order, then its own seed', () => {
        const [, db] = virtualBackend([gardenMock, plantMock], (db) => {
          db.gardens.create({
            name: `Garden for ${db.plants.get().length} more ferns`
          })
        })

        expect(db.plants.get().map(plant => plant.name)).toEqual(['Fern of Garden 1', 'Fern of Garden 2'])
        expect(db.gardens.find('3')?.name).toBe('Garden for 2 more ferns')
      })

      it('should not run the seeds until it is used', async () => {
        const seed = vi.fn()
        const [fetch] = virtualBackend([gardenMock], seed)

        expect(seed).not.toHaveBeenCalled()

        await fetch('/gardens')

        expect(seed).toHaveBeenCalledTimes(1)
      })

      it('should answer by the routes of the modules', async () => {
        const [fetch] = virtualBackend([gardenMock, plantMock, userMock])

        expect(await json(fetch('/plants'))).toHaveLength(2)
        expect(await json(fetch('/session'))).toEqual({
          session: null
        })
      })

      it('should put the routes of a later module before the ones of an earlier one', async () => {
        const [fetch] = virtualBackend([
          gardenMock,
          {
            routes(app: App) {
              app.get('/gardens', c => c.json([]))
            }
          }
        ])

        expect(await json(fetch('/gardens'))).toEqual([])
      })

      it('should answer from its database', async () => {
        const [fetch, db] = virtualBackend([gardenMock, plantMock])

        await fetch('/plants/1', {
          method: 'DELETE'
        })

        expect(db.plants.find('1')).toBeUndefined()
      })

      it('should take modules without a schema, a seed or routes', async () => {
        const [fetch, db] = virtualBackend([
          {
            schema: gardenSchema
          },
          {
            routes(app: App) {
              app.get('/ping', c => c.text('pong'))
            }
          }
        ])

        expect(db.gardens.get()).toEqual([])
        expect(await (await fetch('/ping')).text()).toBe('pong')
      })

      it('should not take a module that needs one missing from the list', () => {
        // @ts-expect-error the seed of the plants reads the gardens
        expect(virtualBackend([plantMock])).toHaveLength(3)
      })

      it('should type its seed by the schemas of the modules', () => {
        // @ts-expect-error there are no plants without their module
        expect(virtualBackend([gardenMock], db => db.plants.get())).toHaveLength(3)
      })

      describe('fork', () => {
        it('should copy the database as it is now', () => {
          const [, base, fork] = virtualBackend([gardenMock])

          base.gardens.create({
            name: 'Courtyard garden'
          })

          const [, db] = fork()

          expect(db.gardens.get()).toHaveLength(3)
        })

        it('should apply the recipes to the copy in order', () => {
          const [, , fork] = virtualBackend([userMock])
          const [, db] = fork(
            signedIn,
            (_, db) => {
              db.session = `${db.session}-admin`
            }
          )

          expect(db.session).toBe('user-1-admin')
        })

        it('should skip a falsy recipe', async () => {
          const [, , fork] = virtualBackend([gardenMock, userMock])
          const [fetch, db] = fork(false, signedIn, null, undefined, 0, '', refusing)

          expect(db.session).toBe('user-1')
          expect((await fetch('/gardens')).status).toBe(500)
        })

        it('should put the routes of the recipes before the ones of the modules', async () => {
          const [, , fork] = virtualBackend([gardenMock])
          const [fetch] = fork((app) => {
            app.get('/gardens', fail())
          })

          expect((await fetch('/gardens')).status).toBe(500)
        })

        it('should put the routes of a later recipe before the ones of an earlier one', async () => {
          const [, , fork] = virtualBackend([userMock])
          const [fetch, db] = fork(
            (app, db) => {
              db.session = 'a'
              app.get('/session', fail(500))
            },
            (app, db) => {
              db.session = 'b'
              app.get('/session', fail(503))
            }
          )

          expect((await fetch('/session')).status).toBe(503)
          expect(db.session).toBe('b')
        })

        it('should let the routes of a later recipe wrap the ones of an earlier one', async () => {
          const mark = (label: string) => mapJson((gardens: Garden[]) => gardens.map(garden => ({
            ...garden,
            name: `${garden.name} ${label}`
          })))
          const [, , fork] = virtualBackend([gardenMock])
          const [fetch] = fork(
            (app) => {
              app.get('/gardens', mark('a'))
            },
            (app) => {
              app.get('/gardens', mark('b'))
            }
          )

          expect(await json(fetch('/gardens'))).toContainEqual({
            id: '1',
            name: 'Garden 1 a b'
          })
        })

        it('should let a route of a recipe hand requests on to the modules', async () => {
          const [, , fork] = virtualBackend([gardenMock])
          const [fetch] = fork((app) => {
            app.get('/gardens', mapJson((gardens: Garden[]) => gardens.slice(1)))
          })

          expect(await json(fetch('/gardens'))).toEqual([
            {
              id: '2',
              name: 'Garden 2'
            }
          ])
        })

        it('should share no data with the backend or with other forks', async () => {
          const [, base, fork] = virtualBackend([gardenMock, plantMock])
          const [fetch, db] = fork()
          const [, other] = fork()

          await fetch('/plants/1', {
            method: 'DELETE'
          })

          expect(db.plants.find('1')).toBeUndefined()
          expect(other.plants.find('1')).toBeDefined()
          expect(base.plants.find('1')).toBeDefined()
        })

        it('should leave the backend answering by its own routes', async () => {
          const [fetch, , fork] = virtualBackend([gardenMock])

          fork(refusing)

          expect((await fetch('/gardens')).status).toBe(200)
        })

        it('should start the counters from zero in every fork', async () => {
          const [, , fork] = virtualBackend([gardenMock])
          const [first] = fork(refusing)
          const [second] = fork(refusing)

          expect((await first('/gardens')).status).toBe(500)
          expect((await first('/gardens')).status).toBe(200)
          expect((await second('/gardens')).status).toBe(500)
        })

        it('should run the seeds once for all the forks', () => {
          const seed = vi.fn()
          const [, , fork] = virtualBackend([gardenMock], seed)

          fork()
          fork()

          expect(seed).toHaveBeenCalledTimes(1)
        })

        it('should bring the database of a fork back to its recipes on reset', () => {
          const [, , fork] = virtualBackend([userMock])
          const [, db] = fork(signedIn)

          db.session = null
          db.reset()

          expect(db.session).toBe('user-1')
        })

        it('should throw what a recipe throws', () => {
          const [, , fork] = virtualBackend([gardenMock])

          expect(() => fork(() => {
            throw new Error('No recipe')
          })).toThrow('No recipe')
        })

        it('should type a recipe apart from a call by RecipeOf', () => {
          const [, , fork] = virtualBackend([gardenMock, userMock])
          const recipe: RecipeOf<typeof fork> = (_, db) => {
            db.session = `${db.gardens.get().length} gardens`
          }

          expect(fork(recipe)[1].session).toBe('2 gardens')
          expectTypeOf<RecipeOf<typeof fork>>().toEqualTypeOf<
            BackendRecipe<typeof gardenSchema & typeof userSchema>
          >()
        })

        it('should make a pair without a fork of its own', () => {
          const [, , fork] = virtualBackend([gardenMock])
          const pair = fork()

          expect(pair).toHaveLength(2)
          expectTypeOf(pair).toHaveProperty('length').toEqualTypeOf<2>()
        })
      })
    })
  })
})
