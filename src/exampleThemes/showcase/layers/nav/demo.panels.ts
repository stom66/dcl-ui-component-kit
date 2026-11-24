import type { Layer } from '../../../../ui-component-kit'

import { demoAnimationsLayer } from '../components/demo.animations.layer'
import { demoBackgroundsLayer } from '../components/demo.backgrounds.layer'
import { demoButtonsLayer } from '../components/demo.buttons.layer'
import { demoColorPickerLayer } from '../components/demo.colorPicker.layer'
import { demoGridsLayer } from '../components/demo.grids.layer'
import { demoIconsLayer } from '../components/demo.icons.layer'
import { demoLayoutLayer } from '../components/demo.layout.layer'
import { demoProgressLayer } from '../components/demo.progress.layer'
import { demoSpriteIconLayer } from '../components/demo.spriteIcon.layer'
import { demoTextLayer } from '../components/demo.text.layer'
import { demoToastsLayer } from '../components/demo.toasts.layer'
import { demoInputsLayer } from '../components/demo.inputs.layer'

import { demoHotbarsLayer } from '../layouts/demo.hotbars.layer'
import { demoListLayer } from '../layouts/demo.list.layer'
import { demoLoadingScreenLayer } from '../layouts/demo.loadingScreen.layer'
import { demoMatchSummaryLayer } from '../layouts/demo.matchSummary.layer'
import { demoSettingsMenuLayer } from '../layouts/demo.settingsMenu.layer'
import { demoTimersLayer } from '../layouts/demo.timers.layer'


/** Component demo panels (opened from the Components sidebar). */
export const COMPONENT_PANEL_LAYERS: Layer[] = [
	demoAnimationsLayer,
	demoBackgroundsLayer,
	demoButtonsLayer,
	demoColorPickerLayer,
	demoGridsLayer,
	demoIconsLayer,
	demoSpriteIconLayer,
	demoLayoutLayer,
	demoProgressLayer,
	demoTextLayer,
	demoToastsLayer,
	demoInputsLayer,
]

/** Layout demo panels (opened from the Layouts sidebar). */
export const LAYOUT_PANEL_LAYERS: Layer[] = [
	demoTimersLayer,
	demoListLayer,
	demoMatchSummaryLayer,
	demoSettingsMenuLayer,
	demoHotbarsLayer,
	demoLoadingScreenLayer,
]

/** Every centre content panel — only one visible at a time. */
const DEMO_PANEL_LAYERS: Layer[] = [
	...COMPONENT_PANEL_LAYERS,
	...LAYOUT_PANEL_LAYERS,
]


// MARK: isLayerShown
/** True while a hideable layer is visible or animating in. */
export function isLayerShown(layer: Layer): boolean {
	return !layer.visibility.isHidden
}


// MARK: hideAllDemoPanels
/** Hides every centre demo panel. */
export function hideAllDemoPanels(except?: Layer) {
	for (const layer of DEMO_PANEL_LAYERS) {
		if (layer === except) continue
		if (!layer.visibility.isHidden || !layer.visibility.isFullyHidden) {
			layer.hide()
		}
	}
}


// MARK: toggleDemoPanel
/**
 * Toggles `target` and hides every other showcase demo panel.
 * Re-clicking the active panel closes it.
 */
export function toggleDemoPanel(target: Layer) {
	hideAllDemoPanels(target)
	target.toggle()
}
