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
| `color` / `backgroundColor` | `Color4` | Fill shorthand → `uiBackground.color` (`backgroundColor` wins if both) |
| `borderColor` / `borderWidth` / `borderRadius` | — | Border shorthands |
| `aspectRatio` | `number` | Derive missing axis |
| `width` / `height` | `PositionUnit` | Size |
| `flexWrap` / `alignItems` / `justifyContent` / `padding` / `margin` / … | — | Layout shorthands (lifted from `uiTransform`; shorthands win) |
| `uiTransform` / `uiBackground` / `uiText` | native | Escape hatches |
| `children` | JSX | Content |

Prefer shorthands over nesting when a single field is enough. Also exported as type `UiComponentKitProps` for the shared shorthand subset.

---

## Layout & chrome

Widths: prefer **`cols`** on `Column` / `Label` / `ButtonText` (`cols={12}` = full). **`Row` is always full parent width** (no `cols`). A parent that hosts nested `cols` children needs a definite width (usually `cols={12}`).

### `Row` / `RowReverse` / `Column` / `ColumnReverse`

| Option | Type | Description |
|---|---|---|
| `cols` | `number \| 'auto'` | 12-column span (`Column` only; omit = no grid sizing) |
| `colsDesktop` / `colsMobile` | same | Responsive spans |
| `spacing` | `number` | Gap between children (default `theme.spacing`) |
| `flexWrap` / `alignItems` / `justifyContent` / `padding` / `margin` / … | — | Layout shorthands (prefer over `uiTransform`) |
| `color` / `backgroundColor` | `Color4` | Fill shorthand |
| `uiTransform` / `uiBackground` | native | Escape hatches |
| `children` | JSX | Content |

`Row` defaults to `flexWrap: nowrap` — children stay on one line and overflow. For **equal-cell** inventories prefer `Grid` (below). `flexWrap="wrap"` + sticky `cols` is for mixed 12-col spans only.

### `Grid`

Equal-cell grid (inventories / icon boards). Chunks children into tracks of `limit`; cells share size via `flexGrow` and use spacer gutters (no padded `cols` wrappers).

| Option | Type | Description |
|---|---|---|
| `limit` | `number` | Items per row (`horizontal`) or per column (`vertical`) — required |
| `direction` | `'horizontal' \| 'vertical'` | Flow axis (default `horizontal`) |
| `padIncomplete` | `boolean` | Pad short final tracks so cell size matches a full track (default `true`) |
| `spacing` | `number` | Gap between cells / tracks (default `theme.spacing`) |
| `cols` / `colsDesktop` / `colsMobile` | `number \| 'auto'` | Size the whole grid in a parent `Row` (same as `Column`) |
| `color` / `backgroundColor` | `Color4` | Fill shorthand |
| `uiTransform` / `uiBackground` | native | Escape hatches |
| `children` | JSX | Cell content — do **not** set `cols` on cells |

### `Background`

Full-size panel chrome (theme body fill + border by default).

Default layout is absolute fill (for fixed-size Zones). Use `fitContent` when the Layer Zone uses `height: 'auto'` so chrome contributes in-flow height.

| Option | Type | Description |
|---|---|---|
| `color` / `backgroundColor` | `Color4` | Fill (`color` preferred) |
| `borderColor` / `borderWidth` / `borderRadius` | — | Border |
| `textureSrc` | `string` | Optional texture |
| `fitContent` | `boolean` | Size to children (required for Layer `height: 'auto'`) |
| `padding` / `alignItems` / … | — | Layout shorthands |
| `children` | JSX | Panel content |

### `BackgroundGradient`

| Option | Type | Description |
|---|---|---|
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | Gradient direction |
| `gradientStart` / `gradientEnd` | `number` | UV ratios 0–1 |
| `color` | `Color4` | Tint |
| `textureSrc` | `string` | Optional override texture |
| `fitContent` | `boolean` | Forwarded to `Background` |

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

Prefer top-level shorthands over nesting `uiText`. `fontSize` takes a **theme base px** number and is auto-scaled inside the component. `color` here is **font color** (not fill).

| Component | Shorthands | Role |
|---|---|---|
| `Text` | `value`, `color`, `fontSize`, `font`, `textAlign`, `textWrap` | Body text |
| `Code` | same | Monospace |
| `Header` | same | Panel title (h2-sized) |
| `SectionHeader` | same | Section title in a panel |
| `H1` … `H6` | same | Heading levels from theme |

