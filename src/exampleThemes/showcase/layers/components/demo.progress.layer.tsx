import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { alpha, atlasGradientColors, atlasSpritesProgressRadial, atlasSpritesProgressRadialComet, atlasSpritesProgressRadialDots, atlasSpritesProgressRadialKnob, atlasSpritesProgressRadialPie, atlasSpritesProgressRadialSegments, atlasSpritesProgressRadialStopwatch, atlasSpritesProgressRadialSunburst, atlasSpritesProgressRadialThick, atlasSpritesProgressSquare, atlasSpritesProgressSquareComet, atlasSpritesProgressSquareDots, atlasSpritesProgressSquareSegments, atlasSpritesProgressSquareSunburst, Background, Column, type FillFrom, getTheme, H2, H3, Layer, ProgressBar, ProgressBarImage, ProgressBarRadial, PropsController, Row, Text, TextureAtlas, ZoneType } from '../../../../ui-component-kit'
import { progressBarContentTransform, syncDisplayValue, valueToPercent } from '../../../../ui-component-kit/components/progressBar/progressBar.shared'
import { timers } from '../../../../ui-component-kit/utils/timers'

import { exampleEmberCapsuleBar, type ExampleLayeredBarArt, exampleNeonSlantBar, examplePlasmaColumnBar, exampleTacticalChamferBar, exampleTimberGaugeBar, exampleThermometerBar } from '../../atlases'

const DANGER_MIN_VALUE   = 0
const DANGER_MAX_VALUE   = 100
/** Every value-driven bar shares one random value, re-rolled on this interval. */
const DANGER_INTERVAL_MS = 1500
const RADIAL_LOOP_MS     = 4000
const RADIAL_SIZE        = 56
/**
 * Chip corner radius for the rounded-square example (L). Concentric with the
 * sprite's outline: at 56px the 8px outer corner (64px cell, 0.02 UV inset)
 * draws at ~7.3px, sitting ~2.5px in from the chip edge.
 */
const SQUARE_CHIP_RADIUS = 10

/**
 * Radial example C (channel). The ring sits in the gap between the root's
 * border and an inner bordered disc. Sizes are whole, even pixels so the
 * chip, ring and disc share a centre on the pixel grid — half-pixel offsets
 * get rounded by the renderer and show as a 1px sliver on one side.
 *
 * To make the ring fill the channel without growing the sprite past the
 * 56px chip, this example samples the standard ring sheet with a larger UV
 * inset (0.028 vs the default 0.02): cropping more of each cell's empty
 * margin draws the ring ~2% larger at the same sprite size.
 */
const RADIAL_CHANNEL_BORDER = 2
const RADIAL_CHANNEL_INNER  = 44
const RADIAL_CHANNEL_INNER_BORDER = 1
const radialChannelAtlas    = new TextureAtlas({
	source : atlasSpritesProgressRadial.source,
	columns: 16,
	rows   : 16,
	inset  : 0.028,
})
const COUNTDOWN_SECONDS  = 10
const COUNTDOWN_MS       = COUNTDOWN_SECONDS * 1000
const BAR_HEIGHT         = 27
const TRANSPARENT        = Color4.create(0, 0, 0, 0)
/** How long the procedural bars take to blend to a new theme colour after each value change. */
const COLOR_LERP_MS      = 250
/** Slot width for letters beside horizontal bars, so every bar shares a left edge. */
const EXAMPLE_LETTER_WIDTH = 14

/**
 * Shared height of every vertical bar (display px), so the row lines up top
 * and bottom. Layered-art bars size themselves so their visible frame matches.
 */
const VERTICAL_HEIGHT = 382

/** Thermometer plaque spans art y 12–1012; size it so the plaque matches `VERTICAL_HEIGHT`. */
const THERMO_PLAQUE_ART_TOP    = 12
const THERMO_PLAQUE_ART_BOTTOM = 1012
const THERMO_DISPLAY_HEIGHT    = VERTICAL_HEIGHT * exampleThermometerBar.artHeight / (THERMO_PLAQUE_ART_BOTTOM - THERMO_PLAQUE_ART_TOP)

