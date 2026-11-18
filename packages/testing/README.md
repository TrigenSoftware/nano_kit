# @nano_kit/testing

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/testing.svg
[npm-url]: https://npmjs.com/package/@nano_kit/testing

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/testing
[deps-url]: https://libraries.io/npm/@nano_kit%2Ftesting

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

Testing tools for stories, tests and demos, starting with a virtual backend: typed collections in memory, a `fetch` that answers by [Hono](https://hono.dev) routes, and an independent copy of both for every story and test.

- **Typed collections**. Records are found by id, by fields or by a predicate, and `update` and `delete` change every match, as in SQL.
- **Read-only data**. Records and values are frozen, so every change goes through the collection and any state forks into an independent copy.
- **A real fetch**. It returns a promise even for an instant answer, honors `AbortSignal`, fills `response.url` and fails as a network does.
- **A fork per story**. Seed the backend once and fork it for every story and test, tuned by recipes that change the data and put routes in front.
- **Modular and typed**. Every service keeps its schema, seed and routes in a module of its own, and a module missing from the list is a compile error.

## Installation

```bash
pnpm add -D @nano_kit/testing hono
# or
npm install -D @nano_kit/testing hono
# or
yarn add -D @nano_kit/testing hono
```

`hono` is needed by `@nano_kit/testing/fetch` and `@nano_kit/testing/backend`. The database alone works without it.

## Quick Start

A module of the mock keeps a collection, its seed and its routes:

```ts
// plant.mock.ts
import { type VirtualDatabase, collection } from '@nano_kit/testing'
import { type App, found } from '@nano_kit/testing/fetch'

interface Plant {
  id: string
  name: string
}

export const schema = {
  plants: collection<Plant>({
    entity: seq => ({
      name: `Plant ${seq}`
    })
  })
}

type DB = VirtualDatabase<typeof schema>

export function seed(db: DB) {
  db.plants.createMany(10)
}

export function routes(app: App, db: DB) {
  app.get('/plants', c => c.json(db.plants.get()))
  app.get('/plants/:id', c => c.json(found(db.plants.find(c.req.param('id')))))
  app.delete('/plants/:id', c => c.json(db.plants.delete(c.req.param('id'))))
}
```

The backend is made once from the modules, and every test forks it:

```ts
// api.mock.ts
import { virtualBackend } from '@nano_kit/testing/backend'
import * as plantMock from './plant.mock'

export const [fetch, db, fork] = virtualBackend([plantMock])
```

```ts
// plants.spec.ts
import { fail } from '@nano_kit/testing/fetch'
import { fork } from './api.mock'

it('should delete a plant', async () => {
  const [fetch, db] = fork()

  await fetch('/plants/1', {
    method: 'DELETE'
  })

  expect(db.plants.find('1')).toBeUndefined()
})

it('should get a failure where a recipe puts one', async () => {
  const [fetch] = fork((app) => {
    app.get('/plants', fail(503))
  })

  expect((await fetch('/plants')).status).toBe(503)
})
```

## Documentation

For guides and API reference, visit the [documentation website](https://nano-kit.js.org/testing/).
