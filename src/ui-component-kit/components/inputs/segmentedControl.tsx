import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { type EasingFn, easingFunctions, tweenValue } from '../../utils/tweens'

import { type KitEntityProps, resolveKitEntityProps } from '../base'
import { Text } from '../text'


const SEGMENTED_CONTROL_WIDTH_DEFAULT  = 360
const SEGMENTED_CONTROL_HEIGHT_DEFAULT = 48
const SEGMENTED_CONTROL_INSET_DEFAULT  = 3
const SEGMENTED_CONTROL_DURATION       = 0.3


// MARK: Types
export type SegmentedControlValue   = string | number
export type SegmentedControlVariant = 'filled' | 'outline'
/** `direct`: click an option to select it. `cycle`: any click moves to the next option (wrapping). */
export type SegmentedControlClickMode = 'cycle' | 'direct'

/** Passed to an option's `render` so custom content (icons, atlas labels) can tint itself. */
export type SegmentedControlOptionRenderState = {
	/** True for the selected option. */
	active: boolean
	/** 0–1: how much of the selector currently covers this option (smooth during the slide). */
	weight: number
	/** Resolved label color for this frame (inactive → active by `weight`). */
	color : Color4
}

export type SegmentedControlOptionProps = {
	/** Value reported to `onSelect` / `onDeselect` and matched by `value` / `defaultValue`. */
	value      : SegmentedControlValue
	/** Text shown in the option. Defaults to `String(value)`. Ignored when `render` is set. */
	label?     : string
	/** Custom content for the option cell (replaces the label). */
	render?    : (state: SegmentedControlOptionRenderState) => ReactEcs.JSX.Element
	/** Fires when this option becomes selected by a click. */
	onSelect?  : () => void
	/** Fires when this option stops being selected by a click. */
	onDeselect?: () => void
}

type SegmentedControlState = {
	/** Selected option index. */
	index   : number
	/** Selector position in option units (lerps toward `index`). */
	position: number
}

export type SegmentedControlProps = Omit<
	KitEntityProps,
	'uiTransform' | 'aspectRatio' | 'children' | 'onMouseDown' | 'onMouseUp'
> & {
	/** Unique id for the per-instance state controller. */
	id                  : string
	/** `<SegmentedControlOption>` elements (also available as `SegmentedControl.Option`). */
	children?           : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Alternative to children: plain option list. Children win when both are given. */
	options?            : SegmentedControlOptionProps[]
	/** Controlled selected value. Omit to let the component keep its own state. */
	value?              : SegmentedControlValue
	/** Initial value for uncontrolled use. Defaults to the first option. */
	defaultValue?       : SegmentedControlValue
	/** `filled` (solid track + solid selector) or `outline` (transparent, borders only). Defaults to `filled`. */
	variant?            : SegmentedControlVariant
	/** `direct` (default) or `cycle`. See `SegmentedControlClickMode`. */
	clickMode?          : SegmentedControlClickMode
	/** Display only — ignores clicks (drive it with `setSegmentedControlIndex`). */
	readOnly?           : boolean
	/** Gap between the outer border and the selector, in px. Defaults to `3`. */
	inset?              : number
	/** Selector fill. Filled: theme primary. Outline: transparent. */
	selectorColor?      : Color4
	/** Selector border. Filled: none. Outline: theme primary. */
	selectorBorderColor?: Color4
	selectorBorderWidth?: number
	/** Selector corner radius. Defaults to `borderRadius - inset`. */
	selectorRadius?     : number
	/** Label color of the selected option. Defaults to theme light. */
	activeColor?        : Color4
	/** Label color of the other options. Defaults to theme tertiary. */
	inactiveColor?      : Color4
	/** Label font size (theme base px). */
	fontSize?           : number
	/** Seconds for the selector slide. Defaults to `0.3`. */
	duration?           : number
	/** Slide easing. Defaults to `easeOutQuart`. */
	easing?             : EasingFn
	uiTransform?        : UiTransformProps
	/** Fires after a click with the newly selected option. */
	onSelect?           : (value: SegmentedControlValue, index: number) => void
	/** Fires after a click with the option that was selected before it. */
	onDeselect?         : (value: SegmentedControlValue, index: number) => void
}


