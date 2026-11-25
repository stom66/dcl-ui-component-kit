import { engine, InputAction, inputSystem, PointerEventType } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'

import { playOnce } from '../animations/animationPlayback'
import { Pulse } from '../animations/pulse'
import { resolveKitEntityProps } from '../base'
import { mergeTextShorthands } from '../text/textShorthands'


const HOLD_FILL_TIME_DEFAULT = 1.5
const HOLD_PULSE_SCALE       = 1.08
const HOLD_PULSE_DURATION    = 0.3


// MARK: Types
type ButtonHoldState = {
	/** 0–1 fill. */
	progress: number
}

type HoldRuntime = {
	holding    : boolean
	/** Set when the bar fills; cleared on release so one hold completes once. */
	completed  : boolean
	fillTime   : number
	drainTime  : number
	onComplete?: () => void
	onProgress?: (progress: number) => void
}

export type ButtonHoldProps = {
	/** Unique id for the per-instance state controller. */
	id              : string
	textLabel?      : string
	/** Defaults to `theme.buttons.heightDefault × theme.buttons.aspectRatio`. */
	width?          : PositionUnit
	/** Height in px. Defaults to `theme.buttons.heightDefault`. */
	height?         : number
	/** Seconds of holding to fill from empty to full. Defaults to `1.5`. */
	fillTime?       : number
	/** Seconds to drain from full to empty after release. Defaults to `fillTime / 2`. */
	drainTime?      : number
	/** Button fill (constant — it does not change on hover or press). Defaults to theme secondary. */
	backgroundColor?: Color4
	/** Progress fill. Defaults to theme primary. */
	fillColor?      : Color4
	borderColor?    : Color4
	borderWidth?    : number
	/** Defaults to `theme.border.radiusSmall`. */
	borderRadius?   : number
	fontColor?      : Color4
	/** Label size (theme base px). */
	fontSize?       : number
	/** Pulse once when the bar fills. Defaults to `true`. */
	pulse?          : boolean
	/** Ignore input. */
	disabled?       : boolean
	uiTransform?    : UiTransformProps
	/** Fires once when the bar fills. Holding on does nothing more until release. */
	onComplete?     : () => void
	/** Fires every frame the progress changes, with `0`–`1`. */
	onProgress?     : (progress: number) => void
	children?       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: State
const holdProps   = new Map<string, PropsController<ButtonHoldState>>()
const holdRuntime = new Map<string, HoldRuntime>()
/** Ids whose bar is moving (held, or draining). The system skips everything else. */
const activeHolds = new Set<string>()
/** Whether each id pulses on completion. */
const holdPulse   = new Map<string, boolean>()


// MARK: getButtonHoldProps
/** Returns the per-id state controller (`progress` 0–1), creating one if needed. */
export function getButtonHoldProps(id: string): PropsController<ButtonHoldState> {
	let props = holdProps.get(id)
	if (!props) {
		props = new PropsController<ButtonHoldState>({ progress: 0 })
		holdProps.set(id, props)
	}
	return props
}


// MARK: getButtonHoldProgress
/** Current fill (`0`–`1`) for `id`, or `0` if the button has never rendered. */
export function getButtonHoldProgress(id: string): number {
	return holdProps.get(id)?.get('progress') ?? 0
}


// MARK: release
function release(id: string) {
	const runtime = holdRuntime.get(id)
	if (!runtime) return
	runtime.holding   = false
	runtime.completed = false
}


// MARK: sys_buttonHold
/**
 * Fills held buttons at `1 / fillTime` per second and drains released ones at
 * `1 / drainTime`. A global `PET_UP` releases every hold, so letting go off
 * the button still drains it.
 */
function sys_buttonHold(dt: number) {
	if (activeHolds.size === 0) return

	const pointerUp = inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP)

	for (const id of activeHolds) {
		const runtime = holdRuntime.get(id)
		const props   = holdProps.get(id)
		if (!runtime || !props) {
			activeHolds.delete(id)
			continue
		}
		if (pointerUp) release(id)

		const before = props.get('progress')
		let   after  = before
		if (runtime.holding) {
			if (!runtime.completed) after = Math.min(1, before + dt / Math.max(0.01, runtime.fillTime))
		} else {
			after = Math.max(0, before - dt / Math.max(0.01, runtime.drainTime))
		}

		if (after !== before) {
			props.set('progress', after)
			runtime.onProgress?.(after)
		}

		if (runtime.holding && !runtime.completed && after >= 1) {
			runtime.completed = true
			if (holdPulse.get(id)) playOnce(`${id}_pulse`)
			runtime.onComplete?.()
		}

		if (!runtime.holding && after <= 0) activeHolds.delete(id)
	}
}

