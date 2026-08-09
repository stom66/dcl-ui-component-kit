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

**Build check (required):** after any layout / Layer / `Row` / `Column` / `cols` / zone change, run **`npm run build`** and fix errors before finishing. Do not rely on the IDE linter alone — the SDK build catches ReactEcs prop and type issues the editor may miss.

## Stock assets after install (critical — agents)

When `@stom66/dcl-ui-component-kit` is **installed or upgraded in a consumer project** (or this package is used as a dependency), agents **must** ensure stock textures exist:

1. Check that `assets/images/ui-component-kit/` exists and contains PNG files.
2. If missing/empty: **warn the user** that textured UI will not work, then run  
   `npx @stom66/dcl-ui-component-kit copy-assets` (or instruct them to).
3. Treat npm’s `allow-scripts` / postinstall warning as **normal**. Do not promise that `npm install` copied assets — dependency `postinstall` is often blocked for security.
4. Optional helper if the user wants auto-copy:  
   `npm approve-scripts @stom66/dcl-ui-component-kit` then `npm rebuild @stom66/dcl-ui-component-kit`,  
   and/or add `"postinstall": "dcl-ui-component-kit copy-assets"` to the **consumer** `package.json`.
5. Full checklist: package root **`INSTALL.md`** (also linked from the README).

Do not mark install/setup complete until `assets/images/ui-component-kit/` is populated.

**Layout widths:** for every `Column` / `Label` / `ButtonText` that needs a fractional or full width, set **`cols`** (`cols={12}` = full width). `Row` is always full parent width (no `cols` — wrap in a `Column` to narrow). Use `cols="auto"` to fill leftover row space (sibling autos share equally). Omit `cols` on `Column` for no grid sizing. Do **not** copy `width: '100%'` / `'50%'` / `'25%'` from older demos — some examples still use percentages; that is legacy, not the pattern to follow.

## Core model

1. **`SetupUiComponentKit({ theme, layers })`** mounts the renderer inside **`ScreenInsetArea`** (device hardware safe margins) with a 100% × 100% stack.
2. **One Layer = one Zone.** The layer fills that zone. Implement **`body()` only**.
3. **`zone: ZoneType.*`** selects a preset (`zone.presets.ts`). Base `Layer.render()` mounts **`Zone`** only (the inset canvas is owned by SetupUiComponentKit — do not wrap layers in `ZoneRoot` / `ScreenInsetArea`).
4. **`uiTransform` / `uiBackground`** on `LayerOptions` are passed straight through to that Zone and merge on top of the preset.
5. Compose content with **`Row` / `Column` / `UiBox` / …** inside `body()`. Panel chrome is a sibling **`Background`** (empty), not a wrapper around content.

**All imports under `src/` must be relative** (`./`, `../`) — never absolute `src/...`.
Stay inside the package with sibling/parent paths (`../components`, `../../styles`) — do not climb out to `src/` and back in via a folder name (`../../ui-component-kit/...`). That hardcodes the package directory name and breaks when it is renamed. Keep multi-named imports on one line.

## Prop forwarding (critical)

Layer accepts optional **`uiTransform`** and **`uiBackground`** and passes them to the Zone. Do not add UiBox shorthand props (`backgroundColor`, `borderRadius`, …) on `LayerOptions` — put those on the native objects, or add a sibling **`Background`** in `body()`:

- Zone size / flex → `uiTransform: { width, height, alignItems, justifyContent, … }`
- Panel fill / border → empty sibling `<Background />` in `body()` (not Layer options; **do not nest content inside it**)
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

