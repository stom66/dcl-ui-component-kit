import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getRotatedUVs, getUVCell } from '../../utils'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback } from './animationPlayback'
import { cloneAnimChildDeep, resolveAnimBoxSize } from './animationChild'

//MARK: WiggleProps Type
export type WiggleProps = UiBoxProps & {
	/** Unique playback instance key. */
	id              : string
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** When true, advances local time. Defaults to `true`. */
	playing?        : boolean
	/** When true, repeats burst + pause. When false, one-shot then stops. Defaults to `true`. */
	looping?        : boolean
	/** Seconds for one full wiggle sequence (all rotations + return). */
	speed?          : number
	burstCount?     : number
	burstInterval?  : number
	/** Number of alternating rotations per sequence. Defaults to `3` (-max, +max, -max). */
	count?          : number
	/** Maximum rotation in degrees from center. Defaults to `45`. */
	maxRotation?    : number
	/** Custom curve or a built-in from `easingFunctions`. Applied per move. */
	easingFunction? : EasingFn
}

//MARK: Constants/Vars
const theme = getTheme()


// MARK: resolveLeafUvs
/** Finds UV quads on the child or a nested leaf (for wrappers without `uvs`). */
function resolveLeafUvs(element: ReactEcs.JSX.Element | undefined): number[] {
	let current: ReactEcs.JSX.Element | undefined = element
	while (current) {
		if (current.props?.uvs) return current.props.uvs as number[]
		const nested = current.props?.children as ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined
		current = Array.isArray(nested) ? nested[0] : nested
	}
	return getUVCell({ xStart: 1, yStart: 1, xTotal: 1, yTotal: 1 })
}


// MARK: Wiggle
/**
 * Wiggles a single child by rotating its UVs around the cell center.
 * Size comes from the child (or nested leaf) / parent size overrides.
 *
 * One sequence rotates `count` times (default 3: -max, +max, -max),
 * then returns to 0° before the burst pause.
 * Control playback with `playing` / `looping`, or helpers like `playOnce(id)`.
 */
export const Wiggle = ({
	id,
	children,
	playing,
	looping,
	speed          = theme.animation.wiggleDurationDefault,
	burstCount     = theme.animation.wiggleBurstCountDefault,
	burstInterval  = theme.animation.wiggleBurstIntervalDefault,
	count          = theme.animation.wiggleCountDefault,
	maxRotation    = theme.animation.wiggleMaxRotationDefault,
	easingFunction = easingFunctions.easeOutCubic,
	width,
	height,
	uiBackground,
	uiTransform,
	...props
}: WiggleProps) => {
	const child   = Array.isArray(children) ? children[0] : children
	const { width: w, height: h } = resolveAnimBoxSize(
		width,
		height,
		child,
		theme.icons.defaultSize,
	)
	const baseUvs = resolveLeafUvs(child)

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, speed, burstCount, burstInterval, state.looping),
	)

	let angle = 0
	if (sample.inBurst && count > 0) {
		const cycleT = sample.cycleT

		// center → -max → +max → -max … → center
		const keyframes: number[] = [0]
		for (let i = 0; i < count; i++) {
			keyframes.push(i % 2 === 0 ? -maxRotation : maxRotation)
		}
		keyframes.push(0)

		const segmentCount = keyframes.length - 1
		const scaled       = cycleT * segmentCount
		const segment      = Math.min(Math.floor(scaled), segmentCount - 1)
		const localT       = scaled - segment
		const amount       = easingFunction(localT)

		angle = keyframes[segment] + amount * (keyframes[segment + 1] - keyframes[segment])
	}

	return (
		<UiBox
			{...props}
			uiTransform={{
				width         : w,
				height        : h,
				flexGrow      : 0,
				flexShrink    : 0,
				alignItems    : 'center',
				justifyContent: 'center',
				...uiTransform,
			}}
			uiBackground={uiBackground}
		>
			{child && cloneAnimChildDeep(child, {
				width : w,
				height: h,
				uvs   : getRotatedUVs(baseUvs, angle),
			})}
		</UiBox>
	)
}
