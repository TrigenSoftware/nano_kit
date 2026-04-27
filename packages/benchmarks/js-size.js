import { chromium } from 'playwright'

const urls = process.argv.slice(2)

if (!urls.length) {
  console.error('Usage: pnpm --filter benchmarks js-size <url> [...url]')
  process.exit(1)
}

function format(bytes) {
  return `${(bytes / 1000).toFixed(2)} kB`
}

async function measure(url) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const client = await page.context().newCDPSession(page)
  const scripts = new Map()

  await client.send('Network.enable')
  await client.send('Network.setCacheDisabled', {
    cacheDisabled: true
  })

  client.on('Network.responseReceived', (event) => {
    const isScript = event.type === 'Script'
      || event.response.mimeType.includes('javascript')
      || event.response.url.endsWith('.js')

    if (isScript) {
      scripts.set(event.requestId, {
        url: event.response.url,
        transfer: 0,
        decoded: 0
      })
    }
  })

  client.on('Network.dataReceived', (event) => {
    const script = scripts.get(event.requestId)

    if (script) {
      script.decoded += event.dataLength
    }
  })

  client.on('Network.loadingFinished', (event) => {
    const script = scripts.get(event.requestId)

    if (script) {
      script.transfer = event.encodedDataLength
    }
  })

  await page.goto(url, {
    waitUntil: 'networkidle'
  })

  await browser.close()

  return [...scripts.values()]
}

for (const url of urls) {
  const scripts = await measure(url)
  const total = scripts.reduce((result, script) => {
    result.transfer += script.transfer
    result.decoded += script.decoded

    return result
  }, {
    transfer: 0,
    decoded: 0
  })

  console.log(`\n${url}`)
  console.table(scripts.map(script => ({
    url: script.url,
    transfer: format(script.transfer),
    decoded: format(script.decoded)
  })))
  console.table([{
    scripts: scripts.length,
    transfer: format(total.transfer),
    decoded: format(total.decoded)
  }])
}
