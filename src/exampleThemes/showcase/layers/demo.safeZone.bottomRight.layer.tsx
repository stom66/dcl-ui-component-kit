import { ZoneType } from '../../../ui-component-kit'

import { createSafeZoneDemoLayer } from './demo.safeZone.factory'

/** Temporary high z-index so BottomRight is visible above the info HUD for alignment checks. */
export const demoSafeZoneBottomRightLayer = createSafeZoneDemoLayer(
	'demo-safe-zone-bottom-right',
	ZoneType.BottomRight,
	'BottomRight',
	{ zIndex: 10_000 },
)
