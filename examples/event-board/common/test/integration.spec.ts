import { join } from 'node:path'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it
} from 'vitest'
import {
  type Browser,
  type ConsoleMessage,
  type Locator,
  type Page,
  type Request,
  chromium
} from 'playwright'
import { implementations } from '../../../common/test/integration-test-utils.js'

export const HYDRATION_MISMATCH_PATTERN = /hydration|hydrated but|server rendered html|did not match|does not match|hydration failed/i
export const EVENT_BOARD_API_PATTERN = /\/api\/events(?:[/?]|$)/
export const HYDRATION_HANDOFF_TIMEOUT = 500
export const SEARCH_DEBOUNCE_TIMEOUT = 700
export const UI_TIMEOUT = 10000

export async function openPage(
  page: Page,
  url: Promise<string | false>,
  path = '/'
) {
  const resolvedUrl = await url

  if (resolvedUrl) {
    return await page.goto(new URL(path, resolvedUrl).href, {
      waitUntil: 'domcontentloaded',
      timeout: UI_TIMEOUT
    })
  }

  return null
}

async function numberText(locator: Locator) {
  return Number((await locator.textContent())?.match(/\d+/)?.[0])
}

let browser: Browser

beforeAll(async () => {
  browser = await chromium.launch()
})

afterAll(async () => {
  await browser?.close()
})

