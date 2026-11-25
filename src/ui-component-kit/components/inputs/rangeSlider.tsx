import { engine, InputAction, inputSystem, PointerEventType, PrimaryPointerInfo } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { sizeValueToPixels } from '../../utils/aspect'
import { getUiScaleFactor } from '../../utils/sizing'


const RANGE_WIDTH_DEFAULT      = 300
const RANGE_HEIGHT_DEFAULT     = 32
const RANGE_TAP_CELLS_DEFAULT  = 21
const RANGE_TAP_CELLS_MAX      = 41
/** Grow the drag catcher far past the slider so a release anywhere ends the drag. */
const CATCHER_REACH            = 6000


// MARK: Types
export type RangeSliderVariant = 'filled' | 'outline'
/**
 * - `round`: thin groove, round thumb taller than the groove (default).
 * - `inset`: thick groove with a round thumb that fits inside it.
 * - `capsule`: thin groove, tall pill-shaped thumb (rounded top and bottom).
 */
export type RangeSliderShape = 'round' | 'inset' | 'capsule'

export type RangeSliderProps = {
	/** Sibling identity. react-ecs passes `key` through as a real prop. */
	key?             : string
	/** Unique id for the per-instance state controller. */
	id               : string
	/** Controlled value. Omit to let the slider keep its own state. */
	value?           : number
	/** Initial value for uncontrolled use. Defaults to `min`. */
	defaultValue?    : number
	min?             : number
	max?             : number
	/** Snap increment. `0` / omitted = continuous. */
	step?            : number
	/** Overall width (`PositionUnit`: px / vw / vh). `%` is unsupported (drag math needs pixels). Defaults to `300`. */
	width?           : PositionUnit
	/**
	 * Overall height in px. Defaults to `32`. `round`: thumb diameter.
	 * `inset`: groove height (the thumb sits inside). `capsule`: thumb height.
	 */
	height?          : number
	/** Thumb and groove shape. Defaults to `round`. See `RangeSliderShape`. */
	shape?           : RangeSliderShape
	/**
	 * Groove thickness in px for `round` / `capsule`. Defaults to `35%` (round)
	 * or `25%` (capsule) of `height`. `inset` always uses `height`.
	 */
	trackHeight?     : number
	/** `inset`: gap between the groove edge and the thumb, in px. Defaults to `4`. */
	thumbInset?      : number
	/** `capsule`: thumb width in px. Defaults to `40%` of `height`. */
	thumbWidth?      : number
	/** `filled` (solid groove + fill) or `outline` (bordered groove, transparent fill track). Defaults to `filled`. */
	variant?         : RangeSliderVariant
	trackColor?      : Color4
	fillColor?       : Color4
	thumbColor?      : Color4
	thumbBorderColor?: Color4
	/** Groove border (outline variant). Defaults to theme tertiary. */
	borderColor?     : Color4
	/**
	 * Invisible tap targets across the slider. UI pointer events carry no
	 * position, so a tap lands on the nearest cell — this is the whole input on
	 * mobile. Defaults to one per step (up to 41) or `21` when continuous.
	 */
	tapCells?        : number
	/** Display only — ignores input. */
	readOnly?        : boolean
	uiTransform?     : UiTransformProps
	/** Fires on every value change (taps and each drag frame). */
	onChange?        : (value: number) => void
	/** Fires once when the pointer is released after a tap or drag. */
	onChangeEnd?     : (value: number) => void
}

type RangeSliderState = { value: number }

type DragState = {
	id        : string
	startValue: number
	startX    : number | null
	lastX     : number
	travelPx  : number
}

type Config = Required<Pick<RangeSliderProps, 'min' | 'max' | 'step'>> & {
	controlled : boolean
	onChange?  : (value: number) => void
	onChangeEnd?: (value: number) => void
}


