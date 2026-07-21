import ReactEcs from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'
import { getTheme } from 'src/scaling-ui/styles'


type SectionHeaderProps = UiBoxProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	title    : string
}


// MARK: SectionHeader
export const H1 = ({
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
				padding: { top: 10, bottom: 5 },
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : theme.typography.size.h1,
				color    : Color4.create(1, 0.8, 0.3, 1),
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}
