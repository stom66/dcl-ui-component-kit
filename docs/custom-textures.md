# Custom textures

Several controls ship in two flavours:

| Kind | Meaning |
|---|---|
| **Procedural** | Drawn with colours / theme values — no texture files required |
| **Image-based** | Uses PNG textures (or a texture atlas). Always overridable |

When a family has both, docs mark it: **Variants:** procedural (`Foo`) · image-based (`FooImage`).

## Affinity template (start here)

The kit ships a full Affinity source with every default atlas and progress-bar artboard:

**[`assets/images/ui-component-kit/src/duck-assets.af`](../assets/images/ui-component-kit/src/duck-assets.af)** — kit chrome (buttons, progress bars, spinners, gradients, backgrounds). `assets/images/ui-component-kit/src/**` is listed in `.dclignore` so Affinity autosave does not reload the scene.

Showcase demo sheets (smoke sprites, `atlas-icons-showcase-4x4`) live in **[`assets/images/example-themes/showcase/duck-showcase-assets.af`](../assets/images/example-themes/showcase/duck-showcase-assets.af)**.

1. Open the `.af` file in Affinity.
2. Duplicate the artboard closest to what you need.
3. Keep the same cell grid, guidelines, and margins so UV sampling stays aligned.
4. Export PNGs into **your theme folder** (e.g. `assets/images/themes/myGame/`) — not into `assets/images/ui-component-kit/` (stock kit defaults).
5. Declare a `TextureAtlas` (or progress-bar texture set) next to your theme.
6. Sample cells with `TextureAtlas` / UV helpers (**1-based**).

**Icon cell sizing (rotation / animation):** if icons rotate or wiggle, keep the glyph’s longest axis within about **0.707 × cell size** (`1 / √2`), plus a few pixels for shadows (e.g. ~86px on a 128px cell).

## Declaring atlases

```tsx
import { TextureAtlas } from '@stom66/dcl-ui-component-kit'
import type { ProgressBarImageTextures } from '@stom66/dcl-ui-component-kit'

export const myBtnIconsAtlas = new TextureAtlas({
	source : 'assets/images/themes/myGame/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 }, // 1-based
	},
})

export const myProgressBarTexturesHorizontal: ProgressBarImageTextures = {
	background: 'assets/images/themes/myGame/progressBar-horizontal-background.png',
	fill      : 'assets/images/themes/myGame/progressBar-horizontal-fill.png',
	border    : 'assets/images/themes/myGame/progressBar-horizontal-border.png',
}
```

## Example: custom icon sheet

End to end: from a PNG of icons to `<Icon>` by name.

**1. Export the sheet.** A grid of equally sized cells, e.g. 4 × 4, saved into your theme folder:

```text
assets/images/themes/myGame/atlas-icons.png
```

**2. Declare the atlas and name the cells.** Column and row numbers are **1-based**, and **rows count from the bottom of the PNG** (UV space), so the top row of a 4-row sheet is `yStart: 4`.

```tsx
import { TextureAtlas } from '@stom66/dcl-ui-component-kit'

export const myIconsAtlas = new TextureAtlas({
	source : 'assets/images/themes/myGame/atlas-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		coin : { xStart: 1, yStart: 4 }, // top row, first column
		heart: { xStart: 2, yStart: 4 }, // top row, second column
		key  : { xStart: 1, yStart: 3 }, // second row, first column
	},
})
```

**3. Use a cell by name.** Every entry in `named` gets a precomputed UV quad on `atlas.uv`:

```tsx
<Icon
	src = {myIconsAtlas.source}
	uvs = {myIconsAtlas.uv.coin}
/>
```

Components that take the whole atlas instead of `src` + `uvs` (e.g. `ProgressBarImage`) use the cell options: `uvCell = {myIconsAtlas.named.coin}`. For a cell you haven't named, call `myIconsAtlas.cell({ xStart: 3, yStart: 2 })`.

A working version lives in the demo scene: `exampleIconsAtlas` in [`src/exampleThemes/showcase/atlases.ts`](../src/exampleThemes/showcase/atlases.ts).

## Bundled framework atlases

| Atlas | Use |
|---|---|
| `atlasIconsFontAwesome` | **Deprecated** PNG subset — prefer `FontAwesome` |
| `atlasBtnIcons` / `atlasBtnIconsStyled` | Button variants × states |
| `atlasCharsAlphaNumeric` | Letters and digits |
| `atlasCharsSymbols` | Punctuation and operators |
| `atlasGradientColors` | Gradient strips for progress fills |
| `atlasSpritesProgressRadial` | 16×16 radial progress ring (256 frames) for `ProgressBarRadial` |
| `atlasSpritesProgressRadialThick` | Same 16×16 / 256-frame layout — thick ring |
| `atlasSpritesProgressRadialPie` | Same 16×16 / 256-frame layout — solid pie wedge |
| `atlasSpritesProgressRadialSegments` | Same 16×16 / 256-frame layout — 12 dashed segments |
| `atlasSpritesProgressRadialComet` | Same 16×16 / 256-frame layout — alpha-ramped comet tail |
| `atlasSpritesProgressRadialDots` | Same 16×16 / 256-frame layout — 24 growing dots |
| `atlasSpritesProgressRadialKnob` | Same 16×16 / 256-frame layout — rounded ring with leading knob |
| `atlasSpritesProgressRadialStopwatch` | Same 16×16 / 256-frame layout — stopwatch face (pie + hand) |
| `atlasSpritesProgressRadialSunburst` | Same 16×16 / 256-frame layout — 16 radiating spokes |
| `atlasSpritesProgressSquare` | Same 16×16 / 256-frame layout — rounded-square outline (8px corners per 64px cell) |
| `atlasSpritesProgressSquareSegments` | Same 16×16 / 256-frame layout — square dashes with a square block in each corner (20 segments) |
| `atlasSpritesProgressSquareComet` | Same 16×16 / 256-frame layout — rounded-square alpha-ramped comet with round head |
| `atlasSpritesProgressSquareDots` | Same 16×16 / 256-frame layout — rounded-square 24 growing dots |
| `atlasSpritesProgressSquareSunburst` | Same 16×16 / 256-frame layout — square sunburst: 16 straight spokes (4 per side) + growing quarter-circle corners |

Every `TextureAtlas` defaults `wrapMode` to `'clamp'`. Optional `filterMode`: `'point'` | `'bi-linear'` | `'tri-linear'`. Prefer `atlas.texture` over `{ src: atlas.source }` alone.

Atlas-level UV crop defaults: `inset` (both axes), or independent `insetX` / `insetY` (same rules as `getUVCell`). Per-call / named-cell options still override.

## UV helpers (1-based)

Always use `getUVCell` / `getUVColumn` / `getUVRow`, or `TextureAtlas` methods. **Cell / column / row numbers start at `1`.** Totals are counts. Ends (`xEnd` / `yEnd`) are inclusive.

```tsx
import { atlasCharsAlphaNumeric, FontAwesome } from '@stom66/dcl-ui-component-kit'

<FontAwesome icon="star" />
atlasCharsAlphaNumeric.char('5', { insetX: 0.15 })
```

For custom icon sheets, declare your own `TextureAtlas` and pass `src` + `uvs` to `Icon` (see showcase `exampleIconsAtlas`).

- **`atlas.named.<name>`** = cell options (for `uvCell` / `.cell()`)
- **`atlas.uv.<name>`** = precomputed UV quad (for `uvs` props)
