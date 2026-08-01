import ReactEcs from '@dcl/sdk/react-ecs'

import { VisibilityController } from '../../classes/visibilityController'
import { UiBox, type UiBoxProps } from '../base'
import { ButtonImageClose } from '../buttons'
import { ZoneType, zonePresets, type VisibilityPosition } from './zone.presets'


export type ZoneProps = UiBoxProps & {
	type?                : Exclude<ZoneType, ZoneType.None>
	canBeHidden?         : boolean
	startHidden?         : boolean
	showCloseButton?     : boolean
	children?            : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	visibilityController?: VisibilityController
	visibilityPosition?  : VisibilityPosition
}


// MARK: Zone
/**
 * Positions content in a predefined safe area.
 * Bare by default — wrap content in `Background` for fill / border.
 * Hideable zones require a VisibilityController from the owning Layer.
 */
export function Zone({
	type                 = ZoneType.Default,
	startHidden          = false,
	canBeHidden          = false,
	showCloseButton      = false,
	children             = [],
	uiTransform          = {},
	uiBackground,
	visibilityController,
	visibilityPosition,
	...props
}: ZoneProps) {
	const preset           = zonePresets[type]
	const resolvedPosition = visibilityPosition ?? preset.visibilityPosition
	const presetTransform  = preset.getUiTransform()

	let hideable = canBeHidden

	if (canBeHidden && !visibilityController) {
		console.error(`Zone: type=${type} canBeHidden requires a visibilityController from a Layer`)
		hideable = false
	}

	if (showCloseButton && !canBeHidden) {
		console.error(`Zone: type=${type} showCloseButton requires canBeHidden`)
	}

	if (hideable && visibilityController) {
		visibilityController.initialize(startHidden)
	}

	if (showCloseButton && hideable && visibilityController) {
		if (children && !Array.isArray(children)) children = [children]

		children = [
			<ButtonImageClose
				id       = "btn_close"
				callback = {() => {
					visibilityController.toggle()
				}}
			/>,
			...(children || [])
		]
	}

	const basePosition = (
		uiTransform.position && typeof uiTransform.position === 'object'
			? uiTransform.position
			: presetTransform.position && typeof presetTransform.position === 'object'
				? presetTransform.position
				: {}
	)

	return (
		<UiBox
			{...props}
			uiTransform={{
				display       : 'flex',
				flexGrow      : 0,
				flexShrink    : 0,
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'center',
				padding       : 0,
				borderWidth   : 0,
				...presetTransform,
				...uiTransform,
				positionType  : hideable
					? 'relative'
					: (uiTransform.positionType ?? presetTransform.positionType),
				position      : hideable && visibilityController
					? { ...basePosition, [resolvedPosition]: visibilityController.position }
					: (uiTransform.position ?? presetTransform.position),
			}}
			uiBackground={uiBackground}
		>
			{children}
		</UiBox>
	)
}
