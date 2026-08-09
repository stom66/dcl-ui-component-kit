import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback, type BurstAnimationProps } from './animationPlayback'
import { cloneAnimChild, resolveAnimBoxSize } from './animationChild'

//MARK: FlashColorProps Type
export type FlashColorProps = UiBoxProps & BurstAnimationProps & {
	/** Seconds for one full flash (to target + back). Not the full burst — see `burstCount`. */
	duration?       : number
	/** Color to flash toward. Defaults to `theme.colors.primary`. */
	flashColor?     : Color4
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
 * Reads the child's tint from `iconColor`, `backgroundColor`, or
 * `uiBackground.color`. Falls back to white so textured children keep a neutral multiply.
 */
function resolveChildBaseColor(child: ReactEcs.JSX.Element | undefined): Color4 {
	return child?.props?.iconColor
		?? child?.props?.backgroundColor
		?? child?.props?.uiBackground?.color
		?? Color4.White()
}


// MARK: FlashColor
/**
 * Flashes a single child's tint toward `flashColor` and back.
 * The child's original `iconColor` / `backgroundColor` / `uiBackground.color` is the base.
 * Forwards `width` / `height` (including scaled sizes from an outer `Pulse`) to
 * the child so nested animation stacks keep sizing in sync.
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
	duration       = theme.animation.flashColorDurationDefault,
	burstCount     = theme.animation.flashColorBurstCountDefault,
	burstInterval  = theme.animation.flashColorBurstIntervalDefault,
	burstOffset    = 0,
	flashColor     = theme.colors.primary,
	easingFunction,
	easingFlash,
	easingReturn,
	width,
	height,
	uiBackground,
	uiTransform,
	...props
}: FlashColorProps) => {
	const child = Array.isArray(children) ? children[0] : children
	const { width: w, height: h } = resolveAnimBoxSize(
		width,
		height,
		child,
		theme.icons.defaultSize,
	)
	const baseColor = resolveChildBaseColor(child)

	const easeFlash  = easingFlash  ?? easingFunction ?? easingFunctions.linear
	const easeReturn = easingReturn ?? easingFunction ?? easingFunctions.linear

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, duration, burstCount, burstInterval, state.looping, burstOffset),
	)

	let currentColor = baseColor
	if (sample.inBurst) {
		const cycleT = sample.cycleT
		if (cycleT < 0.5) {
			currentColor = Color4.lerp(baseColor, flashColor, easeFlash(cycleT * 2))
		} else {
			currentColor = Color4.lerp(flashColor, baseColor, easeReturn((cycleT - 0.5) * 2))
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
				width          : w,
				height         : h,
				iconColor      : currentColor,
				backgroundColor: currentColor,
				uiBackground   : mergeUiBackground(child.props?.uiBackground, {
					color: currentColor,
				}),
			})}
		</UiBox>
	)
}
