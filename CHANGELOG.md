# @norith/glint-* Changelog

Maintained fork of [typed-ember/glint](https://github.com/typed-ember/glint). See [CLAUDE.md](./CLAUDE.md) for full context.

---

## v1.0.1 (2026-03-28)

#### :bug: Bug Fix
* Widened peer dependency ranges for `@glimmerx/*` packages from `~0.6.7` to `>=0.6.7`
  * Accepts both original upstream versions and forked `@norith/glimmerx-*` at 1.0.x
* Changed `@norith/glint-template` peer dep from exact `1.0.0` to `^1.0.0`
* Fixed test-package version references from `1.0.0` to `1.0.1`

## v1.0.0 (2026-03-28)

#### :house: Fork
* Fork based on upstream tag 1.2.1 (last release with GlimmerX environment support)
  * Upstream removed `@glint/environment-glimmerx` in 2.0.0-alpha restructuring
* All packages renamed from `@glint/*` to `@norith/glint-*`
* Version reset to 1.0.0 (clean break from upstream 1.2.1)
* Fixed self-referencing subpath imports (`@norith/glint-core/config-types`) — converted to relative paths to resolve circular build dependency
* Added `@norith/glint-environment-` prefix to `locateEnvironment()` so `"environment": "glimmerx"` in tsconfig resolves the forked package
* Added `skipLibCheck: true` for TS 4.8 compatibility with newer `@types/*`
* Pinned `@types/node@18`, `@types/glob@7`, `minipass@5` via resolutions
* Added `.mise.toml` (Node 20), `scripts/bump-version.js`, `scripts/publish-packages.js`
* Added GitHub Actions publish workflow with Trusted Publishing OIDC
* Simplified CI workflow (removed Windows tests, TS nightly, floating deps)
* Added CLAUDE.md, AGENTS.md, FORK.md documentation
* Regenerated yarn.lock with correct `@norith/*` package names
