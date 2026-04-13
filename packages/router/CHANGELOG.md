# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-alpha.7](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.6...router@1.0.0-alpha.7) (2026-04-12)

### Features

* add `asModule()` helper for explicit page module type inference ([540af7a](https://github.com/TrigenSoftware/nano_kit/commit/540af7af701ee9e38f0d622504085e82495770e7))
* add `canGoBack` utility and `CanGoBack$` injection token ([88bb960](https://github.com/TrigenSoftware/nano_kit/commit/88bb9605a24069ab7c88b15e790261ef9881456f))
* add permanent replace history action ([42baacb](https://github.com/TrigenSoftware/nano_kit/commit/42baacba2f0fb04aa2a880c47785c5a4e17dd2c2))
* add statusCode support to PageModule and notFound page reference ([59db13e](https://github.com/TrigenSoftware/nano_kit/commit/59db13ea418d0766bb57b86fad5c68b7c4723321))
* export `createCachedMatcher` function ([514b0ac](https://github.com/TrigenSoftware/nano_kit/commit/514b0ac8ca6a4dd809d74e7a8e43464553f878f1))
* remove `module()` wrapper, `page` and `layout` now supports module objects ([db93fde](https://github.com/TrigenSoftware/nano_kit/commit/db93fdefb0e55a39e1e7de78ffda3530854a8e76))
* rename `routeParam` to `param`, new `forRoute` helper ([52a7c98](https://github.com/TrigenSoftware/nano_kit/commit/52a7c98b6144117305a1d086d9ade34678a323f4))
* rename wildcard to splat ([06f2812](https://github.com/TrigenSoftware/nano_kit/commit/06f2812548c575a847d598b5c9377ca61590783f))
* ssr ready features like `Head$` and `Stores$` page methods, `precompose` util for optimized ssr ([dba0c3a](https://github.com/TrigenSoftware/nano_kit/commit/dba0c3a5e243c5c9b017c34df5d3c3952e58bcde))

### Bug Fixes

* fix listenLinks types ([205e70e](https://github.com/TrigenSoftware/nano_kit/commit/205e70e6e7cb8df5d796fa5df3a3ac9c7cedbfae))

## [1.0.0-alpha.6](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.5...router@1.0.0-alpha.6) (2026-02-16)

### Bug Fixes

* migrate to nano-kit.js.org domain ([8106368](https://github.com/TrigenSoftware/nano_kit/commit/81063687c88bb8622602946428659954b38fc3b1))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.4...router@1.0.0-alpha.5) (2026-02-15)

### Features

* rename to @nano_kit/router ([6cafa79](https://github.com/TrigenSoftware/nano_kit/commit/6cafa7973aa904ca53627d6b9d28a528be0857de))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.4...router@1.0.0-alpha.4) (2026-02-15)

### Features

* rename to @nano_kit/router ([6cafa79](https://github.com/TrigenSoftware/nano_kit/commit/6cafa7973aa904ca53627d6b9d28a528be0857de))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.3...router@1.0.0-alpha.4) (2025-11-17)

### Features

* allow nullish as base for basePath ([8a25222](https://github.com/TrigenSoftware/nano_kit/commit/8a252228da63e58237103094fe373c0dde436d27))

## [1.0.0-alpha.3](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.2...router@1.0.0-alpha.3) (2025-11-17)

### Features

* basePath util to add base for routes ([d8fa8dc](https://github.com/TrigenSoftware/nano_kit/commit/d8fa8dc6c252e11eaa9e7adf2b1854052fa55626))

### Bug Fixes

* handle trailing slashes in url ([5d2d1fd](https://github.com/TrigenSoftware/nano_kit/commit/5d2d1fd75b5faab8f1d781ae086176162b1fd753))

## [1.0.0-alpha.2](https://github.com/TrigenSoftware/nano_kit/compare/router@1.0.0-alpha.1...router@1.0.0-alpha.2) (2025-11-16)

### Bug Fixes

* fix atIndex types ([553026e](https://github.com/TrigenSoftware/nano_kit/commit/553026e44b191fdde906677d2409f4c6de2afacc))

## 1.0.0-alpha.1 (2025-11-15)

### Features

* introduce kida router library ([8965947](https://github.com/TrigenSoftware/nano_kit/commit/8965947c3c6d71f403a5972b37565ddc4d319a91))
* notFound page ref, onLinkClick reusable handler ([f034883](https://github.com/TrigenSoftware/nano_kit/commit/f034883d006dac95bfc2130c12d919bf99b11215))
* refactor, loadable pages ([a5f5843](https://github.com/TrigenSoftware/nano_kit/commit/a5f58431e3970011700242c3ccf73c830707c349))

### Bug Fixes

* fix searchParams types ([65314a1](https://github.com/TrigenSoftware/nano_kit/commit/65314a1ff6265f32987a1fd0b4a6d1437251c44c))
* mark exports as no side effects ([71449e2](https://github.com/TrigenSoftware/nano_kit/commit/71449e2baf495717b003a8fe8af7f6979fa28ff3))
