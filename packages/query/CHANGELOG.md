# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.0](https://github.com/TrigenSoftware/nano_kit/compare/v2.10.0...v3.0.0) (2026-11-13)

### ⚠ BREAKING CHANGES

* `encodeEntry`, `decodeEntry`, `encodeEntryData`, `decodeEntryData`,
  `encodeEntryDetails` and `decodeEntryDetails` are no longer exported. `ClientContext` has no
  `handleError()` method, its `codec` is `undefined` until the `codec()` setting sets it, and its
  `settled()` takes the revision of the request as a required argument.
* `keys()`, which iterates over every registered cache key builder, is
  renamed to `eachKeyBuilder()`, and `keys` now names the client extension that adds
  `eachKey()`: `keys(Key => invalidate(Key))` becomes `eachKeyBuilder(Key => invalidate(Key))`.
* `QueryClientContext` takes the type of the query parameters first,
  `QueryClientContext<P, R>`, so a setting typed as `QueryClientContext<T>` becomes
  `QueryClientContext<unknown[], T>`.
* after the last page, `next` of the infinite data is `undefined`, as its type
  says, rather than the falsy value that `next` returned. Read `more` to tell whether there is
  a next page.
* the tuple of `infinite()` gets `$nextError` and `$nextLoading` after
  `$loading`, so `$key` moves from the fifth place to the seventh.

### Features

