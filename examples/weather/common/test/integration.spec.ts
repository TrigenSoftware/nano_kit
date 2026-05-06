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
  type Page,
  type Request,
  chromium
} from 'playwright'
import {
  implementations,
  useNetworkMemoryCache
} from '../../../common/test/integration-test-utils.js'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const UI_TIMEOUT = 2000

async function openPage(page: Page, url: Promise<string | false>) {
  const resolvedUrl = await url

  if (resolvedUrl) {
    await page.goto(resolvedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 1000
    })
    await page.getByRole('heading', {
      name: 'Weather App'
    }).waitFor({
      timeout: 3000
    })
  }
}

let browser: Browser

beforeAll(async () => {
  browser = await chromium.launch()
})

afterAll(async () => {
  await browser?.close()
})

describe('Weather App', async () => {
  const list = await implementations({
    self: import.meta.dirname,
    root: join(import.meta.dirname, '..', '..')
  })

  describe.each(list)('$name', ({
    name,
    start
  }) => {
    const url = start()
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
        GEOCODING_URL,
        FORECAST_URL
      ])

      await openPage(page, url)
    })

    afterAll(async () => {
      await unuse()
      await page?.close()
    })

    it('should render empty weather app shell', async () => {
      const cityInput = page.getByRole('combobox', {
        name: 'Search for a city'
      })

      await expect(page.getByRole('heading', {
        name: 'Weather App'
      }).isVisible()).resolves.toBe(true)

      await expect(cityInput.isVisible()).resolves.toBe(true)
      await expect(page.locator('.weather').count()).resolves.toBe(0)
      await expect(page.locator('.forecast-list').count()).resolves.toBe(0)
    })

    it('should select city from autocomplete and render weather', async () => {
      const requests: Request[] = []
      const cityInput = page.getByRole('combobox', {
        name: 'Search for a city'
      })
      const recordRequest = (request: Request) => {
        const url = request.url()

        if (url.startsWith(GEOCODING_URL) || url.startsWith(FORECAST_URL)) {
          requests.push(request)
        }
      }

      page.on('request', recordRequest)

      try {
        await cityInput.fill('London')

        const londonOption = page.getByRole('option', {
          name: /London/i
        }).first()

        await londonOption.waitFor({
          state: 'visible',
          timeout: 10000
        })
        await londonOption.click()

        await expect(cityInput.inputValue()).resolves.toContain('London')
        await page.locator('.weather[data-city="London"]').waitFor({
          state: 'visible',
          timeout: 10000
        })
        await page.locator('.forecast-list').waitFor({
          state: 'visible',
          timeout: 10000
        })

        expect(requests.some(request => request.url().startsWith(GEOCODING_URL))).toBe(true)
        expect(requests.some(request => request.url().startsWith(FORECAST_URL))).toBe(true)
      } finally {
        page.off('request', recordRequest)
      }
    })

    it('should switch forecast between hourly and daily modes', async () => {
      const forecastItems = page.locator('.forecast-item')
      const forecastTimes = page.locator('.forecast-time')
      const mode = page.locator('.forecast-mode')

      await expect.poll(() => forecastItems.count(), {
        timeout: UI_TIMEOUT
      }).toBe(24)

      await mode.selectOption('daily')

      await expect.poll(() => forecastItems.count(), {
        timeout: UI_TIMEOUT
      }).toBe(7)
      await expect.poll(() => forecastTimes.first().textContent(), {
        timeout: UI_TIMEOUT
      }).not.toMatch(/\d{1,2}:\d{2}/)
    })

    it('should update weather after selecting another city', async () => {
      const requests: Request[] = []
      const cityInput = page.getByRole('combobox', {
        name: 'Search for a city'
      })
      const recordRequest = (request: Request) => {
        const url = request.url()

        if (url.startsWith(GEOCODING_URL) || url.startsWith(FORECAST_URL)) {
          requests.push(request)
        }
      }

      page.on('request', recordRequest)

      try {
        await cityInput.fill('Paris')

        const parisOption = page.getByRole('option', {
          name: /Paris/i
        }).first()

        await parisOption.waitFor({
          state: 'visible',
          timeout: 10000
        })
        await parisOption.click()

        await expect(cityInput.inputValue()).resolves.toContain('Paris')
        await page.locator('.weather[data-city="Paris"]').waitFor({
          state: 'visible',
          timeout: 10000
        })
        await page.locator('.forecast-list').waitFor({
          state: 'visible',
          timeout: 10000
        })

        expect(requests.some(
          request => request.url().startsWith(GEOCODING_URL) && request.url().includes('Paris')
        )).toBe(true)
        expect(requests.some(request => request.url().startsWith(FORECAST_URL))).toBe(true)
      } finally {
        page.off('request', recordRequest)
      }
    })

    if (name.includes('nano_kit')) {
      it('should reuse cached weather after returning to previous city', async () => {
        const requests: Request[] = []
        const cityInput = page.getByRole('combobox', {
          name: 'Search for a city'
        })
        const recordRequest = (request: Request) => {
          if (request.url().startsWith(FORECAST_URL)) {
            requests.push(request)
          }
        }

        page.on('request', recordRequest)

        try {
          await cityInput.fill('London')

          const londonOption = page.getByRole('option', {
            name: /London/i
          }).first()

          await londonOption.waitFor({
            state: 'visible',
            timeout: 10000
          })
          await londonOption.click()

          await expect(cityInput.inputValue()).resolves.toContain('London')
          await page.locator('.weather[data-city="London"]').waitFor({
            state: 'visible',
            timeout: UI_TIMEOUT
          })
          await page.locator('.forecast-list').waitFor({
            state: 'visible',
            timeout: 10000
          })

          expect(requests).toEqual([])
        } finally {
          page.off('request', recordRequest)
        }
      })
    }

    it('should not request data for empty city search', async () => {
      const requests: Request[] = []
      const cityInput = page.getByRole('combobox', {
        name: 'Search for a city'
      })
      const recordRequest = (request: Request) => {
        const url = request.url()

        if (url.startsWith(GEOCODING_URL) || url.startsWith(FORECAST_URL)) {
          requests.push(request)
        }
      }

      page.on('request', recordRequest)

      try {
        await cityInput.fill('')

        await expect(cityInput.inputValue()).resolves.toBe('')
        await expect.poll(() => page.getByRole('option').count(), {
          timeout: UI_TIMEOUT
        }).toBe(0)

        expect(requests).toEqual([])
      } finally {
        page.off('request', recordRequest)
      }
    })

    it('should restore search from local storage after reload', async () => {
      const cityInput = page.getByRole('combobox', {
        name: 'Search for a city'
      })

      await cityInput.fill('Paris')

      await page.locator('.weather[data-city="Paris"]').waitFor({
        state: 'visible',
        timeout: 10000
      })

      await page.reload({
        waitUntil: 'domcontentloaded',
        timeout: 10000
      })
      await page.getByRole('heading', {
        name: 'Weather App'
      }).waitFor({
        timeout: 3000
      })

      await expect(cityInput.inputValue()).resolves.toContain('Paris')
      await page.locator('.weather[data-city="Paris"]').waitFor({
        state: 'visible',
        timeout: 10000
      })
      await page.locator('.forecast-list').waitFor({
        state: 'visible',
        timeout: 10000
      })
    })
  })
})
