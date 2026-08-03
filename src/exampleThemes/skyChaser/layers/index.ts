import type { Layer } from '../../../scaling-ui'

import { bottomBarLayer } from './bottomBar.layer'


/**
 * SkyChaser layer list.
 * Add layer instances here. Include `toastHostLayer` from `scaling-ui` if using toasts.
 */
export const layers: Layer[] = [
	bottomBarLayer,
]
