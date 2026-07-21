import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { VERSION } from 'src/data/version'
import { UiBox } from 'src/scaling-ui/components'
import { getTheme } from 'src/scaling-ui/styles'

// MARK: Main GameUI
export function MainUI() {
	const theme = getTheme()

	return (
		<UiBox
			key             = {`ui_Version`}
			backgroundColor = {theme.colors.body}
			borderRadius    = {theme.border.radius}
			uiTransform     = {{
				width         : '250',
				height        : '50',
				positionType  : "absolute",
				position      : { bottom: 3, right: 3 },
			}}
			uiText = {{
				value    : VERSION,
				fontSize : theme.typography.size.code,
				color    : Color4.fromHexString('#88888888'),
				textAlign: 'bottom-right',
			}}
		/>
	)
}
