# License & credits

## Package license

The **npm package** (`@stom66/dcl-ui-component-kit`) is published under **MIT** (see `package.json`). That covers the kit source under `src/ui-component-kit/`.

Third-party art bundled in this repository (kit stock textures, fonts, and demo assets) may use **separate** licenses. Those terms still apply when you copy or reuse those files — do not assume everything in the repo is MIT.

Kit-authored UI chrome (buttons, progress bars, spinners, character/number sheets, etc.) under `assets/images/ui-component-kit/` is provided with the package for use in Decentraland scenes.

---

## Credits & attributions

### Font Awesome Free

This project redistributes **[Font Awesome Free](https://fontawesome.com)** for Decentraland SDK7 UI:

| Detail | |
|---|---|
| Component | `FontAwesome` — look up icons by name; renders TTF glyphs via `fontSrc` |
| Fonts | `assets/fonts/duck-font-awesome-solid.ttf`, `…-regular.ttf`, `…-brands.ttf` |
| Notice | `assets/fonts/LICENSE-OFL.txt` (must ship with the fonts) |
| Full kit | **[fontawesome.com](https://fontawesome.com)** — Free (or Pro) download |
| License | [Font Awesome Free license](https://fontawesome.com/license/free) (icons: CC BY 4.0; fonts: SIL OFL 1.1; code: MIT) |

The TTFs are **Modified Versions** under SIL OFL 1.1, renamed so they do **not** use the Reserved Font Name “Font Awesome” as the primary family (kit families: `DuckFa7FreeSolid` / `DuckFa7FreeRegular` / `DuckFa7Brands`; files: `duck-font-awesome-*.ttf`). You may bundle them with this software; you may not sell the fonts by themselves. Keep the copyright notice and OFL text with every copy.

Brand icons are trademarks of their respective owners — use them only to represent that brand.

**Known issue:** Unity Desktop’s `fontSrc` path uses one dynamic SDF atlas per font. After Latin prefill, only about **~35–50 unique** FA icons fit (results vary). Prefer the deprecated texture sheet `atlasIconsFontAwesome` or a project atlas when you need many icons. After install/upgrade, run `npx @stom66/dcl-ui-component-kit copy-assets` so stock textures and these TTFs land in the scene.

Unity Desktop only applies `fontSrc` after optimized assets (Creator Hub **Compress Assets**, or `npm run start:bundles`). Plain preview without bundles falls back to the built-in face — PUA glyphs then show as tofu.

### CraftPix.net

Some **demo / showcase** sprite sheets come from **[CraftPix.net](https://craftpix.net)** (Free Game Assets). They live under `assets/images/example-themes/showcase/` and are used by the showcase `SpriteIcon` demos.

| File | Used by (showcase) |
|---|---|
| `sprites-pigeon.png` | `exampleSpriteSheetAtlas` |
| `sprites-smoke.png` | `SpriteSmoke` |
| `sprites-smoke-2.png` | `SpriteSmoke2` |
| `sprites-smoke-3.png` | `SpriteSmoke3` |

These demo sprites are **not** part of the published kit stock textures. The npm package does not ship `exampleThemes` or these showcase PNGs.

CraftPix file licenses: [craftpix.net/file-licenses](https://craftpix.net/file-licenses/). In short (freebie products): personal and commercial use in projects is allowed; attribution is not required but is appreciated (this page is that credit); do **not** resell or redistribute the raw art as standalone source files for other end users to extract and reuse. Always check the current CraftPix page for the product you downloaded (freebie vs premium terms differ).
