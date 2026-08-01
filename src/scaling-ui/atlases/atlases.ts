import { TextureAtlas } from './textureAtlas'


// MARK: atlasIcons
/** General UI icons — 4×4 grid. */
export const atlasIcons = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-icons.png',
	columns: 4,
	rows   : 4,
})


// MARK: atlasBtnIcons
/** Unstyled button icon atlas — columns = variants, rows = states. */
export const atlasBtnIcons = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 },
	},
})


// MARK: atlasBtnIconsStyled
/** Styled button icon atlas — columns = variants, rows = states. */
export const atlasBtnIconsStyled = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-btn-icons-styled.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 },
	},
})


// MARK: atlasSpinners
/** Spinner atlas — 2×2 grid with a default cell inset. */
export const atlasSpinners = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-spinners-01.png',
	columns: 2,
	rows   : 2,
	inset  : 0.15,
	named  : {
		/** Top-left. */
		threeQuarterCircle: { xStart: 1, yStart: 2 },
		/** Top-right. */
		dots              : { xStart: 2, yStart: 2 },
		/** Bottom-left. */
		hourglass         : { xStart: 1, yStart: 1 },
		/** Bottom-right. */
		circle            : { xStart: 2, yStart: 1 },
	},
})


// MARK: atlasCharsNumbers
/**
 * Number / operator atlas (`atlas-chars-numbers.png`), top → bottom in the PNG.
 * UV Y is bottom → top, so `char()` inverts row index via `findAtlasCell`.
 */
export const atlasCharsNumbers = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-chars-numbers.png',
	columns: 4,
	rows   : 4,
	layout : [
		"/+-x",
		"89=:",
		"4567",
		"0123",
	],
	aliases: {
		'*': 'x',
		'×': 'x',
	},
})


// MARK: atlasCharsSymbols
/** Symbol atlas (`atlas-chars-symbols.png`). */
export const atlasCharsSymbols = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-chars-symbols.png',
	columns: 4,
	rows   : 4,
	layout : [
		"/+-x",
		"/:.=",
		"@!?#",
		"'\"$%'",
	],
})


// MARK: atlasCharsAlphaNumeric
/** Alphanumeric atlas (`atlas-chars-alphaNumeric.png`) — 8×8. */
export const atlasCharsAlphaNumeric = new TextureAtlas({
	source : 'assets/images/scaling-ui/atlas-chars-alphaNumeric.png',
	columns: 8,
	rows   : 8,
	layout : [
		"abcdefgh",
		"ijklmnop",
		"qrstuvwx",
		"yzABCDEF",
		"GHIJKLMN",
		"OPQRSTUV",
		"WXYZ0123",
		"456789--",
	],
})
