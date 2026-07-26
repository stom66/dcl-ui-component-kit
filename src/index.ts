import { demoLayers } from 'src/examples/layers'
import { themeOverrides } from 'src/myTheme'
import { SetupScalingUI } from 'src/scaling-ui'


export function main() {
	SetupScalingUI({
		theme : themeOverrides,
		layers: demoLayers,
		debug : {
			showDesktopSafeZones: true,
			showMobileSafeZones : false,
		},
	})
}
