# CLAUDE.md — snorith/glint

## What This Repo Is

Maintained fork of [typed-ember/glint](https://github.com/typed-ember/glint) — TypeScript-powered template type checking for Glimmer/Ember components. Upstream **removed GlimmerX support** in their 2.0.0-alpha restructuring.

This fork is pinned to **upstream tag 1.2.1** (October 2023) — the last release that includes `@glint/environment-glimmerx`. All packages are renamed from `@glint/*` to `@norith/glint-*` and published at version `1.0.0+`.

## Relationship to Other Forks

```
Consumer App
  └── @norith/glimmerx-*  (snorith/glimmer-experimental)  ← thin wrappers
        └── @norith/glimmer-*  (snorith/glimmer.js)        ← actual runtime
  └── @norith/glint-*     (THIS REPO)                      ← template type checking
        └── @glimmer/syntax  (glimmer-vm)                   ← actively maintained, NOT forked
```

- THIS repo is independent of the other two forks at build time
- At runtime in the consumer app, `@norith/glint-environment-glimmerx` has peer dependencies on `@glimmerx/component`, `@glimmerx/modifier`, `@glimmerx/helper` — resolved through the consumer app's npm aliases
- THIS repo depends on `@glimmer/syntax` from glimmer-vm (actively maintained, not forked)

## Packages

| Package | Description | Published |
|---|---|---|
| `@norith/glint-core` | Language server, CLI, and transform engine | Yes |
| `@norith/glint-environment-glimmerx` | GlimmerX template type-checking environment | Yes |
| `@norith/glint-scripts` | Utility scripts for Glint integration | Yes |
| `@norith/glint-template` | Template type utilities and DSL types | Yes |
| `@norith/glint-environment-ember-loose` | Ember loose mode (internal, not published) | No |
| `@norith/glint-environment-ember-template-imports` | Ember template imports (internal) | No |
| `@norith/glint-type-test` | Testing utilities (internal) | No |

Only 4 packages are published — the rest are internal to the monorepo build.

## Important: Fork Base

This fork is based on **tag 1.2.1**, NOT the current `main` of the upstream repo. The upstream restructured for 2.0.0-alpha and deleted `@glint/environment-glimmerx` entirely. Both `main` and `develop` branches in this fork point to the 1.2.1 base.

## Build

```bash
# Requires Node 20 (managed via mise — see .mise.toml)
yarn install --no-lockfile   # Lockfile is stale due to package renames
yarn build                   # tsc --build (project references)
```

Build uses TypeScript project references (`tsconfig.json` at root references each package). `skipLibCheck: true` is enabled in `tsconfig.compileroptions.json` to handle newer transitive `@types/*` packages that are incompatible with TS 4.8.

Resolutions in root `package.json` pin `@types/node@18`, `@types/glob@7`, and `minipass@5` for TS 4.8 compatibility.

## Key Source Locations

- **GlimmerX environment definition**: `packages/environment-glimmerx/-private/environment/index.ts`
  - `typesModule` field tells Glint where to find the DSL types
- **GlimmerX DSL types**: `packages/environment-glimmerx/-private/dsl/`
- **Core transform engine**: `packages/core/src/transform/`
- **Language server**: `packages/core/src/language-server/`
- **CLI entry**: `packages/core/src/cli/`

## WebStorm / IDE Integration

The Ember Experimental.js WebStorm plugin resolves Glint from `node_modules`. After installing via npm aliases (`"@glint/core": "npm:@norith/glint-core@^1.0.0"`), the plugin should resolve the forked packages transparently.

The `tsconfig.json` `glint.environment` value in the consumer app may need to reference `@norith/glint-environment-glimmerx` explicitly — verify whether the npm alias makes this transparent.

## Publishing

Manual `workflow_dispatch` via `.github/workflows/publish.yml`. Only the 4 consumed packages are published (hardcoded in `scripts/publish-packages.js`).

## Accounts

- GitHub: `snorith`
- npmjs.com: `norith` (scope: `@norith`)
