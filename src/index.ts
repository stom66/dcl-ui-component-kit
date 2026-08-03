import { showcase } from './exampleThemes/showcase'
// import { skyChaser } from './exampleThemes/skyChaser'
// import { flagTag } from './exampleThemes/flagTag'
// import { cleanTheClub } from './exampleThemes/cleanTheClub'

import { SetupScalingUI } from './scaling-ui'


// Enable exactly one example theme for the scene:
const active = showcase
// const active = skyChaser
// const active = flagTag
// const active = cleanTheClub


export function main() {
	SetupScalingUI({
		theme : active.theme,
		layers: active.layers,
		debug : {
			showDesktopSafeZones: false,
			showMobileSafeZones : false,
		},
	})
}
