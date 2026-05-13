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
  type Page,
  chromium
} from 'playwright'
import { implementations } from '../../../common/test/integration-test-utils.js'

const HYDRATION_MISMATCH_PATTERN = /hydration|hydrated but|server rendered html|did not match|does not match|hydration failed/i
const UI_TIMEOUT = 10000
const TEST_TIMEOUT = 15000

function distDir(path: string) {
  if (path.includes('svelte-kit')) {
    return '.svelte-kit/output'
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
      timeout: UI_TIMEOUT
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

describe('Session App', async () => {
  const list = await implementations({
    self: import.meta.dirname,
    root: join(import.meta.dirname, '..', '..')
  })

  describe.each(list)('$name', ({ start }) => {
    const url = start({}, distDir)
    let page!: Page

    beforeAll(async () => {
      page = await browser.newPage({
        viewport: {
          width: 1280,
          height: 800
        }
      })
    })

    afterAll(async () => {
      await page?.close()
    })

    it('should render and hydrate an empty session', async () => {
      const hydrationErrors: string[] = []
      const onConsole = (message: ConsoleMessage) => {
        if (
          message.type() === 'error'
          && HYDRATION_MISMATCH_PATTERN.test(message.text())
        ) {
          hydrationErrors.push(message.text())
        }
      }

      page.on('console', onConsole)

      try {
        const response = await openPage(page, url)
        const html = await response?.text()

        expect(html).toContain('Session state without hydration mismatch')
        expect(html).toContain('Start session')

        await page.getByRole('heading', {
          name: 'Session state without hydration mismatch'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })
        await page.getByRole('button', {
          name: 'Start session'
        }).waitFor({
          state: 'visible',
          timeout: UI_TIMEOUT
        })

        expect(hydrationErrors).toEqual([])
      } finally {
        page.off('console', onConsole)
      }
    }, TEST_TIMEOUT)

    it('should persist a logged in session across document reloads', async () => {
      const username = `morty-${Date.now()}`

      await page.getByLabel('Username').fill(username)
      await page.getByRole('button', {
        name: 'Start session'
      }).click()

      await page.getByText('Active session').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(
        async () => await page.locator('.panel strong').textContent(),
        {
          timeout: UI_TIMEOUT
        }
      ).toBe(username)
      await expect.poll(
        async () => (
          await page.context().cookies()
        ).find(cookie => cookie.name === 'session')?.value,
        {
          timeout: UI_TIMEOUT
        }
      ).toBe(username)

      const response = await openPage(page, url)
      const html = await response?.text()

      expect(html).toContain(username)

      await page.getByText('Active session').waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(
        async () => await page.locator('.panel strong').textContent(),
        {
          timeout: UI_TIMEOUT
        }
      ).toBe(username)
    }, TEST_TIMEOUT)

    it('should clear session on logout', async () => {
      await page.getByRole('link', {
        name: 'Logout'
      }).click()

      await expect.poll(() => new URL(page.url()).pathname, {
        timeout: UI_TIMEOUT
      }).toBe('/')
      await page.getByRole('button', {
        name: 'Start session'
      }).waitFor({
        state: 'visible',
        timeout: UI_TIMEOUT
      })
      await expect.poll(
        async () => await page.getByText('Active session').count(),
        {
          timeout: UI_TIMEOUT
        }
      ).toBe(0)

      const response = await openPage(page, url)
      const html = await response?.text()

      expect(html).toContain('Start session')
      expect(html).not.toContain('Active session')
    }, TEST_TIMEOUT)
  })
})
