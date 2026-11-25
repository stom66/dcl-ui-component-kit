# Component reference

Import from `@stom66/dcl-ui-component-kit`. Each section starts with an **Options** table.

---

## Setup / core

### `SetupUiComponentKit`

Mounts theme + layers. Layers are grouped by resolved `inset` (Layer option, else Setup `screenInset`, kit default `'none'`) into at most three SDK UI renderers. Only `ZoneType.Default` gets a centering shell inside its renderer. Layers: [layers-and-zones.md](layers-and-zones.md).

| Option | Type | Description |
|---|---|---|
| `theme` | `ThemeCustomize` | Partial theme overrides (optional) |
| `layers` | `Layer[]` | Layer instances to mount |
| `screenInset` | `'none'` / `'device'` / `'interactable'` | Default inset for layers that omit `inset`. Kit default `'none'`. Do not also wrap `ScreenInsetArea` / `InteractableArea` in layer `body()`. |
| `debug.showDesktopSafeZones` | `boolean` | Overlay desktop safe zones |
| `debug.showMobileSafeZones` | `boolean` | Overlay mobile safe zones |

`getLeftZoneInset()` — left-rail clearance for left-edge zones. Call at layout/render time; do not cache at import.

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

### Plain boxes — use the SDK `UiEntity`

The kit has no box primitive of its own. For a plain chip / cell / swatch / hit area, use `UiEntity` from `@dcl/sdk/react-ecs`. For a layout container, use `Column` / `Row`.

```tsx
import { UiEntity } from '@dcl/sdk/react-ecs'

<UiEntity
	uiTransform={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
	uiBackground={{ color: theme.colors.primary }}
>
	<Icon src={…} uvs={…} />
</UiEntity>
```

Raw `UiEntity` takes **no kit shorthands** (`padding={8}` / `backgroundColor={…}` at the top level are wrong) and does not auto-scale `uiText.fontSize` — wrap with `scaleThemeFontSize`, or use `Text` / `Label`.

### Shared kit shorthands (`KitEntityProps` / `resolveKitEntityProps`)

Every kit component (`Row`, `Column`, `Text`, `Label`, `Background`, buttons, icons, …) accepts these on top of the native `UiEntity` props:

| Option | Type | Description |
|---|---|---|
| `backgroundColor` | `Color4` | Fill shorthand → `uiBackground.color`  |
| `borderColor` / `borderWidth` / `borderRadius` | — | Border shorthands (`borderColor` defaults to a darkened fill when a width is set) |
| `aspectRatio` | `number` | Derive missing axis |
| `width` / `height` | `PositionUnit` | Size |
| `flexWrap` / `alignItems` / `justifyContent` / `padding` / `margin` / … | — | Layout shorthands (lifted from `uiTransform`; shorthands win) |
| `uiTransform` / `uiBackground` / `uiText` | native | Escape hatches |
| `children` | JSX | Content |

Prefer shorthands over nesting when a single field is enough.

For your own components, type props as `KitEntityProps` and spread `resolveKitEntityProps(props)` onto a `UiEntity` — it turns the shorthands into native props, scales numeric `uiText.fontSize`, and drops anything `UiEntity` does not understand. `UiComponentKitProps` is the shorthand-only subset.

```tsx
export function MyChip({ children, uiTransform, ...props }: KitEntityProps) {
	return (
		<UiEntity {...resolveKitEntityProps({ ...props, uiTransform: { height: 'auto', ...uiTransform } })}>
			{children}
		</UiEntity>
	)
}
```

### `UiBox` (deprecated)

Old themed `UiEntity` wrapper. Still exported so existing scenes keep working; do not use it in new code. Migration table: [upgrade-caveats.md](upgrade-caveats.md) → 0.4.0.

---

## Layout & chrome

Widths: prefer **`cols`** on `Column` / `Label` / `ButtonText` **inside panels/grids** (`cols={12}` = full). **`Row` is always full parent width** (no `cols`). A parent that hosts nested `cols` children needs a definite width (usually `cols={12}`). For edge / corner HUD controls that should follow zone alignment, **omit `cols`** (shrink-to-content / theme aspect) — see [layers-and-zones.md](layers-and-zones.md) → Zone alignment.

### `Row` / `RowReverse` / `Column` / `ColumnReverse`

