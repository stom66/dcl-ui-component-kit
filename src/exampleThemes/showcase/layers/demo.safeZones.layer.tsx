import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, ButtonText, Column, Divider, H2, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'

import { demoSafeZoneBottomLayer } from './demo.safeZone.bottom.layer'
import { demoSafeZoneBottomLeftLayer } from './demo.safeZone.bottomLeft.layer'
import { demoSafeZoneBottomRightLayer } from './demo.safeZone.bottomRight.layer'
import { demoSafeZoneDefaultLayer } from './demo.safeZone.default.layer'
import { demoSafeZoneFullScreenLayer } from './demo.safeZone.fullScreen.layer'
import { demoSafeZoneInteractableAreaLayer } from './demo.safeZone.interactableArea.layer'
import { demoSafeZoneLeftLayer } from './demo.safeZone.left.layer'
import { demoSafeZoneLeftBottomLayer } from './demo.safeZone.leftBottom.layer'
import { demoSafeZoneLeftTopLayer } from './demo.safeZone.leftTop.layer'
import { demoSafeZoneRightLayer } from './demo.safeZone.right.layer'
import { demoSafeZoneRightBottomLayer } from './demo.safeZone.rightBottom.layer'
import { demoSafeZoneRightTopLayer } from './demo.safeZone.rightTop.layer'
import { demoSafeZoneTopLayer } from './demo.safeZone.top.layer'
import { demoSafeZoneTopLeftLayer } from './demo.safeZone.topLeft.layer'
import { demoSafeZoneTopRightLayer } from './demo.safeZone.topRight.layer'

/** Above zone preview overlays; below left-bar nav and toast host. */
const DEMO_SAFE_ZONES_PANEL_Z_INDEX = 100

type SafeZoneToggle = {
	id   : string
	label: string
	layer: Layer
}

const SAFE_ZONE_TOGGLES: SafeZoneToggle[][] = [
	[
		{ id: 'btn_safe_zone_default',           label: 'Default',          layer: demoSafeZoneDefaultLayer },
		{ id: 'btn_safe_zone_full_screen',       label: 'FullScreen',       layer: demoSafeZoneFullScreenLayer },
		{ id: 'btn_safe_zone_interactable_area', label: 'InteractableArea', layer: demoSafeZoneInteractableAreaLayer },
	],
	[
		{ id: 'btn_safe_zone_top_left',          label: 'TopLeft',          layer: demoSafeZoneTopLeftLayer },
		{ id: 'btn_safe_zone_top',               label: 'Top',              layer: demoSafeZoneTopLayer },
		{ id: 'btn_safe_zone_top_right',         label: 'TopRight',         layer: demoSafeZoneTopRightLayer },
	],
	[
		{ id: 'btn_safe_zone_left_top',          label: 'LeftTop',          layer: demoSafeZoneLeftTopLayer },
		{ id: 'btn_safe_zone_left',              label: 'Left',             layer: demoSafeZoneLeftLayer },
		{ id: 'btn_safe_zone_left_bottom',       label: 'LeftBottom',       layer: demoSafeZoneLeftBottomLayer },
	],
	[
		{ id: 'btn_safe_zone_right_top',         label: 'RightTop',         layer: demoSafeZoneRightTopLayer },
		{ id: 'btn_safe_zone_right',             label: 'Right',            layer: demoSafeZoneRightLayer },
		{ id: 'btn_safe_zone_right_bottom',      label: 'RightBottom',      layer: demoSafeZoneRightBottomLayer },
	],
	[
		{ id: 'btn_safe_zone_bottom_left',       label: 'BottomLeft',       layer: demoSafeZoneBottomLeftLayer },
		{ id: 'btn_safe_zone_bottom',            label: 'Bottom',           layer: demoSafeZoneBottomLayer },
		{ id: 'btn_safe_zone_bottom_right',      label: 'BottomRight',      layer: demoSafeZoneBottomRightLayer },
	],
]


// MARK: hideAllSafeZonePreviews
/** Hides every ZoneType preview overlay opened from the Safe Zones demo panel. */
export function hideAllSafeZonePreviews() {
	for (const row of SAFE_ZONE_TOGGLES) {
		for (const { layer } of row) {
			if (!layer.visibility.isHidden) layer.hide()
		}
	}
}


// MARK: DemoSafeZonesLayer
/**
 * Center panel with a toggle button per ZoneType preset so players can preview
 * each safe-zone slot and its content alignment.
 */
export class DemoSafeZonesLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-safe-zones',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			zIndex         : DEMO_SAFE_ZONES_PANEL_Z_INDEX,
			uiTransform    : {
				width : '46vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		return (
			<Background fitContent>
				<Column
					cols           = {12}
					spacing        = {8}
					alignItems     = "stretch"
					justifyContent = "flex-start"
					padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
				>
					<H2 value="Safe Zones" />
					<Text value="Toggle each ZoneType. Side strips show content alignment (top / center / bottom)." />
					<Text value="Zones normally have no background — translucent fills here only show each zone’s full extent." />

					<Divider margin={{ top: 4, bottom: 4 }} />

					{SAFE_ZONE_TOGGLES.map((row, rowIndex) => (
						<Row key={`safe_zone_row_${rowIndex}`}>
							{row.map(({ id, label, layer }) => (
								<ButtonText
									key       = {id}
									id        = {id}
									textLabel = {label}
									cols      = {4}
									callback  = {() => layer.toggle()}
								/>
							))}
						</Row>
					))}
				</Column>
			</Background>
		)
	}
}

export const demoSafeZonesLayer = new DemoSafeZonesLayer()
