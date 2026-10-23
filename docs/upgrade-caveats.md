# Upgrade caveats

Breaking and behavioural changes when moving between versions of `@stom66/dcl-ui-component-kit`.

**Agents:** after this package is **installed or upgraded** in a consumer scene, read this file and apply any migration steps that apply to the jump the user just made. Pair with stock-asset refresh (`npx @stom66/dcl-ui-component-kit copy-assets`) — see [manual-install.md](./manual-install.md) and the UI kit skill → **Stock assets after install**.

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
