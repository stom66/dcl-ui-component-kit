import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { Background } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { getCanvasInfo, getUiScaleFactor, readVirtualCanvasDimensions, readPhysicalCanvasDimensions } from '../../utils/sizing'


// MARK: formatCanvasDebugInfo
/** Compact canvas / virtual-scale readout for the example info HUD. */
function formatCanvasDebugInfo(): string {
	const canvas = getCanvasInfo()
	if (!canvas) return `ERROR UiCanvasInformation missing on RootEntity`

	const virtual     = readVirtualCanvasDimensions()
	const physical    = readPhysicalCanvasDimensions()
	const uiScale     = getUiScaleFactor()

	const dpr         = canvas.devicePixelRatio
	const widthScale  = canvas.width  / virtual.width
	const heightScale = canvas.height / virtual.height
	const fitBy       = widthScale < heightScale
		? 'width'
		: heightScale < widthScale
			? 'height'
			: 'equal'

	const lines = [
		`canvas: virtual  ${virtual.width}x${virtual.height}`,
		`canvas: physical ${physical.width}x${physical.height}`,
		`canvasInfo       ${canvas.width}x${canvas.height}`,
		`canvasInfo.dpr   ${dpr.toFixed(4)}`,

		`uiScale  ${uiScale.toFixed(4)}`,
		`fit by   ${fitBy}`,
	]

	if (canvas.screenInsetArea) {
		const insets = canvas.screenInsetArea
		lines.push(`insets   t${insets.top} l${insets.left} r${insets.right} b${insets.bottom}`)
	}

	if (canvas.interactableArea) {
		const safe = canvas.interactableArea
		lines.push(`safe     t${safe.top} l${safe.left} r${safe.right} b${safe.bottom}`)
	}

	return lines.join('\n')
}


// MARK: InfoLayer
/** Example single-zone layer: bottom-right canvas debug HUD. */
export class InfoLayer extends Layer {
	constructor() {
		super({
			id  : 'info',
			zone: ZoneType.BottomRight,
		})
	}


	// MARK: body
	protected body() {
		const theme   = getTheme()
		const canvas  = getCanvasInfo()
		const readout = formatCanvasDebugInfo()

		return (
			<Background
				uiTransform={{
					padding: { top: 12, right: 12, bottom: 12, left: 12 },
				}}
				uiText={{
					value    : readout,
					fontSize : scaleFontSize(theme.typography.size.code),
					font     : theme.typography.family.code,
					textAlign: 'top-left',
				}}
			/>
		)
	}
}

export const infoLayer = new InfoLayer()