// in body() — Background is chrome only; content stays a zone sibling
return [
	<Background key="chrome" backgroundColor={getTheme().colors.primary} borderRadius={8} />,
	{/* content: Row / Column / Text / … */},
]
```

| Need | How |
|---|---|
| Top / corner / etc. | `zone: ZoneType.*` |
| Narrower / shorter than preset | `uiTransform: { width, height }` — corner zones pin to their flex-start/end edge (opposing `left`/`right` or `top`/`bottom` is cleared). Use `width: '100%'` / omit size to fill the slot |
| Height from children | `uiTransform: { height: 'auto' }` + in-flow content siblings (absolute `<Background />` paints the sized zone) |
| Flex alignment | Zone preset / `uiTransform: { alignItems, justifyContent, … }` on the **Layer** (not inside Background) |
| Fill / border behind content | Sibling `<Background />` in `body()` |
| Close control | `showCloseButton: true` (Layer option → Zone inserts button) |

**Anti-pattern:** adding Layer shorthand fields (`backgroundColor`, `borderRadius`, `themeBackground`, `widthVw`, `showFrame`, …). Use `uiTransform` / `uiBackground` on the Zone, and sibling `Background` for panel chrome.

### Component shorthands (prefer over nesting)

On kit components built on `UiBox`, **prefer top-level shorthands** over nesting `uiTransform` / `uiBackground` / `uiText` when a single field is enough. Nested objects remain escape hatches; shorthands win on conflict.

| Component | Prefer | Instead of |
|---|---|---|
| `Text` / `H1`–`H6` / `Code` / `Header` / `SectionHeader` | `value`, `fontColor`, `fontSize`, `font`, `textAlign`, `textWrap` | `uiText={{ value, color, fontSize: scaleFontSize(…), … }}` |
| `Background` / `Row` / `Column` / `UiBox` fill | `backgroundColor` | `uiBackground={{ color }}` |
| Border chrome | `borderColor`, `borderWidth`, `borderRadius` | nesting border fields on `uiTransform` |
| Layout (`Row` / `Column` / `Background` / `UiBox` / …) | `flexWrap`, `alignItems`, `justifyContent`, `padding`, `margin`, `minHeight`, … | `uiTransform={{ flexWrap, alignItems, … }}` |
| `Label` | `value`, `fontColor`, `fontSize`, …; **`backgroundColor` = chip fill** | nesting `uiText` for size/align; use `fontColor` (or `uiText.color`) for font tint |
| `Icon` / `SpriteIcon` | `iconColor` | `uiBackground.color` tint |
| `FlashColor` / `FlashBorder` | `flashColor` (target) | ambiguous bare `color` |

**`fontSize` shorthand** takes a **theme base px** number (e.g. `theme.typography.size.small`) and auto-wraps `scaleFontSize` inside the component. Do **not** pre-scale when using the shorthand. If you nest `uiText.fontSize`, you must still call `scaleFontSize` yourself.

```tsx
// GOOD — chrome sibling + content sibling (zone keeps flex)
[
	<Background key="chrome" backgroundColor={theme.colors.primary} borderRadius={8} />,
	<Column key="body" cols={12} alignItems="stretch" spacing={8} padding={16}>
		<Text value="Hello" fontSize={theme.typography.size.small} fontColor={theme.colors.light} />
		<Row flexWrap="wrap" alignItems="flex-start">
			{/* … */}
		</Row>
	</Column>,
]

// AVOID when a shorthand exists
<Text value="Hello" uiText={{ fontSize: scaleFontSize(theme.typography.size.small) }} />
<Background uiBackground={{ color: theme.colors.primary }} />
```

**Color props are always specific:** `fontColor` (text), `backgroundColor` (fills / Label chips), `iconColor` (Icon / SpriteIcon tint), `borderColor` (borders), `flashColor` (FlashColor / FlashBorder target). Nested `uiText.color` / `uiBackground.color` remain DCL escape hatches.

### Row / Column width (`cols` — required for grid widths)

`Column`, `Label`, and `ButtonText` share a **12-column** grid (`theme.cols.COL_COUNT`). **`cols` is the width API** on those components. **`Row` is always `width: 100%`** of its parent — it does not take `cols`. To make a half-width band, put a `Column cols={6}` inside the Row. Never set fractional/full widths via `width` / `uiTransform.width` when a span will do — including the common habit of `width: '100%'`.

| Need | Use |
|---|---|
| Full-width horizontal stack | `<Row>` (always 100% — no `cols`) |
| Full width of parent (Column / Label / Button) | `cols={12}` |
| Half / quarter / custom span | `cols={6}` / `cols={3}` / `cols={n}` on **`Column`** (or Label / ButtonText) |
| Fill leftover row space | `cols="auto"` (equal share among sibling autos — two autos → half each) |
| No grid sizing | omit `cols` on **`Column`** (also omit on **`Label`** / **`ButtonText`** for shrink-to-content) |
| Non-grid size (`vw` / `vh` / px) | `uiTransform.width` (Zone / Layer chrome, fixed icon boxes, etc.) |

| `cols` (Column / Label / ButtonText) | Width |
|---|---|
| omitted on `Column` | no grid sizing (does not fill or span) |
| omitted on `Label` / `ButtonText` | shrink-to-content |
| `"auto"` | fill leftover space in the parent `Row`; sibling autos share equally |
| `1` … `11` | sticky `n / 12` of the parent — does **not** expand when the row is under-filled (e.g. two `cols={4}` stay ~⅓ each, not half) |
| `12` | `100%` — use this for full-bleed stacks / vertical `Column` parents of nested `%` / `cols` |

```tsx
// GOOD — grid spans + fill
<Column cols={12}>
	<Row>
		<Column cols={4}>{/* sticky 4/12 */}</Column>
		<Column cols="auto">{/* fills remainder (~8/12) */}</Column>
	</Row>
	<Row>
		<Column cols="auto">{/* half */}</Column>
		<Column cols="auto">{/* half */}</Column>
	</Row>
	<Row>
		<Column cols={4}>{/* … */}</Column>
		<Column cols={8}>{/* … */}</Column>
	</Row>
