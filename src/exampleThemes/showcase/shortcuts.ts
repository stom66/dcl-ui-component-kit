import { engine, InputAction, inputSystem, PointerEventType } from '@dcl/sdk/ecs'

import { demoLeftBarLayer } from './layers/demo.leftBar.layer'
import { infoLayer } from './layers/info.layer'


let started = false



// MARK: sys_showcaseShortcuts
/** 1 toggles the left nav. 2 toggles the bottom-right info panel. */
function sys_showcaseShortcuts() {
	if (inputSystem.isTriggered(InputAction.IA_ACTION_3, PointerEventType.PET_DOWN)) {
		demoLeftBarLayer.toggle()
	}

	if (inputSystem.isTriggered(InputAction.IA_ACTION_4, PointerEventType.PET_DOWN)) {
		infoLayer.toggle()
	}
}


// MARK: startShowcaseShortcuts
/**
 * Starts polling keyboard 1 and 2 for the left nav and info panel.
 * Safe to call again; the system is registered once.
 */
export function startShowcaseShortcuts() {
	if (started) return
	started = true
	engine.addSystem(sys_showcaseShortcuts)
}
