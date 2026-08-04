import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { darken } from '../../utils/colors'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback, type BurstAnimationProps } from './animationPlayback'


//MARK: FlashBorderProps Type
export type FlashBorderProps = UiBoxProps & BurstAnimationProps & {
	/** Seconds for one full flash (to target + back). Not the full burst — see `burstCount`. */
	duration?       : number
	/** Color to flash toward. Defaults to `theme.colors.primary`. */
	color?          : Color4
	/**
	 * Easing for both directions. Overridden per-direction by `easingFlash` /
	 * `easingReturn` when those are set.
	 */
	easingFunction? : EasingFn
	/** Easing toward the flash color. Defaults to `easeOutCubic`. */
	easingFlash?    : EasingFn
	/** Easing back to the child's base border color. Defaults to `easeInCubic`. */
	easingReturn?   : EasingFn
}


//MARK: Constants/Vars
const theme = getTheme()


// MARK: resolveChildBaseBorderColor
/**
 * Reads the child's border tint from `borderColor` / `uiTransform.borderColor`.
 * Falls back to `darken(fill, 0.2)` (UiBox border convention), then theme secondary.
 */
function resolveChildBaseBorderColor(child: ReactEcs.JSX.Element | undefined): Color4 {
	const fill =
		child?.props?.backgroundColor
		?? child?.props?.uiBackground?.color
		?? theme.colors.body

	return child?.props?.borderColor
		?? child?.props?.uiTransform?.borderColor
		?? darken(fill, 0.2)
}


// MARK: resolveChildBorderWidth
/** Keeps an existing border width, or uses the theme default so the flash is visible. */
function resolveChildBorderWidth(child: ReactEcs.JSX.Element | undefined): number {
	const fromProp = child?.props?.borderWidth
	if (typeof fromProp === 'number') return fromProp

	const fromTransform = child?.props?.uiTransform?.borderWidth
	if (typeof fromTransform === 'number') return fromTransform

	return theme.border.width
}


// MARK: FlashBorder
/**
 * Flashes a single child's border color toward `color` and back.
 * The child's original `borderColor` (or UiBox-style darkened fill) is the base.
 * Ensures a `borderWidth` so the flash is visible.
 *
 * Wrapper defaults to full parent width / auto height so it works on Rows and
 * other layout children (unlike icon-sized Pulse / FlashColor wrappers).
 *
 * Control playback with `playing` / `looping`, or helpers like `playOnce(id)`.
 */
export const FlashBorder = ({
	id,
	children,
	playing,
	looping,
	duration       = theme.animation.flashBorderDurationDefault,
	burstCount     = theme.animation.flashBorderBurstCountDefault,
	burstInterval  = theme.animation.flashBorderBurstIntervalDefault,
	burstOffset    = 0,
	color          = theme.colors.primary,
	easingFunction,
	easingFlash,
	easingReturn,
	uiBackground,
	uiTransform,
	...props
}: FlashBorderProps) => {
	const child        = Array.isArray(children) ? children[0] : children
	const baseColor    = resolveChildBaseBorderColor(child)
	const borderWidth  = resolveChildBorderWidth(child)

	const easeFlash  = easingFlash  ?? easingFunction ?? easingFunctions.easeOutCubic
	const easeReturn = easingReturn ?? easingFunction ?? easingFunctions.easeInCubic

	const state  = syncAnimationPlayback(id, { playing, looping })
	const sample = applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, duration, burstCount, burstInterval, state.looping, burstOffset),
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
				width         : '100%',
				height        : 'auto',
				flexGrow      : 0,
				flexShrink    : 0,
				display       : 'flex',
				flexDirection : 'column',
				alignItems    : 'stretch',
				justifyContent: 'flex-start',
				...uiTransform,
			}}
			uiBackground={uiBackground}
		>
			{child && ReactEcs.createElement(child.type, {
				...child.props,
				borderColor: currentColor,
				borderWidth,
				uiTransform: {
					...child.props?.uiTransform,
					borderColor: currentColor,
					borderWidth,
				},
				key: child.key,
			})}
		</UiBox>
	)
}
