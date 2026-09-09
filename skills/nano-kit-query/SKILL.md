---
name: nano-kit-query
description: How to fetch, cache and mutate remote data with @nano_kit/query, the data layer built on @nano_kit/store signals. Covers the client and its settings, typed cache keys, reactive queries, mutations, operations and infinite queries, request context hooks, cache reads and optimistic updates, revalidate versus invalidate, entities, retries, cancellation, revalidation triggers, persistence, SSR dehydration and testing. Apply when loading server data, submitting changes or managing cached state in a Nano Kit app. For signals, stores, DI and hydration internals see the nano-kit-store skill.
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
    - query
    - data-fetching
    - cache
    - signals
    - ssr
  docs:
    paths:
      - query
---

# @nano_kit/query

`@nano_kit/query` is the data layer on top of `@nano_kit/store`: cached, deduplicated queries bound to reactive parameters, mutations, operations, infinite queries and SSR hydration of the cache. Signals, effects, stores and DI are described in the `nano-kit-store` skill.

## Reference

`DOCS.md` next to this file is the documentation of the released package as published on https://nano-kit.js.org, generated from the site sources. Read its relevant sections for exact signatures, settings and examples before writing code. This skill adds only conventions, choices and pitfalls.

## Which primitive for which job

- `query`: data that depends on reactive parameters and should load whenever something shows it. It fetches only while its data signal is observed, refetches on parameter changes, revalidation and invalidation, and never at creation time.
- `mutation`: a write on demand with the last result, error and loading state.
- `operation`: manual work whose result deserves the cache (AI generation, reports, explicit search submits, lazy loading that must not start on mount).
- `infinite`: pages behind a cursor; a parameter change restarts from the first page.
- Create the client once per app as an injectable `Client$()` factory with the extensions the app needs (`mutations()`, `infinites()`, `operations()`) and, when the app renders on the server, the SSR settings from the SSR section of `DOCS.md`.

## Keys and parameters

- A key builder names a cache shard and types its parameters and data. Shard names must be unique across the app; two builders with one name share a cache.
- Parameters must be JSON-serializable. Give the parameter tuple exactly the builder's parameter types, plain values included.
- Exclude paging or presentation parameters from the key when every page of one request should share an entry.
- Derive parameters from route and search state through the router's signals (skill `nano-kit-react-router`), not from `window.location`.

## Cache updates

- After a mutation, `revalidate` the affected keys: cached data stays visible while the refetch runs. `invalidate` blanks the entries and causes loading flashes; use it for session changes and hard resets.
- Optimistic update: write the cache first, register the revert with the error callback of the request context, then send the request.
- `keys(...)` sweeps every registered builder at once; on login, logout or locale change invalidate everything except keys that must survive, such as translations.

## Settings that matter

- `revalidateOn` with the visibility, network and interval signals keeps data fresh; `retryOnError` and `abortable` handle flaky and superseded requests.

## SSR

- Configure the client for server rendering exactly as the SSR section of `DOCS.md` shows; that setup is what makes the renderer wait for the requests and dehydrate the cache, and what restores it in the browser.
- Return the query data signals from page-level `Stores$` factories (see the `nano-kit-react-ssr` skill).

## Testing

- `start` the data signal like a component would and wait for the request with the helpers from the Testing section of `DOCS.md`; for mutations await the mutate promise.
- Each `client()` has its own cache, so tests do not leak into each other. Mock the transport through a DI token, not `fetch`.

## Pitfalls

- A query without an observer never fetches. Return its data signal to the UI or `start` it; `await` on it does nothing.
- `mutate` resolves to `undefined` when the call was muted (a call still loading, or the mutation disabled). Destructure with a fallback or check the loading state first.
- Reading the cache with `$data(key)` inside an effect subscribes the effect to that entry; use an untracked read for one-off reads in actions.
- Entities normalize only what the mapper captures; nested records that are not captured stay plain copies.
