---
name: ui-component-kit
description: >-
  Build and extend Decentraland UI Component Kit layers, zones, and components.
  Use when creating UI, popups, HUDs, layers, zones, timers, themes, buttons
  (ButtonImage / ButtonText), custom icon packs / texture atlases, Affinity
  artboard grids, or anything under src/ui-component-kit (including examples).
  MUST be read before adding or changing a Layer or button.
---

# UI Component Kit

Lightweight reusable UI for Decentraland SDK7. Prefer framework primitives over raw `UiEntity` layout.

**Before creating or editing a Layer:** read this skill and mirror `src/exampleThemes/showcase/layers/*.layer.tsx`. Do not invent a parallel mount path or new Layer option fields for props Zone already accepts.

**Layout widths:** for every `Row` / `Column` / `Label` / `ButtonText` that needs a fractional or full width, set **`cols`** (`cols={12}` = full width). Do **not** copy `width: '100%'` / `'50%'` / `'25%'` from older demos — some examples still use percentages; that is legacy, not the pattern to follow.

## Core model

1. **`SetupUiComponentKit({ theme, layers })`** mounts the renderer inside **`ScreenInsetArea`** (device hardware safe margins) with a 100% × 100% stack.
2. **One Layer = one Zone.** The layer fills that zone. Implement **`body()` only**.
3. **`zone: ZoneType.*`** selects a preset (`zone.presets.ts`). Base `Layer.render()` mounts **`Zone`** only (the inset canvas is owned by SetupUiComponentKit — do not wrap layers in `ZoneRoot` / `ScreenInsetArea`).
4. **`uiTransform` / `uiBackground`** on `LayerOptions` are passed straight through to that Zone and merge on top of the preset.
5. Compose content with **`Row` / `Column` / `Background` / `UiBox` / …** inside `body()`.

**All imports under `src/` must be relative** (`./`, `../`) — never absolute `src/...`.
Stay inside the package with sibling/parent paths (`../components`, `../../styles`) — do not climb out to `src/` and back in via a folder name (`../../ui-component-kit/...`). That hardcodes the package directory name and breaks when it is renamed. Keep multi-named imports on one line.

## Prop forwarding (critical)

Layer accepts optional **`uiTransform`** and **`uiBackground`** and passes them to the Zone. Do not add UiBox shorthand props (`backgroundColor`, `borderRadius`, …) on `LayerOptions` — put those on the native objects, or wrap body content in **`Background`**:

- Zone size / flex → `uiTransform: { width, height, alignItems, justifyContent, … }`
- Panel fill / border → `<Background>` inside `body()` (not Layer options)
- Background fill shorthand → `backgroundColor`
- Background border → `borderColor` / `borderWidth` / `borderRadius`
- Background texture → `textureSrc`

Zone merges transforms as:

`flex defaults → zone preset → uiTransform overrides`

```tsx
super({
	id         : 'timer',
	zone       : ZoneType.Top,
	uiTransform: {
		width         : '30vw',
		height        : '10vw',
		alignItems    : 'center',
		justifyContent: 'center',
	},
})

// in body():
<Background backgroundColor={getTheme().colors.primary} borderRadius={8}>
	{/* … */}
</Background>
```

| Need | How |
|---|---|
| Top / corner / etc. | `zone: ZoneType.*` |
| Narrower / shorter than preset | `uiTransform: { width, height }` |
| Height from children | `uiTransform: { height: 'auto' }` **and** `<Background fitContent>` |
| Flex alignment | `uiTransform: { alignItems, justifyContent, … }` |
| Fill / border on content | `<Background>` in `body()` |
| Close control | `showCloseButton: true` (Layer option → Zone inserts button) |

**Anti-pattern:** adding Layer shorthand fields (`backgroundColor`, `borderRadius`, `themeBackground`, `widthVw`, `showFrame`, …). Use `uiTransform` / `uiBackground` on the Zone, and `Background` for panel chrome.

### Row / Column width (`cols` — required for grid widths)

`Row`, `Column`, `Label`, and `ButtonText` share a **12-column** grid (`theme.cols.COL_COUNT`). **`cols` is the width API.** Never set fractional/full widths via `width` / `uiTransform.width` when a span will do — including the common habit of `width: '100%'`.