engine.addSystem(sys_buttonHold)


// MARK: ButtonHold
/**
 * Press-and-hold button. While held, a bar fills the button left to right over
 * `fillTime`; released early, it drains over `drainTime` (default half the fill
 * time). Rates are linear: with `fillTime` 3 and `drainTime` 1, holding 2 s
 * fills 2/3, and half a second after release 1/6 is left. When the bar fills,
 * the button pulses once and `onComplete` fires.
 *
 * Press starts on `mouseDown` on every platform; releasing anywhere (or leaving
 * the button) drains it.
 */
export function ButtonHold({
	id,
	textLabel,
	width,
	height,
	fillTime     = HOLD_FILL_TIME_DEFAULT,
	drainTime,
	backgroundColor,
	fillColor,
	borderColor,
	borderWidth,
	borderRadius,
	fontColor,
	fontSize,
	pulse        = true,
	disabled     = false,
	uiTransform,
	onComplete,
	onProgress,
	children,
}: ButtonHoldProps) {
	const theme = getTheme()
	const props = getButtonHoldProps(id)

	// Keep the latest handlers / timings so the system never calls a stale closure.
	let runtime = holdRuntime.get(id)
	if (!runtime) {
		runtime = { holding: false, completed: false, fillTime, drainTime: drainTime ?? fillTime / 2 }
		holdRuntime.set(id, runtime)
	}
	runtime.fillTime   = fillTime
	runtime.drainTime  = drainTime ?? fillTime / 2
	runtime.onComplete = onComplete
	runtime.onProgress = onProgress
	holdPulse.set(id, pulse)

	const h        = height ?? theme.buttons.heightDefault
	const w        = width ?? Math.round(h * theme.buttons.aspectRatio)
	const radius   = borderRadius ?? theme.border.radiusSmall
	const progress = props.get('progress')
	const base     = backgroundColor ?? theme.colors.secondary
	const bar      = fillColor ?? theme.colors.primary
	const stroke   = borderColor ?? theme.colors.primary

	const press = () => {
		if (disabled) return
		const current = holdRuntime.get(id)
		if (!current) return
		current.holding   = true
		current.completed = false
		activeHolds.add(id)
	}

	return (
		<Pulse
			id            = {`${id}_pulse`}
			playing       = {false}
			looping       = {false}
			duration      = {HOLD_PULSE_DURATION}
			burstCount    = {1}
			scaleMin      = {1}
			scaleMax      = {HOLD_PULSE_SCALE}
			uiTransform   = {{ overflow: 'visible', ...uiTransform }}
		>
			<UiEntity
				key         = {`${id}_face`}
				uiTransform = {{
					width        : w,
					height       : h,
					flexShrink   : 0,
					overflow     : 'hidden',
					borderRadius : radius,
					borderWidth  : borderWidth ?? theme.buttons.borderWidth,
					borderColor  : stroke,
					pointerFilter: disabled ? 'none' : 'block',
				}}
				uiBackground = {{ color: Color4.create(base.r, base.g, base.b, base.a) }}
				onMouseDown  = {press}
				onMouseUp    = {() => release(id)}
				onMouseLeave = {() => release(id)}
			>
				{/* Fill */}
				<UiEntity
					key         = {`${id}_fill`}
					uiTransform = {{
						positionType : 'absolute',
						position     : { left: 0, top: 0 },
						width        : `${progress * 100}%`,
						height       : '100%',
						borderRadius : radius,
						pointerFilter: 'none',
					}}
					uiBackground = {{ color: Color4.create(bar.r, bar.g, bar.b, bar.a) }}
				/>
				{/* Label — its own layer so the fill draws underneath it. */}
				<UiEntity
					key = {`${id}_label`}
					{...resolveKitEntityProps({
						uiTransform: {
							positionType  : 'absolute',
							position      : { left: 0, top: 0 },
							width         : '100%',
							height        : '100%',
							alignItems    : 'center',
							justifyContent: 'center',
							pointerFilter : 'none',
						},
						uiText: mergeTextShorthands(
							{
								value    : '',
								fontSize : theme.typography.size.default,
								font     : theme.typography.family.default,
								color    : theme.colors.light,
								textAlign: 'middle-center',
								textWrap : 'nowrap',
							},
							undefined,
							{ value: textLabel, fontSize, fontColor },
						),
					})}
				>
					{children}
				</UiEntity>
			</UiEntity>
		</Pulse>
	)
}
