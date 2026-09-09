---
name: nano-kit-react
description: How to use @nano_kit/react, the React bindings for Nano Kit stores. Covers reading signals in components with useSignal, dependency injection through InjectionContextProvider and useInject, client hydration providers, React Server Components dehydration for the Next.js App Router, flight detection and testing components with mocked stores. Apply when building or reviewing React components that consume @nano_kit/store stores. For the reactive core (signals, effects, mountable stores, DI, tasks, hydration) see the nano-kit-store skill.
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
    - react
    - signals
    - state-management
    - dependency-injection
    - ssr
  docs:
    paths:
      - store-integrations/react.mdx
    tabs:
      - React
      - React SSR
---

# @nano_kit/react

`@nano_kit/react` binds `@nano_kit/store` to React: hooks that read signals, dependency injection through context, and hydration providers for SSR and React Server Components. Signals, stores, DI and hydration themselves are described in the `nano-kit-store` skill.

## Reference

`DOCS.md` next to this file is the documentation of the released package as published on https://nano-kit.js.org, generated from the site sources. Read it for the hooks, providers and server components before writing code. This skill adds only conventions, choices and pitfalls.

## Components

- `useSignal($accessor)` subscribes the component; writing is a plain call of the signal, no hook needed.
- Pass stable accessors. A computed or arrow function created during render is a new subscription on every render: create derived accessors in the store, or `useMemo` them when they really depend on props.
- Keep logic out of components: they read signals and call actions. Validation, derived values, loading and error states come from the store, usually through `@nano_kit/query`.
- Per-row state (selected, expanded) comes from a `selector` in the store; give each row a memoized accessor for its key.
- Navigation and links come from `@nano_kit/react-router` hooks, not from `window.location`.

## Dependency injection

- Wrap the app in `InjectionContextProvider` with the providers that differ per environment (theme, API base, mocks) and read stores with `useInject`. Components inject stores, not raw services.
- `injectHook` and `signalHook` build reusable hooks for tokens that are read in many places.
- A nested provider with providers creates a child context that falls back to the parent; `Isolate` cuts a subtree off from the context (previews, embedded widgets).

## Hydration

- Both providers create the injection context; pass the tokens that must be provided (navigation, cookie store, mocks) through their `context` prop instead of adding another provider below.
- React Server Components: wrap pages in `Dehydration` (or `StaticDehydration` with `FlightDetector` in the root layout to skip client-side navigations); call `dehydrate(Stores$)` directly when request logic such as a redirect must run after the stores loaded.

## Testing

- Render inside `InjectionContextProvider` with mocked tokens; no module mocking when transport, navigation and cookies are injectable.
- Test store logic with plain store tests (see `nano-kit-store`); component tests only check rendering.

## Pitfalls

- `useSignal` with an inline arrow function re-subscribes on every render.
- Writing a signal during render causes extra renders or loops; write in event handlers, effects in stores or actions.
- `useInject` outside `InjectionContextProvider`, `HydrationProvider` or `StaticHydrationProvider` throws; in tests always wrap the tree.
- The server components and `dehydrate` are server-only; do not import them from client components.
- Stores that read browser globals during creation or in `onMount` break on the server, because dehydration mounts the stores it awaits. Guard browser access, use `@nano_kit/platform-web` signals, or keep view-only wiring in `useEffect`.
