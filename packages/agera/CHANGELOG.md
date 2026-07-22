# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

## [1.0.0-beta.7](https://github.com/TrigenSoftware/nano_kit/compare/agera%401.0.0-beta.6...agera%401.0.0-beta.7) (2026-07-22)

### Performance Improvements

* speed up effect runs by splitting warmup and rerun paths ([#178](https://github.com/TrigenSoftware/nano_kit/issues/178)) ([f550458](https://github.com/TrigenSoftware/nano_kit/commit/f5504584815c8fe2df16fef44001bccb32ed7574))

## [1.0.0-beta.6](https://github.com/TrigenSoftware/nano_kit/compare/agera%401.0.0-beta.5...agera%401.0.0-beta.6) (2026-07-12)

### Bug Fixes

* prevent subs count desync when mountable signal is read by non-subscriber node ([#159](https://github.com/TrigenSoftware/nano_kit/issues/159)) ([1410c97](https://github.com/TrigenSoftware/nano_kit/commit/1410c9759567e67acb39c9cbb4313f82a7f7dce6))
* support TypeScript 7 ([#156](https://github.com/TrigenSoftware/nano_kit/issues/156)) ([6d9edce](https://github.com/TrigenSoftware/nano_kit/commit/6d9edce57bd709859deb9cf86d9a982ab7cf4a11))
* sync with alien-signals v3.2.1 ([#160](https://github.com/TrigenSoftware/nano_kit/issues/160)) ([d943a8d](https://github.com/TrigenSoftware/nano_kit/commit/d943a8dee548d03baaeaf1a0b5a68a79d2c7dc82))

## [1.0.0-beta.5](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-beta.4...agera@1.0.0-beta.5) (2026-06-09)

### Bug Fixes

* use oxlint ([#135](https://github.com/TrigenSoftware/nano_kit/issues/135)) ([e16f28a](https://github.com/TrigenSoftware/nano_kit/commit/e16f28a22549f911a8c133e83d46a945b05aac85))

## [1.0.0-beta.4](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-beta.3...agera@1.0.0-beta.4) (2026-05-09)

### Bug Fixes

* fix generated sourcemaps ([cd3457f](https://github.com/TrigenSoftware/nano_kit/commit/cd3457f3c5550266f8b233d35f672febf8dbaa7b))

## [1.0.0-beta.3](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-beta.2...agera@1.0.0-beta.3) (2026-05-08)

### Bug Fixes

* fix subscribers notification when computed updates another signal ([5cdf1be](https://github.com/TrigenSoftware/nano_kit/commit/5cdf1be2178306a62e9670de3c204f9518d457bf))

## [1.0.0-beta.2](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-beta.1...agera@1.0.0-beta.2) (2026-04-30)

### Features

* `onSignal` method to intercept each new signal instance ([6b59d15](https://github.com/TrigenSoftware/nano_kit/commit/6b59d159683e46665b326aa59cec0055102f2ae0))

### Bug Fixes

* improve tree-shaking ([6dfcaa8](https://github.com/TrigenSoftware/nano_kit/commit/6dfcaa83c7d35ad3b44139620d5a93d885cfc3e8))

## [1.0.0-beta.1](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-beta.0...agera@1.0.0-beta.1) (2026-04-27)

### Features

* add `nextValue` and `signalNextValue` helpers ([4519b57](https://github.com/TrigenSoftware/nano_kit/commit/4519b57866cbd449c78e8c00db391487e12295f2))

### Bug Fixes

* use `noop` and `identity` ([bfcc93f](https://github.com/TrigenSoftware/nano_kit/commit/bfcc93f4a366fcc2492a7ecae2594efc352ae213))

## [1.0.0-beta.0](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-alpha.5...agera@1.0.0-beta.0) (2026-04-12)

### Features

* export ExternalModesBase to create modes in external packages ([c8d0569](https://github.com/TrigenSoftware/nano_kit/commit/c8d0569a8b041b0ace3413a53fc935bd3c621eeb))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-alpha.4...agera@1.0.0-alpha.5) (2026-02-15)

### Features

* new batch api, observer methods ([41d98ad](https://github.com/TrigenSoftware/nano_kit/commit/41d98adac431df8c8267cc894631d7bb8a31002b))
* rollback trigger util signature ([fbc4008](https://github.com/TrigenSoftware/nano_kit/commit/fbc4008b5245b1df63efac1a87a025815c3f4540))
* sync with alien-signals v3 ([e66fdf4](https://github.com/TrigenSoftware/nano_kit/commit/e66fdf435f361e0b915870448fa542988ac0ead6))

### Bug Fixes

* fix signal mount escaping ([9496e4f](https://github.com/TrigenSoftware/nano_kit/commit/9496e4f7878d8f5ed54f24834c88a032bc267540))
* noMount usage fix ([ffb688c](https://github.com/TrigenSoftware/nano_kit/commit/ffb688c93a9a353db69bb1321fba29b430cd0c38))
* onMounted no defer listener ([46bc8fa](https://github.com/TrigenSoftware/nano_kit/commit/46bc8fa3e97eff5b3e9df3539581bbcaba3a8539))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-alpha.3...agera@1.0.0-alpha.4) (2025-11-17)

### Bug Fixes

* use esbuild for minification ([2e48553](https://github.com/TrigenSoftware/nano_kit/commit/2e48553b567e56cc88f68c4a14936b715b1c0577))

## 1.0.0-alpha.3 (2025-11-15)

### Features

* accessor type is added ([99b0892](https://github.com/TrigenSoftware/nano_kit/commit/99b08921f29f8091c59743bde9ba3063b34ec2e7))
* batch of mods and fixes ([#51](https://github.com/TrigenSoftware/nano_kit/issues/51)) ([9bf10e5](https://github.com/TrigenSoftware/nano_kit/commit/9bf10e522948ed1f097632f663880f5d1e8ad4ac))
* introduce new reactivity system ([#49](https://github.com/TrigenSoftware/nano_kit/issues/49)) ([168c177](https://github.com/TrigenSoftware/nano_kit/commit/168c1771d8996ace6a2cecf04f37d828470a355c))
* mark certain functions as no side effects ([a4a4a1c](https://github.com/TrigenSoftware/nano_kit/commit/a4a4a1c66316f3e1a4cd5cd3f519f72e9eb556b3))
* signal activation rework, signal writable guard ([40d2cc3](https://github.com/TrigenSoftware/nano_kit/commit/40d2cc399d3ee49b42e027c65ec579726651b1a3))
* writable and mountable signal modes, onActivate -> onMounted, escape deadlock for mount effects, set new signal value by function ([840fab5](https://github.com/TrigenSoftware/nano_kit/commit/840fab5fd7c9f428109decabb3d73579ae13911a))

### Bug Fixes

* export NewValue type ([015c192](https://github.com/TrigenSoftware/nano_kit/commit/015c1928911333f3ffd89f5004049c1df50e8d5b))
* fix `readonly` return types ([c0c32fc](https://github.com/TrigenSoftware/nano_kit/commit/c0c32fc78aa7a8571b604b9e957abd1eb3572ccc))
