# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.2.0...v2.0.0) (2026-10-21)

### Nano Kit 2.0 🎉

#### What's new

- **DevTools.** [`@nano_kit/devtools`](https://nano-kit.js.org/store/devtools/) is a panel right on the page to inspect your stores: your signals, their values and a log of every change.
- **Development warnings.** In development, the packages warn about common mistakes, like a missing route parameter or a missing translation.
- **Tasks on signals.** SSR and tests wait only for the data they need, not for every request in flight.
- **Smarter dependency injection.** Stores are shared between nested contexts unless a context overrides what they depend on. The new `provideAs` swaps an implementation, like a mock API in tests.
- **`SignalsMap` class.** The reactive map now has the familiar `Map` API.
- **Operators.** With static operands they return a plain value, and `pick`, `text` and `latest` are new.
- **intl.** `relativetime()` picks the unit by itself, from "5 minutes ago" to "yesterday", and `format()` messages accept signals.
- **Preact 11 and SvelteKit 3** are supported.

#### Upgrading from 1.x

The breaking changes below list everything. The usual edits:

- Node.js 24 or newer is required.
- `inject(TasksRunner$)` with `task(fn)` becomes `task($signal, fn)`, `waitTasks(pool)` becomes `waitTasks($signal)`, and `client(ssr())` or `client(tasks(), hydratable())` becomes `client(hydratable())`.
- `context.set(token, value)` becomes `context.deps.set(token, value)`. To keep a store per context, provide it in that context.
- `$getMapKey(map, key)`, `setMapKey`, `deleteMapKey` and `clearMap` become `map.$get(key)`, `map.set`, `map.delete` and `map.clear` of a `new SignalsMap()`.
- An operator with static operands returns the value, not an accessor, and `concat($first, ' ', $last)` becomes `` text`${$first} ${$last}` `` (the `f` tag in the notes below shipped as `text`).
- `resolved` keeps a falsy value as data: express an empty state with the type, such as `User | null`.
- An `effect` created in a deferred scope body no longer defers: use `deferEffect` there.
- `relativetime()` takes a moment instead of a count, and its `unit` option is gone: set `largestUnit` and `smallestUnit` to one unit to format in it.

#### Where to start

- 📚 [Documentation](https://nano-kit.js.org): guides for every package
- 🛠️ [DevTools](https://nano-kit.js.org/store/devtools/): install the panel and open it with Alt+Shift+D
- 🤖 [Agent Skills](https://nano-kit.js.org/getting-started/agent-skills/): teach your coding agent the Nano Kit API

### ⚠ BREAKING CHANGES

* the packages require Node.js 24 or newer.

### Features

* add the DevTools panel ([#263](https://github.com/TrigenSoftware/nano_kit/issues/263)) ([bc1e51a](https://github.com/TrigenSoftware/nano_kit/commit/bc1e51a9c8e5979aa7813039c4e78bfd052bccc0))
* require Node.js 24 ([#268](https://github.com/TrigenSoftware/nano_kit/issues/268)) ([c6ed062](https://github.com/TrigenSoftware/nano_kit/commit/c6ed0627e0e76785941ede1bb8f280c5d80896a0))
