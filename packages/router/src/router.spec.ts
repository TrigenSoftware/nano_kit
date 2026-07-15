import {
  describe,
  it,
  expect
} from 'vitest'
import type { Accessor } from '@nano_kit/store'
import { virtualNavigation } from './navigation.js'
import {
  type ComposedPageRef,
  page,
  layout,
  notFound,
  router,
  loadable
} from './router.js'

describe('router', () => {
  describe('router', () => {
    it('should match correct page based on route', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })
      const $page = router($location, [
        page('home', 'Home Page'),
        page('about', 'About Page')
      ])

      navigation.push('/home')
      expect($page()?.default).toBe('Home Page')

      navigation.push('/about')
      expect($page()?.default).toBe('About Page')
    })

    it('should return null for unmatched routes', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })
      const $page = router($location, [
        page('home', 'Home Page'),
        page('about', 'About Page')
      ])

      navigation.push('/unknown')
      expect($page()).toBeNull()

      navigation.push('/')
      expect($page()).toBeNull()
    })

    it('should handle empty pages array', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home'
      })
      const $page = router($location, [])

      navigation.push('/home')
      expect($page()).toBeNull()
    })

    it('should update when route changes', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })
      const $page = router($location, [
        page('home', 'Home Page'),
        page('about', 'About Page')
      ])

      navigation.push('/')
      expect($page()).toBeNull()

      navigation.push('/home')
      expect($page()?.default).toBe('Home Page')

      navigation.push('/about')
      expect($page()?.default).toBe('About Page')

      navigation.push('/')
      expect($page()).toBeNull()
    })

    it('should render not found page', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })
      const $page = router($location, [
        page('home', 'Home Page'),
        page('about', 'About Page'),
        notFound('Not Found Page')
      ])

      navigation.push('/')
      expect($page()?.default).toBe('Not Found Page')

      navigation.push('/home')
      expect($page()?.default).toBe('Home Page')

      navigation.push('/about')
      expect($page()?.default).toBe('About Page')

      navigation.push('/')
      expect($page()?.default).toBe('Not Found Page')
    })

    it('should keep status code for loadable not found page', async () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home'
      })
      const notFoundPagePromise = Promise.resolve({
        default: 'Not Found Page'
      })
      const $page = router($location, [
        page('home', 'Home Page'),
        notFound(loadable(() => notFoundPagePromise))
      ])

      navigation.push('/unknown')

      expect($page()?.statusCode).toBe(404)

      await notFoundPagePromise

      expect($page()?.default).toBe('Not Found Page')
      expect($page()?.statusCode).toBe(404)
    })

    it('should expose page stores when provided', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })
      const $homeData = () => 'home-store'
      const $aboutData = () => 'about-store'
      const $page = router($location, [
        page('home', {
          default: 'Home Page',
          Stores$: () => [$homeData]
        }),
        page('about', {
          default: 'About Page',
          Stores$: () => [$aboutData]
        })
      ])
      const stores = () => $page()?.Stores$?.() ?? []

      expect(stores()).toEqual([])

      navigation.push('/home')

      expect(stores()).toEqual([$homeData])

      navigation.push('/about')

      expect(stores()).toEqual([$aboutData])

      navigation.push('/unknown')

      expect(stores()).toEqual([])
    })

    it('should render loadable page', async () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about',
        contact: '/contact'
      })
      const $homeData = () => 'home-store'
      const homePagePromise = Promise.resolve({
        default: 'Home Page',
        Stores$: () => [$homeData]
      })
      const $aboutData = () => 'about-store'
      const aboutPagePromise = Promise.resolve({
        default: 'About Page',
        Stores$: () => [$aboutData]
      })
      const contactPagePromise = Promise.resolve({
        default: 'Contact Page'
      })
      const $page = router($location, [
        page('home', loadable(() => homePagePromise, 'Home Fallback')),
        page('about', loadable(() => aboutPagePromise, 'About Fallback')),
        page('contact', loadable(() => contactPagePromise))
      ])
      const stores = () => $page()?.Stores$?.() ?? []

      expect($page()).toBeNull()
      expect(stores()).toEqual([])

      navigation.push('/home')

      expect($page()?.default).toBe('Home Fallback')
      expect(stores()).toEqual([])

      await homePagePromise

      expect($page()?.default).toBe('Home Page')
      expect(stores()).toEqual([$homeData])

      navigation.push('/about')

      expect($page()?.default).toBe('About Fallback')
      expect(stores()).toEqual([])

      await aboutPagePromise

      expect($page()?.default).toBe('About Page')
      expect(stores()).toEqual([$aboutData])

      navigation.push('/contact')

      expect($page()).toEqual({
        loading: true
      })
      expect(stores()).toEqual([])

      await contactPagePromise

      expect($page()?.default).toBe('Contact Page')
      expect(stores()).toEqual([])

      navigation.push('/unknown')

      expect($page()).toBeNull()
      expect(stores()).toEqual([])
    })

    describe('layout', () => {
      it('should compose layout with nested content', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          login: '/login',
          register: '/register'
        })
        const compose = ($outlet: Accessor<(() => string) | null>, layout: string) => () => `${layout} > ${$outlet()?.()}`
        const $page = router($location, [
          page('home', (): string => 'Home Page'),
          layout('AuthLayout', [
            page('login', (): string => 'Login Page'),
            page('register', (): string => 'Register Page')
          ])
        ], compose)

        navigation.push('/login')
        expect($page()?.default?.()).toBe('AuthLayout > Login Page')

        navigation.push('/register')
        expect($page()?.default?.()).toBe('AuthLayout > Register Page')

        navigation.push('/home')
        expect($page()?.default?.()).toBe('Home Page')
      })

      it('should handle complex nested structure', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          login: '/login',
          register: '/register',
          dashboard: '/dashboard',
          settings: '/settings'
        })
        const compose = ($outlet: Accessor<(() => string) | null>, layout: string) => () => `${layout}(${$outlet()?.()})`
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
      })

      it('should build linked list from layouts and pages', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          dashboard: '/dashboard',
          admin: '/dashboard/admin'
        })
        const $homeData = () => 'home-store'
        const $aboutData = () => 'about-store'
        const $layoutData = () => 'layout-store'
        const $dashboardData = () => 'dashboard-store'
        const $adminData = () => 'admin-store'
        const compose = ($outlet: Accessor<(() => string) | null>, layout: () => string) => () => `${layout()} > ${$outlet()?.()}`
        const $page = router($location, [
          page('home', {
            default: (): string => 'Home',
            Stores$: () => [$homeData]
          }),
          page('about', {
            default: (): string => 'About',
            Stores$: () => [$aboutData]
          }),
          layout(
            {
              default: (): string => 'MainLayout',
              Stores$: () => [$layoutData]
            },
            [
              page('dashboard', {
                default: (): string => 'Dashboard',
                Stores$: () => [$dashboardData]
              }),
              page('admin', {
                default: (): string => 'Admin',
                Stores$: () => [$adminData]
              })
            ]
          )
        ], compose)
        const stores = () => {
          const stores = []
          let current = $page() as ComposedPageRef<unknown> | null | undefined

          while (current) {
            if (current.Stores$) {
              stores.push(...current.Stores$())
            }

            current = current.r
          }

          return stores
        }

        expect(stores()).toEqual([])

        navigation.push('/home')

        expect(stores()).toEqual([$homeData])

        navigation.push('/about')

        expect(stores()).toEqual([$aboutData])

        navigation.push('/dashboard')

        expect(stores()).toEqual([$layoutData, $dashboardData])

        navigation.push('/dashboard/admin')

        expect(stores()).toEqual([$layoutData, $adminData])

        navigation.push('/unknown')

        expect(stores()).toEqual([])
      })

      it('should render loadable page within layout', async () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          dashboard: '/dashboard',
          admin: '/dashboard/admin'
        })
        const $homeData = () => 'home-store'
        const homePagePromise = Promise.resolve({
          default: (): string => 'Home',
          Stores$: () => [$homeData]
        })
        const $aboutData = () => 'about-store'
        const aboutPagePromise = Promise.resolve({
          default: (): string => 'About',
          Stores$: () => [$aboutData]
        })
        const $layoutData = () => 'layout-store'
        const layoutPromise = Promise.resolve({
          default: () => 'Layout',
          Stores$: () => [$layoutData]
        })
        const $dashboardData = () => 'dashboard-store'
        const dashboardPagePromise = Promise.resolve({
          default: (): string => 'Dashboard',
          Stores$: () => [$dashboardData]
        })
        const $adminData = () => 'admin-store'
        const adminPagePromise = Promise.resolve({
          default: (): string => 'Admin',
          Stores$: () => [$adminData]
        })
        const compose = ($outlet: Accessor<(() => string) | null>, layout: () => string) => () => `${layout()}:${$outlet()?.()}`
        const $page = router($location, [
          page('home', loadable(() => homePagePromise, () => 'Home Fallback')),
          page('about', loadable(() => aboutPagePromise, () => 'About Fallback')),
          layout(loadable(() => layoutPromise, (): string => 'Layout Fallback'), [
            page('dashboard', loadable(() => dashboardPagePromise, () => 'Dashboard Fallback')),
            page('admin', loadable(() => adminPagePromise, () => 'Admin Fallback'))
          ])
        ], compose)
        const stores = () => {
          const stores = []
          let current = $page() as ComposedPageRef<unknown> | null | undefined

          while (current) {
            if (current.Stores$) {
              stores.push(...current.Stores$())
            }

            current = current.r
          }

          return stores
        }

        expect($page()).toBeNull()
        expect(stores()).toEqual([])

        navigation.push('/home')

        expect($page()?.default?.()).toBe('Home Fallback')
        expect(stores()).toEqual([])

        await homePagePromise

        expect($page()?.default?.()).toBe('Home')
        expect(stores()).toEqual([$homeData])

        navigation.push('/about')

        expect($page()?.default?.()).toBe('About Fallback')
        expect(stores()).toEqual([])

        await aboutPagePromise

        expect($page()?.default?.()).toBe('About')
        expect(stores()).toEqual([$aboutData])

        navigation.push('/dashboard')

        expect($page()?.default?.()).toBe('Layout Fallback')
        expect(stores()).toEqual([])

        await layoutPromise

        expect($page()?.default?.()).toBe('Layout:Dashboard')
        expect(stores()).toEqual([$layoutData, $dashboardData])

        navigation.push('/dashboard/admin')

        expect($page()?.default?.()).toBe('Layout:Admin Fallback')
        expect(stores()).toEqual([$layoutData])

        await adminPagePromise

        expect($page()?.default?.()).toBe('Layout:Admin')
        expect(stores()).toEqual([$layoutData, $adminData])

        navigation.push('/unknown')

        expect($page()).toBeNull()
        expect(stores()).toEqual([])
      })
    })
  })
})
