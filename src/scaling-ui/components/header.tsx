import { Color4 } from "@dcl/sdk/math"
import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'
import { getTheme } from 'src/scaling-ui/styles'

type HeaderProps = UiBoxProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	title    : string
}

export const Header = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width: '100%',
				height: 'auto',
				padding: { top: 10, bottom: 5 },
				...uiTransform
			}}
			uiText={{
				value: title,
				fontSize: theme.typography.size.h2,
				color: Color4.create(1, 0.8, 0.3, 1),
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}
