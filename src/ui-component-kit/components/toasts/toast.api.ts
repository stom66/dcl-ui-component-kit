import { isToastHostMounted } from './toastHost.layer'
import { toastRegistry } from './toast.registry'
import type { ShowToastOptions } from './toast.types'


// MARK: showToast
/**
 * Shows a toast on the ToastHostLayer.
 * Requires `toastHostLayer` in `SetupUiComponentKit({ layers })`.
 * Returns the toast id.
 */
export function showToast(options: ShowToastOptions): string {
	if (!isToastHostMounted()) {
		console.error('showToast: toastHostLayer has not rendered yet — ensure toastHostLayer is in SetupUiComponentKit layers')
	}
	return toastRegistry.show(options)
}


// MARK: hideToast
/** Hides a toast by id (runs exit animation). */
export function hideToast(id: string) {
	toastRegistry.hide(id)
}


// MARK: clearToastGroup
/** Dismisses the active toast and drops queued toasts in a group. */
export function clearToastGroup(group: string) {
	toastRegistry.clearGroup(group)
}