| Need | Use |
|---|---|
| Full width of parent | `cols={12}` |
| Half / quarter / custom span | `cols={6}` / `cols={3}` / `cols={n}` |
| Shrink-to-content | omit `cols` (→ `"auto"`) — only when you truly want auto |
| Non-grid size (`vw` / `vh` / px) | `uiTransform.width` (Zone / Layer chrome, fixed icon boxes, etc.) |

| `cols` | Width |
|---|---|
| omitted | `"auto"` (shrink-to-content — **unsafe** as a parent of `%` / nested `cols`) |
| `1` … `11` | `n / 12` of the parent (e.g. `cols={3}` → `25%`, `cols={6}` → `50%`) |
| `12` | `100%` — use this for full-bleed stacks / rows |

```tsx
// GOOD — grid spans
<Column cols={12}>
	<Row cols={12}>
		<Column cols={3}>{/* … */}</Column>
		<Column cols={9}>{/* … */}</Column>
	</Row>
</Column>

// BAD — never do this for Row / Column / Label grid widths
<Column uiTransform={{ width: '100%' }}>
	<Row uiTransform={{ width: '100%' }}>
		<Column uiTransform={{ width: '25%' }}>
```

**Agent trap:** older demo layers and muscle-memory CSS often use `width: '100%'`. That is **not** more reliable than `cols={12}` — it bypasses the grid and is wrong here. Prefer `cols` even when a nearby file still uses percentages.

**Nesting rule:** any `Column` / `Row` that hosts children with `cols={…}` (or `width: '…%'`) must itself have a **definite** width — typically `cols={12}` (or a parent that already spans). If the parent is `cols`-omitted (`auto`), nested percentage widths collapse and content can vanish (fixed-`px` children may still show).

**Row spacing + `cols`:** Yoga has no `calc()`. A `Row` defaults to `theme.spacing` gutters (spacer entities between children — never `createElement` clones; those leak UiEntities in ReactEcs). Partial `cols` (1–11) size via `flexGrow: span` so gutters do not overflow. `cols={12}` stays `width: 100%`. Pass `spacing={0}` to disable gutters. Do **not** add extra horizontal `margin` on `cols` children inside a spaced `Row`.

Optional platform overrides: `colsDesktop` / `colsMobile`. `uiTransform.height` is unrelated — keep using it for vertical size.

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
			id  : 'my-layer',
			zone: ZoneType.Default,
		})
	}

	protected body() {
		return (
			<Background>
				<UiBox key="my-body" uiText={{ value: 'Hello' }} />
			</Background>
		)
	}
}

