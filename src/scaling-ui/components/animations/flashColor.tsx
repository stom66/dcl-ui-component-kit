import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback } from './animationPlayback'

//MARK: FlashColorProps Type
export type FlashColorProps = UiBoxProps & {
	/** Unique playback instance key. */
	id              : string
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** When true, advances local time. Defaults to `true`. */
	playing?        : boolean
	/** When true, repeats burst + pause. When false, one-shot then stops. Defaults to `true`. */
	looping?        : boolean
	/** Seconds for one full flash (to target + back). */
	speed?          : number
	burstCount?     : number
	burstInterval?  : number
	/** Color to flash toward. Defaults to `theme.colors.primary`. */
	color?          : Color4
	/**
	 * Easing for both directions. Overridden per-direction by `easingFlash` /
	 * `easingReturn` when those are set.
	 */
	easingFunction? : EasingFn
	/** Easing toward the flash color. Defaults to `easeOutCubic`. */
	easingFlash?    : EasingFn
	/** Easing back to the child's base color. Defaults to `easeInCubic`. */
	easingReturn?   : EasingFn
}

//MARK: Constants/Vars
const theme = getTheme()


// MARK: resolveChildBaseColor
/**
 * Reads the child's tint from `backgroundColor` or `uiBackground.color`.
 * Falls back to white so textured children (e.g. Icon) keep a neutral multiply.
 */
function resolveChildBaseColor(child: ReactEcs.JSX.Element | undefined): Color4 {
	return child?.props?.backgroundColor
		?? child?.props?.uiBackground?.color
		?? Color4.White()
}


// MARK: FlashColor
/**
 * Flashes a single child's background color toward `color` and back.
 * The child's original `backgroundColor` / `uiBackground.color` is used as the base.
 *
 * Pass `easingFunction` to ease both halves the same way, or `easingFlash` /
 * `easingReturn` for independent curves (defaults: ease-out flash, ease-in return).
 * Control playback with `playing` / `looping`, or helpers like `playOnce(id)`.
 */
export const FlashColor = ({
	id,
	children,
	playing,
	looping,
	speed          = theme.animation.flashColorDurationDefault,
	burstCount     = theme.animation.flashColorBurstCountDefault,
	burstInterval  = theme.animation.flashColorBurstIntervalDefault,
	color          = theme.colors.primary,
	easingFunction,
	easingFlash,
	easingReturn,
	uiBackground,
	uiTransform,
	...props
}: FlashColorProps) => {
	const child     = Array.isArray(children) ? children[0] : children
	const w         = Number(child?.props?.width  ?? child?.props?.uiTransform?.width  ?? theme.icons.defaultSize)
	const h         = Number(child?.props?.height ?? child?.props?.uiTransform?.height ?? theme.icons.defaultSize)
	const baseColor = resolveChildBaseColor(child)

	const easeFlash  = easingFlash  ?? easingFunction ?? easingFunctions.easeOutCubic
	const easeReturn = easingReturn ?? easingFunction ?? easingFunctions.easeInCubic

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, speed, burstCount, burstInterval, state.looping),
	)

	let currentColor = baseColor
	if (sample.inBurst) {
		const cycleT = sample.cycleT
		if (cycleT < 0.5) {
			currentColor = Color4.lerp(baseColor, color, easeFlash(cycleT * 2))
		} else {
			currentColor = Color4.lerp(color, baseColor, easeReturn((cycleT - 0.5) * 2))
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
				// Tint only — never replace uiBackground, so Icon textures stay intact.
				backgroundColor: currentColor,
				...(child.props?.uiBackground ? {
					uiBackground: {
						...child.props.uiBackground,
						color: currentColor,
					},
				} : {}),
				key: child.key,
			})}
		</UiBox>
	)
}
