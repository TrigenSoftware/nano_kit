import { defineProtoProp } from './utils.js'

type Target = EventTarget & {
  disabled?: boolean
  __mp?: ParentNode
}

function eventHandler(event: Event) {
  const key = `__${event.type}`
  let node: Target | undefined

  Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    get: () => node
  })

  const path = event.composedPath()

  for (let i = 0, len = path.length - 4, handler; i < len; i++) {
    node = path[i]

    // @ts-expect-error Get monkey defined property
    if ((handler = node[key] as EventListener | undefined) !== undefined && !node.disabled) {
      handler.call(node, event)

      if (event.cancelBubble) {
        break
      }
    }

    if (node.__mp) {
      break
    }
  }

  node = undefined
}

let delegatedEvents: Set<string> | undefined

export function delegateEvent(eventName: string) {
  delegatedEvents ??= new Set()

  if (!delegatedEvents.has(eventName)) {
    defineProtoProp(`__${eventName}`)
    delegatedEvents.add(eventName)
    document.addEventListener(eventName, eventHandler)
  }
}