// MARK: State
const segmentedControlProps   = new Map<string, PropsController<SegmentedControlState>>()
const slideGeneration    = new Map<string, number>()
const lastRenderedValues = new Map<string, SegmentedControlValue[]>()


// MARK: SegmentedControlOption
/**
 * Declares one option inside a `SegmentedControl`. Renders nothing by itself — the
 * parent reads its props and lays the options out.
 */
export function SegmentedControlOption(_props: SegmentedControlOptionProps): ReactEcs.JSX.Element | null {
	return null
}


// MARK: getSegmentedControlProps
/** Returns the per-id state controller, creating one if needed. */
export function getSegmentedControlProps(
	id          : string,
	initialIndex: number = 0
): PropsController<SegmentedControlState> {
	let props = segmentedControlProps.get(id)
	if (!props) {
		props = new PropsController<SegmentedControlState>({
			index   : initialIndex,
			position: initialIndex,
		})
		segmentedControlProps.set(id, props)
	}
	return props
}


// MARK: getSegmentedControlIndex
/** Selected index for `id`, or `-1` if the component has never rendered. */
export function getSegmentedControlIndex(id: string): number {
	return segmentedControlProps.get(id)?.get('index') ?? -1
}


// MARK: getSegmentedControlValue
/** Selected value for `id`, or `undefined` if the component has never rendered. */
export function getSegmentedControlValue(id: string): SegmentedControlValue | undefined {
	const index = getSegmentedControlIndex(id)
	return lastRenderedValues.get(id)?.[index]
}


// MARK: slideTo
/** Tweens the selector toward `to`. Newer calls cancel older ones via a generation counter. */
function slideTo(
	id      : string,
	props   : PropsController<SegmentedControlState>,
	to      : number,
	duration: number,
	easing  : EasingFn
) {
	const from       = props.get('position')
	const generation = (slideGeneration.get(id) ?? 0) + 1
	slideGeneration.set(id, generation)

	if (duration <= 0 || from === to) {
		props.set('position', to)
		return
	}

	tweenValue(
		from,
		to,
		duration,
		(next) => {
			if (slideGeneration.get(id) !== generation) return
			props.set('position', next)
		},
		undefined,
		easing
	)
}


// MARK: setSegmentedControlIndex
/**
 * Moves an uncontrolled `SegmentedControl` from game code (e.g. a HUD that advances
 * on its own). Does not fire `onSelect` / `onDeselect`.
 */
export function setSegmentedControlIndex(
	id      : string,
	index   : number,
	animate : boolean = true,
	duration: number  = SEGMENTED_CONTROL_DURATION,
	easing  : EasingFn = easingFunctions.easeOutQuart
) {
	const props = getSegmentedControlProps(id, index)
	const count = lastRenderedValues.get(id)?.length
	if (count !== undefined && (index < 0 || index >= count)) {
		console.error('setSegmentedControlIndex: index out of range', id, index)
		return
	}
	props.set('index', index)
	slideTo(id, props, index, animate ? duration : 0, easing)
}


// MARK: setSegmentedControlValue
/** Like `setSegmentedControlIndex`, by option value. Needs the component to have rendered once. */
export function setSegmentedControlValue(
	id     : string,
	value  : SegmentedControlValue,
	animate: boolean = true
) {
	const values = lastRenderedValues.get(id)
	const index  = values ? values.indexOf(value) : -1
	if (index < 0) {
		console.error('setSegmentedControlValue: unknown value (or component not rendered yet)', id, value)
		return
	}
	setSegmentedControlIndex(id, index, animate)
}


