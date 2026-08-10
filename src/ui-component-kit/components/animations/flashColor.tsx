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


// MARK: childUsesIconTint
/**
 * Texture-icon children tint via `iconColor` only. Detect them so we do not
 * inject `backgroundColor` (that would create a chip wrapper on `Icon`).
 */
function childUsesIconTint(child: ReactEcs.JSX.Element | undefined): boolean {
	const props = child?.props
	if (!props) {
		return false
	}
	return props.iconColor !== undefined
		|| props.uvs !== undefined
		|| props.src !== undefined
		|| props.atlas !== undefined
		|| props.userId !== undefined
		|| (
			props.value !== undefined
			&& props.fontSize === undefined
			&& props.fontColor === undefined
			&& props.uiText === undefined
		)
}


// MARK: resolveChildBaseColor
/**
 * Reads the child's tint from `iconColor` (icons) or `backgroundColor` /
 * `uiBackground.color` (fills). Falls back to white for untinted textures.
 */
function resolveChildBaseColor(child: ReactEcs.JSX.Element | undefined): Color4 {
	if (childUsesIconTint(child)) {
		return child?.props?.iconColor
			?? child?.props?.uiBackground?.color
			?? Color4.White()
	}
	return child?.props?.backgroundColor
		?? child?.props?.uiBackground?.color
		?? Color4.White()
}


// MARK: FlashColor
/**
 * Flashes a single child's tint toward `flashColor` and back.
 * Icons flash via `iconColor` only (never invent a `backgroundColor` chip).
 * Solid fills flash via `backgroundColor` / `uiBackground.color`.
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
			{child && cloneAnimChild(child, childUsesIconTint(child)
				? {
					width       : w,
					height      : h,
					iconColor   : currentColor,
					uiBackground: mergeUiBackground(child.props?.uiBackground, {
						color: currentColor,
					}),
				}
				: {
					width          : w,
					height         : h,
					backgroundColor: currentColor,
					uiBackground   : mergeUiBackground(child.props?.uiBackground, {
						color: currentColor,
					}),
				}
			)}
		</UiBox>
	)
}
