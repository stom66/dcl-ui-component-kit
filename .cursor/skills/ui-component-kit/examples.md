# UI Component Kit examples

## Correct layer shape

- One layer → one zone (`zone: ZoneType.*`)
- Implement `body()` only
- Size / align via forwarded native props (`uiTransform`, `uiBackground`) on **Layer / Zone**
- Inside `body()`, prefer component **shorthands** (`fontColor`, `backgroundColor`, `iconColor`, `fontSize`, `flexWrap`, `padding`, …) over nesting `uiText` / `uiTransform` / `uiBackground`
- Panel chrome via **sibling** empty `<Background />` in `body()` — never nest content inside it (preserves zone flex)
- **Edge / corner HUDs:** keep content content-sized (omit `cols` on `ButtonText` / `Label`; do not wrap a lone control in `<Row>` or `<Column cols={12}>`) so zone `alignItems` / `justifyContent` apply. **Panels:** size the Layer with `uiTransform`, then use `cols={12}` inside that box.

Real references: `demo.safeZone.factory.tsx`, `timer.layer.tsx`, `info.layer.tsx`, `demo.grids.layer.tsx`

## Edge-zone HUD (content-sized — zone flex applies)

```tsx
export class CtaLayer extends Layer {
	constructor() {
		super({
			id  : 'cta',
			zone: ZoneType.BottomCenter,
		})
	}

	protected body() {
		// omit cols — theme aspect size; BottomCenter centers horizontally + pins bottom
		return (
			<ButtonText
				key       = "btn_go"
				id        = "btn_go"
				textLabel = "Go"
				callback  = {() => { /* … */ }}
			/>
		)
	}
}
```

```tsx
// BAD — fills the safe zone; zone justifyContent / alignItems become no-ops
protected body() {
	return <ButtonText id="btn_go" textLabel="Go" cols={12} callback={() => { /* … */ }} />
}

// BAD — Row is always width 100%
protected body() {
	return (
		<Row>
			<ButtonText id="btn_go" textLabel="Go" callback={() => { /* … */ }} />
		</Row>
	)
}
```

## Top-bar timer (preset + uiTransform + Background)

```tsx
export class TimerLayer extends Layer {
	constructor() {
		super({
			id  : 'timer',
			zone: ZoneType.Top,
			uiTransform: {
				width : '30vw',
				height: '10vw',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			secondsRemaining: 60,
		})
	}

	protected body() {
		const theme   = getTheme()
		const seconds = this.props!.get('secondsRemaining') as number
		return [
			<Background key="chrome" backgroundColor={theme.colors.primary} borderRadius={8} />,
			<Text
				key       = "timer-value"
				value     = {String(seconds)}
				fontSize  = {theme.typography.size.h1}
				textAlign = "middle-center"
			/>,
		]
	}
}
```

## Alignment overrides

```tsx
super({
	id  : 'hud',
	zone: ZoneType.Left,
	uiTransform: {
		alignItems    : 'flex-start',
		justifyContent: 'flex-end',
	},
})
```

## Row / Column widths (`cols`)

**Required for grid widths inside panels.** Use `cols` on `Column` / `Label` / `ButtonText` — never `width: '100%'` / `'50%'` / `'25%'` when a span will do. Grid is 12-wide; `cols={12}` = full width. `Row` is always full parent width (no `cols` — wrap content in a `Column` to narrow). `cols="auto"` **fills** leftover row space (sibling autos share equally); omit `cols` on `Column` for no grid sizing; omit `cols` on `ButtonText` / `Label` for shrink-to-content (**required** when the control is a direct edge-zone sibling). Explicit partial spans stay sticky (two `cols={4}` do not become half-width). Parents of nested `cols` children need a definite width (usually `cols={12}` on a vertical stack).

Do **not** put `cols={12}` or a bare `<Row>` on a lone HUD control in `BottomCenter` / corner zones — that stretches the control across the safe zone and cancels zone alignment (see **Edge-zone HUD** above).

