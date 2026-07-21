import { Color4 } from "@dcl/sdk/math"
import { isDesktop, isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiTransformProps} from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'
import { getTheme } from 'src/scaling-ui/styles'
import { darken, lighten } from 'src/scaling-ui/utils/colors'



// MARK: Vars
const hoverStates  : Map<string, boolean> = new Map()
const pressedStates: Map<string, boolean> = new Map()

type ButtonTextProps = Omit<UiBoxProps, 'key' | 'uiTransform'> & {
	key         : string
	textLabel   : string
	width      ?: PositionUnit | "auto" | undefined
	height     ?: PositionUnit | "auto" | undefined
	textureSrc ?: string
	borderWidth?: number
	borderColor?: Color4
	uiTransform?: UiTransformProps
	callback   ?: () => void
	children?  : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}

// MARK: ButtonText
/**
 * Renders a text button with hover styling and an optional click callback.
 */
export const ButtonText = ({
	backgroundColor,
	key,
	children,
	textLabel   = "Button text", 
	width       = "100%", 
	height      = 64,
	borderWidth = 2,
	borderColor,
	uiTransform,
	callback,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	onMouseUp,
	uiBackground,
	uiText,
	...props
}: ButtonTextProps) => {
	const theme               = getTheme()
	const resolvedBorderColor = borderColor ?? theme.colors.primary

	return (
		<UiBox
			{...props}
			backgroundColor = {backgroundColor}
			key         = {key}
			uiTransform = {{
				width       : width,
				height      : height,
				margin      : 4,
				borderRadius: 4,
				borderColor : hoverStates.get(key) ? lighten(resolvedBorderColor, 0.1) : darken(resolvedBorderColor, 0.1),
				borderWidth : borderWidth,
				...uiTransform
			}}
			uiText      = {{
				value   : textLabel,
				fontSize: theme.typography.size.default,
				...uiText
			}}
			onMouseEnter = {() => { 
				hoverStates.set(key, true)
				onMouseEnter?.()
			}}
			onMouseLeave = {() => { 
				hoverStates.set(key, false)
				onMouseLeave?.()
			}}
			onMouseDown  = {() => { 
				pressedStates.set(key, true)
				onMouseDown?.()
			}}
			onMouseUp    = {() => { 
				if (isMobile() || (isDesktop() && hoverStates.get(key) === true)) {
					callback?.()
				} 

				onMouseUp?.()

				pressedStates.set(key, false)
			}}
			uiBackground = {{ 
				...uiBackground,
				color: resolvedBorderColor
			}}
		/>
	)
}


