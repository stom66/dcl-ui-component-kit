import ReactEcs from '@dcl/sdk/react-ecs'

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
 * Docks are `position: absolute` against the canvas — no full-screen wrapper
 * (that would sit over every other layer). Include `toastHostLayer` in
 * `SetupUiComponentKit({ layers })`.
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
		return toastRegistry.list().map(item => (
			<ToastView key={item.id} item={item} />
		))
	}
}


export const toastHostLayer = new ToastHostLayer()
