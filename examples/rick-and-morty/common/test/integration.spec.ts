import { join } from 'node:path'
import {
  beforeAll,
  afterAll,
  describe,
  it,
  expect
} from 'vitest'
import {
  type Browser,
  type ConsoleMessage,
  type Page,
  type Request,
  chromium
} from 'playwright'
import {
  implementations,
  useNetworkMemoryCache
} from '../../../common/test/integration-test-utils.js'

const HYDRATION_MISMATCH_PATTERN = /hydration|hydrated but|server rendered html|did not match|does not match|hydration failed/i
const RICK_AND_MORTY_API_JSON = /^https:\/\/trigensoftware\.github\.io\/rick-and-morty-api\/api\/.*\.json$/
const HYDRATION_HANDOFF_TIMEOUT = 500
const UI_TIMEOUT = 10000

function isReact(name: string) {
  return name.includes('react') || name.includes('next-')
}

function isSsr(name: string) {
  return name.includes('ssr')
}

function isNext(name: string) {
  return name.includes('next-')
}

function isNanoKit(name: string) {
  return name.includes('nano_kit')
}

function isNanoKitSsr(name: string) {
  return name === 'react-nano_kit-ssr' || name === 'svelte-nano_kit-ssr'
}

function isNanoKitRouter(name: string) {
  return (
    name === 'react-nano_kit'
    || name === 'react-nano_kit-ssr'
    || name === 'svelte-nano_kit'
    || name === 'svelte-nano_kit-ssr'
  )
}

function distDir(path: string) {
  if (isNext(path)) {
    return '.next/static/chunks'
  }

  if (path.includes('tanstack-start')) {
    return '.output'
  }

  return 'dist'
}

async function openPage(
  page: Page,
  url: Promise<string | false>,
  path = '/'
) {
  const resolvedUrl = await url

  if (resolvedUrl) {
    return await page.goto(new URL(path, resolvedUrl).href, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    })
  }

  return null
}

let browser: Browser

beforeAll(async () => {
  browser = await chromium.launch()
})

afterAll(async () => {
  await browser?.close()
})

