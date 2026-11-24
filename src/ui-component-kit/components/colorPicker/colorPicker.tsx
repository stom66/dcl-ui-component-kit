import { engine, InputAction, inputSystem, PointerEventType, PrimaryPointerInfo } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { sizeValueToPixels } from '../../utils/aspect'
import { getUiScaleFactor } from '../../utils/sizing'

import {
	clamp01,
	hexToRgb,
	hsvToRgb,
	hueSatToWheelUv,
	rgbToHex,
	rgbToHsv,
	wheelUvToHueSat,
	type Rgb,
} from './colorPicker.math'


const WHEEL_TEXTURE           = 'assets/images/ui-component-kit/colorPicker-wheel.png'
const VALUE_TEXTURE           = 'assets/images/ui-component-kit/colorPicker-value.png'
const DEFAULT_COLOR           = '#FFFFFF'
const DEFAULT_SIZE            = 220
const DEFAULT_SLIDER_HEIGHT   = 28
const DEFAULT_GRID_RESOLUTION = 16
const DEFAULT_PRESET_SIZE     = 28
const DEFAULT_SPACING         = 12

/** Grow the drag catcher far past the picker so a release anywhere ends the drag. */
const CATCHER_REACH = 6000


// MARK: Types
/** Live picker state, held in a per-id `PropsController` (see `getColorPickerProps`). */
export type ColorPickerState = {
	/** 0–1, red at the top of the wheel, counter-clockwise. */
	hue       : number
	/** 0–1, center (white) → rim. */
	saturation: number
	/** 0–1 brightness from the value slider. */
	value     : number
	/** Current color (alpha always 1). */
	color     : Color4
	/** Current color as `#RRGGBB`. */
	hex       : string
}

export type ColorPickerChangeHandler = (color: Color4, hex: string) => void

export type ColorPickerProps = {
	/** Unique id — keys the per-instance state controller. Read it elsewhere with `getColorPickerColor(id)`. */
	id              : string
	/** Starting color (`Color4` or hex string). Only used when the controller is first created. Defaults to white. */
	defaultColor?   : Color4 | string
	/** Wheel diameter (`PositionUnit`: px / vw / vh). `%` is unsupported (drag math needs pixels). Defaults to `220`. */
	size?           : PositionUnit
	/** Show the brightness (HSV value) slider under the wheel. Defaults to `true`. */
	showValueSlider?: boolean
	/** Value slider height in virtual px (ends are fully rounded). Defaults to `28`. */
	sliderHeight?   : number
	/**
	 * Hit cells per side of the wheel (and along the slider). UI pointer events carry
	 * no position, so the wheel is tiled with N×N invisible cells (only those touching
	 * the circle are created, ≈ 0.8 × N²). A click picks the cell's center; on desktop,
	 * dragging refines it continuously. Higher = finer taps, more entities. Defaults to `16`.
	 */
	gridResolution? : number
	/** Optional preset swatches (hex strings) shown under the slider. */
	presets?        : string[]
	/** Preset swatch size in virtual px. Defaults to `28`. */
	presetSize?     : number
	/** Vertical gap between wheel, slider and presets. Defaults to `12`. */
	spacing?        : number
	/** Fires whenever the color changes (click, every drag frame, preset). */
	onChange?       : ColorPickerChangeHandler
	/** Extra layout for the root column. */
	uiTransform?    : UiTransformProps
}

type WheelCell = { col: number, row: number, u: number, v: number }

type DragState = {
	id     : string
	target : 'wheel' | 'value'
	/** Wheel u (or slider value) when the drag began. */
	startU : number
	/** Wheel v when the drag began (unused for the slider). */
	startV : number
	/** Cursor screen position when the drag began (null until first read). */
	startX : number | null
	startY : number | null
	/** Last cursor position applied, to skip frames with no movement. */
	lastX  : number
	lastY  : number
	/** Rendered wheel / slider width in virtual px. */
	sizePx : number
}


// MARK: State
const pickerProps    = new Map<string, PropsController<ColorPickerState>>()
const changeHandlers = new Map<string, ColorPickerChangeHandler>()
const wheelCellCache = new Map<number, WheelCell[]>()
let   drag: DragState | null = null


