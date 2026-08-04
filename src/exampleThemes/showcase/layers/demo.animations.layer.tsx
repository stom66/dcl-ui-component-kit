import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'
import { atlasIconsFontAwesome, Background, Bounce, Column, FlashColor, getTheme, H1, Icon, Layer, playOnce, Pulse, Row, setPlaying, Shake, Spinner, Text, UiBox, Wiggle, ZoneType } from '../../../ui-component-kit'
import { alpha, easingFunctions, vhToPixels, vwToPixels } from '../../../ui-component-kit/utils'

const CELL = {
	height: '128',
	width : '128',
} as const

const ICON_UVS = atlasIconsFontAwesome.uv.star

const BEAMS_EVEN   = 'assets/images/ui-component-kit/spinner-beams-even.png'
const BEAMS_VARIED = 'assets/images/ui-component-kit/spinner-beams-varied.png'

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
	spinner             : 'demo-anim-spinner',
	spinnerBeamsVaried  : 'demo-anim-spinner-beams-varied',
	spinnerBeamsOuter   : 'demo-anim-spinner-beams-outer',
	spinnerBeamsInner   : 'demo-anim-spinner-beams-inner',
	spinnerPulseChild   : 'demo-anim-spinner-pulse-child',
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
				width : vwToPixels(50),
				height: vhToPixels(75),
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
					<H1 value="Animations" color={theme.colors.light} />
					{/* MARK: Row 1 
					*/}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>

						{this.renderAnimCell('Spinner', theme.colors.warning, (
							<Spinner
								id          = {ID.spinner}
								uiTransform = {{
									positionType: 'absolute',
									position    : { top: 0, left: 0 },
								}}
							>
								<Icon
									src    = {BEAMS_EVEN}
									width  = {128}
									height = {128}
								/>
							</Spinner>
						))}

						{this.renderAnimCell('Pulse', theme.colors.primary, [
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
									uvs    = {atlasIconsFontAwesome.uv.gift}
									width  = {64}
									height = {64}
								/>
							</Bounce>
						))}

						{this.renderAnimCell('Shake', theme.colors.success, (
							<Shake id={ID.shake}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Shake>
						))}

						{this.renderAnimCell('FlashColor', theme.colors.warning, (
							<FlashColor id={ID.flashColor} color={theme.colors.danger}>
								<Icon
									uvs    = {atlasIconsFontAwesome.uv.bomb}
									width  = {64}
									height = {64}
								/>
							</FlashColor>
						))}

						{this.renderAnimCell('Wiggle', theme.colors.danger, (
							<Wiggle id={ID.wiggle}>
								<Icon
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Wiggle>
						))}
					</Row>


					{/* MARK: Row 2 
					*/}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>

						{this.renderAnimCell('Spinner + \nPulse > FlashColor', theme.colors.info, [
							<Spinner
								id          = {ID.spinnerBeamsVaried}
								duration    = {1}
								degrees     = {25}
								uiTransform = {{
									positionType: 'absolute',
									position    : { top: 0, left: 0 },
								}}
							>
									<Icon
										src    = {BEAMS_VARIED}
										width  = {128}
										height = {128}
										/>
							</Spinner>,
							<Pulse
								id             = {ID.pulseBeamsVaried}
								easingFunction = {easingFunctions.easeCirc}
								burstInterval  = {0}
								duration       = {1}
							>
								<FlashColor 
									id            = "skadjfhksjdf" 
									color         = {theme.colors.success} 
									duration      = {2} 
									burstInterval = {0}
								>
									<Icon
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
										color  = {theme.colors.primary}
									/>
								</FlashColor>
							</Pulse>,
						])}

						{this.renderAnimCell('Spinner > Spinner + \nSpinner > Pulse', theme.colors.warning, [
							<Spinner
								id             = {ID.spinnerBeamsOuter}
								duration       = {1}
								degrees        = {180}
								burstCount     = {1}
								burstInterval  = {1.5}
								easingFunction = {easingFunctions.easeBack}
								uiTransform    = {{
									positionType: 'absolute',
									position    : { top: 0, left: 0 },
								}}
							>
								<Spinner
									id             = {ID.spinnerBeamsInner}
									duration       = {1}
									degrees        = {-180}
									burstCount     = {1}
									burstInterval  = {1.5}
									burstOffset    = {1.25}
									easingFunction = {easingFunctions.easeBack}
									uiTransform    = {{
										positionType: 'absolute',
										position    : { top: 0, left: 0 },
									}}
								>
									<Icon
										src    = {BEAMS_EVEN}
										width  = {128}
										height = {128}
									/>
								</Spinner>
							</Spinner>,
							<Spinner id={ID.spinnerPulseChild}>
								<Pulse
									id             = {ID.pulseBeamsEven}
									easingFunction = {easingFunctions.easeSine}
									burstInterval  = {0}
								>
									<Icon
										uvs    = {atlasIconsFontAwesome.uv.rotateRight}
										width  = {64}
										height = {64}
									/>
								</Pulse>
							</Spinner>,
						])}

						{this.renderAnimCell('Pulse, Shake, and Wiggle', theme.colors.primary, [
							<Pulse
								id             = {ID.pulseBeamsEven}
								easingFunction = {easingFunctions.easeSine}
								burstCount     = {2}
								burstInterval  = {2}
								burstOffset    = {0}
								duration       = {0.5}
								>
									<Shake 
										id            = "alskjd" 
										burstCount     = {2}
										burstInterval  = {2}
										burstOffset    = {1}
										duration       = {0.5}
									>
										<Wiggle 
											id            = "alskjdaa" 
											burstCount     = {2}
											burstInterval  = {2}
											burstOffset    = {2}
											duration       = {0.5}
										>
											<Icon
												uvs    = {atlasIconsFontAwesome.uv.cat}
												width  = {64}
												height = {64}
												/>
										</Wiggle>
									</Shake>
							</Pulse>,
						])}
					</Row>

					{/* MARK: Row 3 — event
					*/}
					<Row cols={12} uiTransform={{ justifyContent: 'center' }}>
						{this.renderAnimCell(
							'onHover | One-shot\nShake',
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
							'onHover | Loop\nPulse',
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
							'onClick\nFlashColor',
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
							'onClick\nWiggle once',
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
						width       : CELL.width,
						height      : 32,
						margin      : { top: 4 },
						borderRadius: theme.border.radiusSmall,
					}}
					uiText={{
						fontSize : scaleFontSize(theme.typography.size.default, -0.15),
						textAlign: 'middle-center',
					}}
					backgroundColor={alpha(bgColor, 0.5)}
				/>
			</Column>
		)
	}
}

export const demoAnimationsLayer = new DemoAnimationsLayer()
