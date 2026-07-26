# Scaling UI examples

## Correct layer shape

- One layer → one zone (`zone: ZoneType.*`)
- Implement `body()` only
- Size / align / chrome via forwarded native props (`uiTransform`, `uiBackground`)

Real references: `simple.layer.tsx`, `timer.layer.tsx`, `info.layer.tsx`

## Top-bar timer (preset + uiTransform / uiBackground)

```tsx
export class TimerLayer extends Layer {
	constructor() {
		const theme = getTheme()

		super({
			id          : 'timer',
			zone        : ZoneType.BarTop,
			uiBackground: { color: theme.colors.primary },
			uiTransform : {
				width       : '30vw',
				height      : '10vw',
				borderRadius: 8,
			},
		})

		this.data = new DataController<Record<string, unknown>>({
			secondsRemaining: 60,
		})
	}

	protected body() {
		const seconds = this.data!.get('secondsRemaining') as number
		return (
			<UiBox
				key="timer-value"
				uiText={{ value: String(seconds) }}
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

## Close button

```tsx
super({
	id             : 'notification',
	zone           : ZoneType.Default,
	canBeHidden    : true,
	startHidden    : true,
	showCloseButton: true,
})
```

## Anti-patterns

```tsx
// BAD — UiBox shorthands / parallel APIs on Layer
super({ backgroundColor: …, borderRadius: 8, themeBackground: 'primary' })

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
	uiBackground: { color: getTheme().colors.primary },
	uiTransform : { width: '30vw', height: '10vw', borderRadius: 8 },
})
```
