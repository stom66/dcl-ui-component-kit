import type { UiEntity } from '@dcl/sdk/react-ecs'

import type { VisibilityPosition } from '../../classes/visibilityController'
import { LEFT_ZONE_INSET } from '../zones/zone.presets'
import type { ToastPosition } from './toast.types'


type UiTransform = NonNullable<Parameters<typeof UiEntity>[0]['uiTransform']>


/** Default slide edge for a toast dock. */
export function defaultEdgesForPosition(position: ToastPosition): {
	showFrom: VisibilityPosition
	hideTo  : VisibilityPosition
} {
	const edge: VisibilityPosition =
		position === 'top' || position === 'topLeft' || position === 'topRight'
			? 'top'
			: 'bottom'
	return { showFrom: edge, hideTo: edge }
}


// MARK: getToastDockTransform
/**
 * Absolute dock rect inset by the top/bottom (~23%) and left/right (~25%) bar zones.
 * Left docks sit to the right of the left bar; right docks sit to the left of the right bar.
 */
export function getToastDockTransform(position: ToastPosition): UiTransform {
	const barH = '23%'
	const side = '25%'

	switch (position) {
		case 'top':
			return {
				positionType  : 'absolute',
				position      : { top: barH, left: side },
				width         : '50%',
				height        : 'auto',
				alignItems    : 'center',
				justifyContent: 'flex-start',
			}
		case 'bottom':
			return {
				positionType  : 'absolute',
				position      : { bottom: barH, left: side },
				width         : '50%',
				height        : 'auto',
				alignItems    : 'center',
				justifyContent: 'flex-end',
			}
		case 'topLeft':
			return {
				positionType  : 'absolute',
				position      : { top: barH, left: side },
				width         : '25%',
				height        : 'auto',
				alignItems    : 'flex-start',
				justifyContent: 'flex-start',
			}
		case 'topRight':
			return {
				positionType  : 'absolute',
				position      : { top: barH, right: side },
				width         : '25%',
				height        : 'auto',
				alignItems    : 'flex-end',
				justifyContent: 'flex-start',
			}
		case 'bottomLeft':
			return {
				positionType  : 'absolute',
				position      : { bottom: barH, left: side },
				width         : '25%',
				height        : 'auto',
				alignItems    : 'flex-start',
				justifyContent: 'flex-end',
			}
		case 'bottomRight':
			return {
				positionType  : 'absolute',
				position      : { bottom: barH, right: side },
				width         : '25%',
				height        : 'auto',
				alignItems    : 'flex-end',
				justifyContent: 'flex-end',
			}
		default:
			return {
				positionType  : 'absolute',
				position      : { top: barH, left: side },
				width         : '50%',
				height        : 'auto',
				alignItems    : 'center',
				justifyContent: 'center',
			}
	}
}


/** Left-bar inset constant re-export for callers that need the pixel rail clearance. */
export { LEFT_ZONE_INSET }
