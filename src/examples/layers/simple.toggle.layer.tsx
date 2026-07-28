import ReactEcs from '@dcl/sdk/react-ecs'

import { ButtonText } from 'src/scaling-ui/components'
import { Layer } from 'src/scaling-ui/components/layers'
import { ZoneType } from 'src/scaling-ui/components/zones/zone.presets'

import { simpleLayer } from 'src/examples/layers/simple.layer'


// MARK: SimpleToggleLayer
/**
 * Always-visible control that toggles `simpleLayer`.
 * Demonstrates keeping a hideable panel and its opener as separate layers.
 */
export class SimpleToggleLayer extends Layer {
	constructor() {
		super({
			id  : 'simple-toggle',
			zone: ZoneType.TopRight,
			uiTransform: {
				justifyContent: 'flex-start',
			},
		})
	}


	// MARK: body
	protected body() {
		return (
			<ButtonText
				id        = "btn_simple_toggle"
				textLabel = "Simple"
				callback  = {() => simpleLayer.toggle()}
			/>
		)
	}
}

export const simpleToggleLayer = new SimpleToggleLayer()