// MARK: State
const sliderProps   = new Map<string, PropsController<RangeSliderState>>()
/** Latest config per id, so the drag system never calls a stale closure. */
const sliderConfigs = new Map<string, Config>()
let   drag : DragState | null = null
/** Mobile: id whose cells are being scrubbed (finger held down). */
let   scrub: string | null    = null


// MARK: getRangeSliderProps
/** Returns the per-id state controller, creating one if needed. */
export function getRangeSliderProps(
	id          : string,
	initialValue: number = 0
): PropsController<RangeSliderState> {
	let props = sliderProps.get(id)
	if (!props) {
		props = new PropsController<RangeSliderState>({ value: initialValue })
		sliderProps.set(id, props)
	}
	return props
}


// MARK: getRangeSliderValue
/** Current value for `id`, or `undefined` if the slider has never rendered. */
export function getRangeSliderValue(id: string): number | undefined {
	return sliderProps.get(id)?.get('value')
}


// MARK: setRangeSliderValue
/** Sets an uncontrolled slider from game code. Does not fire `onChange`. */
export function setRangeSliderValue(id: string, value: number) {
	const config = sliderConfigs.get(id)
	getRangeSliderProps(id, value).set('value', config ? normalize(value, config) : value)
}


// MARK: normalize
/** Clamps to `[min, max]` and snaps to `step` (float-safe). */
function normalize(
	value : number,
	config: Pick<Config, 'min' | 'max' | 'step'>
): number {
	const { min, max, step } = config
	let next = Math.max(min, Math.min(max, value))
	if (step > 0) {
		next = min + Math.round((next - min) / step) * step
		const decimals = (String(step).split('.')[1] ?? '').length
		next = Number(next.toFixed(decimals))
		next = Math.max(min, Math.min(max, next))
	}
	return next
}


// MARK: commit
/** Writes a value (uncontrolled) and fires `onChange` if it changed. */
function commit(id: string, raw: number) {
	const config = sliderConfigs.get(id)
	const props  = sliderProps.get(id)
	if (!config || !props) return

	const next = normalize(raw, config)
	if (next === props.get('value')) return
	if (!config.controlled) props.set('value', next)
	config.onChange?.(next)
}


// MARK: finish
/** Ends a tap / drag / scrub and fires `onChangeEnd`. */
function finish(id: string) {
	const config = sliderConfigs.get(id)
	const value  = sliderProps.get(id)?.get('value')
	if (drag?.id === id) drag = null
	if (scrub === id)    scrub = null
	if (config && value !== undefined) config.onChangeEnd?.(value)
}


// MARK: readCursorX
function readCursorX(): number | null {
	return PrimaryPointerInfo.getOrNull(engine.RootEntity)?.screenCoordinates?.x ?? null
}


// MARK: sys_rangeSliderDrag
/**
 * Desktop drag: offsets the value by how far the cursor has moved since the
 * press (absolute `screenCoordinates`, real px → virtual px), same approach as
 * `ColorPicker`. The full-screen catcher ends the drag on release; `PET_UP` is
 * the safety net for both the desktop drag and the mobile scrub.
 */
function sys_rangeSliderDrag() {
	if (!drag && !scrub) return

	if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP)) {
		const id = drag?.id ?? scrub
		if (id) finish(id)
		return
	}

	if (!drag) return

	const cursorX = readCursorX()
	if (cursorX === null) return
	if (drag.startX === null) drag.startX = cursorX
	if (cursorX === drag.lastX) return
	drag.lastX = cursorX

	const config = sliderConfigs.get(drag.id)
	if (!config || drag.travelPx <= 0) {
		drag = null
		return
	}

	const scale = getUiScaleFactor() || 1
	const dx    = (cursorX - drag.startX) / scale
	commit(drag.id, drag.startValue + (dx / drag.travelPx) * (config.max - config.min))
}

engine.addSystem(sys_rangeSliderDrag)


