import type ReactEcs from '@dcl/sdk/react-ecs'

import type { VisibilityPosition } from '../../classes/visibilityController'


export type ToastPosition =
	| 'top'
	| 'bottom'
	| 'topLeft'
	| 'topRight'
	| 'bottomLeft'
	| 'bottomRight'

export type ToastGroupPolicy = 'stack' | 'queue' | 'replace'

export type ToastPhase = 'queued' | 'entering' | 'visible' | 'pulsing' | 'exiting' | 'done'

export type ShowToastOptions = {
	id?           : string
	position      : ToastPosition
	content       : () => ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null
	/** Seconds visible after enter (and optional pulse). `0` = until dismiss / hideToast. Default `3`. */
	duration?     : number
	isDismissable?: boolean
	showFrom?     : VisibilityPosition
	hideTo?       : VisibilityPosition
	/** When false, toast stays at its dock and only uses scale motion. Default `true`. */
	slide?        : boolean
	scaleIn?      : boolean
	scaleOut?     : boolean
	/** One pulse at rest before auto-hide (score-style). */
	scalePulse?   : boolean
	group?        : string
	/** Defaults to `stack`. `queue` / `replace` require `group`. */
	groupPolicy?  : ToastGroupPolicy
	/** Root box size used for scale animation. Defaults from theme icon size × aspect. */
	width?        : number
	height?       : number
	zIndex?       : number
}

export type ToastItem = {
	id            : string
	position      : ToastPosition
	content       : () => ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null
	duration      : number
	isDismissable : boolean
	showFrom      : VisibilityPosition
	hideTo        : VisibilityPosition
	slide         : boolean
	scaleIn       : boolean
	scaleOut      : boolean
	scalePulse    : boolean
	group?        : string
	groupPolicy   : ToastGroupPolicy
	width         : number
	height        : number
	zIndex        : number
	phase         : ToastPhase
	activeEdge    : VisibilityPosition
	slideOffset   : number
	scale         : number
}
