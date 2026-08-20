# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.1.0...v1.2.0) (2026-08-20)

### Features

* **agera,kida,nanoviews:** bottom-up deferred effect scopes ([#189](https://github.com/TrigenSoftware/nano_kit/issues/189)) ([dd3169f](https://github.com/TrigenSoftware/nano_kit/commit/dd3169fbddcffbb3d8000f1f6127e40c37ec2386))
* **agera:** add `selector` to wake only the keys whose answer changed ([#200](https://github.com/TrigenSoftware/nano_kit/issues/200)) ([ac6b35f](https://github.com/TrigenSoftware/nano_kit/commit/ac6b35f8a18c1e6eb04541d7b8838fe3b712a12f))
* **agera:** derive mounted state from the graph instead of counting subscribers ([#191](https://github.com/TrigenSoftware/nano_kit/issues/191)) ([9c43fce](https://github.com/TrigenSoftware/nano_kit/commit/9c43fcedac7b7a46ac3ce3106bb89ea00f2233f9))
* **agera:** keep the source cold when observing through a derivation ([#199](https://github.com/TrigenSoftware/nano_kit/issues/199)) ([ecc0434](https://github.com/TrigenSoftware/nano_kit/commit/ecc043449ed9d1ee3f5f5b91e6acb8ca95b1c39f))
* **nanoviews:** add `as_` to hand a row through a transform ([#207](https://github.com/TrigenSoftware/nano_kit/issues/207)) ([2891ec4](https://github.com/TrigenSoftware/nano_kit/commit/2891ec4987cb2358c235739b430d6445b0325615))
* **nanoviews:** expose `swap_`, the block `if_` and `switch_` are built on ([#203](https://github.com/TrigenSoftware/nano_kit/issues/203)) ([9fc639f](https://github.com/TrigenSoftware/nano_kit/commit/9fc639f339b97e3518ce0f8e60e12a1628eb9900))
* **nanoviews:** let an effect attribute name the element it sits on ([#206](https://github.com/TrigenSoftware/nano_kit/issues/206)) ([215f157](https://github.com/TrigenSoftware/nano_kit/commit/215f157c4070484e0aa2ab00f09add9b0e73d0e4))
* **nanoviews:** rename effect attributes from `$$name` to `name$` ([#188](https://github.com/TrigenSoftware/nano_kit/issues/188)) ([468a293](https://github.com/TrigenSoftware/nano_kit/commit/468a293e6f39ff032618ecc302e21d0b755cbe21))

### Bug Fixes

* **agera,kida,nanoviews,query:** run user reducers and event handlers untracked ([#193](https://github.com/TrigenSoftware/nano_kit/issues/193)) ([03c78db](https://github.com/TrigenSoftware/nano_kit/commit/03c78db4332524c25393098980731c222a938647))
* **kida:** keep a child write in the caller's context ([#198](https://github.com/TrigenSoftware/nano_kit/issues/198)) ([0816533](https://github.com/TrigenSoftware/nano_kit/commit/0816533769ca523e64fcca760546b22716c89847))
* **nanoviews:** apply multi-word and custom style properties ([#195](https://github.com/TrigenSoftware/nano_kit/issues/195)) ([3270183](https://github.com/TrigenSoftware/nano_kit/commit/3270183ca2b2afe591c2ef5d8af3e8ce0a2ee873))
* **nanoviews:** fire every `on*` prop, not just the bubbling ones ([#204](https://github.com/TrigenSoftware/nano_kit/issues/204)) ([42e613b](https://github.com/TrigenSoftware/nano_kit/commit/42e613b08b72bbabe0c7766780980d452bd1546a))
* **nanoviews:** show the `for_` placeholder when there is no array at all ([#205](https://github.com/TrigenSoftware/nano_kit/issues/205)) ([6e6568b](https://github.com/TrigenSoftware/nano_kit/commit/6e6568bc0afc53838752284937f3b6d74d06e16c))

### Performance Improvements

* **agera,kida,store:** replace `morph` with the signal constructor protocol ([#197](https://github.com/TrigenSoftware/nano_kit/issues/197)) ([23b3370](https://github.com/TrigenSoftware/nano_kit/commit/23b337007b4898d5e0d2fc0e4e127a2df71d392e))
* **agera,nanoviews:** cut allocations and graph work on the binding paths ([#196](https://github.com/TrigenSoftware/nano_kit/issues/196)) ([3d1c93b](https://github.com/TrigenSoftware/nano_kit/commit/3d1c93b987f5ee8e161c42005b07b9ab11a2a63f))
* **nanoviews:** wake only the rows whose value changed ([#202](https://github.com/TrigenSoftware/nano_kit/issues/202)) ([c71cc9c](https://github.com/TrigenSoftware/nano_kit/commit/c71cc9cfb6e28c4620aa8706be21941ab835b9ce))

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
