if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting())
  self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

  const pagesWithEmbeds = /^\/(?:examples|tutorial)(?:\/|$)/

  self.addEventListener('fetch', (event) => {
    const request = event.request

    if (request.mode !== 'navigate' || !pagesWithEmbeds.test(new URL(request.url).pathname)) {
      return
    }

    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 0) {
          return response
        }

        const newHeaders = new Headers(response.headers)

        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin')

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        })
      })
    )
  })
} else if (window.crossOriginIsolated === false && window.isSecureContext && navigator.serviceWorker) {
  void navigator.serviceWorker.register(window.document.currentScript.src)
}
