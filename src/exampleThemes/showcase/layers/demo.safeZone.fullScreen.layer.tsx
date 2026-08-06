import { ZoneType } from '../../../ui-component-kit'

import { createSafeZoneDemoLayer } from './demo.safeZone.factory'

export const demoSafeZoneFullScreenLayer = createSafeZoneDemoLayer(
	'demo-safe-zone-full-screen',
	ZoneType.FullScreen,
	'FullScreen',
)
