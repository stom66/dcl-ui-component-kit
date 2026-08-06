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
	) as Record<string, unknown>

	const activeEdge = hideable && visibilityController
		? visibilityController.activeEdge
		: (showFrom ?? hideTo ?? visibilityPosition ?? preset.visibilityPosition)

	// Hideable edge zones must keep non-animated anchors (e.g. TopLeft keeps
	// `left` while `top` slides). Visibility position is an offset from the
	// preset inset (0 = settled); relative Default modals have no inset.
	const animatedPosition = hideable && visibilityController
		? (() => {
			const presetEdge = basePosition[activeEdge]
			const inset      = typeof presetEdge === 'number' ? presetEdge : 0
			return {
				...basePosition,
				[activeEdge]: inset + visibilityController.position,
			}
		})()
		: (uiTransform.position ?? presetTransform.position)

	// Absolute presets (Top / Left / …) must stay absolute when hideable —
	// forcing relative parks them in the centered layer stack. Default /
	// FullScreen presets have no positionType and stay relative for slides.
	const positionType = uiTransform.positionType
		?? presetTransform.positionType
		?? (hideable ? 'relative' as const : undefined)

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
				positionType,
				position      : animatedPosition,
			}}
			uiBackground={uiBackground}
		>
			{children}
		</UiBox>
	)
}
