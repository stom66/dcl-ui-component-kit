# Layers and zones

## `Layer`

Class-based UI surface. Implement **`body()` only**. Base `render()` mounts the zone.

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Unique layer id |
| `zone` | `ZoneType` | `FullScreen` | Preset layout slot |
| `canBeHidden` | `boolean` | `false` | Enables `show()` / `hide()` / `toggle()` |
| `startHidden` | `boolean` | `false` | Begin off-screen (needs `canBeHidden`) |
| `showCloseButton` | `boolean` | `false` | Injects `ButtonImageClose` into the zone |
| `showFrom` | `VisibilityPosition` | zone preset | Edge used when showing |
| `hideTo` | `VisibilityPosition` | `showFrom` / preset | Edge used when hiding |
| `zIndex` | `number` | — | Stack order |
| `uiTransform` | `UiTransform` | — | Forwarded to the Zone (size / flex) |
| `uiBackground` | `UiBackground` | — | Forwarded to the Zone |

**Do not** add Layer shorthands (`backgroundColor`, `borderRadius`, `showFrame`, …). Panel chrome → `<Background>` in `body()`.

### Example

```tsx
import { Background, Header, Layer, Row, Text, ZoneType } from '@stom66/dcl-ui-component-kit'

export class ScoreboardLayer extends Layer {
	constructor() {
		super({
			id         : 'scoreboard',
			zone       : ZoneType.Top,
			uiTransform: { width: '30vw', height: '10vw' },
		})
	}

	body() {
		return (
			<Background>
				<Row alignItems="center" justifyContent="space-between" padding={12}>
					<Header value="Score" />
					<Text value="12" />
				</Row>
			</Background>
		)
	}
}

export const scoreboardLayer = new ScoreboardLayer()
```

### Hideable popup

```tsx
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

	body() {
		return (
			<Background>
				<Header value="Quest complete" />
			</Background>
		)
	}
}

// later…
notificationLayer.show()
```

Live values belong on `this.props` (`PropsController`) — see `src/exampleThemes/showcase/layers/timer.layer.tsx` in this repo.

---

## Zones

Zones are preset layout slots on the virtual canvas. Layers pick one via `zone: ZoneType.*`.

### `ZoneType`

| Value | Typical use |
|---|---|
| `Default` | Centered modal / panel |
| `FullScreen` | Full canvas overlay (Layer constructor default) |
| `InteractableArea` | Fits the explorer interactable area |
| `Top` / `Bottom` | Edge chrome |
| `TopLeft` / `TopRight` / `BottomLeft` / `BottomRight` | Corner HUD slots (`TopLeft`/`TopRight` `20vw` side inset; `BottomLeft` `25vw`) |
| `LeftTop` / `Left` / `LeftBottom` | Left strip (same insets; content `flex-start` / center / `flex-end`) |
| `RightTop` / `Right` / `RightBottom` | Right strip (mirror of left) |
| `None` | Raw content (no zone wrapper) |

Zone merges transforms as: **flex defaults → zone preset → `uiTransform` overrides**.

Named helpers (`ZoneTop`, `ZoneBottomRight`, …) wrap the same presets when you need a zone outside a `Layer`.

Do **not** remount `ScreenInsetArea`, `ZoneRoot`, or `Zone` inside a layer’s `render()` — `SetupUiComponentKit` owns the inset canvas.

---

## Toasts

Ephemeral notifications need an always-mounted `toastHostLayer` in `SetupUiComponentKit({ layers })`, then `showToast` / `hideToast` / `clearToastGroup`.

### `showToast` options

| Option | Type | Description |
|---|---|---|
| `content` | `() => JSX` | Toast body |
| `position` | `ToastPosition` | `top` / `bottom` / `topLeft` / `topRight` / `bottomLeft` / `bottomRight` |
| `duration` | `number` | Seconds visible |
| `isDismissable` | `boolean` | Click to dismiss |
| `showFrom` / `hideTo` | edge | Enter / exit edges |
| `width` / `height` | number | Size |
| `group` | `string` | Optional group id |
| `groupPolicy` | `'stack' \| 'queue' \| 'replace'` | Group behaviour |
| `scaleIn` / `scaleOut` / `scalePulse` | — | Scale on the toast root |

```tsx
import { SetupUiComponentKit, showToast, toastHostLayer, Text } from '@stom66/dcl-ui-component-kit'

SetupUiComponentKit({
	layers: [/* … */, toastHostLayer],
})

showToast({
	position     : 'top',
	duration     : 2.5,
	isDismissable: true,
	content      : () => <Text value="Quest updated" />,
	width        : 200,
	height       : 48,
	group        : 'hints',
	groupPolicy  : 'queue',
})
```
