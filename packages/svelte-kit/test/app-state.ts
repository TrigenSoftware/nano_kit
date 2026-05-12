export const page = {
  url: new URL('https://example.com/')
}

export function setPageUrl(url: string | URL) {
  page.url = url instanceof URL
    ? url
    : new URL(url, 'https://example.com')
}

export function resetPage() {
  setPageUrl('/')
}
