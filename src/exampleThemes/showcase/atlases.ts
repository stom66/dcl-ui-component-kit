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
 * Showcase icon atlas for `Icon` — 4×4 grid exported from
 * `duck-showcase-assets.af` (`atlas-icons-showcase-4x4.png`).
 * PNG top → bottom; UV Y is bottom → top. The bottom row is empty.
 * Sample with `.cell({ xStart, yStart })`, `.named.<name>`, or `.uv.<name>`.
 * For Font Awesome Free icons by name use kit `FontAwesome` instead.
 */
export const exampleIconsAtlas = new TextureAtlas({
	source : 'assets/images/example-themes/showcase/atlas-icons-showcase-4x4.png',
	columns: 4,
	rows   : 4,
	named  : {
		/** Top row. */
		catButt         : { xStart: 1, yStart: 4 },
		pigeonCowboy    : { xStart: 2, yStart: 4 },
		pigeonWalk      : { xStart: 3, yStart: 4 },
		dclLogo         : { xStart: 4, yStart: 4 },
		/** Second row. */
		pigeonWaiter    : { xStart: 1, yStart: 3 },
		pigeonBiker     : { xStart: 2, yStart: 3 },
		pigeonGolfer    : { xStart: 3, yStart: 3 },
		pigeonTracksuit : { xStart: 4, yStart: 3 },
		/** Third row. Bottom row is empty. */
		pigeonBowler    : { xStart: 1, yStart: 2 },
		pigeonHoodie    : { xStart: 2, yStart: 2 },
		pigeonFancy     : { xStart: 3, yStart: 2 },
		pigeonStreet    : { xStart: 4, yStart: 2 },
	},
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
	source    : 'assets/images/example-themes/showcase/sprites-smoke-1.png',
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


// MARK: exampleBubblesAtlas
/**
 * Pictorial fill for an image-reveal bar — liquid with bubbles (1024×128,
 * tiles seamlessly left ↔ right). Exported from `duck-showcase-assets.af`
 * (`progressBar-bubbles` artboard). Replace `progressBar-bubbles.png`
 * in place to change the art.
 */
export const exampleBubblesAtlas = new TextureAtlas({
	source : 'assets/images/example-themes/showcase/progressBar-bubbles.png',
	columns: 1,
	rows   : 1,
})


// MARK: ExampleLayeredBarArt
/**
 * Three-layer horizontal bar art from `duck-showcase-assets.af`
 * — one artboard per PNG, named to match (`progressBar-<name>-background`,
 * `-border`, `-fill`); export the artboards over these files to update the art.
 *
 * - `background` / `border` are cropped tight to the frame (no transparent
 *   margin), so the bar's visible edges are the element's edges.
 * - `fill` is cropped to the fill's own bounds and revealed with
 *   `uvCropWithFill`; `fillInset` is where that crop sits inside the frame,
 *   in art pixels — scale it to the display size for `contentInset`.
 * - The border hides the fill / background seams.
 */
export type ExampleLayeredBarArt = {
	artWidth  : number
	artHeight : number
	background: string
	border    : string
	fill      : TextureAtlas
	fillInset : { top: number, right: number, bottom: number, left: number }
	/**
	 * Art pixels from each horizontal edge that must not stretch (angled /
	 * rounded ends, studs, rivets). The middle stretches so the bar can fill
	 * any width; the fill uses the same split. `0` = fixed-size art only.
	 */
	capArt    : number
}

const LAYERED_BAR_DIR = 'assets/images/example-themes/showcase'

// MARK: createLayeredBarArt
/** Builds an `ExampleLayeredBarArt` from the `progressBar-<name>-*.png` naming. */
function createLayeredBarArt(
	name     : string,
	fillInset: ExampleLayeredBarArt['fillInset'],
	capArt   : number,
	artWidth : number,
	artHeight: number,
): ExampleLayeredBarArt {
	return {
		capArt,
		artWidth,
		artHeight,
		background: `${LAYERED_BAR_DIR}/progressBar-${name}-background.png`,
		border    : `${LAYERED_BAR_DIR}/progressBar-${name}-border.png`,
		fill      : new TextureAtlas({
			source : `${LAYERED_BAR_DIR}/progressBar-${name}-fill.png`,
			columns: 1,
			rows   : 1,
		}),
		fillInset,
	}
}

/** Angled sci-fi bar: striped cyan fill, gunmetal frame, cyan accent strips. */
export const exampleNeonSlantBar = createLayeredBarArt('neon-slant', { top: 14, right: 22, bottom: 14, left: 22 }, 79, 962, 110)

/** Rounded capsule: glossy orange fill, gold rim, gem studs. */
export const exampleEmberCapsuleBar = createLayeredBarArt('ember-capsule', { top: 14, right: 14, bottom: 14, left: 14 }, 68, 920, 100)

/** Chamfered corners: segmented green fill, brushed-steel frame, rivets. */
export const exampleTacticalChamferBar = createLayeredBarArt('tactical-chamfer', { top: 14, right: 14, bottom: 14, left: 14 }, 152, 928, 108)

/**
 * Vertical thermometer (256×1024): brass-framed plaque, glass tube, mercury
 * column fill (`fillFrom="bottom"`). The bulb is part of the background so it
 * stays red at 0%. Plaque spans art y 12–1012.
 */
export const exampleThermometerBar = createLayeredBarArt('thermometer', { top: 83, right: 114, bottom: 161, left: 114 }, 0, 256, 1024)

/**
 * Narrow vertical plasma column (128×1024): gunmetal chamfered frame with
 * violet accent strips, LEDs and rivets; segmented magenta → violet fill
 * (`fillFrom="bottom"`). Frame spans art y 8–1016. Fixed-size art (no caps).
 */
export const examplePlasmaColumnBar = createLayeredBarArt('plasma-column', { top: 52, right: 30, bottom: 52, left: 30 }, 0, 128, 1024)

/**
 * Narrow wooden gauge (208×1024): planked timber case with iron brackets,
 * rivets, rope bands and blank brass plates around a glass tube; bubbly
 * green liquid fill (`fillFrom="bottom"`). Glass gloss and tick marks live on
 * the border layer so they sit over the liquid. Case spans art y 8–1016.
 * Original kit art.
 */
export const exampleTimberGaugeBar = createLayeredBarArt('timber-gauge', { top: 150, right: 58, bottom: 178, left: 58 }, 0, 208, 1024)
