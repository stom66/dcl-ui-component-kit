import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { atlasIconsFontAwesome, Background, Bounce, Column, FlashColor, getTheme, H1, Icon, Layer, playOnce, Pulse, Row, setPlaying, Shake, Spinner, Text, Wiggle, ZoneType } from '../../../ui-component-kit'
import { easingFunctions, vwToPixels } from '../../../ui-component-kit/utils'

const CELL   = 128
const GUTTER = 8

/** Outer width of the six caption cells, including the margin around each one. */
const ROW_SPAN = 6 * (CELL + GUTTER * 2)

type SplitCellSize = {
	width : number
	height: number
	icon  : number
}

/** Row 2 — one double-wide square: caption left, animation in a square on the right. */
const SPLIT_WIDE: SplitCellSize = {
	width : CELL * 2,
	height: CELL,
	icon  : CELL,
}

/**
 * Row 3 — same side-by-side layout, scaled so four double-wide squares
 * share the caption row's width.
 */
const SPLIT_COMPACT: SplitCellSize = {
	width : ROW_SPAN / 4 - GUTTER * 2,
	height: (ROW_SPAN / 4 - GUTTER * 2) / 2,
	icon  : (ROW_SPAN / 4 - GUTTER * 2) / 2,
}

type AnimCellEvents = {
	onMouseEnter?: () => void
	onMouseLeave?: () => void
	onMouseDown ?: () => void
}

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
/** Demo panel for motion wrappers and spinners. */
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
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				alignItems     = "center"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
			>
					<H1 value="Animations" fontColor={theme.colors.light} />
					{/* MARK: Row 1 
					*/}
					<Row justifyContent="center">

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
									src = {atlasIconsFontAwesome.source}
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Pulse>,
						])}

						{this.renderAnimCell('Bounce', theme.colors.info, (
							<Bounce id={ID.bounce}>
								<Icon
									src = {atlasIconsFontAwesome.source}
									uvs    = {atlasIconsFontAwesome.uv.gift}
									width  = {64}
									height = {64}
								/>
							</Bounce>
						))}

						{this.renderAnimCell('Shake', theme.colors.success, (
							<Shake id={ID.shake}>
								<Icon
									src = {atlasIconsFontAwesome.source}
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Shake>
						))}

						{this.renderAnimCell('FlashColor', theme.colors.warning, (
							<FlashColor id={ID.flashColor} flashColor={theme.colors.danger}>
								<Icon
									src = {atlasIconsFontAwesome.source}
									uvs    = {atlasIconsFontAwesome.uv.bomb}
									width  = {64}
									height = {64}
								/>
							</FlashColor>
						))}

						{this.renderAnimCell('Wiggle', theme.colors.danger, (
							<Wiggle id={ID.wiggle}>
								<Icon
									src = {atlasIconsFontAwesome.source}
									uvs    = {ICON_UVS}
									width  = {64}
									height = {64}
								/>
							</Wiggle>
						))}
					</Row>


					{/* MARK: Row 2 
					*/}
					<Row justifyContent="center">

						{this.renderSplitCell('Spinner + \nPulse > FlashColor', theme.colors.info, [
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
									flashColor         = {theme.colors.success} 
									duration      = {2} 
									burstInterval = {0}
								>
									<Icon
										src = {atlasIconsFontAwesome.source}
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
										iconColor  = {theme.colors.primary}
									/>
								</FlashColor>
							</Pulse>,
						], SPLIT_WIDE)}

						{this.renderSplitCell('Spinner > Spinner + \nSpinner > Pulse', theme.colors.warning, [
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
										src = {atlasIconsFontAwesome.source}
										uvs    = {atlasIconsFontAwesome.uv.rotateRight}
										width  = {64}
										height = {64}
									/>
								</Pulse>
							</Spinner>,
						], SPLIT_WIDE)}

						{this.renderSplitCell('Pulse, Shake, and Wiggle', theme.colors.primary, [
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
												src = {atlasIconsFontAwesome.source}
												uvs    = {atlasIconsFontAwesome.uv.cat}
												width  = {64}
												height = {64}
												/>
										</Wiggle>
									</Shake>
							</Pulse>,
						], SPLIT_WIDE)}
					</Row>

					{/* MARK: Row 3 — event
					*/}
					<Row justifyContent="center">
						{this.renderSplitCell(
							'onHover: One-shot\nShake',
							theme.colors.danger,
							(
								<Shake
									id         = {ID.hoverShake}
									playing    = {false}
									looping    = {false}
									burstCount = {1}
								>
									<Icon
										src = {atlasIconsFontAwesome.source}
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</Shake>
							),
							SPLIT_COMPACT,
							{
								onMouseEnter: () => playOnce(ID.hoverShake),
							},
						)}

						{this.renderSplitCell(
							'onHover: Loop\nPulse',
							theme.colors.primary,
							(
								<Pulse
									id      = {ID.hoverPulse}
									playing = {false}
									looping = {true}
									burstInterval={0}
								>
									<Icon
										src = {atlasIconsFontAwesome.source}
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</Pulse>
							),
							SPLIT_COMPACT,
							{
								onMouseEnter: () => setPlaying(ID.hoverPulse, true),
								onMouseLeave: () => setPlaying(ID.hoverPulse, false),
							},
						)}

						{this.renderSplitCell(
							'onClick: FlashColor',
							theme.colors.info,
							(
								<FlashColor
									id         = {ID.clickFlash}
									playing    = {false}
									looping    = {false}
									burstCount = {1}
								>
									<Icon
										src = {atlasIconsFontAwesome.source}
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</FlashColor>
							),
							SPLIT_COMPACT,
							{
								onMouseDown: () => playOnce(ID.clickFlash),
							},
						)}

						{this.renderSplitCell(
							'onClick: Wiggle once',
							theme.colors.warning,
							(
								<Wiggle
									id         = {ID.clickWiggle}
									playing    = {false}
									looping    = {false}
									burstCount = {1}
								>
									<Icon
										src = {atlasIconsFontAwesome.source}
										uvs    = {ICON_UVS}
										width  = {64}
										height = {64}
									/>
								</Wiggle>
							),
							SPLIT_COMPACT,
							{
								onMouseDown: () => playOnce(ID.clickWiggle),
							},
						)}
					</Row>
			</Column>,
		]
	}


	// MARK: renderAnimCell
	/** Square preview. The animation stays centered; its name sits on the top edge. */
	private renderAnimCell(
		label   : string,
		bgColor : Color4,
		children: ReactEcs.JSX.Element | ReactEcs.JSX.Element[],
	) {
		return (
			<Column
				key        = {label}
				alignItems = "center"
				margin     = {{ top: GUTTER, right: GUTTER, bottom: GUTTER, left: GUTTER }}
			>
				<UiEntity
					uiTransform={{
						width         : CELL,
						height        : CELL,
						alignItems    : 'center',
						justifyContent: 'center',
					}}
				>
					<Background key="chrome" backgroundColor={bgColor} />
					{children}
					{this.renderCaption(label, true)}
				</UiEntity>
			</Column>
		)
	}


	// MARK: renderSplitCell
	/**
	 * Double-wide preview. Caption fills the left column; the animation sits in
	 * a square on the right, so every cell in the row shares one height.
	 */
	private renderSplitCell(
		label    : string,
		bgColor  : Color4,
		children : ReactEcs.JSX.Element | ReactEcs.JSX.Element[],
		size     : SplitCellSize,
		events?  : AnimCellEvents,
	) {
		const textWidth = size.width - size.icon

		return (
			<Column
				key        = {label}
				alignItems = "center"
				margin     = {{ top: GUTTER, right: GUTTER, bottom: GUTTER, left: GUTTER }}
			>
				<UiEntity
					uiTransform={{
						width         : size.width,
						height        : size.height,
						flexDirection : 'row',
						alignItems    : 'center',
						justifyContent: 'flex-start',
					}}
					onMouseEnter = {events?.onMouseEnter}
					onMouseLeave = {events?.onMouseLeave}
					onMouseDown  = {events?.onMouseDown}
				>
					<Background key="chrome" backgroundColor={bgColor} />
					<Column
						key            = "caption"
						spacing        = {0}
						width          = {textWidth}
						height         = {size.height}
						alignItems     = "center"
						justifyContent = "center"
						padding        = {{ top: 4, right: 6, bottom: 4, left: 6 }}
						uiTransform    = {{ flexShrink: 0 }}
					>
						{this.renderCaption(label, false)}
					</Column>
					<UiEntity
						key         = "demo"
						uiTransform = {{
							width         : size.icon,
							height        : size.height,
							flexShrink    : 0,
							alignItems    : 'center',
							justifyContent: 'center',
						}}
					>
						{children}
					</UiEntity>
				</UiEntity>
			</Column>
		)
	}


	// MARK: renderCaption
	/** Centered caption along the top of a square, or in the left half of a split cell. */
	private renderCaption(
		label  : string,
		overlay: boolean,
	) {
		const theme = getTheme()
		const text  = (
			<Text
				key           = "label"
				value         = {label}
				fontSize      = {theme.typography.size.small}
				fontColor     = {theme.colors.light}
				textAlign     = "middle-center"
				textWrap      = {overlay ? 'nowrap' : 'wrap'}
				pointerFilter = "none"
				uiTransform   = {overlay
					? { width: 'auto', flexGrow: 0, alignSelf: 'center' }
					: { width: '100%', flexShrink: 0, alignSelf: 'center' }}
			/>
		)

		// The square caption is absolutely positioned, so a full-width row has to
		// center the shrink-wrapped label. textAlign alone stays on the left.
		if (!overlay) return text

		return (
			<Row
				key            = "caption"
				spacing        = {0}
				justifyContent = "center"
				alignItems     = "center"
				pointerFilter  = "none"
				uiTransform    = {{
					positionType: 'absolute',
					position    : { top: 2, left: 0 },
					width       : '100%',
					zIndex      : 2,
				}}
			>
				{text}
			</Row>
		)
	}
}

export const demoAnimationsLayer = new DemoAnimationsLayer()
