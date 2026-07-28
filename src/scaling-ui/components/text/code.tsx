import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'


type SectionHeaderProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	title    : string
	uiText  ?: Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: H1
export const Code = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: SectionHeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.code),
				font     : theme.typography.family.code,
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
			This is osme text.
		</UiBox>
	)
}
