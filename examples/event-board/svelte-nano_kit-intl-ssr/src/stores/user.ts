import {
  inject,
  onMountEffect
} from '@nano_kit/store'
import {
  keys,
  onSuccess,
  queryKey
} from '@nano_kit/query'
import {
  LocationNavigation$,
  Paths$
} from '@nano_kit/router'
import {
  type LoginParams,
  type User,
  UserError,
  UserService$
} from '#src/services/user'
import { Client$ } from './query'
import { TranslationsKey } from './intl'
import { publicRoutes } from './router'

export const UserKey = queryKey<[], User>('user')

export function User$() {
  const userService = inject(UserService$)
  const [$location, navigation] = inject(LocationNavigation$)
  const paths = inject(Paths$)
  const {
    query,
    mutation,
    invalidate
  } = inject(Client$)
  const [
    $user,
    $userError,
    $userLoading
  ] = query(UserKey, [], () => userService.getUser())
  const invalidateSession = () => {
    keys(Key => Key !== TranslationsKey && invalidate(Key))
  }
  const [
    login, ,
    $loginError,
    $loginLoading
  ] = mutation<[params: LoginParams], User>(
    (params, ctx) => {
      onSuccess(ctx, () => {
        invalidateSession()
        navigation.replace(paths.home)
      })

      return userService.login(params)
    }
  )
  const logout = async () => {
    await userService.logout()
    invalidateSession()
  }

  onMountEffect($user, () => {
    const route = $location.$route()
    const userError = $userError()

    if (userError === UserError.Unauthenticated && route && !publicRoutes.has(route)) {
      navigation.replace(paths.login)
    }
  })

  return {
    login,
    logout,
    $user,
    $userError,
    $userLoading,
    $loginError,
    $loginLoading
  }
}