</Column>

// BAD — never do this for Row / Column / Label grid widths
<Column uiTransform={{ width: '100%' }}>
	<Row uiTransform={{ width: '100%' }}>
		<Column uiTransform={{ width: '25%' }}>
```

**Agent trap:** older demo layers and muscle-memory CSS often use `width: '100%'`. That is **not** more reliable than `cols={12}` — it bypasses the grid and is wrong here. Prefer `cols` even when a nearby file still uses percentages.

**Nesting rule:** any `Column` that hosts children with `cols={…}` (or `width: '…%'`) must itself have a **definite** width — typically `cols={12}` on a vertical stack, or a parent that already spans / fills. A `Column` with `cols="auto"` only gets a definite width when it is a `Row` child. Nested `Row`s are always 100% of that parent Column.

**Row spacing + `cols`:** A `Row` defaults to `theme.spacing` gutters. Partial `cols` (1–11) use sticky **`width: n/12%`** so `flexWrap` works and under-filled rows leave empty space. When any child uses `cols` (wrap or not), `Row` applies **padded cell wrappers** so a full 12-wide line stays inside the parent — sibling spacers would add px on top of 100% and overflow / wrap early. Content-sized (no `cols`) non-wrap rows still use spacer entities. Do **not** add extra horizontal `margin` on `cols` children inside a spaced `Row`.

**Agent trap — wrapper components in a `cols` Row:** padded gutters re-create each child with `cols` cleared and `width: '100%'` / `uiTransform.width: '100%'` so chrome fills the cell. Put `ButtonText` / `Column` / `Label` **directly** in the `Row`, or any custom wrapper **must forward** `cols`, `width`, and `uiTransform`. A wrapper that only passes `cols` alone will drop the fill and fall back to aspect-ratio / content sizing (buttons look tiny with huge side gaps).

**`flexWrap` default:** Yoga / DCL default is **`nowrap`**. Without `flexWrap="wrap"`, children stay on one line — with sticky `cols` + `flexShrink: 0` they **overflow / spill past the end** rather than wrapping or shrinking into place.

**Equal-cell inventories — prefer `Grid`:** For icon boards / inventories where every cell is the same size, use **`<Grid limit={n}>`** instead of `Row` + `flexWrap` + sticky `cols`. `Grid` chunks children into tracks of `limit`, shares width with `flexGrow`, and uses normal spacer gutters (no padded `cols` wrappers). Optional `direction="vertical"` fills columns top-to-bottom; `padIncomplete={false}` lets a short final track share space among leftover items. Optional `cols` sizes the whole grid inside a parent `Row` (same as `Column`).

```tsx
<Grid limit={4} spacing={8}>
	{items.map((item) => (
		<Column key={item.id} /* cell chrome — no cols */ />
	))}
