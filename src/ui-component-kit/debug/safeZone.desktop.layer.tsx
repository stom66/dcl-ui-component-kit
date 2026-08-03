import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiBackgroundProps, UiEntity } from '@dcl/sdk/react-ecs'

import { Layer } from '../components/layers'
import { ZoneType } from '../components/zones/zone.presets'
import { SAFE_ZONE_Z_INDEX } from './constants'
import { getUiScaleFactor } from '../utils'
import { vhToPixels, vwToPixels } from '../utils'


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

// MARK: SafeZonesDesktopLayer
/** Debug overlay: desktop native-UI chrome regions. */
class SafeZonesDesktopLayer extends Layer {
	constructor() {
		super({
			id    : 'safe_zones_desktop',
			zone  : ZoneType.None,
			zIndex: SAFE_ZONE_Z_INDEX,
		})
	}



	// MARK: body
	protected body() {
		return (
			<UiEntity
				key={`ui_SafeZonesDesktop`}
				uiTransform={{
					width       : '100%',
					height      : '100%',
					positionType: 'absolute',
					position    : { left: 0, top: 0 },
				}}
			>

				{/* Top Left - Scene Details */}
				<UiEntity
					uiTransform={{
						width       : '50%',
						height      : '12%',
						positionType: 'absolute',
						position    : { right: 0, top: 0 },
					}}
					
					uiBackground={{...bgDanger}}
				/>
				{/* Left-side Toolbar */}
				<UiEntity
					uiTransform={{
						width       : '2.5%',
						height      : '100%',
						positionType: 'absolute',
						position    : { left: 0, top: 0 },
					}}
					uiBackground={{...bgDanger}}
				/>

				{/* Bottom Left - Chat box - OPEN */}
				<UiEntity
					uiTransform={{
						width       : '24.5%',
						//maxWidth    : 420 * getUiScaleFactor(),
						height      : '66.6%',
						positionType: 'absolute',
						position    : { left: 0, bottom: 0 },
					}}

					uiBackground={{...bgWarning}}
				/>

				{/* Bottom Left - Chat box - CLOSED */}
				<UiEntity
					uiTransform={{
						width       : '24.5%',
						height      : '6.5%',
						positionType: 'absolute',
						position    : { left: 0, bottom: 0 },
					}}

					uiBackground={{...bgDanger}}
				/>

				{/* Top Right - Debug + Console Buttons */}
				<UiEntity
					uiTransform={{
						width       : '3%',
						height      : '8.5%',
						positionType: 'absolute',
						position    : { right: 0, top: 0 },
					}}
					
					uiBackground={{...bgDanger}}
				/>

				{/* Bottom Right - Debug Panel */}
				<UiEntity
					uiTransform={{
						width       : '17%',
						height      : '49%',
						positionType: 'absolute',
						position    : { right: 0, bottom: 0 },
					}}
					
					uiBackground={{...bgWarning}}
				/>
			</UiEntity>
		)
	}
}

export const safeZonesDesktopLayer = new SafeZonesDesktopLayer()
