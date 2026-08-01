---
name: scaling-ui
description: >-
  Build and extend Decentraland Scaling UI layers, zones, and components.
  Use when creating UI, popups, HUDs, layers, zones, timers, themes, buttons
  (ButtonImage / ButtonText), or anything under src/scaling-ui (including examples).
  MUST be read before adding or changing a Layer or button.
---

# Scaling UI

Lightweight reusable UI for Decentraland SDK7. Prefer framework primitives over raw `UiEntity` layout.

**Before creating or editing a Layer:** read this skill and mirror `src/scaling-ui/examples/layers/*.layer.tsx`. Do not invent a parallel mount path or new Layer option fields for props Zone already accepts.

## Core model

1. **`SetupScalingUI({ theme, layers })`** mounts the renderer inside **`ScreenInsetArea`** (device hardware safe margins) with a 100% × 100% stack.
2. **One Layer = one Zone.** The layer fills that zone. Implement **`body()` only**.
3. **`zone: ZoneType.*`** selects a preset (`zone.presets.ts`). Base `Layer.render()` mounts **`Zone`** only (the inset canvas is owned by SetupScalingUI — do not wrap layers in `ZoneRoot` / `ScreenInsetArea`).
4. **`uiTransform` / `uiBackground`** on `LayerOptions` are passed straight through to that Zone and merge on top of the preset.
5. Compose content with **`Row` / `Column` / `Background` / `UiBox` / …** inside `body()`.

**All imports under `src/` must be relative** (`./`, `../`) — never absolute `src/...`.
Stay inside the package with sibling/parent paths (`../components`, `../../styles`) — do not climb out to `src/` and back in via a folder name (`../../scaling-ui/...`). That hardcodes the package directory name and breaks when it is renamed. Keep multi-named imports on one line.

## Prop forwarding (critical)

Layer accepts optional **`uiTransform`** and **`uiBackground`** and passes them to the Zone. Do not add UiBox shorthand props (`backgroundColor`, `borderRadius`, …) on `LayerOptions` — put those on the native objects, or wrap body content in **`Background`**:

- Zone size / flex → `uiTransform: { width, height, alignItems, justifyContent, … }`
- Panel fill / border → `<Background>` inside `body()` (not Layer options)
- Background fill shorthand → `backgroundColor`
- Background border → `borderColor` / `borderWidth` / `borderRadius`
- Background texture → `textureSrc`

Zone merges transforms as:

`flex defaults → zone preset → uiTransform overrides`

```tsx
super({
	id         : 'timer',
	zone       : ZoneType.Top,
	uiTransform: {
		width         : '30vw',
		height        : '10vw',
		alignItems    : 'center',
		justifyContent: 'center',
	},
})

// in body():
<Background backgroundColor={getTheme().colors.primary} borderRadius={8}>
	{/* … */}
</Background>
```

| Need | How |
|---|---|
| Top / corner / etc. | `zone: ZoneType.*` |
| Narrower / shorter than preset | `uiTransform: { width, height }` |
| Flex alignment | `uiTransform: { alignItems, justifyContent, … }` |
| Fill / border on content | `<Background>` in `body()` |
| Close control | `showCloseButton: true` (Layer option → Zone inserts button) |

**Anti-pattern:** adding Layer shorthand fields (`backgroundColor`, `borderRadius`, `themeBackground`, `widthVw`, `showFrame`, …). Use `uiTransform` / `uiBackground` on the Zone, and `Background` for panel chrome.

### VH / VW helpers

For `uiTransform` sizes/positions, prefer native strings (`'30vw'`, `'10vh'`).

`vwToPixels` / `vhToPixels` are for **numeric** math (clamping, offsets, off-screen
travel). They convert against the **virtual** canvas — never the physical screen.

### Typography / fontSize (critical)

Theme `typography.size.*` values are **base pixel numbers only**. They must never call
`scaleFontSize` — theme / `buildTheme` run once at load, before canvas size is known.

**Every `fontSize` assignment in TSX must wrap the base size with `scaleFontSize` at
render time** (when the UI function / `body()` runs and canvas info exists):

```tsx
import { scaleFontSize } from '@dcl/sdk/react-ecs'

uiText={{
	value   : 'Hello',
	fontSize: scaleFontSize(theme.typography.size.default),
}}
```

Optional second arg overrides the viewport scale unit (SDK default `0.39` width-based):
`scaleFontSize(16, '1.5vw')`. Do not pass a third string like `"100vh"` — the third
arg is an optional `ScaleContext` object, not a unit.

| Wrong | Right |
|---|---|
| `fontSize: theme.typography.size.h1` | `fontSize: scaleFontSize(theme.typography.size.h1)` |
| `scaleFontSize(...)` inside `defaultTheme` / `buildTheme` | Keep theme sizes as plain numbers; wrap only in TSX |
| Raw `fontSize` in a Layer `body()` or `uiText` override | Always `scaleFontSize(...)` |

