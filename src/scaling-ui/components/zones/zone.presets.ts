import { UiEntity } from '@dcl/sdk/react-ecs'

import { VisibilityController } from '../../classes/visibilityController'
import {
	getUiScaleFactor,
	readPhysicalCanvasDimensions,
	vhToPixels,
} from 'src/scaling-ui/utils'


type UiEntityTransform = NonNullable<Parameters<typeof UiEntity>[0]['uiTransform']>

// MARK: ZoneType
export enum ZoneType {
	None        = 'none',
	Default     = 'default',
	FullScreen  = 'fullScreen',
	Top         = 'top',
	TopRight    = 'topRight',
	TopLeft     = 'topLeft',
	Left        = 'left',
	Right       = 'right',
	Bottom      = 'bottom',
	BottomRight = 'bottomRight',
	BottomLeft  = 'bottomLeft',
}


export type VisibilityPosition = 'bottom' | 'left' | 'right' | 'top'

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
function getOffscreenPosition(visibilityPosition: VisibilityPosition): number {
	const { height, width } = readPhysicalCanvasDimensions()
	const scale             = getUiScaleFactor()

	if (visibilityPosition === 'left' || visibilityPosition === 'right') {
		return -(width / scale)
	}
	return -(height / scale)
}


// MARK: zonePresets
export const zonePresets: Record<Exclude<ZoneType, ZoneType.None>, ZonePreset> = {
	[ZoneType.FullScreen]: {
		getUiTransform: () => ({
			height: '100%',
			width : '100%',
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.Default]: {
		getUiTransform: () => ({
			height: vhToPixels(50),
			width : vhToPixels(75),
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
			position    : { top: 8, left: 8 },
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
			width       : '25%',
			positionType: 'absolute',
			position    : { bottom: 8, right: 8 },
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.BottomLeft]: {
		getUiTransform: () => ({
			height      : '23%',
			width       : '25%',
			positionType: 'absolute',
			position    : { bottom: 8, left: 8 },
		}),
		visibilityPosition: 'bottom',
	},

	[ZoneType.Left]: {
		getUiTransform: () => ({
			height      : '100%',
			width       : '25%',
			positionType: 'absolute',
			position    : { left: 8 },
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
