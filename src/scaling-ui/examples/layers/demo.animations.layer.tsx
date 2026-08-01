import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasIcons } from '../../atlases'
import { Background, Column, Icon, Row, UiBox } from '../../components'
import { Bounce } from '../../components/animations/bounce'
import { FlashColor } from '../../components/animations/flashColor'
import { Pulse } from '../../components/animations/pulse'
import { Shake } from '../../components/animations/shake'
import { Wiggle } from '../../components/animations/wiggle'
import { Layer } from '../../components/layers'
import { SpinnerBeamsEven, SpinnerBeamsVaried, SpinnerCircle, SpinnerDots, SpinnerHourglass, SpinnerThreeQuarterCircle } from '../../components/spinners'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { vwToPixels } from '../../utils'
import { easingFunctions } from '../../utils/tweens'


const CELL = {
	height: '128',
	width : '128',
	margin: { left: '8', right: '8', top: '8', bottom: '8' },
} as const

const ICON_SRC = atlasIcons.source
const ICON_UVS = atlasIcons.cell({ xStart: 1, yStart: 1 })


// MARK: DemoAnimationsLayer
/** Demo panel for motion wrappers and spinners (four cells per row). */
export class DemoAnimationsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-animations',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : vwToPixels(45),
				height: '50vh',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background>
				<Column
					uiTransform={{
						width         : '100%',
						height        : '100%',
						alignItems    : 'center',
						justifyContent: 'center',
						padding       : { top: 16, right: 16, bottom: 16, left: 16 },
					}}
				>
					{/* Row 1 */}
					<Row>
						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.primary}>
								<Pulse>
									<Icon
										iconSrc = {ICON_SRC}
										uvs     = {ICON_UVS}
										width   = {64}
										height  = {64}
									/>
								</Pulse>
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.primary}>
								<SpinnerBeamsEven
									speed          = {360}
									interval       = {1.5}
									easingFunction = {easingFunctions.easeBack}
									uiTransform    = {{
										positionType: 'absolute',
										position    : { top: 0, left: 0 },
										height      : '100%',
										width       : '100%',
									}}
								/>
								<Pulse
									easingFunction = {easingFunctions.easeSine}
									burstInterval  = {0}
								>
									<Icon
										iconSrc = {ICON_SRC}
										uvs     = {ICON_UVS}
										width   = {64}
										height  = {64}
									/>
								</Pulse>
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.info}>
								<Bounce>
									<Icon
										iconSrc = {ICON_SRC}
										uvs     = {ICON_UVS}
										width   = {64}
										height  = {64}
									/>
								</Bounce>
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.danger}>
								<Shake>
									<Icon
										iconSrc = {ICON_SRC}
										uvs     = {ICON_UVS}
										width   = {64}
										height  = {64}
									/>
								</Shake>
							</Background>
						</UiBox>
					</Row>

					{/* Row 2 */}
					<Row uiTransform={{ width: '100%', justifyContent: 'center' }}>
						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.info}>
								<FlashColor>
									<Icon
										iconSrc = {ICON_SRC}
										uvs     = {ICON_UVS}
										width   = {64}
										height  = {64}
									/>
								</FlashColor>
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.warning}>
								<Wiggle>
									<Icon
										iconSrc = {ICON_SRC}
										uvs     = {ICON_UVS}
										width   = {64}
										height  = {64}
									/>
								</Wiggle>
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.primary}>
								<SpinnerBeamsVaried
									speed       = {25}
									uiTransform = {{
										positionType: 'absolute',
										position    : { top: 0, left: 0 },
										height      : '100%',
										width       : '100%',
									}}
								/>
								<Pulse
									easingFunction = {easingFunctions.easeCirc}
									burstInterval  = {0}
									speed          = {1}
								>
									<Icon
										iconSrc         = {ICON_SRC}
										uvs             = {ICON_UVS}
										width           = {64}
										height          = {64}
										backgroundColor = {theme.colors.info}
									/>
								</Pulse>
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.secondary}>
								<SpinnerBeamsEven
									uiTransform={{
										positionType: 'absolute',
										position    : { top: 0, left: 0 },
										height      : '100%',
										width       : '100%',
									}}
								/>
							</Background>
						</UiBox>
					</Row>

					{/* Row 3 — spinners */}
					<Row uiTransform={{ width: '100%', justifyContent: 'center' }}>
						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.dark}>
								<SpinnerDots speed={-90} />
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.dark}>
								<SpinnerThreeQuarterCircle />
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.dark}>
								<SpinnerHourglass speed={-540} />
							</Background>
						</UiBox>

						<UiBox uiTransform={CELL}>
							<Background backgroundColor={theme.colors.dark}>
								<SpinnerCircle />
							</Background>
						</UiBox>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoAnimationsLayer = new DemoAnimationsLayer()
