import { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
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

const progressProps   = new Map<string, PropsController<ProgressBarPropsState>>()
const tweenGeneration = new Map<string, number>()


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
