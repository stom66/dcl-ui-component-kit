import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { getCanvasInfo, vhToPixels } from '../utils/sizing'
import { theme } from '../styles'
import { darken } from '../utils/colors'

const height = 300

// MARK: Main GameUI
export function InfoUI() {
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