```tsx
// GOOD
<Column cols={12}>
	<Row>
		<Column cols={4}>{/* sticky 4/12 */}</Column>
		<Column cols="auto">{/* fill remainder */}</Column>
	</Row>
	<Row>
		<Column cols="auto">{/* half */}</Column>
		<Column cols="auto">{/* half */}</Column>
	</Row>
	<Row>
		<Column cols={3}>{/* sidebar */}</Column>
		<Column cols={9}>{/* main */}</Column>
	</Row>
</Column>

// BAD — do not copy this from older demos
<Column uiTransform={{ width: '100%' }}>
	<Row uiTransform={{ width: '100%' }}>
```

Reserve `uiTransform.width` for non-grid sizes (`vw` / `vh` / px). `height` is unaffected — keep using `uiTransform.height` as needed.

Optional **`colsDesktop` / `colsMobile`** override `cols` per platform. They are resolved **at render** (`isDesktop()` / `isMobile()`). A ternary like `cols={isMobile() ? 12 : 6}` in `body()` is also live each frame. Do **not** snapshot `isMobile()` into a module-level `const`.

`Row` applies default `theme.spacing` gutters. Partial `cols` use sticky `%` widths (so `flexWrap` works). When any child uses `cols`, `Row` applies padded cell wrappers for gutters; content-sized (no `cols`) non-wrap rows use spacer entities. Avoid extra horizontal margins on `cols` children inside a spaced `Row`.

**Equal-cell inventories** — prefer `Grid` (not `flexWrap` + `cols`):

```tsx
<Grid limit={4} spacing={8}>
	{items.map((item) => (
		<Column key={item.id} alignItems="center" justifyContent="center" minHeight={48}>
			{/* cell content — do not set cols on cells */}
		</Column>
	))}
</Grid>
```

`limit` = items per row (`direction="horizontal"`, default) or per column (`direction="vertical"`). See `demo.grids.layer.tsx`. For mixed 12-col spans, keep using `Row` / `Column` + `cols` (`demo.layout.layer.tsx`).

## Text / Background shorthands

```tsx
[
	<Background key="chrome" backgroundColor={theme.colors.primary} />,
	<Column key="body" cols={12} alignItems="stretch" padding={16}>
		<H2 value="Title" />
		<Text
			value    = "Body copy"
			fontSize = {theme.typography.size.small}
			fontColor    = {theme.colors.light}
		/>
		<Code value="const x = 1" />
	</Column>,
]
```

`fontSize` takes a **theme-base px** number — prefer `theme.typography.size.*` (`small`, `default`, `code`, `h1`–`h6`). Kit components auto-scale; do not wrap with `scaleFontSize`. Ad-hoc numbers are still theme-base px. Raw `UiEntity` only: `scaleThemeFontSize(theme.typography.size.default)`. Use `fontColor` on text, `backgroundColor` on fills (including icon chip wrappers), `iconColor` to tint icon textures.

## Close button / framed panel

```tsx
super({
	id             : 'notification',
	zone           : ZoneType.Default,
	canBeHidden    : true,
	startHidden    : true,
	showCloseButton: true,
})

// in body() — chrome sibling, then content
return [
	<Background key="chrome" />,
	{/* panel content */},
]
```

Zones are bare by default. Add a sibling `<Background />` for fill and border — do not nest content inside it.

### Different show / hide edges

```tsx
super({
	id         : 'panel',
	zone       : ZoneType.Default,
	canBeHidden: true,
	startHidden: true,
	showFrom   : 'bottom',
	hideTo     : 'top',
})
```

## Toasts

Include `toastHostLayer` in the `SetupUiComponentKit` layer list. The host uses `ZoneType.None` and renders toast views only (no full-screen wrapper). Then:

```tsx
import { showToast, clearToastGroup } from '../../components/toasts'

showToast({
	position     : 'bottom',
	showFrom     : 'bottom',
	hideTo       : 'top',
	duration     : 2.5,
	isDismissable: true,
	content      : () => <Text value="Hello" />,
	width        : 180,
	height       : 48,
})

// Queued hint sequence
showToast({
	position   : 'top',
	group      : 'hints',
	groupPolicy: 'queue',
	content    : () => <Icon … width="100%" height="100%" />,
	width      : 64,
	height     : 64,
})

clearToastGroup('hints')
```

Demo control panel: `demo.toasts.layer.tsx`.

## Buttons (ask image vs text first)

> **Variants:** procedural (`ButtonText`) · image-based (`ButtonImage`)

