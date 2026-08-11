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

**Do not** add Layer shorthands (`backgroundColor`, `borderRadius`, `showFrame`, …). Panel chrome → sibling `<Background />` in `body()` (never nest content inside it — that replaces zone flex alignment).

### Zone alignment (content-sized children)

Zone presets place in-flow `body()` siblings with `alignItems` / `justifyContent`. **That only works when those siblings are smaller than the zone.**

| Intent | Do | Avoid |
|---|---|---|
| Edge / corner HUD (`BottomCenter`, `TopRight`, …) | Content-sized controls — omit `cols` on `ButtonText` / `Label` | `cols={12}`, bare `<Row>` (always 100% wide), `<Column cols={12}>` around a lone control |
| Panel / modal | Size the Layer with `uiTransform`, then `Column cols={12}` inside that box | Expecting zone flex to center a full-width child |

```tsx
// GOOD — BottomCenter places a content-sized button
super({ id: 'cta', zone: ZoneType.BottomCenter })
body() {
	return <ButtonText id="btn_go" textLabel="Go" callback={() => { /* … */ }} />
}

// BAD — button spans the safe zone; zone justifyContent is a no-op
body() {
	return <ButtonText id="btn_go" textLabel="Go" cols={12} callback={() => { /* … */ }} />
}
```

See `.cursor/skills/ui-component-kit/SKILL.md` → **Zone alignment needs content-sized children**, and `demo.safeZone.factory.tsx`.

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
		return [
			<Background key="chrome" backgroundColor={/* … */} borderRadius={8} />,
			<Row key="content" alignItems="center" justifyContent="space-between" padding={12}>
				<Header value="Score" />
				<Text value="12" />
			</Row>,
		]
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
		return [
			<Background key="chrome" />,
			<Header key="title" value="Quest complete" />,
		]
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
| `TopCenter` / `BottomCenter` | Centered edge bars (`width: 50%`, pinned with `left: 25%`) |
| `TopLeft` / `TopRight` | Same band as `Top` (`flexDirection: row`); content `flex-start` / `flex-end` |
| `BottomLeft` / `BottomRight` | Corner HUD slots (`BottomLeft` `25vw` side inset) |
| `LeftTop` / `Left` / `LeftBottom` | Left strip (same insets; content `flex-start` / center / `flex-end`) |
| `RightTop` / `Right` / `RightBottom` | Right strip (mirror of left) |
| `None` | Raw content (no zone wrapper) |

Zone merges transforms as: **flex defaults → zone preset → `uiTransform` overrides**.

Explicit `width` / `height` on a stretched corner slot (e.g. `BottomRight` with `left`+`right`) clear the inward edge so the box pins to that corner. Omit size or use `width: '100%'` to keep filling the full slot.

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
