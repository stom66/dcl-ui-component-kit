import ReactEcs from '@dcl/sdk/react-ecs'
import { alpha, atlasIconsFontAwesome, Background, ButtonText, clearToastGroup, Column, Divider, getTheme, H2, Icon, IconNumber, Label, Layer, Row, showToast, Text, ZoneType, type ToastPosition } from '../../../ui-component-kit'

const POSITIONS: ToastPosition[] = [
	'topLeft',
	'top',
	'topRight',
	'bottomLeft',
	'bottom',
	'bottomRight',
]

const HINT_ICONS = ['gift', 'heart', 'dice', 'cat', 'crown'] as const
let hintIndex = 0
let scoreValue = 100


// MARK: toastLabel
function toastLabel(value: string) {
	const theme = getTheme()
	return (
		<Background
			backgroundColor = {theme.colors.primary}
			borderRadius    = {8}
			uiTransform={{
				width         : '140',
				height        : '64',
				alignItems    : 'center',
				justifyContent: 'center',
				padding       : { top: 8, right: 12, bottom: 8, left: 12 },
			}}
		>
			<Row>
				<Icon uvs={atlasIconsFontAwesome.uv.cat} />
				<Text value={value} />
			</Row>
		</Background>
	)
}


// MARK: DemoToastsLayer
/** Small control panel that triggers toast notifications at each dock / motion mode. */
export class DemoToastsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-toasts',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '50vw',
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
					cols={12}
					uiTransform={{
						height        : '100%',
						alignItems    : 'stretch',
						justifyContent: 'flex-start',
						padding       : { top: 12, right: 16, bottom: 12, left: 16 },
					}}
				>
					<H2 value="Toasts" />
					<Text value="Dock positions, slide edges, scale, and group policies." />

					<Label cols={12} value="Positions" uiTransform={{ margin: { bottom: 4 } }} color={theme.colors.primary} />
					<Row cols={12} spacing={4}>
						{POSITIONS.slice(0, 3).map((position) => (
							<ButtonText
								key             = {`btn_toast_pos_${position}`}
								id              = {`btn_toast_pos_${position}`}
								textLabel       = {position}
								cols            = {4}
								backgroundColor = {theme.colors.secondary}
								callback        = {() => {
									showToast({
										position,
										duration      : 2.5,
										isDismissable : true,
										content       : () => toastLabel(position),
										width         : 180,
										height        : 48,
										showFrom      : 'top',
										hideTo        : position.toString().includes('Right') ? 'right' : position.toString().includes('Left') ? 'left' : 'top',
									})
								}}
							/>
						))}
					</Row>
					<Row cols={12} spacing={4}>
						{POSITIONS.slice(3).map((position) => (
							<ButtonText
								key       = {`btn_toast_pos_${position}`}
								id        = {`btn_toast_pos_${position}`}
								textLabel = {position}
								cols      = {4}
								backgroundColor = {theme.colors.secondary}
								callback  = {() => {
									showToast({
										position,
										duration      : 2.5,
										isDismissable : true,
										content       : () => toastLabel(position),
										width         : 180,
										height        : 48,
										showFrom      : 'bottom',
										hideTo        : position.toString().includes('Right') ? 'right' : position.toString().includes('Left') ? 'left' : 'bottom',
									})
								}}
							/>
						))}
					</Row>

					<Label cols={12} value="Motion" uiTransform={{ margin: { bottom: 4 } }} color={theme.colors.primary}  />
					<Row cols={12} spacing={4}>
						<ButtonText
							id        = "btn_toast_slide_cross"
							textLabel = "In top / out bottom"
							cols      = {6}
							backgroundColor = {theme.colors.secondary}
							callback  = {() => {
								showToast({
									position      : 'bottom',
									showFrom      : 'top',
									hideTo        : 'bottom',
									duration      : 2,
									isDismissable : true,
									content       : () => toastLabel('cross fade slide'),
									width         : 220,
									height        : 48,
								})
							}}
						/>
						<ButtonText
							id        = "btn_toast_score"
							textLabel = "Score scale"
							cols      = {6}
							backgroundColor = {theme.colors.secondary}
							callback  = {() => {
								scoreValue += 25
								const value = scoreValue
								showToast({
									position   : 'top',
									duration   : 0.4,
									slide      : false,
									scaleIn    : true,
									scaleOut   : true,
									scalePulse : true,
									content    : () => (
										<IconNumber
											value           = {value}
											width           = "100%"
											height          = "100%"
											backgroundColor = {theme.colors.info}
											borderRadius    = {8}
											uiTransform     = {{
												padding       : { top: 4, right: 12, bottom: 4, left: 4 },
											}}
										/>
									),
									width  : 128,
									height : 80,
								})
							}}
						/>
					</Row>

					<Label cols={12} value="Hint group" uiTransform={{ margin: { bottom: 4 } }} color={theme.colors.primary}  />
					<Row cols={12} spacing={4}>
						<ButtonText
							id        = "btn_toast_hint_queue"
							textLabel = "Queue hint"
							cols      = {4}
							backgroundColor = {theme.colors.secondary}
							callback  = {() => {
								const name = HINT_ICONS[hintIndex % HINT_ICONS.length]
								hintIndex++
								showToast({
									position    : 'top',
									group       : 'hints',
									groupPolicy : 'queue',
									duration    : 2,
									isDismissable: true,
									content     : () => (
										<Icon
											uvs    = {atlasIconsFontAwesome.uv[name]}
											width  = "100%"
											height = "100%"
										/>
									),
									width  : 64,
									height : 64,
								})
							}}
						/>
						<ButtonText
							id        = "btn_toast_hint_replace"
							textLabel = "Replace hint"
							cols      = {4}
							backgroundColor = {theme.colors.secondary}
							callback  = {() => {
								const name = HINT_ICONS[hintIndex % HINT_ICONS.length]
								hintIndex++
								showToast({
									position    : 'top',
									group       : 'hints',
									groupPolicy : 'replace',
									duration    : 3,
									isDismissable: true,
									content     : () => (
										<Icon
											uvs    = {atlasIconsFontAwesome.uv[name]}
											width  = "100%"
											height = "100%"
										/>
									),
									width  : 64,
									height : 64,
								})
							}}
						/>
						<ButtonText
							id              = "btn_toast_hint_clear"
							textLabel       = "Clear hints"
							cols            = {4}
							backgroundColor = {theme.colors.danger}
							callback        = {() => clearToastGroup('hints')}
						/>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoToastsLayer = new DemoToastsLayer()
