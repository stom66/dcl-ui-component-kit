import { engine, RealmInfo } from '@dcl/sdk/ecs'
import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, ButtonText, getTheme, Icon, Layer, Row, Text, ZoneType } from '../../../../ui-component-kit'

import { demoAnimationsLayer } from '../components/demo.animations.layer'
import { demoBackgroundsLayer } from '../components/demo.backgrounds.layer'
import { demoButtonsLayer } from '../components/demo.buttons.layer'
import { demoColorPickerLayer } from '../components/demo.colorPicker.layer'
import { demoGridsLayer } from '../components/demo.grids.layer'
import { demoIconsLayer } from '../components/demo.icons.layer'
import { demoLayoutLayer } from '../components/demo.layout.layer'
import { demoProgressLayer } from '../components/demo.progress.layer'
import { demoSpriteIconLayer } from '../components/demo.spriteIcon.layer'
import { demoTextLayer } from '../components/demo.text.layer'
import { demoToastsLayer } from '../components/demo.toasts.layer'
import { demoToggleLayer } from '../components/demo.toggle.layer'

import { demoHotbarsLayer } from '../layouts/demo.hotbars.layer'
import { demoListLayer } from '../layouts/demo.list.layer'
import { demoLoadingScreenLayer } from '../layouts/demo.loadingScreen.layer'
import { demoMatchSummaryLayer } from '../layouts/demo.matchSummary.layer'
import { demoSettingsMenuLayer } from '../layouts/demo.settingsMenu.layer'
import { demoTimersLayer } from '../layouts/demo.timers.layer'

import { infoLayer } from '../info.layer'
import { hideAllZonePreviews, ZONE_PREVIEWS } from '../zones/demo.zones'

import { isLayerShown } from './demo.panels'
import { DemoSidebarLayer, type FaIconName, type NavEntry } from './demo.sidebar.layer'


// MARK: Sidebars
/** Components sidebar — one entry per kit component demo. */
export const demoComponentsNavLayer = new DemoSidebarLayer('demo-nav-components', [
	{ id: 'btn_demo_animations',  label: 'Animations',  icon: 'wandMagicSparkles', layer: demoAnimationsLayer },
	{ id: 'btn_demo_backgrounds', label: 'Backgrounds', icon: 'image',             layer: demoBackgroundsLayer },
	{ id: 'btn_demo_buttons',     label: 'Buttons',     icon: 'handPointer',       layer: demoButtonsLayer },
	{ id: 'btn_demo_color_picker', label: 'Color Picker', icon: 'palette',           layer: demoColorPickerLayer },
	{ id: 'btn_demo_grids',       label: 'Grids',       icon: 'cubes',             layer: demoGridsLayer },
	{ id: 'btn_demo_icons',       label: 'Icons',       icon: 'star',              layer: demoIconsLayer },
	{ id: 'btn_demo_sprite_icon', label: 'Sprite Icon', icon: 'play',              layer: demoSpriteIconLayer },
	{ id: 'btn_demo_layout',      label: 'Cols / Rows', icon: 'bars',              layer: demoLayoutLayer },
	{ id: 'btn_demo_progress',    label: 'Progress',    icon: 'hourglassHalf',     layer: demoProgressLayer },
	{ id: 'btn_demo_text',        label: 'Text',        icon: 'pencil',            layer: demoTextLayer },
	{ id: 'btn_demo_toasts',      label: 'Toasts',      icon: 'bell',              layer: demoToastsLayer },
	{ id: 'btn_demo_toggle',      label: 'Toggle',      icon: 'sliders',           layer: demoToggleLayer },
])

/** Layouts sidebar — full example screens built from several components. */
export const demoLayoutsNavLayer = new DemoSidebarLayer('demo-nav-layouts', [
	{ id: 'btn_demo_timers',         label: 'Timers',          icon: 'stopwatch',     layer: demoTimersLayer },
	{ id: 'btn_demo_list',           label: 'Scoreboard',      icon: 'listUl',        layer: demoListLayer },
	{ id: 'btn_demo_match_summary',  label: 'Match Summary',   icon: 'trophy',        layer: demoMatchSummaryLayer },
	{ id: 'btn_demo_settings_menu',  label: 'Settings Menu',   icon: 'gear',          layer: demoSettingsMenuLayer },
	{ id: 'btn_demo_hotbars',        label: 'Hotbars & Inputs', icon: 'gamepad',      layer: demoHotbarsLayer },
	{ id: 'btn_demo_loading_screen', label: 'Loading Screen',  icon: 'hourglass',     layer: demoLoadingScreenLayer },
])

/**
 * Zones sidebar — one toggle per ZoneType preview overlay. Overlays are not
 * exclusive, so several can be compared at once; the last entry clears them.
 * Compact buttons so all 18 entries fit the RightTop slot.
 */
export const demoZonesNavLayer = new DemoSidebarLayer('demo-nav-zones', [
	...ZONE_PREVIEWS.map((zone): NavEntry => ({
		...zone,
		onClick: () => zone.layer.toggle(),
	})),
	{
		id     : 'btn_zone_hide_all',
		label  : 'Hide all',
		icon   : 'eyeSlash',
		onClick: () => hideAllZonePreviews(),
	},
], { buttonHeight: 38 })

