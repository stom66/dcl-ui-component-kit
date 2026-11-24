import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, ButtonText, Column, getTheme, Icon, Layer, Text, ZoneType } from '../../../../ui-component-kit'

import { isLayerShown, toggleDemoPanel } from './demo.panels'

export type FaIconName = keyof typeof atlasIconsFontAwesome.uv

export type NavEntry = {
	id   : string
	label: string
	icon : FaIconName
	/** Layer whose visibility tints this button active. Omit for plain actions. */
	layer?: Layer
	/** Defaults to exclusive `toggleDemoPanel(layer)`. */
	onClick?: () => void
}

export type DemoSidebarOptions = {
	/** Button height in px. Defaults to the theme button height. */
	buttonHeight?: number
}

const NAV_ICON_SIZE = 22

/** Sidebar panel width (this layer only — does not change ZoneType.RightTop). */
const NAV_BAR_WIDTH = 270

/** Clears the top-right tab buttons (button height + tab bar padding + gap). */
export const NAV_SIDEBAR_TOP_OFFSET = 88


// MARK: DemoNavButton
/** Left-aligned text button with a Font Awesome icon. Active panel is tinted primary. */
function DemoNavButton({ id, label, icon, layer, onClick }: NavEntry, buttonHeight?: number) {
	const theme  = getTheme()
	const active = layer ? isLayerShown(layer) : false
	// ButtonText keeps its first backgroundColor per id, so the active state
	// uses its own id to pick up the new fill.
	const btnId  = active ? `${id}_active` : id

	return (
		<ButtonText
			key             = {btnId}
			id              = {btnId}
			cols            = {12}
			height          = {buttonHeight}
			callback        = {onClick ?? (() => { if (layer) toggleDemoPanel(layer) })}
			backgroundColor = {active ? theme.colors.primary : undefined}
			uiTransform     = {{ flexDirection: 'row' }}
			justifyContent  = "flex-start"
			alignItems      = "center"
			padding         = {{ right: 12, left: 10 }}
			uiText          = {{ value: '' }}
		>
			<Icon
				src       = {atlasIconsFontAwesome.source}
				uvs       = {atlasIconsFontAwesome.uv[icon]}
				width     = {NAV_ICON_SIZE}
				height    = {NAV_ICON_SIZE}
				iconColor = {theme.colors.light}
				margin    = {{ right: 10 }}
			/>
			<Text
				value     = {label}
				fontColor = {theme.colors.light}
				width     = "auto"
				alignSelf = "center"
				fontSize  = {theme.typography.size.default}
				textAlign = "middle-left"
				// react-ecs defaults unset textWrap to wrap — first-frame narrow
				// flex widths mid-word-break short labels until layout settles.
				textWrap  = "nowrap"
			/>
		</ButtonText>
	)
}


// MARK: DemoSidebarLayer
/**
 * Right-hand sidebar of exclusive toggle buttons for demo content layers.
 * Instances (Components / Layouts / Zones) are switched by the top-right tabs.
 */
export class DemoSidebarLayer extends Layer {
	private readonly entries: NavEntry[]
	private readonly options: DemoSidebarOptions

	constructor(id: string, entries: NavEntry[], options: DemoSidebarOptions = {}) {
		super({
			id,
			zone       : ZoneType.RightTop,
			canBeHidden: true,
			startHidden: true,
			zIndex     : 1000,
			// No width: the RightTop slot is sized by its left/right insets. An
			// explicit width makes Yoga ignore `right`, pushing the zone (and this
			// right-aligned menu) off the right edge of the screen.
			uiTransform: {
				height    : 'auto',
				alignItems: 'flex-end',
			},
		})
		this.entries = entries
		this.options = options
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Column
				key            = {`${this.id}_shell`}
				spacing        = {0}
				alignSelf      = "flex-end"
				alignItems     = "stretch"
				justifyContent = "flex-start"
				zIndex         = {1000}
				width          = "100%"
				height         = "auto"
				maxWidth       = {NAV_BAR_WIDTH}
				margin         = {{ top: NAV_SIDEBAR_TOP_OFFSET }}
			>
				<Background
					key             = {`${this.id}_chrome`}
					backgroundColor = {alpha(theme.colors.body, 0.65)}
					borderRadius    = {theme.border.radiusDefault}
				/>
				<Column
					key            = {`${this.id}_body`}
					cols           = {12}
					height         = "auto"
					alignItems     = "stretch"
					justifyContent = "flex-start"
					padding        = {{ top: 8, right: 8, bottom: 8, left: 8 }}
				>
					{this.entries.map((entry) => DemoNavButton(entry, this.options.buttonHeight))}
				</Column>
			</Column>
		)
	}
}
