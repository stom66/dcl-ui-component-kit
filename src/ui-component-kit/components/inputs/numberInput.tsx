import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Input, PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { scaleThemeFontSize } from '../../utils/typography'

import { ButtonText } from '../buttons/buttonText'


const NUMBER_WIDTH_DEFAULT  = 220
const NUMBER_HEIGHT_DEFAULT = 40


// MARK: Types
type NumberInputState = {
	value: number
	/** Text in the field — what the player is typing, or the formatted value. */
	text : string
}

export type NumberInputProps = {
	/** Unique id for the per-instance state controller. Read it with `getNumberInputValue(id)`. */
	id               : string
	/** Controlled value. Omit to let the input keep its own state. */
	value?           : number
	/** Initial value for uncontrolled use. Defaults to `min`, or `0`. */
	defaultValue?    : number
	/** Lower bound. Omit for none. */
	min?             : number
	/** Upper bound. Omit for none. */
	max?             : number
	/** Snap increment for typed values (and the default button step). `0` = no snapping. Defaults to `1`. */
	step?            : number
	/**
	 * Button increments, one − / + pair each, smallest nearest the field.
	 * `[1, 10]` gives −10 −1 [field] +1 +10. Defaults to `[step]` (labelled − / +).
	 */
	steps?           : number[]
	/** Decimal places shown. Defaults to the decimals in `step`. */
	decimals?        : number
	/** Let the player type into the field. Defaults to `true`. */
	editable?        : boolean
	width?           : PositionUnit
	/** Height in px. Buttons are square at this height (wider for multi-digit labels). Defaults to `40`. */
	height?          : number
	/** Field fill. Defaults to theme dark. */
	backgroundColor? : Color4
	/** Radius of the outermost corners (the field and inner buttons are square). Defaults to `theme.border.radiusSmall`. */
	borderRadius?    : number
	/** Button fill. Defaults to theme secondary. */
	buttonColor?     : Color4
	/** Field and button text color. Defaults to theme light. */
	fontColor?       : Color4
	/** Field font size (theme base px). */
	fontSize?        : number
	uiTransform?     : UiTransformProps
	/** Fires when the value changes (button press, or a typed value submitted with Enter). */
	onChange?        : (value: number) => void
}


// MARK: State
const numberProps = new Map<string, PropsController<NumberInputState>>()


// MARK: countDecimals
function countDecimals(n: number): number {
	return (String(n).split('.')[1] ?? '').length
}


// MARK: normalize
/** Clamps to `[min, max]` and snaps to `step` from `min` (or 0). */
function normalize(
	value: number,
	min  : number | undefined,
	max  : number | undefined,
	step : number
): number {
	let next = value
	if (step > 0) {
		const base = min ?? 0
		next = base + Math.round((next - base) / step) * step
		next = Number(next.toFixed(countDecimals(step)))
	}
	if (min !== undefined) next = Math.max(min, next)
	if (max !== undefined) next = Math.min(max, next)
	return next
}


// MARK: getNumberInputProps
/** Returns the per-id state controller, creating one if needed. */
export function getNumberInputProps(
	id          : string,
	initialValue: number = 0,
	initialText : string = String(initialValue)
): PropsController<NumberInputState> {
	let props = numberProps.get(id)
	if (!props) {
		props = new PropsController<NumberInputState>({ value: initialValue, text: initialText })
		numberProps.set(id, props)
	}
	return props
}


// MARK: getNumberInputValue
/** Current value for `id`, or `undefined` if the input has never rendered. */
export function getNumberInputValue(id: string): number | undefined {
	return numberProps.get(id)?.get('value')
}


// MARK: setNumberInputValue
/** Sets an uncontrolled input from game code. Not clamped; does not fire `onChange`. */
export function setNumberInputValue(id: string, value: number) {
	getNumberInputProps(id, value).update({ value, text: String(value) })
}


// MARK: NumberInput
/**
 * Numeric field wrapped by − / + buttons, joined edge to edge into one bar:
 * only the outermost corners are rounded. Buttons step by
 * `steps` (several pairs allowed, e.g. ±1 and ±10); the player can also type a
 * value and press Enter. Typed and stepped values are clamped to `min` / `max`
 * and snapped to `step`; a typed value that isn't a number is discarded.
 */