* add `$nextError` and `$nextLoading` of the next page to `infinite()` ([#362](https://github.com/TrigenSoftware/nano_kit/issues/362)) ([42b5070](https://github.com/TrigenSoftware/nano_kit/commit/42b507070d0f2f36776ea7bff973d778868e7c5e))
* add `hold()` to show the data of the previous key while the next one loads ([#361](https://github.com/TrigenSoftware/nano_kit/issues/361)) ([681ffcf](https://github.com/TrigenSoftware/nano_kit/commit/681ffcf5c57bed65cd0aa08b48ec19cc636d4a8e))
* let `entities()` take the entity id from the query parameters to show the entity before the query has its own data ([#363](https://github.com/TrigenSoftware/nano_kit/issues/363)) ([bd6948a](https://github.com/TrigenSoftware/nano_kit/commit/bd6948ad009e24acd6bb4dc76543580c4cc7abcc))
* pick the cached keys of a builder by their parameters with the `keys()` extension, and rename the old `keys()` to `eachKeyBuilder()` ([#355](https://github.com/TrigenSoftware/nano_kit/issues/355)) ([87970c1](https://github.com/TrigenSoftware/nano_kit/commit/87970c1d98487b6ed201131fdaec2b5fb4c930a4))
* rename `hold()` to `preserve()` before its first release ([#364](https://github.com/TrigenSoftware/nano_kit/issues/364)) ([716671a](https://github.com/TrigenSoftware/nano_kit/commit/716671a4c91ecb25aba0e25a2eef065b66492766)), references [#361](https://github.com/TrigenSoftware/nano_kit/issues/361)
* skip a query while a parameter wrapped in `required()` has no value ([#360](https://github.com/TrigenSoftware/nano_kit/issues/360)) ([a5fa5f5](https://github.com/TrigenSoftware/nano_kit/commit/a5fa5f53505fd95f33b9fb01418d8fd38fbb4062))
* stop exporting the entry codec helpers and trim the client context ([#369](https://github.com/TrigenSoftware/nano_kit/issues/369)) ([ca3a622](https://github.com/TrigenSoftware/nano_kit/commit/ca3a6225ad2a5a3c878feef371c0678ab76d6086))

### Bug Fixes

* ask again in the browser for a key the server was still loading ([#351](https://github.com/TrigenSoftware/nano_kit/issues/351)) ([6d74bab](https://github.com/TrigenSoftware/nano_kit/commit/6d74babca5970f7af82ea1d8f278b87dce57e31f))
* ask for a failed key again when it is read again ([#350](https://github.com/TrigenSoftware/nano_kit/issues/350)) ([ec69fef](https://github.com/TrigenSoftware/nano_kit/commit/ec69fef08e722db65eeb61d58e372347cc37a75a))
* keep cache writes made while `fetchNext` loads a page ([#346](https://github.com/TrigenSoftware/nano_kit/issues/346)) ([646ee41](https://github.com/TrigenSoftware/nano_kit/commit/646ee4193e96ee66ef537f7b8d298422fe2622f2))
* keep data written with `$data` while a key loads for the first time ([#349](https://github.com/TrigenSoftware/nano_kit/issues/349)) ([bd46da4](https://github.com/TrigenSoftware/nano_kit/commit/bd46da4cf8a660eef9a52b95b8f7eac8c429a5d3))
* keep entity updates when `fetchNext` loads a page ([#347](https://github.com/TrigenSoftware/nano_kit/issues/347)) ([a3dd4e1](https://github.com/TrigenSoftware/nano_kit/commit/a3dd4e12d6016d89165c3f69c1fb6a6b9437d7f1))
* keep the data and the loaded pages when `retryOnError` retries ([#354](https://github.com/TrigenSoftware/nano_kit/issues/354)) ([4783420](https://github.com/TrigenSoftware/nano_kit/commit/47834204447c063df308b48b4179e4763ff98c67))
* keep the falsy values that `next` of `infinite()` returns out of the cursor type ([#358](https://github.com/TrigenSoftware/nano_kit/issues/358)) ([b5518ba](https://github.com/TrigenSoftware/nano_kit/commit/b5518bad0587e89f65b1fb84d77d95b9b871e629))
* refetch every loaded page when an infinite query is revalidated ([#353](https://github.com/TrigenSoftware/nano_kit/issues/353)) ([023aaaf](https://github.com/TrigenSoftware/nano_kit/commit/023aaaff14ec7857476b85fa3183e454914c3f8e))
* revalidate every query that shares a condition of `revalidateOn()` when the client has conditions too ([#365](https://github.com/TrigenSoftware/nano_kit/issues/365)) ([839480d](https://github.com/TrigenSoftware/nano_kit/commit/839480d3e828241f7b0ccc5d592cf41485747a4b))

### Performance Improvements

* drop dead checks and single-use helpers from the core and the settings ([#368](https://github.com/TrigenSoftware/nano_kit/issues/368)) ([d5274bb](https://github.com/TrigenSoftware/nano_kit/commit/d5274bb92f2cb7fcc9f3db7728d5adaccf8af0b1))
* shrink `indexedDbStorage()` and delete a shard with one request ([#367](https://github.com/TrigenSoftware/nano_kit/issues/367)) ([ca2b09c](https://github.com/TrigenSoftware/nano_kit/commit/ca2b09c87f360622e3dbf38cc8f91b40872888c9))
* shrink `query()`, `infinite()` and `operation()` by sharing their mount logic ([#366](https://github.com/TrigenSoftware/nano_kit/issues/366)) ([39e0b5c](https://github.com/TrigenSoftware/nano_kit/commit/39e0b5c8303379a8b3e699863ba7d348757bedae))

## [2.10.0](https://github.com/TrigenSoftware/nano_kit/compare/v2.9.0...v2.10.0) (2026-11-06)

### Features

* add `restore` and `restorePages` to undo `drop` ([#342](https://github.com/TrigenSoftware/nano_kit/issues/342)) ([22be0e7](https://github.com/TrigenSoftware/nano_kit/commit/22be0e72501e0719333bfc11ee786931c2411306))

## [2.9.0](https://github.com/TrigenSoftware/nano_kit/compare/v2.8.0...v2.9.0) (2026-11-06)

### Features

* add `undo` to `$data` to revert only its own change ([#337](https://github.com/TrigenSoftware/nano_kit/issues/337)) ([4adf879](https://github.com/TrigenSoftware/nano_kit/commit/4adf8798ab979a4a72f8119e48363ceef08d1aa6))

### Bug Fixes

* revert every entry of a shard to its own data ([#338](https://github.com/TrigenSoftware/nano_kit/issues/338)) ([cc54815](https://github.com/TrigenSoftware/nano_kit/commit/cc54815c9d55a7dc097e60a1ad39acda418a76e5))

## [2.8.0](https://github.com/TrigenSoftware/nano_kit/compare/v2.0.0...v2.8.0) (2026-11-05)

### Features

* add `previous` to run requests one after another ([#334](https://github.com/TrigenSoftware/nano_kit/issues/334)) ([657f856](https://github.com/TrigenSoftware/nano_kit/commit/657f856b38767cf3505c0bfd3c177cf3759ccf19))

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

* `$getMapKey`, `setMapKey`, `deleteMapKey`, `clearMap`, `subMapEvent`,
  `fireMapEvent`, `$$insert`, `$$clear`, `$$deleted` and the `SignalsMapEvent` and
  `SignalsMapEvents` types are removed from `@nano_kit/store`, and `SignalsMap` is a class to
  create with `new`, not a type over a plain `Map`. The `cache` of a query client context is
  a `ShardedSignalsMap`: its `has`, `set` and `delete` take a sharded key.
* the packages require Node.js 24 or newer.
* the tasks pool is gone — `TasksPool$`, `TasksRunner$`, `tasksRunner`, `addTask`,
  `waitCurrentTasks` and `taskPromise` are removed, `waitTasks` takes a signal instead of a pool, and
  the `tasks()` and `ssr()` query settings are removed: `hydratable()` is the whole SSR setting.

### Features

* add development diagnostics with separate development and production builds ([#236](https://github.com/TrigenSoftware/nano_kit/issues/236)) ([39be996](https://github.com/TrigenSoftware/nano_kit/commit/39be99600aa5c5066b8eb5205431740986df3dee))
* attach tasks to the signals they fill ([#222](https://github.com/TrigenSoftware/nano_kit/issues/222)) ([841acd1](https://github.com/TrigenSoftware/nano_kit/commit/841acd12fcb3c2bd6c494f9ff47dfe998c962457))
* replace the signals map functions with the `SignalsMap` and `IndexedSignalsMap` classes ([#261](https://github.com/TrigenSoftware/nano_kit/issues/261)) ([c062f06](https://github.com/TrigenSoftware/nano_kit/commit/c062f068a65f3869ec907175f0e1cc14e96d54a8))
* require Node.js 24 ([#268](https://github.com/TrigenSoftware/nano_kit/issues/268)) ([c6ed062](https://github.com/TrigenSoftware/nano_kit/commit/c6ed0627e0e76785941ede1bb8f280c5d80896a0))

### Bug Fixes

* drop the development warning about a cache key shard registered twice ([#275](https://github.com/TrigenSoftware/nano_kit/issues/275)) ([6a0749b](https://github.com/TrigenSoftware/nano_kit/commit/6a0749be1ccb44674dc34916b196259e151d2ed3))
* refetch a query revalidated while its request is in flight ([#284](https://github.com/TrigenSoftware/nano_kit/issues/284)) ([2c0ed97](https://github.com/TrigenSoftware/nano_kit/commit/2c0ed976f7ba43f79af044b4e20a98cffc5de1fb))

## [1.2.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.0.0...v1.2.0) (2026-08-30)

### Features

* rename `ValueOrAccessor` to `Signalish` ([#210](https://github.com/TrigenSoftware/nano_kit/issues/210)) ([c42723a](https://github.com/TrigenSoftware/nano_kit/commit/c42723a56944cea0f3935b1456a45b607924f0a9))

### Bug Fixes

* run user reducers and event handlers untracked ([#193](https://github.com/TrigenSoftware/nano_kit/issues/193)) ([03c78db](https://github.com/TrigenSoftware/nano_kit/commit/03c78db4332524c25393098980731c222a938647))

## [1.0.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.0.0-alpha.1...v1.0.0) (2026-07-22)

### Nano Kit 1.0 🎉

After a year of alphas and betas, Nano Kit is stable. It is a lightweight, modular state management ecosystem: a signals-based store, data fetching, routing, i18n, and SSR — separate packages, take only what you need. Works with React, Preact, and Svelte, with ready-made integrations for Next.js and SvelteKit.

#### Why Nano Kit

- **Fast.** Reactivity is powered by [Agera](https://github.com/TrigenSoftware/nano_kit/tree/main/packages/agera), our fork of [alien-signals](https://github.com/stackblitz/alien-signals) — one of the fastest reactivity algorithms around. In [benchmarks](https://nano-kit.js.org/getting-started/#performance) it runs within ~3% of alien-signals itself — ~3.4M subscription updates per second, roughly 1.4× faster than svelte/store and rxjs, 4.5× faster than nanostores, and an order of magnitude ahead of mobx, valtio, and jotai.
- **Small.** The whole store is ~5 kB min+brotli, a single signal — ~1.6 kB. A real React app with Nano Kit + DI bundles smaller than the same app with TanStack Query or Reatom, and our SSR stack ships 237 kB of frontend JS where TanStack Start ships 375 kB — see [bundle size comparisons](https://nano-kit.js.org/getting-started/#bundle-sizes).
- **Dependency injection out of the box.** Swap services for tests, SSR, or different platforms without context plumbing — it costs about 1 kB.
- **SSR without a meta-framework.** Streaming-friendly renderer, hydration, cookies and locale injection — a full SSR app fits in [one small hono server](https://github.com/TrigenSoftware/nano_kit/tree/main/examples/rick-and-morty/react-nano_kit-ssr).
- **TypeScript-first.** Strictly typed stores and typed route params, TypeScript 7 ready.

#### Where to start

- 📚 [Documentation](https://nano-kit.js.org) — guides for every package
- 🎓 [Tutorial](https://nano-kit.js.org/tutorial/) — build your first app step by step
- 🌤️ [Examples](https://nano-kit.js.org/examples/) — the same weather and Rick and Morty apps implemented across React, Preact, Svelte, Next.js, SvelteKit, and TanStack stacks, so you can compare like for like

#### Credits

Kida is inspired by [Nano Stores](https://github.com/nanostores/nanostores), Agera builds on [alien-signals](https://github.com/stackblitz/alien-signals) — thanks to both communities.

## [1.0.0-beta.2](https://github.com/TrigenSoftware/nano_kit/compare/query%401.0.0-beta.1...query%401.0.0-beta.2) (2026-07-12)

### Bug Fixes

* support TypeScript 7 ([#156](https://github.com/TrigenSoftware/nano_kit/issues/156)) ([6d9edce](https://github.com/TrigenSoftware/nano_kit/commit/6d9edce57bd709859deb9cf86d9a982ab7cf4a11))

## [1.0.0-beta.1](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-beta.0...query@1.0.0-beta.1) (2026-06-21)

### Bug Fixes

* fix entities registration and references ([3bc382e](https://github.com/TrigenSoftware/nano_kit/commit/3bc382e2edd35b2a10b3ff70a38a1ec07806ae42))

## [1.0.0-beta.0](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.12...query@1.0.0-beta.0) (2026-06-19)

### Features

* add `map` util ([06f9155](https://github.com/TrigenSoftware/nano_kit/commit/06f91554974d417e93f71961c3a6eec580626398))

## [1.0.0-alpha.12](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.11...query@1.0.0-alpha.12) (2026-06-19)

### Features

* cache facade now can revert changes and passes entry params into reducers ([#153](https://github.com/TrigenSoftware/nano_kit/issues/153)) ([a1c9af1](https://github.com/TrigenSoftware/nano_kit/commit/a1c9af1226897aeddb918a0edbce563980917a59))
* cache mutation utils ([#149](https://github.com/TrigenSoftware/nano_kit/issues/149)) ([862a32a](https://github.com/TrigenSoftware/nano_kit/commit/862a32a16d32340d4b50b87ee3ce5123519e4c24))
* entities api rework ([#151](https://github.com/TrigenSoftware/nano_kit/issues/151)) ([467a3cf](https://github.com/TrigenSoftware/nano_kit/commit/467a3cf8921f00f813281ddc9b0f6fe0a4c3b4d7))
* save request params into entries ([#152](https://github.com/TrigenSoftware/nano_kit/issues/152)) ([9a7328d](https://github.com/TrigenSoftware/nano_kit/commit/9a7328dd0f0a7bb9d0b20322ba5168be9d313055))

## [1.0.0-alpha.11](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.10...query@1.0.0-alpha.11) (2026-06-17)

### Features

* replace all keys revalidation with `keys` util to iterate over all registered keys ([#146](https://github.com/TrigenSoftware/nano_kit/issues/146)) ([6fe39c9](https://github.com/TrigenSoftware/nano_kit/commit/6fe39c9408c5c505f0aac3dc2cd8ef6674d13d5b))

## [1.0.0-alpha.10](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.9...query@1.0.0-alpha.10) (2026-06-16)

### Features

* allow invalidate all ([#144](https://github.com/TrigenSoftware/nano_kit/issues/144)) ([00c8f59](https://github.com/TrigenSoftware/nano_kit/commit/00c8f59aa168a60ca5be24263f4bf02d1b353c74))

## [1.0.0-alpha.9](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.8...query@1.0.0-alpha.9) (2026-06-09)

### Bug Fixes

* use oxlint ([#135](https://github.com/TrigenSoftware/nano_kit/issues/135)) ([e16f28a](https://github.com/TrigenSoftware/nano_kit/commit/e16f28a22549f911a8c133e83d46a945b05aac85))

## [1.0.0-alpha.8](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.7...query@1.0.0-alpha.8) (2026-06-03)

### Features

* support of injectable classes was added ([#133](https://github.com/TrigenSoftware/nano_kit/issues/133)) ([c7021a5](https://github.com/TrigenSoftware/nano_kit/commit/c7021a5360b78cd0cc97e2232ef7f833ec07a9ae))

## [1.0.0-alpha.7](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.6...query@1.0.0-alpha.7) (2026-05-28)

### Features

* accept value accessors in query params ([80c36f3](https://github.com/TrigenSoftware/nano_kit/commit/80c36f30483f3271368e729a286ae5bd3e1f8560))

## [1.0.0-alpha.6](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.5...query@1.0.0-alpha.6) (2026-05-09)

### Bug Fixes

* fix generated sourcemaps ([cd3457f](https://github.com/TrigenSoftware/nano_kit/commit/cd3457f3c5550266f8b233d35f672febf8dbaa7b))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.4...query@1.0.0-alpha.5) (2026-04-27)

### Features

* `hydratable` and `persistence` now supports codecs via `codec` setting ([b2711cb](https://github.com/TrigenSoftware/nano_kit/commit/b2711cbc25f861dcb512a84e4e39a8c5876c2297))
* drop `revalidateOnFoucs`, `revalidateOnInterval` and `revalidateOnReconnect` in favor of universal `revalidateOn` extension ([5b7bd8f](https://github.com/TrigenSoftware/nano_kit/commit/5b7bd8f70c46218768c65b6f240d599b3ee48f52))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.3...query@1.0.0-alpha.4) (2026-04-19)

### Bug Fixes

* fix entities extension by fixing data mapping in client ([b6aa567](https://github.com/TrigenSoftware/nano_kit/commit/b6aa5676a83f8a727a8da9ecd6ef2d774177d47b))

## [1.0.0-alpha.3](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.2...query@1.0.0-alpha.3) (2026-04-18)

### Bug Fixes

* improve infinite refetching and query helper types ([aeae0fa](https://github.com/TrigenSoftware/nano_kit/commit/aeae0fa7f31fe866c47254c31b8ed50c175b9b54))

## [1.0.0-alpha.2](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.1...query@1.0.0-alpha.2) (2026-04-12)

### Features

* `hydratable` extension, `persistence` extension and `indexedDbStorage` persistent adapter ([5bd7219](https://github.com/TrigenSoftware/nano_kit/commit/5bd721948202c8eb95eff33a9de545490a07a7e8))
* use hydrator interface instead of raw dehydrated data ([34a431f](https://github.com/TrigenSoftware/nano_kit/commit/34a431fbb19a4686550770026cabacaea9be6610))
* use new hydrator, serialize cache entry before dehydration ([e4758e3](https://github.com/TrigenSoftware/nano_kit/commit/e4758e388245cc65a59a70bfd30c1703571951fe))

### Bug Fixes

* do not persist error results ([1d07db4](https://github.com/TrigenSoftware/nano_kit/commit/1d07db40b37b49ffdc31e01c06656c01d027bf5d))

## [1.0.0-alpha.1](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.0...query@1.0.0-alpha.1) (2026-02-16)

### Bug Fixes

* migrate to nano-kit.js.org domain ([8106368](https://github.com/TrigenSoftware/nano_kit/commit/81063687c88bb8622602946428659954b38fc3b1))

## 1.0.0-alpha.0 (2026-02-15)

### Features

* introduce remote data manager for kida ([8b2b18a](https://github.com/TrigenSoftware/nano_kit/commit/8b2b18a6484c652e6136e40a02d947ac2d898fb8))

### Bug Fixes

* mark query's $data with mountable type ([f9f8865](https://github.com/TrigenSoftware/nano_kit/commit/f9f8865c7b863462bcc0f73f00e072957bda80e0))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))
