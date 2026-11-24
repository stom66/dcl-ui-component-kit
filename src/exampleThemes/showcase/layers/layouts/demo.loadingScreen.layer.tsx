import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, BackgroundGradient, ButtonText, Column, FontAwesome, getTheme, H2, Icon, Layer, ProgressBar, Row, Spinner, Text, ZoneType } from '../../../../ui-component-kit'
import { timers } from '../../../../ui-component-kit/utils/timers'

import { BigText, demoClock, FaIcon } from './demo.layouts.shared'


const PREVIEW_LOOP_SECONDS = 9
const PREVIEW_FILL_SECONDS = 7
const FULL_LOAD_SECONDS    = 6
const FULL_HOLD_SECONDS    = 0.6
const TIP_SECONDS          = 4

const STAGES: { until: number, label: string }[] = [
	{ until: 0.15, label: 'Connecting to realm…'         },
	{ until: 0.35, label: 'Lining up ducklings…'         },
	{ until: 0.55, label: 'Waterproofing feathers…'      },
	{ until: 0.75, label: 'Reticulating splines…'        },
	{ until: 0.99, label: 'Calibrating quack resonance…' },
	{ until: 1.01, label: 'Ready!'                       },
]

const TIPS = [
	'Press 1 to open or close the demo menu.',
	'Layers slide in from their zone edge — set showFrom / hideTo to override.',
	'Use cols on Row children for a 12-column grid layout.',
	'Toasts can stack, queue or replace within a group.',
	'Keep ButtonText ids unique — hover state is stored per id.',
]


// MARK: stageLabel
function stageLabel(progress: number): string {
	for (const stage of STAGES) {
		if (progress < stage.until) return stage.label
	}
	return STAGES[STAGES.length - 1].label
}


// MARK: LoadingScreenView
/**
 * Loading screen content shared by the panel preview and the full-screen
 * layer: gradient backdrop, spinning emblem, title, stage text, progress bar
 * and rotating tips. `scale` shrinks type and art for the preview.
 */
