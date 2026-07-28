import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox } from 'src/scaling-ui/components'
import { Layer } from 'src/scaling-ui/components/layers'
import { ZoneType } from 'src/scaling-ui/components/zones/zone.presets'
import { getTheme } from 'src/scaling-ui/styles'
import { getCanvasInfo, getUiScaleFactor, readCanvasDimensions } from 'src/scaling-ui/utils/sizing'


// MARK: formatCanvasDebugInfo
/** Compact canvas / virtual-scale readout for the example info HUD. */
function formatCanvasDebugInfo(): string {
	const canvas = getCanvasInfo()
	if (!canvas) return `ERROR UiCanvasInformation missing on RootEntity`

	const virtual     = readCanvasDimensions()
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
		`canvas   ${canvas.width}x${canvas.height}`,
		`virtual  ${virtual.width}x${virtual.height}`,
		`uiScale  ${uiScale.toFixed(4)}`,
		`dpr      ${dpr}`,
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
			id       : 'info',
			zone     : ZoneType.BottomRight,
			showFrame: true,
		})
	}


	// MARK: body
	protected body() {
		const theme   = getTheme()
		const canvas  = getCanvasInfo()
		const readout = formatCanvasDebugInfo()

		return (
			<UiBox
				backgroundColor={theme.colors.body}
				uiTransform={{
					padding: { top: 12, right: 12, bottom: 12, left: 12 },
				}}
				uiText={{
					value    : readout,
					//fontSize : theme.typography.size.code,
					font     : theme.typography.family.code,
					color    : canvas ? theme.colors.warning : theme.colors.danger,
					textAlign: 'top-left',
				}}
			/>
		)
	}
}

export const infoLayer = new InfoLayer()