// MARK: RangeSlider
/**
 * Horizontal value slider: groove, fill and a thumb, in three shapes
 * (`round`, `inset`, `capsule` — see `RangeSliderShape`).
 *
 * Input:
 * - Tap / click anywhere on the slider to jump to that point (nearest tap cell).
 *   This is the full interface on mobile, where there is no free cursor.
 * - Desktop: keep the button held after the press to drag; release anywhere.
 * - Mobile: sliding a held finger across cells also updates the value where the
 *   client reports enter events during a touch.
 *
 * State lives in a per-`id` controller — read it with `getRangeSliderValue(id)`.
 */
export function RangeSlider({
	id,
	value,
	defaultValue,
	min          = 0,
	max          = 100,
	step         = 0,
	width        = RANGE_WIDTH_DEFAULT,
	height       = RANGE_HEIGHT_DEFAULT,
	shape        = 'round',
	trackHeight,
	thumbInset   = 4,
	thumbWidth,
	variant      = 'filled',
	trackColor,
	fillColor,
	thumbColor,
	thumbBorderColor,
	borderColor,
	tapCells,
	readOnly     = false,
	uiTransform,
	onChange,
	onChangeEnd,
}: RangeSliderProps) {
	const theme = getTheme()

	if (!(max > min)) {
		console.error('RangeSlider: max must be greater than min', id, min, max)
		return null
	}

	const controlled = value !== undefined
	sliderConfigs.set(id, { min, max, step: Math.max(0, step), controlled, onChange, onChangeEnd })

	const props = getRangeSliderProps(id, normalize(defaultValue ?? min, { min, max, step }))
	if (controlled) {
		const next = normalize(value, { min, max, step })
		if (next !== props.get('value')) props.set('value', next)
	}
	const current = props.get('value')
	const t       = (current - min) / (max - min)

	let widthPx = RANGE_WIDTH_DEFAULT
	const measured = sizeValueToPixels(width)
	if (measured !== null && measured > 0) {
		widthPx = measured
	} else if (width !== RANGE_WIDTH_DEFAULT) {
		console.error('RangeSlider: width: unsupported or relative unit (need px/vw/vh)', width)
	}

	const outlined = variant === 'outline'
	const inset    = shape === 'inset'

	// Geometry (virtual px). The thumb travels between `edge` and `widthPx - edge - thumbW`.
	const edge     = inset ? Math.max(0, thumbInset) : 0
	const thumbH   = inset ? Math.max(4, height - edge * 2) : height
	const thumbW   = shape === 'capsule'
		? Math.max(4, thumbWidth ?? Math.round(height * 0.4))
		: thumbH
	const groove   = inset
		? height
		: Math.max(2, trackHeight ?? Math.round(height * (shape === 'capsule' ? 0.25 : 0.35)))
	const travelPx = Math.max(1, widthPx - edge * 2 - thumbW)
	const thumbX   = edge + t * travelPx
	// Round / capsule: groove ends line up with the thumb centre at min / max.
	const grooveX  = inset ? 0 : thumbW / 2
	const grooveW  = inset ? widthPx : Math.max(0, widthPx - thumbW)
	// Inset: fill wraps the thumb. Otherwise it runs to the thumb centre.
	const fillW    = inset ? thumbX + thumbW + edge : t * travelPx

	const grooveFill   = trackColor ?? (outlined ? Color4.Clear() : theme.colors.secondary)
	const grooveStroke = borderColor ?? theme.colors.tertiary
	const barFill      = fillColor ?? theme.colors.primary
	const knobFill     = thumbColor ?? (outlined && !inset ? theme.colors.dark : theme.colors.light)
	const knobBorder   = inset && thumbBorderColor === undefined ? 0 : theme.border.width
	const knobStroke   = thumbBorderColor ?? theme.colors.primary

	const steps = step > 0 ? Math.round((max - min) / step) : 0
	const cells = Math.max(2, Math.round(
		tapCells ?? (steps > 0 && steps + 1 <= RANGE_TAP_CELLS_MAX ? steps + 1 : RANGE_TAP_CELLS_DEFAULT)
	))
	const cellValue = (i: number) => min + (i / (cells - 1)) * (max - min)
	const dragging  = drag !== null && drag.id === id

	// MARK: press
	const press = (i: number) => {
		const target = cellValue(i)
		commit(id, target)
		if (isMobile()) {
			scrub = id
			return
		}
		const cursorX = readCursorX()
		drag = {
			id,
			startValue: normalize(target, { min, max, step }),
			startX    : cursorX,
			lastX     : cursorX ?? NaN,
			travelPx,
		}
	}

	return (
		<UiEntity
			key         = {`${id}_root`}
			uiTransform = {{
				width         : widthPx,
				height        : height,
				flexGrow      : 0,
				flexShrink    : 0,
				overflow      : 'visible',
				...uiTransform,
			}}
		>
			{/* Groove */}
			<UiEntity
				key         = {`${id}_groove`}
				uiTransform = {{
					positionType : 'absolute',
					position     : { left: grooveX, top: (height - groove) / 2 },
					width        : grooveW,
					height       : groove,
					borderRadius : groove / 2,
					borderWidth  : outlined ? theme.border.width : 0,
					borderColor  : grooveStroke,
					overflow     : 'visible',
					pointerFilter: 'none',
				}}
				uiBackground = {{ color: Color4.create(grooveFill.r, grooveFill.g, grooveFill.b, grooveFill.a) }}
			>
				{/* Fill */}
				<UiEntity
					key         = {`${id}_fill`}
					uiTransform = {{
						positionType : 'absolute',
						position     : { left: 0, top: 0 },
						width        : fillW,
						height       : '100%',
						borderRadius : groove / 2,
						pointerFilter: 'none',
					}}
					uiBackground = {{ color: Color4.create(barFill.r, barFill.g, barFill.b, barFill.a) }}
				/>
			</UiEntity>

			{/* Thumb */}
			<UiEntity
				key         = {`${id}_thumb`}
				uiTransform = {{
					positionType : 'absolute',
					position     : { left: thumbX, top: (height - thumbH) / 2 },
					width        : thumbW,
					height       : thumbH,
					borderRadius : Math.min(thumbW, thumbH) / 2,
					borderWidth  : knobBorder,
					borderColor  : knobStroke,
					pointerFilter: 'none',
				}}
				uiBackground = {{ color: Color4.create(knobFill.r, knobFill.g, knobFill.b, knobFill.a) }}
			/>

			{/* Tap cells — cover the whole slider. */}
			{readOnly ? null : (
				<UiEntity
					key         = {`${id}_cells`}
					uiTransform = {{
						positionType : 'absolute',
						position     : { left: 0, top: 0 },
						width        : '100%',
						height       : '100%',
						flexDirection: 'row',
						pointerFilter: 'none',
					}}
				>
					{Array.from({ length: cells }, (_, i) => (
						<UiEntity
							key         = {`${id}_cell_${i}`}
							uiTransform = {{
								width        : `${100 / cells}%` as PositionUnit,
								height       : '100%',
								flexGrow     : 0,
								flexShrink   : 0,
								pointerFilter: 'block',
							}}
							onMouseDown  = {() => press(i)}
							onMouseEnter = {() => { if (scrub === id) commit(id, cellValue(i)) }}
							onMouseUp    = {() => { if (scrub === id || drag?.id === id) finish(id) }}
						/>
					))}
				</UiEntity>
			)}

			{/* Release catcher — exists only while this slider is being dragged. Last child so it stacks on top. */}
			{dragging ? (
				<UiEntity
					key         = {`${id}_drag_catcher`}
					uiTransform = {{
						positionType : 'absolute',
						position     : { top: -CATCHER_REACH, left: -CATCHER_REACH },
						width        : CATCHER_REACH * 2 + widthPx,
						height       : CATCHER_REACH * 2 + height,
						pointerFilter: 'block',
					}}
					onMouseUp = {() => { if (drag?.id === id) finish(id) }}
				/>
			) : null}
		</UiEntity>
	)
}
