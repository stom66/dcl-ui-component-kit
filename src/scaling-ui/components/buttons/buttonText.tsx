import { Color4 } from '@dcl/sdk/math'
import { isDesktop, isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, scaleFontSize, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { resolveAspectDimensions } from '../../utils/aspect'
import { lighten } from '../../utils/colors'
import { easingFunctions, tweenValue } from '../../utils/tweens'

import { UiBox, type UiBoxProps } from '../base'


const hoverStates  : Map<string, boolean> = new Map()
const pressedStates: Map<string, boolean> = new Map()

type ButtonTextPropsState = {
	backgroundColor: Color4
}

const buttonProps = new Map<string, PropsController<ButtonTextPropsState>>()

type ButtonTextProps = Omit<UiBoxProps, 'uiTransform' | 'aspectRatio'> & {
	id           : string
	textLabel?   : string | undefined
	width?       : PositionUnit | 'auto' | undefined
	height?      : PositionUnit | 'auto' | undefined
	/** Width ÷ height. Defaults to `theme.buttons.aspectRatio` (2.6). */
	aspectRatio? : number
	textureSrc?  : string
	uiTransform? : UiTransformProps
	callback?    : () => void
	children?    : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: getButtonProps
/** Returns the per-button props controller, creating one if needed. */
function getButtonProps(
	id          : string,
	defaultColor: Color4
): PropsController<ButtonTextPropsState> {
	let props = buttonProps.get(id)
	if (!props) {
		props = new PropsController<ButtonTextPropsState>({ backgroundColor: defaultColor })
		buttonProps.set(id, props)
	}
	return props
}


// MARK: tweenBackgroundColor
/** Lerps the button background color toward `to` and stores it on the controller. */
function tweenBackgroundColor(
	button: PropsController<ButtonTextPropsState>,
	to    : Color4
) {
	const from = button.get('backgroundColor')
	tweenValue(0, 1, 0.2, (value) => {
		button.set('backgroundColor', Color4.lerp(from, to, value))
	}, undefined, easingFunctions.easeOutQuart)
}


// MARK: ButtonText
/**
 * Renders a text button with hover styling and an optional click callback.
 * Sizes from `theme.buttons` aspect ratio (default height 48, width = height × 2.6)
 * unless both axes are set. Pass one axis to derive the other.
 */
export const ButtonText = ({
	aspectRatio,
	backgroundColor,
	borderWidth,
	id,
	children,
	textLabel,
	width,
	height,
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
	const theme        = getTheme()
	const defaultColor = backgroundColor ?? theme.colors.primary
	const hoverColor   = lighten(defaultColor, 0.1)
	const button       = getButtonProps(id, defaultColor)
	const color        = button.get('backgroundColor')

	const size = resolveAspectDimensions({
		width        : width,
		height       : height,
		aspectRatio  : aspectRatio ?? theme.buttons.aspectRatio,
		defaultHeight: theme.buttons.heightDefault,
	})

	return (
		<UiBox
			{...props}
			backgroundColor = {color}
			borderWidth     = {borderWidth ?? theme.buttons.borderWidth}
			uiTransform     = {{
				width       : size.width,
				height      : size.height,
				//margin      : 4,
				borderRadius: scaleFontSize(theme.border.radiusSmall),
				alignItems  : 'center',
				justifyContent: 'center',
				...uiTransform
			}}
			uiText={{
				value   : textLabel ?? '',
				fontSize: scaleFontSize(theme.typography.size.default),
				...uiText
			}}
			uiBackground = {uiBackground}
			onMouseEnter = {() => {
				hoverStates.set(id, true)
				tweenBackgroundColor(button, hoverColor)
				onMouseEnter?.()
			}}
			onMouseLeave = {() => {
				hoverStates.set(id, false)
				tweenBackgroundColor(button, defaultColor)
				onMouseLeave?.()
			}}
			onMouseDown = {() => {
				pressedStates.set(id, true)
				onMouseDown?.()
			}}
			onMouseUp = {() => {
				if (isMobile() || (isDesktop() && hoverStates.get(id) === true)) {
					callback?.()
				}

				onMouseUp?.()
				pressedStates.set(id, false)
			}}
		>
			{children}
		</UiBox>
	)
}
