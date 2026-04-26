import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import {
  debounce,
  effect,
  JsonCodec
} from '@nano_kit/store'
import { waitFor } from '../test/utils.js'
import { broadcasted } from './broadcast.js'

let id = 0

function channelName() {
  return `broadcast-${++id}`
}

describe('platform-web', () => {
  describe('broadcasted', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should use the default value before a message is received', () => {
      const $value = broadcasted(channelName(), 'idle')

      expect($value()).toBe('idle')
    })

    it('should sync values through BroadcastChannel', async () => {
      const name = channelName()
      const $source = broadcasted<string>(name)
      const $target = broadcasted(name, 'idle')
      const offSource = effect(() => {
        $source()
      })
      const offTarget = effect(() => {
        $target()
      })

      $source('ready')

      await waitFor(() => {
        expect($target()).toBe('ready')
      })

      offSource()
      offTarget()
    })

    it('should support codecs', async () => {
      const name = channelName()
      const $source = broadcasted(name, [] as number[], JsonCodec)
      const $target = broadcasted(name, [] as number[], JsonCodec)
      const offSource = effect(() => {
        $source()
      })
      const offTarget = effect(() => {
        $target()
      })

      $source([1, 2, 3])

      await waitFor(() => {
        expect($target()).toEqual([1, 2, 3])
      })

      offSource()
      offTarget()
    })

    it('should support rate limited writes', async () => {
      vi.useFakeTimers()

      const name = channelName()
      const $source = broadcasted(name, '', debounce(300))
      const $target = broadcasted(name, '')
      const offSource = effect(() => {
        $source()
      })
      const offTarget = effect(() => {
        $target()
      })

      $source('ready')

      expect($target()).toBe('')

      vi.advanceTimersByTime(300)
      vi.useRealTimers()

      await waitFor(() => {
        expect($target()).toBe('ready')
      })

      offSource()
      offTarget()
    })
  })
})