/** Plasma column frame spans art y 8–1016; size it so the frame matches `VERTICAL_HEIGHT`. */
const PLASMA_FRAME_ART_TOP     = 8
const PLASMA_FRAME_ART_BOTTOM  = 1016
const PLASMA_DISPLAY_HEIGHT    = VERTICAL_HEIGHT * examplePlasmaColumnBar.artHeight / (PLASMA_FRAME_ART_BOTTOM - PLASMA_FRAME_ART_TOP)

/** Timber gauge case spans art y 8–1016; size it so the case matches `VERTICAL_HEIGHT`. */
const TIMBER_CASE_ART_TOP     = 8
const TIMBER_CASE_ART_BOTTOM  = 1016
const TIMBER_DISPLAY_HEIGHT   = VERTICAL_HEIGHT * exampleTimberGaugeBar.artHeight / (TIMBER_CASE_ART_BOTTOM - TIMBER_CASE_ART_TOP)

/** Layered horizontal bars: same height as the procedural bars; width fills the column. */
const LAYERED_BAR_HEIGHT = BAR_HEIGHT

/** Full-frame chrome — no nine-slice caps. */
const NO_TEXTURE_SLICES = {
	top   : 0,
	right : 0,
	bottom: 0,
	left  : 0,
}


// MARK: randomInRange
/** Inclusive integer in `[min, max]`. */
function randomInRange(
	min: number,
	max: number,
): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}


// MARK: ColorLerp
/**
 * A colour that blends quickly from where it is now to a new target. The
 * layer re-renders every frame, so `current()` is read in `body()`.
 */
type ColorLerp = { from: Color4, to: Color4, startedAt: number }

/** Theme accent colours the procedural demo bars cycle through. */
function themeAccents(): Color4[] {
	const c = getTheme().colors
	return [c.primary, c.info, c.danger, c.success, c.warning]
}

function colorLerpCurrent(lerp: ColorLerp, now: number): Color4 {
	const t = Math.max(0, Math.min(1, (now - lerp.startedAt) / COLOR_LERP_MS))
	return Color4.lerp(lerp.from, lerp.to, t)
}

/** Retargets `lerp` at a random accent that differs from the current target. */
function colorLerpRetarget(lerp: ColorLerp, now: number) {
	const choices = themeAccents().filter(c => c.r !== lerp.to.r || c.g !== lerp.to.g || c.b !== lerp.to.b)
	if (choices.length === 0) {
		console.error('DemoProgressLayer: colorLerpRetarget: no theme accent colours to pick from')
		return
	}
	lerp.from      = colorLerpCurrent(lerp, now)
	lerp.to        = choices[Math.floor(Math.random() * choices.length)]
	lerp.startedAt = now
}


// MARK: timeRemainingColor
/** Plain yellow for the midpoint of the time-remaining blend (the theme has no yellow). */
const TIMER_YELLOW = Color4.fromHexString('#ffd23f')

/**
 * Green → yellow → red as `progress` runs from `0` (full time left) to `1`
 * (timed out). Green / red come from the theme (`success` / `danger`).
 */
function timeRemainingColor(progress: number): Color4 {
	const colors = getTheme().colors
	const p      = Math.max(0, Math.min(1, progress))
	return p < 0.5
		? Color4.lerp(colors.success, TIMER_YELLOW, p * 2)
		: Color4.lerp(TIMER_YELLOW, colors.danger, (p - 0.5) * 2)
}


// MARK: barCaption
/** Centered type label drawn inside a progress bar. */
function barCaption(value: string) {
	const theme = getTheme()

	return (
		<Text
			value       = {value}
			fontSize    = {theme.typography.size.default}
			fontColor   = {theme.colors.light}
			textAlign   = "middle-center"
			textWrap    = "nowrap"
			uiTransform = {{ width: 'auto', alignSelf: 'center' }}
		/>
	)
}


// MARK: exampleLetter
/**
 * Small letter that names one progress-bar design. The letter (A, B, C…)
 * is how the examples are referred to — "vertical example B" in the demo
 * maps to the `Example B` comment on the matching block below.
 */
