import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { sizeValueToPixels } from '../../utils/aspect'
import { easingFunctions, tweenValue } from '../../utils/tweens'

import { UiBox, type UiBoxProps } from '../base'
import { Row } from '../helpers'


const TOGGLE_PADDING        = 2
const TOGGLE_ASPECT_RATIO   = 2.2
const TOGGLE_HEIGHT_DEFAULT = 32
const TOGGLE_LERP_DURATION  = 0.2

const hoverStates         = new Map<string, boolean>()
const slideTweenGeneration = new Map<string, number>()
const colorTweenGeneration = new Map<string, number>()

type TogglePropsState = {
	value                 : boolean
	slide                 : number
	backgroundColor       : Color4
	toggleColor           : Color4
	targetBackgroundColor : Color4
	targetToggleColor     : Color4
}

const toggleProps = new Map<string, PropsController<TogglePropsState>>()

export type ToggleProps = Omit<
	UiBoxProps,
	'uiTransform' | 'backgroundColor' | 'aspectRatio' | 'width' | 'height'
> & {
	/** Unique id for the per-instance PropsController / slide tween. */
	id             : string
	/**
	 * Controlled on/off value. When omitted, the toggle keeps its own state
	 * (seeded by `defaultValue`).
	 */
	value?         : boolean
	/** Initial value for uncontrolled usage. Defaults to `false`. */
	defaultValue?  : boolean
	/** Track fill color. Defaults to theme dark. Lerps when the prop changes. */
	backgroundColor?: Color4
	/** Thumb (knob) fill color. Defaults to theme light. Lerps when the prop changes. */
	toggleColor?   : Color4
	/**
	 * Track height (`PositionUnit`: px / vw / vh). Width is always
	 * `height × 2.2` after converting to virtual pixels. `%` needs a parent
	 * measurement and falls back to `32`. Defaults to `32`.
	 */
	height?        : PositionUnit
	/** Seconds to slide the thumb and lerp colors. Defaults to `0.2`. */
	lerpDuration?  : number
	uiTransform?   : UiTransformProps
	/** Fires with the next value after a successful click. */
	onChange?      : (value: boolean) => void
	children?      : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: copyColor
/** Copies a color so theme tokens are never shared by reference with ECS / tweens. */
function copyColor(color: Color4): Color4 {
	return Color4.create(color.r, color.g, color.b, color.a)
}


// MARK: colorsEqual
/** Component-wise equality for `Color4`. */
function colorsEqual(
	a: Color4,
	b: Color4
): boolean {
	return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}


// MARK: getToggleProps
/** Returns the per-toggle props controller, creating one if needed. */
export function getToggleProps(
	id               : string,
	initialValue     : boolean,
	initialBackground: Color4,
	initialToggle    : Color4
): PropsController<TogglePropsState> {
	let props = toggleProps.get(id)
	if (!props) {
		const background = copyColor(initialBackground)
		const toggle     = copyColor(initialToggle)
		props = new PropsController<TogglePropsState>({
			value                : initialValue,
			slide                : initialValue ? 1 : 0,
			backgroundColor      : background,
			toggleColor          : toggle,
			targetBackgroundColor: copyColor(initialBackground),
			targetToggleColor    : copyColor(initialToggle),
		})
		toggleProps.set(id, props)
	}
	return props
}


// MARK: tweenSlide
/** Lerps `slide` toward `to` (0 or 1). Invalidates in-flight tweens via generation. */
function tweenSlide(
	id      : string,
	props   : PropsController<TogglePropsState>,
	to      : number,
	duration: number
) {
	const from       = props.get('slide')
	const generation = (slideTweenGeneration.get(id) ?? 0) + 1
	slideTweenGeneration.set(id, generation)

	if (duration <= 0 || from === to) {
		props.set('slide', to)
		return
	}

	tweenValue(
		from,
		to,
		duration,
		(next) => {
			if (slideTweenGeneration.get(id) !== generation) return
			props.set('slide', next)
		},
		undefined,
		easingFunctions.easeOutQuart
	)
}


// MARK: tweenColor
/** Lerps a stored color toward `to` over `duration` (same easing as the thumb slide). */
function tweenColor(
	id      : string,
	channel : 'background' | 'toggle',
	props   : PropsController<TogglePropsState>,
	key     : 'backgroundColor' | 'toggleColor',
	to      : Color4,
	duration: number
) {
	const genKey     = `${id}:${channel}`
	const from       = props.get(key)
	const generation = (colorTweenGeneration.get(genKey) ?? 0) + 1
	colorTweenGeneration.set(genKey, generation)

	const target = copyColor(to)

	if (duration <= 0 || colorsEqual(from, target)) {
		props.set(key, target)
		return
	}

	tweenValue(
		0,
		1,
		duration,
		(t) => {
			if (colorTweenGeneration.get(genKey) !== generation) return
			props.set(key, Color4.lerp(from, target, t))
		},
		undefined,
		easingFunctions.easeOutQuart
	)
}


// MARK: syncToggleValue
/**
 * Keeps controller `value` / `slide` aligned with the resolved on/off state.
 * Returns the current (possibly mid-lerp) slide progress in `[0, 1]`.
 */
function syncToggleValue(
	id               : string,
	value            : boolean,
	duration         : number,
	initialBackground: Color4,
	initialToggle    : Color4
): number {
	const props = getToggleProps(id, value, initialBackground, initialToggle)
	if (props.get('value') !== value) {
		props.set('value', value)
		tweenSlide(id, props, value ? 1 : 0, duration)
	}
	return props.get('slide')
}


// MARK: syncToggleColors
/**
 * Lerps displayed track / thumb colors toward the resolved prop targets over
 * `duration` (same clock as the thumb slide). Returns the current display colors.
 */
function syncToggleColors(
	id               : string,
	backgroundColor  : Color4,
	toggleColor      : Color4,
	duration         : number,
	initialValue     : boolean
): { backgroundColor: Color4, toggleColor: Color4 } {
	const props = getToggleProps(id, initialValue, backgroundColor, toggleColor)

	if (!colorsEqual(props.get('targetBackgroundColor'), backgroundColor)) {
		props.set('targetBackgroundColor', copyColor(backgroundColor))
		tweenColor(id, 'background', props, 'backgroundColor', backgroundColor, duration)
	}

	if (!colorsEqual(props.get('targetToggleColor'), toggleColor)) {
		props.set('targetToggleColor', copyColor(toggleColor))
		tweenColor(id, 'toggle', props, 'toggleColor', toggleColor, duration)
	}

	return {
		backgroundColor: props.get('backgroundColor'),
		toggleColor    : props.get('toggleColor'),
	}
}


// MARK: Toggle
/**
 * Classic on/off switch: pill track (`height × 2`, 2px padding) with a circular
 * thumb that slides left ↔ right. Click is on the whole track (thumb/row use
 * `pointerFilter: 'none'` so they do not steal hits from the track).
 *
 * Pass `backgroundColor` / `toggleColor` for track / thumb fills — both lerp over
 * `lerpDuration` when they change (in sync with the thumb slide). Borders and other
 * chrome go through `uiTransform` / `uiBackground` (no dedicated borderColor prop).
 */
export function Toggle({
	id,
	value,
	defaultValue = false,
	backgroundColor,
	toggleColor,
	height       = TOGGLE_HEIGHT_DEFAULT,
	lerpDuration = TOGGLE_LERP_DURATION,
	uiTransform,
	uiBackground,
	onChange,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	onMouseUp,
	children,
	...props
}: ToggleProps) {
	const theme       = getTheme()
	const trackTarget = backgroundColor ?? theme.colors.dark
	const thumbTarget = toggleColor     ?? theme.colors.light
	const controlled  = value !== undefined
	const resolved    = controlled
		? value
		: getToggleProps(id, defaultValue, trackTarget, thumbTarget).get('value')
	const slide = syncToggleValue(id, resolved, lerpDuration, trackTarget, thumbTarget)
	const colors = syncToggleColors(id, trackTarget, thumbTarget, lerpDuration, resolved)

	const heightPx = sizeValueToPixels(height)
	let trackHeight = TOGGLE_HEIGHT_DEFAULT
	if (heightPx !== null) {
		trackHeight = heightPx
	} else if (height !== TOGGLE_HEIGHT_DEFAULT) {
		console.error('Toggle: height: unsupported or relative unit (need px/vw/vh)', height)
	}
	const trackWidth  = trackHeight * TOGGLE_ASPECT_RATIO
	const thumbSize   = Math.max(0, trackHeight - TOGGLE_PADDING * 2)
	const travel      = Math.max(0, trackWidth - TOGGLE_PADDING * 2 - thumbSize)
	const trackRadius = trackHeight / 2
	const thumbRadius = thumbSize / 2

	return (
		<UiBox
			{...props}
			backgroundColor = {colors.backgroundColor}
			uiBackground    = {uiBackground}
			uiTransform={{
				width         : trackWidth as PositionUnit,
				height        : trackHeight as PositionUnit,
				minHeight     : trackHeight,
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'center',
				justifyContent: 'flex-start',
				flexGrow      : 0,
				flexShrink    : 0,
				overflow      : 'hidden',
				padding       : TOGGLE_PADDING,
				borderRadius  : trackRadius,
				...uiTransform,
			}}
			onMouseEnter = {() => {
				hoverStates.set(id, true)
				onMouseEnter?.()
			}}
			onMouseLeave = {() => {
				hoverStates.set(id, false)
				onMouseLeave?.()
			}}
			onMouseDown = {() => {
				onMouseDown?.()
				if (isMobile()) {
					const next = !resolved
					if (!controlled) {
						const controller = getToggleProps(id, defaultValue, trackTarget, thumbTarget)
						controller.set('value', next)
						tweenSlide(id, controller, next ? 1 : 0, lerpDuration)
					}
					onChange?.(next)
				}
			}}
			onMouseUp = {() => {
				if (!isMobile() && hoverStates.get(id) === true) {
					const next = !resolved
					if (!controlled) {
						const controller = getToggleProps(id, defaultValue, trackTarget, thumbTarget)
						controller.set('value', next)
						tweenSlide(id, controller, next ? 1 : 0, lerpDuration)
					}
					onChange?.(next)
				}
				onMouseUp?.()
			}}
		>
			{/* Visuals only — pointerFilter none so the track receives all clicks (thumb would otherwise steal hits). */}
			<Row
				spacing = {0}
				uiTransform={{
					width         : '100%',
					height        : '100%',
					alignItems    : 'center',
					justifyContent: 'flex-start',
					pointerFilter : 'none',
				}}
			>
				<UiBox
					key             = {`${id}_thumb`}
					backgroundColor = {colors.toggleColor}
					uiTransform={{
						width         : thumbSize,
						height        : thumbSize,
						flexGrow      : 0,
						flexShrink    : 0,
						borderRadius  : thumbRadius,
						margin        : { left: slide * travel },
						pointerFilter : 'none',
					}}
				/>
			</Row>
			{children}
		</UiBox>
	)
}
