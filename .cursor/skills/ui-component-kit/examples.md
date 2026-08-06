# UI Component Kit examples

## Correct layer shape

- One layer → one zone (`zone: ZoneType.*`)
- Implement `body()` only
- Size / align via forwarded native props (`uiTransform`, `uiBackground`)
- Panel chrome via `<Background>` inside `body()`

Real references: `simple.layer.tsx`, `timer.layer.tsx`, `info.layer.tsx`

## Top-bar timer (preset + uiTransform + Background)

```tsx
import { scaleFontSize } from '@dcl/sdk/react-ecs'

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
		return (
			<Background backgroundColor={theme.colors.primary} borderRadius={8}>
				<UiBox
					key="timer-value"
					uiText={{
						value   : String(seconds),
						fontSize: scaleFontSize(theme.typography.size.h1),
					}}
				/>
			</Background>
		)
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

**Required for grid widths.** Use `cols` on `Column` / `Label` / `ButtonText` — never `width: '100%'` / `'50%'` / `'25%'` when a span will do. Grid is 12-wide; `cols={12}` = full width. `Row` is always full parent width (no `cols` — wrap content in a `Column` to narrow). `cols="auto"` **fills** leftover row space (sibling autos share equally); omit `cols` on `Column` for no grid sizing. Explicit partial spans stay sticky (two `cols={4}` do not become half-width). Parents of nested `cols` children need a definite width (usually `cols={12}` on a vertical stack).

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

`Row` applies default `theme.spacing` gutters. Partial `cols` use sticky `%` widths (so `flexWrap` works). Wrap rows use padded cell wrappers for gutters; non-wrap rows use spacer entities. Avoid extra horizontal margins on `cols` children inside a spaced non-wrap `Row`.

See `demo.layout.layer.tsx` for a full showcase.

## Close button / framed panel

```tsx
super({
	id             : 'notification',
	zone           : ZoneType.Default,
	canBeHidden    : true,
	startHidden    : true,
	showCloseButton: true,
})

// in body():
<Background>
	{/* panel content */}
</Background>
```

Zones are bare by default. Wrap content in `<Background>` for fill and border.

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

Include `toastHostLayer` in the `SetupUiComponentKit` layer list, then:

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

## Progress bars

> **Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`)

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

// Atlas fill + procedural border / track
<ProgressBarImage
	id     = "xp_grad"
	value  = {65}
	height = {24}
	atlas  = {atlasGradientColors}
/>

// Custom textures from exampleThemes/showcase (partial OK)
<ProgressBarImage
	id       = "xp_custom"
	value    = {70}
	textures = {exampleProgressBarTexturesHorizontal}
	height   = {64}
/>
```

## Icons (image-based)

```tsx
import { exampleIconsAtlas, exampleNumbersAtlas } from '../../exampleThemes/showcase'
import { AvatarIcon, DEFAULT_AVATAR_USER_ID, Icon, IconNumber } from '../../components'
import { getTheme } from '../../styles'

<Icon src={exampleIconsAtlas.source} uvs={exampleIconsAtlas.uv.coins} />
<Icon uvs={exampleIconsAtlas.uv.star} color={getTheme().colors.primary} />
<IconNumber value={42} atlas={exampleNumbersAtlas} />
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

// GOOD — zone size via uiTransform; chrome via Background
super({
	zone       : ZoneType.Top,
	uiTransform: { width: '30vw', height: '10vw' },
})

protected body() {
	return (
		<Background backgroundColor={getTheme().colors.primary} borderRadius={8}>
			{/* … */}
		</Background>
	)
}
```
