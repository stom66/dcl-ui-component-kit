import ReactEcs from '@dcl/sdk/react-ecs'

import { IconNumber, Row } from 'src/scaling-ui/components'
import { ZoneType } from 'src/scaling-ui/components/zones/zone.presets'
import { Layer } from 'src/scaling-ui/components/layers'
import { getTheme } from 'src/scaling-ui'


// MARK: SimpleLayer
/** Example playground layer used by the demo scene. */
const theme = getTheme()
export class SimpleLayer extends Layer {
	constructor() {
		super({
			id             : 'simple',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			showCloseButton: true,
		})
	}


	// MARK: body
	protected body() {
		return (
			<Row uiTransform={{justifyContent: "center"}} cols={1} backgroundColor={theme.colors.danger}>
				<IconNumber value={"+120/2=60"} />
{/* 				<IconNumber value={2} />
				<IconNumber value={3} />
				<IconNumber value={4} />
				<IconNumber value={5} />
				<IconNumber value={6} />
				<IconNumber value={7} />
				<IconNumber value={8} />
				<IconNumber value={9} />
				<IconNumber value={'+'} />
				<IconNumber value={'/'} />
				<IconNumber value={'*'} />
				<IconNumber value={'-'} />
				<IconNumber value={'.'} />
				<IconNumber value={'='} /> */}
			</Row>
		)
	}
}

export const simpleLayer = new SimpleLayer()
