import { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { sizeValueToPixels } from '../../utils/aspect'
import { easingFunctions, tweenValue } from '../../utils/tweens'


export type FillFrom = 'left' | 'right' | 'top' | 'bottom'

export type ProgressBarPropsState = {
	displayValue: number
	targetValue : number
}

export const Z_INDEX_BACKGROUND = 10
export const Z_INDEX_FILL       = 11
export const Z_INDEX_BORDER     = 12
export const Z_INDEX_CONTENT    = 13

/**
 * Minimum pixel inset for fill inside a procedural border.
 * Prefer `Math.max(FILL_INSET_PX, borderWidth)` so the fill sits inside the stroke.
 */
export const FILL_INSET_PX = 1


// MARK: resolveProceduralFillInset
/** Inset for fill under a procedural border — at least the border width. */
export function resolveProceduralFillInset(borderWidth: number): number {
	return Math.max(FILL_INSET_PX, Math.max(0, borderWidth))
}


/**
 * Per-edge pixel inset for `ProgressBarImage.contentInset`.
 * Keys are **top → right → bottom → left** (same TRBL order as `margin` /
 * `padding` / `position`). Omit unused edges (they resolve to `0`).
 */
export type ContentInsetEdges = {
	top?   : number
	right? : number
	bottom?: number
	left?  : number
}

/**
 * `ProgressBarImage.contentInset` — uniform pixel inset (`number`) **or** a
 * TRBL edges object. Not the same as `textureSlices` (UV nine-slice fractions)
 * or `padding` / `margin` on the outer box.
 */
export type ContentInset = number | ContentInsetEdges

/** Resolved absolute inset used for fill / image-track positioning. */
export type ResolvedContentInset = {
	top   : number
	right : number
	bottom: number
	left  : number
}


// MARK: resolveContentInset
/**
 * Normalizes `contentInset` to a TRBL pixel inset.
 * - `undefined` → all edges = `fallback`
 * - `number` → all edges = `max(0, value)` (uniform)
 * - edges object → each provided edge `max(0, value)`, omitted edges `0`
 */
export function resolveContentInset(
	contentInset: ContentInset | undefined,
	fallback    : number,
): ResolvedContentInset {
	if (contentInset === undefined) {
		const n = Math.max(0, fallback)
		return { top: n, right: n, bottom: n, left: n }
	}
	if (typeof contentInset === 'number') {
		const n = Math.max(0, contentInset)
		return { top: n, right: n, bottom: n, left: n }
	}
	return {
		top   : Math.max(0, contentInset.top    ?? 0),
		right : Math.max(0, contentInset.right  ?? 0),
		bottom: Math.max(0, contentInset.bottom ?? 0),
		left  : Math.max(0, contentInset.left   ?? 0),
	}
}

const progressProps   = new Map<string, PropsController<ProgressBarPropsState>>()
const tweenGeneration = new Map<string, number>()


// MARK: resolveDefaultBorderRadius
/**
 * Pill radius: half the shortest axis when width/height can be measured in
 * virtual pixels. Falls back to half of whichever axis is known.
 */
export function resolveDefaultBorderRadius(
	width : PositionUnit | 'auto',
	height: PositionUnit | 'auto',
): number {
	const w = sizeValueToPixels(width)
	const h = sizeValueToPixels(height)

	if (w != null && h != null) return Math.min(w, h) / 2
	if (h != null) return h / 2
	if (w != null) return w / 2
	return 12
}


// MARK: clampValue
/** Clamps `value` into `[minValue, maxValue]`. */
export function clampValue(
	value   : number,
	minValue: number,
	maxValue: number
): number {
	if (maxValue <= minValue) {
		console.error(`ProgressBar: clampValue: maxValue (${maxValue}) must be greater than minValue (${minValue})`)
		return minValue
	}
	return Math.min(maxValue, Math.max(minValue, value))
}


// MARK: valueToPercent
/** Maps a value in `[minValue, maxValue]` to a 0–100 percentage. */
export function valueToPercent(
	value   : number,
	minValue: number,
	maxValue: number
): number {
	const clamped = clampValue(value, minValue, maxValue)
	return ((clamped - minValue) / (maxValue - minValue)) * 100
}


// MARK: resolveFillFrom
/**
 * Resolves `fillFrom` into outer flex layout and fill size.
 * Flex direction is the cross-axis of the fill so `alignItems` anchors the origin.
 */
export function resolveFillFrom(
	fillFrom: FillFrom,
	percent : number
): {
	flexDirection: NonNullable<UiTransformProps['flexDirection']>
	alignItems   : NonNullable<UiTransformProps['alignItems']>
	fillWidth    : PositionUnit
	fillHeight   : PositionUnit
} {
	const pct = `${percent}%` as PositionUnit

	switch (fillFrom) {
		case 'right':
			return {
				flexDirection: 'column',
				alignItems   : 'flex-end',
				fillWidth    : pct,
				fillHeight   : '100%',
			}
		case 'top':
			return {
				flexDirection: 'row',
				alignItems   : 'flex-start',
				fillWidth    : '100%',
				fillHeight   : pct,
			}
		case 'bottom':
			return {
				flexDirection: 'row',
				alignItems   : 'flex-end',
				fillWidth    : '100%',
				fillHeight   : pct,
			}
		case 'left':
		default:
			return {
				flexDirection: 'column',
				alignItems   : 'flex-start',
				fillWidth    : pct,
				fillHeight   : '100%',
			}
	}
}


// MARK: getProgressProps
/** Returns the per-bar props controller, creating one if needed. */
export function getProgressProps(
	id          : string,
	initialValue: number
): PropsController<ProgressBarPropsState> {
	let props = progressProps.get(id)
	if (!props) {
		props = new PropsController<ProgressBarPropsState>({
			displayValue: initialValue,
			targetValue : initialValue,
		})
		progressProps.set(id, props)
	}
	return props
}


// MARK: syncDisplayValue
/**
 * Lerps `displayValue` toward the clamped target when `value` changes.
 * Returns the current (possibly mid-lerp) display value to render.
 * Rapid retargets invalidate in-flight tweens via a generation counter.
 */
export function syncDisplayValue(
	id          : string,
	value       : number,
	minValue    : number,
	maxValue    : number,
	lerpDuration: number
): number {
	const clamped = clampValue(value, minValue, maxValue)
	const props   = getProgressProps(id, clamped)
	const target  = props.get('targetValue')

	if (target !== clamped) {
		const from = props.get('displayValue')
		props.set('targetValue', clamped)

		const generation = (tweenGeneration.get(id) ?? 0) + 1
		tweenGeneration.set(id, generation)

		if (lerpDuration <= 0) {
			props.set('displayValue', clamped)
			return clamped
		}

		tweenValue(
			from,
			clamped,
			lerpDuration,
			(next) => {
				if (tweenGeneration.get(id) !== generation) return
				props.set('displayValue', next)
			},
			undefined,
			easingFunctions.easeOutQuart
		)
	}

	return props.get('displayValue')
}
