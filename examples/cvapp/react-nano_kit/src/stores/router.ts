import {
  browserNavigation,
  buildPaths,
  param
} from '@nano_kit/router'

export const routes = {
  home: '/',
  newApplication: '/application/new',
  application: '/application/:id'
} as const

export const paths = buildPaths(routes)

export const [$location, navigation] = browserNavigation(routes)

export const $applicationId = param($location, 'id')