type NavTab = {
	id     : string
	label  : string
	icon   : FaIconName
	sidebar: DemoSidebarLayer
}

const NAV_TABS: NavTab[] = [
	{ id: 'btn_nav_tab_components', label: 'Components', icon: 'puzzlePiece',  sidebar: demoComponentsNavLayer },
	{ id: 'btn_nav_tab_layouts',    label: 'Layouts',    icon: 'boxesStacked', sidebar: demoLayoutsNavLayer },
	{ id: 'btn_nav_tab_zones',      label: 'Zones',      icon: 'expand',       sidebar: demoZonesNavLayer },
]

const TAB_ICON_SIZE = 20

/** Every top-right tab button shares this width. */
const TAB_WIDTH = 160

/**
 * Extra right offset for the tab bar in a local preview (`npm start`), where
 * the explorer's dev tools sit in the top-right corner.
 */
const DEV_RIGHT_OFFSET = 160


// MARK: isLocalPreview
/** True when the scene runs in a local preview (RealmInfo.isPreview). */
function isLocalPreview(): boolean {
	return RealmInfo.getOrNull(engine.RootEntity)?.isPreview ?? false
}

/** Last sidebar the user opened — keyboard shortcut reopens it. */
let lastSidebar: DemoSidebarLayer = demoComponentsNavLayer


// MARK: openSidebar
/**
 * Shows `target` and hides the other sidebar. Clicking the tab of the open
 * sidebar closes it.
 */
export function toggleSidebar(target: DemoSidebarLayer) {
	for (const tab of NAV_TABS) {
		if (tab.sidebar !== target && isLayerShown(tab.sidebar)) {
			tab.sidebar.hide()
		}
	}
	lastSidebar = target
	target.toggle()
}


// MARK: toggleNav
/** Keyboard shortcut: closes any open sidebar, or reopens the last-used one. */
export function toggleNav() {
	const open = NAV_TABS.filter((tab) => isLayerShown(tab.sidebar))
	if (open.length > 0) {
		for (const tab of open) tab.sidebar.hide()
		return
	}
	toggleSidebar(lastSidebar)
}


// MARK: NavTabButton
/** Icon + label tab button. Tinted primary while `active`. */
function NavTabButton({
	id,
	label,
	icon,
	width,
	active,
	onClick,
}: {
	id     : string
	label  : string
	icon   : FaIconName
	width  : number
	active : boolean
	onClick: () => void
}) {
	const theme = getTheme()
	// ButtonText keeps its first backgroundColor per id — swap ids for the active fill.
	const btnId = active ? `${id}_active` : id

	return (
		<ButtonText
			key             = {btnId}
			id              = {btnId}
			width           = {width}
			callback        = {onClick}
			backgroundColor = {active ? theme.colors.primary : theme.colors.secondary}
			uiTransform     = {{ flexDirection: 'row' }}
			justifyContent  = "center"
			alignItems      = "center"
			uiText          = {{ value: '' }}
		>
			<Icon
				src       = {atlasIconsFontAwesome.source}
				uvs       = {atlasIconsFontAwesome.uv[icon]}
				width     = {TAB_ICON_SIZE}
				height    = {TAB_ICON_SIZE}
				iconColor = {theme.colors.light}
				margin    = {{ right: 8 }}
			/>
			<Text
				value     = {label}
				fontColor = {theme.colors.light}
				width     = "auto"
				alignSelf = "center"
				fontSize  = {theme.typography.size.default}
				textAlign = "middle-left"
				textWrap  = "nowrap"
			/>
		</ButtonText>
	)
}


// MARK: DemoNavTabsLayer
/** Always-visible top-right tab bar: Components / Layouts / Zones sidebar switches + Info panel toggle. */
export class DemoNavTabsLayer extends Layer {
	constructor() {
		super({
			id    : 'demo-nav-tabs',
			zone  : ZoneType.TopRight,
			zIndex: 1001,
			uiTransform: {
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Row
				key            = "demo_nav_tabs_shell"
				width          = "auto"
				height         = "auto"
				alignSelf      = "flex-start"
				alignItems     = "center"
				justifyContent = "flex-end"
				spacing        = {8}
				padding        = {{ top: 6, right: 6, bottom: 6, left: 6 }}
				margin         = {{ right: isLocalPreview() ? DEV_RIGHT_OFFSET : 0 }}
			>
				<Background
					key             = "demo_nav_tabs_chrome"
					backgroundColor = {alpha(theme.colors.body, 0.65)}
					borderRadius    = {theme.border.radiusDefault}
				/>
				{NAV_TABS.map((tab) => NavTabButton({
					id     : tab.id,
					label  : tab.label,
					icon   : tab.icon,
					width  : TAB_WIDTH,
					active : isLayerShown(tab.sidebar),
					onClick: () => toggleSidebar(tab.sidebar),
				}))}
				{NavTabButton({
					id     : 'btn_nav_tab_info',
					label  : 'Info',
					icon   : 'circleInfo',
					width  : TAB_WIDTH,
					active : isLayerShown(infoLayer),
					onClick: () => infoLayer.toggle(),
				})}
			</Row>
		)
	}
}

export const demoNavTabsLayer = new DemoNavTabsLayer()
