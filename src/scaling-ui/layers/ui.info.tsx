import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { VERSION } from 'src/data/version'
import { getCanvasInfo } from '../utils/sizing'

// MARK: Main GameUI
export function InfoUI() {
	return (
		<UiEntity
			key={`ui_Info`}
			uiTransform={{
				width         : '350',
				height        : '64',
				positionType  : "absolute",
				position      : { bottom: 3, right: 3 },
				zIndex        : 100000,
			}}
			uiText={{
				value    : getCanvasInfo()?.width + 'x' + getCanvasInfo()?.height,
				fontSize : 20,
				color    : Color4.fromHexString('#fac300ff'),
				textAlign: 'bottom-right',
			}}
		/>
	)
}
