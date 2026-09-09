---
name: nano-kit-react-ssr
description: How to server-render a React + Nano Kit app with @nano_kit/react-ssr on Vite. Covers the app index file with routes and pages, the Vite plugin and its options, the renderer and production HTTP server, page-level Stores$ and Head$ exports, request-bound cookies, locale and user agent, redirects and status codes, query cache dehydration, custom renderer and client entries, and what the client build strips. Apply when adding SSR to a React app that uses @nano_kit/react-router, or when changing an existing @nano_kit/react-ssr setup. For signals, DI and hydratable see nano-kit-store; for routing see nano-kit-react-router.
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
    - ssr
    - vite
    - server-rendering
    - hydration
  docs:
    paths:
      - ssr-integrations/react.mdx
      - ssr/cookies.mdx
      - ssr/locale.mdx
    tabs:
      - React
      - React SSR
---

# @nano_kit/react-ssr

`@nano_kit/react-ssr` renders a React app built on `@nano_kit/react-router` on the server with Vite: a plugin that builds client, renderer and server entries, a renderer that awaits page stores, collects head tags and cookies, and a client entry that hydrates. Routing is described in the `nano-kit-react-router` skill, stores and hydration in `nano-kit-store`.

## Reference

`DOCS.md` next to this file is the documentation of the released packages as published on https://nano-kit.js.org, generated from the site sources. Read it for the plugin options, the renderer API, the client entry and the request-bound tokens before writing code. This skill adds only conventions, choices and pitfalls.

## App shape

- One index file exports `routes` and `pages`; the plugin, the renderer and the client entry all read it.
- Every store is an injectable factory, never a module-level signal: one process serves many requests and each request gets its own `InjectionContext`.
- Page and layout modules export `Stores$` (the accessors the server must await and dehydrate) and `Head$` next to the default component; layout and page factories are merged.
- Select services that differ between browser and server with `import.meta.env.SSR`, and keep server-only code behind it.

## Request flow

- The renderer creates a virtual navigation for the URL, builds the request context (router tokens plus the platform tokens enabled with the plugin's `inject` options), runs `Stores$` through dehydration, reads `Head$`, and only then renders. The result carries the HTML, the status code, a redirect target and the collected `Set-Cookie` headers.
- Forward the request headers the plugin expects (`cookie`, `accept-language`, `user-agent`) into `renderer.render`, append every returned `Set-Cookie` value, and honour `redirect` and `statusCode`.
- `vite dev` serves SSR in-process; the production `server` entry is only used by the built bundle.

## Data and request state

- Configure the query client for server rendering as the SSR section of the `nano-kit-query` skill's `DOCS.md` shows and return the query data signals from `Stores$`, so the renderer waits for them and the browser restores the cache.
- Read cookies, locale and user agent through the `@nano_kit/platform-web` tokens; enable the matching `inject` options so the server provides them per request. Cookie writes made while the stores run become `Set-Cookie` headers of the response.
- A store that navigates during server rendering (an auth guard in `Stores$`) turns into an HTTP redirect; a URL that matches no route renders the `notFound` page with status 404 unless the module exports `statusCode`.

## Client entry and renderer

- The default client entry hydrates `App` from the dehydrated snapshot; write your own only to add providers or wrap the tree, and set providers before hydrating.
- Extend the renderer class only to change the HTML document; keep everything it escapes escaped when you build markup by hand.

## Avoiding hydration mismatches

- Do not read `window`, `document`, storage or the current time while creating stores, in `onMount` hooks of stores returned from `Stores$`, or during rendering; use `@nano_kit/platform-web` signals or React `useEffect` for browser-only wiring.
- Resolve locale and session from the request so the server renders the same text the client will.
- Skip a fetch that already ran on the server with the hydration guard pattern from the `nano-kit-store` skill, or rely on the query cache.

## Testing

- Test store logic with an `InjectionContext` holding `virtualNavigation` and mocked services; for the server side call the store dehydration directly and assert on the snapshot, keeping dehydration enabled.

## Pitfalls

- `Stores$` must cover the data the page needs for its first paint; a missing accessor renders empty on the server and refetches on the client.
- Async work the server cannot see (a bare promise in `onMount`) is not awaited: use `resolved`, `@nano_kit/query` or the task helpers from the Working with Tasks section of the `nano-kit-store` skill's `DOCS.md`.
- `Set-Cookie` values are returned as an array; append each one instead of joining them.
