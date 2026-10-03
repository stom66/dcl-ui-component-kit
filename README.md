# Decentraland UI Component Kit 🦆

`@stom66/dcl-ui-component-kit` (aka **DUCK**) is a reusable UI toolkit for Decentraland SDK7.

## Human? Here, take this!

If you are using AI, this is what you actually need to know.

- **Layer** — a collection of UI that is shown or hidden **together**. One layer fills **one** zone.
- **Zones** — preset slots (`ZoneType.Top`, `BottomRight`, `Default`, …). Set `zone: ZoneType.*` on the Layer. There are no `ZoneTop` / `ZoneLeft` helper components.
- **Components** — progress bars, icons, buttons, layout helpers go **in that zone** (`body()`).

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

1. A **Layer** is a show/hide group. It fills **one** zone (`zone: ZoneType.*`, default `Default`).
2. Implement **`body()` only** — do not remount `Zone` / `ScreenInsetArea` / `InteractableArea`. `Layer.render()` already mounts `<Zone type={…}>`.
3. Override size / align with **`uiTransform`** / **`uiBackground`** (no Layer shorthands like `backgroundColor`).
4. Panel chrome via **sibling** empty **`<Background />`** in `body()` (do **not** nest content inside it).
5. Prefer **`cols={12}`** (etc.) on `Column` / `Label` / `ButtonText` for grid widths **inside panels**. For edge / corner HUDs, omit `cols` so zone flex can place content-sized controls — see [docs/layers-and-zones.md](docs/layers-and-zones.md) → Zone alignment.
6. **`inset`** on a Layer picks canvas chrome (`'none'` / `'device'` / `'interactable'`). Setup `screenInset` is the default when omitted (kit default `'none'`). Layers with the same resolved inset share one SDK renderer — do **not** wrap `ScreenInsetArea` / `InteractableArea` in `body()`.
7. `colsDesktop` / `colsMobile` and `getLeftZoneInset()` are evaluated **at render**. Do not snapshot `isMobile()` into a module-level `const`.

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Show/hide group for a collection of UI (HUD, popup, menu). One layer = one zone. |
| **Zone** | Preset slot (`Top`, `BottomRight`, `Default`, …) via `zone: ZoneType.*` or `<Zone type={…}>`. |
| **Layout** | `Row` / `RowReverse`, `Column` / `ColumnReverse`, `Background`, `BackgroundGradient`, `Divider`, `Label`. |
| **Components** | Buttons, progress bars, text, icons, toggle, spinners / motion, toasts. |
| **Theme** | Colours / type / sizing. Override via `SetupUiComponentKit({ theme })` — never fork the defaults in place. |

## Docs

Deeper guides and per-component **options tables** live under [`docs/`](docs/):

| Guide | Contents |
|---|---|
| [docs/layers-and-zones.md](docs/layers-and-zones.md) | Layer / Zone / `inset`, hideable popups, toasts |
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

## 0.2.0 notes

Breaking / behaviour changes vs 0.1.x (SDK **7.26** UI):

- **Named zone components removed** (`ZoneTop`, `ZoneBottomRight`, `ZoneDefault`, …). Use `zone: ZoneType.*` on a Layer, or `<Zone type={ZoneType.Top}>` (`type` is required).
- **`IS_DEV` removed** (unused).
- **`LEFT_ZONE_INSET` → `getLeftZoneInset()`** — call it at layout time; a module constant froze `isMobile()` / `vwToPixels` at import.
- **`colsDesktop` / `colsMobile`** still exist and are resolved at render (same live-platform rule).
- **`screenInset` / Layer `inset`** — Setup `screenInset` is the default for layers that omit `inset`. Layers are grouped into at most three SDK renderers (`setUiRenderer` + `addUiRenderer`). Do not wrap layers in `ScreenInsetArea` / `InteractableArea`. Only `ZoneType.Default` gets a centering shell inside its renderer.
- **`ZoneType.InteractableArea` deprecated** — use `inset: 'interactable'` with `ZoneType.FullScreen` (or `Default`).
- **`zIndex`** is applied only when the Layer sets it (not from array index). Use `zIndex` for stacking across inset groups. Later siblings still paint on top when unset.
- **Buttons / Toggle:** on **mobile**, `callback` fires on `mouseDown`; on desktop, any `mouseUp` on the button. Use `isMobile()`, not `!isDesktop()`.
- **Temporary:** `SetupUiComponentKit` installs `src/ui-component-kit/utils/pointerInputPatch.ts` so UI clicks are not dropped when Explorer’s root-entity copy of the click wins the SDK’s global timestamp race. Tear-out notes and the upstream report: `dclcontext/bugs/sdk-ui-pointer-stale-click.md`.
- Toast host uses `ZoneType.None` with no full-screen wrapper (so it does not steal clicks).

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
