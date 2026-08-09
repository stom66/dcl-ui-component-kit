import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'
import { textMinHeight } from './textLayout'
import { mergeTextShorthands, type TextShorthandProps } from './textShorthands'


export type TextProps = Omit<UiBoxProps, 'uiText'> & TextShorthandProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Text
/**
 * Default body text block. Pass copy via `value` (or `uiText.value`); nest element children as needed.
 *
 * Prefer text shorthands (`value`, `fontColor`, `fontSize`, `font`, `textAlign`, `textWrap`)
 * over nesting `uiText`. `fontSize` takes a theme base px number and is auto-scaled.
 *
 * Layout notes (DCL / Yoga):
 * - `alignSelf: 'flex-start'` so `height: 'auto'` can measure text (not `stretch`)
 * - `flexShrink: 0` so a height-capped parent `Column` cannot crush the box to 0
 * - `minHeight` one-line floor only — wrap height comes from `height: 'auto'`
 * - `width: '100%'` for wrap width inside sized columns (prefer nesting under
 *   `Column`/`cols`, not as a direct `Row` `cols` child with `width: 0`)
 */
export const Text = ({
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
}: TextProps) => {
	const theme          = getTheme()
	const defaultFontSize = scaleFontSize(theme.typography.size.default)
	const uiTextMerged   = mergeTextShorthands(
		{
			fontSize : defaultFontSize,
			font     : theme.typography.family.default,
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
				...uiTransform,
			}}
			uiText={uiTextMerged}
		>
			{children}
		</UiBox>
	)
}
