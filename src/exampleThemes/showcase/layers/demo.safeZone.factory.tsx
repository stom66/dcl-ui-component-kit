import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, Background, getTheme, Layer, Text, UiBox, ZoneType, type Theme } from '../../../ui-component-kit'

/** Stack order for zone preview overlays — below info / nav / control panels. */
export const DEMO_SAFE_ZONE_Z_INDEX = 0


export type CreateSafeZoneDemoLayerOptions = {
	/** Override layer stack order (e.g. temporary BottomRight test above info HUD). */
	zIndex?: number
}


// MARK: DemoChildBox
/** Compact labelled chip used to show multi-child flow inside a zone. */
const DEMO_CHILD_MARGIN = { top: 8, right: 8, bottom: 8, left: 8 }

function DemoChildBox({
	id,
	label,
	fill,
	theme,
}: {
	id   : string
	label: string
	fill : Color4
	theme: Theme
}) {
	return (
		<UiBox
			key            = {id}
			backgroundColor          = {fill}
			borderColor    = {theme.colors.dark}
			borderRadius   = {theme.border.radiusSmall}
			borderWidth    = {1}
			width          = "auto"
			height         = "auto"
			margin         = {DEMO_CHILD_MARGIN}
			padding        = {{ top: 10, right: 14, bottom: 10, left: 14 }}
			alignItems     = "center"
			justifyContent = "center"
		>
			<Text
				value     = {label}
				width     = "auto"
				alignSelf = "center"
				fontSize  = {theme.typography.size.h3}
				textAlign = "middle-center"
			/>
		</UiBox>
	)
}


// MARK: createSafeZoneDemoLayer
/**
 * Builds a hideable showcase layer for one ZoneType: a translucent primary fill
 * shows the zone bounds; three labelled boxes float per the zone's flex
 * alignment so multi-child flow is obvious.
 */
export function createSafeZoneDemoLayer(
	id     : string,
	zone   : ZoneType,
	label  : string,
	options: CreateSafeZoneDemoLayerOptions = {},
): Layer {
	class SafeZoneDemoLayer extends Layer {
		constructor() {
			super({
				id,
				zone,
				canBeHidden: true,
				startHidden: true,
				zIndex     : options.zIndex ?? DEMO_SAFE_ZONE_Z_INDEX,
			})
		}


		// MARK: body
		protected body() {
			const theme = getTheme()

			return [
				<Background
					key          = {`${id}_bounds`}
					backgroundColor        = {alpha(theme.colors.primary, 0.35)}
					borderColor  = {theme.colors.dark}
					borderRadius = {0}
					borderWidth  = {1}
				/>,
				<DemoChildBox
					id    = {`${id}_child_1`}
					label = {label}
					fill  = {theme.colors.primary}
					theme = {theme}
				/>,
				<DemoChildBox
					id    = {`${id}_child_2`}
					label = "second child"
					fill  = {alpha(theme.colors.body, 0.1)}
					theme = {theme}
				/>,
				<DemoChildBox
					id    = {`${id}_child_3`}
					label = "third child"
					fill  = {alpha(theme.colors.body, 0.1)}
					theme = {theme}
				/>,
			]
		}
	}

	return new SafeZoneDemoLayer()
}