Ask whether the control is an image button or a simple text button, then use `ButtonImage` or `ButtonText`. Never hand-roll `UiBox` + mouse handlers.

On **mobile**, `callback` fires on `mouseDown`; on **desktop**, on `mouseUp` after hover. The kit uses `isMobile()` for that split (not `!isDesktop()`).

```tsx
// Text — procedural, no dedicated image asset
<ButtonText
	id        = "btn_simple_toggle"
	textLabel = "Simple"
	callback  = {() => simpleLayer.toggle()}
/>

// Image — atlas / texture (column = variant, rows = states)
import { atlasBtnIconsStyled } from '../../atlases'

<ButtonImage
	id         = "btn_help"
	textureSrc = {atlasBtnIconsStyled.source}
	uvColumn   = {1}
	callback   = {() => helpLayer.toggle()}
/>
```

`uvColumn` is 1-based (first variant = `1`). Custom atlas (art from `design/ui-component-kit-assets.af` → export under `assets/images/example-themes/showcase/`, declare in `src/exampleThemes/showcase/`):

```tsx
import { exampleBtnIconsAtlas } from '../../exampleThemes/showcase'

<ButtonImage
	id            = "btn_custom"
	textureSrc    = {exampleBtnIconsAtlas.source}
	uvColumn      = {1}
	uvColumnCount = {exampleBtnIconsAtlas.columns}
	uvRowCount    = {exampleBtnIconsAtlas.rows}
	callback      = {() => { /* … */ }}
/>
```

Wide blank sheet (`atlasBtn3x1`) as the button texture with nested icon + label (see `demo.buttons.layer.tsx`). Prefer `atlas={…}` so atlas `inset` / `insetX` / `insetY` apply:

```tsx
import { atlasBtn3x1, atlasIconsFontAwesome, ButtonImage, Icon, Row, Text } from '../../../ui-component-kit'

<ButtonImage
	id          = "btn_click_me"
	atlas       = {atlasBtn3x1}
	uvColumn    = {1}
	width       = {192}
	height      = {64}
	callback    = {() => { /* … */ }}
	uiTransform = {{
		positionType: 'relative',
		position    : { top: 0, left: 0 },
	}}
>
	<Row height="100%" alignItems="center" justifyContent="center" spacing={8}>
		<Icon uvs={atlasIconsFontAwesome.uv.handPointer} width={28} height={28} iconColor={theme.colors.dark} />
		<Text value="Click me" width="auto" fontColor={theme.colors.dark} textWrap="nowrap" />
	</Row>
</ButtonImage>
```

## Progress bars

> **Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`) · sprite radial (`ProgressBarRadial`)

```tsx
import { atlasGradientColors } from '../../atlases'
import { exampleProgressBarTexturesHorizontal } from '../../exampleThemes/showcase'

// Procedural — colours only
<ProgressBar id="hp" value={72} height={24} />

// Full built-in nine-slice set
<ProgressBarImage id="xp" value={55} height={64} />

// Image fill + procedural border / track
<ProgressBarImage
	id       = "xp_hybrid"
	value    = {60}
	height   = {32}
	textures = {{ fill: 'assets/images/ui-component-kit/progressBar-horizontal-fill.png' }}
/>

// Atlas fill — STRETCHED (default): UV scales with bar width
<ProgressBarImage
	id     = "xp_grad_stretch"
	value  = {65}
	height = {24}
	atlas  = {atlasGradientColors}
	uvCell = {atlasGradientColors.named.yellowOrange}
/>

// Atlas fill — REVEALED: crop UVs to fill % (gradient peels open, does not squash)
// Prefer this for colour-ramp / strip art. Live demos: demo.progress.layer.tsx
<ProgressBarImage
	id             = "xp_grad_reveal"
	value          = {65}
	height         = {24}
	atlas          = {atlasGradientColors}
	uvCell         = {atlasGradientColors.named.yellowOrange}
	uvCropWithFill = {true}
/>

// Vertical bar + custom art authored upright: uvRotate defaults to 0 (no 90° twist)
<ProgressBarImage
	id             = "xp_vert_custom"
	value          = {65}
	fillFrom       = "bottom"
	width          = {32}
	height         = {200}
	atlas          = {myVerticalFillAtlas}
	uvCell         = {myVerticalFillAtlas.named.fill}
	uvCropWithFill = {true}
