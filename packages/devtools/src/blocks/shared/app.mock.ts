import {
  InjectionContext,
  signal,
  computed,
  mountable,
  untracked,
  record,
  inject,
  uninspected,
  isFunction,
  start,
  provide
} from '@nano_kit/store'
import {
  type Child,
  component$,
  context$,
  effect$,
  fragment
} from 'nanoviews'
import type { Decorator } from '@nanoviews/storybook'
import { RegistryStore$ } from '../../stores/registry.js'
import { SignalsStore$ } from '../../stores/signals.js'
import { LibraryDetector$ } from '../../services/naming/index.js'
import { isWorkspaceLibrary } from '../../services/naming/naming.mock.js'

export interface CartItem {
  id: number
  title: string
  qty: number
  price: number
}

const TICK = 10_000

export function Cart$() {
  const $items = signal<CartItem[]>([
    {
      id: 12,
      title: 'Mechanical keyboard, 75%',
      qty: 1,
      price: 89
    },
    {
      id: 31,
      title: 'Keycap set, ivory',
      qty: 1,
      price: 39
    },
    {
      id: 7,
      title: 'USB-C cable, 2 m',
      qty: 1,
      price: 20
    }
  ])
  const $total = computed(() => $items().reduce((sum, item) => sum + item.qty * item.price, 0))
  const $count = computed(() => $items().length)
  // Read by hand once and by no effect: out of date after the first tick
  const $titles = computed(() => $items().map(item => item.title))
  // Nobody reads it: unmounted
  const $coupon = mountable(signal<string | null>(null))
  // Nobody has evaluated it
  const $discount = computed(() => ($coupon() ? $total() / 10 : 0))
  const tick = () => {
    $items(items => items.map((item, index) => (
      index
        ? item
        : {
          ...item,
          qty: item.qty + 1
        }
    )))
  }

  untracked($titles)

  return {
    $items,
    $total,
    $count,
    $titles,
    $coupon,
    $discount,
    tick
  }
}

export function User$() {
  return record(mountable(signal({
    id: 42,
    name: 'Dan',
    plan: 'pro'
  })))
}

export const Cart = component$(({ tick: ticking }: {
  tick?: boolean
}) => {
  const {
    $total,
    $count,
    $items,
    tick
  } = inject(Cart$)

  effect$(() => {
    $total()
    $count()
  })

  if (ticking) {
    effect$(() => {
      $items()
    })

    effect$(() => {
      const timer = setInterval(tick, TICK)

      return () => clearInterval(timer)
    })
  }
})

export const User = component$(() => {
  const $user = inject(User$)

  effect$(() => {
    $user.$name()
  })
})

export const Selector = component$(({ select }: {
  select?: (target: any) => any
}) => {
  const registry = inject(RegistryStore$)
  const signals = inject(SignalsStore$)
  const $user = inject(User$)
  const cart = inject(Cart$)
  const ctx = {
    ...cart,
    $user
  }

  if (select) {
    queueMicrotask(() => {
      uninspected(() => {
        const target = select(ctx)

        signals.select(target ? registry.idOf(target.node) : undefined)
      })
    })
  }
})

function Uninspected(story: () => Child): Child {
  const render = () => uninspected(() => {
    let result = story()

    while (isFunction(result) && 'c' in result) {
      result = result()
    }

    return result
  })

  render.c = true as const

  return render
}

export function withMockApp(): Decorator {
  const context = new InjectionContext([
    provide(LibraryDetector$, isWorkspaceLibrary)
  ])

  uninspected(() => {
    const registry = inject(RegistryStore$, context)
    const signals = inject(SignalsStore$, context)

    start(registry.records.$index)
    void signals
  })

  return (story, { parameters }) => (
    context$(context)(
      fragment(
        Uninspected(story),
        User(),
        Cart({
          tick: parameters.tick
        }),
        Selector({
          select: parameters.select
        })
      )
    )
  )
}
