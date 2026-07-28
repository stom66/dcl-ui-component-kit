import ReactEcs from '@dcl/sdk/react-ecs'

import { Label } from 'src/scaling-ui/components'
import { Layer } from 'src/scaling-ui/components/layers'
import { ZoneType } from 'src/scaling-ui/components/zones/zone.presets'
import { getTheme } from 'src/scaling-ui/styles'


// MARK: TestLayer
/** Example layer for testing zone boundaries and positioning. */
export class TestLayer extends Layer {
	constructor() {
		const theme = getTheme()

		super({
			id          : 'test',
			zone        : ZoneType.TopLeft,
			showFrame   : true,
			uiBackground: { color: theme.colors.info },
		})
	}


	// MARK: body
	protected body() {
		return (
			<Label value="Test" />
		)
	}
}

export const testLayer = new TestLayer()
