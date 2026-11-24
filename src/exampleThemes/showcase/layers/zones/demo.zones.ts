import type { Layer } from '../../../../ui-component-kit'

import type { FaIconName } from '../nav/demo.sidebar.layer'

import { demoSafeZoneBottomLayer } from './demo.safeZone.bottom.layer'
import { demoSafeZoneBottomCenterLayer } from './demo.safeZone.bottomCenter.layer'
import { demoSafeZoneBottomLeftLayer } from './demo.safeZone.bottomLeft.layer'
import { demoSafeZoneBottomRightLayer } from './demo.safeZone.bottomRight.layer'
import { demoSafeZoneDefaultLayer } from './demo.safeZone.default.layer'
import { demoSafeZoneFullScreenLayer } from './demo.safeZone.fullScreen.layer'
import { demoSafeZoneInteractableAreaLayer } from './demo.safeZone.interactableArea.layer'
import { demoSafeZoneLeftLayer } from './demo.safeZone.left.layer'
import { demoSafeZoneLeftBottomLayer } from './demo.safeZone.leftBottom.layer'
import { demoSafeZoneLeftTopLayer } from './demo.safeZone.leftTop.layer'
import { demoSafeZoneRightLayer } from './demo.safeZone.right.layer'
import { demoSafeZoneRightBottomLayer } from './demo.safeZone.rightBottom.layer'
import { demoSafeZoneRightTopLayer } from './demo.safeZone.rightTop.layer'
import { demoSafeZoneTopLayer } from './demo.safeZone.top.layer'
import { demoSafeZoneTopCenterLayer } from './demo.safeZone.topCenter.layer'
import { demoSafeZoneTopLeftLayer } from './demo.safeZone.topLeft.layer'
import { demoSafeZoneTopRightLayer } from './demo.safeZone.topRight.layer'


export type ZonePreview = {
	id   : string
	label: string
	icon : FaIconName
	layer: Layer
}

/**
 * One preview overlay per ZoneType, in sidebar order. Each toggles on its own,
 * so several zones can be compared at once.
 */
export const ZONE_PREVIEWS: ZonePreview[] = [
	{ id: 'btn_zone_default',          label: 'Default',            icon: 'compress',    layer: demoSafeZoneDefaultLayer },
	{ id: 'btn_zone_full_screen',      label: 'FullScreen',         icon: 'expand',      layer: demoSafeZoneFullScreenLayer },
	{ id: 'btn_zone_interactable',     label: 'Interactable inset', icon: 'handPointer', layer: demoSafeZoneInteractableAreaLayer },
	{ id: 'btn_zone_top_left',         label: 'TopLeft',            icon: 'arrowUp',     layer: demoSafeZoneTopLeftLayer },
	{ id: 'btn_zone_top',              label: 'Top',                icon: 'arrowUp',     layer: demoSafeZoneTopLayer },
	{ id: 'btn_zone_top_center',       label: 'TopCenter',          icon: 'arrowUp',     layer: demoSafeZoneTopCenterLayer },
	{ id: 'btn_zone_top_right',        label: 'TopRight',           icon: 'arrowUp',     layer: demoSafeZoneTopRightLayer },
	{ id: 'btn_zone_left_top',         label: 'LeftTop',            icon: 'arrowLeft',   layer: demoSafeZoneLeftTopLayer },
	{ id: 'btn_zone_left',             label: 'Left',               icon: 'arrowLeft',   layer: demoSafeZoneLeftLayer },
	{ id: 'btn_zone_left_bottom',      label: 'LeftBottom',         icon: 'arrowLeft',   layer: demoSafeZoneLeftBottomLayer },
	{ id: 'btn_zone_right_top',        label: 'RightTop',           icon: 'arrowRight',  layer: demoSafeZoneRightTopLayer },
	{ id: 'btn_zone_right',            label: 'Right',              icon: 'arrowRight',  layer: demoSafeZoneRightLayer },
	{ id: 'btn_zone_right_bottom',     label: 'RightBottom',        icon: 'arrowRight',  layer: demoSafeZoneRightBottomLayer },
	{ id: 'btn_zone_bottom_left',      label: 'BottomLeft',         icon: 'arrowDown',   layer: demoSafeZoneBottomLeftLayer },
	{ id: 'btn_zone_bottom',           label: 'Bottom',             icon: 'arrowDown',   layer: demoSafeZoneBottomLayer },
	{ id: 'btn_zone_bottom_center',    label: 'BottomCenter',       icon: 'arrowDown',   layer: demoSafeZoneBottomCenterLayer },
	{ id: 'btn_zone_bottom_right',     label: 'BottomRight',        icon: 'arrowDown',   layer: demoSafeZoneBottomRightLayer },
]

/** Every zone preview layer — register these with SetupUiComponentKit. */
export const zonePreviewLayers: Layer[] = ZONE_PREVIEWS.map((zone) => zone.layer)


// MARK: hideAllZonePreviews
/** Hides every ZoneType preview overlay. */
export function hideAllZonePreviews() {
	for (const { layer } of ZONE_PREVIEWS) {
		if (!layer.visibility.isHidden || !layer.visibility.isFullyHidden) {
			layer.hide()
		}
	}
}
