# Maintainer notes - bump and publish

Package: `@stom66/dcl-ui-component-kit`  

## Overview

1. `npm run bump:patch` (or `minor` / `major`)
2. `git push && git push --tags`
3. Actions → **Publish to npm** → **Run workflow** -or- run `gh workflow run`
4. Confirm the version on [npmjs.com/package/@stom66/dcl-ui-component-kit](https://www.npmjs.com/package/@stom66/dcl-ui-component-kit)

### Alternate method of publishing locally

- Add `/.npmrc` file with `//registry.npmjs.org/:_authToken=npm_...<your token>`
- Run `npm publish`

## Full publishing flow

### Bump the version

From a clean working tree (committed changes, on the branch you release from):

```bash
npm run bump:patch   # 0.1.12 → 0.1.13
npm run bump:minor   # 0.1.12 → 0.2.0
npm run bump:major   # 0.1.12 → 1.0.0
```

These run `npm version patch|minor|major`, which:

1. Updates `package.json` `version`
2. Creates a git commit (`vX.Y.Z` / default npm version commit)
3. Creates an annotated git tag `vX.Y.Z`

### Publish to GitHub

Push the version commit **and** the tag:

```bash
git push && git push --tags
```

CI (`test-build`) runs on push. Wait for a green build if you care about that before npm.

### Publish to npm (Node)

Publishing is **manual** after the tag is on GitHub:

1. Open [Actions → Publish to npm](https://github.com/stom66/dcl-ui-component-kit/actions/workflows/publish.yml)
2. **Run workflow** (workflow_dispatch)

The workflow checks out the default branch, installs, builds, and runs `npm publish` with OIDC. No `NPM_TOKEN` in the repo.

First-time / if publish fails with an auth error: on npmjs.com → package **Settings → Trusted Publisher → GitHub Actions**, point it at this repo and the `publish.yml` workflow.
