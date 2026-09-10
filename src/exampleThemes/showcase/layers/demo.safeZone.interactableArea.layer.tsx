import { ZoneType } from '../../../ui-component-kit'

import { createSafeZoneDemoLayer } from './demo.safeZone.factory'

/** FullScreen zone on the interactable-inset renderer (explorer HUD-free rect). */
export const demoSafeZoneInteractableAreaLayer = createSafeZoneDemoLayer(
	'demo-safe-zone-interactable-inset',
	ZoneType.FullScreen,
	'Interactable inset',
	{ inset: 'interactable' },
)
