# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-alpha.11](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.10...query@1.0.0-alpha.11) (2026-06-17)

### Features

* replace all keys revalidation with `keys` util to iterate over all registered keys ([#146](https://github.com/TrigenSoftware/nano_kit/issues/146)) ([6fe39c9](https://github.com/TrigenSoftware/nano_kit/commit/6fe39c9408c5c505f0aac3dc2cd8ef6674d13d5b))

## [1.0.0-alpha.10](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.9...query@1.0.0-alpha.10) (2026-06-16)

### Features

* allow invalidate all ([#144](https://github.com/TrigenSoftware/nano_kit/issues/144)) ([00c8f59](https://github.com/TrigenSoftware/nano_kit/commit/00c8f59aa168a60ca5be24263f4bf02d1b353c74))

## [1.0.0-alpha.9](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.8...query@1.0.0-alpha.9) (2026-06-09)

### Bug Fixes

* use oxlint ([#135](https://github.com/TrigenSoftware/nano_kit/issues/135)) ([e16f28a](https://github.com/TrigenSoftware/nano_kit/commit/e16f28a22549f911a8c133e83d46a945b05aac85))

## [1.0.0-alpha.8](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.7...query@1.0.0-alpha.8) (2026-06-03)

### Features

* support of injectable classes was added ([#133](https://github.com/TrigenSoftware/nano_kit/issues/133)) ([c7021a5](https://github.com/TrigenSoftware/nano_kit/commit/c7021a5360b78cd0cc97e2232ef7f833ec07a9ae))

## [1.0.0-alpha.7](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.6...query@1.0.0-alpha.7) (2026-05-28)

### Features

* accept value accessors in query params ([80c36f3](https://github.com/TrigenSoftware/nano_kit/commit/80c36f30483f3271368e729a286ae5bd3e1f8560))

## [1.0.0-alpha.6](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.5...query@1.0.0-alpha.6) (2026-05-09)

### Bug Fixes

* fix generated sourcemaps ([cd3457f](https://github.com/TrigenSoftware/nano_kit/commit/cd3457f3c5550266f8b233d35f672febf8dbaa7b))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.4...query@1.0.0-alpha.5) (2026-04-27)

### Features

* `hydratable` and `persistence` now supports codecs via `codec` setting ([b2711cb](https://github.com/TrigenSoftware/nano_kit/commit/b2711cbc25f861dcb512a84e4e39a8c5876c2297))
* drop `revalidateOnFoucs`, `revalidateOnInterval` and `revalidateOnReconnect` in favor of universal `revalidateOn` extension ([5b7bd8f](https://github.com/TrigenSoftware/nano_kit/commit/5b7bd8f70c46218768c65b6f240d599b3ee48f52))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.3...query@1.0.0-alpha.4) (2026-04-19)

### Bug Fixes

* fix entities extension by fixing data mapping in client ([b6aa567](https://github.com/TrigenSoftware/nano_kit/commit/b6aa5676a83f8a727a8da9ecd6ef2d774177d47b))

## [1.0.0-alpha.3](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.2...query@1.0.0-alpha.3) (2026-04-18)

### Bug Fixes

* improve infinite refetching and query helper types ([aeae0fa](https://github.com/TrigenSoftware/nano_kit/commit/aeae0fa7f31fe866c47254c31b8ed50c175b9b54))

## [1.0.0-alpha.2](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.1...query@1.0.0-alpha.2) (2026-04-12)

### Features

* `hydratable` extension, `persistence` extension and `indexedDbStorage` persistent adapter ([5bd7219](https://github.com/TrigenSoftware/nano_kit/commit/5bd721948202c8eb95eff33a9de545490a07a7e8))
* use hydrator interface instead of raw dehydrated data ([34a431f](https://github.com/TrigenSoftware/nano_kit/commit/34a431fbb19a4686550770026cabacaea9be6610))
* use new hydrator, serialize cache entry before dehydration ([e4758e3](https://github.com/TrigenSoftware/nano_kit/commit/e4758e388245cc65a59a70bfd30c1703571951fe))

### Bug Fixes

* do not persist error results ([1d07db4](https://github.com/TrigenSoftware/nano_kit/commit/1d07db40b37b49ffdc31e01c06656c01d027bf5d))

## [1.0.0-alpha.1](https://github.com/TrigenSoftware/nano_kit/compare/query@1.0.0-alpha.0...query@1.0.0-alpha.1) (2026-02-16)

### Bug Fixes

* migrate to nano-kit.js.org domain ([8106368](https://github.com/TrigenSoftware/nano_kit/commit/81063687c88bb8622602946428659954b38fc3b1))

## 1.0.0-alpha.0 (2026-02-15)

### Features

* introduce remote data manager for kida ([8b2b18a](https://github.com/TrigenSoftware/nano_kit/commit/8b2b18a6484c652e6136e40a02d947ac2d898fb8))

### Bug Fixes

* mark query's $data with mountable type ([f9f8865](https://github.com/TrigenSoftware/nano_kit/commit/f9f8865c7b863462bcc0f73f00e072957bda80e0))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))
