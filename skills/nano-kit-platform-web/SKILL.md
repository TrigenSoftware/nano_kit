---
name: nano-kit-platform-web
description: How to use @nano_kit/platform-web, the reactive browser API helpers for Nano Kit. Covers localStorage, sessionStorage, cookie and BroadcastChannel backed signals, media queries, window and document state signals (size, scroll, online, visibility, orientation, fullscreen, pixel ratio), permissions and geolocation, and the universal tokens CookieStore$, Locales$ and UserAgent$ with their server implementations (VirtualCookieStore, parseLocales, serializeCookies) for SSR and tests. Apply when a store needs browser state, persisted settings, cookies or locale detection that must also work during server rendering. For signals, stored signals, codecs and DI see the nano-kit-store skill.
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
    - platform-web
    - browser
    - cookies
    - storage
    - locale
    - ssr
  docs:
    paths:
      - platform
---

# @nano_kit/platform-web

`@nano_kit/platform-web` wraps browser APIs in `@nano_kit/store` signals: storage-backed settings, media queries, window and document state, permissions, geolocation, cookies, cross-tab messages, locale and user agent. Signals, stores and DI are described in the `nano-kit-store` skill.

## Reference

`DOCS.md` next to this file is the documentation of the released package as published on https://nano-kit.js.org, generated from the site sources. Read it for the helpers, their overloads and examples before writing code. This skill adds only conventions, choices and pitfalls.

## Which helper for which job

- User settings that must survive a reload: `localStored`; per-tab drafts: `sessionStored`. The `synced` variants follow changes made in other documents; use them when two tabs must agree.
- Responsive and environment decisions: `mediaQuery` and the window and document singletons, derived with `computed`, instead of ad-hoc `window` reads in components.
- Session and preferences shared with the server: `cookieStored` on the `CookieStore$` token, never `document.cookie`.
- Transient cross-tab events (logout, refresh): `broadcasted`, which carries structured clones, so plain objects need no codec.
- Locale negotiation: `browserLocale` on the `Locales$` token; `UserAgent$` for the user agent. Both resolve to `navigator` in the browser.
- Storage and cookie values are strings unless a codec is given; use `JsonCodec` or `BooleanCodec` for anything else, and the rate limiter overloads for chatty writers.

## Universal code

- Stores inject the tokens (`CookieStore$`, `Locales$`, `UserAgent$`) instead of reading globals, so the same store runs in the browser, on the server and in tests.
- On the server the SSR layers provide the tokens per request (the `inject` options of the Vite plugins, the SvelteKit adapter); provide `VirtualCookieStore` and `parseLocales(header)` yourself in custom setups and tests. Without a provider `CookieStore$` resolves to the missing global and the first read throws.
- Storage helpers, media queries and the singletons have server fallbacks (inert storage, the `fallback` argument, `NaN`, `true`, `false` or `undefined`), so reading them during SSR is safe; the values just are not the browser's.

## Testing

- Provide the tokens with `new VirtualCookieStore('cookie=header', '/')` and `parseLocales('ru,en;q=0.8')` in an `InjectionContext` and assert on the store's signals.
- Storage helpers use the global storage; clear it between tests and create fresh store instances, because created signals keep their values.

## Pitfalls

- `browserLocale` matches language tags exactly (`ru-RU` is not `ru`); list the tags you support or normalize before matching.
- Singleton signals are shared across the app; derive from them with `computed`, do not write to them.
- `syncedSessionStored` follows other documents that share the tab's session storage, not other tabs.
