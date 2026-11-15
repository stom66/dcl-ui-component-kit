# Upgrade caveats

Breaking and behavioural changes when moving between versions of `@stom66/dcl-ui-component-kit`.

**Agents:** after this package is **installed or upgraded** in a consumer scene, read this file and apply any migration steps that apply to the jump the user just made. Pair with stock-asset refresh (`npx @stom66/dcl-ui-component-kit copy-assets`) — see [manual-install.md](./manual-install.md) and the UI kit skill → **Stock assets after install**.

---

## 0.4.0 (`UiBox` deprecated)

`UiBox` is **deprecated, not removed**. Existing scenes keep compiling and rendering exactly as before — no action is required to upgrade.

What changed:

- Kit components (`Row`, `Column`, `Text`, `Label`, buttons, icons, …) now render the SDK `UiEntity` directly. Their props and shorthands are unchanged.
- `UiBox` / `UiBoxProps` are still exported, marked `@deprecated`. New code should not use them.
- New exports for custom components: `resolveKitEntityProps` and the `KitEntityProps` type.

**What to use instead of `UiBox`:**

| The box is… | Use |
|---|---|
| A layout container (stack of children) | `Column` / `Row` — keeps every shorthand. Pass `spacing={0}` if you do not want gaps between children |
| A plain chip / cell / swatch / hit area | SDK `UiEntity` |
| Text | `Text` / `Label` / `H1`–`H6` |
| Clickable | `ButtonText` / `ButtonImage` |

**`UiBox` → `UiEntity` prop mapping.** `UiEntity` has no top-level shorthands; everything lives in `uiTransform` / `uiBackground` / `uiText`.

| `UiBox` | `UiEntity` |
|---|---|
| `backgroundColor={c}` | `uiBackground={{ color: c }}` |
| `width` / `height` / `padding` / `margin` / `alignItems` / `justifyContent` / `flexWrap` / `position` / `zIndex` / … | Same key inside `uiTransform={{ … }}` |
| `borderRadius` / `borderWidth` / `borderColor` | Inside `uiTransform`. **Set `borderColor` explicitly** — `UiBox` derived it from the fill (`darken(fill, 0.2)`) when only a width was given; `UiEntity` does not |
| `aspectRatio` | Set both axes, or spread `...resolveAspectDimensions({ width, height, aspectRatio })` into `uiTransform` |
| `uiText={{ fontSize: n }}` | `uiText={{ fontSize: scaleThemeFontSize(n) }}` — `UiBox` scaled numeric font sizes; `UiEntity` does not. Prefer kit `Text` / `Label` |
| `uiTransform` / `uiBackground` / `uiText` / `onMouseDown` / `onMouseUp` / `onMouseEnter` / `onMouseLeave` / `key` / children | Unchanged |

```tsx
// Before
<UiBox
	backgroundColor = {theme.colors.primary}
	borderRadius    = {8}
	padding         = {{ top: 8, right: 12, bottom: 8, left: 12 }}
	alignItems      = "center"
	width           = {140}
>
	<Text value="Hello" />
</UiBox>

// After
import { UiEntity } from '@dcl/sdk/react-ecs'

<UiEntity
	uiTransform={{
		width       : 140,
		padding     : { top: 8, right: 12, bottom: 8, left: 12 },
		alignItems  : 'center',
		borderRadius: 8,
	}}
	uiBackground={{ color: theme.colors.primary }}
>
	<Text value="Hello" />
</UiEntity>
```

**Custom components built on `UiBox`.** Swap the type and spread the resolver onto a `UiEntity`. `children` and `key` are not returned by the resolver — render / pass them yourself.

```tsx
// Before
export function MyThing({ uiTransform, ...props }: UiBoxProps) {
	return <UiBox {...props} uiTransform={{ width: 'auto', ...uiTransform }} />
}

// After
import { UiEntity } from '@dcl/sdk/react-ecs'
import { resolveKitEntityProps, type KitEntityProps } from '@stom66/dcl-ui-component-kit'

export function MyThing({ children, uiTransform, ...props }: KitEntityProps) {
	return (
		<UiEntity {...resolveKitEntityProps({ ...props, uiTransform: { width: 'auto', ...uiTransform } })}>
			{children}
		</UiEntity>
	)
}
```

**Do not put kit shorthands on a raw `UiEntity`.** `<UiEntity padding={8} />` is wrong — DCL treats unknown top-level keys as ECS component names. Kit animation wrappers (`Pulse`, `Bounce`, …) handle a `UiEntity` child correctly (they size it through `uiTransform`).

**Agents:** after upgrading a consumer scene to ≥ 0.4.0, search it for `UiBox`. If there are usages, tell the user it is deprecated and **offer** to migrate them with the tables above — do not migrate silently, and do not treat the remaining usages as errors. Never introduce `UiBox` in new code.

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