export const myLayer = new MyLayer()
```

## Critical anti-patterns

| Wrong | Right |
|---|---|
| Override `render()` to wrap `ScreenInsetArea` / `ZoneRoot` / `Zone` | Base `Layer.render()`; only implement `body()` |
| Hand-build edge layout | `zone: ZoneType.*` |
| Layer shorthands (`backgroundColor`, `borderRadius`, `showFrame`) | `uiTransform` / `uiBackground` / `<Background>` |
| Treat `Layer` as JSX | `class X extends Layer` + export instance |
| `UiBox` + `onMouseDown` / `onMouseUp` as a button | `ButtonImage` or `ButtonText` (ask which — see Buttons) |
| Bare `fontSize: theme.typography.size.*` | `fontSize: scaleFontSize(theme.typography.size.*)` |
| `Row` / `Column` / `Label` / `ButtonText` with `width: '100%'` / `'50%'` / `'25%'` | `cols={12}` / `cols={6}` / `cols={3}` (see **Row / Column width**) |
| Text/`H*`/`Code` crushed / overlapping in a height-capped `Column` | Keep kit defaults: `flexShrink: 0`, `minHeight` from font size, `alignSelf: 'flex-start'` — Yoga’s default `flexShrink: 1` collapses `height: 'auto'` text to 0 |
| Layer `height: 'auto'` with default `<Background>` (absolute) | `<Background fitContent>` so chrome contributes in-flow height |

## Procedural vs image-based

Several families ship in two flavours. Document and choose explicitly:

| Kind | Meaning |
|---|---|
| **Procedural** | Colours / theme only — no texture files |
| **Image-based** | PNG / atlas — always overridable (`textureSrc`, `textures`, `atlas`, `src`, …) |

Project art goes under **`assets/images/example-themes/<theme>/`**. Define custom `TextureAtlas` / texture sets in `src/exampleThemes/<theme>/` (see examples there). Do not invent parallel texture APIs.

| Family | Procedural | Image-based | Override |
|---|---|---|---|
| Buttons | `ButtonText` | `ButtonImage` / `ButtonImageClose` | `textureSrc` + `uvColumnCount` / `uvRowCount` |
| Progress bars | `ProgressBar` | `ProgressBarImage` | `textures?` (per-layer optional) / `atlas` + `uvCell` |
| Icons | — | `Icon` / `IconNumber` / `AvatarIcon` | `uvs` (+ optional `src`, defaults to `atlasIconsFontAwesome`); tint with `color` (not `backgroundColor`); `atlas` on `IconNumber`; `userId` on `AvatarIcon` |

## Custom textures / atlases (agent checklist)

When a user wants **their own images, atlases, or styles**, walk them through this — do not invent a parallel path:

1. **Open the Affinity template** at `design/ui-component-kit-assets.af`. Explain that every default atlas / progress-bar artboard lives there; they should **duplicate** the closest artboard and edit a copy (keep grid, guidelines, and margins).
2. **Export PNGs** into `assets/images/example-themes/<theme>/` (never into `assets/images/ui-component-kit/` unless they intend to replace framework defaults).
3. **Declare** a `TextureAtlas` (or `ProgressBarImageTextures`) in `src/exampleThemes/<theme>/`, mirroring the examples already there (`exampleBtnIconsAtlas`, `exampleIconsAtlas`, `exampleNumbersAtlas`, progress-bar sets).
4. **Sample UVs only via framework APIs** — never hand-write UV arrays:
	- Prefer `TextureAtlas.cell` / `.row` / `.column` / `.char`; named regions via `.named.<name>` (cell options) or `.uv.<name>` (UV quad)
	- Fall back to `getUVCell` / `getUVColumn` / `getUVRow` from `utils/uvs.tsx` for one-off / non-atlas cases
5. **Coordinates are 1-based and inclusive.** First column/row is `1`, not `0`. Totals (`columns`, `rows`, `xTotal`, `yTotal`, `uvColumnCount`) are counts. Example: first cell of a 4×4 → `{ xStart: 1, yStart: 1, xTotal: 4, yTotal: 4 }`; `ButtonImage` `uvColumn={1}` for the first variant.
6. Point them at root `README.md` → **Custom textures** and the Affinity callout at the top of the README.

**Icon packs / bulk icon atlases:** if the user asks about adding a large set of custom icons (Font Awesome, game-icons, etc.), tell them it is practical to generate a snap grid in Affinity, place icons programmatically, export one PNG, and register named cells — see **Bulk icon atlas via Affinity (agent workflow)** below. Reference implementation: `atlasIconsFontAwesome` in `src/ui-component-kit/atlases/atlases.ts` + `assets/images/ui-component-kit/atlas-icons-font-awesome.png`.

**Anti-patterns:** hard-coded UV quads; mixing 0-based indexes with counts; inventing a second atlas registry outside `exampleThemes/` / `ui-component-kit/atlases/`.


## Bulk icon atlas via Affinity (agent workflow)

Use this when a user wants a **grid of icons from an SVG pack** turned into a `TextureAtlas` with named UV lookups. It is fast once Affinity MCP is connected; do not hand-place hundreds of icons.

### Prompt the user

Tell them roughly:

> You can generate a full icon atlas quickly: connect Affinity’s MCP to the agent, point it at an SVG icon pack, have it build a snapped grid on an artboard, export a PNG, then declare a `TextureAtlas` with named cells (same pattern as `atlasIconsFontAwesome`).

Ask for: pack path, solid vs regular preference, cell size / max icon size / padding, artboard size (or cell count), and whether the atlas is a **framework default** (`ui-component-kit/atlases` + `assets/images/ui-component-kit/`) or a **project theme** (`src/exampleThemes/<theme>/` + `assets/images/example-themes/<theme>/`).

### Affinity MCP setup (suggest if missing)

Affinity 3.2+ exposes a local MCP server. Cursor may need a bridge:

1. Affinity → **Settings → Model Context Protocol → Enable MCP server** (restart Affinity).
2. Default SSE endpoint: `http://localhost:6767/sse` (often IPv6 `::1` on Windows).
3. Add a Cursor MCP entry, e.g. `npx -y affinity-mcp-bridge` (or equivalent), so tools like `execute_script` / `read_sdk_documentation_topic` appear.
4. If Affinity tools are not in the agent’s MCP catalog, the agent can still drive Affinity over that SSE endpoint with a small local client (initialize with protocol `2025-11-25`, then `tools/call`).
5. **Filesystem permission:** Affinity scripts often cannot `Document.load` / `fs.exists` outside allowed paths (`PERMISSION_DENIED`). Prefer reading SVGs from the host (Node) and recreating paths in Affinity via `CurveBuilder` / `PolyCurveNodeDefinition` — that path is proven and fine for bulk work.