</Grid>
```

Reserve `Row` + `flexWrap` + `cols` for mixed 12-col spans (unequal cell widths). DCL has no CSS `gap`, so sticky `%` widths that sum to 100% still need padded wrappers when spaced.

Optional platform overrides: `colsDesktop` / `colsMobile`. `uiTransform.height` is unrelated — keep using it for vertical size.

### Virtual canvas & UI scale

`SetupUiComponentKit` calls `syncVirtualCanvasToPlatform()` then passes the result into
`ReactEcsRenderer` (`vWidth` / `vHeight` in `utils/sizing.ts`). Do **not** call `isMobile()`
at module import to pick the virtual size — platform is unreliable that early; defaults stay
desktop until Setup runs.

| Platform | Virtual size |
|---|---|
| Desktop | `1920×1080` |
| Mobile | `800×360` |

SDK scale (mirrored by `getUiScaleFactor()`):

`uiScale = min(physW / virtualW, physH / virtualH) / devicePixelRatio`

- **Smaller virtual → larger on-screen UI** for numeric / `'Npx'` layout values (and numeric fonts after parse).
- **DPR ÷ is intentional** — canvas size is physical; dividing maps to logical px (same units as `vw`/`vh`).
- **`%` and native `'Nvw'` / `'Nvh'`** are **not** enlarged by shrinking the virtual canvas.
- Phone landscape target: info HUD `uiScale` near **~0.9–1.2**. Portrait still fit-by-width and stays smaller.

### VH / VW helpers

For `uiTransform` sizes/positions, prefer native strings (`'30vw'`, `'10vh'`).

`vwToPixels` / `vhToPixels` are for **numeric** math (clamping, offsets, off-screen
travel). They convert against the **virtual** canvas — never the physical screen.

### Typography / fontSize (critical)

Theme `typography.size.*` values are **base pixel numbers only**. They must never call
`scaleFontSize` — theme / `buildTheme` run once at load, before canvas size is known.

**Prefer the `fontSize` shorthand** on `Text` / `H*` / `Code` / `Label` / etc. Pass the
theme base number; the component calls `scaleFontSize` for you:

```tsx
<Text value="Hello" fontSize={theme.typography.size.default} />
```

If you nest `uiText.fontSize` (escape hatch), you **must** wrap with `scaleFontSize` at
render time (when the UI function / `body()` runs and canvas info exists):

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
| `fontSize={scaleFontSize(theme.typography.size.h1)}` on Text shorthand | `fontSize={theme.typography.size.h1}` (auto-scaled) |
| `uiText={{ fontSize: theme.typography.size.h1 }}` | `uiText={{ fontSize: scaleFontSize(theme.typography.size.h1) }}` or use shorthand |
| `scaleFontSize(...)` inside `defaultTheme` / `buildTheme` | Keep theme sizes as plain numbers |
| Pre-scaling the shorthand | Pass the raw theme number |

If a caller overrides `uiText.fontSize`, that override must also use `scaleFontSize`.

**`scaleFontSize` is for fonts only** — do not use it on `borderRadius`, padding, or other layout numbers. Those are plain theme/virtual px and already × `uiScale` at parse time.

Fonts go through two steps: `scaleFontSize(base)` (additive fluid boost from viewport width) **then** × `uiScale`. Layout numbers only get the multiply.

**`textWrap`:** `@dcl/react-ecs` defaults **unset** `textWrap` to **`wrap`** (not `nowrap`, despite some docs). Button / nav labels should set `textWrap="nowrap"` — otherwise a first-frame narrow flex width can mid-word-break short strings (`List` → `Lis`/`t`) until layout settles. `ButtonText` defaults `nowrap` for `textLabel`; nested `Text` children must set it themselves.

**Exclusive Default-zone panels:** when switching showcase panels, hide the others first (normal hide duration).

**Do not tear down a layer’s UiEntity tree after it has been shown.** Returning `null` / skipping `body()` when `isFullyHidden` lets ReactEcs recycle those entities into sibling layers (Progress bars permanently stuck inside Grids, Layout, left nav, etc.). After the first show, keep `body()` mounted under a keyed Zone with `display: 'none'`. Never-opened `startHidden` layers may skip `body()` until first shown. Prefer unique React `key`s per layer (`demo_progress_chrome`, not bare `chrome`).

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
		return [
			<Background key="chrome" />,
			<Text key="my-body" value="Hello" />,
		]
	}
}

export const myLayer = new MyLayer()
```

