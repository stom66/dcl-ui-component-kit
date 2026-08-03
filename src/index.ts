import { themeOverrides } from './exampleTheme'
import { SetupScalingUI } from './scaling-ui'
import { demoLayers } from './scaling-ui/examples/layers'


export function main() {
	SetupScalingUI({
		theme : themeOverrides,
		layers: demoLayers,
		debug : {
			showDesktopSafeZones: false,
			showMobileSafeZones : false,
		},
	})
}
