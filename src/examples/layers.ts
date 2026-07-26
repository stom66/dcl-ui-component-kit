import { infoLayer } from 'src/examples/layers/info.layer'
import { simpleLayer } from 'src/examples/layers/simple.layer'
import { timerLayer } from 'src/examples/layers/timer.layer'
import type { Layer } from 'src/scaling-ui/components/layers'


/** Demo scene layer list. Comment out entries to hide them. */
export const demoLayers: Layer[] = [
	infoLayer,
	simpleLayer,
	timerLayer,
]
