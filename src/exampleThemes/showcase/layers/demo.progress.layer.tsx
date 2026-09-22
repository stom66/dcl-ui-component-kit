import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'
import { atlasGradientColors, Background, Column, getTheme, H2, H3, IconNumber, Label, Layer, ProgressBar, ProgressBarImage, ProgressBarRadial, PropsController, Row, ZoneType } from '../../../ui-component-kit'
import { timers } from '../../../ui-component-kit/utils/timers'

const DANGER_MIN_VALUE = 0
const DANGER_MAX_VALUE = 100
const DANGER_INTERVAL_MS = 3000
const RADIAL_LOOP_MS = 4000
const RADIAL_SIZE = 56
const VERTICAL_HEIGHT = 260


// MARK: randomInRange
/** Inclusive integer in `[min, max]`. */
function randomInRange(
	min: number,
	max: number,
): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}


// MARK: DemoProgressLayer
/** Demo panel for procedural, image, hybrid, atlas, and radial progress bars. */
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

		const theme          = getTheme()
		const randomValue1   = this.props.get('randomValue1') as number
		const dangerLabel    = `Random value: ${randomValue1}%`
		const randomValue2   = this.props.get('randomValue2') as number
		const randomValue3   = this.props.get('randomValue3') as number
		const radialProgress = (Date.now() % RADIAL_LOOP_MS) / RADIAL_LOOP_MS

		return [
			<Background key="demo_progress_chrome" />,
			<Column
				key            = "demo_progress_body"
				cols           = {12}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 12, right: 16, bottom: 12, left: 16 }}
			>
					<H2 key="demo_progress_title" value="Progress Bars" />

					<Row key="demo_progress_main" alignItems="flex-start">
						{/* MARK: Radial sprite
						*/}
						<Column
							key            = "demo_progress_col_radial"
							cols           = {2}
							alignItems     = "center"
							padding        = {{ right: 8 }}
						>
							<H3
								key       = "demo_progress_h_radial"
								value     = "Radial"
								textAlign = "middle-center"
							/>
							<ProgressBarRadial
								key      = "demo_progress_radial_primary"
								progress = {radialProgress}
								width    = {RADIAL_SIZE}
							/>
							<ProgressBarRadial
								key             = "demo_progress_radial_success"
								progress        = {radialProgress}
								width           = {RADIAL_SIZE}
								fillColor       = {theme.colors.success}
								backgroundColor = {theme.colors.dark}
							/>
							<ProgressBarRadial
								key             = "demo_progress_radial_danger"
								progress        = {radialProgress}
								width           = {RADIAL_SIZE}
								fillColor       = {theme.colors.danger}
								backgroundColor = {theme.colors.light}
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
								mirror          = {true}
							/>
						</Column>

						{/* MARK: Vertical
						*/}
						<Column
							key     = "demo_progress_col_vertical"
							cols    = {3}
							padding = {{ right: 12 }}
						>
							<H3 key="demo_progress_h_vertical" value="Vertical" />
							<Row
								key            = "demo_progress_vertical_row"
								alignItems     = "flex-end"
								justifyContent = "flex-start"
							>
								<ProgressBar
									key      = "demo_progress_vertical_procedural"
									id       = "demo_progress_vertical_procedural"
									height   = {VERTICAL_HEIGHT}
									width    = {32}
									fillFrom = "top"
									value    = {randomValue1}
								/>
								<ProgressBarImage
									key      = "demo_progress_vertical_image"
									id       = "demo_progress_vertical_image"
									value    = {randomValue3}
									fillFrom = "bottom"
									width    = {64}
									height   = {VERTICAL_HEIGHT}
								/>
								<ProgressBarImage
									key            = "demo_progress_vertical_atlas"
									id             = "demo_progress_vertical_atlas"
									value          = {randomValue2}
									fillFrom       = "top"
									width          = {32}
									height         = {VERTICAL_HEIGHT}
									atlas          = {atlasGradientColors}
									uvCell         = {atlasGradientColors.named.green}
									uvCropWithFill = {true}
									uvRotate       = {1}
									uvFlip         = {true}
								/>
							</Row>
						</Column>

						<Column
							key            = "demo_progress_col_horizontal"
							cols           = {7}
							alignItems     = "stretch"
							justifyContent = "flex-start"
						>
							{/* MARK: Procedural
							*/}
							<H3 key="demo_progress_h_procedural" value="Procedural" />
							<ProgressBar
								key       = "demo_progress_procedural_range"
								id        = "demo_progress_procedural_range"
								value     = {Math.round(randomValue1 / 10)}
								minValue  = {0}
								maxValue  = {10}
								fillColor = {theme.colors.warning}
								height    = {28}
							>
								<IconNumber value={`${Math.round(randomValue1 / 10)}/10`} height={22} />
							</ProgressBar>
							<ProgressBar
								key      = "demo_progress_procedural_right"
								id       = "demo_progress_procedural_right"
								value    = {randomValue2}
								height   = {18}
								fillFrom = "right"
							/>
							<ProgressBar
								key       = "demo_progress_procedural_danger"
								id        = "demo_progress_procedural_danger"
								value     = {randomValue1}
								minValue  = {DANGER_MIN_VALUE}
								maxValue  = {DANGER_MAX_VALUE}
								fillColor = {theme.colors.danger}
								height    = {28}
							>
								<Label
									cols            = {12}
									value           = {dangerLabel}
									backgroundColor = {Color4.create(0, 0, 0, 0)}
									height          = "100%"
									padding         = {0}
									fontSize        = {theme.typography.size.default}
									textAlign       = "middle-center"
								/>
							</ProgressBar>

							{/* MARK: Image
							*/}
							<H3
								key    = "demo_progress_h_image"
								value  = "Image"
								margin = {{ top: 4 }}
							/>
							<ProgressBarImage
								key    = "demo_progress_image_full"
								id     = "demo_progress_image_full"
								value  = {randomValue2}
								height = {48}
								textures = {{
									background: 'assets/images/ui-component-kit/progressBar-horizontal-background.png',
									fill      : 'assets/images/ui-component-kit/progressBar-horizontal-fill.png',
									border    : 'assets/images/ui-component-kit/progressBar-horizontal-border.png',
								}}
							>
								<IconNumber value={randomValue2} height={24} />
							</ProgressBarImage>

							{/* MARK: Hybrid
							*/}
							<H3
								key    = "demo_progress_h_hybrid"
								value  = "Hybrid"
								margin = {{ top: 4 }}
							/>
							<ProgressBarImage
								key         = "demo_progress_hybrid_border"
								id          = "demo_progress_hybrid_border"
								value       = {randomValue3}
								fillFrom    = "right"
								height      = {56}
								borderColor = {theme.colors.primary}
								textures    = {{
									border: 'assets/images/ui-component-kit/progressBar-horizontal-border-2.png',
								}}
								contentInset = {{ top: 8, right: 12, bottom: 8, left: 12 }}
								textureSlices = {{
									top   : 40 / 128,
									right : 40 / 512,
									bottom: 40 / 128,
									left  : 40 / 512,
								}}
							>
								<IconNumber value={randomValue3} />
							</ProgressBarImage>
							<ProgressBarImage
								key    = "demo_progress_hybrid_fill"
								id     = "demo_progress_hybrid_fill"
								value  = {randomValue1}
								height = {40}
								textures = {{
									fill: 'assets/images/ui-component-kit/progressBar-horizontal-fill.png',
								}}
							/>

							{/* MARK: Atlas reveal
							*/}
							<H3
								key    = "demo_progress_h_atlas"
								value  = "Atlas reveal"
								margin = {{ top: 4 }}
							/>
							<ProgressBarImage
								key            = "demo_progress_atlas_yellow"
								id             = "demo_progress_atlas_yellow"
								value          = {randomValue2}
								height         = {24}
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.yellowOrange}
								uvCropWithFill = {true}
							/>
							<ProgressBarImage
								key            = "demo_progress_atlas_blue"
								id             = "demo_progress_atlas_blue"
								value          = {randomValue3}
								fillFrom       = "right"
								height         = {24}
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.blue}
								uvCropWithFill = {true}
							/>
						</Column>
					</Row>
			</Column>,
		]
	}
}

export const demoProgressLayer = new DemoProgressLayer()
