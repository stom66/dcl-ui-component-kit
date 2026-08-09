import { isDesktop, isMobile } from '@dcl/sdk/platform'
import ReactEcs from '@dcl/sdk/react-ecs'
import { alpha, atlasIconsFontAwesome, Background, Column, getTheme, Icon, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'
import { getCanvasInfo, getUiScaleFactor, readPhysicalCanvasDimensions, readVirtualCanvasDimensions } from '../../../ui-component-kit/utils/sizing'

// MARK: formatCanvasDebugInfo
/**
 * Compact canvas / virtual-scale readout for the example info HUD (platform line excluded —
 * that row is rendered with an Icon + label in `body()`).
 * On phone landscape, aim for uiScale near ~0.9–1.2 after the mobile virtual canvas (800×360).
 * If virtual shows 1920×1080 on a phone, platform detection failed at Setup.
 */
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
		`canvas - virtual  ${virtual.width}x${virtual.height}`,
		`canvas - physical ${physical.width}x${physical.height}`,
		`canvasInfo:       ${canvas.width}x${canvas.height}`,
		`canvasInfo.dpr:   ${dpr.toFixed(4)}`,

		`uiScale:          ${uiScale.toFixed(4)}`,
		`fit by:           ${fitBy}`,
	]

	if (canvas.screenInsetArea) {
		const insets = canvas.screenInsetArea
		lines.push(`insets           t${insets.top} l${insets.left} r${insets.right} b${insets.bottom}`)
	}

	if (canvas.interactableArea) {
		const safe = canvas.interactableArea
		lines.push(`safe              t${safe.top} l${safe.left} r${safe.right} b${safe.bottom}`)
	}

	return lines.join('\n')
}


// MARK: InfoLayer
/** Example single-zone layer: bottom-right canvas debug HUD. */
export class InfoLayer extends Layer {
	constructor() {
		super({
			id    : 'info',
			zone  : ZoneType.BottomRight,
			// Above demo safe-zone overlays (zIndex 0) and the safe-zones panel (100).
			zIndex: 200,
			uiTransform: {
				width : '20vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme      = getTheme()
		const readout    = formatCanvasDebugInfo()
		const fontSize   = theme.typography.size.code + 1
		const isPhone    = isMobile()
		const platform   = isPhone ? 'Mobile' : isDesktop() ? 'Desktop' : 'Other'
		// Atlas has `phone` but no desktop/laptop — `terminal` is the closest computer stand-in.
		const platformUv = isPhone
			? atlasIconsFontAwesome.uv.phone
			: atlasIconsFontAwesome.uv.terminal
		const iconSize   = fontSize + 4

		return [
			<Background key="chrome" backgroundColor={alpha(theme.colors.body, 0.5)} />,
			<Column
				key            = "body"
				cols           = {12}
				spacing        = {2}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 12, right: 12, bottom: 12, left: 12 }}
			>
				<Row
					key            = "platform"
					alignItems     = "center"
					justifyContent = "flex-start"
				>
					<Icon
						uvs    = {platformUv}
						width  = {iconSize}
						height = {iconSize}
						margin = {{ right: 6 }}
					/>
					<Text
						value     = {platform}
						fontSize  = {fontSize}
						font      = {theme.typography.family.code}
						textAlign = "middle-left"
					/>
				</Row>
				<Text
					key       = "readout"
					value     = {readout}
					fontSize  = {fontSize}
					font      = {theme.typography.family.code}
					textAlign = "top-left"
				/>
			</Column>,
		]
	}
}

export const infoLayer = new InfoLayer()
