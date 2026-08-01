# Scaling UI examples

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

`uvColumn` is 1-based (first variant = `1`). Custom atlas (art from `assets/images/scaling-ui-assets.af` → export under `assets/images/my-theme/`, declare in `src/myTheme.ts`):

```tsx
import { myBtnIconsAtlas } from '../../../myTheme'

<ButtonImage
	id            = "btn_custom"
	textureSrc    = {myBtnIconsAtlas.source}
	uvColumn      = {1}
	uvColumnCount = {myBtnIconsAtlas.columns}
	uvRowCount    = {myBtnIconsAtlas.rows}
	callback      = {() => { /* … */ }}
/>
```

## Progress bars

> **Variants:** procedural (`ProgressBar`) · image-based (`ProgressBarImage`)

```tsx
// Procedural — colours only
<ProgressBar id="hp" value={72} height={24} />

// Image — three textures (background / fill / border)
<ProgressBarImage id="xp" value={55} height={28} />

// Custom textures from myTheme
import { myProgressBarTexturesHorizontal } from '../../../myTheme'

<ProgressBarImage
	id       = "xp_custom"
	value    = {70}
	textures = {myProgressBarTexturesHorizontal}
	height   = {28}
/>
```

## Icons (image-based)

```tsx
import { myIconsAtlas, myNumbersAtlas } from '../../../myTheme'

<Icon iconSrc={myIconsAtlas.source} uvs={myIconsAtlas.uv.coin} />
<IconNumber value={42} atlas={myNumbersAtlas} />
```

## Anti-patterns

```tsx
// BAD — UiBox shorthands / parallel APIs on Layer
super({ backgroundColor: …, borderRadius: 8, themeBackground: 'primary', showFrame: true })

// BAD — fake button (no hover / press; bypasses ButtonImage / ButtonText)
<UiBox uiText={{ value: 'Simple' }} onMouseDown={() => simpleLayer.toggle()} />

// BAD — duplicate mount (canvas / zone already owned by SetupScalingUI + Layer.render)
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
