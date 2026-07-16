const pagesWithEmbeds = /^\/(?:examples|tutorial)(?:\/|$)/

if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting())
  self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

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
  void navigator.serviceWorker.register(window.document.currentScript.src).then((registration) => {
    if (!pagesWithEmbeds.test(window.location.pathname)) {
      return
    }

    if (registration.active && !navigator.serviceWorker.controller) {
      window.location.reload()
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
        once: true
      })
    }
  })
}
