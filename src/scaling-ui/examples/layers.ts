import type { Layer } from '../components/layers'

import { demoAnimationsLayer }  from './layers/demo.animations.layer'
import { demoBackgroundsLayer } from './layers/demo.backgrounds.layer'
import { demoButtonsLayer }     from './layers/demo.buttons.layer'
import { demoIconsLayer }       from './layers/demo.icons.layer'
import { demoLeftBarLayer }     from './layers/demo.leftBar.layer'
import { demoListLayer }        from './layers/demo.list.layer'
import { demoProgressLayer }    from './layers/demo.progress.layer'
import { demoTextLayer }        from './layers/demo.text.layer'
import { infoLayer }            from './layers/info.layer'
import { timerLayer }           from './layers/timer.layer'


/** Demo scene layer list. Comment out entries to hide them. */
export const demoLayers: Layer[] = [
	demoLeftBarLayer,
	demoTextLayer,
	demoAnimationsLayer,
	demoProgressLayer,
	demoButtonsLayer,
	demoIconsLayer,
	demoListLayer,
	demoBackgroundsLayer,
	infoLayer,
	timerLayer,
]