| Option | Type | Description |
|---|---|---|
| `cols` | `number \| 'auto'` | 12-column span (`Column` only; omit = no grid sizing) |
| `colsDesktop` / `colsMobile` | same | Responsive spans (resolved at render via `isDesktop()` / `isMobile()`, not at import) |
| `spacing` | `number` | Gap between children (default `theme.spacing`) |
| `flexWrap` / `alignItems` / `justifyContent` / `padding` / `margin` / … | — | Layout shorthands (prefer over `uiTransform`) |
| `backgroundColor` | `Color4` | Fill shorthand |
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
| `cols` / `colsDesktop` / `colsMobile` | `number \| 'auto'` | Size the whole grid in a parent `Row` (same as `Column`; platform overrides are live at render) |
| `backgroundColor` | `Color4` | Fill shorthand |
| `uiTransform` / `uiBackground` | native | Escape hatches |
| `children` | JSX | Cell content — do **not** set `cols` on cells |

### `Background`

Full-size panel chrome (theme body fill + border by default).

**Sibling chrome only** — render `<Background />` as a peer of content under the Zone / parent. Do **not** nest body content inside it; nesting creates a new flex root and discards zone `alignItems` / `justifyContent`. See safe-zone demos (`demo.safeZone.factory.tsx`).

Default layout is absolute fill (out of flex flow). For Layer `height: 'auto'`, keep absolute chrome and let in-flow content siblings size the Zone. For small self-sized chips use a plain `UiEntity` (or `Label`); `fitContent` is a rare escape hatch.

| Option | Type | Description |
|---|---|---|
| `backgroundColor` | `Color4` | Fill shorthand → `uiBackground.color` |
| `borderColor` / `borderWidth` / `borderRadius` | — | Border |
| `textureSrc` | `string` | Optional texture |
| `fitContent` | `boolean` | Rare self-sized chrome (not Layer panel chrome) |
| `padding` / `alignItems` / … | — | Layout shorthands (usually unused for empty chrome) |

### `BackgroundGradient`

Same sibling-chrome rule as `Background` — empty peer for fill, not a content wrapper.

| Option | Type | Description |
|---|---|---|
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | Gradient direction |
| `gradientStart` / `gradientEnd` | `number` | UV ratios 0–1 |
| `backgroundColor` | `Color4` | Tint |
| `textureSrc` | `string` | Optional override texture |
| `fitContent` | `boolean` | Forwarded to `Background` (rare; see `Background`) |

### `Divider`

Thin horizontal rule. Prefer `backgroundColor` for the line fill (plus `margin` / `thickness` / `width`).

### `Label`

Short labelled chip / callout. Supports `cols`. Chip fill via `backgroundColor`; font tint via `fontColor`.

---

## Buttons

**Variants:** procedural (`ButtonText`, `ButtonHold`) · image-based (`ButtonImage` / `ButtonImageClose`)

### `ButtonText`

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `textLabel` | `string` | Button label |
| `callback` | `() => void` | Click handler |
| `cols` / `colsDesktop` / `colsMobile` | `number` | Grid width inside a panel `Row`. **Omit** for content-sized HUD / zone siblings (theme aspect). Platform overrides are live at render. |
| `width` / `height` | `PositionUnit` | Size (prefer `cols` when spanning a grid) |
| `aspectRatio` | `number` | Defaults to theme button ratio |
| `backgroundColor` | `Color4` | Base fill (theme primary if omitted) |
| `textureSrc` | `string` | Optional texture |
| `uiTransform` | native | Extra layout |
| `children` | JSX | Optional nested content |

```tsx
<ButtonText id="btn_open" textLabel="Open" callback={() => myLayer.show()} />
```

On **mobile**, `callback` runs on `mouseDown` (touch). On **desktop**, it runs on `mouseUp` after hover. The kit uses `isMobile()` for that split — not `!isDesktop()`.

### `ButtonImage`

Atlas layout: **columns = variants**, **rows = states** (UV bottom→top).

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `callback` | `() => void` | Click handler |
| `atlas` | `TextureAtlas` | Preferred sheet — applies `.cell()` insets + `.texture` wrap/filter |
| `textureSrc` | `string` | Atlas / texture source (defaults from `atlas` when set) |
| `uvColumn` | `number` | **1-based** variant column |
| `uvColumnCount` / `uvRowCount` | `number` | Grid totals (defaults from `atlas` when set) |
| `width` / `height` | — | Size |
| `uiTransform` | native | Extra layout |

