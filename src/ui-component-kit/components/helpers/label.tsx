import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { type TextAlignType, type UiFontType, type UiTextWrapType } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSelfTransform, type ColSpanInput } from '../../utils'
import { resolveLayoutFontSize } from '../../utils/typography'
import { UiBox, type UiBoxProps } from '../base'
import { asPixelNumber, textBlockMinHeight, textLineCount, textWrappedLineCount } from '../text/textLayout'
import { mergeTextShorthands } from '../text/textShorthands'


type LabelProps = Omit<UiBoxProps, 'uiText'> & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value?      : string
	/** Font tint. Prefer this over nesting `uiText.color`. */
	fontColor?  : Color4
	/** Theme-base font size in px — prefer `theme.typography.size.*`. Auto-scaled by `UiBox`. */
	fontSize?   : number
	font?       : UiFontType
	textAlign?  : TextAlignType
	textWrap?   : UiTextWrapType
	cols?       : ColSpanInput
	colsDesktop?: ColSpanInput
	colsMobile? : ColSpanInput
	uiText?     : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Label
/**
 * Text label with a primary background fill and optional child content.
 *
 * `uiTransform` / `uiBackground` / `uiText` are optional and merge over defaults.
 * `value` overrides `uiText.value`. `backgroundColor` / `uiBackground.color`
 * override the default primary **fill**. Use `fontColor` (or `uiText.color`) for font tint.
 * Prefer `fontSize` / `font` / `textAlign` / `textWrap` / `fontColor` shorthands over nesting `uiText`.
 * Multiline copy (`\n` and soft-wrap when width is a known px size) grows `minHeight`
 * so the chip expands with the text. Prefer a numeric `width` for wrapped captions.
 */
export function Label({
	children,
	value,
	uiTransform,
	uiBackground,
	uiText,
	backgroundColor,
	fontColor,
	fontSize: fontSizeProp,
	font,
	textAlign,
	textWrap,
	cols,
	colsDesktop,
	colsMobile,
	width,
	height,
	...props
}: LabelProps) {
	const theme           = getTheme()
	const col             = getColSelfTransform(cols, colsDesktop, colsMobile)!
	const padding         = theme.border.radiusSmall
	const defaultFontSize = theme.typography.size.default
	const uiTextMerged    = mergeTextShorthands(
		{
			fontSize : defaultFontSize,
			font     : theme.typography.family.default,
			color    : theme.colors.light,
			textAlign: 'middle-center',
			value    : '',
		},
		uiText,
		{ value, fontColor, fontSize: fontSizeProp, font, textAlign, textWrap },
	)
	const layoutFontSize = resolveLayoutFontSize(uiTextMerged.fontSize, defaultFontSize)
	const fill           = backgroundColor ?? theme.colors.primary
	const pixelWidth     = asPixelNumber(width) ?? asPixelNumber(uiTransform?.width as typeof width)
	const contentWidth   = pixelWidth !== undefined
		? Math.max(0, pixelWidth - padding * 2)
		: undefined
	const canSoftWrap    = uiTextMerged.textWrap !== 'nowrap' && contentWidth !== undefined
	const lines          = canSoftWrap
		? textWrappedLineCount(uiTextMerged.value, layoutFontSize, contentWidth)
		: textLineCount(uiTextMerged.value)
	const padY           = lines > 1 ? padding : 0
	const minHeight      = height === undefined
		? textBlockMinHeight(
			layoutFontSize,
			uiTextMerged.value,
			canSoftWrap ? contentWidth : undefined,
		) + padY * 2
		: undefined

	return (
		<UiBox
			{...props}
			width={width}
			height={height}
			backgroundColor={fill}
			uiTransform={{
				height        : height ?? 'auto',
				minHeight,
				width         : width ?? col.width,
				display       : 'flex',
				flexGrow      : col.flexGrow,
				flexShrink    : 0,
				flexBasis     : col.flexBasis,
				maxWidth      : col.maxWidth,
				flexDirection : 'row',
				alignSelf     : 'flex-start',
				alignItems    : 'center',
				justifyContent: 'space-between',
				borderRadius  : theme.border.radiusSmall,
				borderWidth   : 0,
				padding       : {
					top   : padY,
					right : padding,
					bottom: padY,
					left  : padding,
				},
				...uiTransform,
			}}
			uiBackground={{
				...uiBackground,
				color: fill,
			}}
			uiText={uiTextMerged}
		>
			{children}
		</UiBox>
	)
}
