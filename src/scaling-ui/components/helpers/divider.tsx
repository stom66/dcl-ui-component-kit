import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'


type DividerProps = UiBoxProps & {
	children? : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	color?    : Color4
	margin?   : { top?: number, bottom?: number, left?: number, right?: number }
	thickness?: number
	width?    : PositionUnit | "auto" | undefined
}

// MARK: Divider
export const Divider = ({
	children,
	color,
	margin    = { top: 10, bottom: 10, left: 0, right: 0 },
	thickness = 2,
	width     = '100%',
	uiBackground,
	uiTransform,
	...props
}: DividerProps) => {
	const theme         = getTheme()
	const dividerColor  = color ?? theme.colors.body

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : width,
				height: thickness,
				margin: margin,
				...uiTransform
			}}
			uiBackground={{
				...uiBackground,
				color: dividerColor
			}}
		>
			{children}
		</UiBox>
	)
}
