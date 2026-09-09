---
name: nano-kit-intl
description: How to internationalize a Nano Kit app with @nano_kit/intl, the reactive, type-safe message layer built on @nano_kit/store. Covers translation data and namespaces, full-data and namespace loaders, the intl context and messages tuples, message schemes composed from formats (text, params, plural, match, number, datetime, relativetime, duration, list, range, rich, markup), typed and anonymous translation data, locale direction, deflat, SSR loading through @nano_kit/query with cookie and Accept-Language locale detection, and testing. Apply when adding translations, formatting locale-aware values or wiring locale selection in a Nano Kit app. For signals, stores and DI see the nano-kit-store skill.
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
    - intl
    - i18n
    - internationalization
    - signals
    - ssr
  docs:
    paths:
      - intl
---

# @nano_kit/intl

`@nano_kit/intl` turns translation objects into reactive, typed messages: a message is a plain string, an object of plural forms or cases, or a format applied to a translation value. Signals, stores and DI are described in the `nano-kit-store` skill.

## Reference

`DOCS.md` next to this file is the documentation of the released package as published on https://nano-kit.js.org, generated from the site sources. Read its relevant sections for the formats, their options and examples before writing code. This skill adds only conventions, choices and pitfalls.

## Structure

- Group translation data by namespace (a page, a layout, a feature) and bind each namespace with `messages(namespace, scheme)` in a small injectable factory next to the page that uses it. Components read `$t` through the framework hook.
- Choose the loader by bundle shape: a full-data loader (`resolved` or a query) for small translations shipped together, a namespace loader when translations should split by route or feature. With a namespace loader the context `$loading` is meaningless; use the `$pending` returned per namespace.
- A scheme entry is needed only where a key needs a format: parameters, plural forms, cases, Intl formatting. Keys without a format come back raw and typed from the translation data.
- `format(...)` messages format application values and take a value argument; `params(...)` messages fill placeholders in translated text and take an object of parameters. Do not mix them up.

## Locale

- Negotiate the initial locale from `Locales$` (`navigator` in the browser, the `Accept-Language` header on the server) and let a cookie-backed `$locale` override it, so the choice survives reloads and reaches the server.
- Load translations through `@nano_kit/query` when the app has SSR: they are cached, deduplicated and dehydrated like any other data, and keep their key out of session-wide invalidation sweeps.
- Feed `direction($locale)` to the router's `dir()` head descriptor and `$locale` to `lang()`.

## SSR

- Return `$t` from the page `Stores$` factory, so the server waits for the translations and renders in the resolved locale.
- The SSR renderers provide `Locales$` and the cookie store per request through their `inject` options (see the `nano-kit-react-ssr` skill).

## Testing

- Provide fixed data: `intl(signal('en'), resolved(en))` needs no DI. With DI, provide the cookie store and `Locales$` tokens in an `InjectionContext` and inject the intl store.
- Start mount-triggered loaders before waiting on messages; waiting does not mount them for you.

## Pitfalls

- A scheme key missing from the loaded data receives `undefined`; `text()` then yields `undefined` and `text('x')` the fallback.
- Read `$t` reactively (effects, hooks, `$t.$key`); a value cached in module scope misses locale and data changes.
- `Intl.DurationFormat` and `Intl.ListFormat` depend on the runtime; check Node and browser support before relying on `duration` and `list`.
