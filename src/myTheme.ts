import { Color4 } from '@dcl/sdk/math'

import type { ProgressBarImageTextures } from './scaling-ui'
import { TextureAtlas } from './scaling-ui'
import type { ThemeCustomize } from './scaling-ui/styles/theme'


// MARK: themeOverrides
/**
 * Project-specific theme overrides.
 *
 * This file is intentionally small, like a Bootstrap custom variables file:
 * only define values that should differ from the default theme. Section defaults
 * live in `scaling-ui/styles/components/*` (e.g. `colors.ts`, `animation.ts`).
 *
 * Put project art under `assets/images/my-theme/` and define atlases / texture
 * sets here so layers import them from one place. Start custom art from the
 * Affinity template at `assets/images/scaling-ui-assets.af` (duplicate artboards,
 * keep grids/margins). Cell coords on `TextureAtlas` are 1-based.
 */
export const themeOverrides: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#ff7538'),
	},
}


// ---------------------------------------------------------------------------
// Custom textures (examples)
//
// Paths below are documentation placeholders — drop your PNGs into
// `assets/images/my-theme/` and keep the filenames in sync.
// ---------------------------------------------------------------------------


// MARK: myBtnIconsAtlas
/**
 * Example button atlas for `ButtonImage`.
 * Grid: columns = button variants, rows = states (disabled → default, UV bottom→top).
 */
export const myBtnIconsAtlas = new TextureAtlas({
	source : 'assets/images/my-theme/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 },
		help : { xStart: 2, yStart: 4 },
	},
})


// MARK: myIconsAtlas
/**
 * Example general icon atlas for `Icon`.
 * Pick a cell with `.cell({ xStart, yStart })` (1-based) or a named UV via `.uv.<name>`.
 */
export const myIconsAtlas = new TextureAtlas({
	source : 'assets/images/my-theme/atlas-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		coin : { xStart: 1, yStart: 4 },
		heart: { xStart: 2, yStart: 4 },
	},
})


// MARK: myNumbersAtlas
/**
 * Example number / operator atlas for `IconNumber`.
 * Requires a `layout` (top → bottom as in the PNG) so `.char()` can resolve glyphs.
 */
export const myNumbersAtlas = new TextureAtlas({
	source : 'assets/images/my-theme/atlas-chars-numbers.png',
	columns: 4,
	rows   : 4,
	layout : [
		'/+-x',
		'89=.',
		'4567',
		'0123',
	],
	aliases: {
		'*': 'x',
		'×': 'x',
	},
})


// MARK: myProgressBarTexturesHorizontal
/**
 * Example horizontal progress-bar textures for `ProgressBarImage`.
 * Three separate full images (not an atlas): background, fill, border.
 */
export const myProgressBarTexturesHorizontal: ProgressBarImageTextures = {
	background: 'assets/images/my-theme/progressBar-horizontal-background.png',
	fill      : 'assets/images/my-theme/progressBar-horizontal-fill.png',
	border    : 'assets/images/my-theme/progressBar-horizontal-border.png',
}


// MARK: myProgressBarTexturesVertical
/**
 * Example vertical progress-bar textures for `ProgressBarImage`.
 */
export const myProgressBarTexturesVertical: ProgressBarImageTextures = {
	background: 'assets/images/my-theme/progressBar-vertical-background.png',
	fill      : 'assets/images/my-theme/progressBar-vertical-fill.png',
	border    : 'assets/images/my-theme/progressBar-vertical-border.png',
}
