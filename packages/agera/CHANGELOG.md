# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.1](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-beta.0...agera@1.0.0-beta.1) (2026-04-26)

### Features

* add `nextValue` and `signalNextValue` helpers ([4519b57](https://github.com/TrigenSoftware/nano_kit/commit/4519b57866cbd449c78e8c00db391487e12295f2))

## [1.0.0-beta.0](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-alpha.5...agera@1.0.0-beta.0) (2026-04-12)

### Features

* export ExternalModesBase to create modes in external packages ([c8d0569](https://github.com/TrigenSoftware/nano_kit/commit/c8d0569a8b041b0ace3413a53fc935bd3c621eeb))

## [1.0.0-alpha.5](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-alpha.4...agera@1.0.0-alpha.5) (2026-02-15)

### Features

* new batch api, observer methods ([41d98ad](https://github.com/TrigenSoftware/nano_kit/commit/41d98adac431df8c8267cc894631d7bb8a31002b))
* rollback trigger util signature ([fbc4008](https://github.com/TrigenSoftware/nano_kit/commit/fbc4008b5245b1df63efac1a87a025815c3f4540))
* sync with alien-signals v3 ([e66fdf4](https://github.com/TrigenSoftware/nano_kit/commit/e66fdf435f361e0b915870448fa542988ac0ead6))

### Bug Fixes

* fix signal mount escaping ([9496e4f](https://github.com/TrigenSoftware/nano_kit/commit/9496e4f7878d8f5ed54f24834c88a032bc267540))
* noMount usage fix ([ffb688c](https://github.com/TrigenSoftware/nano_kit/commit/ffb688c93a9a353db69bb1321fba29b430cd0c38))
* onMounted no defer listener ([46bc8fa](https://github.com/TrigenSoftware/nano_kit/commit/46bc8fa3e97eff5b3e9df3539581bbcaba3a8539))

## [1.0.0-alpha.4](https://github.com/TrigenSoftware/nano_kit/compare/agera@1.0.0-alpha.3...agera@1.0.0-alpha.4) (2025-11-17)

### Bug Fixes

* use esbuild for minification ([2e48553](https://github.com/TrigenSoftware/nano_kit/commit/2e48553b567e56cc88f68c4a14936b715b1c0577))

## 1.0.0-alpha.3 (2025-11-15)

### Features

* accessor type is added ([99b0892](https://github.com/TrigenSoftware/nano_kit/commit/99b08921f29f8091c59743bde9ba3063b34ec2e7))
* batch of mods and fixes ([#51](https://github.com/TrigenSoftware/nano_kit/issues/51)) ([9bf10e5](https://github.com/TrigenSoftware/nano_kit/commit/9bf10e522948ed1f097632f663880f5d1e8ad4ac))
* introduce new reactivity system ([#49](https://github.com/TrigenSoftware/nano_kit/issues/49)) ([168c177](https://github.com/TrigenSoftware/nano_kit/commit/168c1771d8996ace6a2cecf04f37d828470a355c))
* mark certain functions as no side effects ([a4a4a1c](https://github.com/TrigenSoftware/nano_kit/commit/a4a4a1c66316f3e1a4cd5cd3f519f72e9eb556b3))
* signal activation rework, signal writable guard ([40d2cc3](https://github.com/TrigenSoftware/nano_kit/commit/40d2cc399d3ee49b42e027c65ec579726651b1a3))
* writable and mountable signal modes, onActivate -> onMounted, escape deadlock for mount effects, set new signal value by function ([840fab5](https://github.com/TrigenSoftware/nano_kit/commit/840fab5fd7c9f428109decabb3d73579ae13911a))

### Bug Fixes

* export NewValue type ([015c192](https://github.com/TrigenSoftware/nano_kit/commit/015c1928911333f3ffd89f5004049c1df50e8d5b))
* fix `readonly` return types ([c0c32fc](https://github.com/TrigenSoftware/nano_kit/commit/c0c32fc78aa7a8571b604b9e957abd1eb3572ccc))
