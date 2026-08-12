# Agera

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/agera.svg
[npm-url]: https://npmjs.com/package/agera

[deps]: https://img.shields.io/librariesio/release/npm/agera
[deps-url]: https://libraries.io/npm/agera

[size]: https://deno.bundlejs.com/badge?q=agera
[size-url]: https://bundlejs.com/?q=agera

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../website/src/assets/sun_white.svg">
  <img alt="Halftone sun logo" src="../../website/src/assets/sun_black.svg" width="100" height="100" align="right">
</picture>

A small push-pull based signal library based on [alien-signals](https://github.com/stackblitz/alien-signals) algorithm.

Was created as reactivity system for [nanoviews](https://github.com/TrigenSoftware/nano_kit/tree/main/packages/nanoviews) and [Kida](https://github.com/TrigenSoftware/nano_kit/tree/main/packages/kida).

- **Small**. Around 1.8 kB for basic methods (minified and brotlied). Zero dependencies.
- **Super fast** as [alien-signals](https://github.com/stackblitz/alien-signals).
- Designed for best **Tree-Shaking**: only the code you use is included in your bundle.
- **TypeScript**-first.

```ts
import { signal, computed, effect } from 'agera'

const $count = signal(1)
const $doubleCount = computed(() => count() * 2)

effect(() => {
  console.log(`Count is: ${$count()}`);
}) // Console: Count is: 1

console.log($doubleCount()) // 2

$count(2) // Console: Count is: 2

console.log($doubleCount()) // 4
```

<hr />
<a href="#install">Install</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#api">API</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#why">Why?</a>
<br />
<hr />

## Install

```bash
pnpm add agera
# or
npm i agera
# or
yarn add agera
```

## API

### Signal

Signal is a basic store type. It stores a single value.

```ts
import { signal } from 'agera'

const $count = signal(0)

$count($count() + 1)
// or
$count(count => count + 1)
```

To watch signal changes, use the `effect` function. Effect will be called immediately and every time the signal changes.

```ts
import { signal, effect } from 'agera'

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
import { computed } from 'agera'

const $firstName = signal('John')
const $lastName = signal('Doe')
const $fullName = computed(() => `${$firstName()} ${$lastName()}`)

console.log($fullName()) // John Doe
```

### `effectScope`

`effectScope` creates a scope for effects. It allows to stop all effects in the scope at once.

```ts
import { signal, effectScope, effect } from 'agera'

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

### `subscribe`

`subscribe` subscribes to accessor changes. Callback will be called immediately with the current value and on every subsequent change. Will trigger accessor mount if applicable.

```ts
import { signal, subscribe } from 'agera'

const $count = signal(0)

const stop = subscribe($count, (value) => {
  console.log('Count:', value)
})
// Console: Count: 0

$count(1)
// Console: Count: 1

stop()
```

### `listen`

`listen` listens to accessor changes. Callback will be called only on value change, without initial call. Will trigger accessor mount if applicable.

```ts
import { signal, listen } from 'agera'

const $count = signal(0)

const stop = listen($count, (value) => {
  console.log('Count changed:', value)
})
// No console output

$count(1)
// Console: Count changed: 1

stop()
```

### `observe`

`observe` observes accessor changes. Callback will be called only on value change, without initial call. Unlike `subscribe` and `listen`, it will **not** trigger accessor mount.

```ts
import { signal, mountable, observe, onMounted } from 'agera'

const $count = mountable(signal(0))

onMounted($count, (mounted) => {
  console.log('Signal is', mounted ? 'mounted' : 'unmounted')
})

const stop = observe($count, (value) => {
  console.log('Count changed:', value)
})
// No mount event, no console output

$count(1)
// Console: Count changed: 1

stop()
```

### Lifecycles

One of main feature of Agera is that you can create *mountable* signals. It allows to create lazy signals, which will use resources only if signal is really used in the UI.

- Signal is **mounted** when one or more effects is attached to it.
- Signal is **unmounted** when signal has no effects.

`mountable` method makes signal mountable.

`onMounted` lifecycle method adds callback for mount and unmount events.

```ts
import { signal, mountable, onMounted, effect } from 'agera'

const $count = mountable(signal(0))

onMounted($count, (mounted) => {
  console.log('Signal is', mounted ? 'mounted' : 'unmounted')
})

// will mount signal
const stop = effect(() => {
  console.log('Count:', $count())
})
// will unmount signal
stop()
```

### Batch updates

To batch updates you should wrap signal updates in `batch` function.

```ts
import { signal, batch, effect } from 'agera'

const $a = signal(0)
const $b = signal(0)

effect(() => {
  console.log('Sum:', $a() + $b())
})

// Effects will be called only once
batch(() => {
  $a(1)
  $b(2)
})
```

### Skip tracking

To skip tracking of signal changes you should wrap signal into `untracked` function.

```ts
import { signal, untracked, effect } from 'agera'

const $a = signal(0)
const $b = signal(0)

effect(() => {
  const a = $a()

  untracked(() => {
    const b = $b()

    resumeTracking()

    console.log('Sum:', a + b)
  })
})
// or short variant
effect(() => {
  console.log('Sum:', $a() + untracked($b))
})

// Will trigger effect run
$a(1)

// Will not trigger effect run
$b(2)
```

### `isSignal`

`isSignal` method checks if the value is a signal.

```ts
import { isSignal, signal } from 'agera'

isSignal(signal(1)) // true
```

## Why?

Key differences from [alien-signals](https://github.com/stackblitz/alien-signals):

- **Tree-shaking**. Agera is designed to be tree-shakable. Only the code you use is included in your bundle. Alien-signals is not well tree-shakable.
- **Size**. Agera has a little bit smaller size for basic methods than alien-signals.
- **Lifecycles**. Agera has lifecycles for signals. You can listen to signal activation and deactivation events.
- **Modificated `effectScope`**. Agera has a possibility to put effect scope inside another effect scope. Also there is a possibility to create a lazy scope.
- Effects supports cleanup function.
