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


type EdgePosition = Record<string, unknown>


// MARK: fillsSlotAxis
/** `undefined` / `100%` keep opposing position edges so the zone fills its slot. */
function fillsSlotAxis(size: unknown): boolean {
	return size === undefined || size === '100%'
}


// MARK: resolveCornerPinnedPosition
/**
 * When a Layer sets an explicit width/height on a stretched slot (left+right
 * and/or top+bottom), drop the inward edge so the box pins to the zone’s
 * flex-end / flex-start corner instead of hanging off the opposite inset.
 *
 * Example: BottomRight has left:25% + right:8. With width:20vw, clear `left`
 * so `right` + width places the HUD in the bottom-right — not at 25%.
 */
function resolveCornerPinnedPosition(
	position: EdgePosition,
	options: {
		width?         : unknown
		height?        : unknown
		flexDirection? : unknown
		justifyContent?: unknown
		alignItems?    : unknown
	},
): EdgePosition {
	const pos = { ...position }
	const row = options.flexDirection === 'row' || options.flexDirection === 'row-reverse'

	const justifyEnd   = options.justifyContent === 'flex-end'
	const justifyStart = options.justifyContent === 'flex-start'
	const alignEnd     = options.alignItems === 'flex-end'
	const alignStart   = options.alignItems === 'flex-start'

	const horizontalEnd   = row ? justifyEnd : alignEnd
	const horizontalStart = row ? justifyStart : alignStart
	const verticalEnd     = row ? alignEnd : justifyEnd
	const verticalStart   = row ? alignStart : justifyStart

	if (!fillsSlotAxis(options.width) && pos.left !== undefined && pos.right !== undefined) {
		if (horizontalEnd) delete pos.left
		else if (horizontalStart) delete pos.right
	}

	if (!fillsSlotAxis(options.height) && pos.top !== undefined && pos.bottom !== undefined) {
		if (verticalEnd) delete pos.top
		else if (verticalStart) delete pos.bottom
	}

	return pos
}


// MARK: Zone
/**
 * Positions content in a predefined safe area.
 * Bare by default — add a sibling empty `Background` for fill / border
 * (do not nest content inside it — preserves zone flex alignment).
 * Hideable zones require a VisibilityController from the owning Layer.
 *
 * Explicit `uiTransform.width` / `height` (anything but `100%`) pin to the
 * zone’s start/end alignment by clearing the opposing position edge.
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

	const mergedFlexDirection  = uiTransform.flexDirection ?? presetTransform.flexDirection
	const mergedJustifyContent = uiTransform.justifyContent ?? presetTransform.justifyContent
	const mergedAlignItems     = uiTransform.alignItems ?? presetTransform.alignItems
	const mergedWidth          = uiTransform.width ?? presetTransform.width
	const mergedHeight         = uiTransform.height ?? presetTransform.height

	const rawPosition = (
		uiTransform.position && typeof uiTransform.position === 'object'
			? uiTransform.position
			: presetTransform.position && typeof presetTransform.position === 'object'
				? presetTransform.position
				: {}
	) as EdgePosition

	const basePosition = resolveCornerPinnedPosition(rawPosition, {
		width         : mergedWidth,
		height        : mergedHeight,
		flexDirection : mergedFlexDirection,
		justifyContent: mergedJustifyContent,
		alignItems    : mergedAlignItems,
	})

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
		: (
			uiTransform.position && typeof uiTransform.position === 'object'
				? resolveCornerPinnedPosition(uiTransform.position as EdgePosition, {
					width         : mergedWidth,
					height        : mergedHeight,
					flexDirection : mergedFlexDirection,
					justifyContent: mergedJustifyContent,
					alignItems    : mergedAlignItems,
				})
				: Object.keys(basePosition).length > 0
					? basePosition
					: presetTransform.position
		)

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
