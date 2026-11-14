import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  cleanup,
  render
} from '@testing-library/svelte'
import { tick } from 'svelte'
import { virtualNavigation } from '@nano_kit/router'
import { router } from './core.js'
import {
  layout,
  page,
  notFound
} from './type-overrides.js'
import RouterAppFixture from '../test/RouterAppFixture.svelte'
import HomeShortPage from '../test/pages/HomeShortPage.svelte'
import NotFoundPage from '../test/pages/NotFoundPage.svelte'
import AuthShortLayout from '../test/layouts/AuthShortLayout.svelte'
import DashboardLayout from '../test/layouts/DashboardLayout.svelte'
import {
  resetAuthShortLayoutRenders,
  resetDashboardLayoutRenders
} from '../test/layouts/renders.js'

function getHtml(container: HTMLElement) {
  return container.innerHTML.replaceAll('<!---->', '')
}

afterEach(cleanup)

describe('svelte-router', () => {
  describe('type-overrides', () => {
    describe('layout', () => {
      it('should render not found page in a layout of its own', async () => {
        resetAuthShortLayoutRenders()
        resetDashboardLayoutRenders()

        const [$location, navigation] = virtualNavigation('/home', {
          home: '/home'
        })
        const $page = router($location, [
          layout(AuthShortLayout, [
            page('home', HomeShortPage),
            layout(DashboardLayout, [
              notFound(NotFoundPage)
            ])
          ])
        ])
        const { container } = render(RouterAppFixture, {
          props: {
            page: $page
          }
        })

        expect(getHtml(container)).toBe(
          '<div class="auth"><span>Auth 1</span> <div>Home</div></div>'
        )

        navigation.push('/unknown')
        await tick()

        expect(getHtml(container)).toBe(
          '<div class="auth"><span>Auth 1</span> <div class="dashboard"><span>Dashboard 1</span> <div>Not Found</div></div></div>'
        )
      })
    })
  })
})
