import ReactEcs, { type PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getRotatedUVs, getUVCell } from '../../utils'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { applyBurstSample, sampleBurstTime, syncAnimationPlayback, type BurstAnimationProps } from './animationPlayback'
import { cloneAnimChildDeep } from './animationChild'

export type SpinnerProps = UiBoxProps & BurstAnimationProps & {
	/** Seconds for one spin of `degrees`. Not the full burst — see `burstCount`. */
	duration?       : number
	/** Degrees rotated during one `duration`. Negative = reverse. Defaults to theme `spinnerDegreesDefault`. */
	degrees?        : number
	/** Easing applied to progress within each spin. Defaults to `linear`. */
	easingFunction? : EasingFn
}

const theme = getTheme()


// MARK: resolveSpinnerAngle
/**
 * Rotates `degrees` over each `duration` instance. Uses the same burst / pause
 * timeline as other motion wrappers (`burstCount`, `burstInterval`, `burstOffset`).
 * When `burstInterval` is 0, spins continuously. `easing` shapes progress within each spin.
 */
function resolveSpinnerAngle(
	elapsed      : number,
	duration     : number,
	degrees      : number,
	burstCount   : number,
	burstInterval: number,
	burstOffset  : number,
	looping      : boolean,
	easing       : EasingFn,
): number {
	if (duration <= 0 || degrees === 0 || burstCount <= 0) return 0

	const shifted = elapsed - Math.max(0, burstOffset)
	if (shifted < 0) return 0

	const burstDuration = burstCount * duration

	if (!looping) {
		if (shifted >= burstDuration) {
			return burstCount * degrees
		}
		const spins = shifted / duration
		const whole = Math.floor(spins)
		const frac  = spins - whole
		return (whole + easing(frac)) * degrees
	}

	if (burstInterval <= 0) {
		const cycles = shifted / duration
		const whole  = Math.floor(cycles)
		const frac   = cycles - whole
		return (whole + easing(frac)) * degrees
	}

	const period      = burstDuration + burstInterval
	const periodsDone = Math.floor(shifted / period)
	const t           = shifted % period
	const baseAngle   = periodsDone * burstCount * degrees

	if (t < burstDuration) {
		const spins = t / duration
		const whole = Math.floor(spins)
		const frac  = spins - whole
		return baseAngle + (whole + easing(frac)) * degrees
	}

	return baseAngle + burstCount * degrees
}


// MARK: resolveLeafUvs
/** Finds UV quads on the child or a nested leaf (for wrappers without `uvs`). */
function resolveLeafUvs(element: ReactEcs.JSX.Element | undefined): number[] {
	let current: ReactEcs.JSX.Element | undefined = element
	while (current) {
		if (current.props?.uvs) return current.props.uvs as number[]
		const nested = current.props?.children as ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined
		current = Array.isArray(nested) ? nested[0] : nested
	}
	return getUVCell({ xStart: 1, yStart: 1, xTotal: 1, yTotal: 1 })
}


// MARK: readExplicitSize
/**
 * Explicit child size override — ignores `%` / `auto` so Spinner does not
 * squash children with the wrapper's fill-parent defaults.
 */
function readExplicitSize(value: PositionUnit | 'auto' | undefined): PositionUnit | undefined {
	if (value === undefined || value === 'auto') return undefined
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && !value.includes('%')) {
		const match = value.match(/^(-?[\d.]+)(px|vw|vh)?$/i)
		if (match && Number.isFinite(parseFloat(match[1]))) {
			return value as PositionUnit
		}
	}
	return undefined
}


// MARK: Spinner
/**
 * UV-rotation for a single child (typically an `Icon`), with the shared burst
 * playback model (`duration`, `burstCount`, `burstInterval`, `burstOffset`).
 *
 * Defaults to filling its parent (`width` / `height` `100%`) and centering the
 * child. Does **not** rewrite child size unless the caller (or an outer
 * `Pulse`) passes an explicit `width` / `height` (px / vw / vh) — forcing
 * container `%` size onto nested `Pulse` / `Icon` was squashing glyphs and
 * breaking centre-pivot rotation.
 *
 * @example
 * <Spinner id="loader" duration={1} degrees={180} burstInterval={0}>
 *   <Icon uvs={atlasIconsFontAwesome.uv.hourglass} width={48} height={48} />
 * </Spinner>
 */
export const Spinner = ({
	id,
	children,
	playing,
	looping,
	duration       = theme.animation.spinnerDurationDefault,
	degrees        = theme.animation.spinnerDegreesDefault,
	burstCount     = theme.animation.spinnerBurstCountDefault,
	burstInterval  = theme.animation.spinnerBurstIntervalDefault,
	burstOffset    = 0,
	easingFunction = easingFunctions.linear,
	width,
	height,
	uiBackground,
	uiTransform,
	...props
}: SpinnerProps) => {
	const child   = Array.isArray(children) ? children[0] : children
	const baseUvs = resolveLeafUvs(child)

	const state = syncAnimationPlayback(id, { playing, looping })
	applyBurstSample(
		state,
		sampleBurstTime(state.elapsed, duration, burstCount, burstInterval, state.looping, burstOffset),
	)

	const angle = resolveSpinnerAngle(
		state.elapsed,
		duration,
		degrees,
		burstCount,
		burstInterval,
		burstOffset,
		state.looping,
		easingFunction,
	)

	const explicitW = readExplicitSize(width)
	const explicitH = readExplicitSize(height)

	const baseRotate = typeof child?.props?.rotate === 'number' ? child.props.rotate : 0
	const childOverrides: {
		uvs     : number[]
		rotate  : number
		width?  : PositionUnit
		height? : PositionUnit
	} = {
		// Fold static `Icon.rotate` into the spin; clear it so Icon does not double-apply.
		uvs   : getRotatedUVs(baseUvs, angle + baseRotate),
		rotate: 0,
	}
	if (explicitW !== undefined) childOverrides.width  = explicitW
	if (explicitH !== undefined) childOverrides.height = explicitH

	return (
		<UiBox
			{...props}
			uiTransform={{
				width         : width  ?? '100%',
				height        : height ?? '100%',
				flexGrow      : 0,
				flexShrink    : 0,
				alignItems    : 'center',
				justifyContent: 'center',
				...uiTransform,
			}}
			uiBackground={uiBackground}
		>
			{child && cloneAnimChildDeep(child, childOverrides)}
		</UiBox>
	)
}