// MARK: collectOptions
/** Flattens children into option props, keeping only `SegmentedControlOption` elements. */
function collectOptions(
	children: SegmentedControlProps['children'],
	fallback: SegmentedControlOptionProps[] | undefined
): SegmentedControlOptionProps[] {
	if (children === undefined || children === null) return fallback ?? []

	const out: SegmentedControlOptionProps[] = []
	const walk = (node: unknown) => {
		if (Array.isArray(node)) {
			for (const child of node) walk(child)
			return
		}
		if (!node || typeof node !== 'object') return
		const element = node as ReactEcs.JSX.Element
		if (element.type === SegmentedControlOption) {
			out.push(element.props as SegmentedControlOptionProps)
		} else {
			console.error('SegmentedControl: children must be <SegmentedControlOption> elements', element.type)
		}
	}
	walk(children)
	return out
}


// MARK: clamp01
function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value))
}


// MARK: SegmentedControl
/**
 * Segmented single-choice input: options sit side by side and a selector box
 * slides over the chosen one. In `direct` mode (default) each option is its own
 * hit area; in `cycle` mode any click advances to the next option and wraps
 * back to the first.
 *
 * ```tsx
 * <SegmentedControl id="aim_step" onSelect={(value) => console.log(value)}>
 *   <SegmentedControlOption value="position"  label="Position"  />
 *   <SegmentedControlOption value="direction" label="Direction" />
 *   <SegmentedControlOption value="strength"  label="Strength"  />
 * </SegmentedControl>
 * ```
 *
 * `width` accepts any `PositionUnit` (the selector is placed in %). Clicks use
 * the kit button rule — `mouseDown` on mobile, `mouseUp` on desktop.
 */