Always `read_sdk_documentation_topic({ filename: 'preamble' })` before `execute_script`.

### Artboard / grid conventions (match `atlas-icons-font-awesome`)

| Setting | Typical value | Notes |
|---|---|---|
| Artboard size | `N × cellSize` (e.g. 16×128 → **2048²**) | Square power-of-two friendly |
| Cell size | **128×128** | One icon per cell |
| Max icon axis | **≤ ~0.707 × cellSize** (e.g. **86px** on 128) | Required for in-cell rotation / wiggle without clipping neighbours; also leaves room for ~6px shadows |
| Centering | Tight bounds centered in cell | Scale so `max(w,h) === maxAxis`, then center |
| Guides | Every **64px** (optional) | Snap aids; not required in the PNG |
| Fill | Solid white, no stroke | Tintable in UI if needed |
| Source preference | **Solid** SVGs; regular only if solid missing | Font Awesome free: regular ⊆ solid |

**Hard constraint — rotatable icons:** a square that rotates in-plane needs a bounding circle of diameter `cellSize`. The inscribed square is `cellSize / √2 ≈ 0.707 × cellSize`. If the UI also draws a shadow / glow (e.g. ~6px), budget that inside the cell too:

`maxIconAxis ≈ cellSize × 0.707 − shadowPx` → for 128px cells and ~6px shadow, use **~86px**.

Agents creating or importing icons into Affinity **must** follow this: do **not** fill the cell to the margins if the icons will be animated/rotated.

PNG row 0 = top of artboard. UV Y is **bottom → top**, so for a 16×16 atlas the top-left icon is `{ xStart: 1, yStart: 16 }`, bottom-left `{ xStart: 1, yStart: 1 }`.

### Generation steps

1. **Prepare artboard** in `ui-component-kit-assets.af` (or a duplicate): size, guides, name (e.g. `atlas-icons-font-awesome`). Use `doc.setArtboardSizeWithAnchor(artboard, w, h, SpatialAnchor.TopLeft)` / `DocumentCommand.createAddHorizontalGuide` / `createAddVerticalGuide`. Find artboards via `doc.artboards` + `ab.description`.
2. **Curate icons** from the pack (score / hand-pick for the use case). Prefer solid. Cap at `columns × rows` (e.g. 256).
3. **Place icons** left → right, top → bottom:
	- Host-side: parse SVG `d` with something like `svgpath` (`.abs().unshort().unarc()`).
	- Affinity-side: rebuild with `CurveBuilder` → `PolyCurve` → `PolyCurveNodeDefinition` → `AddChildNodesCommandBuilder` with `setInsertionTarget(artboard.node)`.
	- Name layers with `Selection.create(doc, node)` + `doc.setLayerDescription(name)` — **never** rely on `selection.clear()` / `add()` alone (multi-select can rename the artboard).
	- Batch (e.g. 8–16 icons per `execute_script`) to keep scripts small and retries cheap.
