# Scaling UI examples

## Correct layer shape

- One layer → one zone (`zone: ZoneType.*`)
- Implement `body()` only
- Size / align / chrome via forwarded native props (`uiTransform`, `uiBackground`)

Real references: `simple.layer.tsx`, `timer.layer.tsx`, `info.layer.tsx`

## Top-bar timer (preset + uiTransform / uiBackground)

```tsx
import { scaleFontSize } from '@dcl/sdk/react-ecs'

export class TimerLayer extends Layer {
	constructor() {
		const theme = getTheme()

		super({
			id          : 'timer',
			zone        : ZoneType.BarTop,
			showFrame   : true,
			uiBackground: { color: theme.colors.primary },
			uiTransform : {
				width       : '30vw',
				height      : '10vw',
				borderRadius: 8,
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
			<UiBox
				key="timer-value"
				uiText={{
					value   : String(seconds),
					fontSize: scaleFontSize(theme.typography.size.h1),
				}}
			/>
		)
	}
}
```

## Alignment overrides

```tsx
super({
	id  : 'hud',
	zone: ZoneType.BarLeft,
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
	showFrame      : true,
})
```

Zones are bare by default. Opt in with `showFrame: true` for fill, border, and padding.

## Buttons (ask image vs text first)

Ask whether the control is an image button or a simple text button, then use `ButtonImage` or `ButtonText`. Never hand-roll `UiBox` + mouse handlers.

```tsx
// Text — no dedicated image asset
<ButtonText
	id        = "btn_simple_toggle"
	textLabel = "Simple"
	callback  = {() => simpleLayer.toggle()}
/>

// Image — atlas / texture
<ButtonImage
	id         = "btn_help"
	textureSrc = "assets/images/scaling-ui/atlas-btn-help.png"
	callback   = {() => helpLayer.toggle()}
/>
```

## Anti-patterns

```tsx
// BAD — UiBox shorthands / parallel APIs on Layer
super({ backgroundColor: …, borderRadius: 8, themeBackground: 'primary' })

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

// GOOD — native uiBackground / uiTransform
super({
	zone        : ZoneType.BarTop,
	showFrame   : true,
	uiBackground: { color: getTheme().colors.primary },
	uiTransform : { width: '30vw', height: '10vw', borderRadius: 8 },
})
```
