import type { Layer } from '../../../scaling-ui'
import { toastHostLayer } from '../../../scaling-ui'

import { demoAnimationsLayer }  from './demo.animations.layer'
import { demoBackgroundsLayer } from './demo.backgrounds.layer'
import { demoButtonsLayer }     from './demo.buttons.layer'
import { demoIconsLayer }       from './demo.icons.layer'
import { demoLeftBarLayer }     from './demo.leftBar.layer'
import { demoListLayer }        from './demo.list.layer'
import { demoProgressLayer }    from './demo.progress.layer'
import { demoTextLayer }        from './demo.text.layer'
import { demoToastsLayer }      from './demo.toasts.layer'
import { demoToggleLayer }      from './demo.toggle.layer'
import { infoLayer }            from './info.layer'
import { timerLayer }           from './timer.layer'


/** Showcase demo layer list. Comment out entries to hide them. */
export const layers: Layer[] = [
	demoLeftBarLayer,
	demoTextLayer,
	demoAnimationsLayer,
	demoProgressLayer,
	demoButtonsLayer,
	demoIconsLayer,
	demoListLayer,
	demoBackgroundsLayer,
	demoToastsLayer,
	demoToggleLayer,
	infoLayer,
	timerLayer,
	toastHostLayer,
]