```tsx
import { atlasBtn3x1, atlasBtnIconsStyled, ButtonImage, FontAwesome, Row, Text } from '@stom66/dcl-ui-component-kit'

// Icon-column atlas (default sheet when atlas / textureSrc omitted)
<ButtonImage
	id       = "btn_help"
	atlas    = {atlasBtnIconsStyled}
	uvColumn = {1}
	callback = {() => helpLayer.toggle()}
/>

// Wide blank atlas + nested icon / text (no border — ButtonImage already uses borderWidth 0)
<ButtonImage
	id          = "btn_click_me"
	atlas       = {atlasBtn3x1}
	uvColumn    = {1}
	width       = {192}
	height      = {64}
	callback    = {() => { /* … */ }}
	uiTransform = {{ positionType: 'relative', position: { top: 0, left: 0 } }}
>
	<Row height="100%" alignItems="center" justifyContent="center" spacing={8}>
		<FontAwesome icon="hand-pointer" fontSize={28} />
		<Text value="Click me" width="auto" textWrap="nowrap" />
	</Row>
</ButtonImage>
```

### `ButtonImageClose`

Same image API as `ButtonImage`; default atlas column `1`. Usually injected via `showCloseButton` on a layer.

### `ButtonHold`

Press-and-hold button. While held, a bar fills the button left to right over `fillTime`; released early, it drains over `drainTime`. Rates are linear: with `fillTime` 3 and `drainTime` 1, holding 2 s fills 2/3, and half a second after release 1/6 is left. When the bar fills, the button pulses once and `onComplete` fires; holding on does nothing more until release. The button's own fill never changes. Press starts on `mouseDown` on every platform; releasing anywhere, or leaving the button, drains it.

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `textLabel` | `string` | Label |
| `width` / `height` | `PositionUnit` / `number` | Defaults to theme button size |
| `fillTime` | `number` | Seconds to fill from empty (default `1.5`) |
| `drainTime` | `number` | Seconds to drain from full (default `fillTime / 2`) |
| `backgroundColor` | `Color4` | Button fill (theme secondary) |
| `fillColor` | `Color4` | Progress fill (theme primary) |
| `borderColor` / `borderWidth` / `borderRadius` | | Chrome |
| `fontColor` / `fontSize` | | Label |
| `pulse` | `boolean` | Pulse once on completion (`true`) |
| `disabled` | `boolean` | Ignore input |
| `onComplete` | `() => void` | Once per hold, when the bar fills |
| `onProgress` | `(progress) => void` | Every frame the fill changes, `0`–`1` |
| `children` | JSX | Extra content drawn over the fill |

Read the fill anywhere with `getButtonHoldProgress(id)`.

```tsx
<ButtonHold id="leave_match" textLabel="Hold to leave" fillTime={3} drainTime={1} onComplete={() => leaveMatch()} />
```

---

## Progress bars

**Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`) · sprite radial (`ProgressBarRadial`)

Shared value API (`ProgressBar` / `ProgressBarImage`):

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
| `uvCell` | cell opts / named | Atlas sample region (`atlas.named.*`) |
| `uvCropWithFill` | `boolean` | **Reveal mode:** crop UVs to fill % so art peels open instead of stretching |
| `uvRotate` | `number` (steps) | UV corner rotation (`1` = 90°). Default `0` (as-authored). Use `1` only for horizontal strip atlases on vertical bars |
| `uvMirror` / `uvFlip` | `boolean` | Flip UV orientation; use with `uvCropWithFill` when `fillFrom` is `"right"` / vertical |
| `orientation` | `'horizontal' \| 'vertical'` | Built-in texture set |
| `textureSlices` | `{ top, right, bottom, left }` fractions | UV nine-slice margins (0–1) — **not** layout inset |
| `contentInset` | `number` \| `{ top?, right?, bottom?, left? }` | Pixel inset for **fill + image track** inside the border. A number is uniform (always supported). TRBL edges are per-side. Does **not** pad nested children — use child `margin` / `padding` for icons/labels |

Omit `textures` and `atlas` → built-in nine-slice set. Partial `textures` → missing layers fall back to procedural colours.

```tsx
import { ProgressBarImage, atlasGradientColors } from '@stom66/dcl-ui-component-kit'

<ProgressBarImage id="xp" value={55} height={64} />

{/* Reveal a gradient strip as the bar fills (do not stretch the UV) */}
<ProgressBarImage
	id             = "xp_grad"
	value          = {65}
	height         = {24}
	atlas          = {atlasGradientColors}
	uvCell         = {atlasGradientColors.named.yellowOrange}
	uvCropWithFill = {true}
/>

