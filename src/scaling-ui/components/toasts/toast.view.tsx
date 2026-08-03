import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox } from '../base'
import { getToastDockTransform } from './toast.dock'
import { toastRegistry } from './toast.registry'
import type { ToastItem } from './toast.types'


// MARK: ToastView
/**
 * Renders a single toast inside a fixed dock rect.
 * Slide offset is applied on the scaled root (not the dock), matching zone hide math.
 */
export function ToastView({ item, key }: { item: ToastItem; key?: string }) {
	const dock = getToastDockTransform(item.position)
	const w    = item.width  * item.scale
	const h    = item.height * item.scale

	const dismissable = item.isDismissable && (
		item.phase === 'visible' || item.phase === 'pulsing' || item.phase === 'entering'
	)

	return (
		<UiBox
			key={key ?? `toast_dock_${item.id}`}
			uiTransform={{
				...dock,
				positionType: 'absolute',
				zIndex      : item.zIndex,
				display     : 'flex',
				flexGrow    : 0,
				flexShrink  : 0,
			}}
		>
			<UiBox
				key={`toast_root_${item.id}`}
				uiTransform={{
					width         : w,
					height        : h,
					flexGrow      : 0,
					flexShrink    : 0,
					alignItems    : 'center',
					justifyContent: 'center',
					display       : 'flex',
					positionType  : 'relative',
					position      : { [item.activeEdge]: item.slideOffset },
				}}
				onMouseDown={dismissable ? () => toastRegistry.dismiss(item.id) : undefined}
			>
				{item.content()}
			</UiBox>
		</UiBox>
	)
}
