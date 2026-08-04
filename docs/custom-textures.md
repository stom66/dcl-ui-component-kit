# Custom textures

Several controls ship in two flavours:

| Kind | Meaning |
|---|---|
| **Procedural** | Drawn with colours / theme values — no texture files required |
| **Image-based** | Uses PNG textures (or a texture atlas). Always overridable |

When a family has both, docs mark it: **Variants:** procedural (`Foo`) · image-based (`FooImage`).

## Affinity template (start here)

The kit ships a full Affinity source with every default atlas and progress-bar artboard:

**[`design/ui-component-kit-assets.af`](../design/ui-component-kit-assets.af)** (in this repo — kept outside `assets/` so Affinity autosave does not reload the scene)

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

## Bundled framework atlases

| Atlas | Use |
|---|---|
| `atlasIconsFontAwesome` | Font Awesome solid UI icons — default `Icon` `src` |
| `atlasBtnIcons` / `atlasBtnIconsStyled` | Button variants × states |
| `atlasCharsNumbers` | Digits / operators for `IconNumber` |
| `atlasCharsSymbols` | Symbol glyphs |
| `atlasCharsAlphaNumeric` | Alphanumeric sheet |
| `atlasGradientColors` | Gradient strips for progress fills |

Every `TextureAtlas` defaults `wrapMode` to `'clamp'`. Optional `filterMode`: `'point'` | `'bi-linear'` | `'tri-linear'`. Prefer `atlas.texture` over `{ src: atlas.source }` alone.

## UV helpers (1-based)

Always use `getUVCell` / `getUVColumn` / `getUVRow`, or `TextureAtlas` methods. **Cell / column / row numbers start at `1`.** Totals are counts. Ends (`xEnd` / `yEnd`) are inclusive.

```tsx
import { atlasCharsNumbers, atlasIconsFontAwesome } from '@stom66/dcl-ui-component-kit'

atlasIconsFontAwesome.texture
atlasIconsFontAwesome.uv.star
atlasIconsFontAwesome.cell({ xStart: 1, yStart: 1 })
atlasIconsFontAwesome.row(1)
atlasIconsFontAwesome.column(1)
atlasCharsNumbers.char('5', { insetX: 0.15 })
```

- **`atlas.named.<name>`** = cell options (for `uvCell` / `.cell()`)
- **`atlas.uv.<name>`** = precomputed UV quad (for `uvs` props)
