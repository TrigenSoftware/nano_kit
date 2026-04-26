import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { commands } from 'vitest/browser'
import { effect } from '@nano_kit/store'
import { waitFor } from '../test/utils.js'
import { permission } from './permission.js'

describe('platform-web', () => {
  describe('permission', () => {
    beforeEach(async () => {
      await commands.clearPermissions()
    })

    it('should resolve permission state from a string name', async () => {
      await commands.grantPermissions(['geolocation'])

      const $permission = permission('geolocation')

      expect($permission()).toBeUndefined()

      const off = effect(() => {
        $permission()
      })

      await waitFor(() => {
        expect($permission()).toBe('granted')
      })

      off()
    })

    it('should react to permission changes', async () => {
      const $permission = permission({
        name: 'geolocation'
      })
      const onPermission = vi.fn()
      const off = effect(() => {
        onPermission($permission())
      })

      await waitFor(() => {
        expect(onPermission).toHaveBeenLastCalledWith('prompt')
      })

      await commands.grantPermissions(['geolocation'])

      await waitFor(() => {
        expect(onPermission).toHaveBeenLastCalledWith('granted')
      })

      off()
    })

    it('should expose query errors as signal values', async () => {
      const $permission = permission('unknown-permission')
      const off = effect(() => {
        $permission()
      })

      expect($permission()).toBeUndefined()

      await waitFor(() => {
        expect($permission()).toBeInstanceOf(Error)
      })

      off()
    })
  })
})
