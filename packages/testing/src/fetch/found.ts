import { HTTPException } from 'hono/http-exception'
import { NOT_FOUND_STATUS } from './constants.js'

/**
 * Checks that a record is there: a handler answers 404 when it is not, as a backend does for
 * an address that names nothing.
 * @param record - The record, or `undefined` or `null` when nothing was found.
 * @returns The record.
 * @throws {HTTPException} 404, when there is no record. The app answers with it.
 * @example
 * app.get('/garden/:gardenId/plants/:id', c => c.json(found(db.plants.find(c.req.param('id')))))
 */
export function found<T>(record: T | null | undefined): T {
  if (record === undefined || record === null) {
    throw new HTTPException(NOT_FOUND_STATUS, {
      message: 'Not Found'
    })
  }

  return record
}
