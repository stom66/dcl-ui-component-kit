import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { atlasGradientColors, Background, Column, type FillFrom, getTheme, H2, H3, Layer, ProgressBar, ProgressBarImage, ProgressBarRadial, PropsController, Row, Text, TextureAtlas, ZoneType } from '../../../ui-component-kit'
import { progressBarContentTransform, syncDisplayValue, valueToPercent } from '../../../ui-component-kit/components/progressBar/progressBar.shared'
import { timers } from '../../../ui-component-kit/utils/timers'

import { exampleEmberCapsuleBar, exampleFuelFillAtlas, exampleFuelGaugeTextures, type ExampleLayeredBarArt, exampleNeonSlantBar, exampleTacticalChamferBar, exampleThermometerBar } from '../atlases'

const DANGER_MIN_VALUE   = 0
const DANGER_MAX_VALUE   = 100
const DANGER_INTERVAL_MS = 3000
const RADIAL_LOOP_MS     = 4000
const RADIAL_SIZE        = 56
const COUNTDOWN_SECONDS  = 10
const COUNTDOWN_MS       = COUNTDOWN_SECONDS * 1000
const BAR_HEIGHT         = 40
const TRANSPARENT        = Color4.create(0, 0, 0, 0)

/**
 * Sky Chaser fuel frame. `fuel-fg` is 2× the bg/fill height and the origins
 * are centered, so the tube is inset equally from the top and bottom.
 */
const FUEL_ART_WIDTH        = 256
const FUEL_ART_HEIGHT       = 1024
const FUEL_INNER_ART_HEIGHT = 512
const FUEL_DISPLAY_HEIGHT   = 448
const FUEL_DISPLAY_SCALE    = FUEL_DISPLAY_HEIGHT / FUEL_ART_HEIGHT
const FUEL_DISPLAY_WIDTH    = FUEL_ART_WIDTH * FUEL_DISPLAY_SCALE
const FUEL_INSET_Y          = (FUEL_DISPLAY_HEIGHT - FUEL_INNER_ART_HEIGHT * FUEL_DISPLAY_SCALE) / 2
/** Visible (non-transparent) rows of `progressBar-fuel-fg.png`, in art pixels. */
const FUEL_VISIBLE_ART_TOP    = 35
const FUEL_VISIBLE_ART_BOTTOM = 908

/**
 * Every vertical bar is as tall as the *visible* fuel gauge (its PNG has
 * transparent padding), so the whole row lines up top and bottom.
 */
const VERTICAL_HEIGHT = (FUEL_VISIBLE_ART_BOTTOM - FUEL_VISIBLE_ART_TOP) * FUEL_DISPLAY_SCALE

/** Thermometer plaque spans art y 12–1012; size it so the plaque matches `VERTICAL_HEIGHT`. */
const THERMO_PLAQUE_ART_TOP    = 12
const THERMO_PLAQUE_ART_BOTTOM = 1012
const THERMO_DISPLAY_HEIGHT    = VERTICAL_HEIGHT * exampleThermometerBar.artHeight / (THERMO_PLAQUE_ART_BOTTOM - THERMO_PLAQUE_ART_TOP)

