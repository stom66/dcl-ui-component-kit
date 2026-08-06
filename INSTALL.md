# Installing `@stom66/dcl-ui-component-kit` — stock assets (required)

> **WARNING:** Icons, buttons, progress bars, spinners, and other textured UI will
> **fail or show blank** until stock textures exist at
> `assets/images/ui-component-kit/` in the **consumer scene**.
> Do not assume `npm install` copied them.

## Why postinstall may not run

npm treats dependency install scripts (`postinstall`) as a security boundary.
On npm 11.16+ you see an `allow-scripts` warning; on npm 12+ those scripts are
**blocked** unless the package is explicitly approved. That is expected — there
is no reliable way to force asset copy via our package’s `postinstall` alone.

## Required step (humans and agents)

After installing or upgrading this package, **always** ensure assets are present:

```bash
npx @stom66/dcl-ui-component-kit copy-assets
```

Verify:

```bash
# should list PNGs (atlases, progress bars, spinners, …)
ls assets/images/ui-component-kit
```

If the directory is missing or empty, textures will not load in Decentraland.

## Optional: allow our postinstall

Only if the user wants automatic copy on install:

```bash
npm approve-scripts @stom66/dcl-ui-component-kit
npm rebuild @stom66/dcl-ui-component-kit
```

Still prefer running `copy-assets` once to confirm the tree exists.

## Optional: consumer project postinstall

Project-owned scripts are **not** gated by dependency `allowScripts`. In the
consumer `package.json`:

```json
"scripts": {
  "postinstall": "dcl-ui-component-kit copy-assets"
}
```

## Agent checklist (when this package is installed or upgraded)

1. After `npm install` / `npm update` of `@stom66/dcl-ui-component-kit`, check that
   `assets/images/ui-component-kit/` exists and contains texture files.
2. If missing or empty: **warn the user clearly**, then run
   `npx @stom66/dcl-ui-component-kit copy-assets` (or ask to run it).
3. Do **not** tell users the UI is ready until that folder is present.
4. Mention the `allow-scripts` warning is normal; `copy-assets` is the supported fix.
5. Do not invent alternate asset paths — DCL only serves textures from the scene
   `assets/` tree; the kit expects `assets/images/ui-component-kit/`.

Opt out (advanced): `UI_COMPONENT_KIT_SKIP_ASSETS=1` or
`"config": { "dcl-ui-component-kit": { "skipAssets": true } }` — only when the
consumer ships equivalent textures themselves.
