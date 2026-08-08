import { isMobile } from '@dcl/sdk/platform'
import { UiEntity } from '@dcl/sdk/react-ecs'

import { VisibilityController, type VisibilityPosition } from '../../classes/visibilityController'
import { getUiScaleFactor, readPhysicalCanvasDimensions, vhToPixels } from '../../utils'
import { getCanvasInfo, vwToPixels } from '../../utils/sizing'

export type { VisibilityPosition }


type UiEntityTransform = NonNullable<Parameters<typeof UiEntity>[0]['uiTransform']>

// MARK: ZoneType
export enum ZoneType {
	None             = 'none',
	Default          = 'default',
	FullScreen       = 'fullScreen',
	InteractableArea = 'interactableArea',
	Top              = 'top',
	TopCenter        = 'topCenter',
	TopRight         = 'topRight',
	TopLeft          = 'topLeft',
	LeftTop          = 'leftTop',
	Left             = 'left',
	LeftBottom       = 'leftBottom',
	RightTop         = 'rightTop',
	Right            = 'right',
	RightBottom      = 'rightBottom',
	Bottom           = 'bottom',
	BottomCenter     = 'bottomCenter',
	BottomRight      = 'bottomRight',
	BottomLeft       = 'bottomLeft',
}

export type ZonePreset = {
	getUiTransform     : () => UiEntityTransform
	visibilityPosition : VisibilityPosition
}


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

function getInteractableArea(): { top: number; right: number; bottom: number; left: number } {
	const canvas = getCanvasInfo()
	if (!canvas) return { top: 0, right: 0, bottom: 0, left: 0 }
	return {
		top   : canvas.interactableArea?.top ?? 0,
		right : canvas.interactableArea?.right ?? 0,
		bottom: canvas.interactableArea?.bottom ?? 0,
		left  : canvas.interactableArea?.left ?? 0,
	}
}


/**
 * Temporary left offset for zones that hug the left edge.
 * Clear of the explorer left rail (settings / places / events) until we wire
 * `UiCanvasInformation.interactableArea.left` as a live inset (see info HUD).
 * `screenInsetArea` is hardware-only and already handled by `ScreenInsetArea`.
 */
export const LEFT_ZONE_INSET = isMobile() ? 0 : vwToPixels(3)

/** Mirror of `LEFT_ZONE_INSET` for right-edge side strips. */
export const RIGHT_ZONE_INSET = 8


// MARK: zonePresets
/**
 * Center-aligned slots (Default / Top / TopCenter / Bottom / BottomCenter /
 * Left / Right) use explicit width + height so the box stays sized and can
 * sit at the midpoint. TopLeft / TopRight share Top’s band and row layout,
 * differing only in start / end alignment. Other corner / edge slots stretch
 * with opposing position edges (top+bottom, etc.).
 */
