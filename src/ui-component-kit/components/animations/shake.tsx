import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback, type BurstAnimationProps } from './animationPlayback'
import { cloneAnimChild, resolveAnimBoxSize } from './animationChild'

//MARK: ShakeProps Type
export type ShakeProps = UiBoxProps & BurstAnimationProps & {
	/** Seconds for one full shake sequence (all left/right moves + return). Not the full burst — see `burstCount`. */
	duration?       : number
	/** Number of left/right moves per sequence. Defaults to `3` (left, right, left). */
	count?          : number
	/** Leftmost `position.left` during a shake. */
	offsetMin?      : number
	/** Rightmost `position.left` during a shake. */
	offsetMax?      : number
	/** Custom curve or a built-in from `easingFunctions`. Applied per move. */
	easingFunction? : EasingFn
}

//MARK: Constants/Vars
const theme = getTheme()


// MARK: Shake
/**
 * Shakes a single child by animating `position.left` relative to the wrapper.
 * Size comes from the child (or nested leaf) / parent size overrides.
 *
 * One sequence moves left/right `count` times (default 3: left, right, left),
 * then returns to center before the burst pause.
 * Control playback with `playing` / `looping`, or helpers like `playOnce(id)`.
 */
export const Shake = ({
	id,
	children,
	playing,
	looping,
	duration       = theme.animation.shakeDurationDefault,
	burstCount     = theme.animation.shakeBurstCountDefault,
	burstInterval  = theme.animation.shakeBurstIntervalDefault,
	burstOffset    = 0,
	count          = theme.animation.shakeCountDefault,
	offsetMin      = theme.animation.shakeOffsetMinDefault,
	offsetMax      = theme.animation.shakeOffsetMaxDefault,
	easingFunction = easingFunctions.easeOutCubic,
	width,
	height,
	uiBackground,
	uiTransform,
	...props
}: ShakeProps) => {
	const child = Array.isArray(children) ? children[0] : children
	const { width: w, height: h } = resolveAnimBoxSize(
		width,
		height,
		child,
		theme.icons.defaultSize,
	)

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, duration, burstCount, burstInterval, state.looping, burstOffset),
	)

	let offset = 0
	if (sample.inBurst && count > 0) {
		const cycleT = sample.cycleT

		// center → left → right → left … → center
		const keyframes: number[] = [0]
		for (let i = 0; i < count; i++) {
			keyframes.push(i % 2 === 0 ? offsetMin : offsetMax)
		}
		keyframes.push(0)

		const segmentCount = keyframes.length - 1
		const scaled       = cycleT * segmentCount
		const segment      = Math.min(Math.floor(scaled), segmentCount - 1)
		const localT       = scaled - segment
		const amount       = easingFunction(localT)

		offset = keyframes[segment] + amount * (keyframes[segment + 1] - keyframes[segment])
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
			{child && cloneAnimChild(child, {
				width : w,
				height: h,
				uiTransform: {
					...child.props?.uiTransform,
					positionType: 'absolute',
					position    : {
						...child.props?.uiTransform?.position,
						top : 0,
						left: offset,
					},
				},
			})}
		</UiBox>
	)
}
