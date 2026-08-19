import ReactEcs from '@dcl/sdk/react-ecs'

import { resolveLayoutFontSize } from '../../utils/typography'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'
import { textBlockMinHeight } from './textLayout'
import { mergeTextShorthands, type TextShorthandProps } from './textShorthands'


export type CodeProps = Omit<UiBoxProps, 'uiText'> & TextShorthandProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Code
/**
 * Monospace / code text block. Pass copy via `value` (or `uiText.value`).
 * Prefer text shorthands (`value`, `fontColor`, `fontSize`, `font`, `textAlign`, `textWrap`)
 * over nesting `uiText`. Multiline strings use `\n` in a single `uiText`.
 */
export const Code = ({
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
}: CodeProps) => {
	const theme           = getTheme()
	const defaultFontSize = theme.typography.size.code
	const uiTextMerged    = mergeTextShorthands(
		{
			fontSize : defaultFontSize,
			font     : theme.typography.family.code,
			color    : theme.colors.light,
			textAlign: 'top-left',
			value    : '',
		},
		uiText,
		{ value, fontColor, fontSize: fontSizeProp, font, textAlign, textWrap },
	)
	const layoutFontSize = resolveLayoutFontSize(uiTextMerged.fontSize, defaultFontSize)

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : '100%',
				height    : 'auto',
				minHeight : textBlockMinHeight(layoutFontSize, uiTextMerged.value),
				alignSelf : 'flex-start',
				flexShrink: 0,
				...uiTransform,
			}}
			uiText={uiTextMerged}
		>
			{children}
		</UiBox>
	)
}