{/* Vertical + horizontal stock gradient: opt in to 90° — custom vertical art omits uvRotate */}
<ProgressBarImage
	id             = "xp_vert_grad"
	value          = {65}
	fillFrom       = "top"
	width          = {32}
	height         = {200}
	atlas          = {atlasGradientColors}
	uvCell         = {atlasGradientColors.named.green}
	uvCropWithFill = {true}
	uvRotate       = {1}
/>

{/* Uniform inset (number) or per-edge TRBL — fill/track only */}
<ProgressBarImage id="xp_inset" value={55} height={64} contentInset={16} />
<ProgressBarImage
	id           = "xp_inset_trbl"
	value        = {55}
	height       = {64}
	contentInset = {{ top: 8, right: 16, bottom: 8, left: 16 }}
/>
```

Nine-slice note: corners keep absolute size from `texture size × slice fraction`. Design textures for the **smallest** display size you need, or keep bars at least `2 × corner size` on the constrained axis.

### `ProgressBarRadial` (sprite sheet)

Ring sampled from a grid of frames (default `atlasSpritesProgressRadial`: `sprites-progress-radial.png`, **16×16 / 256 frames**). `progress` is **`0…1`** (`0` = first cell, `1` = last). `height` defaults to `width`. The outer chip is circular (`borderRadius` = half the shortest axis). The sprite paints **above** the border; use `inset` to sit inside the stroke or overlap it.

| Option | Type | Description |
|---|---|---|
| `progress` | `number` | Fill amount in `[0, 1]` |
| `width` / `height` | — | Size of the chip / border; `height` defaults to `width` |
| `fillColor` | `Color4` | Tint on the sprite (theme primary) |
| `backgroundColor` | `Color4` | Circular chip fill (theme dark) |
| `borderColor` / `borderWidth` | — | Optional stroke on the chip |
| `inset` | `number` | Uniform px inset of the sprite vs the chip. **Negative** grows over the border (track). Default `0` |
| `mirror` | `boolean` | Horizontal UV mirror — fill anti-clockwise (default `false` / clockwise) |
| `atlas` | `TextureAtlas` | Override sheet (any `columns` × `rows` grid) |

```tsx
import { ProgressBarRadial, getTheme } from '@stom66/dcl-ui-component-kit'

<ProgressBarRadial progress={0.4} width={72} />
<ProgressBarRadial
	progress        = {0.75}
	width           = {64}
	fillColor       = {getTheme().colors.success}
	backgroundColor = {getTheme().colors.dark}
/>
<ProgressBarRadial progress={0.4} width={72} mirror={true} />
<ProgressBarRadial progress={0.4} width={72} borderColor={getTheme().colors.secondary} borderWidth={2} inset={-4} />
```

---

## Text

Prefer top-level shorthands over nesting `uiText`. `fontSize` takes a **theme-base px** number — prefer **`theme.typography.size.*`** (`small`, `default`, `code`, `h1`–`h6`). Kit components auto-scale (`scaleThemeFontSize`). Do not pre-scale. Ad-hoc numbers use the same theme-base units. Raw `UiEntity` only: wrap with `scaleThemeFontSize`. Use **`fontColor`** for font tint (not fill).

| Component | Shorthands | Role |
|---|---|---|
| `Text` | `value`, `fontColor`, `fontSize`, `font`, `fontSrc`, `textAlign`, `textWrap` | Body text |
| `Code` | same | Monospace |
| `Header` | same | Panel title (h2-sized helper; `H1`–`H6` stay the levelled headings) |
| `H1` … `H6` | same | Heading levels from theme |
| `Label` / `ButtonText` | same text shorthands (`ButtonText` uses `textLabel` for copy) | Chips / buttons |

```tsx
<H2 value="Settings" />
<Text value="Choose a difficulty." fontSize={theme.typography.size.small} />
<Code value="score = 42" />
<Text
	value   = "Branded title"
	font    = "serif"
	fontSrc = "assets/fonts/Display.ttf"
