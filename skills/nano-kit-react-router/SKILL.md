---
name: nano-kit-react-router
description: How to route a React app with @nano_kit/react-router and the @nano_kit/router core it re-exports. Covers route tables, browser and virtual navigation, location and parameter signals, pages, layouts, code splitting, the DI tokens and hooks, typed Link components with preloading and aria-current, document head management, scroll utilities, page-level Stores$ and Head$ exports for SSR, and testing with virtual navigation. Apply when adding or changing routing, links or URL-derived state in a React app built on Nano Kit. For signals, stores and DI see the nano-kit-store skill.
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
    - router
    - routing
    - signals
    - ssr
  docs:
    paths:
      - router
      - router-integrations/react.mdx
    tabs:
      - React
      - React SSR
---

# @nano_kit/react-router

`@nano_kit/router` is a small signal-based router: the current location is a signal, routes are a typed table, pages and layouts are matched into a page signal, and links, head tags and scroll are utilities on top. `@nano_kit/react-router` re-exports it and adds the React pieces. Signals, stores and DI are described in the `nano-kit-store` skill, component bindings in `nano-kit-react`.

## Reference

`DOCS.md` next to this file is the documentation of the released packages as published on https://nano-kit.js.org, generated from the site sources. Read it for the route syntax, tokens, hooks, components and descriptors before writing code. This skill adds only conventions, choices and pitfalls.

## Setup contract

- Declare the route table once, `as const`, and augment `AppContext.routes` exactly once, so `Location$`, `Navigation$`, `Paths$` and `Link` are typed by it.
- Provide `LocationNavigation$` (from `browserNavigation(routes)`), `Page$` (from `router($location, pages)`) and `Pages$` together at the root; the derived tokens come for free.
- Render with the ready-made `App`, let layouts render children through `Outlet`, and call `useSyncHead()`, `useLinkComponentPreload()` and `useLinkComponentAriaCurrent()` once in the root layout.
- Page modules export the component as `default` and, when needed, `Stores$` (what SSR awaits and dehydrates), `Head$` (head descriptors) and `statusCode`.

## URL-derived state

- Derive signals from `Location$` in an injectable `Params$` factory with `param`, `searchParams` and `searchParam`, and let stores and queries read those instead of parsing the URL in components.
- Scope a parameter to its route with `forRoute` when several pages share a parameter name; otherwise a query keyed by that parameter, still observed on the page being left, receives the destination page's value during navigation.
- Update search parameters with `navigation.replace` while the user types into a filter, so Back leaves the page instead of replaying keystrokes.
- Use `navigation.transition` for confirmation dialogs and scroll bookkeeping around programmatic navigation.

## Pages and head

- Split by route with `loadable(() => import(...), Fallback)`; preload on hover with the link preload hooks.
- Scroll utilities touch `window`, and stores returned from `Stores$` are mounted on the server during dehydration: start scroll effects only in the browser.

## Testing

- Provide `virtualNavigation('/users/1', routes)` as `LocationNavigation$` (plus `Page$` and `Pages$` for component tests) and render `App`; store tests provide only `LocationNavigation$` and navigate through the returned `navigation`.

## Pitfalls

- Forgetting `as const` on the route table loses parameter typing for `params`, `paths` and `Link`.
- `App`, `usePage` and `useSyncHead` need `Page$`; `useLinkComponentPreload` needs `Pages$`.
- The `Link` built with `linkComponent` and the DI `Link` are different components; do not mix the hooks of one with the settings of the other.
- `useSyncHead` belongs in the outermost layout, once; calling it per page re-syncs the same descriptors repeatedly.
- Splat values are not encoded by the path builders; encode user input before building a splat path.
