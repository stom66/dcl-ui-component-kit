import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { getTheme } from '../styles'
import { UiBox, type UiBoxProps } from './base'
import { textMinHeight } from './text/textLayout'


export type HeaderProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Title copy. Prefer this over JSX text children (DCL `uiText` needs `value`). */
	value?  : string
	/** Font color. Defaults to `theme.colors.light`. Overrides `uiText.color`. */
	color?  : Color4
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Header
/**
 * Simple panel title line (h2-sized). Pass copy via `value`; tint via `color`.
 */
export const Header = ({
	children,
	value,
	color,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme    = getTheme()
	const fontSize = scaleFontSize(theme.typography.size.h2)

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : '100%',
				height    : 'auto',
				minHeight : textMinHeight(fontSize),
				alignSelf : 'flex-start',
				flexShrink: 0,
				padding   : { top: 10, bottom: 5 },
				...uiTransform,
			}}
			uiText={{
				fontSize,
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
