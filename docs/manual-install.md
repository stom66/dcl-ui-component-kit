# Manual install

Install `@stom66/dcl-ui-component-kit` into a Decentraland SDK7 scene, copy stock textures, and wire `SetupUiComponentKit`.

> **WARNING — stock assets are required.**  
> Textured UI (icons, buttons, progress bars, spinners, …) will be blank or broken until  
> `assets/images/ui-component-kit/` exists in **your** scene.  
> **`npm install` alone is not enough.** Modern npm may block this package’s `postinstall`
> (`allow-scripts` warning). That is expected security behaviour — run `copy-assets` yourself.

```bash
npm install @stom66/dcl-ui-component-kit
npx @stom66/dcl-ui-component-kit copy-assets
```

Confirm the folder is populated (many `.png` files):

```bash
# should list PNGs (atlases, progress bars, spinners, …)
ls assets/images/ui-component-kit
```

An existing folder is not proof the PNGs match the installed code. `npm update` replaces the package in `node_modules` and leaves the scene copies untouched whenever postinstall does not run. After any upgrade from an older install, run `copy-assets` again so the scene sheets match the new code. Then read **[upgrade-caveats.md](./upgrade-caveats.md)**.

## Why postinstall may not run

npm treats dependency install scripts (`postinstall`) as a security boundary.
On npm 11.16+ you see an `allow-scripts` warning; on npm 12+ those scripts are
**blocked** unless the package is explicitly approved. That is expected — there
is no reliable way to force asset copy via our package’s `postinstall` alone.

### `allow-scripts` / postinstall

| Approach | Command |
|---|---|
| **Required (always works)** | `npx @stom66/dcl-ui-component-kit copy-assets` |
| Optional — allow our postinstall | `npm approve-scripts @stom66/dcl-ui-component-kit` then `npm rebuild @stom66/dcl-ui-component-kit` |
| Optional — auto on every install | Consumer `"postinstall": "dcl-ui-component-kit copy-assets"` (project scripts are not gated) |

Opt out of automatic copy: `UI_COMPONENT_KIT_SKIP_ASSETS=1` or `"config": { "dcl-ui-component-kit": { "skipAssets": true } }` — only when the consumer ships equivalent textures themselves.

## Theme scaffold (optional)

You do not need a custom theme to start — defaults look like Decentraland out of the box.

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

## Layer notes (short)

1. A **Layer** is a show/hide group. It fills **one** zone (`zone: ZoneType.*`, default `Default`).
2. Implement **`body()` only** — do not remount `Zone` / `ScreenInsetArea` / `InteractableArea`. `Layer.render()` already mounts `<Zone type={…}>`.
3. Override size / align with **`uiTransform`** / **`uiBackground`** (no Layer shorthands like `backgroundColor`).
4. Panel chrome via **sibling** empty **`<Background />`** in `body()` (do **not** nest content inside it).
5. Prefer **`cols={12}`** (etc.) on `Column` / `Label` / `ButtonText` for grid widths **inside panels**. For edge / corner HUDs, omit `cols` so zone flex can place content-sized controls — see [layers-and-zones.md](./layers-and-zones.md) → Zone alignment.
6. **`inset`** on a Layer picks canvas chrome (`'none'` / `'device'` / `'interactable'`). Setup `screenInset` is the default when omitted (kit default `'none'`). Layers with the same resolved inset share one SDK renderer — do **not** wrap `ScreenInsetArea` / `InteractableArea` in `body()`.
7. `colsDesktop` / `colsMobile` and `getLeftZoneInset()` are evaluated **at render**. Do not snapshot `isMobile()` into a module-level `const`.

## Agent checklist (when this package is installed or upgraded)

1. After `npm install` / `npm update` of `@stom66/dcl-ui-component-kit`, check that
   `assets/images/ui-component-kit/` exists and contains texture files.
2. If the folder is missing or empty, **or the scene was first installed on an
   older version of this package than the one just installed**: warn the user,
   then run `npx @stom66/dcl-ui-component-kit copy-assets` (or ask them to).
   A populated folder can still be stale. `npm update` does not replace those PNGs
   when postinstall is blocked.
3. If symbols, letters, or digits look sliced, swapped, or like the wrong glyph,
   treat that as an old scene texture. Current code reads `atlas-chars-symbols.png`
   as 6×6; copies from before that change are 4×4. Run `copy-assets` before
   changing UV or inset code.
4. Do **not** tell users the UI is ready until stock textures match the installed package.
5. Mention the `allow-scripts` warning is normal; `copy-assets` is the supported fix.
6. Do not invent alternate asset paths — DCL only serves textures from the scene
   `assets/` tree; the kit expects `assets/images/ui-component-kit/`.
7. Read **[upgrade-caveats.md](./upgrade-caveats.md)** and apply any
   breaking / behavioural migrations for the version jump just installed.
