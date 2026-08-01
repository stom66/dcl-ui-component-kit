import { engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getRotatedUVs, getUVCell } from '../../utils'
import { easingFunctions, type EasingFn } from '../../utils/tweens'
import { UiBox, type UiBoxProps } from '../base'

export type SpinnerProps = UiBoxProps & {
	/** Texture source. Be sure to specify UVs if using a texture atlas. See the various UV helper utitlies **/
	textureSrc : string
	/** Base UV quad for the spinner cell; rotated each frame by the shared system. */
	uvs?       : number[]
	width?     : PositionUnit | "auto" | undefined
	height?    : PositionUnit | "auto" | undefined

	/** Rotation speed in degrees per second. Defaults to `180`. */
	speed?     : number
	/** Seconds to rest after each full revolution. Defaults to `0` (continuous). */
	interval?  : number
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


// MARK: Spinner
/**
 * Base loading spinner. Rotates `uvs` over `textureSrc` using a shared engine system.
 * Prefer a named variant (`SpinnerDots`, …) for built-in atlas cells, or pass a custom
 * atlas / UV quad for project-specific spinners.
 *
 * Native overrides (`uiTransform` / `uiBackground` / `uiText`) merge over defaults.
 */
export const Spinner = ({
	textureSrc,
	uvs,
	width          = theme.icons.defaultSize,
	height         = theme.icons.defaultSize,
	speed          = theme.animation.spinnerSpeedDefault,
	interval       = theme.animation.spinnerIntervalDefault,
	easingFunction = easingFunctions.linear,
	uiBackground,
	uiTransform,
	...props
}: SpinnerProps) => {
	const size  = theme.icons.minSize
	const angle = resolveSpinnerAngle(elapsedTime, speed, interval, easingFunction)
	uvs = uvs ?? getUVCell({ xStart: 1, yStart: 1, xTotal: 1, yTotal: 1 })

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : width,
				height    : height,
				flexGrow  : 0,
				flexShrink: 0,
				...(width  === "auto" ? { minWidth : size } : {}),
				...(height === "auto" ? { minHeight: size } : {}),
				...uiTransform
			}}
			uiBackground={{
				texture    : { src: textureSrc },
				textureMode: "stretch",
				uvs        : getRotatedUVs(uvs, angle),
				color      : Color4.White(),
				...uiBackground
			}}
		/>
	)
}
