# Decentraland Scaling UI

`dcl-scaling-ui` is a reusable UI framework for Decentraland SDK7. Build interfaces from **layers**, **zones**, and shared components instead of hand-placing every `UiEntity`.

> **Custom images / atlases:** whenever you need your own textures, start from the bundled Affinity template at [`assets/images/scaling-ui-assets.af`](assets/images/scaling-ui-assets.af). Open it in Affinity, duplicate the existing artboards (buttons, icons, numbers, spinners, progress bars, …), keep the same grid / margins, export PNGs into `assets/images/example-theme/`, then declare them as `TextureAtlas` / texture sets in [`src/exampleTheme/`](src/exampleTheme/). Always sample cells with the built-in UV helpers (`getUVCell` / `getUVColumn` / `getUVRow`) or `TextureAtlas.cell` / `.row` / `.column` / `.char` — cell coordinates are **1-based** (first column/row is `1`, not `0`). See [Custom textures](#custom-textures) below.

## Table of contents

- [Building blocks](#building-blocks)
- [Quick start](#quick-start)
- [Layers](#layers)
	- [Adding a layer](#adding-a-layer)
	- [Hideable popup example](#hideable-popup-example)
- [Zones](#zones)
- [Layout helpers](#layout-helpers)
- [Custom textures](#custom-textures)
	- [Affinity template](#affinity-template-start-here)
	- [Declaring atlases in exampleTheme](#declaring-atlases-in-exampletheme)
	- [UV helpers (1-based)](#uv-helpers-1-based)
- [Component reference](#component-reference)
	- [Setup / core](#setup--core)
	- [Base](#base)
	- [Layout & chrome](#layout--chrome)
	- [Buttons](#buttons)
	- [Progress bars](#progress-bars)
	- [Text](#text)
	- [Icons](#icons)
	- [Spinners](#spinners)
	- [Animations](#animations)
	- [Theme & utilities](#theme--utilities)
- [Project layout](#project-layout)
- [Agent guidance](#agent-guidance)

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Independent UI surface (HUD, popup, menu). Extends the `Layer` class; owns one zone + optional show/hide. |
| **Zone** | Predefined layout slot (`Default`, `Top`, `BottomRight`, …) on the virtual canvas. Device hardware insets are handled once by `ScreenInsetArea` inside `SetupScalingUI`. |
| **Layout** | `Row`, `Column`, `Background`, `BackgroundGradient`, and related helpers for arranging children. |
| **Components** | Shared controls: `UiBox`, buttons, progress bars, text, icons, spinners, animations (many ship as procedural + image-based variants). |
| **Theme** | Central colours / type / sizing via `SetupScalingUI({ theme })`. Custom atlases / textures live beside overrides in `src/exampleTheme/`. |

## Quick start

```tsx
import { themeOverrides } from './exampleTheme'
import { SetupScalingUI } from './scaling-ui'
import { demoLayers } from './scaling-ui/examples/layers'

export function main() {
	SetupScalingUI({
		theme : themeOverrides,
		layers: demoLayers,
	})
}
```

Theme overrides stay small — only change what differs from `defaultTheme` in `src/scaling-ui/styles/theme.ts`. See the demo layers under `src/scaling-ui/examples/layers/` for working samples of every major component family.

## Layers

A **Layer** is a class-based UI surface. Rules:

1. **One Layer = one Zone.** Choose the slot with `zone: ZoneType.*`.
2. Implement **`body()` only.** Base `Layer.render()` mounts the `Zone` for you.
3. Size / align with **`uiTransform`** / **`uiBackground`** on the layer options (forwarded to the Zone). Do not add Layer shorthand props like `backgroundColor` or `borderRadius`.
4. Panel chrome belongs inside `body()` via **`<Background>`** (or `BackgroundGradient`).
5. Register an instance in the `layers` array passed to `SetupScalingUI`.

Optional Layer options: `canBeHidden`, `startHidden`, `showCloseButton`, `showFrom`, `hideTo`, `zIndex`. Hideable layers expose `show()` / `hide()` / `toggle()`. `showFrom` / `hideTo` set independent slide-in / slide-out edges (default: zone preset for both). Live values belong on `this.props` (`PropsController`) — see `timer.layer.tsx`.

### Adding a layer

```tsx
import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Header, Layer, Row, UiBox, ZoneType } from '../scaling-ui'

export class ScoreboardLayer extends Layer {
	constructor() {
		super({
			id  : 'scoreboard',
			zone: ZoneType.Top,
			uiTransform: {
				width : '30vw',
				height: '10vw',
			},
		})
	}

	protected body() {
		return (
			<Background>
				<Row>
					<Header key="score-title" value="Score" />
					<UiBox
						key="score-value"
						uiText={{ value: '12' }}
					/>
				</Row>
			</Background>
		)
	}
}

export const scoreboardLayer = new ScoreboardLayer()
```

### Hideable popup example

`canBeHidden` enables `show()` / `hide()` / `toggle()`. `showCloseButton` auto-injects `ButtonImageClose`. `startHidden` begins the layer off-screen. Use `showFrom` / `hideTo` when enter and exit should use different edges.

```tsx
import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Column, Header, Layer, UiBox, ZoneType } from '../scaling-ui'

export class NotificationLayer extends Layer {
	constructor() {
		super({
			id             : 'notification',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			showFrom       : 'bottom',
			hideTo         : 'top',
		})
	}

	protected body() {
		return (
			<Background>
				<Column>
					<Header key="note-title" value="Quest complete" />
					<UiBox
						key="note-body"
						uiText={{ value: 'You earned 50 XP.' }}
					/>
				</Column>
			</Background>
		)
	}
}

export const notificationLayer = new NotificationLayer()
```

```tsx
SetupScalingUI({
	theme : themeOverrides,
	layers: [notificationLayer],
})

// later…
notificationLayer.show()
```

### Toasts

Ephemeral notifications use an always-mounted `toastHostLayer` (include it in `SetupScalingUI({ layers })`), then `showToast` / `hideToast` / `clearToastGroup`.

```tsx
import { showToast, toastHostLayer } from './scaling-ui'

SetupScalingUI({
	layers: [/* … */, toastHostLayer],
})

showToast({
	position     : 'top',
	duration     : 2.5,
	isDismissable: true,
	showFrom     : 'bottom',
	hideTo       : 'top',
	content      : () => <Text value="Quest updated" />,
	width        : 200,
	height       : 48,
	group        : 'hints',       // optional
	groupPolicy  : 'queue',       // stack | queue | replace
})
```

Docks: `top` / `bottom` / `topLeft` / `topRight` / `bottomLeft` / `bottomRight` (inset by the bar zones). Scale via `scaleIn` / `scaleOut` / `scalePulse` on the toast root (prefer `%` children). Demo: `demo.toasts.layer.tsx`.

## Zones

Zones are preset layout slots on the virtual canvas. Layers pick one via `zone: ZoneType.*`. Named helpers (`ZoneTop`, `ZoneBottomRight`, …) wrap the same presets when you need a zone outside a `Layer`.

| `ZoneType` | Typical use |
|---|---|
| `Default` | Centered modal / panel |
| `FullScreen` | Full canvas overlay (also the Layer constructor default) |
| `InteractableArea` | Fits the explorer interactable area |
| `Top` / `Bottom` / `Left` / `Right` | Edge chrome / toasts |
| `TopLeft` / `TopRight` / `BottomLeft` / `BottomRight` | Corner HUD slots |
| `None` | Raw content (no zone wrapper) |

Zone merges transforms as: **flex defaults → zone preset → `uiTransform` overrides**.

Do **not** remount `ScreenInsetArea`, `ZoneRoot`, or `Zone` inside a layer’s `render()` — `SetupScalingUI` owns the inset canvas, and `Layer.render()` already mounts the zone.

## Layout helpers

Compose content inside `body()` with flex helpers and chrome wrappers:

| Helper | Role |
|---|---|
| `Row` / `RowReverse` | Horizontal flex (or reverse) |
| `Column` / `ColumnReverse` | Vertical flex (or reverse) |
| `Background` | Full-size panel chrome (theme fill + border; optional `textureSrc`) |
| `BackgroundGradient` | Same chrome idea with a directional gradient texture |
| `Divider` | Thin horizontal rule between sections |
| `Label` | Short labelled chip / callout |

Prefer these over raw `UiEntity` nesting. Override size, padding, and flex via `uiTransform`; colours / textures via shorthand props or `uiBackground`.

## Custom textures

Several controls ship in two flavours:

| Kind | Meaning |
|---|---|
| **Procedural** | Drawn with colours / theme values — no texture files required |
| **Image-based** | Uses PNG textures (or a texture atlas). Always overridable |

When a component family has both, the docs mark it with:

> **Variants:** procedural (`Foo`) · image-based (`FooImage`)

### Affinity template (start here)

The project ships a full Affinity source file with every default atlas and progress-bar artboard:

**[`assets/images/scaling-ui-assets.af`](assets/images/scaling-ui-assets.af)**

Use it as the starting point for custom art:

1. Open the `.af` file in Affinity.
2. Duplicate the artboard closest to what you need (button icons, icons, numbers, spinners, progress bars, …).
3. Keep the same cell grid, guidelines, and margins so UV sampling stays aligned.
4. Export PNGs into **`assets/images/example-theme/`** (not into `assets/images/scaling-ui/`, which holds framework defaults).
5. Declare a `TextureAtlas` (or progress-bar texture set) in **`src/exampleTheme/`** — see the examples already in that folder.
6. Import your atlas from layers and sample cells with `TextureAtlas` / UV helpers (below).

**Icon cell sizing (rotation / animation):** if icons will rotate or wiggle inside their UV cell, the glyph’s longest axis must stay within about **0.707 × cell size** (`1 / √2`). That is the largest square that still fits inside the cell when spun. Also leave a few pixels for shadows/glows (e.g. on a **128px** cell with ~6px shadow budget, use a max axis of **~86px**, centered). Filling the whole cell looks fine when static, but animated icons will clip into neighbouring cells.

### Declaring atlases in `exampleTheme`

```tsx
// src/exampleTheme/atlases.ts — see the folder for full examples
import { TextureAtlas } from '../scaling-ui'
import type { ProgressBarImageTextures } from '../scaling-ui'

export const exampleBtnIconsAtlas = new TextureAtlas({
	source : 'assets/images/example-theme/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 }, // 1-based cell coords
		help : { xStart: 2, yStart: 4 },
	},
})

export const exampleProgressBarTexturesHorizontal: ProgressBarImageTextures = {
	background: 'assets/images/example-theme/progressBar-horizontal-background.png',
	fill      : 'assets/images/example-theme/progressBar-horizontal-fill.png',
	border    : 'assets/images/example-theme/progressBar-horizontal-border.png',
}
```

Bundled framework atlases live as `TextureAtlas` instances under `src/scaling-ui/atlases/`:

| Atlas | Use |
|---|---|
| `atlasIconsFontAwesome` | Font Awesome solid UI icons (16×16, 128px cells, ~86px max glyph) — default `Icon` `src` |
| `atlasBtnIcons` / `atlasBtnIconsStyled` | Button variants × states |
| `atlasSpinners` | Spinner cells (2×2) |
| `atlasCharsNumbers` | Digits / operators for `IconNumber` |
| `atlasCharsSymbols` | Symbol glyphs |
| `atlasCharsAlphaNumeric` | Alphanumeric sheet (8×8) |

Project example: `exampleIconsAtlas` in `src/exampleTheme/` (4×4 sheet at `assets/images/example-theme/atlas-icons.png`). Prefer framework atlases (or your own `TextureAtlas`) over hard-coded paths and repeated `xTotal` / `yTotal`.

### UV helpers (1-based)

Always use `getUVCell` / `getUVColumn` / `getUVRow`, or the matching `TextureAtlas` methods. **Cell / column / row numbers start at `1`.** Totals (`columns`, `rows`, `xTotal`, `yTotal`) are counts. Ends (`xEnd` / `yEnd`) are inclusive.

```tsx
import { atlasCharsNumbers, atlasIconsFontAwesome } from './scaling-ui'

atlasIconsFontAwesome.source
atlasIconsFontAwesome.uv.star                        // named cell UV quad
atlasIconsFontAwesome.cell({ xStart: 1, yStart: 1 }) // first cell (bottom-left in UV space)
atlasIconsFontAwesome.row(1)                         // full bottom row
atlasIconsFontAwesome.column(1)                      // full first column
atlasCharsNumbers.char('5', { insetX: 0.15 })
```

---

## Component reference

Prefer these components over raw `UiEntity` layout. Import from `./scaling-ui` (or relative paths inside the package).

### Setup / core

#### `SetupScalingUI`
Mounts the Scaling UI renderer (theme + layers) inside the device-safe `ScreenInsetArea`. Optional `debug.showDesktopSafeZones` / `debug.showMobileSafeZones` append overlay layers.

#### `Layer`
Class-based UI surface that owns one zone and optional show/hide chrome; implement `body()` only. See [Layers](#layers).

#### `Zone` / named zones (`ZoneTop`, `ZoneDefault`, …)
Preset layout slot that positions a layer (or free content) on the virtual canvas.

#### `ZoneRoot`
Root stack that hosts zones; normally owned by `SetupScalingUI`, not remounted in layer `render()`.

#### `ZoneType`
Enum of zone presets (`Default`, `Top`, `BottomRight`, `InteractableArea`, …) passed on `LayerOptions.zone`.

#### `VisibilityController`
Show / hide / off-screen travel for hideable layers (created per zone via `createVisibilityForZone`).

#### `PropsController`
Per-instance reactive props bag used by layers and some controls (e.g. `ButtonImage` scale, timer values).

#### `TextureAtlas`
Describes a texture grid (`source`, `columns`, `rows`, optional `layout` / `named` / `inset`). Use `.cell` / `.row` / `.column` / `.char` instead of repeating totals at every call site. Named regions: **`atlas.named.<name>`** = cell options (for `uvCell` / `.cell()`); **`atlas.uv.<name>`** = precomputed UV quad (for `uvs` props).

---

### Base

#### `UiBox`
Primary layout primitive — a themed `UiEntity` wrapper with optional fill/border shorthand props (`backgroundColor`, `borderRadius`, …) plus full `uiTransform` / `uiBackground` / `uiText` forwarding.

---

### Layout & chrome

#### `Row` / `RowReverse`
Horizontal flex containers for arranging children side by side (`row-reverse` for the reverse variant). Prefer **`cols`** for width (12-column grid; `cols={12}` = `100%`). Omit `cols` only when shrink-to-content (`auto`) is intended.

#### `Column` / `ColumnReverse`
Vertical flex containers for stacking children. Same **`cols`** grid as `Row` (`cols={12}` = full width). A parent that hosts nested `cols={…}` children must itself have a definite width (usually `cols={12}`), or percentage spans collapse.

#### `Background`
Full-size panel chrome: fills the parent edge-to-edge with theme body fill and border by default. Shorthands: `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`, `textureSrc`.

```tsx
<Background backgroundColor={theme.colors.primary} borderRadius={8}>
	{/* panel content */}
</Background>
```

#### `BackgroundGradient`
Same idea as `Background`, filled with a directional gradient texture. Props: `direction` (`top` / `bottom` / `left` / `right`), `gradientStart` / `gradientEnd` (0–1 UV ratios), `color`, `textureSrc`.

#### `Divider`
Thin horizontal rule used to separate sections within a panel.

#### `Label`
Short labelled chip / callout with a primary fill and optional nested content.

---

### Buttons

> **Variants:** procedural (`ButtonText`) · image-based (`ButtonImage` / `ButtonImageClose`)

#### `ButtonText` (procedural)
Clickable text control with hover colour styling — use when there is no dedicated button atlas. Colours come from the theme (or `backgroundColor`).

```tsx
<ButtonText
	id        = "btn_open"
	textLabel = "Open"
	callback  = {() => myLayer.show()}
/>
```

#### `ButtonImage` (image-based)
Atlas / texture button with hover and press states. Atlas layout: **columns = button variants**, **rows = states** (disabled → default, UV bottom→top). Pass a unique `id`, `uvColumn`, and `callback`.

```tsx
import { atlasBtnIconsStyled } from './scaling-ui'

<ButtonImage
	id         = "btn_help"
	textureSrc = {atlasBtnIconsStyled.source}
	uvColumn   = {1}
	callback   = {() => helpLayer.toggle()}
/>
```

`uvColumn` is **1-based** (first button variant is `1`).

##### Using your own button textures

1. Duplicate the button artboard in `assets/images/scaling-ui-assets.af`, then export to `assets/images/example-theme/atlas-btn-icons.png` (same column/row convention).
2. Define a `TextureAtlas` in `src/exampleTheme/` (see `exampleBtnIconsAtlas`).
3. Pass `textureSrc`, `uvColumnCount`, and `uvRowCount` so UVs match your grid:

```tsx
import { exampleBtnIconsAtlas } from '../exampleTheme'

<ButtonImage
	id            = "btn_custom"
	textureSrc    = {exampleBtnIconsAtlas.source}
	uvColumn      = {1}
	uvColumnCount = {exampleBtnIconsAtlas.columns}
	uvRowCount    = {exampleBtnIconsAtlas.rows}
	callback      = {() => { /* … */ }}
/>
```

#### `ButtonImageClose`
Shared close-button image control (default atlas column `1`). Usually injected via `showCloseButton` on a layer. Override `textureSrc` / `uvColumn` / grid counts the same way as `ButtonImage` when using a custom close glyph.

---

### Progress bars

> **Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`)

Both share the same value API: `id`, `value`, optional `minValue` / `maxValue`, `fillFrom` (`'left'` | `'right'` | `'top'` | `'bottom'`), and a per-`id` lerp when the value changes. `ProgressBarImage` also accepts the same colour / border props as `ProgressBar`.

#### `ProgressBar` (procedural)
Colour layers — background (track) → fill → border.

Defaults when colours are omitted: **fill** = `primary`, **background** = `dark`, **border** = `secondary`. **Border radius** defaults to half the shortest measurable axis (pill shape).

```tsx
<ProgressBar
	id        = "hp"
	value     = {72}
	fillColor = {theme.colors.danger}
	height    = {24}
/>
```

Children render centred on top of the bar (e.g. a percentage `Label`).

#### `ProgressBarImage` (image / hybrid)
One component for full image bars, partial textures, and atlas fills. Textures are **optional per layer** via `textures: { background?, fill?, border? }`; atlas fills use `atlas` + `uvCell` (stretch, no tint):

- Omit `textures` and `atlas` → built-in full nine-slice set (horizontal / vertical from `fillFrom` / `orientation`)
- Partial `textures` → missing layers fall back to procedural colours (e.g. image fill + procedural border)
- `atlas` alone → gradient-atlas fill + procedural track / border (default cell: cols 4–5, UV row 11, `insetY: 0.4` on `atlasGradientColors`)

```tsx
import { atlasGradientColors } from './scaling-ui'

{/* Full built-in textures */}
<ProgressBarImage id="xp" value={55} height={64} />

{/* Image fill + procedural track / border */}
<ProgressBarImage
	id       = "xp_hybrid"
	value    = {60}
	height   = {32}
	textures = {{ fill: 'assets/images/scaling-ui/progressBar-horizontal-fill.png' }}
/>

{/* Atlas fill + procedural track / border; uvCropWithFill reveals the gradient */}
<ProgressBarImage
	id             = "xp_grad"
	value          = {65}
	height         = {24}
	atlas          = {atlasGradientColors}
	uvCell         = {atlasGradientColors.named.yellowOrange}
	uvCropWithFill = {true}
/>
```

`uvCropWithFill` crops the trailing UV edge opposite `fillFrom` to `1 - fillRatio` so the atlas sample is revealed with the bar instead of stretched. With `uvMirror` / `uvFlip`, that crop axis is swapped so the inset still matches the fill origin after the transform. You can also pass `insetLeft` / `insetRight` / `insetTop` / `insetBottom` on `uvCell` yourself (fractions of the selected region, 0–1).

Atlas UV orientation: `uvMirror` flips left ↔ right; `uvFlip` flips UV bottom ↔ top. Use `uvMirror` with `fillFrom="right"` (and `uvFlip` with top/bottom) when the gradient should lead from the origin edge.


**Nine-slice sizing:** Decentraland only exposes `textureMode: 'nine-slices'` and `textureSlices` (fractions of the texture, 0–1). There is **no per-element scale factor** for the corner/edge slices (unlike some engines). Corners keep their absolute size from `texture size × slice fraction` — e.g. a 512×128 sheet with `top`/`bottom` ≈ 0.25 yields ~32px-tall corners, so a horizontal bar shorter than ~64px (top + bottom) will distort. Design textures (and their corner radii) for the **smallest size** you intend to display, or keep bars at least as tall/wide as `2 × corner size` on the constrained axis. Atlas fills use `stretch` + UVs instead and are not nine-sliced.

##### Using your own progress-bar textures

1. Duplicate the progress-bar artboards in `assets/images/scaling-ui-assets.af`, then export PNGs per orientation into `assets/images/example-theme/` (any subset of background / fill / border). Design image layers to align edge-to-edge and for your intended display sizes (see nine-slice note above). Default `textureSlices`: horizontal ~25% top/bottom and ~6% left/right; vertical swaps those pairs. Override with `textureSlices` when needed. For gradient fills, sample from a colour atlas via `atlas` / `uvCell` instead.
2. Define a `ProgressBarImageTextures` object in `src/exampleTheme/` (see `exampleProgressBarTexturesHorizontal` / `exampleProgressBarTexturesVertical`). Partial objects are fine.
3. Pass `textures` and/or `atlas` (and `orientation` when needed):

```tsx
import { exampleProgressBarTexturesHorizontal } from '../exampleTheme'

<ProgressBarImage
	id          = "xp_custom"
	value       = {70}
	orientation = "horizontal"
	textures    = {exampleProgressBarTexturesHorizontal}
	height      = {64}
/>
```

---

### Text

Typography components wrap theme sizes with `scaleFontSize` at render time. Pass copy via `value` (or `uiText.value`).

| Component | Role |
|---|---|
| `Text` | Default body text |
| `Code` | Monospace / code-style text |
| `Header` | Simple panel title line (h2-sized) for layer headers |
| `SectionHeader` | Section title within a panel body |
| `H1` … `H6` | Heading levels matching theme size / font family |

```tsx
<H2 value="Settings" />
<Text value="Choose a difficulty." />
<Code value="score = 42" />
```

---

### Icons

> **Variants:** image-based (`Icon`, `IconNumber`) · avatar portrait (`AvatarIcon`)

#### `Icon`
Single texture / atlas-cell icon sized from the theme (or explicit width/height). `src` defaults to `atlasIconsFontAwesome.source`; pass optional `uvs` from that atlas (or override `src` for a custom sheet).

```tsx
import { atlasIconsFontAwesome } from './scaling-ui'

<Icon uvs={atlasIconsFontAwesome.uv.cat} width={64} height={64} />
```

Cell coordinates are **1-based** (`1` = first column / bottom UV row).

##### Using your own icon textures

1. Duplicate an icons artboard in `assets/images/scaling-ui-assets.af`, then export to `assets/images/example-theme/atlas-icons.png` (a sample 4×4 sheet ships there).
2. Keep each glyph **centered** in its cell. For rotatable / animated icons, max axis ≈ **0.707 × cellSize** (minus any shadow budget — e.g. **86px** on a 128px cell). See [Affinity template](#affinity-template-start-here).
3. Declare a `TextureAtlas` in `src/exampleTheme/` (see `exampleIconsAtlas`).
4. Pass `src` + `uvs`:

```tsx
import { exampleIconsAtlas } from '../exampleTheme'

<Icon
	src = {exampleIconsAtlas.source}
	uvs = {exampleIconsAtlas.uv.coins}
/>
```

The bundled `atlasIconsFontAwesome` sheet is a 16×16 / 128px-cell atlas built with that margin rule (default `Icon` source).

#### `AvatarIcon`
Player portrait via Decentraland `uiBackground.avatarTexture`. Same sizing props as `Icon` (`width` / `height`); defaults to a square from `theme.icons.defaultSize`. `userId` is lowercased before use; omit it to fall back to `DEFAULT_AVATAR_USER_ID` (handy in demos).

```tsx
import { AvatarIcon, DEFAULT_AVATAR_USER_ID } from './scaling-ui'

<AvatarIcon userId={DEFAULT_AVATAR_USER_ID} width={32} height={32} />
```

#### `IconNumber`
Renders a number or short math string as atlas glyphs (not SDK text). Defaults to `atlasCharsNumbers`; override with `atlas`.

```tsx
<IconNumber value={42} />
<IconNumber value="+12" />
<IconNumber value="3×4=" />
```

**Supported glyphs** (from `atlasCharsNumbers.layout`; punctuation falls back to `atlasCharsSymbols`):

| Characters | Notes |
|---|---|
| `0`–`9` | Digits |
| `/` `+` `-` | Operators |
| `×` `*` `x` | Multiply — `*` and `x` alias to the `×` cell |
| `,` `:` | Thousands separator and colon (time separator) |
| `=` `$` `%` … | Via `atlasCharsSymbols` fallback |

Numbers atlas grid (top → bottom as in the PNG):

```
/ + - ×
8 9 , :
4 5 6 7
0 1 2 3
```

Symbols atlas grid (top → bottom as in the PNG):

```
- ' " ;
( ) ! ?
& % @ #
÷ = $ _
```

##### Using your own number atlas

1. Export a glyph sheet to `assets/images/example-theme/atlas-chars-numbers.png` with the same cell layout (or update `layout` / `aliases` to match).
2. Define a `TextureAtlas` with `layout` in `src/exampleTheme/` (see `exampleNumbersAtlas`).
3. Pass it as `atlas`:

```tsx
import { exampleNumbersAtlas } from '../exampleTheme'

<IconNumber value={42} atlas={exampleNumbersAtlas} />
```

##### Changing the built-in number font

The default glyphs are vector art in Affinity, not a runtime font:

1. Open `assets/images/scaling-ui-assets.af`.
2. Select the artboard named **Atlas numbers**.
3. Select all number/operator glyphs on that artboard.
4. Change the font as needed — **keep the fill white** so the game can tint the texture at runtime.
5. Keep each glyph inside the grid guidelines / margins on the artboard so UV cells still line up.
6. Re-export the numbers texture to `assets/images/scaling-ui/atlas-chars-numbers.png` (overwrite the existing file).

---

### Spinners

> **Variants:** image-based — rotating texture presets built on shared `Spinner`.

#### `Spinner`
Low-level rotating image control. Requires `textureSrc`; optional `uvs`, `speed` (deg/sec), `interval` (pause between revolutions), `easingFunction`.

#### Presets

| Component | Source |
|---|---|
| `SpinnerCircle` | `atlasSpinners.uv.circle` |
| `SpinnerDots` | `atlasSpinners.uv.dots` |
| `SpinnerHourglass` | `atlasSpinners.uv.hourglass` |
| `SpinnerThreeQuarterCircle` | `atlasSpinners.uv.threeQuarterCircle` |
| `SpinnerBeamsEven` | `spinner-beams-even.png` |
| `SpinnerBeamsVaried` | `spinner-beams-varied.png` |

```tsx
<SpinnerCircle width={48} height={48} speed={180} />
<SpinnerDots width={48} height={48} />
```

For a custom sheet, use `Spinner` with `textureSrc` + `uvs` from your `TextureAtlas` (declare in `src/exampleTheme/`).

---

### Animations

Motion wrappers that animate a **single child** (child must expose numeric `width` / `height`). Shared knobs: `speed`, `burstCount`, `burstInterval`, plus per-effect easing / offset options (theme defaults apply).

| Component | Effect |
|---|---|
| `Bounce` | Animates `position.top` up/down |
| `Pulse` | Scales grow/shrink |
| `Shake` | Animates `position.left` left/right |
| `Wiggle` | Rotates the child’s UVs around the cell centre |
| `FlashColor` | Lerps the child’s tint toward `color` and back |

```tsx
import { Bounce, Icon, atlasIconsFontAwesome } from './scaling-ui'

<Bounce speed={0.6}>
	<Icon
		uvs    = {atlasIconsFontAwesome.uv.star}
		width  = {48}
		height = {48}
	/>
</Bounce>
```

See `demo.animations.layer.tsx` for every preset side by side.

---

### Theme & utilities

#### `getTheme` / `buildTheme` / `defaultTheme` / `setTheme` / `theme`
Read or customize the active Scaling UI theme (colours, type sizes, animation defaults, icon sizing). Pass overrides into `SetupScalingUI({ theme })` or keep them in `src/exampleTheme/`.

#### `darken` / `lighten` / `alpha`
Small colour utilities used by buttons and chrome.

#### `getUVCell` / `getUVColumn` / `getUVRow`
Low-level atlas UV helpers (**1-based** cell coords). Prefer `TextureAtlas` methods when you already have an atlas instance. Also: `getRotatedUVs`, `rotateUvIndexes`.

#### `resolveAspectDimensions` / `sizeValueToPixels`
Aspect-aware size resolution for controls that need numeric width/height pairs.

#### `vwToPixels` / `vhToPixels` / canvas helpers
Numeric math against the **virtual** canvas (clamping, off-screen travel). Prefer native `'30vw'` / `'10vh'` strings in `uiTransform` when you do not need arithmetic.

#### `tweenValue` / `lerp` / `easingFunctions`
Shared animation easing used by buttons, progress bars, and motion wrappers.

---

## Project layout

```
assets/images/scaling-ui-assets.af   Affinity template for all default UI art
assets/images/scaling-ui/            framework default textures / atlases
assets/images/example-theme/              project-specific textures (recommended)
src/scaling-ui/                      framework (import from here)
src/scaling-ui/atlases/              bundled TextureAtlas instances
src/scaling-ui/components/           UiBox, layers, zones, buttons, …
src/scaling-ui/utils/uvs.tsx         getUVCell / getUVColumn / getUVRow (1-based)
src/scaling-ui/examples/             demo layers for the sample scene
src/exampleTheme/                         theme overrides + custom atlases / textures
.cursor/skills/                      agent skills for this framework
.cursor/rules/                       agent rules when editing UI
```

## Agent guidance

When creating or changing Scaling UI interfaces, follow:

- `.cursor/skills/scaling-ui/SKILL.md`
- `.cursor/rules/scaling-ui.mdc`
- `.cursor/rules/scaling-ui-keys.mdc`
- `.cursor/rules/relative-imports.mdc`
