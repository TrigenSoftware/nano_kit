# AGENTS.md

Working notes for agents (and humans) contributing to this monorepo.

## What matters here

This is a set of small, published libraries: `agera` (signals core), `kida`, `@nano_kit/store`, `query`, `router` and thin framework adapters. Their selling point is that they are tiny and fast, so **bundle size is priority one and CPU is priority two**. A change that makes the code nicer but bigger is not an improvement.

## Writing internal code

Internal code — everything that is not part of a package's public API — is held to three rules:

- **Only what is needed.** Every line does exactly one necessary job. No convenience layers, no options nobody passes, no abstraction added "for later".
- **No unreachable code.** Do not add guards for cases that cannot happen outside super-exotic usage. If a branch cannot be reached by a realistic consumer, it is dead weight and must not be written.
- **Performance is part of correctness.** Prefer the shape that allocates less and calls less, as long as it does not cost bundle size.

**Public API is deliberately exempt.** An exported function is a contract: its ergonomics, its type surface, its documented behaviour and its resilience to reasonable misuse are worth bytes that the same code would never earn internally. Judge public API by how it is used, not by how lean it is.
