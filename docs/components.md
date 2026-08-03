# Component reference

Import from `@stom66/dcl-ui-component-kit`. Each section starts with an **Options** table.

---

## Setup / core

### `SetupUiComponentKit`

Mounts the renderer (theme + layers) inside device-safe `ScreenInsetArea`.

| Option | Type | Description |
|---|---|---|
| `theme` | `ThemeCustomize` | Partial theme overrides (optional) |
| `layers` | `Layer[]` | Layer instances to mount |
| `debug.showDesktopSafeZones` | `boolean` | Overlay desktop safe zones |
| `debug.showMobileSafeZones` | `boolean` | Overlay mobile safe zones |

### `PropsController`

Per-instance reactive props bag used by layers and some controls (button scale, timer values, toggles, …).

### `TextureAtlas`

| Option | Type | Description |
|---|---|---|
| `source` | `string` | Texture path under scene `assets/` |
| `columns` / `rows` | `number` | Grid counts |
| `named` | record | Named cells (1-based coords) |
| `layout` | string grids | For `char()` glyph maps |
| `wrapMode` / `filterMode` | texture opts | Defaults include `clamp` |

Methods: `.cell` / `.row` / `.column` / `.char` / `.texture` / `.uv`.

---

## Base

### `UiBox`

Primary layout primitive — themed `UiEntity` wrapper.

| Option | Type | Description |
|---|---|---|
| `backgroundColor` | `Color4` | Fill shorthand |
| `borderColor` / `borderWidth` / `borderRadius` | — | Border shorthands |
| `aspectRatio` | `number` | Derive missing axis |
| `width` / `height` | `PositionUnit` | Size |
| `uiTransform` / `uiBackground` / `uiText` | native | Forwarded to `UiEntity` |
| `children` | JSX | Content |

Also exported as type `UiComponentKitProps` for the shared shorthand subset.

---

## Layout & chrome

Widths: prefer **`cols`** on `Row` / `Column` / `Label` / `ButtonText` (`cols={12}` = full). A parent that hosts nested `cols` children needs a definite width (usually `cols={12}`).

### `Row` / `RowReverse` / `Column` / `ColumnReverse`

| Option | Type | Description |
|---|---|---|
| `cols` | `number` | 12-column span |
| `colsDesktop` / `colsMobile` | `number` | Responsive spans |
| `uiTransform` / `uiBackground` | native | Layout / fill |
| `children` | JSX | Content |

### `Background`

Full-size panel chrome (theme body fill + border by default).

| Option | Type | Description |
|---|---|---|
| `backgroundColor` | `Color4` | Fill |
| `borderColor` / `borderWidth` / `borderRadius` | — | Border |
| `textureSrc` | `string` | Optional texture |
| `children` | JSX | Panel content |

### `BackgroundGradient`

| Option | Type | Description |
|---|---|---|
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | Gradient direction |
| `gradientStart` / `gradientEnd` | `number` | UV ratios 0–1 |
| `color` | `Color4` | Tint |
| `textureSrc` | `string` | Optional override texture |

### `Divider`

Thin horizontal rule. Accepts standard box / transform props.

### `Label`

Short labelled chip / callout. Supports `cols` and theme fill.

---

## Buttons

**Variants:** procedural (`ButtonText`) · image-based (`ButtonImage` / `ButtonImageClose`)

### `ButtonText`

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `textLabel` | `string` | Button label |
| `callback` | `() => void` | Click handler |
| `cols` / `colsDesktop` / `colsMobile` | `number` | Grid width |
| `width` / `height` | `PositionUnit` | Size (prefer `cols` when spanning) |
| `aspectRatio` | `number` | Defaults to theme button ratio |
| `backgroundColor` | `Color4` | Base fill (theme primary if omitted) |
| `textureSrc` | `string` | Optional texture |
| `uiTransform` | native | Extra layout |
| `children` | JSX | Optional nested content |

```tsx
<ButtonText id="btn_open" textLabel="Open" callback={() => myLayer.show()} />
```

### `ButtonImage`

Atlas layout: **columns = variants**, **rows = states** (UV bottom→top).

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `callback` | `() => void` | Click handler |
| `textureSrc` | `string` | Atlas / texture source |
| `uvColumn` | `number` | **1-based** variant column |
| `uvColumnCount` / `uvRowCount` | `number` | Grid totals (match your atlas) |
| `width` / `height` | — | Size |
| `uiTransform` | native | Extra layout |

```tsx
import { atlasBtnIconsStyled, ButtonImage } from '@stom66/dcl-ui-component-kit'

<ButtonImage
	id         = "btn_help"
	textureSrc = {atlasBtnIconsStyled.source}
	uvColumn   = {1}
	callback   = {() => helpLayer.toggle()}
/>
```

### `ButtonImageClose`

Same image API as `ButtonImage`; default atlas column `1`. Usually injected via `showCloseButton` on a layer.

---

## Progress bars

**Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`)

Shared value API:

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `value` | `number` | Current value |
| `minValue` / `maxValue` | `number` | Range |
| `fillFrom` | `'left' \| 'right' \| 'top' \| 'bottom'` | Fill origin |
| `height` / `width` | — | Size |
| `fillColor` / `backgroundColor` / `borderColor` | `Color4` | Procedural colours |
| `borderRadius` | `number` | Defaults to pill (half shortest axis) |
| `children` | JSX | Centred overlay (e.g. `%` label) |

### `ProgressBar` (procedural)

Colour layers: background → fill → border. Defaults: fill `primary`, background `dark`, border `secondary`.

```tsx
<ProgressBar id="hp" value={72} fillColor={getTheme().colors.danger} height={24} />
```

### `ProgressBarImage` (image / hybrid)

| Option | Type | Description |
|---|---|---|
| *(shared)* | — | Same value / colour API as `ProgressBar` |
| `textures` | `{ background?, fill?, border? }` | Optional per-layer image paths |
| `atlas` | `TextureAtlas` | Atlas fill source |
| `uvCell` | cell opts / named | Atlas sample region |
| `uvCropWithFill` | `boolean` | Crop UV with fill ratio |
| `uvMirror` / `uvFlip` | `boolean` | UV orientation |
| `orientation` | `'horizontal' \| 'vertical'` | Built-in texture set |
| `textureSlices` | fractions | Nine-slice fractions |

Omit `textures` and `atlas` → built-in nine-slice set. Partial `textures` → missing layers fall back to procedural colours.

```tsx
import { ProgressBarImage, atlasGradientColors } from '@stom66/dcl-ui-component-kit'

<ProgressBarImage id="xp" value={55} height={64} />

<ProgressBarImage
	id             = "xp_grad"
	value          = {65}
	height         = {24}
	atlas          = {atlasGradientColors}
	uvCell         = {atlasGradientColors.named.yellowOrange}
	uvCropWithFill = {true}
/>
```

Nine-slice note: corners keep absolute size from `texture size × slice fraction`. Design textures for the **smallest** display size you need, or keep bars at least `2 × corner size` on the constrained axis.

---

## Text

| Component | Options | Role |
|---|---|---|
| `Text` | `value`, `color`, `fontSize`, … | Body text |
| `Code` | `value`, … | Monospace |
| `Header` | `value`, `color?` | Panel title (h2-sized) |
| `SectionHeader` | `value`, `color?` | Section title in a panel |
| `H1` … `H6` | `value`, `color?` | Heading levels from theme |

```tsx
<H2 value="Settings" />
<Text value="Choose a difficulty." />
<Code value="score = 42" />
```

---

## Icons

**Variants:** `Icon` / `IconNumber` · `AvatarIcon`

### `Icon`

| Option | Type | Description |
|---|---|---|
| `src` | `string` | Texture (default: Font Awesome atlas) |
| `uvs` | UV quad | Atlas cell (`atlas.uv.name`) |
| `width` / `height` | number | Size (theme default if omitted) |

```tsx
import { Icon, atlasIconsFontAwesome } from '@stom66/dcl-ui-component-kit'

<Icon uvs={atlasIconsFontAwesome.uv.cat} width={64} height={64} />
```

### `AvatarIcon`

| Option | Type | Description |
|---|---|---|
| `userId` | `string` | Player id (lowercased); omit → `DEFAULT_AVATAR_USER_ID` |
| `width` / `height` | number | Size |

### `IconNumber`

| Option | Type | Description |
|---|---|---|
| `value` | `string \| number` | Digits / short math string |
| `atlas` | `TextureAtlas` | Override numbers atlas |

```tsx
<IconNumber value={42} />
<IconNumber value="+12" />
```

Supported glyphs and atlas grids: see the Affinity numbers / symbols artboards, or the showcase demos in this repo.

---

## Toggle

### `Toggle`

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `value` | `boolean` | Controlled value |
| `defaultValue` | `boolean` | Uncontrolled initial (`false`) |
| `backgroundColor` | `Color4` | Track fill (theme dark) |
| `toggleColor` | `Color4` | Thumb fill (theme light) |
| `height` | `number` | Track height; width = `height × 2` (default `32`) |
| `lerpDuration` | `number` | Slide / colour lerp seconds (default `0.2`) |
| `onChange` | `(value: boolean) => void` | After click |
| `uiTransform` | native | Extra layout |
| `children` | JSX | Optional |

```tsx
<Toggle id="music" defaultValue={true} onChange={(on) => { /* … */ }} />
```

---

## Animations

Wrappers that animate a **single child** (child should expose numeric `width` / `height` where needed).

### Shared options

| Option | Type | Description |
|---|---|---|
| `speed` | `number` | Effect speed |
| `burstCount` / `burstInterval` | number | Burst playback |
| `children` | single child | Animated target |

| Component | Effect |
|---|---|
| `Bounce` | `position.top` up/down |
| `Pulse` | Scale grow/shrink |
| `Shake` | `position.left` left/right |
| `Wiggle` | Rotates child UVs |
| `Spinner` | Continuous UV rotation (`speed` deg/sec) |
| `FlashColor` | Lerps child tint toward `color` |
| `FlashBorder` | Flashes border colour |

```tsx
import { Bounce, Icon, Spinner, atlasIconsFontAwesome } from '@stom66/dcl-ui-component-kit'

<Spinner speed={180}>
	<Icon uvs={atlasIconsFontAwesome.uv.hourglass} width={48} height={48} />
</Spinner>

<Bounce speed={0.6}>
	<Icon uvs={atlasIconsFontAwesome.uv.star} width={48} height={48} />
</Bounce>
```

Demo: `src/exampleThemes/showcase/layers/demo.animations.layer.tsx` in this repo.

---

## Theme & utilities

| Export | Role |
|---|---|
| `getTheme` / `buildTheme` / `defaultTheme` / `setTheme` / `theme` | Theme access |
| `darken` / `lighten` / `alpha` | Colour helpers |
| `getUVCell` / `getUVColumn` / `getUVRow` | Low-level UVs (1-based) |
| `resolveAspectDimensions` / `sizeValueToPixels` | Aspect-aware sizing |
| `vwToPixels` / `vhToPixels` | Virtual canvas math |
| `tweenValue` / `lerp` / `easingFunctions` | Shared easing |
