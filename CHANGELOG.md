# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.2.0...v2.0.0) (2026-09-04)

### ⚠ BREAKING CHANGES

* **kida:** `resolved` hands values through verbatim - a falsy source value is data, not a
  reset to `undefined`: emptiness is expressed by `T` itself (e.g. `T | null`), and the input type
  drops the falsy arm.
* **kida,store,query:** the tasks pool is gone — `TasksPool$`, `TasksRunner$`, `tasksRunner`, `addTask`,
  `waitCurrentTasks` and `taskPromise` are removed, `waitTasks` takes a signal instead of a pool, and
  the `tasks()` and `ssr()` query settings are removed: `hydratable()` is the whole SSR setting.

### Features

* **kida,store,query:** attach tasks to the signals they fill ([#222](https://github.com/TrigenSoftware/nano_kit/issues/222)) ([841acd1](https://github.com/TrigenSoftware/nano_kit/commit/841acd12fcb3c2bd6c494f9ff47dfe998c962457))
* **kida:** add `latest` for the value of the source that changed last ([#231](https://github.com/TrigenSoftware/nano_kit/issues/231)) ([84efaed](https://github.com/TrigenSoftware/nano_kit/commit/84efaed2453ab10542afad83958fdea2f709c899))
* **kida:** attach the `resolved` promise as a task and hand values through verbatim ([#223](https://github.com/TrigenSoftware/nano_kit/issues/223)) ([8fabbeb](https://github.com/TrigenSoftware/nano_kit/commit/8fabbeb80f6462ac32c90a8b1ac523c8086971e7))

### Bug Fixes

* **kida:** keep `onMount` subscribed when a signal remounts within the unmount delay ([#229](https://github.com/TrigenSoftware/nano_kit/issues/229)) ([b911d4c](https://github.com/TrigenSoftware/nano_kit/commit/b911d4ce7657e67e47427f4863e0ab4b90212949))

## [1.2.0](https://github.com/TrigenSoftware/nano_kit/compare/v1.1.0...v1.2.0) (2026-08-30)

### Features

* **agera,intl,kida,nanoviews,query,router,svelte-kit:** rename `ValueOrAccessor` to `Signalish` ([#210](https://github.com/TrigenSoftware/nano_kit/issues/210)) ([c42723a](https://github.com/TrigenSoftware/nano_kit/commit/c42723a56944cea0f3935b1456a45b607924f0a9))
* **agera,kida,nanoviews:** bottom-up deferred effect scopes ([#189](https://github.com/TrigenSoftware/nano_kit/issues/189)) ([dd3169f](https://github.com/TrigenSoftware/nano_kit/commit/dd3169fbddcffbb3d8000f1f6127e40c37ec2386))
* **agera,nanoviews:** add `show_` with pausable effect scopes ([#225](https://github.com/TrigenSoftware/nano_kit/issues/225)) ([4c2490d](https://github.com/TrigenSoftware/nano_kit/commit/4c2490d58a22f83337496b8e5bb8a896873abc93))
* **agera:** add `selector` to wake only the keys whose answer changed ([#200](https://github.com/TrigenSoftware/nano_kit/issues/200)) ([ac6b35f](https://github.com/TrigenSoftware/nano_kit/commit/ac6b35f8a18c1e6eb04541d7b8838fe3b712a12f))
* **agera:** derive mounted state from the graph instead of counting subscribers ([#191](https://github.com/TrigenSoftware/nano_kit/issues/191)) ([9c43fce](https://github.com/TrigenSoftware/nano_kit/commit/9c43fcedac7b7a46ac3ce3106bb89ea00f2233f9))
* **agera:** keep the source cold when observing through a derivation ([#199](https://github.com/TrigenSoftware/nano_kit/issues/199)) ([ecc0434](https://github.com/TrigenSoftware/nano_kit/commit/ecc043449ed9d1ee3f5f5b91e6acb8ca95b1c39f))
* **kida,store:** move tasks from `@nano_kit/store` to `kida` ([#220](https://github.com/TrigenSoftware/nano_kit/issues/220)) ([2e5c07c](https://github.com/TrigenSoftware/nano_kit/commit/2e5c07c9ed377856699f33b1ce1deb23d30beba5))
* **nanoviews:** add `as_` to hand a row through a transform ([#207](https://github.com/TrigenSoftware/nano_kit/issues/207)) ([2891ec4](https://github.com/TrigenSoftware/nano_kit/commit/2891ec4987cb2358c235739b430d6445b0325615))
* **nanoviews:** add `match_` for a cascade of conditions ([#219](https://github.com/TrigenSoftware/nano_kit/issues/219)) ([1065b20](https://github.com/TrigenSoftware/nano_kit/commit/1065b204d8e09b1b1cf82353ac7a34d6b1d33e1a))
* **nanoviews:** add `props$` to read any prop in accessor form ([#212](https://github.com/TrigenSoftware/nano_kit/issues/212)) ([3cd1d77](https://github.com/TrigenSoftware/nano_kit/commit/3cd1d7709fc721ae2ff87ccfda648e9d4313758c))
* **nanoviews:** expose `swap_`, the block `if_` and `switch_` are built on ([#203](https://github.com/TrigenSoftware/nano_kit/issues/203)) ([9fc639f](https://github.com/TrigenSoftware/nano_kit/commit/9fc639f339b97e3518ce0f8e60e12a1628eb9900))
* **nanoviews:** hand the tracking key to the row ([#217](https://github.com/TrigenSoftware/nano_kit/issues/217)) ([34948cd](https://github.com/TrigenSoftware/nano_kit/commit/34948cdc1b30a15a6400008b77522746f5fa0685))
* **nanoviews:** let an effect attribute name the element it sits on ([#206](https://github.com/TrigenSoftware/nano_kit/issues/206)) ([215f157](https://github.com/TrigenSoftware/nano_kit/commit/215f157c4070484e0aa2ab00f09add9b0e73d0e4))
* **nanoviews:** rename `$$children`, `$$slot` and `$$slots` to a trailing `$` ([#209](https://github.com/TrigenSoftware/nano_kit/issues/209)) ([47f794b](https://github.com/TrigenSoftware/nano_kit/commit/47f794b518b53090cd1645dfd1bb2eb981da9c43)), references [#188](https://github.com/TrigenSoftware/nano_kit/issues/188)
* **nanoviews:** rename effect attributes from `$$name` to `name$` ([#188](https://github.com/TrigenSoftware/nano_kit/issues/188)) ([468a293](https://github.com/TrigenSoftware/nano_kit/commit/468a293e6f39ff032618ecc302e21d0b755cbe21))
* **nanoviews:** rename the truthy and falsy narrowing types ([#211](https://github.com/TrigenSoftware/nano_kit/issues/211)) ([577c49d](https://github.com/TrigenSoftware/nano_kit/commit/577c49d059ff400ac3c8673d4bf414faa739739a))

### Bug Fixes

* **agera,kida,nanoviews,query:** run user reducers and event handlers untracked ([#193](https://github.com/TrigenSoftware/nano_kit/issues/193)) ([03c78db](https://github.com/TrigenSoftware/nano_kit/commit/03c78db4332524c25393098980731c222a938647))
* **kida:** keep a `resolved` factory unstarted until the first read ([#221](https://github.com/TrigenSoftware/nano_kit/issues/221)) ([bc13a53](https://github.com/TrigenSoftware/nano_kit/commit/bc13a53dc9652b27606a3a0acae5aa319a34d27a))
* **kida:** keep a child write in the caller's context ([#198](https://github.com/TrigenSoftware/nano_kit/issues/198)) ([0816533](https://github.com/TrigenSoftware/nano_kit/commit/0816533769ca523e64fcca760546b22716c89847))
* **kida:** type `toAccessor` by what it actually returns ([#208](https://github.com/TrigenSoftware/nano_kit/issues/208)) ([024e812](https://github.com/TrigenSoftware/nano_kit/commit/024e81231b894245199c1a8962eb709b36513b86))
* **nanoviews:** apply multi-word and custom style properties ([#195](https://github.com/TrigenSoftware/nano_kit/issues/195)) ([3270183](https://github.com/TrigenSoftware/nano_kit/commit/3270183ca2b2afe591c2ef5d8af3e8ce0a2ee873))
* **nanoviews:** fire every `on*` prop, not just the bubbling ones ([#204](https://github.com/TrigenSoftware/nano_kit/issues/204)) ([42e613b](https://github.com/TrigenSoftware/nano_kit/commit/42e613b08b72bbabe0c7766780980d452bd1546a))
* **nanoviews:** show the `for_` placeholder when there is no array at all ([#205](https://github.com/TrigenSoftware/nano_kit/issues/205)) ([6e6568b](https://github.com/TrigenSoftware/nano_kit/commit/6e6568bc0afc53838752284937f3b6d74d06e16c))

### Performance Improvements

* **agera,kida,store:** replace `morph` with the signal constructor protocol ([#197](https://github.com/TrigenSoftware/nano_kit/issues/197)) ([23b3370](https://github.com/TrigenSoftware/nano_kit/commit/23b337007b4898d5e0d2fc0e4e127a2df71d392e))
* **agera,nanoviews:** cut allocations and graph work on the binding paths ([#196](https://github.com/TrigenSoftware/nano_kit/issues/196)) ([3d1c93b](https://github.com/TrigenSoftware/nano_kit/commit/3d1c93b987f5ee8e161c42005b07b9ab11a2a63f))
* **benchmark-nanoviews:** take the row key and drop `record` ([#218](https://github.com/TrigenSoftware/nano_kit/issues/218)) ([66e9ee3](https://github.com/TrigenSoftware/nano_kit/commit/66e9ee32eac096ffc09d849414bbeb3f7e1abe02))
* **nanoviews:** clear a row range with `replaceChildren` ([#216](https://github.com/TrigenSoftware/nano_kit/issues/216)) ([5942baf](https://github.com/TrigenSoftware/nano_kit/commit/5942baf23c5f9d1b0ade019ea87c7e71cc62d2fe))
* **nanoviews:** create the effect attribute registry on first use ([#213](https://github.com/TrigenSoftware/nano_kit/issues/213)) ([4113217](https://github.com/TrigenSoftware/nano_kit/commit/4113217ab64965346616169fef84176a65a7105e))
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