## Critical anti-patterns

| Wrong | Right |
|---|---|
| Override `render()` to wrap `ScreenInsetArea` / `ZoneRoot` / `Zone` | Base `Layer.render()`; only implement `body()` |
| Hand-build edge layout | `zone: ZoneType.*` |
| Layer shorthands (`backgroundColor`, `borderRadius`, `showFrame`) | `uiTransform` / `uiBackground` / sibling `<Background />` |
| Nest content inside `<Background>…</Background>` | Sibling chrome: `[ <Background />, content ]` so zone flex still applies |
| Treat `Layer` as JSX | `class X extends Layer` + export instance |
| `UiBox` + `onMouseDown` / `onMouseUp` as a button | `ButtonImage` or `ButtonText` (ask which — see Buttons) |
| Nesting `uiText` / `uiTransform` / `uiBackground` for a single field that has a shorthand | Use the shorthand (`fontSize`, `fontColor`, `backgroundColor`, `flexWrap`, `padding`, …) |
| `fontSize={scaleFontSize(theme.typography.size.*)}` on Text shorthand | `fontSize={theme.typography.size.*}` (component scales) |
| Bare `uiText.fontSize: theme.typography.size.*` | `fontSize: scaleFontSize(theme.typography.size.*)` or use the shorthand |
| `scaleFontSize(...)` on `borderRadius` / padding / layout px | Raw theme / virtual number (SDK × `uiScale` at parse) |
| `Column` / `Label` / `ButtonText` with `width: '100%'` / `'50%'` / `'25%'` | `cols={12}` / `cols={6}` / `cols={3}` (see **Row / Column width**); `Row` is always full width |
| Inventory / equal-cell board built with `Row` + `flexWrap` + `cols` | Prefer `<Grid limit={n}>` — equal cells, spacer gutters, no padded wrappers |
| Inventory `Row` without `flexWrap` expecting multi-line layout | Use `Grid`, or set `flexWrap="wrap"` — default is `nowrap` (overflow / spill) |
| Text/`H*`/`Code` crushed / overlapping in a height-capped `Column` | Keep kit defaults: `flexShrink: 0`, `minHeight` from font size, `alignSelf: 'flex-start'` — Yoga’s default `flexShrink: 1` collapses `height: 'auto'` text to 0 |
| Layer `height: 'auto'` with only absolute `<Background>` (no in-flow siblings) | Keep chrome absolute; add in-flow content siblings that size the Zone |

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
| Icons | — | `Icon` / `IconNumber` / `IconSymbol` / `IconCharacter` / `IconString` / `AvatarIcon` / `SpriteIcon` | `uvs` (+ optional `src`, defaults to `atlasIconsFontAwesome`); tint with `iconColor` (not `backgroundColor`); `atlas` on number/symbol/character/sprite; `atlases` on `IconString`; `userId` on `AvatarIcon`; `SpriteIcon` needs `id` + sheet grid (`atlas` or `src`/`columns`/`rows`) plus optional `fps` / `offset` / `limit` / `pingPong` / `loopInterval` / `playing` / `looping` — trigger with `setPlaying` / `playOnce` (e.g. hover) |

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

Atlas layout for `ButtonImage`: columns = button variants, rows = states. Pass `uvColumn` (required, **1-based** — first column is `1`). Defaults use `atlasBtnIconsStyled` (`source`, `columns`, `rows`). Wide blank sheet: `atlasBtn3x1` (1×4) — nest icon / text children for labelled image buttons. For a custom sheet, pass `textureSrc` + `uvColumnCount` + `uvRowCount` (define the atlas in `src/exampleThemes/<theme>/`). Prefer `TextureAtlas` instances over hard-coded paths / `xTotal` / `yTotal`. See `demo.buttons.layer.tsx`.

## Progress bars

> **Variants:** procedural (`ProgressBar`) · image / hybrid (`ProgressBarImage`)

Shared value API: `id`, `value`, `minValue` / `maxValue`, `fillFrom`, lerp per `id`.

