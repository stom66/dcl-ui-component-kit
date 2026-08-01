# Decentraland Scaling UI

`dcl-scaling-ui` is a reusable UI framework for Decentraland SDK7. Build interfaces from **layers**, **zones**, and shared components instead of hand-placing every `UiEntity`.

> **Custom images / atlases:** whenever you need your own textures, start from the bundled Affinity template at [`assets/images/scaling-ui-assets.af`](assets/images/scaling-ui-assets.af). Open it in Affinity, duplicate the existing artboards (buttons, icons, numbers, spinners, progress bars, …), keep the same grid / margins, export PNGs into `assets/images/my-theme/`, then declare them as `TextureAtlas` / texture sets in [`src/myTheme.ts`](src/myTheme.ts). Always sample cells with the built-in UV helpers (`getUVCell` / `getUVColumn` / `getUVRow`) or `TextureAtlas.cell` / `.row` / `.column` / `.char` — cell coordinates are **1-based** (first column/row is `1`, not `0`). See [Custom textures](#custom-textures) below.

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Independent UI surface (HUD, popup, menu). Extends the `Layer` class; owns zone + optional show/hide. |
| **Zone** | Predefined layout slot (`Default`, `Top`, `BottomRight`, …) for scene UI chrome. Device hardware insets are handled once by `ScreenInsetArea` inside `SetupScalingUI`. |
| **Layout** | `Row`, `Column`, `Background`, and related helpers for arranging children. |
| **Components** | Shared controls: `UiBox`, buttons, progress bars, icons, etc. (many ship as procedural + image-based variants). |
| **Theme** | Central colours / type / sizing via `SetupScalingUI({ theme })`. Custom atlases / textures live beside overrides in `src/myTheme.ts`. |

## Quick start

```tsx
import { themeOverrides } from './myTheme'
import { SetupScalingUI } from './scaling-ui'
import { demoLayers } from './scaling-ui/examples/layers'

export function main() {
 SetupScalingUI({
  theme : themeOverrides,
  layers: demoLayers,
 })
}
```

Theme overrides stay small — only change what differs from `defaultTheme` in `src/scaling-ui/styles/theme.ts`.

## Adding a layer

Layers are **classes**, not JSX wrappers. Extend `Layer`, implement `body()`, and register an instance in the `layers` array.

```tsx
import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Header, Layer, Row, UiBox, ZoneType } from '../scaling-ui'

export class ScoreboardLayer extends Layer {
 constructor() {
  super({
   id  : 'scoreboard',
   zone: ZoneType.Top,
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

## Example: popup notification

Use a hideable layer. `canBeHidden` enables `show()` / `hide()` / `toggle()`. Set `showCloseButton` to auto-inject the close control. `startHidden` begins the layer off-screen. Wrap panel content in `Background` for fill and border.

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

Mount it, then open it from gameplay code:

```tsx
SetupScalingUI({
 theme : themeOverrides,
 layers: [notificationLayer],
})

// later…
notificationLayer.show()
```

## Zone presets

| `ZoneType` | Typical use |
|---|---|
| `Default` | Centered modal / panel |
| `FullScreen` | Full canvas overlay |
| `Top` / `Bottom` / `Left` / `Right` | Edge chrome / toasts |
| `TopLeft` / `TopRight` / `BottomLeft` / `BottomRight` | Corner HUD slots |
| `None` | Raw content (no zone wrapper) |

Named helpers (`ZoneTop`, `ZoneBottomRight`, …) wrap the same presets when you need a zone outside a `Layer`.

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
4. Export PNGs into **`assets/images/my-theme/`** (not into `assets/images/scaling-ui/`, which holds framework defaults).
5. Declare a `TextureAtlas` (or progress-bar texture set) in **`src/myTheme.ts`** — see the examples already in that file.
6. Import your atlas from layers and sample cells with `TextureAtlas` / UV helpers (below).

### Declaring atlases in `myTheme.ts`

```tsx
// src/myTheme.ts — see the file for full examples
import { TextureAtlas } from './scaling-ui'
import type { ProgressBarImageTextures } from './scaling-ui'

export const myBtnIconsAtlas = new TextureAtlas({
	source : 'assets/images/my-theme/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 }, // 1-based cell coords
		help : { xStart: 2, yStart: 4 },
	},
})

export const myProgressBarTexturesHorizontal: ProgressBarImageTextures = {
	background: 'assets/images/my-theme/progressBar-horizontal-background.png',
	fill      : 'assets/images/my-theme/progressBar-horizontal-fill.png',
	border    : 'assets/images/my-theme/progressBar-horizontal-border.png',
}
```

Bundled framework atlases live as `TextureAtlas` instances under `src/scaling-ui/atlases/` (`atlasIcons`, `atlasBtnIconsStyled`, `atlasCharsNumbers`, …). Prefer those (or your own `TextureAtlas`) over hard-coded paths and repeated `xTotal` / `yTotal`.

### UV helpers (1-based)

Always use `getUVCell` / `getUVColumn` / `getUVRow` from `scaling-ui` utils, or the matching `TextureAtlas` methods. **Cell / column / row numbers start at `1`.** Totals (`columns`, `rows`, `xTotal`, `yTotal`) are counts.

```tsx
import { atlasIcons } from './scaling-ui'

