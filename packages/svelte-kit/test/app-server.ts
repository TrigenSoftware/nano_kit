interface RequestEvent {
  request: Request
  url: URL
  locals: Record<string, unknown>
}

let requestEvent = createRequestEvent()

export function createRequestEvent(
  accept = 'text/html',
  url = '/'
): RequestEvent {
  const requestUrl = new URL(url, 'https://example.com')

  return {
    request: new Request(requestUrl, {
      headers: {
        accept
      }
    }),
    url: requestUrl,
    locals: {}
  }
}

export function resetRequestEvent(
  accept?: string,
  url?: string
) {
  return requestEvent = createRequestEvent(accept, url)
}

export function setRequestEvent(event: RequestEvent) {
  requestEvent = event
}

export function getRequestEvent() {
  return requestEvent
}
