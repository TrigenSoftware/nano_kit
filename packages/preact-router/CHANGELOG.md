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

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/preact-router%401.0.0-alpha.4...preact-router%401.0.0-alpha.5) (2026-07-12)

### Bug Fixes

* support TypeScript 7 ([#156](https://github.com/TrigenSoftware/nano_kit/issues/156)) ([6d9edce](https://github.com/TrigenSoftware/nano_kit/commit/6d9edce57bd709859deb9cf86d9a982ab7cf4a11))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/preact-router@1.0.0-alpha.3...preact-router@1.0.0-alpha.4) (2026-06-15)

### Bug Fixes

* fix link component types ([#142](https://github.com/TrigenSoftware/nano_kit/issues/142)) ([1e129c5](https://github.com/TrigenSoftware/nano_kit/commit/1e129c5418eae690bf89ef62d379ea53f1a4cb02))

## [1.0.0-alpha.3](https://github.com/TrigenSoftware/nano_kit/compare/preact-router@1.0.0-alpha.2...preact-router@1.0.0-alpha.3) (2026-06-09)

### Bug Fixes

* use oxlint ([#135](https://github.com/TrigenSoftware/nano_kit/issues/135)) ([e16f28a](https://github.com/TrigenSoftware/nano_kit/commit/e16f28a22549f911a8c133e83d46a945b05aac85))

## [1.0.0-alpha.2](https://github.com/TrigenSoftware/nano_kit/compare/preact-router@1.0.0-alpha.1...preact-router@1.0.0-alpha.2) (2026-05-09)

### Bug Fixes

* fix generated sourcemaps ([cd3457f](https://github.com/TrigenSoftware/nano_kit/commit/cd3457f3c5550266f8b233d35f672febf8dbaa7b))

## [1.0.0-alpha.1](https://github.com/TrigenSoftware/nano_kit/compare/preact-router@1.0.0-alpha.0...preact-router@1.0.0-alpha.1) (2026-05-08)

### Features

* override router functions types for better inference, remove `asModule` helper ([752f797](https://github.com/TrigenSoftware/nano_kit/commit/752f79734fe04ddb6d4e4ff34429fa00d17d4313))

## 1.0.0-alpha.0 (2026-04-27)

### Features

* introduce Preact integration for Nano Kit Router ([c70df79](https://github.com/TrigenSoftware/nano_kit/commit/c70df79b92d10c72a0247e628595955de54cf07e))
