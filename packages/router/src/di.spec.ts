import {
  describe,
  it,
  expect
} from 'vitest'
import {
  InjectionContext,
  inject,
  provide
} from '@nano_kit/store'
import { virtualNavigation } from './navigation.js'
import {
  page,
  router
} from './router.js'
import { title } from './head.js'
import {
  Page$,
  Title$
} from './di.js'

const routes = {
  home: '/home',
  about: '/about'
}

describe('router', () => {
  describe('di', () => {
    describe('Title$', () => {
      it('should give the title of the current page', () => {
        const [$location, navigation] = virtualNavigation('/home', routes)
        const $page = router($location, [
          page('home', {
            default: 'Home',
            Head$: () => [title('Home')]
          }),
          page('about', {
            default: 'About',
            Head$: () => [title('About')]
          })
        ])
        const context = new InjectionContext([
          provide(Page$, $page)
        ])
        const $title = inject(Title$, context)

        expect($title()).toBe('Home')

        navigation.push('/about')

        expect($title()).toBe('About')
      })

      it('should resolve head factories within the injection context', () => {
        function Brand$() {
          return 'Plant1t'
        }

        const [$location] = virtualNavigation('/home', routes)
        const $page = router($location, [
          page('home', {
            default: 'Home',
            Head$: () => [title(`Home | ${inject(Brand$)}`)]
          })
        ])
        const context = new InjectionContext([
          provide(Page$, $page)
        ])

        expect(inject(Title$, context)()).toBe('Home | Plant1t')
      })
    })
  })
})
