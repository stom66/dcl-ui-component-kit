import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome } from '../../atlases'
import { Background, Column, Icon, playOnce, Row, setPlaying, Text, UiBox } from '../../components'
import { Bounce, FlashColor, Pulse, Shake, Wiggle } from '../../components/animations'
import { Layer } from '../../components/layers'
import { SpinnerBeamsEven, SpinnerBeamsVaried, SpinnerCircle, SpinnerDots, SpinnerHourglass, SpinnerThreeQuarterCircle } from '../../components/spinners'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { vwToPixels } from '../../utils'
import { easingFunctions } from '../../utils/tweens'


const CELL = {
	height: '128',
	width : '128',
} as const

const ICON_UVS = atlasIconsFontAwesome.uv.star

const ID = {
	pulse               : 'demo-anim-pulse',
	pulseBeamsEven      : 'demo-anim-pulse-beams-even',
	bounce              : 'demo-anim-bounce',
	shake               : 'demo-anim-shake',
	flashColor          : 'demo-anim-flash-color',
	wiggle              : 'demo-anim-wiggle',
	pulseBeamsVaried    : 'demo-anim-pulse-beams-varied',
	hoverShake          : 'demo-anim-hover-shake',
	hoverPulse          : 'demo-anim-hover-pulse',
	clickFlash          : 'demo-anim-click-flash',
	clickWiggle         : 'demo-anim-click-wiggle',
} as const


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
				height: '75vh',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background>
				<Column
					cols={12}
					uiTransform={{
						height        : '100%',
						alignItems    : 'center',
						justifyContent: 'center',
						padding       : { top: 16, right: 16, bottom: 16, left: 16 },
					}}
				>
					{/* Row 1 */}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>
						{this.renderAnimCell('Pulse', theme.colors.primary, (
							<Pulse id={ID.pulse}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Pulse>
						))}

						{this.renderAnimCell('Pulse +\nSpinnerBeamsEven', theme.colors.primary, [
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
							/>,
							<Pulse
								id             = {ID.pulseBeamsEven}
								easingFunction = {easingFunctions.easeSine}
								burstInterval  = {0}
							>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Pulse>,
						])}

						{this.renderAnimCell('Bounce', theme.colors.info, (
							<Bounce id={ID.bounce}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Bounce>
						))}

						{this.renderAnimCell('Shake', theme.colors.danger, (
							<Shake id={ID.shake}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Shake>
						))}
					</Row>

					{/* Row 2 */}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>
						{this.renderAnimCell('FlashColor', theme.colors.info, (
							<FlashColor id={ID.flashColor}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</FlashColor>
						))}

						{this.renderAnimCell('Wiggle', theme.colors.warning, (
							<Wiggle id={ID.wiggle}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Wiggle>
						))}

						{this.renderAnimCell('Pulse +\nSpinnerBeamsVaried', theme.colors.primary, [
							<SpinnerBeamsVaried
								speed       = {25}
								uiTransform = {{
									positionType: 'absolute',
									position    : { top: 0, left: 0 },
									height      : '100%',
									width       : '100%',
								}}
							/>,
							<Pulse
								id             = {ID.pulseBeamsVaried}
								easingFunction = {easingFunctions.easeCirc}
								burstInterval  = {0}
								speed          = {1}
							>
								<Icon
									uvs             = {ICON_UVS}
									width           = {64}
									height          = {64}
									backgroundColor = {theme.colors.info}
								/>
							</Pulse>,
						])}

						{this.renderAnimCell('Spinner\nBeamsEven', theme.colors.secondary, (
							<SpinnerBeamsEven
								uiTransform={{
									positionType: 'absolute',
									position    : { top: 0, left: 0 },
									height      : '100%',
									width       : '100%',
								}}
							/>
						))}
					</Row>

					{/* Row 3 — spinners */}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>
						{this.renderAnimCell('SpinnerDots', theme.colors.dark, (
							<SpinnerDots speed={-90} width={64} height={64} />
						))}

						{this.renderAnimCell('SpinnerThree\nQuarterCircle', theme.colors.dark, (
							<SpinnerThreeQuarterCircle width={64} height={64} />
						))}

						{this.renderAnimCell('Spinner\nHourglass', theme.colors.dark, (
							<SpinnerHourglass speed={-540} width={64} height={64} />
						))}

						{this.renderAnimCell('SpinnerCircle', theme.colors.dark, (
							<SpinnerCircle width={64} height={64} />
						))}
					</Row>

					{/* Row 4 — event-driven one-shots / toggles */}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>
						{this.renderAnimCell(
							'Hover\nShake once',
							theme.colors.danger,
							(
								<Shake
									id         = {ID.hoverShake}
									playing    = {false}
									looping    = {false}
									burstCount = {1}
								>
									<Icon
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</Shake>
							),
							{
								onMouseEnter: () => playOnce(ID.hoverShake),
							},
						)}

						{this.renderAnimCell(
							'Hover\nPulse loop',
							theme.colors.primary,
							(
								<Pulse
									id      = {ID.hoverPulse}
									playing = {false}
									looping = {true}
									burstInterval={0}
								>
									<Icon
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</Pulse>
							),
							{
								onMouseEnter: () => setPlaying(ID.hoverPulse, true),
								onMouseLeave: () => setPlaying(ID.hoverPulse, false),
							},
						)}

						{this.renderAnimCell(
							'Click\nFlashColor',
							theme.colors.info,
							(
								<FlashColor
									id         = {ID.clickFlash}
									playing    = {false}
									looping    = {false}
									burstCount = {1}
								>
									<Icon
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</FlashColor>
							),
							{
								onMouseDown: () => playOnce(ID.clickFlash),
							},
						)}

						{this.renderAnimCell(
							'Click\nWiggle once',
							theme.colors.warning,
							(
								<Wiggle
									id         = {ID.clickWiggle}
									playing    = {false}
									looping    = {false}
									burstCount = {1}
								>
									<Icon
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</Wiggle>
							),
							{
								onMouseDown: () => playOnce(ID.clickWiggle),
							},
						)}
					</Row>
				</Column>
			</Background>
		)
	}


	// MARK: renderAnimCell
	/** Animation preview box with an explicit component-name caption underneath. */
	private renderAnimCell(
		label   : string,
		bgColor : Color4,
		children: ReactEcs.JSX.Element | ReactEcs.JSX.Element[],
		events? : {
			onMouseEnter?: () => void
			onMouseLeave?: () => void
			onMouseDown ?: () => void
		},
	) {
		const theme = getTheme()

		return (
			<Column
				uiTransform={{
					alignItems: 'center',
					margin    : { left: 8, right: 8, top: 8, bottom: 8 },
				}}
			>
				<UiBox
					uiTransform  = {CELL}
					onMouseEnter = {events?.onMouseEnter}
					onMouseLeave = {events?.onMouseLeave}
					onMouseDown  = {events?.onMouseDown}
				>
					<Background backgroundColor={bgColor}>
						{children}
					</Background>
				</UiBox>
				<Text
					value       = {label}
					uiTransform = {{
						width : CELL.width,
						height: 32,
						margin: { top: 4 },
					}}
					uiText={{
						fontSize : scaleFontSize(theme.typography.size.small),
						textAlign: 'middle-center',
					}}
				/>
			</Column>
		)
	}
}

export const demoAnimationsLayer = new DemoAnimationsLayer()