If a caller overrides `uiText.fontSize`, that override must also use `scaleFontSize`.

## Create a layer

```tsx
export class MyLayer extends Layer {
	constructor() {
		super({
			id  : 'my-layer',
			zone: ZoneType.Default,
		})
	}

	protected body() {
		return (
			<Background>
				<UiBox key="my-body" uiText={{ value: 'Hello' }} />
			</Background>
		)
	}
}

export const myLayer = new MyLayer()
```

## Critical anti-patterns

| Wrong | Right |
|---|---|
| Override `render()` to wrap `ScreenInsetArea` / `ZoneRoot` / `Zone` | Base `Layer.render()`; only implement `body()` |
| Hand-build edge layout | `zone: ZoneType.*` |
| Layer shorthands (`backgroundColor`, `borderRadius`, `showFrame`) | `uiTransform` / `uiBackground` / `<Background>` |
| Treat `Layer` as JSX | `class X extends Layer` + export instance |
| `UiBox` + `onMouseDown` / `onMouseUp` as a button | `ButtonImage` or `ButtonText` (ask which — see Buttons) |
| Bare `fontSize: theme.typography.size.*` | `fontSize: scaleFontSize(theme.typography.size.*)` |

## Procedural vs image-based

Several families ship in two flavours. Document and choose explicitly:

| Kind | Meaning |
|---|---|
| **Procedural** | Colours / theme only — no texture files |
| **Image-based** | PNG / atlas — always overridable (`textureSrc`, `textures`, `atlas`, `iconSrc`, …) |

Project art goes under **`assets/images/my-theme/`**. Define custom `TextureAtlas` / texture sets in `src/myTheme.ts` (see examples there). Do not invent parallel texture APIs.

| Family | Procedural | Image-based | Override |
|---|---|---|---|
| Buttons | `ButtonText` | `ButtonImage` / `ButtonImageClose` | `textureSrc` + `uvColumnCount` / `uvRowCount` |
| Progress bars | `ProgressBar` | `ProgressBarImage` | `textures` (`background` / `fill` / `border`) |
| Icons | — | `Icon` / `IconNumber` | `iconSrc` + `uvs`, or `atlas` on `IconNumber` |

## Custom textures / atlases (agent checklist)

When a user wants **their own images, atlases, or styles**, walk them through this — do not invent a parallel path:

1. **Open the Affinity template** at `assets/images/scaling-ui-assets.af`. Explain that every default atlas / progress-bar artboard lives there; they should **duplicate** the closest artboard and edit a copy (keep grid, guidelines, and margins).
2. **Export PNGs** into `assets/images/my-theme/` (never into `assets/images/scaling-ui/` unless they intend to replace framework defaults).
3. **Declare** a `TextureAtlas` (or `ProgressBarImageTextures`) in `src/myTheme.ts`, mirroring the examples already in that file (`myBtnIconsAtlas`, `myIconsAtlas`, `myNumbersAtlas`, progress-bar sets).
4. **Sample UVs only via framework APIs** — never hand-write UV arrays:
	- Prefer `TextureAtlas.cell` / `.row` / `.column` / `.char` / `.uv.<name>`
	- Fall back to `getUVCell` / `getUVColumn` / `getUVRow` from `utils/uvs.tsx` for one-off / non-atlas cases
5. **Coordinates are 1-based and inclusive.** First column/row is `1`, not `0`. Totals (`columns`, `rows`, `xTotal`, `yTotal`, `uvColumnCount`) are counts. Example: first cell of a 4×4 → `{ xStart: 1, yStart: 1, xTotal: 4, yTotal: 4 }`; `ButtonImage` `uvColumn={1}` for the first variant.
6. Point them at root `README.md` → **Custom textures** and the Affinity callout at the top of the README.

**Anti-patterns:** hard-coded UV quads; mixing 0-based indexes with counts; inventing a second atlas registry outside `myTheme.ts` / `scaling-ui/atlases/`.

## Buttons

> **Variants:** procedural (`ButtonText`) · image-based (`ButtonImage`)

When creating any kind of button element, ask the user if this is meant to be an **image button** or just a **simple text button**, then use the appropriate component. Do not invent a clickable `UiBox`; do not guess.

| Kind | Component | Use when |
|---|---|---|
| Image | `ButtonImage` | Atlas / texture button (hover + press states) |
| Text | `ButtonText` | Labelled control with no dedicated image asset |
| Close / dismiss | `ButtonImageClose` or `showCloseButton: true` | Hideable layer chrome |

Both `ButtonImage` and `ButtonText` take a unique `id` and a `callback`. See `src/scaling-ui/components/buttons/`.

```tsx
<ButtonText
	id        = "btn_simple_toggle"
	textLabel = "Simple"
	callback  = {() => simpleLayer.toggle()}
/>
```

