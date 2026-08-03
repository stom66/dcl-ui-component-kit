import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback } from './animationPlayback'
import { cloneAnimChild, resolveAnimContentSize } from './animationChild'

//MARK: PulseProps Type
export type PulseProps = UiBoxProps & {
	/** Unique playback instance key. */
	id              : string
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** When true, advances local time. Defaults to `true`. */
	playing?        : boolean
	/** When true, repeats burst + pause. When false, one-shot then stops. Defaults to `true`. */
	looping?        : boolean
	/** Seconds for one full pulse (grow + shrink). */
	speed?          : number
	burstCount?     : number
	burstInterval?  : number
	scaleMin?       : number
	scaleMax?       : number
	/**
	 * Easing for both directions. Overridden per-direction by `easingGrow` /
	 * `easingShrink` when those are set.
	 */
	easingFunction? : EasingFn
	/** Easing for the grow half. Defaults to `easeOutCubic`. */
	easingGrow?     : EasingFn
	/** Easing for the shrink half. Defaults to `easeInCubic`. */
	easingShrink?   : EasingFn
}

//MARK: Constants/Vars
const theme = getTheme()


// MARK: Pulse
/**
 * Scales a single child in a grow/shrink burst loop.
 * Intrinsic size is resolved from the child (or nested leaf, e.g. Icon inside
 * FlashColor) via numeric `width` / `height`. Scaled size is written onto the
 * direct child so intermediate wrappers can forward it inward.
 *
 * Pass `easingFunction` to ease both halves the same way, or `easingGrow` /
 * `easingShrink` for independent curves (defaults: ease-out grow, ease-in shrink).
 * Control playback with `playing` / `looping`, or helpers like `playOnce(id)`.
 */
export const Pulse = ({
	id,
	children,
	playing,
	looping,
	speed          = theme.animation.pulseDurationDefault,
	burstCount     = theme.animation.pulseBurstCountDefault,
	burstInterval  = theme.animation.pulseBurstIntervalDefault,
	scaleMin       = theme.animation.pulseScaleMinDefault,
	scaleMax       = theme.animation.pulseScaleMaxDefault,
	easingFunction,
	easingGrow,
	easingShrink,
	width: _width,
	height: _height,
	uiBackground,
	uiTransform,
	...props
}: PulseProps) => {
	const child   = Array.isArray(children) ? children[0] : children
	const content = resolveAnimContentSize(child, theme.icons.defaultSize)
	const w       = content.width
	const h       = content.height

	const easeGrow   = easingGrow   ?? easingFunction ?? easingFunctions.easeOutCubic
	const easeShrink = easingShrink ?? easingFunction ?? easingFunctions.easeInCubic

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, speed, burstCount, burstInterval, state.looping),
	)

	let scale = scaleMin
	if (sample.inBurst) {
		const cycleT = sample.cycleT
		if (cycleT < 0.5) {
			const amount = easeGrow(cycleT * 2)
			scale = scaleMin + amount * (scaleMax - scaleMin)
		} else {
			const amount = easeShrink((cycleT - 0.5) * 2)
			scale = scaleMax + amount * (scaleMin - scaleMax)
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
				width : w * scale,
				height: h * scale,
			})}
		</UiBox>
	)
}