4. **Smoke-test one cell** before the full grid (placement, naming, artboard name intact).
5. **Export PNG** from Affinity (user or script) to the correct assets folder (`atlas-icons-font-awesome.png`).
6. **Declare `TextureAtlas`** with `columns` / `rows` / `named`:
	- Keys: camelCase from FA names (`dice-d20` → `diceD20`, `arrow-left` → `arrowLeft`).
	- Values: `{ xStart, yStart }` (1-based; invert PNG row → UV `yStart`).
	- Framework sheets: `src/ui-component-kit/atlases/atlases.ts` + re-export from `atlases/index.ts` and `ui-component-kit/index.tsx`. Keep large icon atlases **at the end** of `atlases.ts`.
	- Project sheets: `src/exampleThemes/<theme>/` + `assets/images/example-themes/<theme>/`.
7. **Verify** named count === cell count, spot-check `atlas.uv.<name>` in a demo or layer.

### Useful Affinity APIs (from this workflow)

```text
Document.current / doc.artboards / artboard.spreadBaseBox / artboard.node
doc.setArtboardSizeWithAnchor(ab, w, h, SpatialAnchor.TopLeft)
DocumentCommand.createAddHorizontalGuide(y) / createAddVerticalGuide(x)
DocumentCommand.createRemoveHorizontalGuide(0) / createRemoveVerticalGuide(0)  // clear by popping index 0
CurveBuilder + PolyCurve.transform(Transform…)
PolyCurveNodeDefinition.create(poly, brush, lineStyle, lineFill, transparency)
AddChildNodesCommandBuilder → setInsertionTarget(artboard.node) → addPolyCurveNode
Selection.create(doc, node) + DocumentCommand.createSetSelection + doc.setLayerDescription
getNodeChildren(artboard.node.handle, NodeChildType.Main)
```

### Anti-patterns

| Wrong | Right |
|---|---|
| Hand-placing hundreds of SVGs in Affinity UI | MCP / scripted grid |
| Assuming Affinity can read `S:\…` paths | Host-parse SVG → recreate curves |
| `selection.clear()` then `add` for rename | `Selection.create` + `createSetSelection` |
| Filling most of the cell (e.g. 112 on 128) when icons rotate | Max axis ≤ **~0.707 × cell** (e.g. **86** on 128) + center |
| 0-based `named` coordinates | 1-based; UV Y inverted vs PNG top |
| Hard-coded UV quads in components | `atlas.uv.name` / `atlas.cell(…)` |
| Dropping a huge atlas in the middle of `atlases.ts` | Append large icon atlases at the **end** |

## Buttons

> **Variants:** procedural (`ButtonText`) · image-based (`ButtonImage`)

When creating any kind of button element, ask the user if this is meant to be an **image button** or just a **simple text button**, then use the appropriate component. Do not invent a clickable `UiBox`; do not guess.

| Kind | Component | Use when |
|---|---|---|
| Image | `ButtonImage` | Atlas / texture button (hover + press states) |
| Text | `ButtonText` | Labelled control with no dedicated image asset |
| Close / dismiss | `ButtonImageClose` or `showCloseButton: true` | Hideable layer chrome |

Both `ButtonImage` and `ButtonText` take a unique `id` and a `callback`. See `src/ui-component-kit/components/buttons/`.

```tsx
<ButtonText
	id        = "btn_simple_toggle"
	textLabel = "Simple"
	cols      = {12}
	callback  = {() => simpleLayer.toggle()}
/>
```

```tsx
import { atlasBtnIconsStyled } from '../../atlases'

<ButtonImage
	id         = "btn_help"
	textureSrc = {atlasBtnIconsStyled.source}
	uvColumn   = {1}
	callback   = {() => helpLayer.toggle()}
/>
```

Atlas layout for `ButtonImage`: columns = button variants, rows = states. Pass `uvColumn` (required, **1-based** — first column is `1`). Defaults use `atlasBtnIconsStyled` (`source`, `columns`, `rows`). For a custom sheet, pass `textureSrc` + `uvColumnCount` + `uvRowCount` (define the atlas in `src/exampleThemes/<theme>/`). Prefer `TextureAtlas` instances over hard-coded paths / `xTotal` / `yTotal`.

## Progress bars