```tsx
import { atlasBtnIconsStyled } from '../../atlases'

<ButtonImage
	id         = "btn_help"
	textureSrc = {atlasBtnIconsStyled.source}
	uvColumn   = {1}
	callback   = {() => helpLayer.toggle()}
/>
```

Atlas layout for `ButtonImage`: columns = button variants, rows = states. Pass `uvColumn` (required, **1-based** — first column is `1`). Defaults use `atlasBtnIconsStyled` (`source`, `columns`, `rows`). For a custom sheet, pass `textureSrc` + `uvColumnCount` + `uvRowCount` (define the atlas in `src/myTheme.ts`). Prefer `TextureAtlas` instances over hard-coded paths / `xTotal` / `yTotal`.

## Progress bars

> **Variants:** procedural (`ProgressBar`) · image-based (`ProgressBarImage`)

Shared value API: `id`, `value`, `minValue` / `maxValue`, `fillFrom`, lerp per `id`.

- **`ProgressBar`** — colour track / fill / border (`fillColor`, …)
- **`ProgressBarImage`** — three full textures (background / fill / border) with `nine-slices`. Override via `textures`. Horizontal vs vertical sets from `fillFrom` / `orientation`. Define custom sets in `src/myTheme.ts`.
## Hideable + close button

`canBeHidden` / `startHidden` / `showCloseButton` are **Layer** options. The Zone receives them; when `showCloseButton` is set, the Zone injects `ButtonImageClose`. Zones are bare by default — wrap panel content in `<Background>` for theme body fill and border. Leave Background off for controls that bring their own visuals (e.g. a toggle `ButtonText`).

## Component prop forwarding

Custom components built on `UiBox` must accept and forward native overrides so callers can escape-hatch anything the shorthand API does not cover:

- Type as `UiBoxProps` (or `Omit<SpinnerProps, …>` / similar) — not a hand-rolled subset
- Destructure known shorthands, then `...props`
- Merge `uiTransform` / `uiBackground` / `uiText` as `defaults → …overrides` (overrides last)

```tsx
export type MyThingProps = Omit<UiBoxProps, 'uiText'> & { value?: string }

export function MyThing({ value, uiTransform, uiBackground, uiText, ...props }: MyThingProps) {
	return (
		<UiBox
			{...props}
			uiTransform={{ width: 'auto', ...uiTransform }}
			uiBackground={{ color: theme.colors.body, ...uiBackground }}
			uiText={{ value: value ?? '', ...uiText }}
		/>
	)
}
```

## Background

```tsx
<Background
	backgroundColor = {theme.colors.primary}
	borderRadius    = {8}
	textureSrc      = "assets/images/panel.png"
>
	{children}
</Background>
```

Defaults: fills parent via absolute insets, theme body fill, theme border width/radius, no padding.

## Texture atlases & UV helpers

Bundled sheets live as `TextureAtlas` instances under `src/scaling-ui/atlases/` (`atlasIcons`, `atlasBtnIconsStyled`, `atlasSpinners`, `atlasCharsNumbers`, …). Prefer those over hard-coded paths and repeated `xTotal` / `yTotal`. Project sheets: start from `assets/images/scaling-ui-assets.af`, export to `assets/images/my-theme/`, declare atlases in `src/myTheme.ts`.

**Always use** `TextureAtlas` or `getUVCell` / `getUVColumn` / `getUVRow`. Cell / column / row numbers are **1-based inclusive**; totals are counts.

```tsx
import { atlasIcons, atlasCharsNumbers } from '../../atlases'

atlasIcons.source
atlasIcons.cell({ xStart: 1, yStart: 1 })           // first cell
atlasIcons.cell({ xStart: 1, xEnd: 2, yStart: 4 })  // columns 1–2, top row of a 4×4
atlasIcons.row(1)                                   // full bottom row
atlasIcons.column(1)                                // full first column
atlasCharsNumbers.char('5', { insetX: 0.15 })
```

`ProgressBarImage` uses separate full textures (background / fill / border) with `nine-slices` — not an atlas — and picks horizontal vs vertical sets from `fillFrom` / `orientation`.

Low-level UV helpers stay in `utils/uvs.tsx` for one-off / non-atlas cases (same 1-based rules).

Full guides: root `README.md` → Custom textures / Buttons / Progress bars / Icons. When onboarding a user onto custom art, also follow **Custom textures / atlases (agent checklist)** above.

## Data / keys / style

- Live values on `this.props` (`PropsController`) — see `timer.layer.tsx`
- Sibling `key`s unique among siblings; `ButtonImage` / `ButtonText` `id`s unique among concurrent buttons
- `console.error` over `throw`; tabs; MARK comments; relative imports inside `scaling-ui/`

## More examples

See [examples.md](examples.md) and `src/scaling-ui/examples/layers/`.