export function SegmentedControl({
	id,
	children,
	options: optionsProp,
	value,
	defaultValue,
	variant      = 'filled',
	clickMode    = 'direct',
	readOnly     = false,
	inset        = SEGMENTED_CONTROL_INSET_DEFAULT,
	width        = SEGMENTED_CONTROL_WIDTH_DEFAULT,
	height       = SEGMENTED_CONTROL_HEIGHT_DEFAULT,
	backgroundColor,
	borderColor,
	borderWidth,
	borderRadius,
	selectorColor,
	selectorBorderColor,
	selectorBorderWidth,
	selectorRadius,
	activeColor,
	inactiveColor,
	fontSize,
	duration     = SEGMENTED_CONTROL_DURATION,
	easing       = easingFunctions.easeOutQuart,
	uiTransform,
	onSelect,
	onDeselect,
	...props
}: SegmentedControlProps) {
	const theme   = getTheme()
	const options = collectOptions(children, optionsProp)
	const count   = options.length

	if (count === 0) {
		console.error('SegmentedControl: no options', id)
		return null
	}

	const values = options.map((option) => option.value)
	lastRenderedValues.set(id, values)

	const defaultIndex = Math.max(0, defaultValue === undefined ? 0 : values.indexOf(defaultValue))
	const controller   = getSegmentedControlProps(id, defaultIndex)

	// Controlled: follow `value`. Uncontrolled: keep stored index in range if options shrink.
	if (value !== undefined) {
		const controlledIndex = values.indexOf(value)
		if (controlledIndex < 0) {
			console.error('SegmentedControl: value not found in options', id, value)
		} else if (controlledIndex !== controller.get('index')) {
			controller.set('index', controlledIndex)
			slideTo(id, controller, controlledIndex, duration, easing)
		}
	} else if (controller.get('index') >= count) {
		controller.set('index', 0)
		slideTo(id, controller, 0, 0, easing)
	}

	const index    = controller.get('index')
	const position = controller.get('position')
	const outlined = variant === 'outline'

	const outerRadius   = borderRadius ?? theme.border.radiusSmall
	const outerBorder   = borderWidth ?? theme.border.width
	const outerFill     = backgroundColor ?? (outlined ? Color4.Clear() : theme.colors.secondary)
	const outerStroke   = borderColor ?? (outlined ? theme.colors.tertiary : theme.colors.primary)
	const selFill       = selectorColor ?? (outlined ? Color4.Clear() : theme.colors.primary)
	const selStrokeW    = selectorBorderWidth ?? (outlined ? theme.border.width : 0)
	const selStroke     = selectorBorderColor ?? theme.colors.primary
	const selRadius     = selectorRadius ?? Math.max(0, outerRadius - inset)
	const onColor       = activeColor ?? theme.colors.light
	const offColor      = inactiveColor ?? theme.colors.tertiary
	const cellPercent   = 100 / count

	// MARK: select
	const select = (nextIndex: number) => {
		if (nextIndex === index) return
		const prev = options[index]
		const next = options[nextIndex]
		if (value === undefined) {
			controller.set('index', nextIndex)
			slideTo(id, controller, nextIndex, duration, easing)
		}
		if (prev) {
			prev.onDeselect?.()
			onDeselect?.(prev.value, index)
		}
		next.onSelect?.()
		onSelect?.(next.value, nextIndex)
	}

	// Kit button rule: mobile fires on down, desktop on up.
	const clickHandlers = (target: () => number) => ({
		onMouseDown: () => { if (isMobile()) select(target()) },
		onMouseUp  : () => { if (!isMobile()) select(target()) },
	})

	const interactive = !readOnly
	const rootHandlers = interactive && clickMode === 'cycle'
		? clickHandlers(() => (index + 1) % count)
		: {}

	return (
		<UiEntity
			{...resolveKitEntityProps({
				...props,
				...rootHandlers,
				width,
				height,
				backgroundColor: outerFill,
				borderColor    : outerStroke,
				borderWidth    : outerBorder,
				borderRadius   : outerRadius,
				uiTransform    : {
					display      : 'flex',
					flexDirection: 'row',
					flexGrow     : 0,
					flexShrink   : 0,
					padding      : inset,
					pointerFilter: interactive && clickMode === 'cycle' ? 'block' : 'none',
					...uiTransform,
				},
			})}
		>
			<UiEntity
				key         = {`${id}_track`}
				uiTransform = {{
					width        : '100%',
					height       : '100%',
					flexDirection: 'row',
					overflow     : 'visible',
					pointerFilter: 'none',
				}}
			>
				{/* Selector — absolute, drawn first so labels sit on top. */}
				<UiEntity
					key         = {`${id}_selector`}
					uiTransform = {{
						positionType : 'absolute',
						position     : { left: `${position * cellPercent}%`, top: 0 },
						width        : `${cellPercent}%`,
						height       : '100%',
						borderRadius : selRadius,
						borderWidth  : selStrokeW,
						borderColor  : selStroke,
						pointerFilter: 'none',
					}}
					uiBackground = {{ color: Color4.create(selFill.r, selFill.g, selFill.b, selFill.a) }}
				/>

				{options.map((option, i) => {
					const weight = clamp01(1 - Math.abs(i - position))
					const color  = Color4.lerp(offColor, onColor, weight)
					const state  = { active: i === index, weight, color }
					const direct = interactive && clickMode === 'direct'

					return (
						<UiEntity
							key         = {`${id}_option_${i}`}
							uiTransform = {{
								width         : `${cellPercent}%` as PositionUnit,
								height        : '100%',
								flexGrow      : 0,
								flexShrink    : 0,
								alignItems    : 'center',
								justifyContent: 'center',
								pointerFilter : direct ? 'block' : 'none',
							}}
							{...(direct ? clickHandlers(() => i) : {})}
						>
							{option.render
								? option.render(state)
								: (
									<Text
										value       = {option.label ?? String(option.value)}
										fontColor   = {color}
										fontSize    = {fontSize}
										textAlign   = "middle-center"
										textWrap    = "nowrap"
										width       = "100%"
										height      = "100%"
										uiTransform = {{ alignSelf: 'center', pointerFilter: 'none' }}
									/>
								)}
						</UiEntity>
					)
				})}
			</UiEntity>
		</UiEntity>
	)
}

SegmentedControl.Option = SegmentedControlOption
