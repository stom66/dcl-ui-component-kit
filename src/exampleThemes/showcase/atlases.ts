import type { ProgressBarImageTextures } from '../../ui-component-kit'
import { TextureAtlas } from '../../ui-component-kit'


// ---------------------------------------------------------------------------
// Custom textures (showcase)
//
// Drop your PNGs into `assets/images/example-themes/showcase/` and keep the
// filenames in sync. Copy this folder + its assets folder with UI Component Kit;
// rename freely — updates to `ui-component-kit/` will not overwrite your theme.
// ---------------------------------------------------------------------------


// MARK: exampleBtnIconsAtlas
/**
 * Example button atlas for `ButtonImage`.
 * Grid: columns = button variants, rows = states (disabled → default, UV bottom→top).
 */
export const exampleBtnIconsAtlas = new TextureAtlas({
	source : 'assets/images/example-themes/showcase/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 },
		help : { xStart: 2, yStart: 4 },
	},
})


// MARK: exampleIconsAtlas
/**
 * Example general icon atlas for `Icon` — 4×4 grid (PNG top → bottom; UV Y is
 * bottom → top). Sample with `.cell({ xStart, yStart })`, `.named.<name>`, or
 * `.uv.<name>`. For the bundled Font Awesome sheet use `atlasIconsFontAwesome`
 * from UI Component Kit instead.
 */
export const exampleIconsAtlas = new TextureAtlas({
	source : 'assets/images/example-themes/showcase/atlas-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		/** Top row. */
		prohibited: { xStart: 1, yStart: 4 },
		target    : { xStart: 2, yStart: 4 },
		play      : { xStart: 3, yStart: 4 },
		cat       : { xStart: 4, yStart: 4 },
		/** Second row. */
		starburst : { xStart: 1, yStart: 3 },
		check     : { xStart: 2, yStart: 3 },
		coins     : { xStart: 3, yStart: 3 },
		phone     : { xStart: 4, yStart: 3 },
		/** Third row. */
		crown     : { xStart: 1, yStart: 2 },
		crosshair : { xStart: 2, yStart: 2 },
		dice      : { xStart: 3, yStart: 2 },
		ghost     : { xStart: 4, yStart: 2 },
		/** Bottom row. */
		gift      : { xStart: 1, yStart: 1 },
		heart     : { xStart: 2, yStart: 1 },
		stopwatch : { xStart: 3, yStart: 1 },
		trash     : { xStart: 4, yStart: 1 },
	},
})


// MARK: exampleNumbersAtlas
/**
 * Example number / operator atlas for `IconNumber`.
 * Requires a `layout` (top → bottom as in the PNG) so `.char()` can resolve glyphs.
 */
export const exampleNumbersAtlas = new TextureAtlas({
	source : 'assets/images/example-themes/showcase/atlas-chars-numbers.png',
	columns: 4,
	rows   : 4,
	layout : [
		'/+-×',
		'89,:',
		'4567',
		'0123',
	],
	aliases: {
		'*': '×',
		'x': '×',
	},
	filterMode: 'bi-linear',
})


// MARK: exampleSpriteSheetAtlas
/**
 * Showcase sprite sheets from CraftPix.net (demo only — not kit stock).
 * See docs/licensing.md. Cells play left → right, top → bottom.
 */
export const exampleSpriteSheetAtlas = new TextureAtlas({
	source    : 'assets/images/example-themes/showcase/sprites-pigeon.png',
	columns   : 7,
	rows      : 7,
	filterMode: 'point',
})

export const SpriteSmoke = new TextureAtlas({
	source    : 'assets/images/example-themes/showcase/sprites-smoke.png',
	columns   : 4,
	rows      : 4,
	filterMode: 'point',
})

export const SpriteSmoke2 = new TextureAtlas({
	source    : 'assets/images/example-themes/showcase/sprites-smoke-2.png',
	columns   : 4,
	rows      : 2,
	filterMode: 'point',
})

export const SpriteSmoke3 = new TextureAtlas({
	source    : 'assets/images/example-themes/showcase/sprites-smoke-3.png',
	columns   : 4,
	rows      : 3,
	filterMode: 'point',
})


// MARK: exampleProgressBarTexturesHorizontal
/**
 * Example horizontal progress-bar textures for `ProgressBarImage`.
 * Each key is optional — omit a layer to fall back to procedural colours
 * (`fillColor` / `backgroundColor` / `borderColor`).
 */
export const exampleProgressBarTexturesHorizontal: ProgressBarImageTextures = {
	background: 'assets/images/example-themes/showcase/progressBar-horizontal-background.png',
	fill      : 'assets/images/example-themes/showcase/progressBar-horizontal-fill.png',
	border    : 'assets/images/example-themes/showcase/progressBar-horizontal-border.png',
}


// MARK: exampleProgressBarTexturesVertical
/**
 * Example vertical progress-bar textures for `ProgressBarImage`.
 * Partial sets are fine (e.g. `{ fill }` + procedural border).
 */
export const exampleProgressBarTexturesVertical: ProgressBarImageTextures = {
	background: 'assets/images/example-themes/showcase/progressBar-vertical-background.png',
	fill      : 'assets/images/example-themes/showcase/progressBar-vertical-fill.png',
	border    : 'assets/images/example-themes/showcase/progressBar-vertical-border.png',
}
