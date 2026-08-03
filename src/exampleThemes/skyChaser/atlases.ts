import type { ProgressBarImageTextures } from '../../scaling-ui'
import { TextureAtlas } from '../../scaling-ui'


// ---------------------------------------------------------------------------
// SkyChaser textures
//
// Export PNGs into `assets/images/example-themes/skyChaser/` and keep the
// filenames in sync. Placeholder art currently mirrors Scaling UI defaults —
// replace those files when the real SkyChaser assets are ready.
// ---------------------------------------------------------------------------


// MARK: startButtonAtlas
/**
 * Start-game button atlas for `ButtonImage`.
 * Grid: columns = button variants, rows = states (disabled → default, UV bottom→top).
 * Placeholder sheet is a copy of `atlas-btn-icons-styled.png` — swap for real art.
 */
export const startButtonAtlas = new TextureAtlas({
	source : 'assets/images/example-themes/skyChaser/atlas-btn-start.png',
	columns: 4,
	rows   : 4,
	named  : {
		start: { xStart: 1, yStart: 4 },
	},
})


// MARK: skyChaserProgressBarTextures
/**
 * Horizontal progress-bar textures for `ProgressBarImage`.
 * Placeholder copies of the framework defaults — replace in place when ready.
 */
export const skyChaserProgressBarTextures: ProgressBarImageTextures = {
	background: 'assets/images/example-themes/skyChaser/progressBar-horizontal-background.png',
	fill      : 'assets/images/example-themes/skyChaser/progressBar-horizontal-fill.png',
	border    : 'assets/images/example-themes/skyChaser/progressBar-horizontal-border.png',
}
