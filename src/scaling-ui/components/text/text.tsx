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
				width : '100%',
				height: 'auto',
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
