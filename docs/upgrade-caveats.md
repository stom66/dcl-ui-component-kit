# Upgrade caveats

Breaking and behavioural changes when moving between versions of `@stom66/dcl-ui-component-kit`.

**Agents:** after this package is **installed or upgraded** in a consumer scene, read this file and apply any migration steps that apply to the jump the user just made. Pair with stock-asset refresh (`npx @stom66/dcl-ui-component-kit copy-assets`) — see [manual-install.md](./manual-install.md) and the UI kit skill → **Stock assets after install**.

---

## 0.3.x (FontAwesome TTFs)

Font Awesome Free icons via custom TTF (`FontAwesome`) and `Icon` breaking change:

- **Run `copy-assets` after upgrade** so converted TTFs land under `assets/fonts/` (`duck-font-awesome-solid.ttf`, `…-regular.ttf`, `…-brands.ttf`) plus `LICENSE-OFL.txt`. Images alone are not enough.
- **Known issue — Unity atlas capacity.** Each `fontSrc` gets one dynamic SDF atlas. After Latin prefill, expect only about **~35–50 unique** FA icons per font (varies by glyph complexity). More unique icons → tofu. Repeats of the same icon are fine. Prefer texture `Icon` / a project atlas for large sets.
- **Unity Desktop preview needs asset bundles for `fontSrc`.** Without them you get tofu even within budget (fallback face has no PUA glyphs). Use Creator Hub **Compress Assets**, or `npm run start:bundles` / `npm run start -- --asset-bundles`. Bevy / web preview loads `.ttf` directly and does not need this.
- **`<FontAwesome icon="star" />`** — kebab or camelCase; optional `fontSize` / `fontColor` only. Use for small curated FA sets; keep `atlasIconsFontAwesome` / project atlases for dense HUDs.
- **Breaking — `Icon` no longer defaults to the Font Awesome atlas.** Pass `src` (and optional `uvs` from your `TextureAtlas`) for custom art. Omitting `src` logs an error and renders empty.
- **`atlasIconsFontAwesome` is deprecated** but still exported for one release (texture subset — unaffected by the `fontSrc` atlas limit).
- Fonts are Modified Versions under **SIL OFL 1.1** (Reserved Font Name “Font Awesome” — kit families use `DuckFa7FreeSolid` / `DuckFa7FreeRegular` / `DuckFa7Brands`; files `duck-font-awesome-*.ttf`). See `assets/fonts/LICENSE-OFL.txt` and [licensing.md](./licensing.md).

---

## 0.2.8 (from ≤ 0.2.7)

Custom fonts (`fontSrc`) and atlas glyph deprecation:

- **`@dcl/sdk` ≥ 7.31 required.** The kit ships as TypeScript and writes `fontSrc` on `uiText`. Scenes on 7.30.1 or earlier will fail to typecheck when upgrading the kit — bump `@dcl/sdk` (and matching `@dcl/js-runtime` if you pin it) first or in the same install.
- **Theme is non-breaking.** `typography.fontSrc` is optional (`sansSerif` / `serif` / `monospace` / catch-all `default`). Omit it to keep built-in faces only. No changes required to existing `family` / `size` / `scale` overrides.
- **`IconNumber` / `IconString` / `IconCharacter` / `IconSymbol` are deprecated** but still exported. Prefer `Text` / `Label` with `fontSrc` or `theme.typography.fontSrc` for custom typefaces. No code change required to keep using the atlas glyph components.
- **Optional — custom TTFs:** put `.ttf` files (plus redistributable licence) under the scene (e.g. `assets/fonts/`), set `theme.typography.fontSrc` and/or the `fontSrc` shorthand, and always pair with a built-in `font` fallback. (Later kit versions also ship Font Awesome TTFs via `copy-assets` — see 0.3.x.)

---

## 0.2.0 (from 0.1.x)

Breaking / behaviour changes vs 0.1.x (SDK **7.26** UI):

- **Named zone components removed** (`ZoneTop`, `ZoneBottomRight`, `ZoneDefault`, …). Use `zone: ZoneType.*` on a Layer, or `<Zone type={ZoneType.Top}>` (`type` is required).
- **`IS_DEV` removed** (unused).
- **`LEFT_ZONE_INSET` → `getLeftZoneInset()`** — call it at layout time; a module constant froze `isMobile()` / `vwToPixels` at import.
- **`colsDesktop` / `colsMobile`** still exist and are resolved at render (same live-platform rule).
- **`screenInset` / Layer `inset`** — Setup `screenInset` is the default for layers that omit `inset`. Layers are grouped into at most three SDK renderers (`setUiRenderer` + `addUiRenderer`). Do not wrap layers in `ScreenInsetArea` / `InteractableArea`. Only `ZoneType.Default` gets a centering shell inside its renderer.
- **`ZoneType.InteractableArea` deprecated** — use `inset: 'interactable'` with `ZoneType.FullScreen` (or `Default`).
- **`zIndex`** is applied only when the Layer sets it (not from array index). Use `zIndex` for stacking across inset groups. Later siblings still paint on top when unset.
- **Buttons / Toggle:** on **mobile**, `callback` fires on `mouseDown`; on desktop, any `mouseUp` on the button. Use `isMobile()`, not `!isDesktop()`.
- **Temporary:** `SetupUiComponentKit` installs `src/ui-component-kit/utils/pointerInputPatch.ts` so UI clicks are not dropped when Explorer’s root-entity copy of the click wins the SDK’s global timestamp race. Tear-out notes and the upstream report: `dclcontext/bugs/sdk-ui-pointer-stale-click.md`.
- Toast host uses `ZoneType.None` with no full-screen wrapper (so it does not steal clicks).