// MARK: toColor4
function toColor4(rgb: Rgb): Color4 {
	return Color4.create(rgb.r, rgb.g, rgb.b, 1)
}


// MARK: resolveRgb
/** `Color4` or hex → RGB. Invalid hex logs and falls back to white. */
function resolveRgb(color: Color4 | string): Rgb {
	if (typeof color !== 'string') return { r: color.r, g: color.g, b: color.b }

	const rgb = hexToRgb(color)
	if (!rgb) {
		console.error('ColorPicker: invalid hex color', color)
		return { r: 1, g: 1, b: 1 }
	}
	return rgb
}


// MARK: stateFromHsv
function stateFromHsv(
	hue       : number,
	saturation: number,
	value     : number
): ColorPickerState {
	const rgb = hsvToRgb(hue, saturation, value)
	return {
		hue,
		saturation,
		value,
		color: toColor4(rgb),
		hex  : rgbToHex(rgb),
	}
}


// MARK: getColorPickerProps
/** Returns the per-picker state controller, creating it (from `initialColor`) if needed. */
export function getColorPickerProps(
	id           : string,
	initialColor?: Color4 | string
): PropsController<ColorPickerState> {
	let props = pickerProps.get(id)
	if (!props) {
		const rgb = resolveRgb(initialColor ?? DEFAULT_COLOR)
		const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
		props = new PropsController<ColorPickerState>(stateFromHsv(hsv.h, hsv.s, hsv.v))
		pickerProps.set(id, props)
	}
	return props
}


// MARK: getColorPickerColor
/** Current color of picker `id` (a copy), or `null` if it has never been created. */
export function getColorPickerColor(id: string): Color4 | null {
	const props = pickerProps.get(id)
	if (!props) return null
	const c = props.get('color')
	return Color4.create(c.r, c.g, c.b, c.a)
}


// MARK: getColorPickerHex
/** Current color of picker `id` as `#RRGGBB`, or `null` if it has never been created. */
export function getColorPickerHex(id: string): string | null {
	return pickerProps.get(id)?.get('hex') ?? null
}


// MARK: setColorPickerColor
/**
 * Sets picker `id` from code (e.g. restoring a saved color). Creates the controller
 * if needed. Pass `notify: true` to also fire the picker's `onChange`.
 */
export function setColorPickerColor(
	id    : string,
	color : Color4 | string,
	notify: boolean = false
) {
	const rgb = resolveRgb(color)
	const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
	getColorPickerProps(id, color)
	commitHsv(id, hsv.h, hsv.s, hsv.v, notify)
}


// MARK: commitHsv
/** Writes a new HSV into the controller and (optionally) fires `onChange`. */
function commitHsv(
	id        : string,
	hue       : number,
	saturation: number,
	value     : number,
	notify    : boolean = true
) {
	const props = getColorPickerProps(id)
	const next  = stateFromHsv(hue, saturation, value)
	props.update(next)

	if (!notify) return
	const handler = changeHandlers.get(id)
	if (handler) handler(Color4.create(next.color.r, next.color.g, next.color.b, 1), next.hex)
}


// MARK: getWheelCells
/**
 * N×N grid over the wheel's bounding square, keeping only cells that touch the
 * circle. `u` / `v` are each cell's center in wheel space (0–1, top-left origin).
 */
function getWheelCells(n: number): WheelCell[] {
	const cached = wheelCellCache.get(n)
	if (cached) return cached

	const cells: WheelCell[] = []
	for (let row = 0; row < n; row++) {
		for (let col = 0; col < n; col++) {
			// Closest point of this cell to the wheel center.
			const nearestU = Math.min(Math.max(0.5, col / n), (col + 1) / n)
			const nearestV = Math.min(Math.max(0.5, row / n), (row + 1) / n)
			const dx       = nearestU - 0.5
			const dy       = nearestV - 0.5
			if (dx * dx + dy * dy > 0.25) continue

			cells.push({ col, row, u: (col + 0.5) / n, v: (row + 0.5) / n })
		}
	}

	wheelCellCache.set(n, cells)
	return cells
}


