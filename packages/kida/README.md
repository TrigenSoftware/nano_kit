# Kida

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/kida.svg
[npm-url]: https://npmjs.com/package/kida

[deps]: https://img.shields.io/librariesio/release/npm/kida
[deps-url]: https://libraries.io/npm/kida

[size]: https://deno.bundlejs.com/badge?q=kida
[size-url]: https://bundlejs.com/?q=kida

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../website/src/assets/planet_white.svg">
  <img alt="Halftone planet logo" src="../../website/src/assets/planet_black.svg" width="100" height="100" align="right">
</picture>

A small state management library inspired by [Nano Stores](https://github.com/nanostores/nanostores) and based on [Agera](https://github.com/TrigenSoftware/nano_kit/tree/main/packages/agera).

- **Small**. Around 2 kB for basic methods (minified and brotlied). Zero dependencies.
- **~5x faster** than Nano Stores.
- Designed for best **Tree-Shaking**: only the code you use is included in your bundle.
- **TypeScript**-first.

```ts
// store/users.ts
import { signal, push } from 'kida'

export const $users = signal<User[]>([])

export function addUser(user: User) {
  push($users, user)
}
```

```ts
// store/admins.ts
import { computed } from 'kida'
import { $users } from './users.js'

export const $admins = computed(() => $users().filter(user => user.isAdmin))
```

```tsx
// components/admins.ts
import { record } from 'kida'
import { $admins } from '../stores/admins.js'

export function Admins() {
  return ul()(
    for$($admins, user => user.id)(
      $admin => li()(record($admin).$name)
    )
  )
}
```

<hr />
<a href="#install">Install</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#basics">Basics</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#complex-data-types">Complex data types</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#dependency-injection">Dependency injection</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#utils">Utils</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#why">Why?</a>
<br />
<hr />

## Install

```bash
pnpm add kida
# or
npm i kida
# or
yarn add kida
```

## Basics

### Signal

Signal is a basic store type. It stores a single value.

```ts
import { signal } from 'kida'

const $count = signal(0)

$count($count() + 1)
// or
$count(count => count + 1)
```

To watch signal changes, use the `effect` function. Effect will be called immediately and every time the signal changes.

```ts
import { signal, effect } from 'kida'

const $count = signal(0)

const stop = effect(() => {
  console.log('Count:', $count())

  return () => {
    // Cleanup function. Will be called before effect update and before effect stop.
  }
})
// later you can stop effect
stop()
```

### Computed

Computed is a signal that computes its value based on other signals.

```ts
import { computed } from 'kida'

const $firstName = signal('John')
const $lastName = signal('Doe')
const $fullName = computed(() => `${$firstName()} ${$lastName()}`)

console.log($fullName()) // John Doe
```

### `effectScope`

`effectScope` creates a scope for effects. It allows to stop all effects in the scope at once.

```ts
import { signal, effectScope, effect } from 'kida'

const $a = signal(0)
const $b = signal(0)
const stop = effectScope(() => {
  effect(() => {
    console.log('A:', $a())
  })

  effectScope(() => {
    effect(() => {
      console.log('B:', $b())
    })
  })
})

stop() // stop all effects
```

### `deferScope`

Also there is a possibility to create a defer scope.

```ts
import { signal, deferScope, effectScope, effect } from 'kida'

const $a = signal(0)
const $b = signal(0)
// All scopes will run immediately, but effects run is delayed
const start = deferScope(() => {
  effect(() => {
    console.log('A:', $a())
  })

  effectScope(() => {
    effect(() => {
      console.log('B:', $b())
    })
  })
}, true) // marks scope as lazy
// start all effects
const stop = start()

stop() // stop all effects
```

### `onMountEffect`

`onMountEffect` accepts a signal as a first argument to start effect on this [signal mount](#lifecycles).

```ts
import { signal, mountable, onMountEffect } from 'kida'

const $weather = mountable(signal('sunny'))
const $city = signal('Batumi')

onMountEffect($weather, () => {
  $weather(getWeather($city()))
})
```

### `onMountEffectScope`

`onMountEffectScope` accepts a signal as a first argument to run effect scope on this [signal mount](#lifecycles).

```ts
import { signal, mountable, onMountEffectScope, effect } from 'kida'

const $weather = mountable(signal('sunny'))
const $city = signal('Batumi')

onMountEffectScope($weather, () => {
  effect(() => {
    console.log('Weather:', $weather())
  })

  effect(() => {
    console.log('City:', $city())
  })
})
```

### Lifecycles

One of main feature of Kida is that you can create *mountable* signals. It allows to create lazy signals, which will use resources only if signal is really used in the UI.

- Signal is **mounted** when one or more effects is attached to it.
- Signal is **unmounted** when signal has no effects.

`mountable` method makes signal mountable.

`onMount` lifecycle method adds callback for mount and unmount events.

```ts
import { signal, mountable, onMount, effect } from 'kida'

const $count = mountable(signal(0))

onMount($count, () => {
  // Signal is now active
  return () => {
    // Signal is going to be inactive
  }
})

// will trigger mount event
const stop = effect(() => {
  console.log('Count:', $count())
})
// will trigger unmount event
stop()
```

For performance reasons, signal will move to disabled mode with 1 second delay after last effect unsubscribing. It allows to avoid unnecessary signal updates in case of fast mount/unmount events.

There are other lifecycle methods:

- `onStart($signal, () => Destroy)`: first effect was attached. Low-level method. It is better to use `onMount` for simple lazy signals.
- `onStop($signal, () => Destroy)`: last effect was detached. Low-level method. It is better to use `onMount` for simple lazy signals.

#### `start`

`start` method starts signal and returns function to stop it. It can be useful to write tests for signals.

```ts
import { signal, mountable, onMount, start } from 'kida'

const $count = mountable(signal(0))

onMount($count, () => {
  console.log('Signal started')
})

const stop = start($count) // Signal started

stop()
```

#### `exec`

`exec` method starts and immediately stops signal and returns signal value. It can be used to trigger onMount events.

```ts
import { signal, mountable, onMount, exec } from 'kida'

const $count = mountable(signal(0))

onMount($count, () => {
  console.log('Signal started')
})

exec($count) // Signal started and stopped
```

## Complex data types

### Record

`record` method gives access to properties of the object as child signals.

```ts
import { record } from 'kida'

const $user = record({ name: 'Dan', age: 30 })
const $name = $user.$name

console.log($name()) // Dan
```

Also record can be created from another signal.

```ts
const $userRecord = record($computedUser)
```

`record` method caches child signals in the parent signal. So you can call `record` multiple times on same signal without performance issues.

```ts
import { signal, record } from 'kida'

const $user = signal({ name: 'Dan', age: 30 })
const $name = record($user).$name
const $age = record($user).$age
```

### Deep Record

`deepRecord` method gives access to nested properties of the object as child signals.

```ts
import { deepRecord } from 'kida'

const $user = deepRecord({ name: 'Dan', address: { city: 'Batumi' } })
const $city = $user.$address.$city

console.log($city()) // Batumi
```

Also deep record can be created from another signal.

```ts
const $userRecord = deepRecord($computedUser)
```

### List

`atIndex` method creates a signal for a specific index of an array.

```ts
import { signal, atIndex } from 'kida'

const $users = signal(['Dan', 'John', 'Alice'])
const $firstUser = atIndex($users, 0)

console.log($firstUser()) // Dan

$firstUser('Bob')

console.log($users()) // ['Bob', 'John', 'Alice']
```

`atIndex` supports dynamic indexes.

```ts
import { signal, atIndex } from 'kida'

const $users = signal(['Dan', 'John', 'Alice'])
const $index = signal(0)
const $user = atIndex($users, $index)

console.log($user()) // Dan

$index(1)

console.log($user()) // John
```

There are also other methods to work with arrays:

- `updateList($list, fn)` - update the value of the list signal using a function.
- `push($list, ...values)` - add values to the list signal.
- `pop($list)` - removes the last element from a list signal and returns it.
- `shift($list)` - removes the first element from a list signal and returns it.
- `unshift($list, ...values)` - inserts new elements at the start of an list signal, and returns the new length of the list.
- `setIndex($list, index, value)` - set value at index in the list signal.
- `deleteIndex($list, index)` - delete element at index from the list signal.

### Object

`atKey` method creates a signal for a specific key of an object.

```ts
import { signal, atKey } from 'kida'

const $users = signal({
  2: 'Dan',
  4: 'John',
  6: 'Alice'
})
const $atId4 = atKey($users, 4)

console.log($atId4()) // John

$atId4('Bob')

console.log($atId4()) // { 2: 'Dan', 4: 'Bob', 6: 'Alice' }
```

`atKey` supports dynamic indexes.

```ts
import { signal, atKey } from 'kida'

const $users = signal({
  2: 'Dan',
  4: 'John',
  6: 'Alice'
})
const $id = signal(4)
const $user = atKey($users, $id)

console.log($user()) // John

$index(6)

console.log($user()) // Alice
```

There are also other methods to work with object maps:

- `setKey($object, key, value)` - set value by key to the object signal.
- `deleteKey($object, key)` - delete item by key from the object signal.

## Dependency injection

The dependency injection system enables modular architecture and makes testing easier by allowing dependencies to be easily replaced with mocks. It also plays a critical role in SSR scenarios by isolating state between requests.

Use factory functions with `inject` to retrieve dependencies:

```ts
import { inject, signal, mountable, onMountEffect, action } from 'kida'

/* Factory function that defines a user store */
function User$() {
  const $userId = signal(null)
  const $user = mountable(signal(null))

  const fetchUser = action(async (id) => {
    if (typeof id !== 'number') {
      $user(null)
      return
    }

    const response = await fetch(`/user/${id}`)
    const user = await response.json()

    $user(user)
  })

  onMountEffect($user, () => {
    fetchUser($userId())
  })

  return { $userId, $user }
}
```

Call `inject(Factory$)` inside another factory to compose dependencies:

```ts
import { inject, signal } from 'kida'

function App$() {
  const { $user } = inject(User$)
  // ...
}
```

### `provide` / `InjectionContext` / `run`

Use `provide` to override dependencies with custom values. Pass the providers to `InjectionContext` and run your code within it using `run`:

```ts
import { InjectionContext, provide, inject, run } from 'kida'

function Theme$() {
  return 'light'
}

const context = new InjectionContext([
  provide(Theme$, 'dark')
])

run(context, () => {
  const theme = inject(Theme$) // 'dark'
})
```

This pattern is especially useful in tests to mock dependencies:

```ts
import { InjectionContext, provide, inject, run } from 'kida'

const context = new InjectionContext([
  provide(ApiClient$, mockApiClient)
])

run(context, () => {
  const { $user } = inject(User$)
  // $user will use mockApiClient
})
```

## Utils

### `isSignal`

`isSignal` method checks if the value is a signal.

```ts
import { isSignal, signal } from 'kida'

isSignal(signal(1)) // true
```

### `toSignal`

`toSignal` method converts any value to signal or returns signal as is.

```ts
import { toSignal, computed } from 'kida'

const $count = toSignal(0) // WritableSignal<number>
const $double = toSignal(computed(() => $count() * 2)) // ReadableSignal<number>
```

### `length`

`length` method creates a signal that tracks the `length` property of the object.

```ts
import { signal, length } from 'kida'

const $users = signal(['Dan', 'John', 'Alice'])
const $count = length($users)
```

### `boolean`

`boolean` method creates a signal that converts the value to a boolean.

```ts
import { signal, boolean } from 'kida'

const $user = signal(null)
const $hasUser = boolean($user)
```

### `$get`

`$get` method gets the value from the signal or returns the given value.

```ts
import { signal, $get } from 'kida'

$get(signal(1)) // 1
$get(1) // 1
```

### `get`

`get` method gets the value from the signal or returns the given value **without tracking** (untracked).

```ts
import { signal, get } from 'kida'

get(signal(1)) // 1
get(1) // 1
```

### `composeDestroys`

`composeDestroys` method composes multiple destroy functions into one.

```ts
import { composeDestroys, effect } from 'kida'

effect(() => composeDestroys(
  intervalLogger($interval),
  windowResizeLogger($size)
))
```

### `isEmpty`

`isEmpty` checks if the value is `null` or `undefined`.

```ts
import { isEmpty } from 'kida'

isEmpty(null) // true
isEmpty(undefined) // true
isEmpty(0) // false
isEmpty('') // false
```

### `resolved`

`resolved` accepts a promise or promise accessor and returns a `[$result, $error, $pending]` tuple of reactive signals. When the source changes, stale data is preserved while the new promise is pending, and the previous promise result is ignored.

```ts
import { signal, computed, resolved } from 'kida'

function getPosition(options?: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

const $highAccuracy = signal(false)
const [$position, $error, $pending] = resolved(
  computed(() => getPosition({ enableHighAccuracy: $highAccuracy() }))
)
```

A falsy source resets all signals to their initial state (`data: undefined`, `error: undefined`, `pending: false`).

> [!NOTE]
> For remote data fetching with caching, request deduplication, cancellation, refetching, and other advanced features, consider using [`@nano_kit/query`](https://github.com/TrigenSoftware/nano_kit/tree/main/packages/query) instead.

## Why?

Nano Stores is a great library with wonderful idea of stores with lifecycles. But it has some drawbacks:

- **Performance**. Nano Stores is slow. Kida is ~5x faster than Nano Stores.
- **DX**. Kida is focused more on DX than on bundle size. Nano Stores is smaller, but (to my mind) have worse API.
- **SSR**. Nano Stores has no support for SSR. Kida has a built-in dependency injection system and serialization methods to work with SSR.

| Benchmark<br>Throughput avg (ops/s) | Kida / Agera | Alien Signals | Nano Stores |
| ------- | --------- | ------- | ------ |
| [signal](../benchmarks/atom.js) | 25 541 296 ± 0.00% | 25 692 493 ± 0.00% | 4 501 870 ± 0.01% |
| [computed](../benchmarks/computed.js) | 3 747 576 ± 0.01% | 3 979 152 ± 0.01% | 611 026 ± 0.04% |
| [effect](../benchmarks/effect.js) | 3 977 679 ± 0.01% | 4 165 849 ± 0.01% | 1 992 654 ± 0.01% |