function LoadingScreenView({
	idPrefix,
	progress,
	scale,
}: {
	idPrefix: string
	progress: number
	scale   : number
}) {
	const theme    = getTheme()
	const tipIndex = Math.floor(demoClock() / TIP_SECONDS) % TIPS.length
	const emblem   = 120 * scale
	const pct      = Math.round(progress * 100)

	return (
		<UiEntity
			key         = {`${idPrefix}_root`}
			uiTransform = {{
				width         : '100%',
				height        : '100%',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'flex-start',
				overflow      : 'hidden',
			}}
			uiBackground = {{ color: theme.colors.dark }}
		>
			<BackgroundGradient key="gradient" backgroundColor={theme.colors.body} direction="top" borderRadius={0} borderWidth={0} />

			{/* Top spacer — matches the tip area below so the main group stays centred */}
			<UiEntity key="top_spacer" uiTransform={{ width: '100%', flexGrow: 1, flexBasis: 0 }} />

			{/* Emblem: spinning ring around a static icon */}
			<UiEntity uiTransform={{ width: emblem, height: emblem, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
				<Spinner
					id          = {`${idPrefix}_spinner`}
					duration    = {2}
					degrees     = {360}
					uiTransform = {{ positionType: 'absolute', position: { top: 0, left: 0 } }}
				>
					<Icon
						src       = {atlasIconsFontAwesome.source}
						uvs       = {atlasIconsFontAwesome.uv.gear}
						width     = {emblem}
						height    = {emblem}
						iconColor = {alpha(theme.colors.primary, 0.35)}
					/>
				</Spinner>
				{/* Font Awesome Free has no duck — dove is a stand-in */}
				<FontAwesome icon="dove" fontSize={emblem * 0.45} fontColor={theme.colors.light} />
			</UiEntity>

			<BigText value="DUCK" size={theme.typography.size.h1 * 1.4 * scale} color={theme.colors.light} />
			<Text
				value     = {stageLabel(progress)}
				width     = "auto"
				alignSelf = "center"
				textWrap  = "nowrap"
				fontSize  = {theme.typography.size.default * Math.max(0.8, scale)}
				fontColor = {progress >= 1 ? theme.colors.success : theme.colors.tertiary}
				margin    = {{ top: 4 * scale, bottom: 12 * scale }}
			/>

			<Column width="45%" alignItems="stretch" spacing={6 * scale}>
				<ProgressBar
					id           = {`${idPrefix}_bar`}
					value        = {pct}
					height       = {Math.max(14, 26 * scale)}
					lerpDuration = {0}
				>
					<Text
						value       = {`${pct}%`}
						fontSize    = {theme.typography.size.small}
						fontColor   = {theme.colors.light}
						textAlign   = "middle-center"
						textWrap    = "nowrap"
						uiTransform = {{ width: 'auto', alignSelf: 'center' }}
					/>
				</ProgressBar>
			</Column>

			{/* Tip area: fills the space below the bar; the tip sits centred in it,
			    roughly halfway between the bar and the bottom edge */}
			<UiEntity
				key         = "tip_area"
				uiTransform = {{
					width         : '100%',
					flexGrow      : 1,
					flexBasis     : 0,
					alignItems    : 'center',
					justifyContent: 'center',
					padding       : { top: 12 * scale, bottom: 12 * scale },
				}}
			>
				<Row
					width           = "45%"
					height          = "auto"
					alignItems      = "center"
					justifyContent  = "flex-start"
					spacing         = {8}
					backgroundColor = {alpha(theme.colors.dark, 0.6)}
					borderRadius    = {theme.border.radiusDefault}
					padding         = {{ top: 6 * scale, right: 12, bottom: 6 * scale, left: 12 }}
				>
					<FaIcon name="lightbulb" size={20 * Math.max(0.8, scale)} color={theme.colors.primary} />
					<UiEntity uiTransform={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, height: 'auto' }}>
						<Text
							value     = {`Tip: ${TIPS[tipIndex]}`}
							textWrap  = "wrap"
							fontSize  = {theme.typography.size.small}
							fontColor = {theme.colors.light}
						/>
					</UiEntity>
				</Row>
			</UiEntity>
		</UiEntity>
	)
}


// MARK: DemoLoadingScreenFullLayer
/** Edge-to-edge loading screen. `play()` runs one load, then hides itself. */
export class DemoLoadingScreenFullLayer extends Layer {
	private startedAt = 0

	constructor() {
		super({
			id         : 'demo-loading-screen-full',
			zone       : ZoneType.FullScreen,
			canBeHidden: true,
			startHidden: true,
			zIndex     : 5000,
		})
	}

	play() {
		this.startedAt = demoClock()
		this.show()
		timers.setTimeout(() => this.hide(), (FULL_LOAD_SECONDS + FULL_HOLD_SECONDS) * 1000)
	}

	protected body() {
		const progress = Math.min(1, (demoClock() - this.startedAt) / FULL_LOAD_SECONDS)
		return <LoadingScreenView idPrefix="demo_loading_full" progress={progress} scale={1} />
	}
}

export const demoLoadingScreenFullLayer = new DemoLoadingScreenFullLayer()


// MARK: DemoLoadingScreenLayer
/** Panel with a looping 16:9 loading-screen preview and a full-screen trigger. */
export class DemoLoadingScreenLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-loading-screen',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '48vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme    = getTheme()
		const loopTime = demoClock() % PREVIEW_LOOP_SECONDS
		const progress = Math.min(1, loopTime / PREVIEW_FILL_SECONDS)

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				spacing        = {8}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
				<H2 value="Loading Screen" />
				<Text value="BackgroundGradient, Spinner, ProgressBar with a stage label, and a rotating tip strip. The preview loops; the button plays it full-screen." />

				<UiEntity key="preview_frame" uiTransform={{ width: '100%', height: '24vw', flexShrink: 0 }}>
					<LoadingScreenView idPrefix="demo_loading_preview" progress={progress} scale={0.55} />
				</UiEntity>

				<Row justifyContent="flex-end">
					<ButtonText
						id          = "demo_loading_play_full"
						cols        = {5}
						callback    = {() => demoLoadingScreenFullLayer.play()}
						uiTransform = {{ flexDirection: 'row' }}
						uiText      = {{ value: '' }}
					>
						<FaIcon name="expand" size={18} color={theme.colors.light} margin={{ right: 8 }} />
						<Text value={`Play full-screen (${FULL_LOAD_SECONDS}s)`} width="auto" alignSelf="center" textWrap="nowrap" fontColor={theme.colors.light} />
					</ButtonText>
				</Row>
			</Column>,
		]
	}
}

export const demoLoadingScreenLayer = new DemoLoadingScreenLayer()
