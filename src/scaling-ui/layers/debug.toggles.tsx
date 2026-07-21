import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { getTheme } from 'src/scaling-ui/styles'
import { darken } from 'src/scaling-ui/utils/colors'
import { vhToPixels } from 'src/scaling-ui/utils/sizing'

const height = 300

// MARK: Main GameUI
export function MainUI() {
	const theme = getTheme()

	return (
		<UiEntity
			key={`debug_Toggles`}
			uiTransform={{
				width         : '220',
				height        : height,
				positionType  : "absolute",
				position      : { left: 12, top: vhToPixels(50) - (height/2) },
				zIndex        : 100000,
				borderRadius  : 8,
				borderColor   : darken(theme.colors.primary, 0.1)
			}}

		/>
	)
}
