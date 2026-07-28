import { Color4 } from '@dcl/sdk/math'
import { isDesktop, isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, scaleFontSize, UiTransformProps } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'
import { darken, lighten } from '../../utils/colors'


const hoverStates  : Map<string, boolean> = new Map()
const pressedStates: Map<string, boolean> = new Map()

type ButtonTextProps = Omit<UiBoxProps, 'uiTransform'> & {
	id          : string
	textLabel   : string
	width      ?: PositionUnit | 'auto' | undefined
	height     ?: PositionUnit | 'auto' | undefined
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
	id,
	children,
	textLabel   = 'Button text',
	width       = '100%',
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
			backgroundColor={backgroundColor}
			uiTransform={{
				width       : width,
				height      : height,
				margin      : 4,
				borderRadius: 4,
				borderColor : hoverStates.get(id)
					? lighten(resolvedBorderColor, 0.1)
					: darken(resolvedBorderColor, 0.1),
				borderWidth : borderWidth,
				...uiTransform
			}}
			uiText={{
				value   : textLabel,
				fontSize: scaleFontSize(theme.typography.size.default),
				...uiText
			}}
			onMouseEnter={() => {
				hoverStates.set(id, true)
				onMouseEnter?.()
			}}
			onMouseLeave={() => {
				hoverStates.set(id, false)
				onMouseLeave?.()
			}}
			onMouseDown={() => {
				pressedStates.set(id, true)
				onMouseDown?.()
			}}
			onMouseUp={() => {
				if (isMobile() || (isDesktop() && hoverStates.get(id) === true)) {
					callback?.()
				}

				onMouseUp?.()
				pressedStates.set(id, false)
			}}
			uiBackground={{
				...uiBackground,
				color: resolvedBorderColor
			}}
		>
			{children}
		</UiBox>
	)
}
