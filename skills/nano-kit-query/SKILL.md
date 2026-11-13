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
- `infinite`: pages behind a cursor; a parameter change restarts from the first page, while revalidation refetches every loaded page, so it is safe on a long list.
- `preserve`: search results or a filtered list that must stay on screen while the next key loads. Take what the shown data was found by from the parameters of its key, not from the input, which runs ahead. Give it a predicate when preserved data must not cross a scope, such as another account, or should give way to an error: by default it stays after a failed request.
- Create the client once per app as an injectable `Client$()` factory with the extensions the app needs (`mutations()`, `infinites()`, `operations()`, `keys()`) and `hydratable()` when the app renders on the server.

## Keys and parameters

- A key builder names a cache shard and types its parameters and data. Shard names must be unique across the app; two builders with one name share a cache.
- Parameters must be JSON-serializable. Give the parameter tuple exactly the builder's parameter types, plain values included.
- Wrap a parameter that can have no value yet, such as an id from the route, in `required()`: while it is `undefined` or `null` the query neither fetches nor creates a cache entry, and the key and the fetcher take it as a plain value. Pass the wrapper only into the parameters: without a value it gives an internal mark, not `undefined`; read the original signal elsewhere. Do not return `null` from the fetcher for a missing parameter.
- Exclude paging or presentation parameters from the key when every page of one request should share an entry.
- Derive parameters from route and search state through the router's signals (skill `nano-kit-react-router`), not from `window.location`.

## Cache updates

- After a mutation, `revalidate` the affected keys: cached data stays visible while the refetch runs. `invalidate` blanks the entries and causes loading flashes; use it for session changes and hard resets.
- After a create, write the new item under its own key with `$data`: the page that opens on it shows it at once while its own request confirms it.
- With entities, give the query of one item the entity id from its parameters, `entities(XEntity, ([id]) => id)`: until its own data comes, it shows the entity, so an item opened from a list shows at once. A create then needs no write to the key: write the entity, or give the create mutation `entities(XEntity)`, which writes it.
- Optimistic update: write the cache first, register the revert with the error callback of the request context, then send the request.
- A plain revert puts back the whole value and drops what was written since. When other writes can reach the entry while the request is in flight, such as a second press or a change to another field, give `$data` the function that undoes only this change.
- The function that undoes a `drop` is ready-made: `restore` for arrays, `restorePages` for infinite pages. They put items back at their previous index in the data as it is by now, and leave it alone when a refetch has already brought them back.
- `eachKeyBuilder(...)` sweeps every registered builder at once; on login, logout or locale change invalidate everything except keys that must survive, such as translations.
- A builder passed to `revalidate`, `invalidate` or `$data` reaches its whole shard. To reach only the entries with some parameters, add the `keys()` extension and pick them by `key.params` in `eachKey(Key, key => ...)`.

## Settings that matter

- `revalidateOn` with the visibility, network and interval signals keeps data fresh; `retryOnError` and `abortable` handle flaky and superseded requests.

## SSR

- `hydratable()` is the whole SSR setup of the client: it dehydrates the cache on the server and restores it in the browser. Waiting needs no setup, every query attaches its request to its data signal.
- Return the query data signals, or computeds over them, from page-level `Stores$` factories (see the `nano-kit-react-ssr` skill): the renderer waits only for what the returned signals depend on.

## Testing

- `start` the data signal like a component would and wait for the request with the helpers from the Testing section of `DOCS.md`; for mutations await the mutate promise.
- Each `client()` has its own cache, so tests do not leak into each other. Mock the transport through a DI token, not `fetch`.

## Pitfalls

- A query without an observer never fetches. Return its data signal to the UI or `start` it; `await` on it does nothing.
- `mutate` resolves to `undefined` when the call was muted (a call still loading, or the mutation disabled). Destructure with a fallback or check the loading state first.
- To run calls one after another, `await previous(ctx)` in the fetcher and give mutations and operations `dedupe(false)`: otherwise a call made while one is in flight is dropped before it can wait.
- Reading the cache with `$data(key)` inside an effect subscribes the effect to that entry; use an untracked read for one-off reads in actions.
- Entities normalize only what the mapper captures; nested records that are not captured stay plain copies.
- Update an entity by its own key: a query that maps its data to the entity shows the entity, so a write to the key of that query is not shown.
- When an item is deleted, invalidate its entity too: a query that takes the entity id from its parameters keeps showing it, even after its own request fails.
- `$loading` and `$error` of `infinite` cover a refetch of the loaded pages too. Drive the load-more control with `$nextLoading` and pick the retry by `$nextError`: `fetchNext` when it is set, `revalidate` otherwise.
