import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, ButtonText, Column, getTheme, Icon, Layer, Text, ZoneType } from '../../../ui-component-kit'

import { demoAnimationsLayer } from './demo.animations.layer'
import { demoBackgroundsLayer } from './demo.backgrounds.layer'
import { demoButtonsLayer } from './demo.buttons.layer'
import { demoGridsLayer } from './demo.grids.layer'
import { demoIconsLayer } from './demo.icons.layer'
import { demoLayoutLayer } from './demo.layout.layer'
import { demoListLayer } from './demo.list.layer'
import { demoProgressLayer } from './demo.progress.layer'
import { demoSafeZonesLayer, hideAllSafeZonePreviews } from './demo.safeZones.layer'
import { demoSpriteIconLayer } from './demo.spriteIcon.layer'
import { demoTextLayer } from './demo.text.layer'
import { demoToastsLayer } from './demo.toasts.layer'
import { demoToggleLayer } from './demo.toggle.layer'

type FaIconName = keyof typeof atlasIconsFontAwesome.uv

type NavEntry = {
	id   : string
	label: string
	icon : FaIconName
	layer: Layer
}

/** Content panels opened from the left nav — only one visible at a time. */
const DEMO_PANEL_LAYERS: Layer[] = [
	demoAnimationsLayer,
	demoBackgroundsLayer,
	demoButtonsLayer,
	demoGridsLayer,
	demoIconsLayer,
	demoSpriteIconLayer,
	demoLayoutLayer,
	demoListLayer,
	demoProgressLayer,
	demoSafeZonesLayer,
	demoTextLayer,
	demoToastsLayer,
	demoToggleLayer,
]


// MARK: toggleDemoPanel
/**
 * Toggles `target` and hides every other showcase demo panel.
 * Re-clicking the active panel closes it. Leaving Safe Zones also clears zone overlays.
 */
function toggleDemoPanel(target: Layer) {
	for (const layer of DEMO_PANEL_LAYERS) {
		if (layer === target) continue
		if (!layer.visibility.isHidden) layer.hide()
	}

	if (target !== demoSafeZonesLayer) {
		hideAllSafeZonePreviews()
	}

	target.toggle()
}

const NAV_ENTRIES: NavEntry[] = [
	{ id: 'btn_demo_animations',  label: 'Animations',  icon: 'wandMagicSparkles', layer: demoAnimationsLayer },
	{ id: 'btn_demo_backgrounds', label: 'Backgrounds', icon: 'image',             layer: demoBackgroundsLayer },
	{ id: 'btn_demo_buttons',     label: 'Buttons',     icon: 'handPointer',       layer: demoButtonsLayer },
	{ id: 'btn_demo_grids',       label: 'Grids',       icon: 'cubes',             layer: demoGridsLayer },
	{ id: 'btn_demo_icons',       label: 'Icons',       icon: 'star',              layer: demoIconsLayer },
	{ id: 'btn_demo_sprite_icon', label: 'Sprite Icon', icon: 'play',              layer: demoSpriteIconLayer },
	{ id: 'btn_demo_layout',      label: 'Cols / Rows', icon: 'bars',              layer: demoLayoutLayer },
	{ id: 'btn_demo_list',        label: 'List',        icon: 'listUl',            layer: demoListLayer },
	{ id: 'btn_demo_progress',    label: 'Progress',    icon: 'hourglassHalf',     layer: demoProgressLayer },
	{ id: 'btn_demo_safe_zones',  label: 'Safe Zones',  icon: 'expand',            layer: demoSafeZonesLayer },
	{ id: 'btn_demo_text',        label: 'Text',        icon: 'pencil',            layer: demoTextLayer },
	{ id: 'btn_demo_toasts',      label: 'Toasts',      icon: 'bell',              layer: demoToastsLayer },
	{ id: 'btn_demo_toggle',      label: 'Toggle',      icon: 'sliders',           layer: demoToggleLayer },
]

const NAV_ICON_SIZE = 22

/** Showcase nav panel width (this layer only — does not change ZoneType.Left). */
const NAV_BAR_WIDTH = 270


// MARK: DemoNavButton
/** Left-aligned text button with a Font Awesome icon for the showcase nav. */
function DemoNavButton({ id, label, icon, layer }: NavEntry) {
	const theme = getTheme()

	return (
		<ButtonText
			key            = {id}
			id             = {id}
			cols           = {12}
			callback       = {() => toggleDemoPanel(layer)}
			uiTransform    = {{ flexDirection: 'row' }}
			justifyContent = "flex-start"
			alignItems     = "center"
			padding        = {{ left: 10, right: 12 }}
			uiText         = {{ value: '' }}
		>
			<Icon
				uvs    = {atlasIconsFontAwesome.uv[icon]}
				width  = {NAV_ICON_SIZE}
				height = {NAV_ICON_SIZE}
				color  = {theme.colors.light}
				margin = {{ right: 10 }}
			/>
			<Text
				value     = {label}
				color     = {theme.colors.light}
				width     = "auto"
				alignSelf = "center"
				fontSize  = {theme.typography.size.default}
				textAlign = "middle-left"
			/>
		</ButtonText>
	)
}


// MARK: DemoLeftBarLayer
/**
 * Always-visible left sidebar: exclusive toggle buttons for each demo content layer.
 */
export class DemoLeftBarLayer extends Layer {
	constructor() {
		super({
			id    : 'demo-left-bar',
			zone  : ZoneType.Left,
			zIndex: 1000,
			uiTransform: {
				alignItems    : 'stretch',
				justifyContent: 'flex-start',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background
				color          = {alpha(theme.colors.body, 0.65)}
				borderRadius   = {theme.border.radiusDefault}
				alignSelf      = "flex-start"
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 8, right: 8, bottom: 8, left: 8 }}
				zIndex         = {1000}
				uiTransform    = {{
					// In-flow panel inside the Left zone (preset stays 25%).
					// Do NOT pin left+right (Background's default absolute fill does) —
					// that stretches to the full zone and ignores maxWidth.
					positionType: 'relative',
					position    : { top: 0, bottom: 0, left: 0 },
					width       : '100%',
					maxWidth    : NAV_BAR_WIDTH,
					height      : '100%',
				}}
			>
				<Column
					cols           = {12}
					height         = "auto"
					alignItems     = "stretch"
					justifyContent = "flex-start"
				>
					{NAV_ENTRIES.map((entry) => (
						DemoNavButton(entry)
					))}
				</Column>
			</Background>
		)
	}
}

export const demoLeftBarLayer = new DemoLeftBarLayer()
