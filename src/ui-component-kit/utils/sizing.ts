import { engine, PBUiCanvasInformation, UiCanvasInformation } from '@dcl/sdk/ecs'
import { isMobile } from '@dcl/sdk/platform'

/** Desktop virtual design canvas (default until `syncVirtualCanvasToPlatform`). */
const DESKTOP_VIRTUAL = { width: 1920, height: 1080 } as const
/** Mobile virtual design canvas — smaller than desktop so numeric/`px` UI reads larger. */
const MOBILE_VIRTUAL  = { width: 1600,  height: 720  } as const

/**
 * Live virtual canvas size used by kit math and SetupUiComponentKit.
 * Do not read these at module top-level to pick a platform — call
 * `syncVirtualCanvasToPlatform()` from Setup (isMobile is unreliable at import time).
 */
export let vWidth : number = DESKTOP_VIRTUAL.width
export let vHeight: number = DESKTOP_VIRTUAL.height


// MARK: syncVirtualCanvasToPlatform
/**
 * Resolves desktop vs mobile virtual size via `isMobile()` and updates `vWidth` / `vHeight`.
 * Must run from `SetupUiComponentKit` (or equivalent) before the renderer is mounted —
 * not at module import time.
 */
export function syncVirtualCanvasToPlatform(): { width: number; height: number } {
	const next = isMobile() ? MOBILE_VIRTUAL : DESKTOP_VIRTUAL
	vWidth  = next.width
	vHeight = next.height
	return { width: vWidth, height: vHeight }
}


// MARK: getCanvasInfo
/** Physical client canvas from the engine (changes with viewport size). */
export function getCanvasInfo(): PBUiCanvasInformation | null {
	return UiCanvasInformation.getOrNull(engine.RootEntity)
}


// MARK: readVirtualCanvasDimensions
/** Virtual canvas size configured by SetupUiComponentKit. */
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


// MARK: readPhysicalCanvasWidth
export function readPhysicalCanvasWidth(): number {
	return readPhysicalCanvasDimensions().width
}


// MARK: readPhysicalCanvasHeight
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
