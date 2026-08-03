import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, ButtonText, Column } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { alpha } from '../../utils/colors'

import { demoAnimationsLayer } from './demo.animations.layer'
import { demoBackgroundsLayer } from './demo.backgrounds.layer'
import { demoButtonsLayer } from './demo.buttons.layer'
import { demoIconsLayer } from './demo.icons.layer'
import { demoListLayer } from './demo.list.layer'
import { demoProgressLayer } from './demo.progress.layer'
import { demoTextLayer } from './demo.text.layer'
import { demoToastsLayer } from './demo.toasts.layer'


// MARK: DemoLeftBarLayer
/**
 * Always-visible left sidebar: toggle buttons for each demo content layer.
 */
export class DemoLeftBarLayer extends Layer {
	constructor() {
		super({
			id  : 'demo-left-bar',
			zone: ZoneType.Left,
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
				backgroundColor = {alpha(theme.colors.body, 0.65)}
				borderRadius    = {theme.border.radiusDefault}
				uiTransform={{
					// Relative + auto so the zone can shrink-wrap content
					// (absolute edge insets do not contribute to parent width).
					positionType  : 'relative',
					position      : { top: 0, right: 0, bottom: 0, left: 0 },
					width         : 'auto',
					height        : '100%',
					alignItems    : 'stretch',
					justifyContent: 'flex-start',
					padding       : { top: 8, right: 8, bottom: 8, left: 8 },
					zIndex        : 1000,
				}}
			>
				<Column
					uiTransform={{
						width         : 'auto',
						height        : 'auto',
						alignItems    : 'stretch',
						justifyContent: 'flex-start',
					}}
				>
					<ButtonText
						key       = "btn_demo_animations"
						id        = "btn_demo_animations"
						textLabel = "Animations"
						cols      = {12}
						callback  = {() => demoAnimationsLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_backgrounds"
						id        = "btn_demo_backgrounds"
						textLabel = "Backgrounds"
						cols      = {12}
						callback  = {() => demoBackgroundsLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_buttons"
						id        = "btn_demo_buttons"
						textLabel = "Buttons"
						cols      = {12}
						callback  = {() => demoButtonsLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_icons"
						id        = "btn_demo_icons"
						textLabel = "Icons"
						cols      = {12}
						callback  = {() => demoIconsLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_list"
						id        = "btn_demo_list"
						textLabel = "List"
						cols      = {12}
						callback  = {() => demoListLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_progress"
						id        = "btn_demo_progress"
						textLabel = "Progress"
						cols      = {12}
						callback  = {() => demoProgressLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_text"
						id        = "btn_demo_text"
						textLabel = "Text"
						cols      = {12}
						callback  = {() => demoTextLayer.toggle()}
					/>
					<ButtonText
						key       = "btn_demo_toasts"
						id        = "btn_demo_toasts"
						textLabel = "Toasts"
						cols      = {12}
						callback  = {() => demoToastsLayer.toggle()}
					/>
				</Column>
			</Background>
		)
	}
}

export const demoLeftBarLayer = new DemoLeftBarLayer()