atlasIcons.source
atlasIcons.cell({ xStart: 1, yStart: 1 })           // first cell (bottom-left in UV space)
atlasIcons.cell({ xStart: 1, xEnd: 2, yStart: 4 })  // columns 1–2 on the top row of a 4×4
atlasIcons.row(1)                                   // full bottom row
atlasIcons.column(1)                                // full first column
atlasCharsNumbers.char('5', { insetX: 0.15 })
```

---

## Component reference

Prefer these components over raw `UiEntity` layout.

### Setup / core

#### `SetupScalingUI`
Mounts the Scaling UI renderer (theme + layers) inside the device-safe `ScreenInsetArea`.

#### `Layer`
Class-based UI surface that owns one zone and optional show/hide chrome; implement `body()` only.

#### `Zone` / named zones (`ZoneTop`, `ZoneDefault`, …)
Preset layout slot that positions a layer (or free content) on the virtual canvas.

#### `ZoneRoot`
Root stack that hosts zones; normally owned by `SetupScalingUI`, not remounted in layer `render()`.

#### `ZoneType`
Enum of zone presets (`Default`, `Top`, `BottomRight`, …) passed on `LayerOptions.zone`.

#### `VisibilityController`
Helpers for show/hide / off-screen travel of hideable layers.

---

### Base

#### `UiBox`
Primary layout primitive — a themed `UiEntity` wrapper with optional fill/border shorthand props.

---

### Layout helpers

#### `Row`
Horizontal flex container for arranging children side by side.

#### `RowReverse`
Same as `Row`, but with `flexDirection: 'row-reverse'`.

#### `Column`
Vertical flex container for stacking children.

#### `ColumnReverse`
Same as `Column`, but with `flexDirection: 'column-reverse'`.

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

1. Duplicate the button artboard in `assets/images/scaling-ui-assets.af`, then export to `assets/images/my-theme/atlas-btn-icons.png` (same column/row convention).
2. Define a `TextureAtlas` in `src/myTheme.ts` (see `myBtnIconsAtlas`).
3. Pass `textureSrc`, `uvColumnCount`, and `uvRowCount` so UVs match your grid:

```tsx
import { myBtnIconsAtlas } from '../myTheme'

<ButtonImage
	id            = "btn_custom"
	textureSrc    = {myBtnIconsAtlas.source}
	uvColumn      = {1}
	uvColumnCount = {myBtnIconsAtlas.columns}
	uvRowCount    = {myBtnIconsAtlas.rows}
	callback      = {() => { /* … */ }}
/>
```

#### `ButtonImageClose`
Shared close-button image control (default atlas column `1`). Usually injected via `showCloseButton` on a layer. Override `textureSrc` / `uvColumn` / grid counts the same way as `ButtonImage` when using a custom close glyph.

---

### Progress bars

> **Variants:** procedural (`ProgressBar`) · image-based (`ProgressBarImage`)

Both share the same value API: `id`, `value`, optional `minValue` / `maxValue`, `fillFrom` (`'left'` | `'right'` | `'top'` | `'bottom'`), and a per-`id` lerp when the value changes.

#### `ProgressBar` (procedural)
Colour layers — background (track) → fill → border. Tint with `fillColor` / `backgroundColor` / `borderColor` (theme defaults apply).

```tsx
<ProgressBar
	id        = "hp"
	value     = {72}
	fillColor = {theme.colors.danger}
	height    = {24}
/>
```

Children render centred on top of the bar (e.g. a percentage `Label`).

#### `ProgressBarImage` (image-based)
Three separate full textures (not an atlas): **background**, **fill**, and **border**. Uses `nine-slices` so ends/corners stay crisp when the bar resizes. Horizontal and vertical bars use different texture sets — orientation defaults from `fillFrom` (`top` / `bottom` → vertical).

```tsx
<ProgressBarImage
	id     = "xp"
	value  = {55}
	height = {28}
/>
```

##### Using your own progress-bar textures

1. Export three PNGs per orientation into `assets/images/my-theme/` (background, fill, border). Design them to align edge-to-edge; nine-slice margins default to ~25% top/bottom and ~6% left/right (`textureSlices` overrides).
2. Define a `ProgressBarImageTextures` object in `src/myTheme.ts` (see `myProgressBarTexturesHorizontal` / `myProgressBarTexturesVertical`).
3. Pass `textures` (and `orientation` when needed):

```tsx
import { myProgressBarTexturesHorizontal } from '../myTheme'

