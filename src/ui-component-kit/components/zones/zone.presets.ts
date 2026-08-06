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
	TopRight         = 'topRight',
	TopLeft          = 'topLeft',
	LeftTop          = 'leftTop',
	Left             = 'left',
	LeftBottom       = 'leftBottom',
	RightTop         = 'rightTop',
	Right            = 'right',
	RightBottom      = 'rightBottom',
	Bottom           = 'bottom',
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

/** Mirror of `LEFT_ZONE_INSET` for right-edge side strips. */
export const RIGHT_ZONE_INSET = 8

/** Corner HUD side inset for TopLeft / TopRight. */
export const CORNER_SIDE_INSET = '20vw'

/** Bottom-left corner side inset. */
export const BOTTOM_LEFT_SIDE_INSET = '25vw'

/** Top / bottom bar height fraction used by zone presets and toast docks. */
export const BAR_ZONE_HEIGHT = '23%'

/** Side-strip width for Left* / Right* zone presets (and toast docks). */
export const RIGHT_ZONE_WIDTH = '25%'

type FlexAlign = 'flex-start' | 'center' | 'flex-end'

function leftSideTopInset(): `${number}vh` {
	return isMobile() ? '25vh' : '12vh'
}

function leftSideBottomInset(): `${number}vh` {
	return isMobile() ? '40vh' : '25vh'
}


// MARK: getLeftSideTransform
/**
 * Shared geometry for Left / LeftTop / LeftBottom.
 * Column flex: justifyContent = vertical, alignItems = horizontal.
 */
function getLeftSideTransform(justifyContent: FlexAlign): UiEntityTransform {
	return {
		width         : RIGHT_ZONE_WIDTH,
		positionType  : 'absolute',
		justifyContent,
		alignItems    : 'flex-start',
		position      : {
			top   : leftSideTopInset(),
			bottom: leftSideBottomInset(),
			left  : LEFT_ZONE_INSET,
		},
	}
}


// MARK: getRightSideTransform
/**
 * Shared geometry for Right / RightTop / RightBottom.
 * Column flex: justifyContent = vertical, alignItems = horizontal.
 */
function getRightSideTransform(justifyContent: FlexAlign): UiEntityTransform {
	return {
		width         : RIGHT_ZONE_WIDTH,
		positionType  : 'absolute',
		justifyContent,
		alignItems    : 'flex-end',
		position      : {
			top   : leftSideTopInset(),
			bottom: leftSideBottomInset(),
			right : RIGHT_ZONE_INSET,
		},
	}
}


// MARK: zonePresets
export const zonePresets: Record<Exclude<ZoneType, ZoneType.None>, ZonePreset> = {
	[ZoneType.FullScreen]: {
		getUiTransform: () => ({
			height        : '100%',
			width         : '100%',
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
					bottom: area.bottom,
					left  : area.left,
					right : area.right,
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

	[ZoneType.Top]: {
		getUiTransform: () => ({
			height        : BAR_ZONE_HEIGHT,
			width         : '50%',
			positionType  : 'absolute',
			position      : { top: 8 },
			justifyContent: 'flex-start',
			alignItems    : 'center',
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopRight]: {
		getUiTransform: () => ({
			height        : BAR_ZONE_HEIGHT,
			width         : '25%',
			positionType  : 'absolute',
			position      : { top: 8, right: CORNER_SIDE_INSET },
			justifyContent: 'flex-start',
			alignItems    : 'flex-end',
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.TopLeft]: {
		getUiTransform: () => ({
			height        : BAR_ZONE_HEIGHT,
			width         : '25%',
			positionType  : 'absolute',
			position      : { top: 8, left: CORNER_SIDE_INSET },
			justifyContent: 'flex-start',
			alignItems    : 'flex-start',
		}),
		visibilityPosition: 'top',
	},

	[ZoneType.Bottom]: {
		getUiTransform: () => ({
			height        : BAR_ZONE_HEIGHT,
			width         : '50%',
			positionType  : 'absolute',
			position      : { bottom: 8 },
			justifyContent: 'flex-end',
			alignItems    : 'center',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomRight]: {
		getUiTransform: () => ({
			height        : BAR_ZONE_HEIGHT,
			width         : vwToPixels(25) - RIGHT_ZONE_INSET,
			positionType  : 'absolute',
			position      : { bottom: 8, right: RIGHT_ZONE_INSET },
			justifyContent: 'flex-end',
			alignItems    : 'flex-end',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomLeft]: {
		getUiTransform: () => ({
			height        : BAR_ZONE_HEIGHT,
			width         : '25%',
			positionType  : 'absolute',
			position      : { bottom: 8, left: BOTTOM_LEFT_SIDE_INSET },
			justifyContent: 'flex-end',
			alignItems    : 'flex-start',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.LeftTop]: {
		getUiTransform: () => getLeftSideTransform('flex-start'),
		visibilityPosition: 'left',
	},

	[ZoneType.Left]: {
		getUiTransform: () => getLeftSideTransform('center'),
		visibilityPosition: 'left',
	},

	[ZoneType.LeftBottom]: {
		getUiTransform: () => getLeftSideTransform('flex-end'),
		visibilityPosition: 'left',
	},

	[ZoneType.RightTop]: {
		getUiTransform: () => getRightSideTransform('flex-start'),
		visibilityPosition: 'right',
	},

	[ZoneType.Right]: {
		getUiTransform: () => getRightSideTransform('center'),
		visibilityPosition: 'right',
	},

	[ZoneType.RightBottom]: {
		getUiTransform: () => getRightSideTransform('flex-end'),
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
