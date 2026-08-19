import type { UiEntity } from '@dcl/sdk/react-ecs'

import type { VisibilityPosition } from '../../classes/visibilityController'
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
 *
 * Center docks span the full width and center the toast with `alignItems`.
 * Side docks pin with `left` / `right` only and shrink-wrap the toast
 * (avoids collapsed %-width strips that all landed near the left).
 */
export function getToastDockTransform(position: ToastPosition): UiTransform {
	const barH = '23%'
	const side = '25%'

	switch (position) {
		case 'top':
			return {
				positionType  : 'absolute',
				position      : { top: barH, right: 0, left: 0 },
				width         : '100%',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-start',
				justifyContent: 'center',
			}
		case 'bottom':
			return {
				positionType  : 'absolute',
				position      : { right: 0, bottom: barH, left: 0 },
				width         : '100%',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-end',
				justifyContent: 'center',
			}
		case 'topLeft':
			return {
				positionType  : 'absolute',
				position      : { top: barH, left: side },
				width         : 'auto',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-start',
				justifyContent: 'flex-start',
			}
		case 'topRight':
			return {
				positionType  : 'absolute',
				position      : { top: barH, right: side },
				width         : 'auto',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-start',
				justifyContent: 'flex-end',
			}
		case 'bottomLeft':
			return {
				positionType  : 'absolute',
				position      : { bottom: barH, left: side },
				width         : 'auto',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-end',
				justifyContent: 'flex-start',
			}
		case 'bottomRight':
			return {
				positionType  : 'absolute',
				position      : { right: side, bottom: barH },
				width         : 'auto',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-end',
				justifyContent: 'flex-end',
			}
		default:
			return {
				positionType  : 'absolute',
				position      : { top: barH, right: 0, left: 0 },
				width         : '100%',
				height        : 'auto',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'flex-start',
				justifyContent: 'center',
			}
	}
}