function exampleLetter(
	letter: string,
	width : number | 'auto' = 'auto',
) {
	const theme = getTheme()

	return (
		<Text
			key         = "letter"
			value       = {letter}
			fontSize    = {theme.typography.size.small}
			textAlign   = "middle-center"
			textWrap    = "nowrap"
			uiTransform = {{
				width    : width,
				height   : theme.typography.size.small + 2,
				minHeight: 0,
				alignSelf: 'center',
			}}
		/>
	)
}


// MARK: radialExample
/** Wraps one radial demo with its letter label underneath. */
function radialExample(
	letter: string,
	child : ReactEcs.JSX.Element,
) {
	return (
		<Column
			key        = {`demo_progress_radial_example_${letter}`}
			width      = "auto"
			alignItems = "center"
			spacing    = {2}
		>
			{child}
			{exampleLetter(letter)}
		</Column>
	)
}


// MARK: verticalExample
/** Wraps one vertical demo with its letter label above the bar. */
function verticalExample(
	letter: string,
	child : ReactEcs.JSX.Element,
) {
	return (
		<Column
			key        = {`demo_progress_vertical_example_${letter}`}
			width      = "auto"
			alignItems = "center"
			spacing    = {8}
		>
			{exampleLetter(letter)}
			{child}
		</Column>
	)
}


// MARK: horizontalExample
/** Wraps one horizontal demo with its letter label to the left of the bar. */
function horizontalExample(
	letter: string,
	child : ReactEcs.JSX.Element,
) {
	return (
		<Row
			key        = {`demo_progress_horizontal_example_${letter}`}
			alignItems = "center"
			spacing    = {6}
		>
			{exampleLetter(letter, EXAMPLE_LETTER_WIDTH)}
			<UiEntity
				key         = "bar"
				uiTransform = {{
					width     : 0,
					height    : 'auto',
					flexGrow  : 1,
					flexShrink: 1,
					flexBasis : 0,
				}}
			>
				{child}
			</UiEntity>
		</Row>
	)
}


// MARK: cropBox
/**
 * Fixed-size box that shows `child` shifted up by `offsetTop`, so art with
 * transparent padding lines up with plain bars of `height`.
 */
function cropBox(
	key      : string,
	width    : number,
	height   : number,
	offsetTop: number,
	child    : ReactEcs.JSX.Element,
) {
	return (
		<UiEntity
			key         = {key}
			uiTransform = {{ width, height, flexShrink: 0 }}
		>
			<UiEntity
				uiTransform = {{
					positionType: 'absolute',
					position    : { top: -offsetTop, left: 0 },
				}}
			>
				{child}
			</UiEntity>
		</UiEntity>
	)
}


// MARK: layeredBar
/**
 * Three-layer image bar: background (stretched on the root), fill (atlas,
 * revealed with `uvCropWithFill` inside `contentInset`), border (on top,
 * hides the seams). Sized from `height` at the art's aspect ratio; insets
 * are scaled from art pixels to display pixels.
 */
function layeredBar(
	id      : string,
	art     : ExampleLayeredBarArt,
	value   : number,
	height  : number,
	fillFrom: FillFrom = 'left',
	caption?: string,
) {
	const scale = height / art.artHeight

	return (
		<ProgressBarImage
			key             = {id}
			id              = {id}
			value           = {value}
			fillFrom        = {fillFrom}
			width           = {art.artWidth * scale}
			height          = {height}
			borderRadius    = {0}
			borderWidth     = {0}
			backgroundColor = {TRANSPARENT}
			uiBackground    = {{
				textureMode: 'stretch',
				texture    : { src: art.background },
			}}
			textures        = {{ border: art.border }}
			textureSlices   = {NO_TEXTURE_SLICES}
			atlas           = {art.fill}
			uvCell          = {{ xStart: 1, yStart: 1 }}
			uvCropWithFill  = {true}
			contentInset    = {{
				top   : art.fillInset.top    * scale,
				right : art.fillInset.right  * scale,
				bottom: art.fillInset.bottom * scale,
				left  : art.fillInset.left   * scale,
			}}
		>
			{caption !== undefined ? barCaption(caption) : undefined}
		</ProgressBarImage>
	)
}


