# @norith/glint-* — Maintained Fork of Glint (Type Checking)

## Why This Fork Exists

The upstream [typed-ember/glint](https://github.com/typed-ember/glint) removed `@glint/environment-glimmerx` in their 2.0.0-alpha restructuring — the GlimmerX environment was dropped as the project shifted focus to Ember Octane/Polaris. Projects using GlimmerX depend on `@glint/environment-glimmerx` for template type-checking.

This fork is pinned to **tag 1.2.1** (the last release with GlimmerX support) and exists to:

1. **Preserve GlimmerX template type-checking** — upstream removed it
2. **Maintain TypeScript compatibility** as newer TS versions are adopted
3. **Publish under `@norith/*` scope** on npmjs.com

## What Changed From Upstream

### Fork Base

This fork is based on upstream **tag 1.2.1** (October 2023), not the current `main` which has been restructured for 2.0.0-alpha and no longer contains the packages we need.

### Package Renaming

| Upstream | Fork | Published? |
|---|---|---|
| `@glint/core` | `@norith/glint-core` | Yes |
| `@glint/environment-glimmerx` | `@norith/glint-environment-glimmerx` | Yes |
| `@glint/scripts` | `@norith/glint-scripts` | Yes |
| `@glint/template` | `@norith/glint-template` | Yes |
| `@glint/environment-ember-loose` | `@norith/glint-environment-ember-loose` | No (internal only) |
| `@glint/environment-ember-template-imports` | `@norith/glint-environment-ember-template-imports` | No (internal only) |
| `@glint/type-test` | `@norith/glint-type-test` | No (internal only) |
| `glint-vscode` | (unchanged) | No (private) |

### Versioning

All packages start at **1.0.0** (clean break from upstream 1.2.1).

## Dependencies

- `@norith/glint-core` depends on `@glimmer/syntax` (from actively maintained glimmer-vm)
- `@norith/glint-environment-glimmerx` has peer dependencies on `@glimmerx/component`, `@glimmerx/modifier`, `@glimmerx/helper` — resolved through consumer app's npm aliases
- TypeScript `>=4.8.0` as peer dependency (compatible with webapp's `^5.2.2`)

## Relationship to Other Forks

| Repo | What it contains |
|---|---|
| [`snorith/glimmer-experimental`](https://github.com/snorith/glimmer-experimental) | `@norith/glimmerx-*` wrapper packages |
| [`snorith/glimmer.js`](https://github.com/snorith/glimmer.js) | `@norith/glimmer-*` runtime packages |
| **This repo** (`snorith/glint`) | `@norith/glint-*` type-checking packages |

## WebStorm / IDE Integration

The Ember Experimental.js WebStorm plugin resolves Glint from `node_modules`. After installing the `@norith/glint-*` packages (via npm aliases in the consumer app), the plugin should resolve type information from the forked packages transparently.

The `tsconfig.json` `glint.environment` value may need updating — verify whether the npm alias makes this transparent or whether it needs to reference `@norith/glint-environment-glimmerx` explicitly.

## Publishing

Same setup as the other forks: Trusted Publishing (OIDC) via GitHub Actions `workflow_dispatch` with Major/Minor/Patch dropdown. Only the 4 consumed packages are published.
