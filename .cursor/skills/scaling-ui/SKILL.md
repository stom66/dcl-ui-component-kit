---
name: scaling-ui
description: >-
  Build and extend Decentraland Scaling UI layers, zones, and components.
  Use when creating UI, popups, HUDs, layers, zones, timers, themes, buttons
  (ButtonImage / ButtonText), or anything under src/scaling-ui or src/examples.
  MUST be read before adding or changing a Layer or button.
---

# Scaling UI

Lightweight reusable UI for Decentraland SDK7. Prefer framework primitives over raw `UiEntity` layout.

**Before creating or editing a Layer:** read this skill and mirror `src/examples/layers/*.layer.tsx`. Do not invent a parallel mount path or new Layer option fields for props Zone already accepts.

## Core model

1. **`SetupScalingUI({ theme, layers })`** mounts the renderer inside **`ScreenInsetArea`** (device hardware safe margins) with a 100% × 100% stack.
2. **One Layer = one Zone.** The layer fills that zone. Implement **`body()` only**.
3. **`zone: ZoneType.*`** selects a preset (`zone.presets.ts`). Base `Layer.render()` mounts **`Zone`** only (the inset canvas is owned by SetupScalingUI — do not wrap layers in `ZoneRoot` / `ScreenInsetArea`).
4. **`uiTransform` / `uiBackground`** on `LayerOptions` are passed straight through to that Zone and merge on top of the preset.
5. Compose content with **`Row` / `Column` / `UiBox` / …** inside `body()`.

Import the package entry from whatever path the host project uses.
**Inside `scaling-ui/` itself, use relative imports only.**

## Prop forwarding (critical)

Layer accepts optional **`uiTransform`** and **`uiBackground`** and passes them to the Zone. Do not add UiBox shorthand props (`backgroundColor`, `borderRadius`, …) on `LayerOptions` — put those on the native objects:

- Fill → `uiBackground: { color }`
- Radius / border → `uiTransform: { borderRadius, borderColor, borderWidth, … }`
- Size / flex → `uiTransform: { width, height, alignItems, justifyContent, … }`

Zone merges transforms as:

`flex defaults → zone preset → uiTransform overrides`

```tsx
super({
	id          : 'timer',
	zone        : ZoneType.BarTop,
	showFrame   : true,
	uiBackground: { color: getTheme().colors.primary },
	uiTransform : {
		width         : '30vw',
		height        : '10vw',
		borderRadius  : 8,
		alignItems    : 'center',
		justifyContent: 'center',
	},
})
```

| Need | How |
|---|---|
| Top bar / corner / etc. | `zone: ZoneType.BarTop` |
| Narrower / shorter than preset | `uiTransform: { width, height }` |
| Flex alignment | `uiTransform: { alignItems, justifyContent, … }` |
| Fill / radius on the layer-zone | `uiBackground` / `uiTransform.borderRadius` |
| Close control | `showCloseButton: true` (Layer option → Zone inserts button) |
| Zone fill + border + padding | `showFrame: true` |

**Anti-pattern:** adding Layer shorthand fields (`backgroundColor`, `borderRadius`, `themeBackground`, `widthVw`, …). Use `uiTransform` / `uiBackground` only.

### VH / VW helpers

For `uiTransform` sizes/positions, prefer native strings (`'30vw'`, `'10vh'`).

`vwToPixels` / `vhToPixels` are for **numeric** math (clamping, offsets, off-screen
travel). They convert against the **virtual** canvas — never the physical screen.

### Typography / fontSize (critical)

Theme `typography.size.*` values are **base pixel numbers only**. They must never call
`scaleFontSize` — theme / `buildTheme` run once at load, before canvas size is known.

**Every `fontSize` assignment in TSX must wrap the base size with `scaleFontSize` at
render time** (when the UI function / `body()` runs and canvas info exists):

```tsx
import { scaleFontSize } from '@dcl/sdk/react-ecs'

uiText={{
	value   : 'Hello',
	fontSize: scaleFontSize(theme.typography.size.default),
}}
```

Optional second arg overrides the viewport scale unit (SDK default `0.39` width-based):
`scaleFontSize(16, '1.5vw')`. Do not pass a third string like `"100vh"` — the third
arg is an optional `ScaleContext` object, not a unit.

| Wrong | Right |
|---|---|
| `fontSize: theme.typography.size.h1` | `fontSize: scaleFontSize(theme.typography.size.h1)` |
| `scaleFontSize(...)` inside `defaultTheme` / `buildTheme` | Keep theme sizes as plain numbers; wrap only in TSX |
| Raw `fontSize` in a Layer `body()` or `uiText` override | Always `scaleFontSize(...)` |

If a caller overrides `uiText.fontSize`, that override must also use `scaleFontSize`.

## Create a layer

```tsx
export class MyLayer extends Layer {
	constructor() {
		super({
			id       : 'my-layer',
			zone     : ZoneType.Default,
			showFrame: true,
		})
	}

	protected body() {
		return <UiBox key="my-body" uiText={{ value: 'Hello' }} />
	}
}

export const myLayer = new MyLayer()
```

## Critical anti-patterns

| Wrong | Right |
|---|---|
| Override `render()` to wrap `ScreenInsetArea` / `ZoneRoot` / `Zone` | Base `Layer.render()`; only implement `body()` |
| Hand-build edge layout | `zone: ZoneType.*` |
| Layer shorthands (`backgroundColor`, `borderRadius`) | `uiBackground` / `uiTransform` |
| Treat `Layer` as JSX | `class X extends Layer` + export instance |
| `UiBox` + `onMouseDown` / `onMouseUp` as a button | `ButtonImage` or `ButtonText` (ask which — see Buttons) |
| Bare `fontSize: theme.typography.size.*` | `fontSize: scaleFontSize(theme.typography.size.*)` |

## Buttons

When creating any kind of button element, ask the user if this is meant to be an **image button** or just a **simple text button**, then use the appropriate component. Do not invent a clickable `UiBox`; do not guess.

| Kind | Component | Use when |
|---|---|---|
| Image | `ButtonImage` | Atlas / texture button (hover + press states) |
| Text | `ButtonText` | Labelled control with no dedicated image asset |
| Close / dismiss | `ButtonImageClose` or `showCloseButton: true` | Hideable layer chrome |

Both `ButtonImage` and `ButtonText` take a unique `id` and a `callback`. See `src/scaling-ui/components/buttons/`.

```tsx
<ButtonText
	id        = "btn_simple_toggle"
	textLabel = "Simple"
	callback  = {() => simpleLayer.toggle()}
/>
```

```tsx
<ButtonImage
	id         = "btn_help"
	textureSrc = "assets/images/scaling-ui/atlas-btn-help.png"
	callback   = {() => helpLayer.toggle()}
/>
```

## Hideable + close button

`canBeHidden` / `startHidden` / `showCloseButton` / `showFrame` are **Layer** options. The Zone receives them; when `showCloseButton` is set, the Zone injects `ButtonImageClose`. Zones are bare by default — pass `showFrame: true` for theme body fill, border, and 8px padding (e.g. panels and popups). Leave it off for controls that bring their own visuals (e.g. a toggle `ButtonText`).

## Data / keys / style

- Live values on `this.props` (`PropsController`) — see `timer.layer.tsx`
- Sibling `key`s unique among siblings; `ButtonImage` / `ButtonText` `id`s unique among concurrent buttons
- `console.error` over `throw`; tabs; MARK comments; relative imports inside `scaling-ui/`

## More examples

See [examples.md](examples.md) and `src/examples/layers/`.
