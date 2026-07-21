import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { getTheme } from 'src/scaling-ui/styles'
import { getCanvasInfo, vwToPixels } from 'src/scaling-ui/utils/sizing'

// MARK: Main GameUI
export function MainUI() {
	const theme = getTheme()

	return (
		<UiEntity
			key         = {`ui_Info`}
			uiTransform = {{
				width         : vwToPixels(25),
				height        : '64',
				positionType  : "absolute",
				position      : { bottom: 3, right: 3 },
				zIndex        : 100000,
				flexShrink    : 0,
				flexGrow      : 0,
			}}
			uiText={{
				value    : getCanvasInfo()?.width + 'x' + getCanvasInfo()?.height,
				fontSize : theme.typography.size.h2,
				color    : Color4.fromHexString('#fac300ff'),
				textAlign: 'bottom-right',

			}}
			uiBackground={{
				color: theme.colors.body,
			}}
		/>
	)
}