export function NumberInput({
	id,
	value,
	defaultValue,
	min,
	max,
	step         = 1,
	steps,
	decimals,
	editable     = true,
	width        = NUMBER_WIDTH_DEFAULT,
	height       = NUMBER_HEIGHT_DEFAULT,
	backgroundColor,
	borderRadius,
	buttonColor,
	fontColor,
	fontSize,
	uiTransform,
	onChange,
}: NumberInputProps) {
	const theme   = getTheme()
	const places  = decimals ?? countDecimals(step)
	const format  = (n: number) => n.toFixed(places)
	const initial = normalize(value ?? defaultValue ?? min ?? 0, min, max, step)
	const props   = getNumberInputProps(id, initial, format(initial))

	const controlled = value !== undefined
	if (controlled) {
		const next = normalize(value, min, max, step)
		if (next !== props.get('value')) props.update({ value: next, text: format(next) })
	}

	const current = props.get('value')
	const text    = props.get('text')

	// MARK: commit
	const commit = (raw: number) => {
		const next = normalize(raw, min, max, step)
		// Controlled: keep showing the current value until the parent passes the new one.
		const shown = controlled ? current : next
		props.update({ value: shown, text: format(shown) })
		if (next !== current) onChange?.(next)
	}

	const submitText = (typed: string) => {
		const parsed = parseFloat(typed.trim())
		if (Number.isFinite(parsed)) commit(parsed)
		else props.set('text', format(current))
	}

	const increments = (steps && steps.length > 0 ? steps : [step])
		.filter((s) => s > 0)
		.sort((a, b) => a - b)
	const single    = increments.length === 1
	const radius    = borderRadius ?? theme.border.radiusSmall
	const textColor = fontColor ?? theme.colors.light
	const fill      = backgroundColor ?? theme.colors.dark
	const largest   = increments[increments.length - 1]

	const button = (delta: number) => {
		const label = single ? (delta < 0 ? '−' : '+') : `${delta < 0 ? '−' : '+'}${Math.abs(delta)}`
		// Only the outermost button on each side rounds its outer corners.
		const outer = Math.abs(delta) === largest
		const left  = outer && delta < 0 ? radius : 0
		const right = outer && delta > 0 ? radius : 0
		return (
			<ButtonText
				key             = {`${id}_btn_${delta}`}
				id              = {`${id}_btn_${delta}`}
				textLabel       = {label}
				width           = {label.length > 2 ? Math.round(height * 1.4) : height}
				height          = {height}
				borderWidth     = {0}
				backgroundColor = {buttonColor ?? theme.colors.secondary}
				fontColor       = {textColor}
				uiTransform     = {{
					flexShrink  : 0,
					borderRadius: { topLeft: left, bottomLeft: left, topRight: right, bottomRight: right },
				}}
				callback        = {() => commit(current + delta)}
			/>
		)
	}

	const field = {
		flexGrow    : 1,
		flexShrink  : 1,
		width       : 0,
		height      : height,
		borderRadius: 0,
	} as const

	return (
		<UiEntity
			key         = {`${id}_root`}
			uiTransform = {{
				width,
				height,
				flexGrow     : 0,
				flexShrink   : 0,
				flexDirection: 'row',
				alignItems   : 'center',
				...uiTransform,
			}}
		>
			{[...increments].reverse().map((s) => button(-s))}
			{editable ? (
				// Square wrapper carries the fill: the Explorer draws its native input
				// box with rounded corners, so the Input itself stays transparent.
				<UiEntity
					key          = {`${id}_field`}
					uiTransform  = {field}
					uiBackground = {{ color: Color4.create(fill.r, fill.g, fill.b, fill.a) }}
				>
					<Input
						key          = {`${id}_input`}
						value        = {text}
						placeholder  = ""
						fontSize     = {scaleThemeFontSize(fontSize ?? theme.typography.size.default)}
						color        = {textColor}
						textAlign    = "middle-center"
						uiTransform  = {{
							width       : '100%',
							height      : '100%',
							borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
						}}
						uiBackground = {{ color: Color4.Clear() }}
						onChange     = {(typed) => props.set('text', typed)}
						onSubmit     = {submitText}
					/>
				</UiEntity>
			) : (
				<UiEntity
					key         = {`${id}_field`}
					uiTransform  = {field}
					uiBackground = {{ color: Color4.create(fill.r, fill.g, fill.b, fill.a) }}
					uiText      = {{ value: format(current), color: textColor, fontSize: scaleThemeFontSize(fontSize ?? theme.typography.size.default), textAlign: 'middle-center' }}
				/>
			)}
			{increments.map((s) => button(s))}
		</UiEntity>
	)
}
