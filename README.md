# Decentraland UI Component Kit

`@stom66/dcl-ui-component-kit` (aka **DUCK**) is a reusable UI toolkit for Decentraland SDK7. Layers, zones, and shared components — so you can build HUDs and panels without hand-placing every `UiEntity`.

```tsx
import { atlasIconsFontAwesome, Background, Column, Icon, Layer, Row, SetupUiComponentKit, Text, ZoneType } from '@stom66/dcl-ui-component-kit'

class HelloLayer extends Layer {
	constructor() {
		super({ id: 'hello', zone: ZoneType.Default })
	}

	body() {
		return (
			<Background>
				<Row>
					<Column>
						<Text value="Hello World" />
					</Column>
					<Column>
						<Icon uvs={atlasIconsFontAwesome.uv.star} />
					</Column>
				</Row>
			</Background>
		)
	}
}

export function main() {
	SetupUiComponentKit({ layers: [new HelloLayer()] })
}
```

<!-- Drop a short looped recording at docs/media/showcase.gif — GIF is the best format for GitHub README embeds. -->
![Component showcase](docs/media/showcase.gif)

*Placeholder — add `docs/media/showcase.gif` (see [docs/media](docs/media/README.md)).*

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
	- [Add it to your project](#add-it-to-your-project)
	- [Use the defaults (add a layer)](#use-the-defaults-add-a-layer)
	- [Make your own theme (recommended overrides)](#make-your-own-theme-recommended-overrides)
- [Building blocks](#building-blocks)
- [Docs](#docs)
- [This repo as a demo scene](#this-repo-as-a-demo-scene)

## Install

```bash
npm install @stom66/dcl-ui-component-kit
```

On install, stock textures are copied into your scene at `assets/images/ui-component-kit/` (DCL only loads textures from the scene `assets/` tree). Opt out with `UI_COMPONENT_KIT_SKIP_ASSETS=1` or `"config": { "dcl-ui-component-kit": { "skipAssets": true } }` in your `package.json`.

```bash
npx @stom66/dcl-ui-component-kit copy-assets
npx @stom66/dcl-ui-component-kit init-theme myTheme
```

## Quick start

### Add it to your project

1. `npm install @stom66/dcl-ui-component-kit`
2. Confirm `assets/images/ui-component-kit/` appeared (or run `copy-assets`)
3. Scaffold a theme (optional): `npx @stom66/dcl-ui-component-kit init-theme myGame`
4. Call `SetupUiComponentKit` from your scene `main()`

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

### Use the defaults (add a layer)

You do **not** need a custom theme to start. Pick a zone, implement `body()`, register the layer — zone size and component styling come from defaults:

```tsx
import { Background, Header, Layer, Row, SetupUiComponentKit, Text, ZoneType } from '@stom66/dcl-ui-component-kit'

class ScoreboardLayer extends Layer {
	constructor() {
		super({ id: 'scoreboard', zone: ZoneType.Top })
	}

	body() {
		return (
			<Background>
				<Row>
					<Header value="Score" />
					<Text value="12" />
				</Row>
			</Background>
		)
	}
}

export function main() {
	SetupUiComponentKit({ layers: [new ScoreboardLayer()] })
}
```

Layer rules (short):

1. **One Layer = one Zone** (`zone: ZoneType.*`)
2. Implement **`body()` only** — do not remount `Zone` / `ScreenInsetArea`
3. Override size / align later with **`uiTransform`** / **`uiBackground`** if you need to (no Layer shorthands like `backgroundColor`)
4. Panel chrome via **`<Background>`** inside `body()`
5. Prefer **`cols={12}`** (etc.) on `Row` / `Column` / `Label` / `ButtonText` when you need grid widths

Full options: [docs/layers-and-zones.md](docs/layers-and-zones.md).

### Make your own theme (recommended overrides)

**Do not edit the package’s `defaultTheme`.** Pass a small override object (or a theme folder from `init-theme`) into `SetupUiComponentKit`. Only set what differs from the defaults.

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
		layers: [/* your layers */],
	})
}
```

Or keep overrides next to your game code:

```tsx
// src/themes/myGame/theme.ts
import type { ThemeCustomize } from '@stom66/dcl-ui-component-kit'

export const theme: ThemeCustomize = {
	// colors: { primary: Color4.fromHexString('#…') },
}
```

Guide: [docs/themes.md](docs/themes.md).

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Independent UI surface (HUD, popup, menu). One zone + optional show/hide. |
| **Zone** | Preset slot on the virtual canvas (`Top`, `BottomRight`, `Default`, …). |
| **Layout** | `Row`, `Column`, `Background`, `BackgroundGradient`, `Divider`, `Label`. |
| **Components** | Buttons, progress bars, text, icons, toggle, spinners / motion, toasts. |
| **Theme** | Colours / type / sizing. Override via `SetupUiComponentKit({ theme })` — never fork the defaults in place. |

## Docs

Deeper guides and per-component **options tables** live under [`docs/`](docs/):

| Guide | Contents |
|---|---|
| [docs/layers-and-zones.md](docs/layers-and-zones.md) | Layer / Zone options, hideable popups, toasts |
| [docs/themes.md](docs/themes.md) | Theme overrides, `init-theme`, project layout |
| [docs/custom-textures.md](docs/custom-textures.md) | Affinity template, atlases, UV helpers (1-based) |
| [docs/components.md](docs/components.md) | Component reference with options tables |
| [docs/media](docs/media/README.md) | Showcase GIF / media notes |

## This repo as a demo scene

This GitHub repo is also a runnable Decentraland scene. Local demos live under `src/exampleThemes/` (showcase kitchen-sink, skyChaser, …). Switch the active bundle in `src/index.ts`.

The **npm package** only ships `src/ui-component-kit`, stock assets, and the CLI — not the example themes.

```bash
npm start
```

## Agent guidance

When creating or changing UI with this kit:

- [`.cursor/skills/ui-component-kit/SKILL.md`](.cursor/skills/ui-component-kit/SKILL.md)
- [`.cursor/rules/ui-component-kit.mdc`](.cursor/rules/ui-component-kit.mdc)
- [`.cursor/rules/relative-imports.mdc`](.cursor/rules/relative-imports.mdc)
