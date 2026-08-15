# Decentraland UI Component Kit 🦆

`@stom66/dcl-ui-component-kit` (aka **DUCK**) is a reusable UI toolkit for Decentraland SDK7.

## Human? Here, take this!

If you are using AI, this is what you actually need to know.

- **Layer** — a collection of UI that is shown or hidden **together**.
- **Zones** — add them to the layer. They already account for device chrome (Explorer HUD, notches, safe areas).
- **Components** — progress bars, icons, buttons, layout helpers, and the rest go **in those zones**.

![Component showcase](docs/media/showcase.gif)

### Get started

Ask your AI. Point your agent at this repository (or `@stom66/dcl-ui-component-kit` on npm) and tell it to install the kit into your scene.

```text
Install @stom66/dcl-ui-component-kit into this Decentraland SDK7 scene.
Copy stock UI assets, scaffold a custom theme, wire SetupUiComponentKit, and follow the package README.
```

## Making your own theme

You do not need a custom theme to start — defaults look like Decentraland out of the box. When you want your own art:

- Get the Affinity template ([`design/ui-component-kit-assets.af`](https://github.com/stom66/dcl-ui-component-kit/blob/main/design/ui-component-kit-assets.af)) and customize buttons / progress bars / icons / etc.
- Export PNGs into the theme folder the CLI scaffolds (`assets/images/themes/<name>/`) — never into stock `assets/images/ui-component-kit/`.
- Tell your agent to wire those files into the theme. Full walkthrough: [docs/themes.md](docs/themes.md).

## Install

> **WARNING — stock assets are required.**  
> Textured UI (icons, buttons, progress bars, spinners, …) will be blank or broken until  
> `assets/images/ui-component-kit/` exists in **your** scene.  
> **`npm install` alone is not enough.** Modern npm may block this package’s `postinstall`
> (`allow-scripts` warning). That is expected security behaviour — run `copy-assets` yourself.

```bash
npm install @stom66/dcl-ui-component-kit
npx @stom66/dcl-ui-component-kit copy-assets
```

Then confirm the folder is populated (many `.png` files). Full detail for humans and agents: **[INSTALL.md](./INSTALL.md)**.

### `allow-scripts` / postinstall

| Approach | Command |
|---|---|
| **Required (always works)** | `npx @stom66/dcl-ui-component-kit copy-assets` |
| Optional — allow our postinstall | `npm approve-scripts @stom66/dcl-ui-component-kit` then `npm rebuild @stom66/dcl-ui-component-kit` |
| Optional — auto on every install | Consumer `"postinstall": "dcl-ui-component-kit copy-assets"` (project scripts are not gated) |

Opt out of automatic copy: `UI_COMPONENT_KIT_SKIP_ASSETS=1` or `"config": { "dcl-ui-component-kit": { "skipAssets": true } }`.

```bash
npx @stom66/dcl-ui-component-kit init-theme myGame
```

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

You can also skip a custom theme and register layers directly:

```tsx
import { Background, Header, Layer, Row, SetupUiComponentKit, Text, ZoneType } from '@stom66/dcl-ui-component-kit'

class ScoreboardLayer extends Layer {
    constructor() {
        super({ id: 'scoreboard', zone: ZoneType.Top })
    }

    body() {
        return [
            <Background key="chrome" />,
            <Row key="content">
                <Header value="Score" />
                <Text value="12" />
            </Row>,
        ]
    }
}

export function main() {
    SetupUiComponentKit({ layers: [new ScoreboardLayer()] })
}
```

Layer notes (short):

1. A **Layer** is a show/hide group. **Zones** on that layer are device-aware slots.
2. Implement **`body()` only** — do not remount `Zone` / `ScreenInsetArea`.
3. Override size / align with **`uiTransform`** / **`uiBackground`** (no Layer shorthands like `backgroundColor`).
4. Panel chrome via **sibling** empty **`<Background />`** in `body()` (do **not** nest content inside it).
5. Prefer **`cols={12}`** (etc.) on `Column` / `Label` / `ButtonText` for grid widths **inside panels**. For edge / corner HUDs, omit `cols` so zone flex can place content-sized controls — see [docs/layers-and-zones.md](docs/layers-and-zones.md) → Zone alignment.

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Show/hide group for a collection of UI (HUD, popup, menu). |
| **Zone** | Device-aware slot on a layer (`Top`, `BottomRight`, `Default`, …). |
| **Layout** | `Row`, `Column`, `Background`, `BackgroundGradient`, `Divider`, `Label`. |
| **Components** | Buttons, progress bars, text, icons, toggle, spinners / motion, toasts. |
| **Theme** | Colours / type / sizing. Override via `SetupUiComponentKit({ theme })` — never fork the defaults in place. |

## Docs

Deeper guides and per-component **options tables** live under [`docs/`](docs/):

| Guide | Contents |
|---|---|
| [docs/layers-and-zones.md](docs/layers-and-zones.md) | Layer / Zone options, hideable popups, toasts |
| [docs/themes.md](docs/themes.md) | Affinity template, `init-theme`, agent wiring |
| [docs/custom-textures.md](docs/custom-textures.md) | Atlases, UV helpers (1-based) |
| [docs/components.md](docs/components.md) | Component reference with options tables |
| [docs/licensing.md](docs/licensing.md) | MIT package license + credits / attributions |
| [docs/media](docs/media/README.md) | Showcase GIF / media notes |

## License & credits

The package is **MIT**. Third-party art is credited separately:

- **[Font Awesome Free](https://fontawesome.com)** — this kit ships a **limited subset** of the Free pack as `atlasIconsFontAwesome`. For the full icon set, get Font Awesome from [fontawesome.com](https://fontawesome.com) ([Free license](https://fontawesome.com/license/free)).
- **[CraftPix.net](https://craftpix.net)** — some showcase demo sprite sheets (not npm stock textures).

Full notes: [docs/licensing.md](docs/licensing.md).

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
