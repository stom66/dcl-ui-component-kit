import ReactEcs, { PositionUnit, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"

import { theme, alpha, lighten, darken } from '../../index'


// MARK: Divider
export const Divider = ({
	color     = theme.colors.body,
	margin    = { top: 10, bottom: 10, left: 0, right: 0 },
	thickness = 2,
	width     = '100%',
}: {
	color?    : Color4
	margin?   : { top?: number, bottom?: number, left?: number, right?: number }
	thickness?: number
	width?    : PositionUnit | "auto" | undefined
}) => {
	return (
		<UiEntity
			uiTransform={{
				width : width,
				height: thickness,
				margin: margin
			}}
			uiBackground={{
				color: color
			}}
		/>
	)
}