<ProgressBarImage
	id          = "xp_custom"
	value       = {70}
	orientation = "horizontal"
	textures    = {myProgressBarTexturesHorizontal}
	height      = {28}
/>
```

---

### Text

#### `Text`
Default body text block using theme typography.

#### `Code`
Monospace / code-style text block.

#### `Header`
Simple panel title line (h2-sized) for layer headers.

#### `SectionHeader`
Section title within a panel body.

#### `H1` … `H6`
Heading levels that apply the matching theme size and font family.

---

### Icons & media

> **Variants:** image-based (`Icon`, `IconNumber`, `Spinner`) — these always need a texture / atlas. Override the source on each control.

#### `Icon`
Single texture / atlas-cell icon sized from the theme (or explicit width/height). Pass `iconSrc` and optional `uvs` from a `TextureAtlas`.

```tsx
import { atlasIcons } from './scaling-ui'

<Icon
	iconSrc = {atlasIcons.source}
	uvs     = {atlasIcons.cell({ xStart: 1, yStart: 4 })}
/>
```

Cell coordinates are **1-based** (`1` = first column / bottom UV row).

##### Using your own icon textures

1. Duplicate the icons artboard in `assets/images/scaling-ui-assets.af`, then export to `assets/images/my-theme/atlas-icons.png`.
2. Define a `TextureAtlas` in `src/myTheme.ts` (see `myIconsAtlas`).
3. Pass `iconSrc` + `uvs`:

```tsx
import { myIconsAtlas } from '../myTheme'

<Icon
	iconSrc = {myIconsAtlas.source}
	uvs     = {myIconsAtlas.uv.coin}
/>
```

#### `IconNumber`
Renders a number or short math string as atlas glyphs (not SDK text). Defaults to `atlasCharsNumbers`; override with `atlas`.

```tsx
<IconNumber value={42} />
<IconNumber value="+12" />
<IconNumber value="3×4=" />
```

**Supported glyphs** (from `atlasCharsNumbers.layout` in `src/scaling-ui/atlases/`):

| Characters | Notes |
|---|---|
| `0`–`9` | Digits |
| `/` `+` `-` | Operators |
| `x` `*` `×` | Multiply — `*` and `×` alias to the `x` cell |
| `=` `.` | Equals and decimal point |

Atlas grid (top → bottom as in the PNG):

```
/ + - x
8 9 = .
4 5 6 7
0 1 2 3
```

Any other character is not in the layout and will log an error / render empty for that cell.

##### Using your own number atlas

1. Export a glyph sheet to `assets/images/my-theme/atlas-chars-numbers.png` with the same cell layout (or update `layout` / `aliases` to match).
2. Define a `TextureAtlas` with `layout` in `src/myTheme.ts` (see `myNumbersAtlas`).
3. Pass it as `atlas`:

```tsx
import { myNumbersAtlas } from '../myTheme'

<IconNumber value={42} atlas={myNumbersAtlas} />
```

##### Changing the built-in number font

The default glyphs are vector art in Affinity, not a runtime font:

1. Open `assets/images/scaling-ui-assets.af`.
2. Select the artboard named **Atlas numbers**.
3. Select all number/operator glyphs on that artboard.
4. Change the font as needed — **keep the fill white** so the game can tint the texture at runtime.
5. Keep each glyph inside the grid guidelines / margins on the artboard so UV cells still line up.
6. Re-export the numbers texture to `assets/images/scaling-ui/atlas-chars-numbers.png` (overwrite the existing file).

As long as glyphs stay within those cell bounds, `IconNumber` / `atlasCharsNumbers.char()` keep working without code changes.

#### `Spinner`
Animated loading-style spinner (image-based). Defaults use `atlasSpinners`; pass `textureSrc` + `uvs` to use a custom sheet from `assets/images/my-theme/`.

---

### Theme helpers (related)

#### `getTheme` / `buildTheme` / `defaultTheme`
Read or customize the active Scaling UI theme (colours, type sizes, icon sizing).

#### `darken` / `lighten` / `alpha`
Small colour utilities used by buttons and chrome.

---

## Project layout

```
assets/images/scaling-ui-assets.af   Affinity template for all default UI art
assets/images/scaling-ui/            framework default textures / atlases
assets/images/my-theme/              project-specific textures (recommended)
src/scaling-ui/                      framework (import from here)
src/scaling-ui/atlases/              bundled TextureAtlas instances
src/scaling-ui/utils/uvs.tsx         getUVCell / getUVColumn / getUVRow (1-based)
src/scaling-ui/examples/             demo layers for the sample scene
src/myTheme.ts                       theme overrides + custom atlases / textures
.cursor/skills/                      agent skills for this framework
.cursor/rules/                       agent rules when editing UI
```

## Agent guidance

When creating or changing Scaling UI interfaces, follow:

- `.cursor/skills/scaling-ui/SKILL.md`
- `.cursor/rules/scaling-ui.mdc`
- `.cursor/rules/scaling-ui-keys.mdc`
