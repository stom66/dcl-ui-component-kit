import { Color4 } from "@dcl/sdk/math"
import ReactEcs, { Button, PositionUnit, UiTransformProps} from '@dcl/sdk/react-ecs'

import { darken, lighten, theme } from '../../index'



// MARK: Vars
const hoverStates  : Map<string, Boolean>   = new Map()
const pressedStates: Map<string, Boolean>   = new Map()

// MARK: ButtonText
/**
 * Renders a text button with hover styling and an optional click callback.
 */
export const ButtonText = ({
	key,
	textLabel   = "Button text", 
	width       = "100%", 
	height      = 64,
	borderWidth = 2,
	borderColor = theme.colors.primary,
	uiTransform,
	callback 
}: {
	key         : string,
	textLabel   : string,
	width      ?: PositionUnit | "auto" | undefined, 
	height     ?: PositionUnit | "auto" | undefined, 
	textureSrc ?: string,
	borderWidth?: number,
	borderColor?: Color4,
	uiTransform?: UiTransformProps,
	callback   ?: () => void 
}) => {
	return (
		<Button
			key         = {key}
			uiTransform = {{
				width       : width,
				height      : height,
				margin      : 4,
				borderRadius: 4,
				borderColor : hoverStates.get(key) ? lighten(borderColor, 0.1) : darken(borderColor, 0.1),
				borderWidth : borderWidth,
				...uiTransform
			}}
			value        = {textLabel}
			fontSize     = {14}
			onMouseEnter = {() => { 
				hoverStates.set(key, true)
			}}
			onMouseLeave = {() => { 
				hoverStates.set(key, false)
			}}
			onMouseDown  = {() => { 
				pressedStates.set(key, true)
			}}
			onMouseUp    = {() => { 
				pressedStates.set(key, false)

				if (hoverStates.get(key) === true) {
					callback?.()
				}
			}}
			uiBackground = {{ 
				color: borderColor 
			}}
		/>
	)
}


