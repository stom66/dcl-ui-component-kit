import ReactEcs from '@dcl/sdk/react-ecs'

import { resolveLayoutFontSize } from '../../utils/typography'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'
import { textMinHeight } from './textLayout'
import { mergeTextShorthands, type TextShorthandProps } from './textShorthands'


type HeaderLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type HeadingProps = Omit<UiBoxProps, 'uiText'> & TextShorthandProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Heading
/**
 * Shared H1–H6 renderer — theme size/family per level.
 * Prefer text shorthands (`value`, `fontColor`, `fontSize`, `font`, `textAlign`, `textWrap`)
 * over nesting `uiText`. Uses `flexShrink: 0` + `minHeight` so height-capped columns
 * cannot crush text (default Yoga `flexShrink: 1` was collapsing `height: 'auto'` boxes to 0).
 */
function Heading({
	level,
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
}: HeadingProps & { level: HeaderLevel }) {
	const theme           = getTheme()
	const defaultFontSize = theme.typography.size[level]
	const uiTextMerged    = mergeTextShorthands(
		{
			fontSize : defaultFontSize,
			font     : theme.typography.family[level],
			color    : theme.colors.light,
			textAlign: 'middle-left',
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
				minHeight : textMinHeight(layoutFontSize),
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


// MARK: H1
/** Theme `h1` heading. Pass copy via `value`; tint via `fontColor` or `uiText.color`. */
export function H1(props: HeadingProps) {
	return <Heading level="h1" {...props} />
}


// MARK: H2
/** Theme `h2` heading. Pass copy via `value`; tint via `fontColor` or `uiText.color`. */
export function H2(props: HeadingProps) {
	return <Heading level="h2" {...props} />
}


// MARK: H3
/** Theme `h3` heading. Pass copy via `value`; tint via `fontColor` or `uiText.color`. */
export function H3(props: HeadingProps) {
	return <Heading level="h3" {...props} />
}


// MARK: H4
/** Theme `h4` heading. Pass copy via `value`; tint via `fontColor` or `uiText.color`. */
export function H4(props: HeadingProps) {
	return <Heading level="h4" {...props} />
}


// MARK: H5
/** Theme `h5` heading. Pass copy via `value`; tint via `fontColor` or `uiText.color`. */
export function H5(props: HeadingProps) {
	return <Heading level="h5" {...props} />
}


// MARK: H6
/** Theme `h6` heading. Pass copy via `value`; tint via `fontColor` or `uiText.color`. */
export function H6(props: HeadingProps) {
	return <Heading level="h6" {...props} />
}
