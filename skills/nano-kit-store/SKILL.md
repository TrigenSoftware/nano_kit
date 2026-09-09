---
name: nano-kit-store
description: How to use @nano_kit/store, the signals-based state management core of Nano Kit. Covers signals, computed values, effects, mountable stores with lifecycle hooks, dependency injection with injectable store factories, async tasks, SSR hydration, storage-backed and external signals, structured state helpers, functional operators and testing. Apply when writing, reviewing or testing stores and business logic built on @nano_kit/store. Every other nano_kit skill refers here for the reactive core instead of repeating it.
license: MIT
compatibility:
  - Claude Code
  - Codex
  - Cursor
  - Gemini CLI
  - GitHub Copilot
  - Windsurf
  - Cline
  - Roo Code
  - Goose
  - Continue
  - OpenCode
  - Amp
  - universal
metadata:
  author: dangreen
  tags:
    - nano_kit
    - store
    - signals
    - state-management
    - dependency-injection
    - ssr
  docs:
    paths:
      - store
---

# @nano_kit/store

`@nano_kit/store` is the signals core of Nano Kit: signals, computeds, effects, mountable stores with lifecycle hooks, dependency injection, async helpers and SSR hydration. Every other nano_kit package builds on it, and their skills point here instead of repeating it.

## Reference

`DOCS.md` next to this file is the documentation of the released package as published on https://nano-kit.js.org, generated from the site sources. Read its relevant sections for exact signatures, options and examples before writing code. This skill adds only what the documentation leaves open: conventions, which tool to pick for which job, and pitfalls.

## Mental model

- State is many small signals, not one object: one signal per independent piece of state. A cohesive entity (a user, a list) in one signal is fine.
- A store is a factory named `Something$`: usually a function that creates signals and actions and returns them as an object, sometimes a class extending `Injectable$` whose fields hold them. Stores get their dependencies through `inject()` so that tests, SSR requests and platforms can swap them.
- Resources (timers, sockets, requests) live in the lifecycle of a mountable signal, not in components: `onMount` opens them when the first consumer appears and its cleanup closes them after the last one leaves.
- Components only read signals and call actions. Derived values, validation and requests are computeds and actions in a store.

## Naming

- `$name` for anything that tracks signals when called: signals, computeds, accessors and helpers such as `$get`.
- `Name$` (capitalized, `$` suffix) for DI tokens: store factories, service classes, provided values.
- Plain names for actions and non-reactive values: `loadUser`, `paths`, `navigation`.

```ts
import { signal, computed, action, inject, Injectable$ } from '@nano_kit/store'

export function Counter$() {
  const $count = signal(0)
  const $double = computed(() => $count() * 2)
  const increment = action(() => $count(n => n + 1))

  return { $count, $double, increment }
}

export class Api$ extends Injectable$ {
  fetch(url: string) {
    return globalThis.fetch(`/api/${url}`)
  }
}
```

## Which tool for which job

- React to state with `effect` in stores and with the framework hooks in components. The callback subscriptions (`subscribe`, `listen`, `observe`) exist for adapters and bindings; in app code `effect` and `onMountEffect` track and clean up for you.
- Wrap every store action in `action`, including one that only writes today. An effect that calls the action then never subscribes to what the action reads, now or after the next refactor.
- "Fetch when the parameters change while someone is looking" is `onMountEffect` on a mountable result signal: read the parameters inside the effect, do the request in an `action`.
- `computed` for anything derived, and keep it pure; side effects belong in `effect` or `onMount`.
- One-off async values: `resolved`. Remote data that needs caching, deduplication and invalidation: `@nano_kit/query` (skill `nano-kit-query`).
- Many consumers asking the same question about one value (which row is selected): `selector` instead of a computed per consumer.
- Rate limiting: `paced` when the signal itself should be written at a limited rate, `pace` inside a `computed` for a limited read of another signal.
- The low-level exports (raw lifecycle hooks `onStart`, `onStop`, `onMounted`; `subscribe`, `listen`, `observe`; `start`, `exec`; `readonly`; `SignalsMap`; `getContext`; `external` and `stored`) are for adapters, framework bindings and tests. Reaching for them inside an app store is a sign that the design is off. `start` and `exec` are how a test mounts a store.

## Dependency injection

- Prefer injectable factories over module-level singletons as soon as the app has SSR or tests: module state is shared by every request of a server process, a context is per request and per test.
- Inject stores into stores and components; provide services (transport, cookies, navigation) at the root, so a test replaces them with `provide(Token$, mock)` instead of module mocking.
- A token without a sensible default should throw `DependencyNotFound`, so misconfiguration is loud.
- Keep `inject()` inside factories, `run(context, fn)` or framework hooks; outside a context it throws.

## SSR

- Register the signals the server must ship with `hydratable`; pass a codec only for values that do not survive JSON.
- `isHydrated` is cleared by the signal's own next change and knows nothing about parameters. A guard that skips a fetch after hydration must remember which input the hydrated value belongs to, otherwise the first parameter change after hydration fetches nothing.
- Hydration ids are global to the snapshot, not per store: prefix them with the store name (`user.profile`), two signals with one id overwrite each other.

## Testing

- Test stores without components: build an `InjectionContext` with mocks, `inject` the store, mount the signal under test with `start` and wait for its async work as the Testing section of `DOCS.md` shows.
- Unmount cleanup is debounced by `STORE_UNMOUNT_DELAY`; tests that expect immediate teardown use fake timers.

## Pitfalls

- Effects track only synchronous reads: a signal read after an `await` or inside a timer callback is not a dependency. Read what you need first or pass it as an argument.
- Writing the same value does not notify, and mutating an object in place keeps the same reference: replace the value, or notify with `trigger` when mutation is deliberate.
- Creating signals inside a render function creates a new store on every render. Create them in factories and read them through the framework hook.
- Forgetting `mountable()` means `onMount` and `onMountEffect` never fire.
- Reading `window`, `document` or storage while creating a store or in `onMount` breaks SSR, because the server mounts the stores it awaits. Use `@nano_kit/platform-web` signals, they have server fallbacks.