// MARK: sliceAtlas
/** One 1×1 `TextureAtlas` per texture path, so slices can be cut with `cell()` insets. */
const sliceAtlases = new Map<string, TextureAtlas>()
function sliceAtlas(src: string): TextureAtlas {
	let atlas = sliceAtlases.get(src)
	if (!atlas) {
		atlas = new TextureAtlas({ source: src, columns: 1, rows: 1 })
		sliceAtlases.set(src, atlas)
	}
	return atlas
}


// MARK: threeSlice
/**
 * Horizontal three-slice: fixed-width left / right caps (art keeps its
 * shape) and a middle that stretches to fill the parent.
 * `capFraction` is the cap width as a fraction of the texture width.
 */
function threeSlice(
	key        : string,
	atlas      : TextureAtlas,
	capFraction: number,
	capPx      : number,
) {
	const slice = (part: string, uiTransform: Record<string, unknown>, inset: { insetLeft?: number, insetRight?: number }) => (
		<UiEntity
			key          = {`${key}_${part}`}
			uiTransform  = {{ height: '100%', flexShrink: 0, ...uiTransform }}
			uiBackground = {{
				textureMode: 'stretch',
				texture    : atlas.texture,
				uvs        : atlas.cell({ xStart: 1, yStart: 1, ...inset }),
			}}
		/>
	)

	return (
		<UiEntity
			key         = {key}
			uiTransform = {{
				positionType : 'absolute',
				position     : { top: 0, right: 0, bottom: 0, left: 0 },
				flexDirection: 'row',
			}}
		>
			{slice('l', { width: capPx },              { insetRight: 1 - capFraction })}
			{slice('m', { width: 0, flexGrow: 1 },     { insetLeft: capFraction, insetRight: capFraction })}
			{slice('r', { width: capPx },              { insetLeft: 1 - capFraction })}
		</UiEntity>
	)
}


// MARK: stretchLayeredBar
/**
 * Full-width version of a layered texture bar. Background, border, and fill
 * are each three-sliced (caps keep their angle / curve, the middle
 * stretches), so the bar fills its column at any width without distortion.
 *
 * The fill is revealed, not squashed: a clip box is `percent%` of the fill
 * area, and the fill art inside it is sized back up to the whole fill area.
 */
function stretchLayeredBar(
	id     : string,
	art    : ExampleLayeredBarArt,
	value  : number,
	height : number,
	caption: string,
) {
	const theme       = getTheme()
	const scale       = height / art.artHeight
	const display     = syncDisplayValue(id, value, 0, 100, theme.animation.progressBarLerpDurationDefault)
	const percent     = Math.max(0, Math.min(100, valueToPercent(display, 0, 100)))
	const fillArtW    = art.artWidth - art.fillInset.left - art.fillInset.right
	const fillCapArt  = Math.max(0, art.capArt - art.fillInset.left)
	const capPx       = art.capArt * scale

	return (
		<UiEntity
			key         = {id}
			uiTransform = {{ width: '100%', height, flexShrink: 0 }}
		>
			{threeSlice(`${id}_bg`, sliceAtlas(art.background), art.capArt / art.artWidth, capPx)}

			<UiEntity
				key         = {`${id}_fill_area`}
				uiTransform = {{
					positionType: 'absolute',
					position    : {
						top   : art.fillInset.top    * scale,
						right : art.fillInset.right  * scale,
						bottom: art.fillInset.bottom * scale,
						left  : art.fillInset.left   * scale,
					},
				}}
			>
				{percent > 0.5 && (
					<UiEntity
						key         = {`${id}_fill_clip`}
						uiTransform = {{ width: `${percent}%`, height: '100%', overflow: 'hidden' }}
					>
						<UiEntity
							key         = {`${id}_fill_art`}
							uiTransform = {{
								positionType: 'absolute',
								position    : { top: 0, left: 0 },
								width       : `${(100 / percent) * 100}%`,
								height      : '100%',
							}}
						>
							{threeSlice(`${id}_fill`, art.fill, fillCapArt / fillArtW, fillCapArt * scale)}
						</UiEntity>
					</UiEntity>
				)}
			</UiEntity>

			{threeSlice(`${id}_border`, sliceAtlas(art.border), art.capArt / art.artWidth, capPx)}

			<UiEntity key={`${id}_content`} uiTransform={progressBarContentTransform()}>
				{barCaption(caption)}
			</UiEntity>
		</UiEntity>
	)
}


