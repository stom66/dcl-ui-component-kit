import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { Background, Column, Divider, H2, Label, ProgressBar, ProgressBarImage, Row, Text } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { timers } from '../../utils/timers'


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
/** Demo panel for color and image progress bars at varied values and styles. */
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
			dangerValue: 90,
		})

		timers.setInterval(() => {
			if (!this.props) {
				console.error('DemoProgressLayer: tick: props controller missing')
				return
			}
			this.props.set('dangerValue', randomInRange(DANGER_MIN_VALUE, DANGER_MAX_VALUE))
		}, DANGER_INTERVAL_MS)
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoProgressLayer.body: props controller missing')
			return null
		}

		const theme       = getTheme()
		const dangerValue = this.props.get('dangerValue') as number
		const dangerLabel = `Random value: ${dangerValue}%`

		return (
			<Background>
				<Column>
					<H2 value="Progress bars" />
					<Text value="Color bars with different values, fills, and directions." />
					<Row>
						<Column cols={3}>
							<Row>
								<ProgressBar
									id       = "demo_progress_primary_25"
									value    = {25}
									height   = {400}
									width    = {32}
									fillFrom = "top"
								/>

								<ProgressBar
									id        = "demo_progress_primary_50"
									value     = {50}
									height    = {400}
									width     = {32}
									fillFrom  = "bottom"
									fillColor = {theme.colors.info}
								/>

								<ProgressBarImage
									id       = "demo_progress_image_vertical"
									value    = {55}
									fillFrom = "bottom"
									width    = {32}
									height   = {400}
								/>
							</Row>
						</Column>

						<Column cols={9}
							uiTransform={{
								alignItems    : 'stretch',
								justifyContent: 'flex-start',
								padding       : { top: 16, right: 20, bottom: 16, left: 20 },
							}}
						>

							<ProgressBar
								id     = "demo_progress_primary_25h"
								value  = {25}
								height = {20}
							/>

							<ProgressBar
								id        = "demo_progress_success_60"
								value     = {60}
								fillColor = {theme.colors.success}
								height    = {20}
							/>

							<ProgressBar
								id        = "demo_progress_danger_live"
								value     = {dangerValue}
								minValue  = {DANGER_MIN_VALUE}
								maxValue  = {DANGER_MAX_VALUE}
								fillColor = {theme.colors.danger}
								height    = {32}
							>
								<Label
									value           = {dangerLabel}
									backgroundColor = {Color4.create(0, 0, 0, 0)}
									uiTransform={{
										width  : '100%',
										height : '100%',
										padding: 0,
									}}
									uiText={{
										fontSize : scaleFontSize(theme.typography.size.default),
										textAlign: 'middle-center',
									}}
								/>
							</ProgressBar>

							<ProgressBar
								id        = "demo_progress_from_right"
								value     = {40}
								fillFrom  = "right"
								fillColor = {theme.colors.info}
								height    = {20}
							/>
							<ProgressBar
								id        = "demo_progress_custom_range"
								value     = {3}
								minValue  = {0}
								maxValue  = {10}
								fillColor = {theme.colors.warning}
								height    = {20}
							/>

							<Divider uiTransform={{ margin: { top: 16, bottom: 8 } }} />

							<H2 value="Image based progress bars" />

							<Column>
								<ProgressBarImage
									id     = "demo_progress_image_70"
									value  = {70}
									height = {28}
								/>
							</Column>

							<Column>
								<ProgressBarImage
									id       = "demo_progress_image_horizontal_right"
									value    = {55}
									fillFrom = "right"
									width    = "100%"
									height   = {80}
								/>
							</Column>
						</Column>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoProgressLayer = new DemoProgressLayer()
