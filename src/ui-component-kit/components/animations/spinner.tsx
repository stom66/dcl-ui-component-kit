import { engine } from '@dcl/sdk/ecs'
import ReactEcs, { type PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getRotatedUVs, getUVCell } from '../../utils'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'
import { cloneAnimChildDeep } from './animationChild'

export type SpinnerProps = UiBoxProps & {
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Rotation speed in degrees per second. Defaults to theme `spinnerSpeedDefault`. */
	speed?          : number
	/** Seconds to rest after each full revolution. Defaults to `0` (continuous). */
	interval?       : number
	/** Easing applied to progress within each revolution. Defaults to `linear`. */
	easingFunction? : EasingFn
}

const theme = getTheme()
let elapsedTime = 0


// MARK: sys_rotate
function sys_rotate(delta: number) {
	elapsedTime += delta
}

engine.addSystem(sys_rotate)


// MARK: resolveSpinnerAngle
/**
 * Continuous rotation when `interval` is 0; otherwise spins one revolution,
 * pauses for `interval` seconds, then repeats. `easing` shapes progress
 * within each revolution.
 */
function resolveSpinnerAngle(
	elapsed : number,
	speed   : number,
	interval: number,
	easing  : EasingFn
): number {
	if (speed === 0) return 0

	const absSpeed = Math.abs(speed)
	const sign     = speed >= 0 ? 1 : -1

	if (interval <= 0) {
		const revolutions = elapsed * absSpeed / 360
		const whole       = Math.floor(revolutions)
		const frac        = revolutions - whole
		return (whole + easing(frac)) * 360 * sign
	}

	const spinDuration = 360 / absSpeed
	const cycle        = spinDuration + interval
	const t            = elapsed % cycle
	const cyclesDone   = Math.floor(elapsed / cycle)

	if (t < spinDuration) {
		return (cyclesDone + easing(t / spinDuration)) * 360 * sign
	}

	return (cyclesDone + 1) * 360 * sign
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
/** Numeric size only — ignores `%` / `auto` so Spinner does not squash children. */
function readExplicitSize(value: PositionUnit | 'auto' | undefined): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && !value.includes('%') && value !== 'auto') {
		const n = Number(value)
		if (Number.isFinite(n)) return n
	}
	return undefined
}


// MARK: Spinner
/**
 * Continuous UV-rotation for a single child (typically an `Icon`).
 *
 * Defaults to filling its parent (`width` / `height` `100%`) and centering the
 * child. Does **not** rewrite child size unless the caller (or an outer
 * `Pulse`) passes an explicit numeric `width` / `height` — forcing container
 * size onto nested `Pulse` / `Icon` was squashing glyphs and breaking
 * centre-pivot rotation.
 *
 * @example
 * <Spinner speed={180}>
 *   <Icon uvs={atlasIconsFontAwesome.uv.hourglass} width={48} height={48} />
 * </Spinner>
 */
export const Spinner = ({
	children,
	speed          = theme.animation.spinnerSpeedDefault,
	interval       = theme.animation.spinnerIntervalDefault,
	easingFunction = easingFunctions.linear,
	width,
	height,
	uiBackground,
	uiTransform,
	...props
}: SpinnerProps) => {
	const child   = Array.isArray(children) ? children[0] : children
	const baseUvs = resolveLeafUvs(child)
	const angle   = resolveSpinnerAngle(elapsedTime, speed, interval, easingFunction)

	const explicitW = readExplicitSize(width)
	const explicitH = readExplicitSize(height)

	const childOverrides: {
		uvs     : number[]
		width?  : number
		height? : number
	} = {
		uvs: getRotatedUVs(baseUvs, angle),
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