```tsx
<H2 value="Settings" />
<Text value="Choose a difficulty." fontSize={theme.typography.size.small} />
<Code value="score = 42" />
```

---

## Icons

**Variants:** `Icon` / `IconNumber` · `AvatarIcon` · `SpriteIcon`

### `Icon`

| Option | Type | Description |
|---|---|---|
| `src` | `string` | Texture (default: Font Awesome atlas) |
| `uvs` | UV quad | Atlas cell (`atlas.uv.name`) |
| `color` | `Color4` | Tint multiply (texture × color; not `backgroundColor`) |
| `width` / `height` | number | Size (theme default if omitted) |

```tsx
import { Icon, atlasIconsFontAwesome, getTheme } from '@stom66/dcl-ui-component-kit'

<Icon uvs={atlasIconsFontAwesome.uv.cat} width={64} height={64} />
<Icon uvs={atlasIconsFontAwesome.uv.star} color={getTheme().colors.primary} width={64} height={64} />
```

### `AvatarIcon`

| Option | Type | Description |
|---|---|---|
| `userId` | `string` | Player id (lowercased); omit → `DEFAULT_AVATAR_USER_ID` |
| `width` / `height` | number | Size |

### `SpriteIcon`

Animated sprite-sheet icon. Plays cells left → right, top → bottom at `fps`.

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique playback key (required) |
| `atlas` | `TextureAtlas` | Supplies `src` / `columns` / `rows` when omitted |
| `src` | `string` | Sheet path (required without `atlas`) |
| `columns` / `rows` | `number` | Grid size (required without `atlas`) |
| `fps` | `number` | Frames per second (default `columns * rows`) |
| `offset` | `number` | 0-based frames to skip from the start of the sheet |
| `limit` | `number` | How many cells to play after `offset` |
| `pingPong` | `boolean` | Reverse at the end of the window instead of wrapping |
| `loopInterval` | `number` | Seconds to rest between loops (holds last frame; default `0`) |
| `playing` / `looping` | `boolean` | Playback controls — `looping={false}` = one-shot |

Trigger externally with `setPlaying(id, true|false)` or `playOnce(id)` (e.g. on hover). Keep `playing={false}` stable on the element so helpers are not overwritten each frame.

```tsx
import { playOnce, setPlaying, SpriteIcon } from '@stom66/dcl-ui-component-kit'

<SpriteIcon
	id           = "spin-full"
	atlas        = {exampleSpriteSheetAtlas}
	fps          = {12}
	loopInterval = {0.5}
	width        = {64}
	height       = {64}
/>

<SpriteIcon
	id           = "spin-hover"
	atlas        = {exampleSpriteSheetAtlas}
	playing      = {false}
	onMouseEnter = {() => setPlaying('spin-hover', true)}
	onMouseLeave = {() => setPlaying('spin-hover', false)}
	width        = {64}
	height       = {64}
/>

<SpriteIcon
	id           = "spin-once"
	atlas        = {exampleSpriteSheetAtlas}
	playing      = {false}
	looping      = {false}
	onMouseEnter = {() => playOnce('spin-once')}
	width        = {64}
	height       = {64}
/>
```

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

### Shared burst options

Used by `Bounce`, `Pulse`, `Shake`, `Wiggle`, `FlashColor`, `FlashBorder`, and `Spinner` (`BurstAnimationProps`).

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Playback instance key |
| `duration` | `number` | Seconds for **one** instance (not the whole burst) |
| `burstCount` / `burstInterval` / `burstOffset` | number | Burst playback (`burstOffset` delays the timeline start) |
| `playing` / `looping` | `boolean` | Playback control |
| `children` | single child | Animated target |

| Component | Effect |
|---|---|
| `Bounce` | `position.top` up/down |
| `Pulse` | Scale grow/shrink |
| `Shake` | `position.left` left/right |
| `Wiggle` | Rotates child UVs |
| `Spinner` | UV rotation via `duration` + `degrees` |
| `FlashColor` | Lerps child tint toward `color` |
| `FlashBorder` | Flashes border colour |

### Spinner extras

| Option | Type | Description |
|---|---|---|
| `degrees` | `number` | Degrees rotated during one `duration` (negative = reverse) |

```tsx
import { Bounce, Icon, Spinner, atlasIconsFontAwesome } from '@stom66/dcl-ui-component-kit'

<Spinner id="loader" duration={1} degrees={180} burstInterval={0}>
	<Icon uvs={atlasIconsFontAwesome.uv.hourglass} width={48} height={48} />
</Spinner>

<Bounce duration={0.6}>
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
