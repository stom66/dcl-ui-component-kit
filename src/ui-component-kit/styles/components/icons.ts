export type ThemeIcons = {
	defaultSize: number
	minSize    : number
	numbers    : {
		/**
		 * UV crop applied to each side of a glyph cell (alphanumeric and symbols sheets).
		 * Cells are square but glyphs are usually narrower — this trims horizontal whitespace.
		 * Wider custom font → decrease; narrower font → increase. Default `0.15` matches the bundled atlas.
		 */
		horizontalInset: number
	}
}

export const icons: ThemeIcons = {
	minSize    : 32,
	defaultSize: 32,
	numbers    : {
		horizontalInset: 0.15,
	},
}