// MARK: DemoProgressLayer
/** Demo panel for procedural, image, radial, and layered-texture progress bars. */
export class DemoProgressLayer extends Layer {
	/** Fill colours of the procedural bars (first horizontal, first vertical); retarget on every value change. */
	private procColorHorizontal: ColorLerp = { from: getTheme().colors.warning, to: getTheme().colors.warning, startedAt: 0 }
	/** Count of value rolls, used to force empty / full on a fixed rhythm. */
	private valueRolls = 0
	private procColorVertical  : ColorLerp = { from: getTheme().colors.primary, to: getTheme().colors.primary, startedAt: 0 }

	constructor() {
		super({
			id             : 'demo-progress',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			// Temporary: open this panel on load while the radial examples are in progress.
			startHidden    : false,
			showCloseButton: true,
			uiTransform    : {
				width : '50vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			randomValue: 55,
		})

		timers.setInterval(() => {
			if (!this.props) {
				console.error('DemoProgressLayer: tick: props controller missing')
				return
			}
			// Force the extremes so the demo always shows the full range:
			// every 4th roll is empty, every 6th is full (12th, 24th… go full).
			this.valueRolls++
			const value = this.valueRolls % 6 === 0 ? DANGER_MAX_VALUE
				: this.valueRolls % 4 === 0 ? DANGER_MIN_VALUE
				: randomInRange(DANGER_MIN_VALUE, DANGER_MAX_VALUE)
			this.props.set('randomValue', value)
			const now = Date.now()
			colorLerpRetarget(this.procColorHorizontal, now)
			colorLerpRetarget(this.procColorVertical, now)
		}, DANGER_INTERVAL_MS)
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoProgressLayer.body: props controller missing')
			return null
		}

		const theme              = getTheme()
		const randomValue        = this.props.get('randomValue') as number
		const now                = Date.now()
		const radialProgress     = (now % RADIAL_LOOP_MS) / RADIAL_LOOP_MS
		const countdownRemaining = COUNTDOWN_MS - (now % COUNTDOWN_MS)
		const countdownValue     = Math.ceil(countdownRemaining / 1000)
		const countdownProgress  = countdownRemaining / COUNTDOWN_MS

		return [
			<Background key="demo_progress_chrome" />,
			<Column
				key            = "demo_progress_body"
				cols           = {12}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 12, right: 16, bottom: 16, left: 16 }}
			>
				<H2 key="demo_progress_title" value="Progress Bars" />

				<Row key="demo_progress_main" alignItems="flex-start">
					{/* MARK: Vertical
					*/}
					<Column
						key     = "demo_progress_col_vertical"
						cols    = {5}
						spacing = {8}
						padding = {{ left: 12 }}
					>
						<H3 key="demo_progress_h_vertical" value="Vertical" />
						<Row
							key            = "demo_progress_vertical_row"
							alignItems     = "flex-start"
							justifyContent = "flex-start"
						>
							{/* Example A — timber gauge. */}
							{verticalExample('A', cropBox(
								'demo_progress_timber_gauge_box',
								exampleTimberGaugeBar.artWidth * TIMBER_DISPLAY_HEIGHT / exampleTimberGaugeBar.artHeight,
								VERTICAL_HEIGHT,
								TIMBER_CASE_ART_TOP * TIMBER_DISPLAY_HEIGHT / exampleTimberGaugeBar.artHeight,
								layeredBar('demo_progress_timber_gauge', exampleTimberGaugeBar, randomValue, TIMBER_DISPLAY_HEIGHT, 'bottom'),
							))}
							{/* Example B — thermometer. */}
							{verticalExample('B', cropBox(
								'demo_progress_thermometer_box',
								exampleThermometerBar.artWidth * THERMO_DISPLAY_HEIGHT / exampleThermometerBar.artHeight,
								VERTICAL_HEIGHT,
								THERMO_PLAQUE_ART_TOP * THERMO_DISPLAY_HEIGHT / exampleThermometerBar.artHeight,
								layeredBar('demo_progress_thermometer', exampleThermometerBar, randomValue, THERMO_DISPLAY_HEIGHT, 'bottom'),
							))}
							{/* Example C — plasma column. */}
							{verticalExample('C', cropBox(
								'demo_progress_plasma_column_box',
								examplePlasmaColumnBar.artWidth * PLASMA_DISPLAY_HEIGHT / examplePlasmaColumnBar.artHeight,
								VERTICAL_HEIGHT,
								PLASMA_FRAME_ART_TOP * PLASMA_DISPLAY_HEIGHT / examplePlasmaColumnBar.artHeight,
								layeredBar('demo_progress_plasma_column', examplePlasmaColumnBar, randomValue, PLASMA_DISPLAY_HEIGHT, 'bottom'),
							))}
							{/* Example D — gradient atlas, filling from the bottom. */}
							{verticalExample('D',
								<ProgressBarImage
									key            = "demo_progress_vertical_atlas"
									id             = "demo_progress_vertical_atlas"
									value          = {randomValue}
									fillFrom       = "bottom"
									width          = {28}
									height         = {VERTICAL_HEIGHT}
									atlas          = {atlasGradientColors}
									uvCell         = {atlasGradientColors.named.green}
									uvCropWithFill = {true}
									uvRotate       = {1}
									uvFlip         = {true}
								/>,
							)}
							{/* Example E — procedural fill, from the top. */}
							{verticalExample('E',
								<ProgressBar
									key       = "demo_progress_vertical_procedural"
									id        = "demo_progress_vertical_procedural"
									height    = {VERTICAL_HEIGHT}
									width     = {28}
									fillFrom  = "top"
									fillColor = {colorLerpCurrent(this.procColorVertical, now)}
									value     = {randomValue}
								/>,
							)}
						</Row>
					</Column>

