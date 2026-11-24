import type { Layer } from '../../../ui-component-kit'
import { toastHostLayer } from '../../../ui-component-kit'

import { demoAnimationsLayer }               from './components/demo.animations.layer'
import { demoBackgroundsLayer }              from './components/demo.backgrounds.layer'
import { demoButtonsLayer }                  from './components/demo.buttons.layer'
import { demoColorPickerLayer }              from './components/demo.colorPicker.layer'
import { demoGridsLayer }                    from './components/demo.grids.layer'
import { demoIconsLayer }                    from './components/demo.icons.layer'
import { demoLayoutLayer }                   from './components/demo.layout.layer'
import { demoProgressLayer }                 from './components/demo.progress.layer'
import { demoSafeZoneBottomLayer }           from './zones/demo.safeZone.bottom.layer'
import { demoSafeZoneBottomCenterLayer }     from './zones/demo.safeZone.bottomCenter.layer'
import { demoSafeZoneBottomLeftLayer }       from './zones/demo.safeZone.bottomLeft.layer'
import { demoSafeZoneBottomRightLayer }      from './zones/demo.safeZone.bottomRight.layer'
import { demoSafeZoneDefaultLayer }          from './zones/demo.safeZone.default.layer'
import { demoSafeZoneFullScreenLayer }       from './zones/demo.safeZone.fullScreen.layer'
import { demoSafeZoneInteractableAreaLayer } from './zones/demo.safeZone.interactableArea.layer'
import { demoSafeZoneLeftLayer }             from './zones/demo.safeZone.left.layer'
import { demoSafeZoneLeftBottomLayer }       from './zones/demo.safeZone.leftBottom.layer'
import { demoSafeZoneLeftTopLayer }          from './zones/demo.safeZone.leftTop.layer'
import { demoSafeZoneRightLayer }            from './zones/demo.safeZone.right.layer'
import { demoSafeZoneRightBottomLayer }      from './zones/demo.safeZone.rightBottom.layer'
import { demoSafeZoneRightTopLayer }         from './zones/demo.safeZone.rightTop.layer'
import { demoSafeZoneTopLayer }              from './zones/demo.safeZone.top.layer'
import { demoSafeZoneTopCenterLayer }        from './zones/demo.safeZone.topCenter.layer'
import { demoSafeZoneTopLeftLayer }          from './zones/demo.safeZone.topLeft.layer'
import { demoSafeZoneTopRightLayer }         from './zones/demo.safeZone.topRight.layer'
import { demoSpriteIconLayer }               from './components/demo.spriteIcon.layer'
import { demoTextLayer }                     from './components/demo.text.layer'
import { demoToastsLayer }                   from './components/demo.toasts.layer'
import { demoToggleLayer }                   from './components/demo.toggle.layer'
import { infoLayer }                         from './info.layer'

import { demoHotbarsLayer }                  from './layouts/demo.hotbars.layer'
import { demoListLayer }                     from './layouts/demo.list.layer'
import { demoLoadingScreenFullLayer, demoLoadingScreenLayer } from './layouts/demo.loadingScreen.layer'
import { demoMatchSummaryLayer }             from './layouts/demo.matchSummary.layer'
import { demoSettingsMenuLayer }             from './layouts/demo.settingsMenu.layer'
import { demoTimersLayer }                   from './layouts/demo.timers.layer'

import { demoComponentsNavLayer, demoLayoutsNavLayer, demoNavTabsLayer, demoZonesNavLayer } from './nav/demo.nav.layer'


/** Showcase demo layer list. Comment out entries to hide them. */
export const layers: Layer[] = [
	// Zone previews.
	demoSafeZoneDefaultLayer,
	demoSafeZoneFullScreenLayer,
	demoSafeZoneInteractableAreaLayer,
	demoSafeZoneTopLayer,
	demoSafeZoneTopCenterLayer,
	demoSafeZoneTopLeftLayer,
	demoSafeZoneTopRightLayer,
	demoSafeZoneLeftTopLayer,
	demoSafeZoneLeftLayer,
	demoSafeZoneLeftBottomLayer,
	demoSafeZoneRightTopLayer,
	demoSafeZoneRightLayer,
	demoSafeZoneRightBottomLayer,
	demoSafeZoneBottomLayer,
	demoSafeZoneBottomCenterLayer,
	demoSafeZoneBottomLeftLayer,
	demoSafeZoneBottomRightLayer,

	// Navigation: top-right tabs switch between the two right-hand sidebars.
	demoNavTabsLayer,
	demoComponentsNavLayer,
	demoLayoutsNavLayer,
	demoZonesNavLayer,

	// Component demos.
	demoTextLayer,
	demoAnimationsLayer,
	demoProgressLayer,
	demoButtonsLayer,
	demoIconsLayer,
	demoSpriteIconLayer,
	demoGridsLayer,
	demoLayoutLayer,
	demoBackgroundsLayer,
	demoToastsLayer,
	demoToggleLayer,
	demoColorPickerLayer,

	// Layout demos.
	demoTimersLayer,
	demoListLayer,
	demoMatchSummaryLayer,
	demoSettingsMenuLayer,
	demoHotbarsLayer,
	demoLoadingScreenLayer,
	demoLoadingScreenFullLayer,

	infoLayer,
	toastHostLayer,
]
