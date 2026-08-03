import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome } from '../../atlases'
import { Background, ButtonText, Column, Divider, H2, Icon, IconNumber, Label, Row, Text } from '../../components'
import { Layer } from '../../components/layers'
import { clearToastGroup, showToast, type ToastPosition } from '../../components/toasts'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'


const POSITIONS: ToastPosition[] = [
	'top',
	'bottom',
	'topLeft',
	'topRight',
	'bottomLeft',
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
				width         : '100%',
				height        : '100%',
				alignItems    : 'center',
				justifyContent: 'center',
				padding       : { top: 8, right: 12, bottom: 8, left: 12 },
			}}
		>
			<Text value={value} />
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

					<Divider uiTransform={{ margin: { top: 6, bottom: 6 } }} />

					<Label cols={12} value="Positions" uiTransform={{ margin: { bottom: 4 } }} />
					<Row cols={12} spacing={4}>
						{POSITIONS.slice(0, 3).map((position) => (
							<ButtonText
								key       = {`btn_toast_pos_${position}`}
								id        = {`btn_toast_pos_${position}`}
								textLabel = {position}
								cols      = {4}
								callback  = {() => {
									showToast({
										position,
										duration      : 2.5,
										isDismissable : true,
										content       : () => toastLabel(position),
										width         : 180,
										height        : 48,
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
								callback  = {() => {
									showToast({
										position,
										duration      : 2.5,
										isDismissable : true,
										content       : () => toastLabel(position),
										width         : 180,
										height        : 48,
									})
								}}
							/>
						))}
					</Row>

					<Divider uiTransform={{ margin: { top: 6, bottom: 6 } }} />

					<Label cols={12} value="Motion" uiTransform={{ margin: { bottom: 4 } }} />
					<Row cols={12} spacing={4}>
						<ButtonText
							id        = "btn_toast_slide_cross"
							textLabel = "In bottom / out top"
							cols      = {6}
							callback  = {() => {
								showToast({
									position      : 'bottom',
									showFrom      : 'bottom',
									hideTo        : 'top',
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
							callback  = {() => {
								scoreValue += 25
								const value = scoreValue
								showToast({
									position   : 'top',
									duration   : 0.4,
									scaleIn    : true,
									scaleOut   : true,
									scalePulse : true,
									content    : () => (
										<IconNumber
											value  = {value}
											width  = "100%"
											height = "100%"
										/>
									),
									width  : 120,
									height : 48,
								})
							}}
						/>
					</Row>

					<Divider uiTransform={{ margin: { top: 6, bottom: 6 } }} />

					<Label cols={12} value="Hint group" uiTransform={{ margin: { bottom: 4 } }} />
					<Row cols={12} spacing={4}>
						<ButtonText
							id        = "btn_toast_hint_queue"
							textLabel = "Queue hint"
							cols      = {4}
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
