---
name: scaling-ui
description: >-
  Build and extend Decentraland Scaling UI layers, zones, and components.
  Use when creating UI, popups, HUDs, layers, zones, timers, themes, or anything
  under src/scaling-ui or src/examples. MUST be read before adding or changing a Layer.
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

**Anti-pattern:** adding Layer shorthand fields (`backgroundColor`, `borderRadius`, `themeBackground`, `widthVw`, …). Use `uiTransform` / `uiBackground` only.

### VH / VW helpers

For `uiTransform` sizes/positions, prefer native strings (`'30vw'`, `'10vh'`).

`vwToPixels` / `vhToPixels` are for **numeric** math (clamping, offsets, off-screen
travel). They convert against the **virtual** canvas — never the physical screen.

## Create a layer

```tsx
export class MyLayer extends Layer {
	constructor() {
		super({
			id  : 'my-layer',
			zone: ZoneType.Default,
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

## Hideable + close button

`canBeHidden` / `startHidden` / `showCloseButton` are **Layer** options. The Zone receives them; when `showCloseButton` is set, the Zone injects `ButtonImageClose`.

## Data / keys / style

- Live values on `this.data` (`DataController`) — see `timer.layer.tsx`
- Sibling `key`s unique among siblings; `ButtonImage` `id`s unique among concurrent buttons
- `console.error` over `throw`; tabs; MARK comments; relative imports inside `scaling-ui/`

## More examples

See [examples.md](examples.md) and `src/examples/layers/`.
