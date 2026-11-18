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
} from './collection.js'
import type { VirtualDatabase } from './database.types.js'
import { value } from './value.js'
import { virtualDatabase } from './database.js'

interface Garden {
  id: string
  name: string
}

interface Plant {
  id: string
  gardenId: string
  name: string
}

interface Settings {
  theme: string
  tags: string[]
}

const schema = {
  gardens: collection<Garden>(),
  plants: collection<Plant>(),
  session: value<string | null>(null),
  settings: value<Settings>({
    theme: 'light',
    tags: []
  })
}

type Db = VirtualDatabase<typeof schema>

function seed(db: Db) {
  db.gardens.createMany(2, index => ({
    name: `Garden ${index + 1}`
  }))
  db.plants.createMany(4, index => ({
    gardenId: index < 3 ? '1' : '2',
    name: `Plant ${index + 1}`
  }))
}

function signedIn(db: VirtualDatabase<Pick<typeof schema, 'session'>>) {
  db.session = 'user-1'
}

function emptyGarden(db: Db) {
  db.plants.delete({
    gardenId: '1'
  })
}

describe('testing', () => {
  describe('database', () => {
    describe('virtualDatabase', () => {
      it('should have the collections and values of the schema', () => {
        const db = virtualDatabase(schema)

        expect(db.gardens.get()).toEqual([])
        expect(db.plants.get()).toEqual([])
        expect(db.session).toBeNull()
        expectTypeOf(db.gardens).toEqualTypeOf<Collection<Garden>>()
        expectTypeOf(db.session).toEqualTypeOf<string | null>()
      })

      it('should take a new value', () => {
        const db = virtualDatabase(schema)

        db.session = 'user-1'

        expect(db.session).toBe('user-1')
      })

      it('should copy a value it takes', () => {
        const db = virtualDatabase(schema)
        const settings = {
          theme: 'dark',
          tags: ['new']
        }

        db.settings = settings
        settings.tags.push('old')

        expect(db.settings.tags).toEqual(['new'])
      })

      it('should give a read-only value', () => {
        const db = virtualDatabase(schema)

        expect(() => {
          // @ts-expect-error a value is read-only
          db.settings.theme = 'dark'
        }).toThrow(TypeError)
        expect(() => db.settings.tags.push('old')).toThrow(TypeError)
        expectTypeOf(db.settings).toEqualTypeOf<Readonly<Settings>>()
      })

      it('should run the seed before a value is assigned', () => {
        const db = virtualDatabase(schema, (db) => {
          db.session = 'user-0'
        })

        db.session = 'user-1'

        expect(db.session).toBe('user-1')
      })

      it('should not let a collection be replaced', () => {
        const db = virtualDatabase(schema)

        expect(() => {
          // @ts-expect-error a collection is read-only
          db.plants = collection<Plant>()
        }).toThrow(TypeError)
      })

      it('should take in the records its collections already hold', () => {
        const gardens = collection<Garden>()

        gardens.create({
          name: 'Courtyard garden'
        })

        const db = virtualDatabase({
          gardens
        })

        expect(db.gardens.get()).toEqual(gardens.get())
        expect(db.gardens.create({
          name: 'Roof garden'
        }).id).toBe('2')
      })

      it('should share no data with the collections and values it is made of', () => {
        const parts = {
          gardens: collection<Garden>(),
          session: value<string | null>(null)
        }
        const db = virtualDatabase(parts)

        db.gardens.create({
          name: 'Courtyard garden'
        })
        db.session = 'user-1'
        parts.gardens.create({
          name: 'Roof garden'
        })

        expect(db.gardens.get().map(garden => garden.name)).toEqual(['Courtyard garden'])
        expect(parts.gardens.get().map(garden => garden.name)).toEqual(['Roof garden'])
        expect(parts.session.get()).toBeNull()
      })

      it('should make independent databases of one schema', () => {
        const first = virtualDatabase(schema, seed)
        const second = virtualDatabase(schema)

        first.gardens.set([])

        expect(first.plants.get()).toHaveLength(4)
        expect(second.plants.get()).toEqual([])
      })

      it('should fill the database with the seed', () => {
        const db = virtualDatabase(schema, seed)

        expect(db.gardens.get()).toHaveLength(2)
        expect(db.plants.get()).toHaveLength(4)
      })

      it('should not run the seed until the database is used', () => {
        const fill = vi.fn(seed)
        const db = virtualDatabase(schema, fill)

        expect(fill).not.toHaveBeenCalled()

        db.gardens.get()

        expect(fill).toHaveBeenCalledTimes(1)
      })

      it('should run the seed before a collection is taken from the database', () => {
        const { plants } = virtualDatabase(schema, seed)

        expect(plants.get()).toHaveLength(4)
      })

      it('should run the seed once', () => {
        const fill = vi.fn(seed)
        const db = virtualDatabase(schema, fill)

        db.gardens.get()
        db.plants.create({
          gardenId: '2',
          name: 'Boston fern'
        })
        db.session = 'user-1'

        expect(fill).toHaveBeenCalledTimes(1)
      })

      it('should let the seed read what it has written', () => {
        const db = virtualDatabase(schema, (db) => {
          const garden = db.gardens.create({
            name: 'Courtyard garden'
          })

          db.plants.create({
            gardenId: db.gardens.find(garden.id)!.id,
            name: 'Boston fern'
          })
        })

        expect(db.plants.find('1')?.gardenId).toBe('1')
      })

      it('should start over when the seed throws', () => {
        let fails = true
        const db = virtualDatabase(schema, (db) => {
          db.gardens.create({
            name: 'Courtyard garden'
          })

          if (fails) {
            throw new Error('No seed')
          }
        })

        expect(() => db.gardens.get()).toThrow('No seed')
        expect(() => db.gardens.get()).toThrow('No seed')

        fails = false

        expect(db.gardens.get().map(garden => garden.id)).toEqual(['1'])
      })

      it('should fit where a database of a part of its schema is expected', () => {
        const db = virtualDatabase(schema)
        const plants = (part: VirtualDatabase<Pick<typeof schema, 'plants'>>) => part.plants.get()

        expect(plants(db)).toEqual([])
        expect(db.fork(signedIn).session).toBe('user-1')
      })

      it('should refuse a schema with a name the database has of its own', () => {
        const db = virtualDatabase({
          // @ts-expect-error `fork` is the database's own
          fork: collection<Garden>()
        })

        expect(db).toBeDefined()
      })

      describe('fork', () => {
        it('should copy the database as it is now', () => {
          const db = virtualDatabase(schema, seed)

          db.gardens.update('1', {
            name: 'Courtyard garden'
          })

          const fork = db.fork()

          expect(fork.gardens.find('1')?.name).toBe('Courtyard garden')
          expect(fork.plants.get()).toEqual(db.plants.get())
        })

        it('should apply the recipes in order', () => {
          const db = virtualDatabase(schema, seed)
          const fork = db.fork(signedIn, emptyGarden, (db) => {
            db.plants.create({
              gardenId: '1',
              name: 'Boston fern'
            })
          })

          expect(fork.session).toBe('user-1')
          expect(fork.plants.where({
            gardenId: '1'
          }).map(plant => plant.name)).toEqual(['Boston fern'])
        })

        it('should skip a falsy recipe', () => {
          const db = virtualDatabase(schema, seed)
          const fork = db.fork(false, signedIn, null, undefined, 0, '')

          expect(fork.session).toBe('user-1')
        })

        it('should leave the database it was made of as it was', () => {
          const db = virtualDatabase(schema, seed)
          const fork = db.fork(signedIn, emptyGarden)

          fork.gardens.set([])

          expect(db.session).toBeNull()
          expect(db.plants.get()).toHaveLength(4)
          expect(db.gardens.get()).toHaveLength(2)
        })

        it('should not see the changes made to the database after the fork', () => {
          const db = virtualDatabase(schema, seed)
          const fork = db.fork()

          db.gardens.update('1', {
            name: 'Courtyard garden'
          })
          db.session = 'user-1'

          expect(fork.gardens.find('1')?.name).toBe('Garden 1')
          expect(fork.session).toBeNull()
        })

        it('should go on with the ids of the database it was made of', () => {
          const db = virtualDatabase(schema, seed)
          const first = db.fork()
          const second = db.fork()
          const plant = {
            gardenId: '2',
            name: 'Boston fern'
          }

          expect(first.plants.create(plant).id).toBe('5')
          expect(second.plants.create(plant).id).toBe('5')
          expect(db.plants.create(plant).id).toBe('5')
        })

        it('should share the records it has not changed', () => {
          const db = virtualDatabase(schema, seed)
          const fork = db.fork(emptyGarden)

          expect(fork.plants.find('4')).toBe(db.plants.find('4'))
        })

        it('should fork a fork', () => {
          const db = virtualDatabase(schema, seed)
          const signed = db.fork(signedIn)
          const empty = signed.fork(emptyGarden)

          expect(empty.session).toBe('user-1')
          expect(empty.plants.get()).toHaveLength(1)
          expect(signed.plants.get()).toHaveLength(4)
        })

        it('should run the seed when a database is forked before its first use', () => {
          const fill = vi.fn(seed)
          const fork = virtualDatabase(schema, fill).fork()

          expect(fill).toHaveBeenCalledTimes(1)
          expect(fork.plants.get()).toHaveLength(4)
        })

        it('should throw what a recipe throws', () => {
          const db = virtualDatabase(schema, seed)

          expect(() => db.fork(() => {
            throw new Error('No recipe')
          })).toThrow('No recipe')
        })
      })

      describe('reset', () => {
        it('should return the database to its seed', () => {
          const db = virtualDatabase(schema, seed)

          db.plants.set([])
          db.gardens.create({
            name: 'Courtyard garden'
          })
          db.session = 'user-1'
          db.reset()

          expect(db.plants.get()).toHaveLength(4)
          expect(db.gardens.get()).toHaveLength(2)
          expect(db.session).toBeNull()
        })

        it('should let a single collection go back to the seed', () => {
          const db = virtualDatabase(schema, seed)

          db.plants.set([])
          db.gardens.set([])
          db.plants.reset()

          expect(db.plants.get()).toHaveLength(4)
          expect(db.gardens.get()).toEqual([])
        })

        it('should not run the seed again', () => {
          const fill = vi.fn(seed)
          const db = virtualDatabase(schema, fill)

          db.plants.set([])
          db.reset()
          db.plants.get()

          expect(fill).toHaveBeenCalledTimes(1)
        })

        it('should return a fork to what its recipes made', () => {
          const db = virtualDatabase(schema, seed)
          const fork = db.fork(signedIn, emptyGarden)

          fork.plants.set([])
          fork.session = null
          fork.reset()

          expect(fork.plants.get()).toHaveLength(1)
          expect(fork.session).toBe('user-1')
        })

        it('should return the ids to where they were', () => {
          const db = virtualDatabase(schema, seed)

          db.plants.create({
            gardenId: '2',
            name: 'Boston fern'
          })
          db.reset()

          expect(db.plants.create({
            gardenId: '2',
            name: 'Lavender'
          }).id).toBe('5')
        })

        it('should leave a database that was not used yet to its seed', () => {
          const db = virtualDatabase(schema, seed)

          db.reset()

          expect(db.plants.get()).toHaveLength(4)
        })

        it('should keep the collections taken from the database in use', () => {
          const db = virtualDatabase(schema, seed)
          const { plants } = db

          plants.set([])
          db.reset()

          expect(plants.get()).toHaveLength(4)
        })

        it('should empty a database without a seed', () => {
          const db = virtualDatabase(schema)

          db.gardens.create({
            name: 'Courtyard garden'
          })
          db.reset()

          expect(db.gardens.get()).toEqual([])
        })

        it('should leave the forks made before it as they are', () => {
          const db = virtualDatabase(schema, seed)

          db.gardens.update('1', {
            name: 'Courtyard garden'
          })

          const fork = db.fork()

          db.reset()

          expect(fork.gardens.find('1')?.name).toBe('Courtyard garden')
          expect(db.gardens.find('1')?.name).toBe('Garden 1')
        })

        it('should return the database', () => {
          const db = virtualDatabase(schema)

          expect(db.reset()).toBe(db)
          expectTypeOf(db.reset()).toEqualTypeOf<Db>()
        })
      })
    })
  })
})
