import { TextureAtlas } from './textureAtlas'


// MARK: atlasBtnIcons
/** Unstyled button icon atlas — columns = variants, rows = states. */
export const atlasBtnIcons = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-btn-icons.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 },
	},
})


// MARK: atlasBtnIconsStyled
/** Styled button icon atlas — columns = variants, rows = states. */
export const atlasBtnIconsStyled = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-btn-icons-styled.png',
	columns: 4,
	rows   : 4,
	named  : {
		close: { xStart: 1, yStart: 4 },
	},
})


// MARK: atlasCharsNumbers
/**
 * Number / operator atlas (`atlas-chars-numbers.png`), top → bottom in the PNG.
 * UV Y is bottom → top, so `char()` inverts row index via `findAtlasCell`.
 * Default sheet for `IconNumber` — prefer that over `IconString` / `IconCharacter`
 * when only digits and operators are needed (smaller texture, less overhead).
 *
 * Grid (PNG top → bottom):
 *   / + - ×
 *   8 9 , :
 *   4 5 6 7
 *   0 1 2 3
 */
export const atlasCharsNumbers = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-chars-numbers.png',
	columns: 4,
	rows   : 4,
	layout : [
		"/+-×",
		"89,:",
		"4567",
		"0123",
	],
	aliases: {
		'*': '×',
		'x': '×',
	},
	charInsets: {
		'1': { insetX: 0.3  },
		',': { insetX: 0.35 },
		':': { insetX: 0.35 },
	},
})


// MARK: atlasCharsSymbols
/**
 * Symbol atlas (`atlas-chars-symbols.png`), top → bottom in the PNG.
 * Used by `IconSymbol`, as `IconNumber`'s punctuation fallback, and in the
 * `IconString` cascade.
 *
 * Grid (PNG top → bottom):
 *   . ' " ;
 *   ( ) ! ?
 *   & % @ #
 *   ÷ = $ _
 */
export const atlasCharsSymbols = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-chars-symbols.png',
	columns: 4,
	rows   : 4,
	layout : [
		".'\";",
		"()!?",
		"&%@#",
		"÷=$_",
	],
})


// MARK: atlasCharsAlphaNumeric
/**
 * Alphanumeric atlas (`atlas-chars-alphaNumeric.png`) — 8×8.
 * Used by `IconCharacter` and as the first cascade sheet for `IconString`
 * (`a–z`, `A–Z`, `0–9`). Prefer `IconNumber` when digits/operators alone suffice.
 */
export const atlasCharsAlphaNumeric = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-chars-alphaNumeric.png',
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
		"456789",
	],
})


// MARK: atlasGradientColors
/**
 * Colour gradient atlas — 8×12. Solid swatches on odd rows of each band;
 * soft horizontal blends on the middle row of each 3-row band (UV rows
 * 2 / 5 / 8 / 11). Used by `ProgressBarImage` via `atlas` + `uvCell`.
 */
export const atlasGradientColors = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-gradient-colors.png',
	columns: 8,
	rows   : 12,
	named  : {
		/** UV row 2 — warm pinks / yellows / oranges / reds / purples. */
		pink           : { xStart: 1, xEnd: 2, yStart: 2, insetY: 0.4 },
		pinkYellow     : { xStart: 1, xEnd: 3, yStart: 2, insetY: 0.4 },
		yellowOrange   : { xStart: 3, xEnd: 5, yStart: 2, insetY: 0.4 },
		yellowOrangeRed: { xStart: 3, xEnd: 6, yStart: 2, insetY: 0.4 },
		orangeRed      : { xStart: 4, xEnd: 6, yStart: 2, insetY: 0.4 },
		redPurple      : { xStart: 5, xEnd: 7, yStart: 2, insetY: 0.4 },
		purpleSlate    : { xStart: 7, xEnd: 8, yStart: 2, insetY: 0.4 },

		/** UV row 5 — cyans / blues / violets. */
		cyan           : { xStart: 1, xEnd: 3, yStart: 5, insetY: 0.4 },
		blue           : { xStart: 3, xEnd: 5, yStart: 5, insetY: 0.4 },
		bluePurple     : { xStart: 5, xEnd: 7, yStart: 5, insetY: 0.4 },
		violet         : { xStart: 7, xEnd: 8, yStart: 5, insetY: 0.4 },

		/** UV row 8 — greens / greys / neutrals. */
		green          : { xStart: 1, xEnd: 3, yStart: 8, insetY: 0.4 },
		tealBlack      : { xStart: 3, xEnd: 5, yStart: 8, insetY: 0.4 },
		grey           : { xStart: 4, xEnd: 6, yStart: 8, insetY: 0.4 },
		sand           : { xStart: 6, xEnd: 8, yStart: 8, insetY: 0.4 },

		/** UV row 11 — browns / terracotta / peach / chartreuse. */
		brown          : { xStart: 1, xEnd: 3, yStart: 11, insetY: 0.4 },
		brownTerracotta: { xStart: 3, xEnd: 5, yStart: 11, insetY: 0.4 },
		terracottaPeach: { xStart: 4, xEnd: 6, yStart: 11, insetY: 0.4 },
		peachCream     : { xStart: 6, xEnd: 7, yStart: 11, insetY: 0.4 },
		chartreuse     : { xStart: 7, xEnd: 8, yStart: 11, insetY: 0.4 },

		/** Default progress fill: columns 4–5, UV row 2, vertical inset 0.4. */
		progressBar: { xStart: 4, xEnd: 5, yStart: 2, insetY: 0.4 },
	},
})


