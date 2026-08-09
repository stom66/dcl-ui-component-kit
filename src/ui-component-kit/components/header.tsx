import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { getTheme } from '../styles'
import { UiBox, type UiBoxProps } from './base'
import { textMinHeight } from './text/textLayout'
import { mergeTextShorthands, type TextShorthandProps } from './text/textShorthands'


export type HeaderProps = Omit<UiBoxProps, 'uiText'> & TextShorthandProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Header
/**
 * Simple panel title line (h2-sized). Pass copy via `value`; tint via `fontColor`.
 * Prefer text shorthands over nesting `uiText`.
 */
export const Header = ({
	children,
	value,
	fontColor,
	fontSize: fontSizeProp,
	font,
	textAlign,
	textWrap,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme           = getTheme()
	const defaultFontSize = scaleFontSize(theme.typography.size.h2)
	const uiTextMerged    = mergeTextShorthands(
		{
			fontSize : defaultFontSize,
			color    : theme.colors.light,
			textAlign: 'middle-left',
			value    : '',
		},
		uiText,
		{ value, fontColor, fontSize: fontSizeProp, font, textAlign, textWrap },
	)
	const fontSize = uiTextMerged.fontSize ?? defaultFontSize

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : '100%',
				height    : 'auto',
				minHeight : textMinHeight(typeof fontSize === 'number' ? fontSize : defaultFontSize),
				alignSelf : 'flex-start',
				flexShrink: 0,
				padding   : { top: 10, bottom: 5 },
				...uiTransform,
			}}
			uiText={uiTextMerged}
		>
			{children}
		</UiBox>
	)
}
