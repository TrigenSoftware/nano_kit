import {
  vi,
  beforeEach,
  afterEach,
  describe,
  it,
  expect
} from 'vitest'
import {
  computed,
  effect,
  signal,
  mountable,
  STORE_UNMOUNT_DELAY
} from 'kida'
import { debounce } from './utils.js'
import {
  pace,
  paced
} from './paced.js'

describe('store', () => {
  describe('paced', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should pace signal update', () => {
      const $source = signal(0)
      const $paced = paced($source, debounce(300))
      const sourceListener = vi.fn()
      const pacedListener = vi.fn()
      const offSource = effect(() => {
        sourceListener($source())
      })
      const offPaced = effect(() => {
        pacedListener($paced())
      })

      expect($source()).toBe(0)
      expect($paced()).toBe(0)
      expect(sourceListener).toHaveBeenCalledTimes(1)
      expect(pacedListener).toHaveBeenCalledTimes(1)

      $paced(1)

      expect($source()).toBe(0)
      expect($paced()).toBe(1)
      expect(sourceListener).toHaveBeenCalledTimes(1)
      expect(pacedListener).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(100)

      expect($source()).toBe(0)
      expect($paced()).toBe(1)
      expect(sourceListener).toHaveBeenCalledTimes(1)
      expect(pacedListener).toHaveBeenCalledTimes(2)

      $paced(2)

      expect($source()).toBe(0)
      expect($paced()).toBe(2)
      expect(sourceListener).toHaveBeenCalledTimes(1)
      expect(pacedListener).toHaveBeenCalledTimes(3)

      vi.advanceTimersByTime(100)

      expect($source()).toBe(0)
      expect($paced()).toBe(2)
      expect(sourceListener).toHaveBeenCalledTimes(1)
      expect(pacedListener).toHaveBeenCalledTimes(3)

      $paced(3)

      expect($source()).toBe(0)
      expect($paced()).toBe(3)
      expect(sourceListener).toHaveBeenCalledTimes(1)
      expect(pacedListener).toHaveBeenCalledTimes(4)

      vi.advanceTimersByTime(300)

      expect($source()).toBe(3)
      expect($paced()).toBe(3)
      expect(sourceListener).toHaveBeenCalledTimes(2)
      expect(pacedListener).toHaveBeenCalledTimes(4)

      offSource()
      offPaced()
    })

    it('should mount source signal on proxy mount', () => {
      const $source = mountable(signal(0))
      const $paced = mountable(paced($source, debounce(300)))

      expect($source.node.subsCount).toBe(0)
      expect($paced.node.subsCount).toBe(0)

      const stop3 = effect(() => {
        $paced()
      })

      expect($source.node.subsCount).toBe(1)
      expect($paced.node.subsCount).toBe(1)

      stop3()

      vi.advanceTimersByTime(STORE_UNMOUNT_DELAY)

      expect($source.node.subsCount).toBe(0)
      expect($paced.node.subsCount).toBe(0)
    })
  })

  describe('pace', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should pace computed value update', () => {
      const $source = signal(0)
      const $paced = computed(pace($source, debounce(300)))
      const pacedListener = vi.fn()
      const offPaced = effect(() => {
        pacedListener($paced())
      })

      expect($source()).toBe(0)
      expect($paced()).toBe(0)
      expect(pacedListener).toHaveBeenCalledTimes(1)

      $source(1)

      expect($source()).toBe(1)
      expect($paced()).toBe(0)
      expect(pacedListener).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)

      $source(2)

      expect($source()).toBe(2)
      expect($paced()).toBe(0)
      expect(pacedListener).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(300)

      expect($paced()).toBe(2)
      expect(pacedListener).toHaveBeenCalledTimes(2)

      offPaced()
    })
  })
})
