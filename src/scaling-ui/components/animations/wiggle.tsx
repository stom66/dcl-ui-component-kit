import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getRotatedUVs, getUVCell } from '../../utils'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback } from './animationPlayback'

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


// MARK: Wiggle
/**
 * Wiggles a single child by rotating its UVs around the cell center.
 * Size comes from the child's `width` / `height` (numeric).
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
	uiBackground,
	uiTransform,
	...props
}: WiggleProps) => {
	// Our sizes come from the childs width and height
	const child   = Array.isArray(children) ? children[0] : children
	const w       = Number(child?.props?.width  ?? theme.icons.defaultSize)
	const h       = Number(child?.props?.height ?? theme.icons.defaultSize)
	const baseUvs = child?.props?.uvs ?? getUVCell({ xStart: 1, yStart: 1, xTotal: 1, yTotal: 1 })

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
			{child && ReactEcs.createElement(child.type, {
				...child.props,
				uvs: getRotatedUVs(baseUvs, angle),
				key: child.key,
			})}
		</UiBox>
	)
}