describe('Rick And Morty App', async () => {
  const list = await implementations({
    self: import.meta.dirname,
    root: join(import.meta.dirname, '..', '..')
  })

  describe.each(list)('$name', ({
    name,
    start
  }) => {
    const url = start({
      NANO_KIT_DEV: 'true'
    }, distDir)
    let page!: Page
    let unuse: () => Promise<void>

    beforeAll(async () => {
      page = await browser.newPage({
        viewport: {
          width: 1280,
          height: 800
        }
      })

      unuse = await useNetworkMemoryCache(page, [
        RICK_AND_MORTY_API_JSON
      ])
    })

    afterAll(async () => {
      await unuse()
      await page?.close()
    })

    it('should redirect home route to characters', async () => {
      const response = await openPage(page, url)

      await expect.poll(() => new URL(page.url()).pathname).toBe('/characters')

      if (isSsr(name)) {
        const redirectRequest = response?.request().redirectedFrom()
        const redirectResponse = await redirectRequest?.response()

        expect(redirectResponse?.status()).toBe(!isNext(name) && isNanoKit(name) ? 301 : 307)
      }
    })

    it('should render characters list', async () => {
      const hydrationErrors: string[] = []
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.url().toLowerCase().endsWith('/api/character/page/1.json')) {
          hydrationRequests.push(request.url())
        }
      }
      const onConsole = (message: ConsoleMessage) => {
        const text = message.text()

        if (
          isReact(name)
          && (
            message.type() === 'warning'
            || message.type() === 'error'
          )
          && HYDRATION_MISMATCH_PATTERN.test(text)
        ) {
          hydrationErrors.push(text)
        }
      }

      page.on('request', onRequest)
      page.on('console', onConsole)

      try {
        const response = await openPage(page, url, '/characters')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick and Morty')
          expect(html).toContain('Rick Sanchez')
        }

        await page.getByRole('heading', {
          name: 'Rick and Morty'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        if (isNanoKitSsr(name)) {
          expect(await page.title()).toBe('Characters | Rick and Morty Wiki')
        }

        expect(hydrationErrors).toEqual([])

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
        page.off('console', onConsole)
      }
    })

    it('should navigate characters list to page 2 in browser', async () => {
      const documentRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'document') {
          documentRequests.push(request.url())
        }
      }

      await page.getByRole('heading', {
        name: 'Rick Sanchez'
      }).first().waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'Go to page 2'
        }).click()

        await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
          timeout: UI_TIMEOUT
        }).toBe('2')
        await page.getByRole('heading', {
          name: 'Aqua Morty'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).count()).resolves.toBe(0)

        expect(documentRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render characters list page 2 from direct load', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.url().toLowerCase().endsWith('/api/character/page/2.json')) {
          hydrationRequests.push(request.url())
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/characters?page=2')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick and Morty')
          expect(html).toContain('Aqua Morty')
          expect(html).not.toContain('Rick Sanchez')
        }

        await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
          timeout: UI_TIMEOUT
        }).toBe('2')
        await page.getByRole('heading', {
          name: 'Aqua Morty'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).count()).resolves.toBe(0)

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render character detail with related episodes', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url().toLowerCase()

        if (
          requestUrl.endsWith('/api/character/1.json')
          || requestUrl.endsWith('/api/character/episodes/1.json')
        ) {
          hydrationRequests.push(request.url())
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/character/1')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick Sanchez')
          expect(html).toContain('Alive')
          expect(html).toContain('Human')
          expect(html).toContain('Pilot')
        }

        await page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByText('Alive - Human').isVisible()).resolves.toBe(true)
        await expect(page.getByText('Gender: Male').isVisible()).resolves.toBe(true)
        await expect(page.getByRole('heading', {
          name: 'Origin'
        }).isVisible()).resolves.toBe(true)
        await expect(page.getByRole('heading', {
          name: 'Last known location'
        }).isVisible()).resolves.toBe(true)
        await expect(page.getByRole('heading', {
          name: /Episodes \(\d+\)/
        }).isVisible()).resolves.toBe(true)
        await page.getByRole('heading', {
          name: 'Pilot'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        if (isNanoKitSsr(name)) {
          expect(await page.title()).toBe('Rick Sanchez | Rick and Morty Wiki')
        }

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render episodes list', async () => {
      const hydrationErrors: string[] = []
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.url().toLowerCase().endsWith('/api/episode/page/1.json')) {
          hydrationRequests.push(request.url())
        }
      }
      const onConsole = (message: ConsoleMessage) => {
        const text = message.text()

        if (
          isReact(name)
          && (
            message.type() === 'warning'
            || message.type() === 'error'
          )
          && HYDRATION_MISMATCH_PATTERN.test(text)
        ) {
          hydrationErrors.push(text)
        }
      }

      page.on('request', onRequest)
      page.on('console', onConsole)

      try {
        const response = await openPage(page, url, '/episodes')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick and Morty')
          expect(html).toContain('Pilot')
        }

        await page.getByRole('heading', {
          name: 'Rick and Morty'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Pilot'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        if (isNanoKitSsr(name)) {
          expect(await page.title()).toBe('Episodes | Rick and Morty Wiki')
        }

        expect(hydrationErrors).toEqual([])

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
        page.off('console', onConsole)
      }
    })

    it('should navigate episodes list to page 2 in browser', async () => {
      const documentRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'document') {
          documentRequests.push(request.url())
        }
      }

      await page.getByRole('heading', {
        name: 'Pilot'
      }).first().waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'Go to page 2'
        }).click()

        await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
          timeout: UI_TIMEOUT
        }).toBe('2')
        await page.getByRole('heading', {
          name: 'The Wedding Squanchers'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByRole('heading', {
          name: 'Pilot'
        }).count()).resolves.toBe(0)

        expect(documentRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render episodes list page 2 from direct load', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.url().toLowerCase().endsWith('/api/episode/page/2.json')) {
          hydrationRequests.push(request.url())
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/episodes?page=2')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick and Morty')
          expect(html).toContain('The Wedding Squanchers')
          expect(html).not.toContain('Pilot')
        }

        await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
          timeout: UI_TIMEOUT
        }).toBe('2')
        await page.getByRole('heading', {
          name: 'The Wedding Squanchers'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByRole('heading', {
          name: 'Pilot'
        }).count()).resolves.toBe(0)

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render episode detail with related characters', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url().toLowerCase()

        if (
          requestUrl.endsWith('/api/episode/1.json')
          || requestUrl.endsWith('/api/episode/characters/1.json')
        ) {
          hydrationRequests.push(request.url())
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/episode/1')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Pilot')
          expect(html).toContain('S01E01')
          expect(html).toContain('December 2, 2013')
          expect(html).toContain('Rick Sanchez')
        }

        await page.getByRole('heading', {
          name: 'Pilot'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByText('S01E01').isVisible()).resolves.toBe(true)
        await expect(page.getByText('December 2, 2013').isVisible()).resolves.toBe(true)
        await expect(page.getByRole('heading', {
          name: /Characters \(\d+\)/
        }).isVisible()).resolves.toBe(true)
        await page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        if (isNanoKitSsr(name)) {
          expect(await page.title()).toBe('Pilot | Rick and Morty Wiki')
        }

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render locations list', async () => {
      const hydrationErrors: string[] = []
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.url().toLowerCase().endsWith('/api/location/page/1.json')) {
          hydrationRequests.push(request.url())
        }
      }
      const onConsole = (message: ConsoleMessage) => {
        const text = message.text()

        if (
          isReact(name)
          && (
            message.type() === 'warning'
            || message.type() === 'error'
          )
          && HYDRATION_MISMATCH_PATTERN.test(text)
        ) {
          hydrationErrors.push(text)
        }
      }

      page.on('request', onRequest)
      page.on('console', onConsole)

      try {
        const response = await openPage(page, url, '/locations')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick and Morty')
          expect(html).toContain('Earth (C-137)')
        }

        await page.getByRole('heading', {
          name: 'Rick and Morty'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Earth (C-137)'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        if (isNanoKitSsr(name)) {
          expect(await page.title()).toBe('Locations | Rick and Morty Wiki')
        }

        expect(hydrationErrors).toEqual([])

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
        page.off('console', onConsole)
      }
    })

    it('should navigate locations list to page 2 in browser', async () => {
      const documentRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'document') {
          documentRequests.push(request.url())
        }
      }

      await page.getByRole('heading', {
        name: 'Earth (C-137)'
      }).first().waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'Go to page 2'
        }).click()

        await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
          timeout: UI_TIMEOUT
        }).toBe('2')
        await page.getByRole('heading', {
          name: 'Testicle Monster Dimension'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByRole('heading', {
          name: 'Earth (C-137)'
        }).count()).resolves.toBe(0)

        expect(documentRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render locations list page 2 from direct load', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.url().toLowerCase().endsWith('/api/location/page/2.json')) {
          hydrationRequests.push(request.url())
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/locations?page=2')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Rick and Morty')
          expect(html).toContain('Testicle Monster Dimension')
          expect(html).not.toContain('Earth (C-137)')
        }

        await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
          timeout: UI_TIMEOUT
        }).toBe('2')
        await page.getByRole('heading', {
          name: 'Testicle Monster Dimension'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByRole('heading', {
          name: 'Earth (C-137)'
        }).count()).resolves.toBe(0)

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render location detail with related residents', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url().toLowerCase()

        if (
          requestUrl.endsWith('/api/location/1.json')
          || requestUrl.endsWith('/api/location/residents/1.json')
        ) {
          hydrationRequests.push(request.url())
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/location/1')

        if (isSsr(name)) {
          const html = await response?.text()

          expect(html).toContain('Earth (C-137)')
          expect(html).toContain('Planet')
          expect(html).toContain('Dimension C-137')
          expect(html).toContain('Beth Smith')
        }

        await page.getByRole('heading', {
          name: 'Earth (C-137)'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect(page.getByText('Planet').isVisible()).resolves.toBe(true)
        await expect(page.getByText('Dimension C-137').isVisible()).resolves.toBe(true)
        await expect(page.getByRole('heading', {
          name: /Residents \(\d+\)/
        }).isVisible()).resolves.toBe(true)
        await page.getByRole('heading', {
          name: 'Beth Smith'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        if (isNanoKitSsr(name)) {
          expect(await page.title()).toBe('Earth (C-137) | Rick and Morty Wiki')
        }

        if (isSsr(name)) {
          await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
          expect(hydrationRequests).toEqual([])
        }
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should navigate top nav in browser', async () => {
      const documentRequests: string[] = []
      const preloadRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'document') {
          documentRequests.push(request.url())
        }

        if (request.resourceType() === 'script') {
          preloadRequests.push(request.url())
        }
      }
      const TOP_NAV_LINKS = [
        'Characters',
        'Locations',
        'Episodes'
      ] as const
      const TOP_NAV_TITLES: Record<string, string> = {
        Characters: 'Characters | Rick and Morty Wiki',
        Locations: 'Locations | Rick and Morty Wiki',
        Episodes: 'Episodes | Rick and Morty Wiki'
      }

      try {
        await openPage(page, url, '/characters')

        page.on('request', onRequest)

        for (let i = 0, linkName: string, nextLinkName: string; i < TOP_NAV_LINKS.length; i++) {
          linkName = TOP_NAV_LINKS[i]
          nextLinkName = TOP_NAV_LINKS[i + 1]

          if (i === 0) {
            await page.locator('article > a').first().waitFor({
              state: 'visible',
              timeout: UI_TIMEOUT
            })
          }

          if (isNanoKitSsr(name)) {
            await expect.poll(() => page.title(), {
              timeout: UI_TIMEOUT
            }).toBe(TOP_NAV_TITLES[linkName])
          }

          if (isNanoKitRouter(name)) {
            await expect.poll(
              async () => await page.$$eval(
                'header nav a[aria-current="page"]',
                links => links.map(link => link.textContent?.trim())
              ),
              {
                timeout: UI_TIMEOUT
              }
            ).toEqual([linkName])

            if (nextLinkName) {
              preloadRequests.length = 0

              await page.getByRole('link', {
                name: nextLinkName
              }).first().hover()

              await expect.poll(() => preloadRequests.length, {
                timeout: UI_TIMEOUT
              }).toBeGreaterThan(0)
            }
          }

          if (nextLinkName) {
            await page.getByRole('link', {
              name: nextLinkName
            }).first().click()
            await page.locator('article > a').first().waitFor({
              state: 'visible',
              timeout: UI_TIMEOUT
            })
          }
        }

        expect(documentRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    if (isNanoKit(name)) {
      it('should use query cache when navigating back to characters list', async () => {
        const requests: string[] = []
        const onRequest = (request: Request) => {
          if (request.url().toLowerCase().endsWith('/api/character/page/1.json')) {
            requests.push(request.url())
          }
        }

        page.on('request', onRequest)

        try {
          await openPage(page, url, '/characters')
          await page.locator('article > a').first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          await page.getByRole('link', {
            name: 'Go to page 2'
          }).click()
          await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
            timeout: UI_TIMEOUT
          }).toBe('2')
          await page.locator('article > a').first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          requests.length = 0

          await page.getByRole('link', {
            name: 'Go to page 1'
          }).click()
          await page.getByRole('heading', {
            name: 'Rick Sanchez'
          }).first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          expect(requests.length).toBe(0)
        } finally {
          page.off('request', onRequest)
        }
      })

      it('should use query cache when returning to character detail', async () => {
        const requests: string[] = []
        const onRequest = (request: Request) => {
          if (request.url().toLowerCase().endsWith('character/1.json')) {
            requests.push(request.url())
          }
        }

        page.on('request', onRequest)

        try {
          await openPage(page, url, '/character/1')
          await page.getByRole('heading', {
            name: 'Rick Sanchez'
          }).waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })
          await page.getByRole('heading', {
            name: 'Pilot'
          }).waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          await page.getByRole('link', {
            name: 'Characters'
          }).first().click()
          await page.locator('article > a').first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          requests.length = 0

          await page.locator('article > a[href="/character/1"]').first().click()
          await page.getByRole('heading', {
            name: 'Rick Sanchez'
          }).waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })
          await page.getByRole('heading', {
            name: 'Pilot'
          }).waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          expect(requests.length).toBe(0)
        } finally {
          page.off('request', onRequest)
        }
      })
    }

    if (name === 'next-app-nano_kit-ssr') {
      it('should not use nextjs on characters client navigation', async () => {
        const requests: string[] = []
        const response = await openPage(page, url, '/characters')
        const html = await response?.text()
        const onRequest = (request: Request) => {
          if (request.url().toLowerCase().endsWith('/api/character/page/2.json')) {
            requests.push(request.url())
          }
        }

        expect(html).toContain('Rick and Morty')
        expect(html).toContain('Rick Sanchez')

        await page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        page.on('request', onRequest)

        try {
          await page.getByRole('link', {
            name: 'Go to page 2'
          }).click()
          await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
            timeout: UI_TIMEOUT
          }).toBe('2')
          await page.getByRole('heading', {
            name: 'Aqua Morty'
          }).first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          expect(requests.length).toBeGreaterThan(0)
        } finally {
          page.off('request', onRequest)
        }
      })

      it('should use nextjs on episodes client navigation', async () => {
        const apiRequests: string[] = []
        const rscRequests: string[] = []
        const response = await openPage(page, url, '/episodes')
        const html = await response?.text()
        const onRequest = (request: Request) => {
          const requestUrl = request.url().toLowerCase()

          if (RICK_AND_MORTY_API_JSON.test(request.url())) {
            apiRequests.push(request.url())
          }

          if (
            requestUrl.includes('_rsc=')
            || request.headers().rsc === '1'
          ) {
            rscRequests.push(request.url())
          }
        }

        expect(html).toContain('Rick and Morty')
        expect(html).toContain('Pilot')

        await page.getByRole('heading', {
          name: 'Pilot'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        page.on('request', onRequest)

        try {
          await page.getByRole('link', {
            name: 'Go to page 2'
          }).click()
          await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
            timeout: UI_TIMEOUT
          }).toBe('2')
          await page.getByRole('heading', {
            name: 'The Wedding Squanchers'
          }).first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          expect(apiRequests).toEqual([])
          expect(rscRequests.length).toBeGreaterThan(0)
        } finally {
          page.off('request', onRequest)
        }
      })
    }

    if (name === 'next-pages-nano_kit-ssr') {
      it('should not use nextjs on characters client navigation', async () => {
        const requests: string[] = []
        const response = await openPage(page, url, '/characters')
        const html = await response?.text()
        const onRequest = (request: Request) => {
          if (request.url().toLowerCase().endsWith('/api/character/page/2.json')) {
            requests.push(request.url())
          }
        }

        expect(html).toContain('Rick and Morty')
        expect(html).toContain('Rick Sanchez')

        await page.getByRole('heading', {
          name: 'Rick Sanchez'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        page.on('request', onRequest)

        try {
          await page.getByRole('link', {
            name: 'Go to page 2'
          }).click()
          await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
            timeout: UI_TIMEOUT
          }).toBe('2')
          await page.getByRole('heading', {
            name: 'Aqua Morty'
          }).first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          expect(requests.length).toBeGreaterThan(0)
        } finally {
          page.off('request', onRequest)
        }
      })

      it('should use nextjs on episodes client navigation', async () => {
        const apiRequests: string[] = []
        const nextDataRequests: string[] = []
        const response = await openPage(page, url, '/episodes')
        const html = await response?.text()
        const onRequest = (request: Request) => {
          const requestUrl = request.url().toLowerCase()

          if (RICK_AND_MORTY_API_JSON.test(request.url())) {
            apiRequests.push(request.url())
          }

          if (
            requestUrl.includes('/_next/data/')
            && requestUrl.includes('/episodes.json')
          ) {
            nextDataRequests.push(request.url())
          }
        }

        expect(html).toContain('Rick and Morty')
        expect(html).toContain('Pilot')

        await page.getByRole('heading', {
          name: 'Pilot'
        }).first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        page.on('request', onRequest)

        try {
          await page.getByRole('link', {
            name: 'Go to page 2'
          }).click()
          await expect.poll(() => new URL(page.url()).searchParams.get('page'), {
            timeout: UI_TIMEOUT
          }).toBe('2')
          await page.getByRole('heading', {
            name: 'The Wedding Squanchers'
          }).first().waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })

          expect(apiRequests).toEqual([])
          expect(nextDataRequests.length).toBeGreaterThan(0)
        } finally {
          page.off('request', onRequest)
        }
      })
    }
  })
})
