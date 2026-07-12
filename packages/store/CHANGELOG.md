# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.10](https://github.com/TrigenSoftware/nano_kit/compare/store%401.0.0-beta.9...store%401.0.0-beta.10) (2026-07-12)

### Bug Fixes

* support TypeScript 7 ([#156](https://github.com/TrigenSoftware/nano_kit/issues/156)) ([6d9edce](https://github.com/TrigenSoftware/nano_kit/commit/6d9edce57bd709859deb9cf86d9a982ab7cf4a11))

## [1.0.0-beta.9](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.8...store@1.0.0-beta.9) (2026-06-19)

### Features

* rename list utils to array utils ([#148](https://github.com/TrigenSoftware/nano_kit/issues/148)) ([37914a4](https://github.com/TrigenSoftware/nano_kit/commit/37914a49056704b9bba08759d6bdf87e1a10cd07))

## [1.0.0-beta.8](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.7...store@1.0.0-beta.8) (2026-06-09)

### Bug Fixes

* use oxlint ([#135](https://github.com/TrigenSoftware/nano_kit/issues/135)) ([e16f28a](https://github.com/TrigenSoftware/nano_kit/commit/e16f28a22549f911a8c133e83d46a945b05aac85))

## [1.0.0-beta.7](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.6...store@1.0.0-beta.7) (2026-06-03)

### Features

* support of injectable classes was added ([#133](https://github.com/TrigenSoftware/nano_kit/issues/133)) ([c7021a5](https://github.com/TrigenSoftware/nano_kit/commit/c7021a5360b78cd0cc97e2232ef7f833ec07a9ae))

## [1.0.0-beta.6](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.5...store@1.0.0-beta.6) (2026-05-14)

### Bug Fixes

* improve hydration context handling ([3942b0c](https://github.com/TrigenSoftware/nano_kit/commit/3942b0c9cb3ed2f11bb6d8c6d1343e2ae34d98b3))

## [1.0.0-beta.5](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.4...store@1.0.0-beta.5) (2026-05-09)

### Bug Fixes

* fix generated sourcemaps ([cd3457f](https://github.com/TrigenSoftware/nano_kit/commit/cd3457f3c5550266f8b233d35f672febf8dbaa7b))

## [1.0.0-beta.4](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.3...store@1.0.0-beta.4) (2026-04-28)

### Features

* `del` method is added to `Storage` interface ([21e8e2d](https://github.com/TrigenSoftware/nano_kit/commit/21e8e2d610e943ad71ae387155ca75f453e8fa19))

## [1.0.0-beta.3](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.2...store@1.0.0-beta.3) (2026-04-27)

### Bug Fixes

* fix circular self import ([b792721](https://github.com/TrigenSoftware/nano_kit/commit/b792721fab2fac0f9d827f811a3a4072c681efd2))

## [1.0.0-beta.2](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.1...store@1.0.0-beta.2) (2026-04-27)

### Features

* codec support in `hydratable` ([fc7e21b](https://github.com/TrigenSoftware/nano_kit/commit/fc7e21bdd93d641c44192bc92c70fde49afdf8d9))
* introduce codecs and `stored` and `syncedStored` signals ([0af4852](https://github.com/TrigenSoftware/nano_kit/commit/0af48523b16a893f43ed5a6f1c974b6074f4af69))
* new `interval(ms)` signal util ([dd8b566](https://github.com/TrigenSoftware/nano_kit/commit/dd8b566f7584922c5f8ed30cfb30e2e0773ad78a))
* new store methods overrides mechanism in `external` ([2321596](https://github.com/TrigenSoftware/nano_kit/commit/2321596a92ca636a88874e7b808fc3ca4c9d3982))

### Bug Fixes

* bind storage setter in `stored` and `syncedStored` ([9f7f6fe](https://github.com/TrigenSoftware/nano_kit/commit/9f7f6fe3d2b9b5580a042392d7e72407ff99b21b))
* use `noop` and `identity` ([bfcc93f](https://github.com/TrigenSoftware/nano_kit/commit/bfcc93f4a366fcc2492a7ecae2594efc352ae213))

## [1.0.0-beta.1](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-beta.0...store@1.0.0-beta.1) (2026-04-18)

### Features

* add pace accessor helper ([fc8f78b](https://github.com/TrigenSoftware/nano_kit/commit/fc8f78bcff1fe70ec1bd96633984effb4fd4dc04))

## [1.0.0-beta.0](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-alpha.1...store@1.0.0-beta.0) (2026-04-12)

### Features

* new Hydrator interface ([b40c6d9](https://github.com/TrigenSoftware/nano_kit/commit/b40c6d9ecb1e52d08c5ff8be9f5d68bce8e7f3a8))
* remove deprecated `channel` ([6418492](https://github.com/TrigenSoftware/nano_kit/commit/6418492fab2af060b0b42bfab8003ed9cda3b912))
* serialization -> hydration refactoring, `isHydrated` util to check signal state ([40b7aa5](https://github.com/TrigenSoftware/nano_kit/commit/40b7aa531de32acfb7c1f06413bb934ca4f4ae11))
* use hydrator interface instead of raw dehydrated data ([34a431f](https://github.com/TrigenSoftware/nano_kit/commit/34a431fbb19a4686550770026cabacaea9be6610))

### Bug Fixes

* reuse map passed to hydrator ([07a4eeb](https://github.com/TrigenSoftware/nano_kit/commit/07a4eeb218d3913206bf2968080068a323ab22da))

## [1.0.0-alpha.1](https://github.com/TrigenSoftware/nano_kit/compare/store@1.0.0-alpha.0...store@1.0.0-alpha.1) (2026-02-16)

### Bug Fixes

* migrate to nano-kit.js.org domain ([8106368](https://github.com/TrigenSoftware/nano_kit/commit/81063687c88bb8622602946428659954b38fc3b1))

## 1.0.0-alpha.0 (2026-02-15)

### Features

* introduce @nano_kit/store state manager library ([155ab55](https://github.com/TrigenSoftware/nano_kit/commit/155ab551a0eef1ffbd6e09d2918d4c1d03ee025f))
* paced rework ([0ef6db1](https://github.com/TrigenSoftware/nano_kit/commit/0ef6db1582675a7046988c4ba3eef681492e3327))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))