/>
```

### Custom fonts (`fontSrc`)

Requires `@dcl/sdk` ≥ 7.31. Scene-relative `.ttf` paths only (OTF / WOFF rejected). Always set built-in `font` beside `fontSrc` (fallback when the file is missing, on mobile, or before Unity has optimized assets).

**Unity Desktop:** custom fonts only appear after the scene’s assets are optimized (Creator Hub **Compress Assets**, or `npm run start -- --asset-bundles` / kit `npm run start:bundles`). Plain `npm start` serves the raw `.ttf` but Unity ignores it until then — icon fonts show as empty squares (tofu). Bevy / web loads the `.ttf` immediately.

Theme slice `typography.fontSrc`:

| Key | Meaning |
|---|---|
| `sansSerif` / `serif` / `monospace` | TTF for that built-in face |
| `default` | Catch-all when the face key is unset (one font for the whole project) |

```tsx
SetupUiComponentKit({
	theme: {
		typography: {
			fontSrc: {
				default  : 'assets/fonts/Body.ttf',
				serif    : 'assets/fonts/Display.ttf',
				monospace: 'assets/fonts/Mono.ttf',
			},
		},
	},
	layers: [/* … */],
})
```

Always pair `fontSrc` with a built-in `font` fallback (missing file / clients that ignore `fontSrc`, e.g. mobile).

---

## Icons

**Variants:** `FontAwesome` · `GameIcon` · `Icon` · `AvatarIcon` · `SpriteIcon`

### `FontAwesome`

Font Awesome Free glyph via kit TTFs (`fontSrc`). Bare `UiEntity` — only the props below.

| Option | Type | Description |
|---|---|---|
| `icon` | `string` | Icon name (`star`, `dice-d20`, `diceD20`, …) |
| `fontSize` | `number` | Pixel size (defaults to `theme.icons.defaultSize`) |
| `fontColor` | `Color4` | Glyph tint (defaults to theme light) |

```tsx
import { FontAwesome, getTheme } from '@stom66/dcl-ui-component-kit'

<FontAwesome icon="cat" fontSize={64} />
<FontAwesome icon="star" fontColor={getTheme().colors.primary} />
<FontAwesome icon="github" />
```

Requires stock fonts from `copy-assets` (`assets/fonts/duck-font-awesome-*.ttf`). Rebuild with `npm run convert-fa-fonts` from desktop sources in `scripts/fa-desktop-sources/` (gitignored). Unity Desktop preview needs asset bundles (`npm run start:bundles`) or PUA glyphs show as tofu even within budget.

### `GameIcon`

Any of the ~4,000 [game-icons.net](https://game-icons.net) icons by name, as a TTF glyph. Same props and behaviour as `FontAwesome`.

| Option | Type | Description |
|---|---|---|
| `icon` | `GameIconId \| string` | Icon name (`crossed-swords`, `crossedSwords`, or `author/name` such as `skoll/bat`) — search `fonts/gameIcons.icons.ts` or game-icons.net |
| `fontSize` | `number` | Pixel size (defaults to `theme.icons.defaultSize`) |
| `fontColor` | `Color4` | Glyph tint (defaults to theme light) |

```tsx
import { GameIcon, getTheme } from '@stom66/dcl-ui-component-kit'

<GameIcon icon="crossed-swords" />
<GameIcon icon="health-potion" fontSize={64} fontColor={getTheme().colors.danger} />
```

All icons are in one font, `assets/fonts/duck-game-icons.ttf` (~1.7 MB), copied into the scene by `copy-assets` alongside the Font Awesome TTFs. **CC BY 3.0: credit the authors in your scene.** Full guide: [game-icons.md](./game-icons.md).

### `Icon`

Texture icon for **custom / project atlases** (not Font Awesome by name).

| Option | Type | Description |
|---|---|---|
| `src` | `string` | Texture path / `TextureAtlas.source` (**required**) |
| `uvs` | UV quad | Atlas cell (`atlas.uv.name`) |
| `iconColor` | `Color4` | Tint multiply (texture × color; not `backgroundColor`) |
| `width` / `height` | number | Size (theme default if omitted) |

```tsx
import { Icon, getTheme } from '@stom66/dcl-ui-component-kit'
import { exampleIconsAtlas } from './atlases'

<Icon src={exampleIconsAtlas.source} uvs={exampleIconsAtlas.uv.catButt} width={64} height={64} />
<Icon src={exampleIconsAtlas.source} uvs={exampleIconsAtlas.uv.pigeonCowboy} iconColor={getTheme().colors.primary} width={64} height={64} />
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

---

## Inputs

Toggle, Checkbox, NumberInput, SegmentedControl and RangeSlider live in `components/inputs/`. Clicks follow the button rule: **mobile** on `mouseDown`, **desktop** on `mouseUp` (`isMobile()`, not `!isDesktop()`). Each keeps per-`id` state, and each can be controlled (`value`) or uncontrolled (`defaultValue`).

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

### `SegmentedControl` / `SegmentedControlOption`

Single-choice segmented control: options sit side by side and a selector box slides over the chosen one. In `direct` mode (default) each option is its own hit area. In `cycle` mode any click moves to the next option and wraps back to the first. Option labels lerp from `inactiveColor` to `activeColor` as the selector passes over them.

