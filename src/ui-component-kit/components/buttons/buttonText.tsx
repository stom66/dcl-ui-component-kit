import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiTransformProps, UiEntity } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { getColSelfTransform, getColSpan, type ColSpanInput } from '../../utils'
import { resolveAspectDimensions } from '../../utils/aspect'
import { darken, lighten } from '../../utils/colors'
import { easingFunctions, tweenValue } from '../../utils/tweens'
import { type KitEntityProps, resolveKitEntityProps } from '../base'
import { mergeTextShorthands, type TextShorthandProps } from '../text/textShorthands'


const hoverStates    : Map<string, boolean> = new Map()
const pressedStates  : Map<string, boolean> = new Map()
const colorTweenToken: Map<string, number>  = new Map()

type ButtonTextPropsState = {
	backgroundColor: Color4
}

const buttonProps = new Map<string, PropsController<ButtonTextPropsState>>()

type ButtonTextProps = Omit<KitEntityProps, 'uiTransform' | 'aspectRatio' | 'uiText'> & Pick<TextShorthandProps, 'fontSize' | 'fontColor' | 'font' | 'fontSrc' | 'textAlign' | 'textWrap'> & {
	id           : string
	textLabel?   : string | undefined
	width?       : PositionUnit | 'auto' | undefined
	height?      : PositionUnit | 'auto' | undefined
	/** 12-column grid span, or `'auto'` to fill leftover row space. Prefer over `%` widths. */
	cols?        : ColSpanInput
	colsDesktop? : ColSpanInput
	colsMobile?  : ColSpanInput
	/** Width ÷ height. Defaults to `theme.buttons.aspectRatio` (2.6). */
	aspectRatio? : number
	textureSrc?  : string
	uiTransform? : UiTransformProps
	uiText?      : NonNullable<KitEntityProps['uiText']>
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


// MARK: nextColorTween
/** Bumps the color-tween token so an in-flight lerp stops writing this button. */
function nextColorTween(id: string): number {
	const token = (colorTweenToken.get(id) ?? 0) + 1
	colorTweenToken.set(id, token)
	return token
}


// MARK: tweenBackgroundColor
/** Lerps the button background color toward `to` and stores it on the controller. */
function tweenBackgroundColor(
	id    : string,
	button: PropsController<ButtonTextPropsState>,
	to    : Color4,
) {
	const token = nextColorTween(id)
	const from  = button.get('backgroundColor')
	tweenValue(0, 1, 0.2, (value) => {
		if (colorTweenToken.get(id) !== token) return
		button.set('backgroundColor', Color4.lerp(from, to, value))
	}, undefined, easingFunctions.easeOutQuart)
}


// MARK: setBackgroundColor
/** Snaps the background color and cancels any in-flight color tween. */
function setBackgroundColor(
	id    : string,
	button: PropsController<ButtonTextPropsState>,
	color : Color4,
) {
	nextColorTween(id)
	button.set('backgroundColor', color)
}


// MARK: ButtonText
/**
 * Renders a text button with hover and press styling and an optional click callback.
 * Sizes from `theme.buttons` aspect ratio (default height 48, width = height × 2.6)
 * unless both axes are set. Pass one axis to derive the other.
 * Prefer `cols` for grid widths (`cols={12}` = full parent width).
 * `fontSize` is theme-base px — prefer `theme.typography.size.*`; the kit scales it.
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
	cols,
	colsDesktop,
	colsMobile,
	uiTransform,
	callback,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	onMouseUp,
	uiBackground,
	uiText,
	fontSize: fontSizeProp,
	fontColor,
	font,
	fontSrc,
	textAlign,
	textWrap,
	...props
}: ButtonTextProps) => {
	const theme        = getTheme()
	const defaultColor = backgroundColor ?? theme.colors.primary
	const hoverColor   = lighten(defaultColor, 0.1)
	const pressedColor = darken(defaultColor, 0.1)
	const button       = getButtonProps(id, defaultColor)
	const color        = button.get('backgroundColor')
	const col          = getColSelfTransform(cols, colsDesktop, colsMobile)!
	const span         = getColSpan(cols, colsDesktop, colsMobile)
	const colCount     = theme.cols.COL_COUNT
	// Partial sticky `%` / auto-fill use col sizing; full / omitted keep aspect-ratio sizing.
	const useColWidth  = col.flexGrow > 0 || (span !== undefined && span < colCount)

	const size = useColWidth
		? {
			width : col.width,
			height: height ?? theme.buttons.heightDefault,
		}
		: resolveAspectDimensions({
			width        : col.width !== 'auto' ? col.width : width,
			height       : height,
			aspectRatio  : aspectRatio ?? theme.buttons.aspectRatio,
			defaultHeight: theme.buttons.heightDefault,
		})

	return (
		<UiEntity
			{...resolveKitEntityProps({
				...props,
				backgroundColor: color,
				borderWidth: borderWidth ?? theme.buttons.borderWidth,
				uiTransform: {
					width         : size.width,
					height        : size.height,
					flexGrow      : useColWidth ? col.flexGrow : 0,
					flexShrink    : useColWidth ? col.flexShrink : 0,
					flexBasis     : useColWidth ? col.flexBasis : undefined,
					maxWidth      : useColWidth ? col.maxWidth : undefined,
					borderRadius  : theme.border.radiusSmall,
					alignItems    : 'center',
					justifyContent: 'center',
					...uiTransform
				},
				uiText: mergeTextShorthands(
					{
						value   : textLabel ?? '',
						fontSize: theme.typography.size.default,
						font    : theme.typography.family.default,
						textWrap: 'nowrap',
					},
					uiText,
					{ fontSize: fontSizeProp, fontColor, font, fontSrc, textAlign, textWrap, value: textLabel },
				),
				uiBackground,
				pointerFilter: 'block',
				onMouseEnter: () => {
					hoverStates.set(id, true)
					if (pressedStates.get(id) === true) {
						setBackgroundColor(id, button, pressedColor)
					} else {
						tweenBackgroundColor(id, button, hoverColor)
					}
					onMouseEnter?.()
				},
				onMouseLeave: () => {
					hoverStates.set(id, false)
					pressedStates.set(id, false)
					tweenBackgroundColor(id, button, defaultColor)
					onMouseLeave?.()
				},
				onMouseDown: () => {
					pressedStates.set(id, true)
					setBackgroundColor(id, button, pressedColor)
					onMouseDown?.()
					if (isMobile()) callback?.()
				},
				onMouseUp: () => {
					if (!isMobile()) callback?.()

					onMouseUp?.()
					pressedStates.set(id, false)
					tweenBackgroundColor(
						id,
						button,
						hoverStates.get(id) === true ? hoverColor : defaultColor,
					)
				},
			})}
		>
			{children}
		</UiEntity>
	)
}