> **Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`)

Shared value API: `id`, `value`, `minValue` / `maxValue`, `fillFrom`, lerp per `id`.

- **`ProgressBar`** — colour track / fill / border. Defaults: fill `primary`, track `dark`, border `secondary`, radius = half shortest axis
- **`ProgressBarImage`** — same colour/border props as `ProgressBar`. Per-layer optional `textures.{background,fill,border}` (`nine-slices`) or `atlas` + `uvCell` fill (stretch, no tint). Omit both for the built-in full set; partial `textures` or `atlas` alone mixes image/atlas + procedural. Default `textureSlices` swap top/bottom ↔ left/right for vertical orientation. Define custom sets in `src/exampleThemes/<theme>/`. DCL has no nine-slice scale factor — only `textureSlices` fractions — so art must match intended display sizes (corners need room: ~`2 × corner px` on the constrained axis).
## Hideable + close button

`canBeHidden` / `startHidden` / `showCloseButton` are **Layer** options. The Zone receives them; when `showCloseButton` is set, the Zone injects `ButtonImageClose`. Zones are bare by default — wrap panel content in `<Background>` for theme body fill and border. Leave Background off for controls that bring their own visuals (e.g. a toggle `ButtonText`).

### showFrom / hideTo

Hideable layers slide on a visibility edge. By default both edges come from the zone preset (`visibilityPosition`). Override independently on `LayerOptions`:

| Option | Meaning |
|---|---|
| `showFrom` | Edge the layer snaps to off-screen, then tweens in from |
| `hideTo` | Edge the layer tweens out to when hiding |

If only one is set, the other matches it. Re-show always re-snaps to `showFrom` off-screen first (so hide-to-top then show-from-bottom works).

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

Ephemeral notifications via an always-mounted **ToastHost** (not one Layer per toast).

1. Include `toastHostLayer` in `SetupUiComponentKit({ layers })` (demos already do).
2. Call `showToast({ position, content, … })` / `hideToast(id)` / `clearToastGroup(group)`.

| Field | Notes |
|---|---|
| `position` | Dock: `top` / `bottom` / `topLeft` / `topRight` / `bottomLeft` / `bottomRight` (inset by bar zones) |
| `content` | `() => JSX` — prefer `%` / `cols` children so root scale works |
| `duration` | Seconds after enter (+ optional pulse); `0` = until dismiss / `hideToast` |
| `isDismissable` | Click toast to hide early |
| `showFrom` / `hideTo` | Slide edges (same rules as layers) |
| `scaleIn` / `scaleOut` / `scalePulse` | Root width/height scale (DCL has no `uiTransform.scale`) |
| `group` + `groupPolicy` | `stack` (default) / `queue` / `replace` — queue/replace require `group` |

```tsx
import { showToast, toastHostLayer } from './ui-component-kit'

// in SetupUiComponentKit layers:
toastHostLayer,

showToast({
	position     : 'top',
	group        : 'hints',
	groupPolicy  : 'queue',
	duration     : 2,
	isDismissable: true,
	content      : () => <Icon src={…} uvs={…} width="100%" height="100%" />,
	width        : 64,
	height       : 64,
})
```

See `demo.toasts.layer.tsx`. The host registry is generic enough for a future UI particle system.

## Component prop forwarding

Custom components built on `UiBox` must accept and forward native overrides so callers can escape-hatch anything the shorthand API does not cover:

- Type as `UiBoxProps` (or `Omit<SpinnerProps, …>` / similar) — not a hand-rolled subset
- Destructure known shorthands, then `...props`
- Merge `uiTransform` / `uiText` as `defaults → …overrides` (overrides last)
- Merge `uiBackground` with **`mergeUiBackground(defaults, uiBackground)`** so nested `texture` / `avatarTexture` fields (`src`, `wrapMode`, `filterMode`) deep-merge instead of replacing the whole object

```tsx
import { mergeUiBackground } from '../base'

export type MyThingProps = Omit<UiBoxProps, 'uiText'> & { value?: string }

export function MyThing({ value, uiTransform, uiBackground, uiText, ...props }: MyThingProps) {
	return (
		<UiBox
			{...props}
			uiTransform={{ width: 'auto', ...uiTransform }}
			uiBackground={mergeUiBackground({ color: theme.colors.body }, uiBackground)}
			uiText={{ value: value ?? '', ...uiText }}
		/>
	)
}
```

## Background

```tsx
<Background
	backgroundColor = {theme.colors.primary}
	borderRadius    = {8}
	textureSrc      = "assets/images/panel.png"