Declare options as `<SegmentedControlOption>` children (also `SegmentedControl.Option`), or pass `options={[…]}`.

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `value` | `string \| number` | Controlled selected value |
| `defaultValue` | `string \| number` | Uncontrolled initial (first option) |
| `variant` | `'filled' \| 'outline'` | `filled`: secondary track, primary border, solid primary selector. `outline`: transparent, borders only (default `filled`) |
| `clickMode` | `'direct' \| 'cycle'` | Click picks / click advances (default `direct`) |
| `readOnly` | `boolean` | Ignore clicks; drive it with `setSegmentedControlIndex` |
| `width` / `height` | `PositionUnit` | Any unit, `%` included — the selector is placed in % (default `360` × `48`) |
| `inset` | `number` | Gap between outer border and selector (default `3`) |
| `backgroundColor` / `borderColor` / `borderWidth` / `borderRadius` | | Outer box |
| `selectorColor` / `selectorBorderColor` / `selectorBorderWidth` / `selectorRadius` | | Selector box (radius defaults to `borderRadius − inset`) |
| `activeColor` / `inactiveColor` | `Color4` | Label colours (theme light / tertiary) |
| `fontSize` | `number` | Label size |
| `duration` / `easing` | `number` / `EasingFn` | Slide timing (default `0.3`, `easeOutQuart`) |
| `onSelect` | `(value, index) => void` | After a click, with the new option |
| `onDeselect` | `(value, index) => void` | After a click, with the previous option |

`SegmentedControlOption` props: `value` (required), `label` (defaults to `String(value)`), `render(state)` for custom content (`state.color` / `state.weight` / `state.active` — use `state.color` to tint icons), and per-option `onSelect` / `onDeselect`.

Game code: `setSegmentedControlIndex(id, index, animate?)`, `setSegmentedControlValue(id, value, animate?)`, `getSegmentedControlIndex(id)`, `getSegmentedControlValue(id)`. These do not fire the click events.

```tsx
<SegmentedControl id="aim_step" onSelect={(value) => setAimStep(value)}>
	<SegmentedControlOption value="position"  label="Position"  />
	<SegmentedControlOption value="direction" label="Direction" />
	<SegmentedControlOption value="strength"  label="Strength"  />
</SegmentedControl>

<SegmentedControl
	id        = "difficulty"
	variant   = "outline"
	clickMode = "cycle"
	options   = {[{ value: 'easy' }, { value: 'normal' }, { value: 'hard' }]}
/>
```

### `Checkbox`

Square on/off box: a solid check when on, a faint cross when off. Icons are Font Awesome names by default; pass any element for custom content, or `null` for an empty box.

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `value` / `defaultValue` | `boolean` | Controlled / uncontrolled initial (`false`) |
| `size` | `number` | Box size (default `32`) |
| `label` | `string` | Text to the right; clicking it toggles too |
| `checkedIcon` / `uncheckedIcon` | `string \| JSX \| null` | Defaults `'check'` / `'xmark'` |
| `iconSize` | `number` | Default 60% of `size` |
| `checkedIconColor` / `uncheckedIconColor` | `Color4` | Theme light / light at 25% alpha |
| `checkedBackgroundColor` / `backgroundColor` | `Color4` | Box fill on / off (theme success / dark) |
| `checkedBorderColor` / `borderColor` | `Color4` | Box border on / off |
| `borderWidth` / `borderRadius` | `number` | |
| `fontSize` | `number` | Label size |
| `readOnly` | `boolean` | Ignore clicks |
| `onChange` | `(value: boolean) => void` | After a click |

Game code: `getCheckboxValue(id)`, `setCheckboxValue(id, value)`.

```tsx
<Checkbox id="show_hints" label="Show hints" defaultValue={true} onChange={(on) => setHints(on)} />
<Checkbox id="favourite" checkedIcon="star" uncheckedIcon={null} checkedBackgroundColor={theme.colors.info} />
```

### `NumberInput`

