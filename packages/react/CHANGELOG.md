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

## [1.0.0-alpha.12](https://github.com/TrigenSoftware/nano_kit/compare/react%401.0.0-alpha.11...react%401.0.0-alpha.12) (2026-07-12)

### Bug Fixes

* support TypeScript 7 ([#156](https://github.com/TrigenSoftware/nano_kit/issues/156)) ([6d9edce](https://github.com/TrigenSoftware/nano_kit/commit/6d9edce57bd709859deb9cf86d9a982ab7cf4a11))

## [1.0.0-alpha.11](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.10...react@1.0.0-alpha.11) (2026-06-09)

### Bug Fixes

* use oxlint ([#135](https://github.com/TrigenSoftware/nano_kit/issues/135)) ([e16f28a](https://github.com/TrigenSoftware/nano_kit/commit/e16f28a22549f911a8c133e83d46a945b05aac85))

## [1.0.0-alpha.10](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.9...react@1.0.0-alpha.10) (2026-06-03)

### Features

* support of injectable classes was added ([#133](https://github.com/TrigenSoftware/nano_kit/issues/133)) ([c7021a5](https://github.com/TrigenSoftware/nano_kit/commit/c7021a5360b78cd0cc97e2232ef7f833ec07a9ae))

## [1.0.0-alpha.9](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.8...react@1.0.0-alpha.9) (2026-05-14)

### Features

* simplify dehydration server API ([d833400](https://github.com/TrigenSoftware/nano_kit/commit/d8334003ad4ec217cdac42216f867b97562b36e6))

### Bug Fixes

* allow dehydration context providers to override values ([af5c0ae](https://github.com/TrigenSoftware/nano_kit/commit/af5c0ae19cb0fac791ebec3ee1e4050621197234))

## [1.0.0-alpha.8](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.7...react@1.0.0-alpha.8) (2026-05-09)

### Bug Fixes

* fix generated sourcemaps ([cd3457f](https://github.com/TrigenSoftware/nano_kit/commit/cd3457f3c5550266f8b233d35f672febf8dbaa7b))

## [1.0.0-alpha.7](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.6...react@1.0.0-alpha.7) (2026-04-29)

### Bug Fixes

* remove useless "context" prop in `Dehydration` ([32ffefd](https://github.com/TrigenSoftware/nano_kit/commit/32ffefd7697c102577117d71ffbcf92137734c9d))

## [1.0.0-alpha.6](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.5...react@1.0.0-alpha.6) (2026-04-12)

### Features

* add `isolate` prop to Dehydration and `reuse` option to HydrationProvider ([69abcb8](https://github.com/TrigenSoftware/nano_kit/commit/69abcb81d631d570b93e6b541c376764628e2bde))
* fix argument type for `useSignal`, `useInjectionContext` hook ([2a5b1d7](https://github.com/TrigenSoftware/nano_kit/commit/2a5b1d7de04be53113b83f5a6170e76b289cd04a))
* rename `hook` to `injectHook`, new `signalHook` helper, refactor dehydration and hydration components ([20118f4](https://github.com/TrigenSoftware/nano_kit/commit/20118f4eb8e4c8bf2dd5d8565028a19114842185))
* rsc tools for stores dehydration and hydration ([427c4e6](https://github.com/TrigenSoftware/nano_kit/commit/427c4e6883d97b235af9336b7cb2fd51a1b95a68))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.4...react@1.0.0-alpha.5) (2026-02-16)

### Bug Fixes

* migrate to nano-kit.js.org domain ([8106368](https://github.com/TrigenSoftware/nano_kit/commit/81063687c88bb8622602946428659954b38fc3b1))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.3...react@1.0.0-alpha.4) (2026-02-15)

### Features

* rename to @nano_kit/react ([e360b42](https://github.com/TrigenSoftware/nano_kit/commit/e360b42ccbf1be6067a93278fef3080869753607))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))

## [1.0.0-alpha.3](https://github.com/TrigenSoftware/nano_kit/compare/react@1.0.0-alpha.3...react@1.0.0-alpha.3) (2026-02-15)

### Features

* rename to @nano_kit/react ([e360b42](https://github.com/TrigenSoftware/nano_kit/commit/e360b42ccbf1be6067a93278fef3080869753607))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))

## 1.0.0-alpha.3 (2025-11-15)

### Features

* `hook` util to create hook from DI factory ([0f1f0aa](https://github.com/TrigenSoftware/nano_kit/commit/0f1f0aabfae0b7058b3309238d951240dd0b5899))
* kida integration for react ([#45](https://github.com/TrigenSoftware/nano_kit/issues/45)) ([b4f4da0](https://github.com/TrigenSoftware/nano_kit/commit/b4f4da038c935670e9fb619593799fb2c871bdc4))
* rename InjectionContext to InjectionContextProvider, remove useAction ([e15730e](https://github.com/TrigenSoftware/nano_kit/commit/e15730e262099282bc176994b36a244af38fb2f1))
