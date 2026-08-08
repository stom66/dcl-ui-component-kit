import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox } from '../base'
import { Layer } from '../layers'
import { ZoneType } from '../zones/zone.presets'
import { toastRegistry } from './toast.registry'
import { ToastView } from './toast.view'


let hostHasRendered = false


// MARK: isToastHostMounted
/** True after ToastHostLayer has been rendered at least once inside SetupUiComponentKit. */
export function isToastHostMounted(): boolean {
	return hostHasRendered
}


// MARK: ToastHostLayer
/**
 * Always-mounted overlay that renders ephemeral toasts (and later particles).
 * Full-bleed absolute host so toast docks position against the canvas, not a
 * flex-centered stack child. Include `toastHostLayer` in `SetupUiComponentKit({ layers })`.
 */
export class ToastHostLayer extends Layer {
	constructor() {
		super({
			id         : 'toast-host',
			zone       : ZoneType.None,
			canBeHidden: false,
			zIndex     : 5000,
		})
	}


	// MARK: body
	protected body() {
		hostHasRendered = true
		const items = toastRegistry.list()

		return (
			<UiBox
				key="toast-host-root"
				uiTransform={{
					width         : '100%',
					height        : '100%',
					positionType  : 'absolute',
					position      : { top: 0, right: 0, bottom: 0, left: 0 },
					display       : 'flex',
					flexDirection : 'column',
					alignItems    : 'stretch',
					justifyContent: 'flex-start',
				}}
			>
				{items.map(item => (
					<ToastView key={item.id} item={item} />
				))}
			</UiBox>
		)
	}
}


export const toastHostLayer = new ToastHostLayer()