/** Layered horizontal bars (1024×128 art): height sets the cap scale; width fills the column. */
const LAYERED_BAR_HEIGHT = 48

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
/** Demo panel for procedural, image, radial, fuel, and layered-texture progress bars. */
export class DemoProgressLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-progress',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '50vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			randomValue1: 90,
			randomValue2: 55,
			randomValue3: 25,
		})

		timers.setInterval(() => {
			if (!this.props) {
				console.error('DemoProgressLayer: tick: props controller missing')
				return
			}
			this.props.set('randomValue1', randomInRange(DANGER_MIN_VALUE, DANGER_MAX_VALUE))
		}, DANGER_INTERVAL_MS)

		timers.setTimeout(() => {
			timers.setInterval(() => {
				if (!this.props) {
					console.error('DemoProgressLayer: tick: props controller missing')
					return
				}
				this.props.set('randomValue2', randomInRange(DANGER_MIN_VALUE, DANGER_MAX_VALUE))
			}, DANGER_INTERVAL_MS)
		}, DANGER_INTERVAL_MS / 3)

		timers.setTimeout(() => {
			timers.setInterval(() => {
				if (!this.props) {
					console.error('DemoProgressLayer: tick: props controller missing')
					return
				}
				this.props.set('randomValue3', randomInRange(DANGER_MIN_VALUE, DANGER_MAX_VALUE))
			}, DANGER_INTERVAL_MS)
		}, DANGER_INTERVAL_MS / 3 * 2)
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoProgressLayer.body: props controller missing')
			return null
		}

		const theme              = getTheme()
		const randomValue1       = this.props.get('randomValue1') as number
		const randomValue2       = this.props.get('randomValue2') as number
		const randomValue3       = this.props.get('randomValue3') as number
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
							<ProgressBar
								key      = "demo_progress_vertical_procedural"
								id       = "demo_progress_vertical_procedural"
								height   = {VERTICAL_HEIGHT}
								width    = {28}
								fillFrom = "top"
								value    = {randomValue1}
							/>
							<ProgressBarImage
								key            = "demo_progress_vertical_atlas"
								id             = "demo_progress_vertical_atlas"
								value          = {randomValue2}
								fillFrom       = "top"
								width          = {28}
								height         = {VERTICAL_HEIGHT}
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.green}
								uvCropWithFill = {true}
								uvRotate       = {1}
								uvFlip         = {true}
							/>
							{cropBox(
								'demo_progress_fuel_box',
								FUEL_DISPLAY_WIDTH,
								VERTICAL_HEIGHT,
								FUEL_VISIBLE_ART_TOP * FUEL_DISPLAY_SCALE,
								<ProgressBarImage
									key            = "demo_progress_fuel"
									id             = "demo_progress_fuel"
									value          = {randomValue1}
									minValue       = {0}
									maxValue       = {100}
									fillFrom       = "bottom"
									orientation    = "vertical"
									width          = {FUEL_DISPLAY_WIDTH}
									height         = {FUEL_DISPLAY_HEIGHT}
									contentInset   = {{
										top   : FUEL_INSET_Y,
										right : 0,
										bottom: FUEL_INSET_Y,
										left  : 0,
									}}
									borderWidth    = {0}
									borderRadius   = {0}
									textureSlices  = {NO_TEXTURE_SLICES}
									atlas          = {exampleFuelFillAtlas}
									uvCell         = {{ xStart: 1, yStart: 1 }}
									uvCropWithFill = {true}
									textures       = {exampleFuelGaugeTextures}
								/>,
							)}
							{cropBox(
								'demo_progress_thermometer_box',
								exampleThermometerBar.artWidth * THERMO_DISPLAY_HEIGHT / exampleThermometerBar.artHeight,
								VERTICAL_HEIGHT,
								THERMO_PLAQUE_ART_TOP * THERMO_DISPLAY_HEIGHT / exampleThermometerBar.artHeight,
								layeredBar('demo_progress_thermometer', exampleThermometerBar, randomValue2, THERMO_DISPLAY_HEIGHT, 'bottom'),
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
							alignItems     = "center"
							justifyContent = "flex-start"
						>
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
							</ProgressBarRadial>
							<ProgressBarRadial
								key             = "demo_progress_radial_success"
								progress        = {radialProgress}
								width           = {RADIAL_SIZE}
								fillColor       = {theme.colors.success}
								backgroundColor = {theme.colors.dark}
								borderColor     = {theme.colors.secondary}
								borderWidth     = {8}
								inset           = {6}
							/>
							<ProgressBarRadial
								key             = "demo_progress_radial_danger"
								progress        = {radialProgress}
								width           = {RADIAL_SIZE}
								fillColor       = {theme.colors.danger}
								backgroundColor = {theme.colors.dark}
								borderColor     = {theme.colors.light}
								borderWidth     = {2}
								inset           = {-4}
								mirror          = {true}
							/>
							<ProgressBarRadial
								key             = "demo_progress_radial_warning"
								progress        = {radialProgress}
								width           = {RADIAL_SIZE}
								fillColor       = {theme.colors.warning}
								backgroundColor = {theme.colors.dark}
								borderColor     = {theme.colors.secondary}
								borderWidth     = {2}
								inset           = {-4}
								mirror          = {true}
							/>
						</Row>

						{/* MARK: Horizontal
						*/}
						<H3 key="demo_progress_h_horizontal" value="Horizontal" />
						<ProgressBar
							key       = "demo_progress_procedural"
							id        = "demo_progress_procedural"
							value     = {randomValue1}
							fillColor = {theme.colors.warning}
							height    = {BAR_HEIGHT}
						>
							{barCaption('procedural')}
						</ProgressBar>
						<ProgressBarImage
							key            = "demo_progress_gradient_reversed"
							id             = "demo_progress_gradient_reversed"
							value          = {randomValue3}
							height         = {BAR_HEIGHT}
							fillFrom       = "right"
							atlas          = {atlasGradientColors}
							uvCell         = {atlasGradientColors.named.yellowOrange}
							uvCropWithFill = {true}
							uvMirror       = {true}
						>
							{barCaption('gradient + reversed')}
						</ProgressBarImage>

						{/* MARK: Layered textures
						*/}
						<H3 key="demo_progress_h_layered" value="Layered textures" />
						{stretchLayeredBar('demo_progress_neon_slant', exampleNeonSlantBar, randomValue2, LAYERED_BAR_HEIGHT, 'neon slant')}
						{stretchLayeredBar('demo_progress_ember_capsule', exampleEmberCapsuleBar, randomValue3, LAYERED_BAR_HEIGHT, 'ember capsule')}
						{stretchLayeredBar('demo_progress_tactical_chamfer', exampleTacticalChamferBar, randomValue1, LAYERED_BAR_HEIGHT, 'tactical chamfer')}
					</Column>
				</Row>
			</Column>,
		]
	}
}

export const demoProgressLayer = new DemoProgressLayer()
