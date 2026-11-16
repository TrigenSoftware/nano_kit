import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import type { Accessor } from '@nano_kit/store'
import { virtualNavigation } from './navigation.js'
import {
  loadable,
  page,
  layout,
  router
} from './router.js'
import {
  type HeadDescriptor,
  title,
  meta
} from './head.js'
import {
  precompose,
  loadPages,
  loadPage
} from './ssr.js'

describe('router', () => {
  describe('ssr', () => {
    describe('precompose', () => {
      it('should precompose pages', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          login: '/login',
          register: '/register',
          dashboard: '/dashboard',
          settings: '/settings'
        })
        const pages = [
          page('home', (): string => 'Home'),
          page('about', (): string => 'About'),
          layout('AuthLayout', [
            page('login', (): string => 'Login'),
            page('register', (): string => 'Register'),
            layout('DashboardLayout', [
              page('dashboard', (): string => 'Dashboard'),
              page('settings', (): string => 'Settings')
            ])
          ])
        ]
        const compose = ($outlet: Accessor<(() => string) | null>, layout: string) => () => `${layout}(${$outlet()?.()})`

        precompose(pages, compose)

        const $page = router($location, [
          page('home', (): string => 'Home'),
          page('about', (): string => 'About'),
          layout('AuthLayout', [
            page('login', (): string => 'Login'),
            page('register', (): string => 'Register'),
            layout('DashboardLayout', [
              page('dashboard', (): string => 'Dashboard'),
              page('settings', (): string => 'Settings')
            ])
          ])
        ], compose)

        navigation.push('/settings')
        expect($page()?.default?.()).toBe('AuthLayout(DashboardLayout(Settings))')

        navigation.push('/dashboard')
        expect($page()?.default?.()).toBe('AuthLayout(DashboardLayout(Dashboard))')

        navigation.push('/login')
        expect($page()?.default?.()).toBe('AuthLayout(Login)')

        navigation.push('/home')
        expect($page()?.default?.()).toBe('Home')

        navigation.push('/about')
        expect($page()?.default?.()).toBe('About')

        navigation.push('/home')
        expect($page()?.default?.()).toBe('Home')

        navigation.push('/login')
        expect($page()?.default?.()).toBe('AuthLayout(Login)')

        navigation.push('/dashboard')
        expect($page()?.default?.()).toBe('AuthLayout(DashboardLayout(Dashboard))')
      })

      it('should replace head tags of the layout with the same tags of the page', () => {
        const [$location, navigation] = virtualNavigation('/', {
          index: '/',
          home: '/home',
          about: '/about'
        })
        const pages = [
          page('index', (): string => 'Index'),
          layout({
            default: 'RootLayout',
            Head$: () => [
              title('Root'),
              meta({
                charSet: 'utf-8'
              }),
              meta({
                property: 'og:title',
                content: 'Root'
              }),
              meta({
                property: 'og:image',
                content: '/root.png'
              })
            ]
          }, [
            page('home', {
              default: (): string => 'Home',
              Head$: () => [
                title('Home'),
                meta({
                  property: 'og:title',
                  content: 'Home'
                }),
                meta({
                  property: 'og:image',
                  content: '/first.png'
                }),
                meta({
                  property: 'og:image',
                  content: '/second.png'
                })
              ]
            }),
            page('about', (): string => 'About')
          ])
        ]
        const compose = ($outlet: Accessor<(() => string) | null>, layout: string) => () => `${layout}(${$outlet()?.()})`
        const head = (descriptors: HeadDescriptor[] | undefined) => descriptors?.map(
          descriptor => ('props' in descriptor
            ? [descriptor.tag, descriptor.props]
            : [descriptor.tag, descriptor.value])
        )

        precompose(pages, compose)

        const $page = router($location, pages, compose)

        navigation.push('/home')
        expect(head($page()?.Head$?.())).toEqual([
          [
            'meta',
            {
              charSet: 'utf-8'
            }
          ],
          ['title', 'Home'],
          [
            'meta',
            {
              property: 'og:title',
              content: 'Home'
            }
          ],
          [
            'meta',
            {
              property: 'og:image',
              content: '/first.png'
            }
          ],
          [
            'meta',
            {
              property: 'og:image',
              content: '/second.png'
            }
          ]
        ])

        navigation.push('/about')
        expect(head($page()?.Head$?.())).toEqual([
          ['title', 'Root'],
          [
            'meta',
            {
              charSet: 'utf-8'
            }
          ],
          [
            'meta',
            {
              property: 'og:title',
              content: 'Root'
            }
          ],
          [
            'meta',
            {
              property: 'og:image',
              content: '/root.png'
            }
          ]
        ])
      })

      describe('Status$', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          gone: '/gone',
          plain: '/plain'
        })
        const pages = [
          layout({
            default: 'RootLayout',
            Status$: () => 403
          }, [
            page('home', {
              default: (): string => 'Home',
              Status$: () => 404
            }),
            page('about', {
              default: (): string => 'About',
              Status$: () => undefined
            }),
            page('gone', {
              default: (): string => 'Gone',
              statusCode: 410
            })
          ]),
          layout('PlainLayout', [
            page('plain', {
              default: (): string => 'Plain',
              Status$: () => 404
            })
          ])
        ]
        const compose = ($outlet: Accessor<(() => string) | null>, layout: string) => () => `${layout}(${$outlet()?.()})`

        precompose(pages, compose)

        const $page = router($location, pages, compose)

        it('should take the status of the page before the status of its layout', () => {
          navigation.push('/home')
          expect($page()?.Status$?.()).toBe(404)
        })

        it('should take the status of the layout when the page gives none', () => {
          navigation.push('/about')
          expect($page()?.Status$?.()).toBe(403)
        })

        it('should take the status code of the page before the status of its layout', () => {
          navigation.push('/gone')
          expect($page()?.Status$?.()).toBe(410)
        })

        it('should keep the status of the page in a layout without one', () => {
          navigation.push('/plain')
          expect($page()?.Status$?.()).toBe(404)
        })
      })
    })

    describe('loadPages', () => {
      it('should preload all loadable refs and collect tasks', async () => {
        const homePageLoader = vi.fn(() => Promise.resolve({
          default: 'Home'
        }))
        const aboutPageLoader = vi.fn(() => Promise.resolve({
          default: 'About'
        }))
        const layoutLoader = vi.fn(() => Promise.resolve({
          default: 'Layout'
        }))
        const dashboardPageLoader = vi.fn(() => Promise.resolve({
          default: 'Dashboard'
        }))
        const adminPageLoader = vi.fn(() => Promise.resolve({
          default: 'Admin'
        }))
        const pages = [
          page('home', loadable(homePageLoader)),
          page('about', loadable(aboutPageLoader)),
          layout(loadable(layoutLoader), [
            page('dashboard', loadable(dashboardPageLoader)),
            page('admin', loadable(adminPageLoader))
          ])
        ]
        const tasks = new Set<Promise<unknown>>()

        loadPages(pages, tasks)

        await Promise.all(tasks)

        expect(tasks.size).toBe(5)
        expect(homePageLoader).toHaveBeenCalledOnce()
        expect(aboutPageLoader).toHaveBeenCalledOnce()
        expect(layoutLoader).toHaveBeenCalledOnce()
        expect(dashboardPageLoader).toHaveBeenCalledOnce()
        expect(adminPageLoader).toHaveBeenCalledOnce()
      })
    })

    describe('loadPage', () => {
      it('should preload matched route and its parent layouts', async () => {
        const homePageLoader = vi.fn(() => Promise.resolve({
          default: 'Home'
        }))
        const aboutPageLoader = vi.fn(() => Promise.resolve({
          default: 'About'
        }))
        const layoutLoader = vi.fn(() => Promise.resolve({
          default: 'Layout'
        }))
        const dashboardPageLoader = vi.fn(() => Promise.resolve({
          default: 'Dashboard'
        }))
        const adminPageLoader = vi.fn(() => Promise.resolve({
          default: 'Admin'
        }))
        const pages = [
          page('home', loadable(homePageLoader)),
          page('about', loadable(aboutPageLoader)),
          layout(loadable(layoutLoader), [
            page('dashboard', loadable(dashboardPageLoader)),
            page('admin', loadable(adminPageLoader))
          ])
        ]

        await loadPage(pages, 'admin')

        expect(homePageLoader).not.toHaveBeenCalled()
        expect(aboutPageLoader).not.toHaveBeenCalled()
        expect(layoutLoader).toHaveBeenCalledOnce()
        expect(dashboardPageLoader).not.toHaveBeenCalled()
        expect(adminPageLoader).toHaveBeenCalledOnce()
      })
    })
  })
})
