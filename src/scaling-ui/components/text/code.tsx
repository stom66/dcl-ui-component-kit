import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'


type CodeProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value   ?: string
	uiText  ?: Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Code
/**
 * Monospace / code text block. Pass copy via `value` (or `uiText.value`).
 */
export const Code = ({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: CodeProps) => {
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
				fontSize : scaleFontSize(theme.typography.size.code),
				font     : theme.typography.family.code,
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