Numeric field wrapped by − / + buttons, joined edge to edge into one bar with only the outermost corners rounded. Several button pairs are allowed (`steps={[1, 10]}` gives −10 −1 [field] +1 +10). The player can also type a value and press **Enter**. Typed and stepped values are clamped to `min` / `max` and snapped to `step`; a typed value that isn't a number is discarded.

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `value` / `defaultValue` | `number` | Controlled / uncontrolled initial (`min`, or `0`) |
| `min` / `max` | `number` | Bounds; omit for none |
| `step` | `number` | Snap increment and default button step (`1`; `0` = no snapping) |
| `steps` | `number[]` | Button increments, smallest nearest the field (default `[step]`, labelled − / +) |
| `decimals` | `number` | Decimal places shown (default: those in `step`) |
| `editable` | `boolean` | Let the player type (`true`) |
| `width` / `height` | `PositionUnit` / `number` | Default `220` × `40` |
| `backgroundColor` | `Color4` | Field fill (theme dark) |
| `borderRadius` | `number` | Radius of the outermost corners (`theme.border.radiusSmall`) |
| `buttonColor` | `Color4` | Button fill (theme secondary) |
| `fontColor` / `fontSize` | | Field and button text |
| `onChange` | `(value: number) => void` | On a button press, or a typed value submitted with Enter |

Game code: `getNumberInputValue(id)`, `setNumberInputValue(id, value)`.

```tsx
<NumberInput id="rounds" min={1} max={10} defaultValue={3} onChange={setRounds} />
<NumberInput id="bet" min={0} max={9999} step={10} steps={[10, 100]} value={bet} onChange={setBet} />
```

### `RangeSlider`

Horizontal value slider: groove, fill and a thumb, in three shapes:

- `round` (default): thin groove, round thumb taller than the groove.
- `inset`: thick groove with the round thumb sitting inside it; the fill wraps the thumb.
- `capsule`: thin groove, tall pill-shaped thumb (rounded top and bottom).

UI pointer events carry no position, so the slider is covered by `tapCells` invisible hit cells. A tap jumps to the nearest cell — this is the full interface on mobile. On desktop, holding after the press drags the value (cursor offset from the press via `PrimaryPointerInfo.screenCoordinates`, same as `ColorPicker`), and a full-screen catcher exists only while dragging so a release anywhere ends it. On mobile, sliding a held finger across cells also updates the value if the client sends enter events during a touch.

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) |
| `value` / `defaultValue` | `number` | Controlled / uncontrolled initial (`min`) |
| `min` / `max` | `number` | Range (default `0` – `100`) |
| `step` | `number` | Snap increment; `0` = continuous |
| `width` | `PositionUnit` | px / vw / vh — `%` unsupported (drag math needs pixels). Default `300` |
| `shape` | `'round' \| 'inset' \| 'capsule'` | See above (default `round`) |
| `height` | `number` | Overall height (default `32`): thumb diameter for `round`, groove height for `inset`, thumb height for `capsule` |
| `trackHeight` | `number` | Groove thickness for `round` / `capsule` (default 35% / 25% of `height`) |
| `thumbInset` | `number` | `inset`: gap between groove edge and thumb (default `4`) |
| `thumbWidth` | `number` | `capsule`: thumb width (default 40% of `height`) |
| `variant` | `'filled' \| 'outline'` | `outline`: bordered transparent groove, dark thumb |
| `trackColor` / `fillColor` / `thumbColor` / `thumbBorderColor` / `borderColor` | `Color4` | Overrides |
| `tapCells` | `number` | Hit cells (default one per step up to 41, else `21`) |
| `readOnly` | `boolean` | Display only |
| `onChange` | `(value) => void` | Every change (taps, each drag frame) |
| `onChangeEnd` | `(value) => void` | Once on release |

Game code: `getRangeSliderValue(id)`, `setRangeSliderValue(id, value)`.

```tsx
<RangeSlider id="volume" width="20vw" defaultValue={70} onChange={(v) => setVolume(v / 100)} />
<RangeSlider id="fov" variant="outline" min={40} max={120} step={10} value={fov} onChange={setFov} />
<RangeSlider id="music" shape="inset" defaultValue={50} />
<RangeSlider id="zoom" shape="capsule" height={36} defaultValue={50} />
```

---

## Color picker

HSV colour wheel: hue around the circle (red at the top), saturation outward from the centre, plus an optional brightness slider and preset swatches.

React-ECS pointer events carry no position, so the wheel is tiled with an N×N grid of invisible hit cells (only cells touching the circle are created). A click picks that cell's centre; on desktop, holding and dragging refines the pick continuously (cursor offset from the drag start via `PrimaryPointerInfo.screenCoordinates` — not summed `screenDelta`, which drops movement between scene ticks and lags). Mobile has no free cursor, so taps snap to the nearest cell — raise `gridResolution` for finer taps.

The wheel texture is generated from the same function the component uses to turn a hit back into a colour (`colorPicker.math.ts` → `sampleWheel`), so the picture and the picked colour always line up. Regenerate with `npm run generate-color-picker-textures` after changing the math.

