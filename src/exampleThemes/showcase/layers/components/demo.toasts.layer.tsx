import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome, Background, ButtonText, clearToastGroup, Column, getTheme, H2, Icon, Label, Layer, Row, showToast, Text, ZoneType, type ToastPosition } from '../../../../ui-component-kit'


const FONT_LUCKIEST_GUY = 'assets/fonts/examples/Luckiest_Guy/LuckiestGuy-Regular.ttf'
const BUTTON_HEIGHT     = 32

const POSITIONS: ToastPosition[] = [
	'topLeft',
	'top',
	'topRight',
	'bottomLeft',
	'bottom',
	'bottomRight',
]

const HINT_ICONS = ['gift', 'heart', 'dice', 'cat', 'crown'] as const

let hintIndex  = 0
let scoreValue = 100


// MARK: toastLabel
function toastLabel(value: string) {
	const theme = getTheme()

	return (
		<Column
			backgroundColor = {theme.colors.primary}
			borderRadius    = {8}
			width           = "100%"
			height          = "100%"
			alignItems      = "center"
			justifyContent  = "center"
			padding         = {{ top: 8, right: 12, bottom: 8, left: 12 }}
		>
			<Row key="row">
				<Icon key="icon" src={atlasIconsFontAwesome.source} uvs={atlasIconsFontAwesome.uv.cat} />
				<Text key="label" value={value} fontSize={theme.typography.size.default} />
			</Row>
		</Column>
	)
}


// MARK: scoreToast
function scoreToast(value: number) {
	const theme = getTheme()

	return (
		<Label
			value           = {String(value)}
			width           = "100%"
			height          = "100%"
			backgroundColor = {theme.colors.info}
			borderRadius    = {8}
			font            = "sans-serif"
			fontSrc         = {FONT_LUCKIEST_GUY}
			fontSize        = {theme.typography.size.h1}
			fontColor       = {theme.colors.dark}
			textAlign       = "middle-center"
			textWrap        = "nowrap"
		/>
	)
}


// MARK: showPositionToast
function showPositionToast(position: ToastPosition) {
	const name    = String(position)
	const fromTop = name.startsWith('top')

	showToast({
		position,
		duration     : 2.5,
		isDismissable: true,
		content      : () => toastLabel(position),
		width        : 180,
		height       : 48,
		showFrom     : fromTop ? 'top' : 'bottom',
		hideTo       : name.endsWith('Right') ? 'right' : name.endsWith('Left') ? 'left' : (fromTop ? 'top' : 'bottom'),
	})
}


// MARK: showHint
function showHint(groupPolicy: 'queue' | 'replace') {
	const name = HINT_ICONS[hintIndex % HINT_ICONS.length]
	hintIndex++

	showToast({
		position     : 'top',
		group        : 'hints',
		groupPolicy,
		duration     : groupPolicy === 'queue' ? 2 : 3,
		isDismissable: true,
		content      : () => (
			<Icon
				src    = {atlasIconsFontAwesome.source}
				uvs    = {atlasIconsFontAwesome.uv[name]}
				width  = "100%"
				height = "100%"
			/>
		),
		width : 64,
		height: 64,
	})
}


// MARK: positionRow
function positionRow(
	rowKey   : string,
	positions: ToastPosition[],
) {
	const theme = getTheme()

	return (
		<Row key={rowKey} spacing={4}>
			{positions.map((position) => (
				<ButtonText
					key             = {`btn_toast_pos_${position}`}
					id              = {`btn_toast_pos_${position}`}
					textLabel       = {position}
					cols            = {4}
					height          = {BUTTON_HEIGHT}
					fontSize        = {theme.typography.size.small}
					backgroundColor = {theme.colors.secondary}
					callback        = {() => showPositionToast(position)}
				/>
			))}
		</Row>
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
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 10, right: 12, bottom: 10, left: 12 }}
				spacing        = {8}
			>
				<H2 key="title" value="Toasts" />
				<Row key="groups" alignItems="flex-start" spacing={8}>
					<Column key="positions" cols={5} alignItems="stretch" spacing={4}>
						<Label
							key             = "label"
							cols            = {12}
							value           = "Positions"
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.primary}
						/>
						{positionRow('top', POSITIONS.slice(0, 3))}
						{positionRow('bottom', POSITIONS.slice(3))}
					</Column>
					<Column key="motion" cols={4} alignItems="stretch" spacing={4}>
						<Label
							key             = "label"
							cols            = {12}
							value           = "Motion"
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.primary}
						/>
						<ButtonText
							key             = "btn_toast_slide_cross"
							id              = "btn_toast_slide_cross"
							textLabel       = "In top / out bottom"
							cols            = {12}
							height          = {BUTTON_HEIGHT}
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.secondary}
							callback        = {() => {
								showToast({
									position     : 'bottom',
									showFrom     : 'top',
									hideTo       : 'bottom',
									duration     : 2,
									isDismissable: true,
									content      : () => toastLabel('cross fade slide'),
									width        : 220,
									height       : 48,
								})
							}}
						/>
						<ButtonText
							key             = "btn_toast_score"
							id              = "btn_toast_score"
							textLabel       = "Score scale"
							cols            = {12}
							height          = {BUTTON_HEIGHT}
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.secondary}
							callback        = {() => {
								scoreValue += 25
								const value = scoreValue
								showToast({
									position  : 'top',
									duration  : 0.4,
									slide     : false,
									scaleIn   : true,
									scaleOut  : true,
									scalePulse: true,
									content   : () => scoreToast(value),
									width     : 180,
									height    : 80,
								})
							}}
						/>
					</Column>
					<Column key="hints" cols={3} alignItems="stretch" spacing={4}>
						<Label
							key             = "label"
							cols            = {12}
							value           = "Hint group"
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.primary}
						/>
						<ButtonText
							key             = "btn_toast_hint_queue"
							id              = "btn_toast_hint_queue"
							textLabel       = "Queue hint"
							cols            = {12}
							height          = {BUTTON_HEIGHT}
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.secondary}
							callback        = {() => showHint('queue')}
						/>
						<ButtonText
							key             = "btn_toast_hint_replace"
							id              = "btn_toast_hint_replace"
							textLabel       = "Replace hint"
							cols            = {12}
							height          = {BUTTON_HEIGHT}
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.secondary}
							callback        = {() => showHint('replace')}
						/>
						<ButtonText
							key             = "btn_toast_hint_clear"
							id              = "btn_toast_hint_clear"
							textLabel       = "Clear hints"
							cols            = {12}
							height          = {BUTTON_HEIGHT}
							fontSize        = {theme.typography.size.small}
							backgroundColor = {theme.colors.danger}
							callback        = {() => clearToastGroup('hints')}
						/>
					</Column>
				</Row>
			</Column>,
		]
	}
}

export const demoToastsLayer = new DemoToastsLayer()
