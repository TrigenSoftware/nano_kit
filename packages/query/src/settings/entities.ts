import type { PickNonEmptyValue } from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type {
  CacheKey,
  CacheShardKey
} from '../CacheStorage.types.js'
import type {
  ClientContext,
  MutationClientContext,
  QueryClientContext
} from '../ClientContext.js'
import { queryKey } from '../cache.js'

export type Entity<T extends {}> = (
  (id: number | string | T) => CacheKey<[id: number | string], T | null>
) & CacheShardKey

export interface EntityCapture {
  <T extends {}>(
    EntityFn: Entity<T>
  ): (entity: T) => T
  <T extends {}>(
    EntityFn: Entity<T>,
    entity: T
  ): T
}

export type EntityMapper<T> = (
  (
    capture: EntityCapture,
    data: T
  ) => T
) | Entity<T extends {} ? T : {}>

const ENTITY_KEY = '#entity'
const EntityKey = queryKey(ENTITY_KEY)

interface EntityRef {
  [ENTITY_KEY]: CacheKey
}

function isIdentifier(value: unknown): value is number | string {
  const type = typeof value

  return type === 'number' || type === 'string'
}

/**
 * Create an entity manager for a specific entity type.
 * @param name - The name of the entity type.
 * @returns The entity manager.
 */
export function entity<T extends { id: number | string }>(
  name: string
): Entity<T>

/**
 * Create an entity manager for a specific entity type.
 * @param name - The name of the entity type.
 * @param id - A function to extract the identifier from the entity.
 * @returns The entity manager.
 */
export function entity<T extends {}>(
  name: string,
  id: (entity: T) => number | string
): Entity<T>

/* @__NO_SIDE_EFFECTS__ */
export function entity<T extends { id: number | string }>(
  name: string,
  id = (entity: T) => entity.id
) {
  const entityKey = (idOrRefOrEntity: number | string | null | undefined | T) => {
    if (isIdentifier(idOrRefOrEntity)) {
      return EntityKey(name, idOrRefOrEntity)
    }

    if (!idOrRefOrEntity) {
      return idOrRefOrEntity
    }

    return EntityKey(name, id(idOrRefOrEntity))
  }

  return Object.assign(entityKey, EntityKey)
}

/**
 * Map entities from the fetched data.
 * @param mapper - A function to map entities from the fetched data.
 * @returns The client setting function.
 */
export function entities<T>(
  mapper: NoInfer<EntityMapper<PickNonEmptyValue<T>>>
): ClientSetting<QueryClientContext<T>>

/**
 * Map entities from the fetched data.
 * @param mapper - A function to map entities from the fetched data.
 * @returns The client setting function.
 */
export function entities<T>(
  mapper: NoInfer<EntityMapper<PickNonEmptyValue<T>>>
): ClientSetting<MutationClientContext<T>>

/* @__NO_SIDE_EFFECTS__ */
export function entities(
  mapper: EntityMapper<unknown>
) {
  return (ctx: ClientContext) => {
    const ref = (
      EntityFn: Entity<{}>,
      entity: {}
    ) => {
      if (!entity) {
        return (entity: {}) => ref(EntityFn, entity)
      }

      const key = EntityFn(entity)

      ctx.set(key, {
        ...ctx.initial(),
        params: key.params,
        data: entity
      })

      return {
        ...entity,
        [ENTITY_KEY]: key
      }
    }
    const deref = (
      EntityFn: Entity<{}>,
      entity: {}
    ) => {
      if (!entity) {
        return (entity: {}) => deref(EntityFn, entity)
      }

      const key = (entity as EntityRef)[ENTITY_KEY] ?? EntityFn(entity)

      return ctx.$get(key).data as {} ?? entity
    }
    const wrap = (
      map: (
        EntityFn: Entity<{}>,
        entity: {}
      ) => {}
    ) => (data: {}) => data && (
      'shard' in mapper
        ? map(mapper, data)
        : mapper(map as EntityCapture, data)
    )

    ctx.mapData = wrap(ref)
    ctx.mapComputedData = wrap(deref)
  }
}
