import { engine, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { showcase } from './exampleThemes/showcase'
// import { skyChaser } from './exampleThemes/skyChaser'
// import { flagTag } from './exampleThemes/flagTag'
// import { cleanTheClub } from './exampleThemes/cleanTheClub'

import { SetupUiComponentKit } from './ui-component-kit'
import { Color4 } from '@dcl/sdk/math'


// Enable exactly one example theme for the scene:
const active = showcase
// const active = skyChaser
// const active = flagTag
// const active = cleanTheClub


export function main() {
	SetupUiComponentKit({
		theme : active.theme,
		layers: active.layers,
		debug : {
			showDesktopSafeZones: false,
			showMobileSafeZones : false,
		},
	})


	// Spawn some color walls to help with building,screenshots, etc
	function spawnScreen(pos: number, color: Color4, color2?: Color4): void {
		const e = engine.addEntity()
		Transform.create(e, {
			scale   : { x: 8, y: 4.5, z: 0.25 },
			position: { x: 8, y: 2.25, z: pos },
		})
		MeshRenderer.setBox(e)
		Material.create(e, {
			material: {
				$case: 'pbr',
				pbr: {
					albedoColor  : color,
					emissiveColor: color2 ?? color,
					castShadows  : false,
				}
			}
		})
}


	// Spawn a blank white spherefor the user to stand in, to assist debugging
	spawnScreen(3.875 , Color4.White())
	spawnScreen(4.125 , Color4.Black())


	spawnScreen(10.875 , Color4.fromHexString('#666666'))
	spawnScreen(11.125 , Color4.fromHexString('#222222'))
}
