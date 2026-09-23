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

An existing folder is not proof the PNGs match the installed code. `npm update` replaces the package in `node_modules` and leaves the scene copies untouched whenever postinstall does not run. After any upgrade from an older install, run `copy-assets` again so the scene sheets match the new code.

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
2. If the folder is missing or empty, **or the scene was first installed on an
   older version of this package than the one just installed**: warn the user,
   then run `npx @stom66/dcl-ui-component-kit copy-assets` (or ask them to).
   A populated folder can still be stale. `npm update` does not replace those PNGs
   when postinstall is blocked.
3. If symbols, letters, or digits look sliced, swapped, or like the wrong glyph,
   treat that as an old scene texture. Current code reads `atlas-chars-symbols.png`
   as 6×6; copies from before that change are 4×4. Run `copy-assets` before
   changing UV or inset code.
4. Do **not** tell users the UI is ready until stock textures match the installed package.
5. Mention the `allow-scripts` warning is normal; `copy-assets` is the supported fix.
6. Do not invent alternate asset paths — DCL only serves textures from the scene
   `assets/` tree; the kit expects `assets/images/ui-component-kit/`.

Opt out (advanced): `UI_COMPONENT_KIT_SKIP_ASSETS=1` or
`"config": { "dcl-ui-component-kit": { "skipAssets": true } }` — only when the
consumer ships equivalent textures themselves.
