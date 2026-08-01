import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from './base'
import { getTheme } from '../styles'


type HeaderProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value   ?: string
	uiText  ?: Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Header
export const Header = ({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				padding: { top: 10, bottom: 5 },
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h2),
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
