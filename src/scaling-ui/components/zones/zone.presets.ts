import { isMobile } from '@dcl/sdk/platform'
import { UiEntity } from '@dcl/sdk/react-ecs'

import { VisibilityController, type VisibilityPosition } from '../../classes/visibilityController'
import { getUiScaleFactor, readPhysicalCanvasDimensions, vhToPixels } from '../../utils'
import { getCanvasInfo, readPhysicalCanvasWidth, vwToPixels } from '../../utils/sizing'

export type { VisibilityPosition }


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
export function getOffscreenPosition(visibilityPosition: VisibilityPosition): number {
	const { height, width } = readPhysicalCanvasDimensions()
	const scale             = getUiScaleFactor()

	if (visibilityPosition === 'left' || visibilityPosition === 'right') {
		return -(width / scale)
	}
	return -(height / scale)
}


// MARK: resolveVisibilityEdges
/** Resolves showFrom / hideTo from optional overrides + zone preset default. */
export function resolveVisibilityEdges(
	presetEdge : VisibilityPosition,
	showFrom?  : VisibilityPosition,
	hideTo?    : VisibilityPosition,
): { showFrom: VisibilityPosition; hideTo: VisibilityPosition } {
	if (showFrom !== undefined && hideTo !== undefined) {
		return { showFrom, hideTo }
	}
	if (showFrom !== undefined) {
		return { showFrom, hideTo: showFrom }
	}
	if (hideTo !== undefined) {
		return { showFrom: hideTo, hideTo }
	}
	return { showFrom: presetEdge, hideTo: presetEdge }
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
export const LEFT_ZONE_INSET = isMobile() ? 8 : vwToPixels(3)

/** Top / bottom bar height fraction used by zone presets and toast docks. */
export const BAR_ZONE_HEIGHT = '23%'

/** Right bar width fraction used by zone presets and toast docks. */
export const RIGHT_ZONE_WIDTH = '25%'


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
			// Vertical: clear top/bottom bar bands (~23%) so demo nav can fit more buttons.
			width       : 'auto',
			minWidth    : vwToPixels(12.5) - LEFT_ZONE_INSET,
			maxWidth    : vwToPixels(25)   - LEFT_ZONE_INSET,
			positionType: 'absolute',
			position    : {
				top   : '12vh',
				bottom: '25vh',
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


export type CreateVisibilityForZoneOptions = {
	showFrom?: VisibilityPosition
	hideTo?  : VisibilityPosition
}


// MARK: createVisibilityForZone
/** Creates a VisibilityController for the given zone preset (optional edge overrides). */
export function createVisibilityForZone(
	zone    : ZoneType,
	options : CreateVisibilityForZoneOptions = {},
): VisibilityController {
	const presetEdge = zone === ZoneType.None
		? 'bottom' as VisibilityPosition
		: zonePresets[zone].visibilityPosition
	const edges = resolveVisibilityEdges(presetEdge, options.showFrom, options.hideTo)

	return new VisibilityController({
		showFrom            : edges.showFrom,
		hideTo              : edges.hideTo,
		getOffscreenPosition,
	})
}
