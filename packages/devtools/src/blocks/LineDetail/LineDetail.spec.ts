import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  screen
} from '@nanoviews/testing-library'
import type { NodeRecord } from '../../services/registry/index.js'
import { LineDetail } from './LineDetail.js'

function renderInvalidated(kind: NodeRecord['kind']) {
  render(() => LineDetail({
    line: {
      kind: 'invalidated',
      record: {
        kind
      } as NodeRecord,
      depth: 0
    }
  }))
}

describe('devtools', () => {
  describe('blocks', () => {
    describe('LineDetail', () => {
      it('should say a computed an update left out of date was not read', () => {
        renderInvalidated('computed')

        expect(screen.getByText('not read, stays dirty')).toBeDefined()
      })

      it('should say an effect an update left out of date was not run', () => {
        renderInvalidated('effect')

        expect(screen.getByText('not run, stays dirty')).toBeDefined()
      })
    })
  })
})
