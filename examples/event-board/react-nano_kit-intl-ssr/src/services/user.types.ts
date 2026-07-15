export const UserError = {
  Unauthenticated: 'UNAUTHENTICATED',
  LoginFailed: 'LOGIN_FAILED',
  LoginInvalidCredentials: 'LOGIN_INVALID_CREDENTIALS'
} as const

export type UserError = typeof UserError[keyof typeof UserError]

export interface User {
  id: string
  username: string
  name: string
}

export interface LoginParams {
  username: string
  password: string
}