// MARK: readCursor
/** Current cursor position in screen px, or null if unavailable. */
function readCursor(): { x: number, y: number } | null {
	const coords = PrimaryPointerInfo.getOrNull(engine.RootEntity)?.screenCoordinates
	if (!coords) return null
	return { x: coords.x, y: coords.y }
}


// MARK: beginDrag
/** Starts a desktop drag anchored at the cursor's current screen position. */
function beginDrag(
	id    : string,
	target: 'wheel' | 'value',
	u     : number,
	v     : number,
	sizePx: number
) {
	if (isMobile()) return // no free cursor on mobile — taps only

	const cursor = readCursor()
	drag = {
		id,
		target,
		startU: u,
		startV: v,
		startX: cursor ? cursor.x : null,
		startY: cursor ? cursor.y : null,
		lastX : cursor ? cursor.x : NaN,
		lastY : cursor ? cursor.y : NaN,
		sizePx,
	}
}


// MARK: endDrag
function endDrag() {
	drag = null
}


// MARK: sys_colorPickerDrag
/**
 * Desktop drag refinement. React-ECS pointer callbacks carry no position, so while
 * a drag is active we measure how far the cursor has moved from where the drag
 * began (`PrimaryPointerInfo.screenCoordinates`, real px → virtual px via the UI
 * scale factor) and offset the starting wheel / slider position by that much.
 *
 * Absolute offset, NOT accumulated `screenDelta`: `screenDelta` is per rendered
 * frame, and the scene ticks slower than the renderer, so summing it drops the
 * movement of every frame between ticks — the pick lags behind the cursor.
 *
 * The full-screen catcher ends the drag on release; `PET_UP` is the safety net.
 */
function sys_colorPickerDrag() {
	if (!drag) return

	if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP)) {
		drag = null
		return
	}

	const cursor = readCursor()
	if (!cursor) return

	// Anchor on the first tick if the cursor wasn't readable at mouse-down.
	if (drag.startX === null || drag.startY === null) {
		drag.startX = cursor.x
		drag.startY = cursor.y
	}
	if (cursor.x === drag.lastX && cursor.y === drag.lastY) return
	drag.lastX = cursor.x
	drag.lastY = cursor.y

	const props = pickerProps.get(drag.id)
	if (!props || drag.sizePx <= 0) {
		drag = null
		return
	}

	const scale = getUiScaleFactor() || 1
	const du    = (cursor.x - drag.startX) / scale / drag.sizePx
	const dv    = (cursor.y - drag.startY) / scale / drag.sizePx // screen origin is top-left: +y = down = +v

	if (drag.target === 'wheel') {
		// Track in the bounding square so the pick follows the cursor around the
		// outside of the rim; saturation clamps to 1 there.
		const u        = clamp01(drag.startU + du)
		const v        = clamp01(drag.startV + dv)
		const { h, s } = wheelUvToHueSat(u, v)
		commitHsv(drag.id, h, s, props.get('value'))
	} else {
		commitHsv(drag.id, props.get('hue'), props.get('saturation'), clamp01(drag.startU + du))
	}
}

engine.addSystem(sys_colorPickerDrag)


// MARK: ColorPicker
/**
 * HSV color wheel input: hue around the circle, saturation outward from the
 * center, plus an optional brightness slider and preset swatches.
 *
 * The wheel texture is generated by `scripts/generate-color-picker-textures.mjs`
 * from `colorPicker.math.ts` — the same `sampleWheel` math this component uses to
 * turn a hit cell back into a color, so what you see is what you pick.
 *
 * State lives in a per-`id` `PropsController` — read it anywhere with
 * `getColorPickerColor(id)` / `getColorPickerHex(id)`, set it with
 * `setColorPickerColor(id, …)`, or react to edits with `onChange`.
 *
 * Pointer: wheel and slider pick on `mouseDown` (and start a drag on desktop;
 * mobile has no `screenDelta`, so taps snap to the nearest cell). Presets follow
 * the kit button rule — `mouseDown` on mobile, `mouseUp` on desktop.
 */
