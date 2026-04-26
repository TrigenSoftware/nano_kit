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
import {
  $geolocation,
  $staticGeolocation
} from './geolocation.js'

describe('platform-web', () => {
  describe('geolocation', () => {
    beforeEach(async () => {
      await commands.clearPermissions()
      await commands.setGeolocation(10, 20)

      $geolocation(undefined)
      $staticGeolocation(undefined)
    })

    it('should resolve a single geolocation snapshot', async () => {
      await commands.grantPermissions(['geolocation'])

      const off = effect(() => {
        $staticGeolocation()
      })

      await waitFor(() => {
        expect($staticGeolocation()).toMatchObject({
          coords: {
            latitude: 10,
            longitude: 20
          }
        })
      })

      off()
    })

    it('should react to live geolocation updates', async () => {
      await commands.grantPermissions(['geolocation'])

      const onPosition = vi.fn()
      const off = effect(() => {
        onPosition($geolocation())
      })

      await waitFor(() => {
        expect($geolocation()).toMatchObject({
          coords: {
            latitude: 10,
            longitude: 20
          }
        })
      })

      await commands.setGeolocation(30, 40)

      await waitFor(() => {
        expect($geolocation()).toMatchObject({
          coords: {
            latitude: 30,
            longitude: 40
          }
        })
      })

      expect(onPosition).toHaveBeenCalled()

      off()
    })
  })
})
