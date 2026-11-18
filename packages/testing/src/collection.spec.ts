import {
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  type Collection,
  collection
} from './collection.js'
import { virtualDatabase } from './database.js'

interface Garden {
  id: string
  name: string
  location: {
    city: string
    country: string
  }
}

interface Plant {
  id: string
  gardenId: string
  name: string
  pictureIds?: string[]
}

interface Post {
  id: number
  title: string
}

function createDb() {
  return virtualDatabase({
    gardens: collection<Garden>(),
    plants: collection<Plant>(),
    posts: collection<Post>({
      id: seq => seq
    })
  }, (db) => {
    db.gardens.createMany(2, index => ({
      name: `Garden ${index + 1}`,
      location: {
        city: 'London',
        country: 'United Kingdom'
      }
    }))
    db.plants.createMany(4, index => ({
      gardenId: index < 3 ? '1' : '2',
      name: `Plant ${index + 1}`,
      pictureIds: ['photo']
    }))
  })
}

describe('testing', () => {
  describe('collection', () => {
    describe('collection', () => {
      it('should make a collection that works on its own', () => {
        const plants = collection<Plant>()
        const plant = plants.create({
          gardenId: '1',
          name: 'Boston fern'
        })

        plants.update(plant.id, {
          name: 'Lavender'
        })

        expect(plants.get()).toEqual([
          {
            id: '1',
            gardenId: '1',
            name: 'Lavender'
          }
        ])
      })

      it('should make collections that share nothing', () => {
        const first = collection<Plant>()
        const second = collection<Plant>()

        first.create({
          gardenId: '1',
          name: 'Boston fern'
        })

        expect(second.get()).toEqual([])
      })

      it('should return a collection of the record', () => {
        expectTypeOf(collection<Plant>()).toEqualTypeOf<Collection<Plant>>()
        expectTypeOf(collection<Post>({
          id: seq => seq
        })).toEqualTypeOf<Collection<Post>>()
      })
    })

    describe('get', () => {
      it('should return records in the order they were created', () => {
        const db = createDb()

        expect(db.plants.get().map(plant => plant.name)).toEqual([
          'Plant 1',
          'Plant 2',
          'Plant 3',
          'Plant 4'
        ])
      })

      it('should return a read-only array', () => {
        const db = createDb()
        const plants = db.plants.get()

        expect(() => {
          // @ts-expect-error the array is read-only
          plants.reverse()
        }).toThrow(TypeError)
        expect(db.plants.get()[0].name).toBe('Plant 1')
      })

      it('should return an empty array when there are no records', () => {
        const db = createDb()

        expect(db.posts.get()).toEqual([])
      })
    })

    describe('find', () => {
      it('should find a record by its id', () => {
        const db = createDb()

        expect(db.plants.find('2')?.name).toBe('Plant 2')
      })

      it('should find the first record with the given fields', () => {
        const db = createDb()

        expect(db.plants.find({
          gardenId: '1'
        })?.name).toBe('Plant 1')
      })

      it('should match every given field', () => {
        const db = createDb()

        expect(db.plants.find({
          id: '4',
          gardenId: '1'
        })).toBeUndefined()
        expect(db.plants.find({
          id: '4',
          gardenId: '2'
        })?.name).toBe('Plant 4')
      })

      it('should find the first record a predicate holds for', () => {
        const db = createDb()

        expect(db.plants.find(plant => plant.name.endsWith('3'))?.id).toBe('3')
      })

      it('should return undefined when no record matches', () => {
        const db = createDb()

        expect(db.plants.find('404')).toBeUndefined()
      })

      it('should return the same record until it changes', () => {
        const db = createDb()
        const plant = db.plants.find('1')

        db.plants.update('2', {
          name: 'Renamed'
        })

        expect(db.plants.find('1')).toBe(plant)
      })
    })

    describe('where', () => {
      it('should return a read-only array', () => {
        const db = createDb()

        expect(Object.isFrozen(db.plants.where({
          gardenId: '1'
        }))).toBe(true)
      })

      it('should find every record with the given fields', () => {
        const db = createDb()

        expect(db.plants.where({
          gardenId: '1'
        }).map(plant => plant.id)).toEqual([
          '1',
          '2',
          '3'
        ])
      })

      it('should find every record a predicate holds for', () => {
        const db = createDb()

        expect(db.plants.where(plant => plant.gardenId !== '1').map(plant => plant.id)).toEqual(['4'])
      })

      it('should find the record with an id', () => {
        const db = createDb()

        expect(db.plants.where('3').map(plant => plant.name)).toEqual(['Plant 3'])
      })

      it('should return an empty array when no record matches', () => {
        const db = createDb()

        expect(db.plants.where({
          gardenId: '404'
        })).toEqual([])
      })
    })

    describe('create', () => {
      it('should give a record the next id', () => {
        const db = createDb()
        const plant = db.plants.create({
          gardenId: '2',
          name: 'Boston fern'
        })

        expect(plant).toEqual({
          id: '5',
          gardenId: '2',
          name: 'Boston fern'
        })
        expect(db.plants.find('5')).toBe(plant)
      })

      it('should keep a given id', () => {
        const db = createDb()

        expect(db.plants.create({
          id: 'fern',
          gardenId: '2',
          name: 'Boston fern'
        }).id).toBe('fern')
      })

      it('should give a number to a record created with its own id too', () => {
        const db = createDb()

        db.plants.create({
          id: 'fern',
          gardenId: '2',
          name: 'Boston fern'
        })

        expect(db.plants.create({
          gardenId: '2',
          name: 'Lavender'
        }).id).toBe('6')
      })

      it('should not give a number to a record that was not created', () => {
        const db = createDb()

        expect(() => db.plants.create({
          id: '1',
          gardenId: '2',
          name: 'Boston fern'
        })).toThrow()
        expect(db.plants.create({
          gardenId: '2',
          name: 'Lavender'
        }).id).toBe('5')
      })

      it('should make an id when the given one is undefined', () => {
        const db = createDb()

        expect(db.plants.create({
          ...db.plants.get()[0],
          id: undefined
        }).id).toBe('5')
      })

      it('should skip an id a record was created with', () => {
        const db = createDb()

        db.plants.create({
          id: '6',
          gardenId: '2',
          name: 'Boston fern'
        })

        expect(db.plants.create({
          gardenId: '2',
          name: 'Lavender'
        }).id).toBe('7')
      })

      it('should throw when the given id is taken', () => {
        const db = createDb()

        expect(() => db.plants.create({
          id: '1',
          gardenId: '2',
          name: 'Boston fern'
        })).toThrow('A record with the id "1" already exists')
      })

      it('should copy the given fields', () => {
        const db = createDb()
        const fields = {
          gardenId: '2',
          name: 'Boston fern',
          pictureIds: ['a']
        }
        const plant = db.plants.create(fields)

        fields.pictureIds.push('b')

        expect(plant.pictureIds).toEqual(['a'])
        expect(Object.isFrozen(fields)).toBe(false)
      })

      it('should require every field but the id', () => {
        const db = createDb()

        // @ts-expect-error the garden is missing
        expect(() => db.plants.create({
          name: 'Boston fern'
        })).not.toThrow()
        // @ts-expect-error the fields are missing
        expect(() => db.plants.create()).not.toThrow()
      })
    })

    describe('createMany', () => {
      it('should return a read-only array', () => {
        const db = createDb()

        expect(Object.isFrozen(db.plants.createMany(2, {
          gardenId: '1',
          name: 'Boston fern'
        }))).toBe(true)
      })

      it('should create a record of every given input', () => {
        const db = createDb()
        const plants = db.plants.createMany([
          {
            gardenId: '2',
            name: 'Boston fern'
          },
          {
            id: 'lavender',
            gardenId: '2',
            name: 'Lavender'
          }
        ])

        expect(plants.map(plant => plant.id)).toEqual(['5', 'lavender'])
        expect(db.plants.get()).toHaveLength(6)
      })

      it('should create a number of records with the same fields', () => {
        const db = createDb()
        const plants = db.plants.createMany(3, {
          gardenId: '2',
          name: 'Seedling'
        })

        expect(plants.map(plant => plant.id)).toEqual([
          '5',
          '6',
          '7'
        ])
        expect(plants.every(plant => plant.name === 'Seedling')).toBe(true)
      })

      it('should create a number of records with fields made from the index', () => {
        const db = createDb()
        const plants = db.plants.createMany(2, index => ({
          gardenId: '2',
          name: `Seedling ${index + 1}`
        }))

        expect(plants.map(plant => plant.name)).toEqual(['Seedling 1', 'Seedling 2'])
      })

      it('should require the fields when there is no entity', () => {
        const db = createDb()

        // @ts-expect-error the fields are missing
        expect(() => db.plants.createMany(1)).not.toThrow()
      })
    })

    describe('update', () => {
      it('should merge fields into the record with an id', () => {
        const db = createDb()
        const [plant] = db.plants.update('1', {
          name: 'Boston fern'
        })

        expect(plant).toEqual({
          id: '1',
          gardenId: '1',
          name: 'Boston fern',
          pictureIds: ['photo']
        })
        expect(db.plants.find('1')).toBe(plant)
      })

      it('should change every record with the given fields', () => {
        const db = createDb()
        const plants = db.plants.update({
          gardenId: '1'
        }, {
          pictureIds: []
        })

        expect(plants.map(plant => plant.id)).toEqual([
          '1',
          '2',
          '3'
        ])
        expect(db.plants.find('2')?.pictureIds).toEqual([])
        expect(db.plants.find('4')?.pictureIds).toEqual(['photo'])
      })

      it('should change every record a predicate holds for', () => {
        const db = createDb()
        const plants = db.plants.update(plant => plant.gardenId === '1', (plant) => {
          plant.name = `${plant.name} of garden 1`
        })

        expect(plants.map(plant => plant.name)).toEqual([
          'Plant 1 of garden 1',
          'Plant 2 of garden 1',
          'Plant 3 of garden 1'
        ])
      })

      it('should throw when there is no record with the id', () => {
        const db = createDb()

        expect(() => db.plants.update('404', {
          name: 'Boston fern'
        })).toThrow('Cannot update: no record has the id "404"')
        expect(() => db.posts.update(404, {
          title: 'Spring'
        })).toThrow('Cannot update: no record has the id 404')
      })

      it('should change nothing when fields or a predicate pick no record', () => {
        const db = createDb()
        const before = db.plants.get()

        expect(db.plants.update({
          id: '4',
          gardenId: '1'
        }, {
          name: 'Boston fern'
        })).toEqual([])
        expect(db.plants.update(() => false, {
          name: 'Boston fern'
        })).toEqual([])
        expect(db.plants.get()).toEqual(before)
      })

      it('should let a function edit a draft of the record in place', () => {
        const db = createDb()

        db.gardens.update('1', (garden) => {
          garden.name = 'Courtyard garden'
          garden.location.city = 'Bucharest'
        })

        expect(db.gardens.find('1')).toEqual({
          id: '1',
          name: 'Courtyard garden',
          location: {
            city: 'Bucharest',
            country: 'United Kingdom'
          }
        })
      })

      it('should merge the fields a function returns', () => {
        const db = createDb()

        db.plants.update('1', plant => ({
          pictureIds: [...plant.pictureIds ?? [], 'second']
        }))

        expect(db.plants.find('1')?.pictureIds).toEqual(['photo', 'second'])
      })

      it('should merge only the top level of the fields', () => {
        const db = createDb()

        db.gardens.update('1', {
          location: {
            city: 'Bucharest',
            country: 'Romania'
          }
        })

        expect(db.gardens.find('1')?.location).toEqual({
          city: 'Bucharest',
          country: 'Romania'
        })
      })

      it('should keep the id of the record', () => {
        const db = createDb()

        db.plants.update('1', {
          id: '2'
        })
        db.plants.update('3', (plant) => {
          plant.id = '4'
        })

        expect(db.plants.get().map(plant => plant.id)).toEqual([
          '1',
          '2',
          '3',
          '4'
        ])
      })

      it('should keep the order of the records', () => {
        const db = createDb()

        db.plants.update('2', {
          name: 'Boston fern'
        })

        expect(db.plants.get().map(plant => plant.name)).toEqual([
          'Plant 1',
          'Boston fern',
          'Plant 3',
          'Plant 4'
        ])
      })

      it('should leave the record held before the update as it was', () => {
        const db = createDb()
        const before = db.plants.find('1')

        db.plants.update('1', {
          name: 'Boston fern'
        })

        expect(before?.name).toBe('Plant 1')
      })

      it('should return a read-only list of the changed records', () => {
        const db = createDb()
        const updated = db.plants.update('1', {})

        expect(Object.isFrozen(updated)).toBe(true)
        expectTypeOf(updated).toEqualTypeOf<readonly Readonly<Plant>[]>()
        expectTypeOf(db.posts.update).returns.toEqualTypeOf<readonly Readonly<Post>[]>()
      })
    })

    describe('delete', () => {
      it('should delete the record with an id', () => {
        const db = createDb()

        expect(db.plants.delete('2').map(plant => plant.id)).toEqual(['2'])
        expect(db.plants.get().map(plant => plant.id)).toEqual([
          '1',
          '3',
          '4'
        ])
      })

      it('should delete every record with the given fields', () => {
        const db = createDb()

        expect(db.plants.delete({
          gardenId: '1'
        }).map(plant => plant.id)).toEqual([
          '1',
          '2',
          '3'
        ])
        expect(db.plants.get().map(plant => plant.id)).toEqual(['4'])
      })

      it('should delete every record a predicate holds for', () => {
        const db = createDb()

        expect(db.plants.delete(plant => plant.id !== '1')).toHaveLength(3)
        expect(db.plants.get().map(plant => plant.id)).toEqual(['1'])
      })

      it('should throw when there is no record with the id', () => {
        const db = createDb()

        expect(() => db.plants.delete('404')).toThrow('Cannot delete: no record has the id "404"')
        expect(db.plants.get()).toHaveLength(4)
      })

      it('should delete nothing when fields or a predicate pick no record', () => {
        const db = createDb()

        expect(db.plants.delete({
          gardenId: '404'
        })).toEqual([])
        expect(db.plants.delete(() => false)).toEqual([])
        expect(db.plants.get()).toHaveLength(4)
      })

      it('should not give a deleted id to a new record', () => {
        const db = createDb()

        db.plants.delete('4')

        expect(db.plants.create({
          gardenId: '2',
          name: 'Boston fern'
        }).id).toBe('5')
      })

      it('should delete every record while they are walked', () => {
        const db = createDb()

        db.plants.get().forEach(plant => db.plants.delete(plant.id))

        expect(db.plants.get()).toEqual([])
      })

      it('should return a read-only list of the deleted records', () => {
        const db = createDb()
        const deleted = db.plants.delete('1')

        expect(Object.isFrozen(deleted)).toBe(true)
        expectTypeOf(deleted).toEqualTypeOf<readonly Readonly<Plant>[]>()
      })
    })

    describe('set', () => {
      it('should replace the records with the given ones', () => {
        const db = createDb()

        db.plants.set(db.plants.get().toReversed().slice(0, 2))

        expect(db.plants.get().map(plant => plant.id)).toEqual(['4', '3'])
      })

      it('should empty the collection with an empty list', () => {
        const db = createDb()

        db.plants.set([])

        expect(db.plants.get()).toEqual([])
      })

      it('should keep the records it already held as they are', () => {
        const db = createDb()
        const plant = db.plants.find('1')

        db.plants.set(db.plants.where({
          gardenId: '1'
        }))

        expect(db.plants.find('1')).toBe(plant)
      })

      it('should go on with the ids from where they were', () => {
        const db = createDb()

        db.plants.set([])

        expect(db.plants.create({
          gardenId: '2',
          name: 'Boston fern'
        }).id).toBe('5')
      })

      it('should return the collection', () => {
        const db = createDb()

        expect(db.plants.set([])).toBe(db.plants)
      })
    })

    describe('fork', () => {
      it('should copy the records and the parameters', () => {
        const db = createDb()

        db.posts.create({
          title: 'First'
        })

        const posts = db.posts.fork()

        expect(posts.get()).toEqual(db.posts.get())
        expect(posts.create({
          title: 'Second'
        }).id).toBe(2)
      })

      it('should share no changes with the collection it was made of', () => {
        const db = createDb()
        const plants = db.plants.fork()

        plants.delete({
          gardenId: '1'
        })
        db.plants.update('4', {
          name: 'Boston fern'
        })

        expect(db.plants.get()).toHaveLength(4)
        expect(plants.get().map(plant => plant.name)).toEqual(['Plant 4'])
      })
    })

    describe('reset', () => {
      it('should bring back the records it was made with', () => {
        const posts = collection<Post>({
          id: seq => seq
        })

        posts.create({
          title: 'First'
        })
        posts.reset()

        expect(posts.get()).toEqual([])
      })

      it('should bring back the numbers new records take', () => {
        const db = createDb()

        db.plants.create({
          gardenId: '2',
          name: 'Boston fern'
        })
        db.plants.reset()

        expect(db.plants.create({
          gardenId: '2',
          name: 'Lavender'
        }).id).toBe('5')
      })

      it('should bring a fork back to the records it was forked with', () => {
        const db = createDb()
        const plants = db.plants.fork()

        plants.set([])
        plants.reset()

        expect(plants.get()).toEqual(db.plants.get())
      })

      it('should return the collection', () => {
        const db = createDb()

        expect(db.plants.reset()).toBe(db.plants)
      })
    })

    describe('initial', () => {
      it('should hold the given records at first', () => {
        const plants = collection<Plant>({
          initial: [
            {
              id: 'fern',
              gardenId: '1',
              name: 'Boston fern'
            }
          ]
        })

        expect(plants.get()).toEqual([
          {
            id: 'fern',
            gardenId: '1',
            name: 'Boston fern'
          }
        ])
      })

      it('should number new records after the given ones', () => {
        const plants = collection<Plant>({
          initial: [
            {
              id: 'fern',
              gardenId: '1',
              name: 'Boston fern'
            },
            {
              id: 'rose',
              gardenId: '1',
              name: 'Rose'
            }
          ]
        })

        expect(plants.create({
          gardenId: '1',
          name: 'Lavender'
        }).id).toBe('3')
      })

      it('should keep a read-only copy of the given records', () => {
        const fern = {
          id: 'fern',
          gardenId: '1',
          name: 'Boston fern'
        }
        const plants = collection<Plant>({
          initial: [fern]
        })

        fern.name = 'Lavender'

        expect(plants.find('fern')?.name).toBe('Boston fern')
        expect(Object.isFrozen(plants.find('fern'))).toBe(true)
      })

      it('should be what reset() brings back', () => {
        const plants = collection<Plant>({
          initial: [
            {
              id: 'fern',
              gardenId: '1',
              name: 'Boston fern'
            }
          ]
        })

        plants.set([])
        plants.reset()

        expect(plants.get().map(plant => plant.id)).toEqual(['fern'])
      })
    })

    describe('id', () => {
      it('should make ids with the given function', () => {
        const db = createDb()

        expect(db.posts.createMany(2, {
          title: 'Post'
        }).map(post => post.id)).toEqual([1, 2])
        expect(db.posts.find(2)?.title).toBe('Post')
      })

      it('should make string ids by default', () => {
        const db = createDb()

        expect(db.gardens.get().map(garden => garden.id)).toEqual(['1', '2'])
      })

      it('should require a way to make ids that are not strings', () => {
        // @ts-expect-error the ids of posts are numbers, the default ones are strings
        expect(collection<Post>()).toBeDefined()
        // @ts-expect-error the ids of posts are numbers, the default ones are strings
        expect(collection<Post>({})).toBeDefined()
        // @ts-expect-error the ids of posts are numbers, the default ones are strings
        expect(collection<Post>({
          entity: () => ({
            title: 'Untitled'
          })
        })).toBeDefined()
      })

      it('should refuse ids of another type than the one of the record', () => {
        expect(collection<Plant>({
          // @ts-expect-error the ids of plants are strings
          id: seq => seq
        })).toBeDefined()
      })

      it('should throw when the made ids repeat', () => {
        const db = virtualDatabase({
          posts: collection<Post>({
            id: () => 1
          })
        })

        db.posts.create({
          title: 'First'
        })

        expect(() => db.posts.create({
          title: 'Second'
        })).toThrow('Cannot make a new id: 1 is made again')
      })
    })

    describe('entity', () => {
      function createPlant(seq: number) {
        return {
          gardenId: '1',
          name: `Plant ${seq}`,
          pictureIds: ['photo']
        }
      }

      function createDbWithEntity() {
        return virtualDatabase({
          plants: collection<Plant>({
            entity: createPlant
          }),
          posts: collection<Post>({
            id: seq => seq,
            entity: () => ({
              title: 'Untitled'
            })
          })
        })
      }

      it('should fill the fields create() is not told', () => {
        const db = createDbWithEntity()

        expect(db.plants.create({
          gardenId: '2'
        })).toEqual({
          id: '1',
          gardenId: '2',
          name: 'Plant 1',
          pictureIds: ['photo']
        })
      })

      it('should let create() override the entity', () => {
        const db = createDbWithEntity()

        expect(db.plants.create({
          name: 'Boston fern'
        }).name).toBe('Boston fern')
      })

      it('should let a record be created with no fields', () => {
        const db = createDbWithEntity()

        expect(db.plants.create()).toEqual({
          id: '1',
          gardenId: '1',
          name: 'Plant 1',
          pictureIds: ['photo']
        })
        expect(db.posts.create()).toEqual({
          id: 1,
          title: 'Untitled'
        })
        expect(db.posts.createMany(2).map(post => post.id)).toEqual([2, 3])
      })

      it('should make the entity anew for every record', () => {
        const db = createDbWithEntity()
        const [first, second] = db.plants.createMany(2)

        expect(first.pictureIds).not.toBe(second.pictureIds)
      })

      it('should make the entity from the number of the record', () => {
        const db = createDbWithEntity()

        expect(db.plants.createMany(2).map(plant => [plant.id, plant.name])).toEqual([['1', 'Plant 1'], ['2', 'Plant 2']])
      })

      it('should give the next number to the entity of a record created with its own id', () => {
        const db = createDbWithEntity()

        db.plants.create()

        expect(db.plants.create({
          id: 'fern'
        }).name).toBe('Plant 2')
        expect(db.plants.create()).toMatchObject({
          id: '3',
          name: 'Plant 3'
        })
      })

      it('should make every field optional for create()', () => {
        const db = createDbWithEntity()

        expectTypeOf(db.plants.create).parameter(0).toEqualTypeOf<{
          id?: string
          gardenId?: string
          name?: string
          pictureIds?: string[]
        } | undefined>()
      })

      it('should require the entity to give every field', () => {
        const createName = (seq: number) => ({
          name: `Plant ${seq}`
        })

        expect(collection<Plant>({
          // @ts-expect-error the entity does not give the garden
          entity: createName
        })).toBeDefined()
      })

      it('should refuse an entity that does not make fields of the record', () => {
        expect(collection<Post>({
          id: seq => seq,
          // @ts-expect-error `title` is a string
          entity: () => ({
            title: 1
          })
        })).toBeDefined()
      })
    })

    describe('records', () => {
      it('should refuse a write to a field', () => {
        const db = createDb()
        const plant = db.plants.find('1')!

        expect(() => {
          // @ts-expect-error a record is read-only
          plant.name = 'Boston fern'
        }).toThrow(TypeError)
        expect(db.plants.find('1')?.name).toBe('Plant 1')
      })

      it('should refuse a write to a nested object', () => {
        const db = createDb()
        const garden = db.gardens.find('1')!

        expect(() => {
          garden.location.city = 'Bucharest'
        }).toThrow(TypeError)
      })

      it('should refuse a write to a nested array', () => {
        const db = createDb()
        const plant = db.plants.find('1')!

        expect(() => plant.pictureIds?.push('second')).toThrow(TypeError)
      })

      it('should keep by reference what is not plain data', () => {
        const db = virtualDatabase({
          files: collection<{
            id: string
            takenAt: Date
            blob: Blob
          }>()
        })
        const takenAt = new Date(0)
        const blob = new Blob(['photo'])
        const file = db.files.create({
          takenAt,
          blob
        })

        expect(file.takenAt).toBe(takenAt)
        expect(file.blob).toBe(blob)
        expect(db.files.update(file.id, {})[0].blob).toBe(blob)
      })

      it('should be assignable to the type of the record', () => {
        const db = createDb()
        const plant: Plant | undefined = db.plants.find('1')

        expectTypeOf(db.plants.find('1')).toEqualTypeOf<Readonly<Plant> | undefined>()
        expectTypeOf(db.plants.where({})).toEqualTypeOf<readonly Readonly<Plant>[]>()
        expectTypeOf(db.plants.get()).toEqualTypeOf<readonly Readonly<Plant>[]>()
        expect(plant).toBeDefined()
      })
    })
  })
})