export function ColorPicker({
	id,
	defaultColor    = DEFAULT_COLOR,
	size            = DEFAULT_SIZE,
	showValueSlider = true,
	sliderHeight    = DEFAULT_SLIDER_HEIGHT,
	gridResolution  = DEFAULT_GRID_RESOLUTION,
	presets,
	presetSize      = DEFAULT_PRESET_SIZE,
	spacing         = DEFAULT_SPACING,
	onChange,
	uiTransform,
}: ColorPickerProps) {
	const theme = getTheme()
	const props = getColorPickerProps(id, defaultColor)

	// Keep the latest handler so the drag system never calls a stale closure.
	if (onChange) changeHandlers.set(id, onChange)
	else          changeHandlers.delete(id)

	const hue        = props.get('hue')
	const saturation = props.get('saturation')
	const value      = props.get('value')
	const color      = props.get('color')
	const hex        = props.get('hex')

	let wheelPx = DEFAULT_SIZE
	const sizePx = sizeValueToPixels(size)
	if (sizePx !== null && sizePx > 0) {
		wheelPx = sizePx
	} else if (size !== DEFAULT_SIZE) {
		console.error('ColorPicker: size: unsupported or relative unit (need px/vw/vh)', size)
	}

	const n          = Math.max(2, Math.round(gridResolution))
	const cellPx     = wheelPx / n
	const cells      = getWheelCells(n)
	const markerUv   = hueSatToWheelUv(hue, saturation)
	const markerSize = Math.max(10, Math.round(wheelPx * 0.07))
	const ringColor  = value > 0.6 ? theme.colors.dark : theme.colors.light
	const fullBright = toColor4(hsvToRgb(hue, saturation, 1))
	const capR       = sliderHeight / 2
	const rampPx     = Math.max(1, wheelPx - sliderHeight)
	const knobSize   = sliderHeight + 6
	const dragging   = drag !== null && drag.id === id

	return (
		<UiEntity
			key        = {`${id}_root`}
			uiTransform = {{
				display       : 'flex',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'flex-start',
				width         : wheelPx,
				flexGrow      : 0,
				flexShrink    : 0,
				...uiTransform,
			}}
		>
			{/* Wheel — texture tinted by brightness (HSV value scales RGB, so tint = exact). */}
			<UiEntity
				key         = {`${id}_wheel`}
				uiTransform = {{
					width     : wheelPx,
					height    : wheelPx,
					flexGrow  : 0,
					flexShrink: 0,
				}}
				uiBackground = {{
					textureMode: 'stretch',
					texture    : { src: WHEEL_TEXTURE },
					color      : Color4.create(value, value, value, 1),
				}}
			>
				{cells.map((cell) => (
					<UiEntity
						key         = {`${id}_cell_${cell.col}_${cell.row}`}
						uiTransform = {{
							positionType : 'absolute',
							position     : { left: cell.col * cellPx, top: cell.row * cellPx },
							width        : cellPx,
							height       : cellPx,
							pointerFilter: 'block',
						}}
						onMouseDown = {() => {
							const { h, s } = wheelUvToHueSat(cell.u, cell.v)
							commitHsv(id, h, s, getColorPickerProps(id).get('value'))
							beginDrag(id, 'wheel', cell.u, cell.v, wheelPx)
						}}
					/>
				))}
				<UiEntity
					key         = {`${id}_marker`}
					uiTransform = {{
						positionType : 'absolute',
						position     : {
							left: markerUv.u * wheelPx - markerSize / 2,
							top : markerUv.v * wheelPx - markerSize / 2,
						},
						width        : markerSize,
						height       : markerSize,
						borderRadius : markerSize / 2,
						borderWidth  : 2,
						borderColor  : ringColor,
						pointerFilter: 'none',
					}}
					uiBackground = {{ color }}
				/>
			</UiEntity>

			{/* Brightness slider — pill track. Textures don't clip to borderRadius, so the
			    rounded ends are solid-colour caps (black at 0, full colour at 1) and the
			    grey ramp (tinted = black → colour) spans between the cap centres. */}
			{showValueSlider ? (
				<UiEntity
					key         = {`${id}_value`}
					uiTransform = {{
						width     : wheelPx,
						height    : sliderHeight,
						flexGrow  : 0,
						flexShrink: 0,
						margin    : { top: spacing },
					}}
				>
					<UiEntity
						key         = {`${id}_value_cap_left`}
						uiTransform = {{
							positionType : 'absolute',
							position     : { left: 0, top: 0 },
							width        : sliderHeight,
							height       : sliderHeight,
							borderRadius : sliderHeight / 2,
							pointerFilter: 'none',
						}}
						uiBackground = {{ color: Color4.Black() }}
					/>
					<UiEntity
						key         = {`${id}_value_cap_right`}
						uiTransform = {{
							positionType : 'absolute',
							position     : { left: wheelPx - sliderHeight, top: 0 },
							width        : sliderHeight,
							height       : sliderHeight,
							borderRadius : sliderHeight / 2,
							pointerFilter: 'none',
						}}
						uiBackground = {{ color: fullBright }}
					/>
					<UiEntity
						key         = {`${id}_value_ramp`}
						uiTransform = {{
							positionType : 'absolute',
							position     : { left: capR, top: 0 },
							width        : rampPx,
							height       : sliderHeight,
							pointerFilter: 'none',
						}}
						uiBackground = {{
							textureMode: 'stretch',
							texture    : { src: VALUE_TEXTURE },
							color      : fullBright,
						}}
					/>
					{Array.from({ length: n }, (_, i) => (
						<UiEntity
							key         = {`${id}_vcell_${i}`}
							uiTransform = {{
								positionType : 'absolute',
								position     : { left: i * cellPx, top: 0 },
								width        : cellPx,
								height       : '100%',
								pointerFilter: 'block',
							}}
							onMouseDown = {() => {
								// Map the cell centre onto the ramp span (cap centre → cap centre).
								const next    = clamp01(((i + 0.5) * cellPx - capR) / rampPx)
								const current = getColorPickerProps(id)
								commitHsv(id, current.get('hue'), current.get('saturation'), next)
								beginDrag(id, 'value', next, 0, rampPx)
							}}
						/>
					))}
					<UiEntity
						key         = {`${id}_value_knob`}
						uiTransform = {{
							positionType : 'absolute',
							position     : { left: capR + value * rampPx - knobSize / 2, top: (sliderHeight - knobSize) / 2 },
							width        : knobSize,
							height       : knobSize,
							borderRadius : knobSize / 2,
							borderWidth  : 3,
							borderColor  : theme.colors.light,
							pointerFilter: 'none',
						}}
						uiBackground = {{ color }}
					/>
				</UiEntity>
			) : null}

			{/* Preset swatches */}
			{presets && presets.length > 0 ? (
				<UiEntity
					key         = {`${id}_presets`}
					uiTransform = {{
						width         : wheelPx,
						flexDirection : 'row',
						flexWrap      : 'wrap',
						justifyContent: 'center',
						margin        : { top: spacing - 3 },
						flexGrow      : 0,
						flexShrink    : 0,
					}}
				>
					{presets.map((preset, i) => {
						const rgb      = resolveRgb(preset)
						const selected = rgbToHex(rgb) === hex
						const pick     = () => {
							const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
							commitHsv(id, hsv.h, hsv.s, hsv.v)
						}
						return (
							<UiEntity
								key         = {`${id}_preset_${i}`}
								uiTransform = {{
									width        : presetSize,
									height       : presetSize,
									margin       : 3,
									borderRadius : 4,
									borderWidth  : selected ? 2 : 1,
									borderColor  : selected ? theme.colors.light : theme.colors.dark,
									pointerFilter: 'block',
								}}
								uiBackground = {{ color: toColor4(rgb) }}
								onMouseDown  = {() => { if (isMobile()) pick() }}
								onMouseUp    = {() => { if (!isMobile()) pick() }}
							/>
						)
					})}
				</UiEntity>
			) : null}

			{/* Release catcher — exists only while this picker is being dragged. Last child so it stacks on top. */}
			{dragging ? (
				<UiEntity
					key         = {`${id}_drag_catcher`}
					uiTransform = {{
						positionType : 'absolute',
						position     : { top: -CATCHER_REACH, left: -CATCHER_REACH },
						width        : CATCHER_REACH * 2 + wheelPx,
						height       : CATCHER_REACH * 2 + wheelPx,
						pointerFilter: 'block',
					}}
					onMouseUp = {endDrag}
				/>
			) : null}
		</UiEntity>
	)
}