- **`ProgressBar`** — colour track / fill / border. Defaults: fill `primary`, track `dark`, border `secondary`, radius = half shortest axis
- **`ProgressBarImage`** — same colour/border props as `ProgressBar`. Per-layer optional `textures.{background,fill,border}` (`nine-slices`) or `atlas` + `uvCell` fill (stretch, no tint). Omit both for the built-in full set; partial `textures` or `atlas` alone mixes image/atlas + procedural. Default `textureSlices` swap top/bottom ↔ left/right for vertical orientation. Define custom sets in `src/exampleThemes/<theme>/`. DCL has no nine-slice scale factor — only `textureSlices` fractions — so art must match intended display sizes (corners need room: ~`2 × corner px` on the constrained axis).
## Hideable + close button

`canBeHidden` / `startHidden` / `showCloseButton` are **Layer** options. The Zone receives them; when `showCloseButton` is set, the Zone injects `ButtonImageClose`. Zones are bare by default — add a sibling `<Background />` for theme body fill and border (do not wrap content). Leave Background off for controls that bring their own visuals (e.g. a toggle `ButtonText`).

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

**Sibling chrome only.** `Background` paints fill/border behind content. It must **not** wrap Layer body content — nesting installs a new flex root (`alignItems` / `justifyContent` defaults) and zone safe-zone alignment no longer applies to those children. Reference: `demo.safeZone.factory.tsx` (empty bounds `Background` + content siblings).

```tsx
// GOOD
return [
	<Background
		key          = "chrome"
		backgroundColor        = {theme.colors.primary}
		borderRadius = {8}
		textureSrc   = "assets/images/panel.png"
	/>,
	<Column key="body" cols={12} spacing={8} padding={16}>
		{/* … */}
	</Column>,
]

// BAD — discards zone flex for nested children
<Background backgroundColor={theme.colors.primary}>
	<Column cols={12}>{/* … */}</Column>
</Background>
```

Defaults: fills parent via absolute insets, theme body fill, theme border width/radius, no padding.
Prefer `backgroundColor` over nesting `uiBackground.color`. Empty chrome normally needs no layout shorthands.

### Auto-height layers (`height: 'auto'`)

Default `Background` is **absolutely positioned** (out of flex flow). That is correct for sibling chrome: the Zone sizes from in-flow content siblings, and absolute Background paints the resulting box.

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
return [
	<Background key="chrome" />,
	<Column key="body" cols={12} spacing={8} padding={16}>
		{/* … */}
	</Column>,
]
```

| Wrong | Right |
|---|---|
| Nest content in `<Background>` so the zone “has a panel” | Sibling `<Background />` + in-flow content |
| `height: 'auto'` with only absolute chrome (no in-flow children) | Add in-flow content siblings that contribute height |
| Inner `Column` with `height: '100%'` under auto Zone | Omit height (Column defaults to `'auto'`) |

`fitContent` is a rare escape for self-sized chrome chips — not the Layer panel pattern. Prefer `UiBox` for small labelled boxes. If the panel must stay inside a fixed viewport budget instead of growing, keep a definite Zone `height` and let children `flexShrink` — do not use `height: 'auto'`.

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

### Atlas glyph text (`IconNumber` / `IconSymbol` / `IconCharacter` / `IconString`)

Image-based “font” rows from the bundled char atlases. Prefer the **narrowest** component that covers the charset — larger sheets cost more texture overhead:

| Component | Default atlas | Use when |
|---|---|---|
| `IconNumber` | `atlasCharsNumbers` (+ symbols fallback for punctuation like `=`) | Scores, timers, formulas — **prefer this** when digits/operators are enough |
| `IconSymbol` | `atlasCharsSymbols` | Punctuation / symbols only |
| `IconCharacter` | `atlasCharsAlphaNumeric` | Letters (`a–z` / `A–Z`) and digits from that sheet |
| `IconString` | Cascade: alphanumeric → symbols → numbers | Arbitrary mixed strings |

Shared behaviour: spaces → blank spacer; unsupported glyphs → solid `theme.colors.warning` box (obvious missing marker). Override sheets with `atlas` (single-sheet components) or `atlases={{ characters, symbols, numbers }}` on `IconString`.

```tsx
<IconNumber value={1250} height={32} />
<IconSymbol value="$%#" height={32} />
<IconCharacter value="HELLO" height={32} />
<IconString value="Score: 120/2=60!" height={32} />
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