					<Column
						key            = "demo_progress_col_right"
						cols           = {7}
						alignItems     = "stretch"
						justifyContent = "flex-start"
						spacing        = {8}
					>
						{/* MARK: Radial
						*/}
						<H3 key="demo_progress_h_radial" value="Radial" />
						<Row
							key            = "demo_progress_radial_row"
							alignItems     = "flex-start"
							justifyContent = "flex-start"
							spacing        = {8}
						>
							{/* Example A — thin ring (default atlas), countdown readout inside. */}
							{radialExample('A',
								<ProgressBarRadial
									key      = "demo_progress_radial_primary"
									progress = {countdownProgress}
									width    = {RADIAL_SIZE}
								>
									<Text
										value       = {String(countdownValue)}
										fontSize    = {theme.typography.size.h3}
										fontColor   = {theme.colors.light}
										textAlign   = "middle-center"
										textWrap    = "nowrap"
										uiTransform = {{ width: 'auto', alignSelf: 'center' }}
									/>
								</ProgressBarRadial>,
							)}

							{/* Example B — thin ring inset inside a thick border. */}
							{radialExample('B',
								<ProgressBarRadial
									key             = "demo_progress_radial_success"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									fillColor       = {theme.colors.success}
									backgroundColor = {theme.colors.dark}
									borderColor     = {theme.colors.secondary}
									borderWidth     = {8}
									inset           = {6}
								/>,
							)}

							{/* Example C — channel: outer border on the root, inner bordered
							    disc as a child; the gap between them equals the ring
							    thickness, so the ring fills a channel. Mirrored (anti-clockwise). */}
							{radialExample('C',
								<ProgressBarRadial
									key             = "demo_progress_radial_channel"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {radialChannelAtlas}
									fillColor       = {theme.colors.warning}
									backgroundColor = {theme.colors.dark}
									borderColor     = {theme.colors.secondary}
									borderWidth     = {RADIAL_CHANNEL_BORDER}
									mirror          = {true}
								>
									<UiEntity
										uiTransform = {{
											width       : RADIAL_CHANNEL_INNER,
											height      : RADIAL_CHANNEL_INNER,
											flexShrink  : 0,
											borderRadius: RADIAL_CHANNEL_INNER / 2,
											borderWidth : RADIAL_CHANNEL_INNER_BORDER,
											borderColor : alpha(theme.colors.secondary, 0.7),
										}}
									/>
								</ProgressBarRadial>,
							)}

