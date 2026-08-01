import { isMobile } from '@dcl/sdk/platform'
import { UiEntity } from '@dcl/sdk/react-ecs'

import { VisibilityController } from '../../classes/visibilityController'
import { getUiScaleFactor, readPhysicalCanvasDimensions, vhToPixels } from '../../utils'
import { getCanvasInfo, readPhysicalCanvasWidth, vwToPixels } from '../../utils/sizing'


type UiEntityTransform = NonNullable<Parameters<typeof UiEntity>[0]['uiTransform']>

// MARK: ZoneType
export enum ZoneType {
	None             = 'none',
	Default          = 'default',
	FullScreen       = 'fullScreen',
	InteractableArea = 'interactableArea',
	Top              = 'top',
	TopRight         = 'topRight',
	TopLeft          = 'topLeft',
	Left             = 'left',
	Right            = 'right',
	Bottom           = 'bottom',
	BottomRight      = 'bottomRight',
	BottomLeft       = 'bottomLeft',
}


export type VisibilityPosition = 'bottom' | 'left' | 'right' | 'top'

export type ZonePreset = {
	getUiTransform     : () => UiEntityTransform
	visibilityPosition : VisibilityPosition
}

const m = isMobile()


// MARK: getOffscreenPosition
/**
 * Off-canvas offset in virtual pixels.
 * DCL scales virtual pixels by min(real/virtual), while % parents still use the real
 * screen — so travel distance is realSize / scaleFactor, not virtual size alone.
 */
function getOffscreenPosition(visibilityPosition: VisibilityPosition): number {
	const { height, width } = readPhysicalCanvasDimensions()
	const scale             = getUiScaleFactor()

	if (visibilityPosition === 'left' || visibilityPosition === 'right') {
		return -(width / scale)
	}
	return -(height / scale)
}

function getInteractableArea(): { top: number; bottom: number; left: number; right: number } {
	const canvas = getCanvasInfo()
	if (!canvas) return { top: 0, bottom: 0, left: 0, right: 0 }
	return { top: canvas.interactableArea?.top ?? 0, bottom: canvas.interactableArea?.bottom ?? 0, left: canvas.interactableArea?.left ?? 0, right: canvas.interactableArea?.right ?? 0 }
}


/**
 * Temporary left offset for zones that hug the left edge.
 * Clear of the explorer left rail (settings / places / events) until we wire
 * `UiCanvasInformation.interactableArea.left` as a live inset (see info HUD).
 * `screenInsetArea` is hardware-only and already handled by `ScreenInsetArea`.
 */
const LEFT_ZONE_INSET = 56


// MARK: zonePresets
export const zonePresets: Record<Exclude<ZoneType, ZoneType.None>, ZonePreset> = {
	[ZoneType.FullScreen]: {
		getUiTransform: () => ({
			height: '100%',
			width : '100%',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.InteractableArea]: {
		getUiTransform: () => ({
			height : "100%",
			width  : "100%",
			padding: { top:  getInteractableArea().top, bottom: getInteractableArea().bottom, left: getInteractableArea().left, right: getInteractableArea().right },
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.Default]: {
		getUiTransform: () => ({
			height: vhToPixels(50),
			width : vwToPixels(50),
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.Top]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : '50%',
			positionType: 'absolute',
			position    : { top: 8 },
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopRight]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : '25%',
			positionType: 'absolute',
			position    : { top: 8, right: 8 },
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopLeft]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : '25%',
			positionType: 'absolute',
			position    : { top: 8, left: LEFT_ZONE_INSET },
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.Bottom]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : '50%',
			positionType: 'absolute',
			position    : { bottom: 8 },
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomRight]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : vwToPixels(25) - 8,
			positionType: 'absolute',
			position    : { bottom: 8, right: 8 },
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomLeft]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : vwToPixels(25) - LEFT_ZONE_INSET,
			positionType: 'absolute',
			position    : { bottom: 8, left: LEFT_ZONE_INSET },
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.Left]: {
		getUiTransform: () => ({
			// Content-sized width; clamp to (12.5%|25%) vw − left rail inset.
			// Yoga has no calc(), so min/max use vwToPixels (reliable for widths).
			width       : 'auto',
			minWidth    : vwToPixels(12.5) - LEFT_ZONE_INSET,
			maxWidth    : vwToPixels(25)   - LEFT_ZONE_INSET,
			positionType: 'absolute',
			position    : {
				top   : '12vh',
				bottom: '56vh',
				left  : LEFT_ZONE_INSET,
			},
		}),
		visibilityPosition: 'left',
	},

	[ZoneType.Right]: {
		getUiTransform: () => ({
			height      : '100%',
			width       : '25%',
			positionType: 'absolute',
			position    : { right: 8, top: 0 },
		}),
		visibilityPosition: 'right',
	},
}


// MARK: createVisibilityForZone
/** Creates a VisibilityController for the given zone preset. */
export function createVisibilityForZone(zone: ZoneType): VisibilityController {
	if (zone === ZoneType.None) {
		return new VisibilityController(0, () => getOffscreenPosition('bottom'))
	}

	const preset = zonePresets[zone]
	return new VisibilityController(0, () => getOffscreenPosition(preset.visibilityPosition))
}
