import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize, type TextAlignType, type UiFontType, type UiTextWrapType } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSelfTransform, type ColSpanInput } from '../../utils'
import { UiBox, type UiBoxProps } from '../base'
import { textMinHeight } from '../text/textLayout'
import { mergeTextShorthands } from '../text/textShorthands'


type LabelProps = Omit<UiBoxProps, 'uiText'> & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value?      : string
	/**
	 * Label chip fill color (not font color). Defaults to `theme.colors.primary`.
	 * Overrides `backgroundColor` / `uiBackground.color`.
	 */
	color?      : Color4
	/** Base font size in theme px — auto-wrapped with `scaleFontSize`. */
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
 * `value` overrides `uiText.value`. `color` / `backgroundColor` / `uiBackground.color`
 * override the default primary **fill** (font color stays via `uiText.color`).
 * Prefer `fontSize` / `font` / `textAlign` / `textWrap` shorthands over nesting `uiText`.
 * Padding defaults to half of `radiusDefault` on all sides.
 */
export function Label({
	children,
	value,
	uiTransform,
	uiBackground,
	uiText,
	color,
	fontSize: fontSizeProp,
	font,
	textAlign,
	textWrap,
	cols,
	colsDesktop,
	colsMobile,
	...props
}: LabelProps) {
	const theme         = getTheme()
	const col           = getColSelfTransform(cols, colsDesktop, colsMobile)!
	const padding       = theme.border.radiusSmall
	const defaultFontSize = scaleFontSize(theme.typography.size.default)
	const uiTextMerged  = mergeTextShorthands(
		{
			fontSize : defaultFontSize,
			font     : theme.typography.family.default,
			color    : theme.colors.light,
			textAlign: 'middle-center',
			value    : '',
		},
		uiText,
		{ value, fontSize: fontSizeProp, font, textAlign, textWrap },
	)
	const fontSize = uiTextMerged.fontSize ?? defaultFontSize

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : 'auto',
				minHeight     : textMinHeight(typeof fontSize === 'number' ? fontSize : defaultFontSize),
				width         : col.width,
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
					top   : 0,
					right : padding,
					bottom: 0,
					left  : padding,
				},
				...uiTransform,
			}}
			uiBackground={{
				color: theme.colors.primary,
				...uiBackground,
				...(color !== undefined ? { color } : {}),
			}}
			uiText={uiTextMerged}
		>
			{children}
		</UiBox>
	)
}
