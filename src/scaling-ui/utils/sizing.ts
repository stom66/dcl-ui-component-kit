import { engine, PBUiCanvasInformation, UiCanvasInformation } from '@dcl/sdk/ecs'
import { isMobile } from '@dcl/sdk/platform'

export const [vWidth, vHeight] = isMobile() ? [1600, 720]: [1920, 1080]


// MARK: getCanvasInfo
/** Physical client canvas from the engine (changes with viewport size). */
export function getCanvasInfo(): PBUiCanvasInformation | null {
	return UiCanvasInformation.getOrNull(engine.RootEntity)
}


// MARK: readCanvasDimensions
/** Virtual canvas size configured by SetupScalingUI. */
export function readVirtualCanvasDimensions(): { height: number; width: number } {
	return { height: vHeight, width: vWidth }
}



// MARK: getUiScaleFactor
/**
 * Mirrors @dcl/react-ecs UiScaleSystem:
 * min(realW/virtualW, realH/virtualH) / devicePixelRatio
 * Numeric pixel/position values are multiplied by this factor at parse time.
 */
export function getUiScaleFactor(): number {
	const canvas = getCanvasInfo()
	if (!canvas) return 1

	const ratio = canvas.devicePixelRatio || 1
	return Math.min(
		canvas.width  / vWidth,
		canvas.height / vHeight
	) / ratio
}


// MARK: readPhysicalCanvasDimensions
/** Live engine canvas size; falls back to virtual size before canvas info exists. */
export function readPhysicalCanvasDimensions(): { height: number; width: number } {
	const canvas = getCanvasInfo()
	if (!canvas) return readVirtualCanvasDimensions()

	return { height: canvas.height, width: canvas.width }
}
	export function readPhysicalCanvasWidth(): number {
		return readPhysicalCanvasDimensions().width
	}
	export function readPhysicalCanvasHeight(): number {
		return readPhysicalCanvasDimensions().height
	}


// MARK: vhToPixels
export function vhToPixels(
	vh : number,
	min: number = 0,
	max: number = 99999
): number {
	return Math.max(min, Math.min(max, (vh / 100) * vHeight))
}


// MARK: vwToPixels
export function vwToPixels(
	vw : number,
	min: number = 0,
	max: number = 99999
): number {
	return Math.max(min, Math.min(max, (vw / 100) * vWidth))
}
