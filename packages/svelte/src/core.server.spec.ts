// @vitest-environment node
import {
  describe,
  expect,
  it
} from 'vitest'
import {
  mountable,
  onMount,
  signal
} from '@nano_kit/store'
import { render } from 'svelte/server'
import './index.js'
import ServerStoreFixture from '../test/ServerStoreFixture.svelte'

describe('svelte', () => {
  describe('core', () => {
    describe('stores on the server', () => {
      it('should render the value of a store without mounting it', () => {
        const $value = mountable(signal('hello'))
        let mounts = 0

        onMount($value, () => {
          mounts++
        })

        expect(render(ServerStoreFixture, {
          props: {
            value: $value
          }
        }).body).toContain('hello')
        expect(mounts).toBe(0)
      })

      it('should leave no store mounted when the render throws', () => {
        const $value = mountable(signal('hello'))
        let mounts = 0

        onMount($value, () => {
          mounts++
        })

        // The result renders when its output is read
        expect(() => render(ServerStoreFixture, {
          props: {
            value: $value,
            fail: true
          }
        }).body).toThrow('The render fails after the store is read')
        expect(mounts).toBe(0)
      })
    })
  })
})