							{/* Example D — thick ring (`atlasSpritesProgressRadialThick`), countdown readout. */}
							{radialExample('D',
								<ProgressBarRadial
									key             = "demo_progress_radial_thick"
									progress        = {countdownProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialThick}
									fillColor       = {theme.colors.info}
									backgroundColor = {theme.colors.dark}
								>
									<Text
										value       = {String(countdownValue)}
										fontSize    = {theme.typography.size.h4}
										fontColor   = {theme.colors.light}
										textAlign   = "middle-center"
										textWrap    = "nowrap"
										uiTransform = {{ width: 'auto', alignSelf: 'center' }}
									/>
								</ProgressBarRadial>,
							)}

							{/* Example E — solid pie (`atlasSpritesProgressRadialPie`) with a border. */}
							{radialExample('E',
								<ProgressBarRadial
									key             = "demo_progress_radial_pie"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialPie}
									fillColor       = {theme.colors.danger}
									backgroundColor = {theme.colors.dark}
									borderColor     = {theme.colors.light}
									borderWidth     = {2}
									inset           = {2}
								/>,
							)}

							{/* Example F — segmented ring (`atlasSpritesProgressRadialSegments`): 12 dashes light up in turn. */}
							{radialExample('F',
								<ProgressBarRadial
									key             = "demo_progress_radial_segments"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialSegments}
									fillColor       = {theme.colors.danger}
									backgroundColor = {theme.colors.dark}
								/>,
							)}
							{/* Example G — comet tail (`atlasSpritesProgressRadialComet`): alpha ramps up to a round head. */}
							{radialExample('G',
								<ProgressBarRadial
									key             = "demo_progress_radial_comet"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialComet}
									fillColor       = {theme.colors.info}
									backgroundColor = {theme.colors.dark}
								/>,
							)}

							{/* Example H — dotted ring (`atlasSpritesProgressRadialDots`): 24 dots grow in. */}
							{radialExample('H',
								<ProgressBarRadial
									key             = "demo_progress_radial_dots"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialDots}
									fillColor       = {theme.colors.success}
									backgroundColor = {theme.colors.dark}
								/>,
							)}
						</Row>
						<Row
							key            = "demo_progress_radial_row_2"
							alignItems     = "flex-start"
							justifyContent = "flex-start"
							spacing        = {8}
						>
							{/* Example I — rounded ring with a knob on the leading edge (`atlasSpritesProgressRadialKnob`). */}
							{radialExample('I',
								<ProgressBarRadial
									key             = "demo_progress_radial_knob"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialKnob}
									fillColor       = {theme.colors.warning}
									backgroundColor = {theme.colors.dark}
								/>,
							)}

							{/* Example J — stopwatch face (`atlasSpritesProgressRadialStopwatch`): pie + hand, crown on top; tinted green → yellow → red as time runs out. */}
							{radialExample('J',
								<ProgressBarRadial
									key             = "demo_progress_radial_stopwatch"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialStopwatch}
									fillColor       = {timeRemainingColor(radialProgress)}
									backgroundColor = {theme.colors.dark}
								/>,
							)}

							{/* Example K — sunburst spokes (`atlasSpritesProgressRadialSunburst`), countdown readout in the clear centre. */}
							{radialExample('K',
								<ProgressBarRadial
									key             = "demo_progress_radial_sunburst"
									progress        = {countdownProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressRadialSunburst}
									fillColor       = {theme.colors.primary}
									backgroundColor = {theme.colors.dark}
								>
									<Text
										value       = {String(countdownValue)}
										fontSize    = {theme.typography.size.h4}
										fontColor   = {theme.colors.light}
										textAlign   = "middle-center"
										textWrap    = "nowrap"
										uiTransform = {{ width: 'auto', alignSelf: 'center' }}
									/>
								</ProgressBarRadial>,
							)}

							{/* Example L — rounded square (`atlasSpritesProgressSquare`): 8px corners
							    per 64px cell; chip uses a matching `borderRadius`. */}
							{radialExample('L',
								<ProgressBarRadial
									key             = "demo_progress_radial_square"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressSquare}
									fillColor       = {theme.colors.secondary}
									backgroundColor = {theme.colors.dark}
									borderRadius    = {SQUARE_CHIP_RADIUS}
								/>,
							)}

							{/* Example M — segmented square (`atlasSpritesProgressSquareSegments`), square take on F: straight dashes + a square block in each corner. */}
							{radialExample('M',
								<ProgressBarRadial
									key             = "demo_progress_radial_square_segments"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressSquareSegments}
									fillColor       = {theme.colors.danger}
									backgroundColor = {theme.colors.dark}
									borderRadius    = {SQUARE_CHIP_RADIUS}
								/>,
							)}

							{/* Example N — comet square (`atlasSpritesProgressSquareComet`), square take on G. */}
							{radialExample('N',
								<ProgressBarRadial
									key             = "demo_progress_radial_square_comet"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressSquareComet}
									fillColor       = {theme.colors.info}
									backgroundColor = {theme.colors.dark}
									borderRadius    = {SQUARE_CHIP_RADIUS}
								/>,
							)}

							{/* Example O — dotted square (`atlasSpritesProgressSquareDots`), square take on H. */}
							{radialExample('O',
								<ProgressBarRadial
									key             = "demo_progress_radial_square_dots"
									progress        = {radialProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressSquareDots}
									fillColor       = {theme.colors.success}
									backgroundColor = {theme.colors.dark}
									borderRadius    = {SQUARE_CHIP_RADIUS}
								/>,
							)}

							{/* Example P — square sunburst (`atlasSpritesProgressSquareSunburst`), square take on K,
							    countdown readout in the clear centre. */}
							{radialExample('P',
								<ProgressBarRadial
									key             = "demo_progress_radial_square_sunburst"
									progress        = {countdownProgress}
									width           = {RADIAL_SIZE}
									atlas           = {atlasSpritesProgressSquareSunburst}
									fillColor       = {theme.colors.primary}
									backgroundColor = {theme.colors.dark}
									borderRadius    = {SQUARE_CHIP_RADIUS}
								>
									<Text
										value       = {String(countdownValue)}
										fontSize    = {theme.typography.size.h4}
										fontColor   = {theme.colors.light}
										textAlign   = "middle-center"
										textWrap    = "nowrap"
										uiTransform = {{ width: 'auto', alignSelf: 'center' }}
									/>
								</ProgressBarRadial>,
							)}
						</Row>

						{/* MARK: Horizontal
						*/}
						<H3 key="demo_progress_h_horizontal" value="Horizontal" />
						{/* Example A — procedural fill. */}
						{horizontalExample('A',
							<ProgressBar
								key       = "demo_progress_procedural"
								id        = "demo_progress_procedural"
								value     = {randomValue}
								fillColor = {colorLerpCurrent(this.procColorHorizontal, now)}
								height    = {BAR_HEIGHT}
							>
								{barCaption('procedural')}
							</ProgressBar>,
						)}
						{/* Example B — gradient atlas, filling from the right. */}
						{horizontalExample('B',
							<ProgressBarImage
								key            = "demo_progress_gradient_reversed"
								id             = "demo_progress_gradient_reversed"
								value          = {randomValue}
								height         = {BAR_HEIGHT}
								fillFrom       = "right"
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.yellowOrange}
								uvCropWithFill = {true}
								uvMirror       = {true}
							>
								{barCaption('gradient + reversed')}
							</ProgressBarImage>,
						)}

						{/* MARK: Layered textures
						*/}
						{/* Example C — neon slant. */}
						{horizontalExample('C', stretchLayeredBar('demo_progress_neon_slant', exampleNeonSlantBar, randomValue, LAYERED_BAR_HEIGHT, 'texture: "neon slant"'))}
						{/* Example D — ember capsule. */}
						{horizontalExample('D', stretchLayeredBar('demo_progress_ember_capsule', exampleEmberCapsuleBar, randomValue, LAYERED_BAR_HEIGHT, 'texture: "ember capsule"'))}
						{/* Example E — tactical chamfer. */}
						{horizontalExample('E', stretchLayeredBar('demo_progress_tactical_chamfer', exampleTacticalChamferBar, randomValue, LAYERED_BAR_HEIGHT, 'texture: "tactical chamfer"'))}
					</Column>
				</Row>
			</Column>,
		]
	}
}

export const demoProgressLayer = new DemoProgressLayer()
