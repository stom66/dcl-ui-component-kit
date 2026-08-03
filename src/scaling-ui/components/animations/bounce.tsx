import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback } from './animationPlayback'
import { cloneAnimChild, resolveAnimBoxSize } from './animationChild'

//MARK: BounceProps Type
export type BounceProps = UiBoxProps & {
	/** Unique playback instance key. */
	id              : string
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** When true, advances local time. Defaults to `true`. */
	playing?        : boolean
	/** When true, repeats burst + pause. When false, one-shot then stops. Defaults to `true`. */
	looping?        : boolean
	/** Seconds for one full bounce (up + down). */
	speed?          : number
	burstCount?     : number
	burstInterval?  : number
	/** Minimum `position.top` during a bounce. */
	offsetMin?      : number
	/** Maximum `position.top` during a bounce. */
	offsetMax?      : number
	/**
	 * Easing for both directions. Overridden per-direction by `easingUp` /
	 * `easingDown` when those are set.
	 */
	easingFunction? : EasingFn
	/** Easing for the upward half. Defaults to `easeOutCubic`. */
	easingUp?       : EasingFn
	/** Easing for the downward half. Defaults to `easeOutBounce`. */
	easingDown?     : EasingFn
}

//MARK: Constants/Vars
const theme = getTheme()


// MARK: Bounce
/**
 * Bounces a single child by animating `position.top` relative to the wrapper.
 * Size comes from the child (or nested leaf) / parent size overrides.
 *
 * Pass `easingFunction` to ease both halves the same way, or `easingUp` /
 * `easingDown` for independent curves (defaults: ease-out up, ease-out-bounce down).
 * Control playback with `playing` / `looping`, or helpers like `playOnce(id)`.
 */
export const Bounce = ({
	id,
	children,
	playing,
	looping,
	speed          = theme.animation.bounceDurationDefault,
	burstCount     = theme.animation.bounceBurstCountDefault,
	burstInterval  = theme.animation.bounceBurstIntervalDefault,
	offsetMin      = theme.animation.bounceOffsetMinDefault,
	offsetMax      = theme.animation.bounceOffsetMaxDefault,
	easingFunction,
	easingUp,
	easingDown,
	width,
	height,
	uiBackground,
	uiTransform,
	...props
}: BounceProps) => {
	const child = Array.isArray(children) ? children[0] : children
	const { width: w, height: h } = resolveAnimBoxSize(
		width,
		height,
		child,
		theme.icons.defaultSize,
	)

	const easeUp   = easingUp   ?? easingFunction ?? easingFunctions.easeOutCirc
	const easeDown = easingDown ?? easingFunction ?? easingFunctions.easeOutBounce

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, speed, burstCount, burstInterval, state.looping),
	)

	let offset = offsetMin
	if (sample.inBurst) {
		const cycleT = sample.cycleT
		if (cycleT < 0.5) {
			const amount = easeUp(cycleT * 2)
			offset = offsetMin + amount * (offsetMax - offsetMin)
		} else {
			const amount = easeDown((cycleT - 0.5) * 2)
			offset = offsetMax + amount * (offsetMin - offsetMax)
		}
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
						top : offset,
						left: 0,
					},
				},
			})}
		</UiBox>
	)
}
