# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-alpha.6](https://github.com/TrigenSoftware/nano_kit/compare/kida@1.0.0-alpha.5...kida@1.0.0-alpha.6) (2026-02-15)

### Features

* map -> object, signals map api, tasks minor rework, destroy function for onStart and onStop ([91d1683](https://github.com/TrigenSoftware/nano_kit/commit/91d1683cfec08de0f88c6ee53ff0f01dee24a20e))
* move extra methods to [@nano](https://github.com/nano)_kit/store ([5cf1645](https://github.com/TrigenSoftware/nano_kit/commit/5cf16451758f1cc08b0b3856f55664f45e4f3525))

### Bug Fixes

* fix child getter to return empty value if parent is empty ([5c258ec](https://github.com/TrigenSoftware/nano_kit/commit/5c258ecfb53032ca3b10ae3e9d44547d77f1f942))
* isolate injection ([54d4952](https://github.com/TrigenSoftware/nano_kit/commit/54d4952893c7e2d608ac6a97481bd342b6ce77b2))

### Performance Improvements

* disable minification ([3d6ad47](https://github.com/TrigenSoftware/nano_kit/commit/3d6ad47eb8cca42002d71f865cd6d136f9eada5a))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/kida@1.0.0-alpha.4...kida@1.0.0-alpha.5) (2025-11-17)

### Bug Fixes

* use esbuild for minification ([2e48553](https://github.com/TrigenSoftware/nano_kit/commit/2e48553b567e56cc88f68c4a14936b715b1c0577))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/kida@1.0.0-alpha.3...kida@1.0.0-alpha.4) (2025-11-16)

### Bug Fixes

* list utils can return undefined on out of range index ([08eb7b3](https://github.com/TrigenSoftware/nano_kit/commit/08eb7b3f7515550c2de56e0fc585c04e74c817e1))

## 1.0.0-alpha.3 (2025-11-15)

### Features

* `mountable` support, rm `lazy`, deprecate `channel`, `action` helper refactor, `previous` util, new DI factory naming ([751b6f7](https://github.com/TrigenSoftware/nano_kit/commit/751b6f7c0b6bded2e2460446ff90421b25fbb318))
* accessor type and function operators experement are added ([ce08acd](https://github.com/TrigenSoftware/nano_kit/commit/ce08acd2dc9454651869b12e83094880a949d477))
* add atFindIndex signal creator ([806e083](https://github.com/TrigenSoftware/nano_kit/commit/806e083c5e37c0735b59f4501ef4d97554dcba67))
* add concat util ([2aa29e7](https://github.com/TrigenSoftware/nano_kit/commit/2aa29e7e265642da921489c38ad658daa18fb979))
* add toAccessorOrSignal util ([18b676b](https://github.com/TrigenSoftware/nano_kit/commit/18b676bc98c3e90ce5b790f116d4af4950bddfda))
* composeDestroys util ([654e1a7](https://github.com/TrigenSoftware/nano_kit/commit/654e1a7e59b476c66e8ce7d078aa0f599027aef5))
* enhance di methods to accept external context ([0fb96ae](https://github.com/TrigenSoftware/nano_kit/commit/0fb96ae17e656394126eed33dfe1c86e3e30ea55))
* introduce new state manager ([42cd6d8](https://github.com/TrigenSoftware/nano_kit/commit/42cd6d8f013bfdf0605eb6257b473890c874db30))
* mark certain functions as no side effects ([a4a4a1c](https://github.com/TrigenSoftware/nano_kit/commit/a4a4a1c66316f3e1a4cd5cd3f519f72e9eb556b3))
* migrate kida and nanoviews to agera ([#52](https://github.com/TrigenSoftware/nano_kit/issues/52)) ([382d526](https://github.com/TrigenSoftware/nano_kit/commit/382d526dd3a4d4f1bad2fa29e4fefcf5fd9cab47))
* new naming for reactivity utils ([85d7bd3](https://github.com/TrigenSoftware/nano_kit/commit/85d7bd35355afd8e542e426b7b83fc1d5c812db7))
* onMountEffectScope method ([8fe8ab1](https://github.com/TrigenSoftware/nano_kit/commit/8fe8ab1cd2ecc59e8803bef437d4e9665c3b7996))
* record accepts object ([1dca3ed](https://github.com/TrigenSoftware/nano_kit/commit/1dca3ede5873d68fba894c4e66e9ae27cc982de5))
* writable guard support ([6ad666e](https://github.com/TrigenSoftware/nano_kit/commit/6ad666e2c304ea43280d79b2749c4f899ef7128c))

### Bug Fixes

* fix inject call with given context ([ed69301](https://github.com/TrigenSoftware/nano_kit/commit/ed6930194a1605762ac0880b3ab9fa52887b4d2a))
* toSignal types fix ([30ee879](https://github.com/TrigenSoftware/nano_kit/commit/30ee87935de467cb653d1d4e4b6a4e690e693bc5))
