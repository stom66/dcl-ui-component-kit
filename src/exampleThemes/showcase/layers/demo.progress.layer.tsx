import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'
import { alpha, atlasGradientColors, Background, Column, Divider, getTheme, H2, IconNumber, Label, Layer, ProgressBar, ProgressBarImage, PropsController, Row, ZoneType } from '../../../ui-component-kit'
import { timers } from '../../../ui-component-kit/utils/timers'

const DANGER_MIN_VALUE = 0
const DANGER_MAX_VALUE = 100
const DANGER_INTERVAL_MS = 3000


// MARK: randomInRange
/** Inclusive integer in `[min, max]`. */
function randomInRange(
	min: number,
	max: number,
): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}


// MARK: DemoProgressLayer
/** Demo panel for procedural and image/hybrid progress bars. */
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
				height: '60vh',
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

		const theme        = getTheme()
		const randomValue1 = this.props.get('randomValue1') as number
		const dangerLabel1 = `Random value: ${randomValue1}%`
		const randomValue2 = this.props.get('randomValue2') as number
		const dangerLabel2 = `Random value: ${randomValue2}%`
		const randomValue3 = this.props.get('randomValue3') as number
		const dangerLabel3 = `Random value: ${randomValue3}%`

		return (
			<Background>
				{/* cols={12} = 100% width — nested cols={3}/{9} need a definite parent width */}
				<Column cols={12} uiTransform={{ height: '100%', alignItems: 'stretch' }}>
					<H2 value="Progress Bars" />
					<Row cols={12} uiTransform={{ alignItems: 'flex-start' }}>
						<Column cols={3}
							uiTransform={{
								padding       : { top: 16, right: 20, bottom: 16, left: 20 },
							}}
						>

						{/* MARK: Vertical
						*/}
							<Row>
								<ProgressBar
									key      = "demo_progress_primary_25"
									id       = "demo_progress_primary_25"
									height   = {400}
									width    = {32}
									fillFrom = "top"
									value    = {randomValue1}
								/>

								<ProgressBar
									key       = "demo_progress_primary_50"
									id        = "demo_progress_primary_50"
									height    = {400}
									width     = {32}
									fillFrom  = "bottom"
									fillColor = {theme.colors.info}
									value     = {randomValue2}
								/>

								<ProgressBarImage
									key      = "demo_progress_image_vertical"
									id       = "demo_progress_image_vertical"
									value     = {randomValue3}
									fillFrom = "bottom"
									width    = {64}
									height   = {400}
								/>

								<ProgressBarImage
									key            = "demo_progress_atlas_green"
									id             = "demo_progress_atlas_green"
									value          = {randomValue1}
									fillFrom       = "top"
									width          = {32}
									height         = {400}
									atlas          = {atlasGradientColors}
									uvCell         = {atlasGradientColors.named.green}
									uvCropWithFill = {true}
									uvFlip         = {true}
								/>
							</Row>
						</Column>

						{/* MARK: Horizontal
						*/}
						<Column cols={9}
							uiTransform={{
								alignItems    : 'stretch',
								justifyContent: 'flex-start',
								padding       : { top: 16, right: 20, bottom: 16, left: 20 },
							}}
						>
							<ProgressBar
								key       = "demo_progress_custom_range"
								id        = "demo_progress_custom_range"
								value     = {Math.round(randomValue1/10)}
								minValue  = {0}
								maxValue  = {10}
								fillColor = {theme.colors.warning}
								height    = {28}
							>
								<IconNumber value={`${Math.round(randomValue1/10)}/10`} height={24} />
							</ProgressBar>

							<ProgressBar
								key      = "demo_progress_primary_25h"
								id       = "demo_progress_primary_25h"
								value     = {randomValue2}
								height   = {20}
								fillFrom = "right"
							/>

							<ProgressBar
								key       = "demo_progress_success_60"
								id        = "demo_progress_success_60"
								value     = {randomValue3}
								fillColor = {theme.colors.success}
								height    = {20}
							/>

							<ProgressBar
								key       = "demo_progress_danger_live"
								id        = "demo_progress_danger_live"
								value     = {randomValue1}
								minValue  = {DANGER_MIN_VALUE}
								maxValue  = {DANGER_MAX_VALUE}
								fillColor = {theme.colors.danger}
								height    = {32}
							>
								<Label
									cols            = {12}
									value           = {dangerLabel1}
									backgroundColor = {Color4.create(0, 0, 0, 0)}
									uiTransform={{
										height : '100%',
										padding: 0,
									}}
									uiText={{
										fontSize : scaleFontSize(theme.typography.size.default),
										textAlign: 'middle-center',
									}}
								/>
							</ProgressBar>


							<ProgressBarImage
								key      = "demo_progress_image_70"
								id       = "demo_progress_image_70"
								value    = {randomValue2}
								height   = {64}
								textures = {{
									background: 'assets/images/ui-component-kit/progressBar-horizontal-background.png',
									fill      : 'assets/images/ui-component-kit/progressBar-horizontal-fill.png',
									border    : 'assets/images/ui-component-kit/progressBar-horizontal-border.png',
								}}
							>
							{/* 	<Label
									cols        = {2}
									//color       = {alpha(theme.colors.body, 0.5)}
									uiTransform = {{
										height        : '50%',
										width         : '20%',
										justifyContent: 'center',
										alignItems    : 'center',
										alignSelf     : 'center',
										padding       : 0,
									}}
								> */}
									<IconNumber value={randomValue2} height={32} />
								{/* </Label> */}
							</ProgressBarImage>

							{/* MARK: Img border-2, orange */}
							<ProgressBarImage
								key         = "demo_progress_image_horizontal_right"
								id          = "demo_progress_image_horizontal_right"
								value       = {randomValue3}
								fillFrom    = "right"
								height      = {80}
								borderColor = {theme.colors.primary}
								textures    = {{
									//background: 'assets/images/ui-component-kit/progressBar-horizontal-background.png',
									//fill      : 'assets/images/ui-component-kit/progressBar-horizontal-fill.png',
									border    : 'assets/images/ui-component-kit/progressBar-horizontal-border-2.png',
								}}
								contentInset = {16}
								textureSlices = {{
									// 40px corners on a 512×128 sheet (was 32px → 0.0625 / 0.25)
									top   : 40 / 128, // 0.3125
									bottom: 40 / 128,
									left  : 40 / 512, // 0.078125
									right : 40 / 512,
								}}
							>
								<IconNumber value={randomValue3} />
							</ProgressBarImage>

							<ProgressBarImage
								key      = "demo_progress_image_fill_procedural_border"
								id       = "demo_progress_image_fill_procedural_border"
								value    = {randomValue1}
								height   = {64}
								textures = {{
									fill: 'assets/images/ui-component-kit/progressBar-horizontal-fill.png',
								}}
							/>

							<ProgressBarImage
								key            = "demo_progress_atlas_yellow"
								id             = "demo_progress_atlas_yellow"
								value          = {randomValue2}
								height         = {32}
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.yellowOrange}
								uvCropWithFill = {true}
							/>

							<ProgressBarImage
								key            = "demo_progress_atlas_blue_right"
								id             = "demo_progress_atlas_blue_right"
								value          = {randomValue3}
								fillFrom       = "right"
								height         = {32}
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.blue}
								uvCropWithFill = {true}
								uvMirror       = {false}
							/>

							<ProgressBarImage
								key            = "demo_progress_atlas_green_horizontal"
								id             = "demo_progress_atlas_green_horizontal"
								value          = {randomValue1}
								fillFrom       = "left"
								height         = {32}
								atlas          = {atlasGradientColors}
								uvCell         = {atlasGradientColors.named.green}
								uvCropWithFill = {true}
							/>

						</Column>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoProgressLayer = new DemoProgressLayer()
