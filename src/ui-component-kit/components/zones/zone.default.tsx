import ReactEcs from '@dcl/sdk/react-ecs'

import { VisibilityController, type VisibilityPosition } from '../../classes/visibilityController'
import { UiBox, type UiBoxProps } from '../base'
import { ButtonImageClose } from '../buttons'
import { ZoneType, zonePresets } from './zone.presets'


export type ZoneProps = UiBoxProps & {
	type?                : Exclude<ZoneType, ZoneType.None>
	canBeHidden?         : boolean
	startHidden?         : boolean
	showCloseButton?     : boolean
	/** Unique id for the close ButtonImage. Required for per-button hover when multiple close buttons are on screen. */
	closeButtonId?       : string
	children?            : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	visibilityController?: VisibilityController
	/** @deprecated Prefer showFrom / hideTo. Kept as a single-edge shorthand for both. */
	visibilityPosition?  : VisibilityPosition
	showFrom?            : VisibilityPosition
	hideTo?              : VisibilityPosition
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
	closeButtonId,
	children             = [],
	uiTransform          = {},
	uiBackground,
	visibilityController,
	visibilityPosition,
	showFrom,
	hideTo,
	...props
}: ZoneProps) {
	const preset          = zonePresets[type]
	const presetTransform = preset.getUiTransform()

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

		// ButtonImage hover/press state is keyed by id — must be unique per open layer.
		const resolvedCloseId = closeButtonId ?? 'btn_close'
		if (!closeButtonId) {
			console.error(`Zone: type=${type} showCloseButton without closeButtonId shares hover state with other close buttons`)
		}

		children = [
			<ButtonImageClose
				key      = {resolvedCloseId}
				id       = {resolvedCloseId}
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

	const activeEdge = hideable && visibilityController
		? visibilityController.activeEdge
		: (showFrom ?? hideTo ?? visibilityPosition ?? preset.visibilityPosition)

	const animatedPosition = hideable && visibilityController
		? (() => {
			const { top: _t, bottom: _b, left: _l, right: _r, ...rest } = basePosition as Record<string, unknown>
			return { ...rest, [activeEdge]: visibilityController.position }
		})()
		: (uiTransform.position ?? presetTransform.position)

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
				position      : animatedPosition,
			}}
			uiBackground={uiBackground}
		>
			{children}
		</UiBox>
	)
}
