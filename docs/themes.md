# Themes

## Rule of thumb

**Do not edit `defaultTheme` inside the package.** Create a small `ThemeCustomize` override (or a theme folder) and pass it to `SetupUiComponentKit({ theme })`. Missing keys inherit from the defaults.

## Minimal override

```tsx
import { Color4 } from '@dcl/sdk/math'
import { SetupUiComponentKit, type ThemeCustomize } from '@stom66/dcl-ui-component-kit'

const theme: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#ff7538'),
	},
}

export function main() {
	SetupUiComponentKit({
		theme,
		layers: [/* … */],
	})
}
```

## Theme folder (recommended for games)

```bash
npx @stom66/dcl-ui-component-kit init-theme myGame
```

Creates:

```
src/themes/myGame/
  index.ts          # { theme, layers } bundle
  theme.ts          # ThemeCustomize overrides
  atlases.ts        # commented TextureAtlas examples
  layers/
    index.ts
    example.layer.tsx
assets/images/themes/myGame/
  .gitkeep          # drop custom PNGs here
```

Wire it:

```tsx
import { SetupUiComponentKit } from '@stom66/dcl-ui-component-kit'
import { myGame } from './themes/myGame'

export function main() {
	SetupUiComponentKit({
		theme : myGame.theme,
		layers: myGame.layers,
	})
}
```

Custom art for **your** game belongs under `assets/images/themes/<name>/` (or similar). Leave `assets/images/ui-component-kit/` for stock kit textures (re-synced on upgrade / `copy-assets`).

## What you can override

`ThemeCustomize` is a deep partial of the full theme. Common sections:

| Section | Examples |
|---|---|
| `colors` | `primary`, `secondary`, `danger`, `body`, `light`, `dark`, … |
| `typography` | `size` / `family` for body and headings |
| `buttons` | aspect ratio and related button defaults |
| `border` | default radii / widths |
| `icons` | default icon size, number glyph sizing |
| `animation` | motion defaults for Bounce / Pulse / … |
| `cols` | 12-column grid count |

Read the active theme at runtime with `getTheme()`. Helpers: `buildTheme`, `setTheme`, `defaultTheme`.

## This repo’s example themes

Local demos (not published to npm) live under `src/exampleThemes/<name>/` with the same shape: `theme` + `atlases` + `layers`. Switch the active one in `src/index.ts`.
