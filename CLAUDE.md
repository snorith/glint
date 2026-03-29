# CLAUDE.md — snorith/glint

## What This Repo Is

Maintained fork of [typed-ember/glint](https://github.com/typed-ember/glint) — TypeScript-powered template type checking for Glimmer/Ember components. Upstream **removed GlimmerX support** in their 2.0.0-alpha restructuring.

This fork is pinned to **upstream tag 1.2.1** (October 2023) — the last release that includes `@glint/environment-glimmerx`. All packages are renamed from `@glint/*` to `@norith/glint-*` and published on npmjs.com under the `@norith` scope.

## Relationship to Other Forks

```
Consumer App
  └── @norith/glimmerx-*  (snorith/glimmer-experimental)  ← thin wrappers
        └── @norith/glimmer-*  (snorith/glimmer.js)        ← actual runtime
  └── @norith/glint-*     (THIS REPO)                      ← template type checking
        └── @glimmer/syntax  (glimmer-vm)                   ← actively maintained, NOT forked
```

- THIS repo is independent of the other two forks at build time
- THIS repo depends on `@glimmer/syntax` from glimmer-vm (actively maintained, not forked)

## Important: Why @glimmerx/* References Still Exist

`@norith/glint-environment-glimmerx` has **peer dependencies** on `@glimmerx/component`, `@glimmerx/modifier`, and `@glimmerx/helper` — using the `@glimmerx/*` names, NOT `@norith/glimmerx-*`.

This is intentional: consumer apps install the GlimmerX packages under the `@glimmerx/*` names via npm aliases (e.g., `"@glimmerx/component": "npm:@norith/glimmerx-component@^1.0.4"`). Yarn resolves peer dependencies by looking in the consumer's `node_modules`, where the packages appear as `@glimmerx/component`. If the peer deps referenced `@norith/glimmerx-component`, Yarn would fail to find them.

The peer dependency ranges use `>=0.6.7` to accept both the original upstream versions and the forked `@norith/glimmerx-*` versions at 1.0.x.

**DO NOT change `@glimmerx/*` peer dependencies to `@norith/glimmerx-*`** — it would break peer dependency resolution for consumer apps using aliases.

## Important: Why @glint/* References Still Exist in Source

The `packages/core/src/config/environment.ts` `locateEnvironment()` function checks for environments using both `@norith/glint-environment-` and `@glint/environment-` prefixes. This allows consumer apps to specify `"environment": "glimmerx"` in their tsconfig and have it resolve to `@norith/glint-environment-glimmerx`.

Self-referencing subpath imports (e.g., `@norith/glint-core/config-types` from within the core package) have been converted to **relative paths** (`./types.cjs`) to avoid circular build dependencies. The `@norith/glint-core/config-types` subpath export still works for external consumers.

Resolutions in the root `package.json` map `@glint/*` to local workspace packages via `file:` protocol so the monorepo build can resolve cross-package references where source code still uses `@glint/*` internally.

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
yarn install
npx tsc --build --force      # --force needed on clean builds for .cts compilation
```

Build uses TypeScript project references (`tsconfig.json` at root references each package). `skipLibCheck: true` is enabled in `tsconfig.compileroptions.json` to handle newer transitive `@types/*` packages that are incompatible with TS 4.8.

Resolutions in root `package.json` pin `@types/node@18`, `@types/glob@7`, and `minipass@5` for TS 4.8 compatibility.

## Key Source Locations

- **GlimmerX environment definition**: `packages/environment-glimmerx/-private/environment/index.ts`
  - `typesModule` field tells Glint where to find the DSL types — uses `@glint/environment-glimmerx/-private/dsl` (the consumer-facing path via alias)
- **Environment resolution (locateEnvironment)**: `packages/core/src/config/environment.ts`
  - Checks `@norith/glint-environment-` prefix first, then `@glint/environment-` as fallback
- **GlimmerX DSL types**: `packages/environment-glimmerx/-private/dsl/`
- **Core transform engine**: `packages/core/src/transform/`
- **Language server**: `packages/core/src/language-server/`
- **CLI entry**: `packages/core/src/cli/`

## Consumer App Configuration

Consumer apps install Glint packages **directly** (no aliases, unlike GlimmerX):
```json
"@norith/glint-core": "^1.0.1",
"@norith/glint-environment-glimmerx": "^1.0.1"
```

The `tsconfig.json` references the full package name:
```json
"glint": {
  "environment": "@norith/glint-environment-glimmerx"
}
```

The `glint` CLI binary is provided by `@norith/glint-core` and is still named `glint` in the `bin` field — Yarn creates the correct `.bin/glint` symlink.

## Publishing

Manual `workflow_dispatch` via `.github/workflows/publish.yml`. Only the 4 consumed packages are published (hardcoded in `scripts/publish-packages.js`). Publish workflow upgrades npm to 11.5.1+ for Trusted Publishing OIDC.

## Accounts

- GitHub: `snorith`
- npmjs.com: `norith` (scope: `@norith`)
