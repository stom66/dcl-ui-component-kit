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

Prefer to do it yourself? **[docs/manual-install.md](docs/manual-install.md)**.

## Docs

Guides live under [`docs/`](docs/).

### Setup

| Guide | Contents |
|---|---|
| [docs/manual-install.md](docs/manual-install.md) | npm install, `copy-assets`, theme scaffold, wiring |
| [docs/upgrade-caveats.md](docs/upgrade-caveats.md) | Breaking / behavioural changes between versions |

### Use

| Guide | Contents |
|---|---|
| [docs/layers-and-zones.md](docs/layers-and-zones.md) | Layer / Zone / `inset`, hideable popups, toasts |
| [docs/themes.md](docs/themes.md) | Affinity template, `init-theme`, agent wiring |
| [docs/custom-textures.md](docs/custom-textures.md) | Atlases, UV helpers (1-based) |
| [docs/components.md](docs/components.md) | Component reference with options tables |
| [docs/licensing.md](docs/licensing.md) | MIT package license + credits / attributions |
| [docs/media](docs/media/README.md) | Showcase GIF / media notes |

## Making your own theme

You do not need a custom theme to start — defaults look like Decentraland out of the box. When you want your own art:

- Get the Affinity template ([`design/ui-component-kit-assets.af`](https://github.com/stom66/dcl-ui-component-kit/blob/main/design/ui-component-kit-assets.af)) and customize buttons / progress bars / icons / etc.
- Export PNGs into the theme folder the CLI scaffolds (`assets/images/themes/<name>/`) — never into stock `assets/images/ui-component-kit/`.
- Tell your agent to wire those files into the theme. Full walkthrough: [docs/themes.md](docs/themes.md).

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Show/hide group for a collection of UI (HUD, popup, menu). One layer = one zone. |
| **Zone** | Preset slot (`Top`, `BottomRight`, `Default`, …) via `zone: ZoneType.*` or `<Zone type={…}>`. |
| **Layout** | `Row` / `RowReverse`, `Column` / `ColumnReverse`, `Background`, `BackgroundGradient`, `Divider`, `Label`. |
| **Components** | Buttons, progress bars, text, icons, toggle, spinners / motion, toasts. |
| **Theme** | Colours / type / sizing. Override via `SetupUiComponentKit({ theme })` — never fork the defaults in place. |

## License & credits

The package is **MIT**. Third-party art is credited separately:

- **[Font Awesome Free](https://fontawesome.com)** — this kit ships a **limited subset** of the Free pack as `atlasIconsFontAwesome`. For the full icon set, get Font Awesome from [fontawesome.com](https://fontawesome.com) ([Free license](https://fontawesome.com/license/free)).
- **[CraftPix.net](https://craftpix.net)** — some showcase demo sprite sheets (not npm stock textures).

Full notes: [docs/licensing.md](docs/licensing.md).

## This repo as a demo scene

This GitHub repo is also a runnable Decentraland scene. Local demos live under `src/exampleThemes/` (showcase kitchen-sink). Switch the active bundle in `src/index.ts`.

The **npm package** only ships `src/ui-component-kit`, stock assets, and the CLI — not the example themes.

```bash
npm start
```

## Agent guidance

When creating or changing UI with this kit:

- [`.cursor/skills/ui-component-kit/SKILL.md`](.cursor/skills/ui-component-kit/SKILL.md)
- [`.cursor/rules/ui-component-kit.mdc`](.cursor/rules/ui-component-kit.mdc)
- [`.cursor/rules/relative-imports.mdc`](.cursor/rules/relative-imports.mdc)
- After an install or upgrade: [docs/manual-install.md](docs/manual-install.md) and [docs/upgrade-caveats.md](docs/upgrade-caveats.md)
