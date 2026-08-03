import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'


type TextProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value   ?: string
	uiText  ?: Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Text
/**
 * Default body text block. Pass copy via `value` (or `uiText.value`); nest element children as needed.
 *
 * Uses `alignSelf: 'stretch'` (not `width: '100%'`) so wrap width tracks the parent even when
 * that parent is a `Row` `cols` child sized via `flexGrow` / `width: 0` (Yoga % would be wrong).
 */
export const Text = ({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: TextProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width    : 'auto',
				height   : 'auto',
				alignSelf: 'stretch',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.default),
				font     : theme.typography.family.default,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}