// MARK: atlasIconsFontAwesome
/**
 * Font Awesome solid icon atlas — 16×16 grid (PNG top → bottom; UV Y is
 * bottom → top). Cells are 128×128 with icons fit to an **86px** max axis
 * (~0.707 × cell, minus shadow budget) and centered so rotations / wiggle
 * animations do not clip into neighbours. Named keys are camelCase FA names
 * (e.g. `dice-d20` → `diceD20`). Default source for `Icon`.
 */
export const atlasIconsFontAwesome = new TextureAtlas({
	source : 'assets/images/ui-component-kit/atlas-icons-font-awesome.png',
	columns: 16,
	rows   : 16,
	inset  : 0.1,
	named  : {
		/** Row 1 (PNG top→bottom). */
		plus               : { xStart:  1, yStart: 16 },
		check              : { xStart:  2, yStart: 16 },
		minus              : { xStart:  3, yStart: 16 },
		xmark              : { xStart:  4, yStart: 16 },
		gamepad            : { xStart:  5, yStart: 16 },
		bars               : { xStart:  6, yStart: 16 },
		gear               : { xStart:  7, yStart: 16 },
		star               : { xStart:  8, yStart: 16 },
		user               : { xStart:  9, yStart: 16 },
		heart              : { xStart: 10, yStart: 16 },
		diceD20            : { xStart: 11, yStart: 16 },
		arrowLeft          : { xStart: 12, yStart: 16 },
		arrowRight         : { xStart: 13, yStart: 16 },
		gem                : { xStart: 14, yStart: 16 },
		key                : { xStart: 15, yStart: 16 },
		map                : { xStart: 16, yStart: 16 },
		/** Row 2 (PNG top→bottom). */
		bolt               : { xStart:  1, yStart: 15 },
		fire               : { xStart:  2, yStart: 15 },
		play               : { xStart:  3, yStart: 15 },
		coins              : { xStart:  4, yStart: 15 },
		skull              : { xStart:  5, yStart: 15 },
		users              : { xStart:  6, yStart: 15 },
		rocket             : { xStart:  7, yStart: 15 },
		shield             : { xStart:  8, yStart: 15 },
		trophy             : { xStart:  9, yStart: 15 },
		compass            : { xStart: 10, yStart: 15 },
		diceD6             : { xStart: 11, yStart: 15 },
		dungeon            : { xStart: 12, yStart: 15 },
		arrowUp            : { xStart: 13, yStart: 15 },
		arrowDown          : { xStart: 14, yStart: 15 },
		circleCheck        : { xStart: 15, yStart: 15 },
		lock               : { xStart: 16, yStart: 15 },
		/** Row 3 (PNG top→bottom). */
		house              : { xStart:  1, yStart: 14 },
		pause              : { xStart:  2, yStart: 14 },
		chevronLeft        : { xStart:  3, yStart: 14 },
		circleXmark        : { xStart:  4, yStart: 14 },
		locationDot        : { xStart:  5, yStart: 14 },
		chevronRight       : { xStart:  6, yStart: 14 },
		shieldHalved       : { xStart:  7, yStart: 14 },
		magnifyingGlass    : { xStart:  8, yStart: 14 },
		eye                : { xStart:  9, yStart: 14 },
		sun                : { xStart: 10, yStart: 14 },
		bell               : { xStart: 11, yStart: 14 },
		bomb               : { xStart: 12, yStart: 14 },
		dice               : { xStart: 13, yStart: 14 },
		moon               : { xStart: 14, yStart: 14 },
		clock              : { xStart: 15, yStart: 14 },
		crown              : { xStart: 16, yStart: 14 },
		/** Row 4 (PNG top→bottom). */
		robot              : { xStart:  1, yStart: 13 },
		dragon             : { xStart:  2, yStart: 13 },
		unlock             : { xStart:  3, yStart: 13 },
		stopwatch          : { xStart:  4, yStart: 13 },
		angleLeft          : { xStart:  5, yStart: 13 },
		chevronUp          : { xStart:  6, yStart: 13 },
		crosshairs         : { xStart:  7, yStart: 13 },
		angleRight         : { xStart:  8, yStart: 13 },
		volumeHigh         : { xStart:  9, yStart: 13 },
		chevronDown        : { xStart: 10, yStart: 13 },
		mapLocationDot     : { xStart: 11, yStart: 13 },
		skullCrossbones    : { xStart: 12, yStart: 13 },
		screwdriverWrench  : { xStart: 13, yStart: 13 },
		triangleExclamation: { xStart: 14, yStart: 13 },
		angleUp            : { xStart: 15, yStart: 13 },
		lockOpen           : { xStart: 16, yStart: 13 },
		/** Row 5 (PNG top→bottom). */
		angleDown          : { xStart:  1, yStart: 12 },
		stop               : { xStart:  2, yStart: 12 },
		gears              : { xStart:  3, yStart: 12 },
		ghost              : { xStart:  4, yStart: 12 },
		wrench             : { xStart:  5, yStart: 12 },
		dots               : { xStart:  6, yStart: 12 },
		sliders            : { xStart:  7, yStart: 12 },
		bullseye           : { xStart:  8, yStart: 12 },
		explosion          : { xStart:  9, yStart: 12 },
		eyeSlash           : { xStart: 10, yStart: 12 },
		handFist           : { xStart: 11, yStart: 12 },
		lightbulb          : { xStart: 12, yStart: 12 },
		userNinja          : { xStart: 13, yStart: 12 },
		circlePlus         : { xStart: 14, yStart: 12 },
		heartCrack         : { xStart: 15, yStart: 12 },
		jetFighter         : { xStart: 16, yStart: 12 },
		/** Row 6 (PNG top→bottom). */
		volumeXmark        : { xStart:  1, yStart: 11 },
		arrowsRotate       : { xStart:  2, yStart: 11 },
		flagCheckered      : { xStart:  3, yStart: 11 },
		circleExclamation  : { xStart:  4, yStart: 11 },
		wandMagicSparkles  : { xStart:  5, yStart: 11 },
		box                : { xStart:  6, yStart: 11 },
		bug                : { xStart:  7, yStart: 11 },
		gun                : { xStart:  8, yStart: 11 },
		flag               : { xStart:  9, yStart: 11 },
		gift               : { xStart: 10, yStart: 11 },
		ship               : { xStart: 11, yStart: 11 },
		tree               : { xStart: 12, yStart: 11 },
		wifi               : { xStart: 13, yStart: 11 },
		burst              : { xStart: 14, yStart: 11 },
		chess              : { xStart: 15, yStart: 11 },
		flask              : { xStart: 16, yStart: 11 },
		/** Row 7 (PNG top→bottom). */
		globe              : { xStart:  1, yStart: 10 },
		medal              : { xStart:  2, yStart: 10 },
		plane              : { xStart:  3, yStart: 10 },
		trash              : { xStart:  4, yStart: 10 },
		meteor             : { xStart:  5, yStart: 10 },
		rotate             : { xStart:  6, yStart: 10 },
		scroll             : { xStart:  7, yStart: 10 },
		spider             : { xStart:  8, yStart: 10 },
		comment            : { xStart:  9, yStart: 10 },
		forward            : { xStart: 10, yStart: 10 },
		palette            : { xStart: 11, yStart: 10 },
		ban                : { xStart: 12, yStart: 10 },
		toolbox            : { xStart: 13, yStart: 10 },
		ellipsis           : { xStart: 14, yStart: 10 },
		envelope           : { xStart: 15, yStart: 10 },
		mountain           : { xStart: 16, yStart: 10 },
		/** Row 8 (PNG top→bottom). */
		hourglass          : { xStart:  1, yStart:  9 },
		microchip          : { xStart:  2, yStart:  9 },
		powerOff           : { xStart:  3, yStart:  9 },
		snowflake          : { xStart:  4, yStart:  9 },
		thumbsUp           : { xStart:  5, yStart:  9 },
		trashCan           : { xStart:  6, yStart:  9 },
		userPlus           : { xStart:  7, yStart:  9 },
		cloudBolt          : { xStart:  8, yStart:  9 },
		hatWizard          : { xStart:  9, yStart:  9 },
		userGroup          : { xStart: 10, yStart:  9 },
		volumeLow          : { xStart: 11, yStart:  9 },
		volumeOff          : { xStart: 12, yStart:  9 },
		wandMagic          : { xStart: 13, yStart:  9 },
		circleInfo         : { xStart: 14, yStart:  9 },
		heartPulse         : { xStart: 15, yStart:  9 },
		kitMedical         : { xStart: 16, yStart:  9 },
		/** Row 9 (PNG top→bottom). */
		paperPlane         : { xStart:  1, yStart:  8 },
		rotateLeft         : { xStart:  2, yStart:  8 },
		userShield         : { xStart:  3, yStart:  8 },
		circleMinus        : { xStart:  4, yStart:  8 },
		puzzlePiece        : { xStart:  5, yStart:  8 },
		rankingStar        : { xStart:  6, yStart:  8 },
		rotateRight        : { xStart:  7, yStart:  8 },
		arrowPointer       : { xStart:  8, yStart:  8 },
		shuttleSpace       : { xStart:  9, yStart:  8 },
		hourglassHalf      : { xStart: 10, yStart:  8 },
		personRunning      : { xStart: 11, yStart:  8 },
		circleQuestion     : { xStart: 12, yStart:  8 },
		ellipsisVertical   : { xStart: 13, yStart:  8 },
		fireFlameCurved    : { xStart: 14, yStart:  8 },
		car                : { xStart: 15, yStart:  8 },
		paw                : { xStart: 16, yStart:  8 },
		/** Row 10 (PNG top→bottom). */
		atom               : { xStart:  1, yStart:  7 },
		cube               : { xStart:  2, yStart:  7 },
		link               : { xStart:  3, yStart:  7 },
		list               : { xStart:  4, yStart:  7 },
		ring               : { xStart:  5, yStart:  7 },
		award              : { xStart:  6, yStart:  7 },
		cloud              : { xStart:  7, yStart:  7 },
		music              : { xStart:  8, yStart:  7 },
		water              : { xStart:  9, yStart:  7 },
		anchor             : { xStart: 10, yStart:  7 },
		expand             : { xStart: 11, yStart:  7 },
		filter             : { xStart: 12, yStart:  7 },
		hammer             : { xStart: 13, yStart:  7 },
		signal             : { xStart: 14, yStart:  7 },
		message            : { xStart: 15, yStart:  7 },
		backward           : { xStart: 16, yStart:  7 },
		/** Row 11 (PNG top→bottom). */
		boxOpen            : { xStart:  1, yStart:  6 },
		comments           : { xStart:  2, yStart:  6 },
		download           : { xStart:  3, yStart:  6 },
		bookOpen           : { xStart:  4, yStart:  6 },
		diceFive           : { xStart:  5, yStart:  6 },
		doorOpen           : { xStart:  6, yStart:  6 },
		bellSlash          : { xStart:  7, yStart:  6 },
		binoculars         : { xStart:  8, yStart:  6 },
		campground         : { xStart:  9, yStart:  6 },
		caretLeft          : { xStart: 10, yStart:  6 },
		flaskVial          : { xStart: 11, yStart:  6 },
		caretRight         : { xStart: 12, yStart:  6 },
		sackDollar         : { xStart: 13, yStart:  6 },
		screwdriver        : { xStart: 14, yStart:  6 },
		thumbsDown         : { xStart: 15, yStart:  6 },
		batteryFull        : { xStart: 16, yStart:  6 },
		/** Row 12 (PNG top→bottom). */
		chessKnight        : { xStart:  1, yStart:  5 },
		forwardStep        : { xStart:  2, yStart:  5 },
		handPointer        : { xStart:  3, yStart:  5 },
		mountainSun        : { xStart:  4, yStart:  5 },
		personHiking       : { xStart:  5, yStart:  5 },
		satelliteDish      : { xStart:  6, yStart:  5 },
		userAstronaut      : { xStart:  7, yStart:  5 },
		clipboardCheck     : { xStart:  8, yStart:  5 },
		caretUp            : { xStart:  9, yStart:  5 },
		caretDown          : { xStart: 10, yStart:  5 },
		cat                : { xStart: 11, yStart:  5 },
		dog                : { xStart: 12, yStart:  5 },
		book               : { xStart: 13, yStart:  5 },
		hand               : { xStart: 14, yStart:  5 },
		tent               : { xStart: 15, yStart:  5 },
		wind               : { xStart: 16, yStart:  5 },
		/** Row 13 (PNG top→bottom). */
		cubes              : { xStart:  1, yStart:  4 },
		pills              : { xStart:  2, yStart:  4 },
		camera             : { xStart:  3, yStart:  4 },
		person             : { xStart:  4, yStart:  4 },
		upload             : { xStart:  5, yStart:  4 },
		droplet            : { xStart:  6, yStart:  4 },
		listUl             : { xStart:  7, yStart:  4 },
		volcano            : { xStart:  8, yStart:  4 },
		bookmark           : { xStart:  9, yStart:  4 },
		calendar           : { xStart: 10, yStart:  4 },
		compress           : { xStart: 11, yStart:  4 },
		database           : { xStart: 12, yStart:  4 },
		dumbbell           : { xStart: 13, yStart:  4 },
		infinity           : { xStart: 14, yStart:  4 },
		terminal           : { xStart: 15, yStart:  4 },
		utensils           : { xStart: 16, yStart:  4 },
		/** Row 14 (PNG top→bottom). */
		cloudSun           : { xStart:  1, yStart:  3 },
		lifeRing           : { xStart:  2, yStart:  3 },
		satellite          : { xStart:  3, yStart:  3 },
		chessKing          : { xStart:  4, yStart:  3 },
		chessPawn          : { xStart:  5, yStart:  3 },
		chessRook          : { xStart:  6, yStart:  3 },
		cloudMoon          : { xStart:  7, yStart:  3 },
		headphones         : { xStart:  8, yStart:  3 },
		helicopter         : { xStart:  9, yStart:  3 },
		motorcycle         : { xStart: 10, yStart:  3 },
		paintbrush         : { xStart: 11, yStart:  3 },
		chessQueen         : { xStart: 12, yStart:  3 },
		doorClosed         : { xStart: 13, yStart:  3 },
		fingerprint        : { xStart: 14, yStart:  3 },
		addressCard        : { xStart: 15, yStart:  3 },
		batteryHalf        : { xStart: 16, yStart:  3 },
		/** Row 15 (PNG top→bottom). */
		shieldVirus        : { xStart:  1, yStart:  2 },
		backwardStep       : { xStart:  2, yStart:  2 },
		boxesStacked       : { xStart:  3, yStart:  2 },
		cartShopping       : { xStart:  4, yStart:  2 },
		masksTheater       : { xStart:  5, yStart:  2 },
		earthAmericas      : { xStart:  6, yStart:  2 },
		personWalking      : { xStart:  7, yStart:  2 },
		briefcaseMedical   : { xStart:  8, yStart:  2 },
		dna                : { xStart:  9, yStart:  2 },
		tag                : { xStart: 10, yStart:  2 },
		code               : { xStart: 11, yStart:  2 },
		copy               : { xStart: 12, yStart:  2 },
		crow               : { xStart: 13, yStart:  2 },
		fish               : { xStart: 14, yStart:  2 },
		leaf               : { xStart: 15, yStart:  2 },
		road               : { xStart: 16, yStart:  2 },
		/** Row 16 (PNG top→bottom). */
		sort               : { xStart:  1, yStart:  1 },
		vial               : { xStart:  2, yStart:  1 },
		horse              : { xStart:  3, yStart:  1 },
		image              : { xStart:  4, yStart:  1 },
		phone              : { xStart:  5, yStart:  1 },
		truck              : { xStart:  6, yStart:  1 },
		video              : { xStart:  7, yStart:  1 },
		virus              : { xStart:  8, yStart:  1 },
		burger             : { xStart:  9, yStart:  1 },
		folder             : { xStart: 10, yStart:  1 },
		magnet             : { xStart: 11, yStart:  1 },
		pencil             : { xStart: 12, yStart:  1 },
		qrcode             : { xStart: 13, yStart:  1 },
		server             : { xStart: 14, yStart:  1 },
		ticket             : { xStart: 15, yStart:  1 },
		bandage            : { xStart: 16, yStart:  1 },
	},
})
