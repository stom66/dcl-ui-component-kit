import { engine } from '@dcl/sdk/ecs'
import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'

//MARK: BounceProps Type
export type BounceProps = UiBoxProps & {
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
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
let elapsedTime = 0


// MARK: sys_bounce
function sys_bounce(delta: number) {
	elapsedTime += delta
}
engine.addSystem(sys_bounce)


// MARK: Bounce
/**
 * Bounces a single child by animating `position.top` relative to the wrapper.
 * Size comes from the child's `width` / `height` (numeric).
 *
 * Pass `easingFunction` to ease both halves the same way, or `easingUp` /
 * `easingDown` for independent curves (defaults: ease-out up, ease-out-bounce down).
 */
export const Bounce = ({
	children,
	speed          = theme.animation.bounceDurationDefault,
	burstCount     = theme.animation.bounceBurstCountDefault,
	burstInterval  = theme.animation.bounceBurstIntervalDefault,
	offsetMin      = theme.animation.bounceOffsetMinDefault,
	offsetMax      = theme.animation.bounceOffsetMaxDefault,
	easingFunction,
	easingUp,
	easingDown,
	uiBackground,
	uiTransform,
	...props
}: BounceProps) => {
	// Our sizes come from the childs width and height
	const child = Array.isArray(children) ? children[0] : children
	const w     = Number(child?.props?.width  ?? theme.icons.defaultSize)
	const h     = Number(child?.props?.height ?? theme.icons.defaultSize)

	const easeUp   = easingUp   ?? easingFunction ?? easingFunctions.easeOutCirc
	const easeDown = easingDown ?? easingFunction ?? easingFunctions.easeOutBounce

	const totalDuration = burstCount * speed
	const t             = elapsedTime % (totalDuration + burstInterval)

	let offset = offsetMin
	if (t < totalDuration && speed > 0) {
		const cycleT = (t % speed) / speed
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
			{child && ReactEcs.createElement(child.type, {
				...child.props,
				uiTransform: {
					...child.props?.uiTransform,
					positionType: 'absolute',
					position    : {
						...child.props?.uiTransform?.position,
						top : offset,
						left: 0,
					},
				},
				key: child.key,
			})}
		</UiBox>
	)
}
