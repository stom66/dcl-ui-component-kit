import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback } from './animationPlayback'

//MARK: ShakeProps Type
export type ShakeProps = UiBoxProps & {
	/** Unique playback instance key. */
	id              : string
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** When true, advances local time. Defaults to `true`. */
	playing?        : boolean
	/** When true, repeats burst + pause. When false, one-shot then stops. Defaults to `true`. */
	looping?        : boolean
	/** Seconds for one full shake sequence (all left/right moves + return). */
	speed?          : number
	burstCount?     : number
	burstInterval?  : number
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
 * Size comes from the child's `width` / `height` (numeric).
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
	speed          = theme.animation.shakeDurationDefault,
	burstCount     = theme.animation.shakeBurstCountDefault,
	burstInterval  = theme.animation.shakeBurstIntervalDefault,
	count          = theme.animation.shakeCountDefault,
	offsetMin      = theme.animation.shakeOffsetMinDefault,
	offsetMax      = theme.animation.shakeOffsetMaxDefault,
	easingFunction = easingFunctions.easeOutCubic,
	uiBackground,
	uiTransform,
	...props
}: ShakeProps) => {
	// Our sizes come from the childs width and height
	const child = Array.isArray(children) ? children[0] : children
	const w     = Number(child?.props?.width  ?? theme.icons.defaultSize)
	const h     = Number(child?.props?.height ?? theme.icons.defaultSize)

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, speed, burstCount, burstInterval, state.looping),
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
			{child && ReactEcs.createElement(child.type, {
				...child.props,
				uiTransform: {
					...child.props?.uiTransform,
					positionType: 'absolute',
					position    : {
						...child.props?.uiTransform?.position,
						top : 0,
						left: offset,
					},
				},
				key: child.key,
			})}
		</UiBox>
	)
}
