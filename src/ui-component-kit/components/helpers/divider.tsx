import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, type UiTransformProps } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { alpha } from '../../utils/colors'
import { UiBox, type UiBoxProps } from '../base'


type DividerMargin = {
	top?   : number
	bottom?: number
	left?  : number
	right? : number
}

type DividerProps = Omit<UiBoxProps, 'margin' | 'color' | 'width' | 'uiTransform'> & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Line fill color. Defaults to `theme.colors.light` at 0.5 alpha. */
	color?      : Color4
	margin?     : DividerMargin
	thickness?  : number
	width?      : PositionUnit | 'auto' | undefined
	uiTransform?: UiTransformProps
}


// MARK: Divider
/** Horizontal rule. Prefer `color` / `margin` / `thickness` / `width` shorthands. */
export const Divider = ({
	children,
	color,
	margin    = { top: 10, bottom: 10, left: 0, right: 0 },
	thickness = 5,
	width     = '100%',
	uiBackground,
	uiTransform,
	...props
}: DividerProps) => {
	const theme        = getTheme()
	const dividerColor = color ?? alpha(theme.colors.light, 0.25)

	const transform: UiTransformProps = {
		width,
		height      : thickness,
		margin,
		borderRadius: thickness / 2,
		flexShrink  : 0,
		flexGrow    : 0,
		...uiTransform,
	}

	return (
		<UiBox
			{...props}
			uiTransform  = {transform}
			uiBackground = {{
				...uiBackground,
				color: dividerColor,
			}}
		>
			{children}
		</UiBox>
	)
}