describe('Event Board App', async () => {
  const list = await implementations({
    self: import.meta.dirname,
    root: join(import.meta.dirname, '..', '..')
  })

  describe.each(list)('$name', ({ start }) => {
    const url = start()
    let page!: Page

    beforeAll(async () => {
      page = await browser.newPage({
        viewport: {
          width: 1280,
          height: 800
        }
      })

      await url
    })

    afterAll(async () => {
      await page?.close()
    })

    it('should render home events list', async () => {
      const hydrationErrors: string[] = []
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()
        const requestUrlData = new URL(requestUrl)

        if (
          EVENT_BOARD_API_PATTERN.test(requestUrl)
          && requestUrlData.pathname.endsWith('/api/events')
          && requestUrlData.search === ''
        ) {
          hydrationRequests.push(requestUrl)
        }
      }
      const onConsole = (message: ConsoleMessage) => {
        const text = message.text()

        if (
          (
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
        const response = await openPage(page, url)
        const html = await response?.text()

        expect(html).toContain('Event Board')
        expect(html).toContain('Find your next frontend event')
        expect(html).toContain('React SSR Workshop')
        expect(html).toContain('Frontend Meetup: Spring Edition')
        expect(html).toContain('State Management Webinar')
        expect(html).toContain('Upcoming events | Event Board')
        expect(html).toContain('@nano_kit/query')

        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('Upcoming events | Event Board')
        await page.locator('article.event-card > h2 a').first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Frontend Meetup: Spring Edition'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'State Management Webinar'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        expect(hydrationErrors).toEqual([])
        await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
        expect(hydrationRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
        page.off('console', onConsole)
      }
    })

    it('should load more events', async () => {
      const apiRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()

        if (EVENT_BOARD_API_PATTERN.test(requestUrl)) {
          apiRequests.push(requestUrl)
        }
      }

      await page.getByRole('heading', {
        name: 'React SSR Workshop'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByRole('button', {
          name: 'Load more'
        }).click()

        await page.getByRole('heading', {
          name: 'Vite Plugin Night'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Web Platform Conference'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Hydration Deep Dive'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        expect(apiRequests.some(requestUrl => new URL(requestUrl).searchParams.has('cursor'))).toBe(true)
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should keep loaded events page after detail back navigation', async () => {
      const cursorRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()

        if (
          EVENT_BOARD_API_PATTERN.test(requestUrl)
          && new URL(requestUrl).searchParams.has('cursor')
        ) {
          cursorRequests.push(requestUrl)
        }
      }

      await page.getByRole('heading', {
        name: 'Vite Plugin Night'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'Vite Plugin Night'
        }).click()

        await expect.poll(() => new URL(page.url()).pathname, {
          timeout: UI_TIMEOUT
        }).toBe('/events/vite-plugin-night')
        await page.getByRole('button', {
          name: "I'm going"
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('Vite Plugin Night | Event Board')

        await page.getByRole('link', {
          name: 'Back to events'
        }).click()

        await expect.poll(() => new URL(page.url()).pathname, {
          timeout: UI_TIMEOUT
        }).toBe('/')
        await page.getByRole('heading', {
          name: 'Vite Plugin Night'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Hydration Deep Dive'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('Upcoming events | Event Board')

        expect(cursorRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should filter events by search in browser', async () => {
      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/')

      await page.getByLabel('Search').fill('vite')

      await expect.poll(() => new URL(page.url()).searchParams.get('q'), {
        timeout: UI_TIMEOUT
      }).toBe('vite')
      await page.getByRole('heading', {
        name: 'Vite Plugin Night'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(() => page.getByRole('heading', {
        name: 'React SSR Workshop'
      }).count(), {
        timeout: UI_TIMEOUT
      }).toBe(0)
    })

    it('should render search filter from direct load', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()
        const requestUrlData = new URL(requestUrl)

        if (
          EVENT_BOARD_API_PATTERN.test(requestUrl)
          && requestUrlData.pathname.endsWith('/api/events')
          && requestUrlData.searchParams.get('q') === 'vite'
          && !requestUrlData.searchParams.has('cursor')
        ) {
          hydrationRequests.push(requestUrl)
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/?q=vite')
        const html = await response?.text()

        expect(html).toContain('Vite Plugin Night')
        expect(html).toContain('@nano_kit/query')
        expect(html).toContain('vite')
        expect(html).not.toContain('React SSR Workshop')

        await expect.poll(() => new URL(page.url()).searchParams.get('q'), {
          timeout: UI_TIMEOUT
        }).toBe('vite')
        await expect.poll(() => page.getByLabel('Search').inputValue(), {
          timeout: UI_TIMEOUT
        }).toBe('vite')
        await page.getByRole('heading', {
          name: 'Vite Plugin Night'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(() => page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).count(), {
          timeout: UI_TIMEOUT
        }).toBe(0)
        await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
        expect(hydrationRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should filter events by category in browser', async () => {
      await openPage(page, url)

      await page.getByLabel('Category').selectOption('meetup')

      await expect.poll(() => new URL(page.url()).searchParams.get('category'), {
        timeout: UI_TIMEOUT
      }).toBe('meetup')
      await page.getByRole('heading', {
        name: 'Frontend Meetup: Spring Edition'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByRole('heading', {
        name: 'Vite Plugin Night'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(() => page.getByRole('heading', {
        name: 'React SSR Workshop'
      }).count(), {
        timeout: UI_TIMEOUT
      }).toBe(0)
    })

    it('should render category filter from direct load', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()
        const requestUrlData = new URL(requestUrl)

        if (
          EVENT_BOARD_API_PATTERN.test(requestUrl)
          && requestUrlData.pathname.endsWith('/api/events')
          && requestUrlData.searchParams.get('category') === 'webinar'
          && !requestUrlData.searchParams.has('cursor')
        ) {
          hydrationRequests.push(requestUrl)
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/?category=webinar')
        const html = await response?.text()

        expect(html).toContain('State Management Webinar')
        expect(html).toContain('Hydration Deep Dive')
        expect(html).toContain('@nano_kit/query')
        expect(html).toContain('webinar')
        expect(html).not.toContain('React SSR Workshop')

        await expect.poll(() => new URL(page.url()).searchParams.get('category'), {
          timeout: UI_TIMEOUT
        }).toBe('webinar')
        await expect.poll(() => page.getByLabel('Category').inputValue(), {
          timeout: UI_TIMEOUT
        }).toBe('webinar')
        await page.getByRole('heading', {
          name: 'State Management Webinar'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'Hydration Deep Dive'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(() => page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).count(), {
          timeout: UI_TIMEOUT
        }).toBe(0)
        await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
        expect(hydrationRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render no results for combined filters', async () => {
      await openPage(page, url, '/?q=does-not-exist&category=conference')

      await expect.poll(() => new URL(page.url()).searchParams.get('q'), {
        timeout: UI_TIMEOUT
      }).toBe('does-not-exist')
      await expect.poll(() => new URL(page.url()).searchParams.get('category'), {
        timeout: UI_TIMEOUT
      }).toBe('conference')
      await page.getByText('No events found. Try another search or category.').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(() => page.locator('article.event-card').count(), {
        timeout: UI_TIMEOUT
      }).toBe(0)
    })

    it('should render event detail', async () => {
      const hydrationRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()

        if (new URL(requestUrl).pathname.endsWith('/api/events/react-ssr-workshop')) {
          hydrationRequests.push(requestUrl)
        }
      }

      page.on('request', onRequest)

      try {
        const response = await openPage(page, url, '/events/react-ssr-workshop')
        const html = await response?.text()

        expect(html).toContain('React SSR Workshop')
        expect(html).toContain('A hands-on workshop about server rendering, hydration, and app architecture.')
        expect(html).toContain('React SSR Workshop | Event Board')
        expect(html).toContain('@nano_kit/query')

        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('React SSR Workshop | Event Board')
        await page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByText('workshop', {
          exact: true
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByText('A hands-on workshop about server rendering, hydration, and app architecture.').waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('button', {
          name: "I'm going"
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.waitForTimeout(HYDRATION_HANDOFF_TIMEOUT)
        expect(hydrationRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should render not found event detail', async () => {
      const response = await openPage(page, url, '/events/not-a-real-event')
      const html = await response?.text()

      expect(html).toContain('Event not found')
      expect(html).toContain('not-a-real-event')
      expect(html).toContain('Back to events')
      expect(html).not.toContain('React SSR Workshop')

      await page.getByRole('heading', {
        name: 'Event not found'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByText('not-a-real-event').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByRole('link', {
        name: 'Back to events'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
    })

    it('should navigate to event detail in browser', async () => {
      const documentRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'document') {
          documentRequests.push(request.url())
        }
      }

      await openPage(page, url)
      await page.getByRole('heading', {
        name: 'React SSR Workshop'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'React SSR Workshop'
        }).click()

        await expect.poll(() => new URL(page.url()).pathname, {
          timeout: UI_TIMEOUT
        }).toBe('/events/react-ssr-workshop')
        await page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('button', {
          name: "I'm going"
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('React SSR Workshop | Event Board')

        expect(documentRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should reuse event detail cache after back navigation', async () => {
      const detailRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()

        if (requestUrl.includes('/api/events/react-ssr-workshop')) {
          detailRequests.push(requestUrl)
        }
      }

      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/events/react-ssr-workshop')

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'Back to events'
        }).click()

        await expect.poll(() => new URL(page.url()).pathname, {
          timeout: UI_TIMEOUT
        }).toBe('/')
        await page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('heading', {
          name: 'State Management Webinar'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        await page.getByRole('link', {
          name: 'React SSR Workshop'
        }).click()

        await expect.poll(() => new URL(page.url()).pathname, {
          timeout: UI_TIMEOUT
        }).toBe('/events/react-ssr-workshop')
        await page.getByRole('button', {
          name: "I'm going"
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        expect(detailRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should optimistically update RSVP and sync the list entity', async () => {
      const goingCount = page.locator('.details-panel dt').filter({
        hasText: /^Going$/
      }).locator('xpath=following-sibling::dd')
      const workshopCard = page.locator('article.event-card').filter({
        hasText: 'React SSR Workshop'
      })
      const attendees = workshopCard.locator('.event-card__footer span').filter({
        hasText: /going$/
      })
      const initialCount = await numberText(goingCount)
      const response = page.waitForResponse(
        item => item.url().includes('/api/events/1/rsvp') && item.request().method() === 'POST'
      )

      await page.getByRole('button', {
        name: "I'm going"
      }).click()

      await expect.poll(() => numberText(goingCount), {
        timeout: UI_TIMEOUT
      }).toBe(initialCount + 1)

      await response

      await expect.poll(() => numberText(goingCount), {
        timeout: UI_TIMEOUT
      }).toBe(initialCount + 1)

      await page.getByRole('link', {
        name: 'Back to events'
      }).click()

      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/')

      await page.getByRole('heading', {
        name: 'React SSR Workshop'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(() => numberText(attendees), {
        timeout: UI_TIMEOUT
      }).toBe(initialCount + 1)
    })

    it('should render new event page', async () => {
      const response = await openPage(page, url, '/events/new')
      const html = await response?.text()

      expect(html).toContain('New event | Event Board')
      expect(html).toContain('Create an event')
      expect(html).toContain('Title')
      expect(html).toContain('Description')
      expect(html).toContain('Date and time')
      expect(html).toContain('Category')
      expect(html).toContain('Location')
      expect(html).toContain('Create event')

      await page.getByRole('heading', {
        name: 'Create an event'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByLabel('Title').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByLabel('Description').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByLabel('Date and time').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByLabel('Category').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByLabel('Location').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect(page.getByRole('button', {
        name: 'Create event'
      }).isDisabled()).resolves.toBe(true)
    })

    it('should validate new event form', async () => {
      const createButton = page.getByRole('button', {
        name: 'Create event'
      })

      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/events/new')
      await expect(createButton.isDisabled()).resolves.toBe(true)

      await page.getByLabel('Title').fill('Validation draft')

      await expect(createButton.isDisabled()).resolves.toBe(true)
    })

    it('should fill new event form with keyboard mock', async () => {
      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/events/new')

      await page.keyboard.press('Control+M')

      await expect.poll(() => page.getByLabel('Title').inputValue(), {
        timeout: UI_TIMEOUT
      }).toBe('Frontend Architecture Night')
      await expect.poll(() => page.getByLabel('Description').inputValue(), {
        timeout: UI_TIMEOUT
      }).toBe('Short talks about SSR, routing, query caching, and pragmatic app architecture.')
      await expect.poll(() => page.getByLabel('Date and time').inputValue(), {
        timeout: UI_TIMEOUT
      }).not.toBe('')
      await expect.poll(() => page.getByLabel('Location').inputValue(), {
        timeout: UI_TIMEOUT
      }).toBe('Online')
      await expect.poll(() => page.getByLabel('Category').inputValue(), {
        timeout: UI_TIMEOUT
      }).toBe('meetup')
    })

    it('should create a new event', async () => {
      const response = page.waitForResponse(
        item => item.url().endsWith('/api/events') && item.request().method() === 'POST'
      )

      await expect.poll(() => page.getByLabel('Title').inputValue(), {
        timeout: UI_TIMEOUT
      }).toBe('Frontend Architecture Night')

      await page.getByRole('button', {
        name: 'Create event'
      }).click()

      const createdResponse = await response
      const created = await createdResponse.json() as {
        slug: string
        title: string
      }

      expect(created.title).toBe('Frontend Architecture Night')
      expect(created.slug).toBe('frontend-architecture-night')

      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/events/frontend-architecture-night')
      await page.getByRole('heading', {
        name: 'Frontend Architecture Night'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await page.getByText('Short talks about SSR, routing, query caching, and pragmatic app architecture.').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
    })

    it('should show newly created event in the events list', async () => {
      const documentRequests: string[] = []
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'document') {
          documentRequests.push(request.url())
        }
      }

      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/events/frontend-architecture-night')

      page.on('request', onRequest)

      try {
        await page.getByRole('link', {
          name: 'Back to events'
        }).click()

        await expect.poll(() => new URL(page.url()).pathname, {
          timeout: UI_TIMEOUT
        }).toBe('/')
        await page.getByRole('heading', {
          name: 'Frontend Architecture Night'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        expect(documentRequests).toEqual([])
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
      const activeNav = async () => await page.$$eval(
        'header nav a[aria-current="page"]',
        links => links.map(link => link.textContent?.trim())
      )

      try {
        await openPage(page, url)
        await page.locator('article.event-card').first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        page.on('request', onRequest)

        await expect.poll(activeNav, {
          timeout: UI_TIMEOUT
        }).toEqual(['Events'])
        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('Upcoming events | Event Board')

        preloadRequests.length = 0

        await page.getByRole('link', {
          name: 'New event'
        }).hover()

        await expect.poll(() => preloadRequests.length, {
          timeout: UI_TIMEOUT
        }).toBeGreaterThan(0)

        await page.getByRole('link', {
          name: 'New event'
        }).click()

        await page.getByRole('heading', {
          name: 'Create an event'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(activeNav, {
          timeout: UI_TIMEOUT
        }).toEqual(['New event'])
        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('New event | Event Board')

        await page.getByRole('link', {
          name: 'Events'
        }).click()

        await page.locator('article.event-card').first().waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(activeNav, {
          timeout: UI_TIMEOUT
        }).toEqual(['Events'])
        await expect.poll(() => page.title(), {
          timeout: UI_TIMEOUT
        }).toBe('Upcoming events | Event Board')

        expect(documentRequests).toEqual([])
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should use query cache for repeated filters', async () => {
      const viteRequests: string[] = []
      const onRequest = (request: Request) => {
        const requestUrl = request.url()

        if (
          EVENT_BOARD_API_PATTERN.test(requestUrl)
          && new URL(requestUrl).searchParams.get('q') === 'vite'
        ) {
          viteRequests.push(requestUrl)
        }
      }

      await openPage(page, url)
      await page.locator('article.event-card').first().waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })

      page.on('request', onRequest)

      try {
        await page.getByLabel('Search').fill('vite')

        await expect.poll(() => new URL(page.url()).searchParams.get('q'), {
          timeout: UI_TIMEOUT
        }).toBe('vite')
        await page.getByRole('heading', {
          name: 'Vite Plugin Night'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await expect.poll(() => viteRequests.length, {
          timeout: UI_TIMEOUT
        }).toBe(1)

        await page.getByLabel('Search').fill('')

        await expect.poll(() => page.getByLabel('Search').inputValue(), {
          timeout: UI_TIMEOUT
        }).toBe('')
        await page.getByRole('heading', {
          name: 'React SSR Workshop'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        await page.getByLabel('Search').fill('vite')

        await expect.poll(() => new URL(page.url()).searchParams.get('q'), {
          timeout: UI_TIMEOUT
        }).toBe('vite')
        await page.getByRole('heading', {
          name: 'Vite Plugin Night'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.waitForTimeout(SEARCH_DEBOUNCE_TIMEOUT)

        expect(viteRequests).toHaveLength(1)
      } finally {
        page.off('request', onRequest)
      }
    })

    it('should return not found for unknown routes', async () => {
      const resolvedUrl = await url

      if (!resolvedUrl) {
        return
      }

      const response = await fetch(new URL('/not-a-real-route', resolvedUrl).href)
      const text = await response.text()

      expect(response.status).toBe(404)
      expect(text).toContain('Not Found')
      expect(text).not.toContain('Event Board')
    })
  })
})
