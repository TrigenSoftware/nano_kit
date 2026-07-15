import {
  Injectable$,
  inject
} from '@nano_kit/store'
import type {
  LoginParams,
  User
} from './user.types'
import {
  ApiService$,
  HttpStatus
} from './api'
import { UserError } from './user.types'

export * from './user.types'

export class UserService$ extends Injectable$ {
  api = inject(ApiService$)

  /**
   * Fetch the current session user.
   * @returns Public user payload.
   */
  async getUser() {
    const response = await this.api.fetch('users/me')

    if (!response.ok) {
      if (response.status === HttpStatus.Unauthorized) {
        throw new Error(UserError.Unauthenticated)
      }

      throw new Error(response.statusText || `Request failed with status ${response.status}`)
    }

    return await response.json() as User
  }

  /**
   * Login with demo credentials. The API responds with a `Set-Cookie` header,
   * so the session cookie is stored by the browser (or by the SSR cookie store).
   * @param params - Username and password.
   * @returns Public user payload.
   */
  async login(params: LoginParams) {
    const response = await this.api.fetch('auth/login', {
      method: 'POST',
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      if (response.status === HttpStatus.Unauthorized) {
        throw new Error(UserError.LoginInvalidCredentials)
      }

      throw new Error(UserError.LoginFailed)
    }

    return await response.json() as User
  }

  /**
   * Logout the current session. The API deletes the session cookie.
   */
  async logout() {
    const response = await this.api.fetch('auth/logout', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(response.statusText || `Request failed with status ${response.status}`)
    }
  }
}