>
	{children}
</Background>
```

Defaults: fills parent via absolute insets, theme body fill, theme border width/radius, no padding.

### Auto-height layers (`height: 'auto'`)

Default `Background` is **absolutely positioned** (out of flex flow). That is correct for fixed-size zones, but with Layer `uiTransform.height: 'auto'` the Zone collapses to ~0 because nothing in-flow contributes height — content then clips under `overflow: 'hidden'`.

Use **`fitContent`** so Background participates in layout (`width: 100%`, `height: 'auto'`):

```tsx
super({
	id         : 'panel',
	zone       : ZoneType.Default,
	uiTransform: {
		width : '42vw',
		height: 'auto',
	},
})

// in body():
<Background fitContent>
	<Column cols={12} spacing={8} uiTransform={{ padding: 16 }}>
		{/* … */}
	</Column>
</Background>
```

| Wrong | Right |
|---|---|
| `height: 'auto'` + `<Background>` (absolute fill) | `height: 'auto'` + `<Background fitContent>` |
| Inner `Column` with `height: '100%'` under auto Zone | Omit height (Column defaults to `'auto'`) |

If the panel must stay inside a fixed viewport budget instead of growing, keep a definite Zone `height` and let children `flexShrink` — do not use `height: 'auto'`.

## Texture atlases & UV helpers

Bundled sheets live as `TextureAtlas` instances under `src/ui-component-kit/atlases/` (`atlasIconsFontAwesome`, `atlasBtnIconsStyled`, `atlasCharsNumbers`, …). Prefer those over hard-coded paths and repeated `xTotal` / `yTotal`. Project sheets: start from `design/ui-component-kit-assets.af`, export to `assets/images/example-themes/<theme>/`, declare atlases in `src/exampleThemes/<theme>/`. For bulk SVG icon packs → Affinity grid → named atlas, follow **Bulk icon atlas via Affinity** above.

`TextureAtlas` defaults `wrapMode` to `'clamp'` (avoids neighbour-cell bleed). Optional `filterMode` (`'point'` | `'bi-linear'` | `'tri-linear'`) applies to the whole sheet. Use `atlas.texture` (or `mergeUiBackground`) instead of `{ src: atlas.source }` alone. `Spinner` is an animation wrapper around a child `Icon` — there are no dedicated spinner presets / atlas.

**Always use** `TextureAtlas` or `getUVCell` / `getUVColumn` / `getUVRow`. Cell / column / row numbers are **1-based inclusive**; totals are counts.

```tsx
import { atlasIconsFontAwesome, atlasCharsNumbers } from '../../atlases'

atlasIconsFontAwesome.source
atlasIconsFontAwesome.uv.star                        // named cell UV quad
atlasIconsFontAwesome.cell({ xStart: 1, yStart: 1 }) // first cell
atlasIconsFontAwesome.row(1)                         // full bottom row
atlasIconsFontAwesome.column(1)                      // full first column
atlasCharsNumbers.char('5', { insetX: 0.15 })
```

`ProgressBarImage` can use full nine-slice textures (`textures.*`), an atlas UV fill (`atlas` + `uvCell`), or procedural colours per layer. Omit both `textures` and `atlas` for the built-in horizontal/vertical sets from `fillFrom` / `orientation`.

Low-level UV helpers stay in `utils/uvs.tsx` for one-off / non-atlas cases (same 1-based rules).

Full guides: root `README.md` → Custom textures / Buttons / Progress bars / Icons. When onboarding a user onto custom art, follow **Custom textures / atlases (agent checklist)**; for icon packs, also **Bulk icon atlas via Affinity**.

## Data / keys / style

- Live values on `this.props` (`PropsController`) — see `timer.layer.tsx`
- Sibling `key`s unique among siblings; `ButtonImage` / `ButtonText` `id`s unique among concurrent buttons
- `console.error` over `throw`; tabs; MARK comments; relative imports inside `ui-component-kit/`

## More examples

See [examples.md](examples.md) and `src/exampleThemes/showcase/layers/`.