export const zonePresets: Record<Exclude<ZoneType, ZoneType.None>, ZonePreset> = {
	[ZoneType.FullScreen]: {
		getUiTransform: () => ({
			positionType  : 'absolute',
			position      : {
				top   : 0,
				right : 0,
				bottom: 0,
				left  : 0,
			},
			justifyContent: 'center',
			alignItems    : 'center',
		}),
		visibilityPosition: 'bottom',
	},

	// Inset the zone box itself to the explorer interactable rect (not padding —
	// absolute children would ignore padding and still paint full-bleed).
	[ZoneType.InteractableArea]: {
		getUiTransform: () => {
			const area = getInteractableArea()
			return {
				positionType  : 'absolute',
				position      : {
					top   : area.top,
					right : area.right,
					bottom: area.bottom,
					left  : area.left,
				},
				justifyContent: 'center',
				alignItems    : 'center',
			}
		},
		visibilityPosition: 'bottom',
	},

	[ZoneType.Default]: {
		getUiTransform: () => ({
			height        : vhToPixels(50),
			width         : vwToPixels(50),
			justifyContent: 'center',
			alignItems    : 'center',
		}),
		visibilityPosition: 'bottom',
	},

	// MARK: Top
	[ZoneType.Top]: {
		getUiTransform: () => ({
			height        : '23%',
			positionType  : 'absolute',
			position      : {
				top  : 8,
				right: isMobile() ? '20vw' : 8,
				left : isMobile() ? '32vw' : '17.5vw',
			},
			justifyContent: 'center',
			alignItems    : 'flex-start',
			flexDirection : 'row',
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopCenter]: {
		getUiTransform: () => ({
			height        : '23%',
			width         : '50%',
			alignSelf     : 'flex-start',
			positionType  : 'absolute',
			position      : {
				top : 8,
				left: '25%',
			},
			justifyContent: 'center',
			alignItems    : 'flex-start',
			flexDirection : 'row',
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopRight]: {
		getUiTransform: () => ({
			height        : '23%',
			positionType  : 'absolute',
			position      : {
				top  : 8,
				right: isMobile() ? '20vw' : 8,
				left : isMobile() ? '32vw' : '17.5vw',
			},
			justifyContent: 'flex-end',
			alignItems    : 'flex-start',
			flexDirection : 'row',
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopLeft]: {
		getUiTransform: () => ({
			height        : '23%',
			positionType  : 'absolute',
			position      : {
				top  : 8,
				right: isMobile() ? '20vw' : 8,
				left : isMobile() ? '32vw' : '17.5vw',
			},
			justifyContent: 'flex-start',
			alignItems    : 'flex-start',
			flexDirection : 'row',
		}),
		visibilityPosition: 'top',
	},


	// MARK: Right
	[ZoneType.RightTop]: {
		getUiTransform: () => ({
			positionType  : 'absolute',
			position      : {
				top   : isMobile() ? '25vh' : 8,
				right : RIGHT_ZONE_INSET,
				bottom: isMobile() ? '60vh' : 8,
				left  : '75%',
			},
			justifyContent: 'flex-start',
			alignItems    : 'flex-end',
		}),
		visibilityPosition: 'right',
	},

	[ZoneType.Right]: {
		getUiTransform: () => ({
			positionType  : 'absolute',
			position      : {
				top   : isMobile() ? '25vh' : 8,
				right : RIGHT_ZONE_INSET,
				bottom: isMobile() ? '60vh' : 8,
				left  : '75%',
			},
			justifyContent: 'center',
			alignItems    : 'flex-end',
		}),
		visibilityPosition: 'right',
	},

	[ZoneType.RightBottom]: {
		getUiTransform: () => ({
			positionType  : 'absolute',
			position      : {
				top   : isMobile() ? '25vh' : 8,
				right : RIGHT_ZONE_INSET,
				bottom: isMobile() ? '60vh' : 8,
				left  : '75%',
			},
			justifyContent: 'flex-end',
			alignItems    : 'flex-end',
		}),
		visibilityPosition: 'right',
	},


	// MARK: Bottom
	[ZoneType.Bottom]: {
		getUiTransform: () => ({
			height        : '25%',
			positionType  : 'absolute',
			position      : {
				right : isMobile() ? '22.5%' : 8,
				bottom: 8,
				left  : isMobile() ? '22.5%' : '22%',
			},
			justifyContent: 'center',
			alignItems    : 'flex-end',
			flexDirection : 'row',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomCenter]: {
		getUiTransform: () => ({
			height        : '25%',
			width         : '50%',
			positionType  : 'absolute',
			position      : {
				right : '25%',
				bottom: 8,
				left  : '25%',
			},
			justifyContent: 'center',
			alignItems    : 'flex-end',
			flexDirection : 'row',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomRight]: {
		getUiTransform: () => ({
			height        : '25%',
			positionType  : 'absolute',
			position      : {
				right : isMobile() ? '22.5%' : 8,
				bottom: 8,
				left  : isMobile() ? '22.5%' : '22%',
			},
			justifyContent: 'flex-end',
			alignItems    : 'flex-end',
			flexDirection : 'row',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomLeft]: {
		getUiTransform: () => ({
			height        : '25%',
			positionType  : 'absolute',
			position      : {
				right : isMobile() ? '22.5%' : 8,
				bottom: 8,
				left  : isMobile() ? '22.5%' : '22%',
			},
			justifyContent: 'flex-start',
			alignItems    : 'flex-end',
			flexDirection : 'row',
		}),
		visibilityPosition: 'bottom',
	},


	// MARK: Left
	[ZoneType.LeftTop]: {
		getUiTransform: () => ({
			positionType  : 'absolute',
			position      : {
				top   : isMobile() ? '25vh' : '12vh',
				right : '75%',
				bottom: isMobile() ? '40vh' : '6vh',
				left  : LEFT_ZONE_INSET,
			},
			justifyContent: 'flex-start',
			alignItems    : 'flex-start',
		}),
		visibilityPosition: 'left',
	},

	[ZoneType.Left]: {
		getUiTransform: () => ({
			// Strip from top→bottom; content shrink-wraps and centers vertically.
			// (height/flexGrow on an absolute top+bottom box cannot shrink the strip.)
			positionType  : 'absolute',
			position      : {
				top   : isMobile() ? '25vh' : '12vh',
				right : '75%',
				bottom: isMobile() ? '40vh' : '6vh',
				left  : LEFT_ZONE_INSET,
			},
			justifyContent: 'center',
			alignItems    : 'flex-start',
		}),
		visibilityPosition: 'left',
	},

	[ZoneType.LeftBottom]: {
		getUiTransform: () => ({
			positionType  : 'absolute',
			position      : {
				top   : isMobile() ? '25vh' : '12vh',
				right : '75%',
				bottom: isMobile() ? '40vh' : '6vh',
				left  : LEFT_ZONE_INSET,
			},
			justifyContent: 'flex-end',
			alignItems    : 'flex-start',
		}),
		visibilityPosition: 'left',
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
