import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { page } from 'vitest/browser'
import { effect } from '@nano_kit/store'
import { waitFor } from '../test/utils.js'
import { mediaQuery } from './matchMedia.js'

describe('platform-web', () => {
  describe('matchMedia', () => {
    beforeEach(async () => {
      await page.viewport(1280, 720)
    })

    it('should read the current media query match state', async () => {
      const $matches = mediaQuery('(min-width: 768px)')

      expect($matches()).toBe(true)

      await page.viewport(640, 720)

      expect($matches()).toBe(false)
    })

    it('should react to media query changes', async () => {
      const $matches = mediaQuery('(min-width: 768px)')
      const onMatches = vi.fn()
      const off = effect(() => {
        onMatches($matches())
      })

      expect(onMatches).toHaveBeenCalledTimes(1)
      expect(onMatches).toHaveBeenNthCalledWith(1, true)

      await page.viewport(640, 720)

      await waitFor(() => {
        expect(onMatches).toHaveBeenLastCalledWith(false)
      })

      off()
    })
  })
})
