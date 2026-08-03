import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiBackgroundProps, UiEntity } from '@dcl/sdk/react-ecs'

import { Layer } from '../components/layers'
import { ZoneType } from '../components/zones/zone.presets'
import { SAFE_ZONE_Z_INDEX } from './constants'


const bgDanger: UiBackgroundProps = {
	color      : Color4.create(1, 0, 0, 1),
	textureMode: 'center',
	texture    : {
		src     : 'assets/images/ui-component-kit/bg-dangerZone.png',
		wrapMode: 'repeat',
	},
}
const bgWarning: UiBackgroundProps = {
	color      : Color4.create(0.8, 0.6, 0.07, 0.5),
	textureMode: 'center',
	texture    : {
		src     : 'assets/images/ui-component-kit/bg-warningZone.png',
		wrapMode: 'repeat',
	},
}

// MARK: SafeZonesMobileLayer
/** Debug overlay: mobile native-UI chrome regions. */
class SafeZonesMobileLayer extends Layer {
	constructor() {
		super({
			id    : 'safe_zones_mobile',
			zone  : ZoneType.None,
			zIndex: SAFE_ZONE_Z_INDEX,
		})
	}


	// MARK: body
	protected body() {
		return (
			<UiEntity
				key={`ui_SafeZonesMobile`}
				uiTransform={{
					width       : '100%',
					height      : '100%',
					positionType: 'absolute',
				}}
			>
				<UiEntity
					uiTransform={{
						width       : '25%',
						height      : '100%',
						positionType: 'absolute',
						position    : { left: 0, top: 0 },
					}}
					uiBackground={{...bgDanger}}
				/>

				<UiEntity
					uiTransform={{
						width       : '25%',
						height      : '23%',
						positionType: 'absolute',
						position    : { right: 0, top: 0 },
					}}
					uiBackground={{...bgDanger}}
				/>

				<UiEntity
					uiTransform={{
						width       : '25%',
						height      : '55%',
						positionType: 'absolute',
						position    : { right: 0, bottom: 0 },
					}}
					uiBackground={{...bgDanger}}
				/>
			</UiEntity>
		)
	}
}

export const safeZonesMobileLayer = new SafeZonesMobileLayer()