### `ColorPicker`

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique id (required) — keys the state controller |
| `defaultColor` | `Color4 \| string` | Starting colour, used once when the controller is created (`#FFFFFF`) |
| `size` | `PositionUnit` | Wheel diameter, px / vw / vh (default `220`) |
| `showValueSlider` | `boolean` | Brightness slider under the wheel (`true`) |
| `sliderHeight` | `number` | Slider height, pill-shaped (default `28`) |
| `gridResolution` | `number` | Hit cells per side (default `16`, ≈ 0.8 × N² entities) |
| `presets` | `string[]` | Optional hex swatches |
| `presetSize` | `number` | Swatch size (default `28`) |
| `spacing` | `number` | Gap between wheel / slider / presets (default `12`) |
| `onChange` | `(color: Color4, hex: string) => void` | Every change — click, each drag frame, preset |
| `uiTransform` | native | Extra layout for the root column |

### Reading the value elsewhere

| Function | Description |
|---|---|
| `getColorPickerColor(id)` | Current `Color4` (copy), or `null` before first render |
| `getColorPickerHex(id)` | Current `#RRGGBB`, or `null` |
| `setColorPickerColor(id, color, notify?)` | Set from code (`Color4` or hex); `notify: true` also fires `onChange` |
| `getColorPickerProps(id)` | The underlying `PropsController<ColorPickerState>` (`hue`, `saturation`, `value`, `color`, `hex`) |

Colour helpers `hsvToRgb`, `rgbToHsv`, `hexToRgb`, `rgbToHex` are exported too.

```tsx
<ColorPicker
	id           = "hair"
	defaultColor = "#3BA4FF"
	presets      = {['#000000', '#5A3825', '#E8C07D']}
	onChange     = {(color, hex) => setHairColor(color)}
/>

// anywhere else:
const hex = getColorPickerHex('hair')
```

Pointer: wheel and slider pick on `mouseDown` (so a drag can start); presets follow the button rule (`mouseDown` on mobile, `mouseUp` on desktop). While dragging, a pointer-blocking release catcher sits over the screen and is removed on release.

Demo: showcase **Components → Color Picker** (`demo.colorPicker.layer.tsx`).

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
| `FlashColor` | Lerps child tint toward `flashColor` |
| `FlashBorder` | Flashes border toward `flashColor` |

### Spinner extras

| Option | Type | Description |
|---|---|---|
| `degrees` | `number` | Degrees rotated during one `duration` (negative = reverse) |

```tsx
import { Bounce, FontAwesome, Spinner } from '@stom66/dcl-ui-component-kit'

<Spinner id="loader" duration={1} degrees={180} burstInterval={0}>
	<FontAwesome icon="hourglass" fontSize={48} />
</Spinner>

<Bounce duration={0.6}>
	<FontAwesome icon="star" fontSize={48} />
</Bounce>
```

Demo: `src/exampleThemes/showcase/layers/components/demo.animations.layer.tsx` in this repo.

---

## Theme & utilities

| Export | Role |
|---|---|
| `getTheme` / `buildTheme` / `defaultTheme` / `setTheme` / `theme` | Theme access |
| `darken` / `lighten` / `alpha` | Colour helpers |
| `getUVCell` / `getUVColumn` / `getUVRow` | Low-level UVs (1-based) |
| `resolveAspectDimensions` / `sizeValueToPixels` | Aspect-aware sizing |
| `vwToPixels` / `vhToPixels` | Virtual canvas math |
| `getLeftZoneInset` | Live left-rail inset for left-edge zones |
| `vWidth` / `vHeight` / `getUiScaleFactor` | Virtual canvas constants + SDK scale mirror (`min(phys/virtual)`) |
| `scaleThemeFontSize` / `resolveTypographySize` | Font scaling for raw `UiEntity` only — kit `Text` / `Label` auto-scale |
| `resolveKitEntityProps` | Kit shorthands → native `UiEntity` props, for custom components |
| `tweenValue` / `lerp` / `easingFunctions` | Shared easing |

Virtual canvas (desktop `1920×1080`, mobile `1600×720`) is set once in `utils/sizing.ts` and passed to `ReactEcsRenderer`. Smaller virtual size makes numeric/`px` UI larger on screen; `%` / native `vw`/`vh` are unaffected. Use `scaleThemeFontSize` for fonts on raw `UiEntity` only — kit text auto-scales. Do not use either scaler on border radii or padding.
