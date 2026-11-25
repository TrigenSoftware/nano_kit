interface RequestEvent {
  isDataRequest: boolean
  url: URL
  locals: Record<string, unknown>
}

let requestEvent = createRequestEvent()

export function createRequestEvent(
  url = '/',
  isDataRequest = false
): RequestEvent {
  return {
    isDataRequest,
    url: new URL(url, 'https://example.com'),
    locals: {}
  }
}

export function resetRequestEvent(
  url?: string,
  isDataRequest?: boolean
) {
  return requestEvent = createRequestEvent(url, isDataRequest)
}

export function setRequestEvent(event: RequestEvent) {
  requestEvent = event
}

export function getRequestEvent() {
  return requestEvent
}
