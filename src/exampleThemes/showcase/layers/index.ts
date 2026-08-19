import type { Layer } from '../../../ui-component-kit'
import { toastHostLayer } from '../../../ui-component-kit'

import { demoAnimationsLayer }               from './demo.animations.layer'
import { demoBackgroundsLayer }              from './demo.backgrounds.layer'
import { demoButtonsLayer }                  from './demo.buttons.layer'
import { demoGridsLayer }                    from './demo.grids.layer'
import { demoIconsLayer }                    from './demo.icons.layer'
import { demoLayoutLayer }                   from './demo.layout.layer'
import { demoLeftBarLayer }                  from './demo.leftBar.layer'
import { demoListLayer }                     from './demo.list.layer'
import { demoProgressLayer }                 from './demo.progress.layer'
import { demoSafeZoneBottomLayer }           from './demo.safeZone.bottom.layer'
import { demoSafeZoneBottomCenterLayer }     from './demo.safeZone.bottomCenter.layer'
import { demoSafeZoneBottomLeftLayer }       from './demo.safeZone.bottomLeft.layer'
import { demoSafeZoneBottomRightLayer }      from './demo.safeZone.bottomRight.layer'
import { demoSafeZoneDefaultLayer }          from './demo.safeZone.default.layer'
import { demoSafeZoneFullScreenLayer }       from './demo.safeZone.fullScreen.layer'
import { demoSafeZoneInteractableAreaLayer } from './demo.safeZone.interactableArea.layer'
import { demoSafeZoneLeftLayer }             from './demo.safeZone.left.layer'
import { demoSafeZoneLeftBottomLayer }       from './demo.safeZone.leftBottom.layer'
import { demoSafeZoneLeftTopLayer }          from './demo.safeZone.leftTop.layer'
import { demoSafeZoneRightLayer }            from './demo.safeZone.right.layer'
import { demoSafeZoneRightBottomLayer }      from './demo.safeZone.rightBottom.layer'
import { demoSafeZoneRightTopLayer }         from './demo.safeZone.rightTop.layer'
import { demoSafeZoneTopLayer }              from './demo.safeZone.top.layer'
import { demoSafeZoneTopCenterLayer }        from './demo.safeZone.topCenter.layer'
import { demoSafeZoneTopLeftLayer }          from './demo.safeZone.topLeft.layer'
import { demoSafeZoneTopRightLayer }         from './demo.safeZone.topRight.layer'
import { demoSafeZonesLayer }                from './demo.safeZones.layer'
import { demoSpriteIconLayer }               from './demo.spriteIcon.layer'
import { demoTextLayer }                     from './demo.text.layer'
import { demoToastsLayer }                   from './demo.toasts.layer'
import { demoToggleLayer }                   from './demo.toggle.layer'
import { infoLayer }                         from './info.layer'
import { timerLayer }                        from './timer.layer'


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

	demoLeftBarLayer,
	demoTextLayer,
	demoAnimationsLayer,
	demoProgressLayer,
	demoButtonsLayer,
	demoIconsLayer,
	demoSpriteIconLayer,
	demoGridsLayer,
	demoLayoutLayer,
	demoListLayer,
	demoBackgroundsLayer,
	demoToastsLayer,
	demoToggleLayer,
	demoSafeZonesLayer,
	infoLayer,
	//timerLayer,
	toastHostLayer,
]