/>

// Vertical bar + horizontal strip atlas (stock gradients): opt in to 90° with uvRotate={1}
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

// fillFrom="right": use uvMirror if the ramp should lead from the origin edge
<ProgressBarImage
	id             = "xp_grad_from_right"
	value          = {65}
	fillFrom       = "right"
	height         = {24}
	atlas          = {atlasGradientColors}
	uvCell         = {atlasGradientColors.named.blue}
	uvCropWithFill = {true}
	uvMirror       = {true}
/>

// Custom textures from exampleThemes/showcase (partial OK)
<ProgressBarImage
	id       = "xp_custom"
	value    = {70}
	textures = {exampleProgressBarTexturesHorizontal}
	height   = {64}
/>

// contentInset: number (uniform) or TRBL edges — fill/track only, not children
<ProgressBarImage id="xp_inset" value={55} height={64} contentInset={16} />
<ProgressBarImage
	id           = "xp_inset_trbl"
	value        = {55}
	height       = {64}
	contentInset = {{ top: 8, right: 16, bottom: 8, left: 16 }}
/>

// Radial sprite sheet — progress 0–1, height defaults to width, circular chip
<ProgressBarRadial progress={0.4} width={72} />
<ProgressBarRadial
	progress        = {0.75}
	width           = {64}
	fillColor       = {theme.colors.success}
	backgroundColor = {theme.colors.dark}
/>
<ProgressBarRadial progress={0.4} width={72} mirror={true} />
```

## Icons (image-based)

```tsx
import { exampleIconsAtlas, exampleNumbersAtlas } from '../../exampleThemes/showcase'
import { AvatarIcon, DEFAULT_AVATAR_USER_ID, Icon, IconCharacter, IconNumber, IconString, IconSymbol } from '../../components'
import { getTheme } from '../../styles'

{/* Custom image / atlas: override src (+ uvs for a cell). Full image = src only. */}
<Icon src={exampleIconsAtlas.source} uvs={exampleIconsAtlas.uv.coins} />
<Icon uvs={exampleIconsAtlas.uv.star} iconColor={getTheme().colors.primary} rotate={45} />
{/* backgroundColor = chip behind the glyph; iconColor = texture tint */}
<Icon
	uvs             = {exampleIconsAtlas.uv.star}
	iconColor       = {getTheme().colors.light}
	backgroundColor = {getTheme().colors.primary}
	borderRadius    = {8}
	width           = {48}
	height          = {48}
/>
{/* Prefer IconNumber for scores/timers — smallest atlas, least overhead */}
<IconNumber value={42} atlas={exampleNumbersAtlas} iconColor={getTheme().colors.primary} />
<IconSymbol value="$%#" iconColor={getTheme().colors.warning} rotate={-15} />
<IconCharacter value="HELLO" />
{/* Mixed letters + symbols + numbers — cascades alphanumeric → symbols → numbers */}
<IconString value="HI $120!" iconColor={getTheme().colors.success} />
<AvatarIcon userId={DEFAULT_AVATAR_USER_ID} width={32} height={32} />
```

## Anti-patterns

```tsx
// BAD — UiBox shorthands / parallel APIs on Layer
super({ backgroundColor: …, borderRadius: 8, themeBackground: 'primary', showFrame: true })

// BAD — fake button (no hover / press; bypasses ButtonImage / ButtonText)
<UiBox uiText={{ value: 'Simple' }} onMouseDown={() => simpleLayer.toggle()} />

// BAD — duplicate mount (canvas / zone already owned by SetupUiComponentKit + Layer.render)
render() {
	return (
		<ZoneRoot>
			<Zone type={this.zone}>{this.body()}</Zone>
		</ZoneRoot>
	)
}

// GOOD — zone size via uiTransform; chrome via sibling Background
super({
	zone       : ZoneType.Top,
	uiTransform: { width: '30vw', height: '10vw' },
})

protected body() {
	return [
		<Background key="chrome" backgroundColor={getTheme().colors.primary} borderRadius={8} />,
		{/* content siblings */},
	]
}

// BAD — nesting content inside Background replaces zone flex
<Background backgroundColor={getTheme().colors.primary}>
	{/* … */}
</Background>
```
