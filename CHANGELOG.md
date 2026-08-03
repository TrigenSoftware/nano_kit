# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.0.0...v1.1.0) (2026-08-03)

### ✨ Highlights

#### Self-closing tags in rich text (`@nano_kit/intl`)

`rich` (and `mapTags`) now understand self-closing tags like `<br/>` and `<br />` — handy for line breaks and other void elements in translations. Handlers for such tags are called with empty chunks. Unknown self-closing tags are still stripped as markup.

```tsx
const [$t] = messages('pages', {
  sticker: rich({
    br: () => '\n'
  })
})

// 'First line<br/>second line' → ['First line', '\n', 'second line']
```

#### Rich tag handlers receive an unique index (`@nano_kit/intl`)

Every tag handler now gets an unique index as the second argument — use it as a `key` for framework nodes:

```tsx
const [$t] = messages('pages', {
  sticker: rich({
    title: (chunks, i) => <strong key={i}>{chunks}</strong>,
    br: (_, i) => <br key={i} />
  })
})
```

No more `key` warnings and `Children.toArray(t.sticker)` workarounds in React.

Bonus: `mapTags` is now reentrant — nested calls from tag handlers no longer clobber the outer call's parsing state.

### Features

* **intl:** pass unique index to rich tag handlers to use as framework key ([#187](https://github.com/TrigenSoftware/nano_kit/issues/187)) ([5b4008b](https://github.com/TrigenSoftware/nano_kit/commit/5b4008b2bba8196a66aa5e30e49bde84783cc2a6))
* **intl:** support self-closing tags in rich-text formatter ([#185](https://github.com/TrigenSoftware/nano_kit/issues/185)) ([fa4fcb8](https://github.com/TrigenSoftware/nano_kit/commit/fa4fcb8e64b5afafd1f407328f72f7bf32c3d384))

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
