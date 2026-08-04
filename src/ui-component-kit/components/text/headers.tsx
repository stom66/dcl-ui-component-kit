import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'
import { textMinHeight } from './textLayout'


type HeaderLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type HeadingProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Heading copy. Prefer this over JSX text children (DCL `uiText` needs `value`). */
	value?  : string
	/** Font color. Defaults to `theme.colors.light`. Overrides `uiText.color`. */
	color?  : Color4
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Heading
/**
 * Shared H1–H6 renderer — theme size/family per level, optional `color` shorthand.
 * Uses `flexShrink: 0` + `minHeight` so height-capped columns cannot crush text
 * (default Yoga `flexShrink: 1` was collapsing `height: 'auto'` boxes to 0).
 */
function Heading({
	level,
	children,
	value,
	color,
	uiText,
	uiTransform,
	...props
}: HeadingProps & { level: HeaderLevel }) {
	const theme    = getTheme()
	const fontSize = scaleFontSize(theme.typography.size[level])

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : '100%',
				height    : 'auto',
				minHeight : textMinHeight(fontSize),
				alignSelf : 'flex-start',
				flexShrink: 0,
				...uiTransform,
			}}
			uiText={{
				fontSize,
				font     : theme.typography.family[level],
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				...(color !== undefined ? { color } : {}),
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}


// MARK: H1
/** Theme `h1` heading. Pass copy via `value`; tint via `color` or `uiText.color`. */
export function H1(props: HeadingProps) {
	return <Heading level="h1" {...props} />
}


// MARK: H2
/** Theme `h2` heading. Pass copy via `value`; tint via `color` or `uiText.color`. */
export function H2(props: HeadingProps) {
	return <Heading level="h2" {...props} />
}


// MARK: H3
/** Theme `h3` heading. Pass copy via `value`; tint via `color` or `uiText.color`. */
export function H3(props: HeadingProps) {
	return <Heading level="h3" {...props} />
}


// MARK: H4
/** Theme `h4` heading. Pass copy via `value`; tint via `color` or `uiText.color`. */
export function H4(props: HeadingProps) {
	return <Heading level="h4" {...props} />
}


// MARK: H5
/** Theme `h5` heading. Pass copy via `value`; tint via `color` or `uiText.color`. */
export function H5(props: HeadingProps) {
	return <Heading level="h5" {...props} />
}


// MARK: H6
/** Theme `h6` heading. Pass copy via `value`; tint via `color` or `uiText.color`. */
export function H6(props: HeadingProps) {
	return <Heading level="h6" {...props} />
}
