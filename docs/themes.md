# Themes

## Rule of thumb

**Do not edit `defaultTheme` inside the package.** Create a small `ThemeCustomize` override (or a theme folder) and pass it to `SetupUiComponentKit({ theme })`. Missing keys inherit from the defaults.

## Path (humans and agents)

One workflow. The agent scaffolds folders; the human makes art; the agent wires the files.

1. Scaffold a theme (`npx @stom66/dcl-ui-component-kit init-theme myGame`).
2. Copy the Affinity template and customize buttons / progress bars / icons / etc.
3. Export PNGs into `assets/images/themes/<name>/` — never into stock `assets/images/ui-component-kit/`.
4. Ask the agent to register those PNGs in `atlases.ts` / `theme.ts` and use them on `ButtonImage`, `ProgressBarImage`, `Icon`, …
5. Mount with `SetupUiComponentKit({ theme, layers })`.

Atlas / UV details: [custom-textures.md](./custom-textures.md).

## After the agent scaffolds

`init-theme` creates `src/themes/<name>/` and `assets/images/themes/<name>/`. That is the drop folder for **your** art.

**Agents:** after scaffolding, tell the human:

- Download / copy the Affinity template: [`design/ui-component-kit-assets.af`](https://github.com/stom66/dcl-ui-component-kit/blob/main/design/ui-component-kit-assets.af) (GitHub repo — not shipped on npm).
- Customize the artboards they need. Keep the same cell grid, guidelines, and margins so UV sampling stays aligned.
- Export PNGs into `assets/images/themes/<name>/`.
- Then ask you to wire those files (atlases, progress-bar texture sets, image-button sources).

Do not mark a custom look “done” until the PNGs exist in that folder **and** they are referenced from the theme (not left as commented examples).

## Human walkthrough

1. Get the template: [`design/ui-component-kit-assets.af`](https://github.com/stom66/dcl-ui-component-kit/blob/main/design/ui-component-kit-assets.af) (also in this repo under [`design/`](../design/README.md)).
2. Duplicate the artboard closest to what you need. Keep the cell grid so atlas UVs still match.
3. Export PNGs into **`assets/images/themes/<name>/`**. Leave `assets/images/ui-component-kit/` for kit stock textures (re-synced on upgrade / `copy-assets`).
4. Tell your AI something like: *use the PNGs in `assets/images/themes/<name>/` for this theme’s buttons, progress bars, and icons.*

## Minimal override (no custom art)

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
