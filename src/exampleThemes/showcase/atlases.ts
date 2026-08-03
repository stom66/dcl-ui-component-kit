import type { ProgressBarImageTextures } from '../../scaling-ui'
import { TextureAtlas } from '../../scaling-ui'


// ---------------------------------------------------------------------------
// Custom textures (showcase)
//
// Drop your PNGs into `assets/images/example-themes/showcase/` and keep the
// filenames in sync. Copy this folder + its assets folder with Scaling UI;
// rename freely — updates to `scaling-ui/` will not overwrite your theme.
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
 * from Scaling UI instead.
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
