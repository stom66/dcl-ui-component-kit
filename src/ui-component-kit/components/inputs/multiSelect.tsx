import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { type EasingFn, easingFunctions, tweenValue } from '../../utils/tweens'

import { type KitEntityProps, resolveKitEntityProps } from '../base'
import { Text } from '../text'


const MULTI_SELECT_WIDTH_DEFAULT  = 360
const MULTI_SELECT_HEIGHT_DEFAULT = 48
const MULTI_SELECT_INSET_DEFAULT  = 3
const MULTI_SELECT_DURATION       = 0.3


// MARK: Types
export type MultiSelectValue   = string | number
export type MultiSelectVariant = 'filled' | 'outline'
/** `cycle`: any click moves to the next option (wrapping). `direct`: click an option to select it. */
export type MultiSelectClickMode = 'cycle' | 'direct'

/** Passed to an option's `render` so custom content (icons, atlas labels) can tint itself. */
export type MultiSelectOptionRenderState = {
	/** True for the selected option. */
	active: boolean
	/** 0–1: how much of the selector currently covers this option (smooth during the slide). */
	weight: number
	/** Resolved label color for this frame (inactive → active by `weight`). */
	color : Color4
}

export type MultiSelectOptionProps = {
	/** Value reported to `onSelect` / `onDeselect` and matched by `value` / `defaultValue`. */
	value      : MultiSelectValue
	/** Text shown in the option. Defaults to `String(value)`. Ignored when `render` is set. */
	label?     : string
	/** Custom content for the option cell (replaces the label). */
	render?    : (state: MultiSelectOptionRenderState) => ReactEcs.JSX.Element
	/** Fires when this option becomes selected by a click. */
	onSelect?  : () => void
	/** Fires when this option stops being selected by a click. */
	onDeselect?: () => void
}

type MultiSelectState = {
	/** Selected option index. */
	index   : number
	/** Selector position in option units (lerps toward `index`). */
	position: number
}

export type MultiSelectProps = Omit<
	KitEntityProps,
	'uiTransform' | 'aspectRatio' | 'children' | 'onMouseDown' | 'onMouseUp'
> & {
	/** Unique id for the per-instance state controller. */
	id                  : string
	/** `<MultiSelectOption>` elements (also available as `MultiSelect.Option`). */
	children?           : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Alternative to children: plain option list. Children win when both are given. */
	options?            : MultiSelectOptionProps[]
	/** Controlled selected value. Omit to let the component keep its own state. */
	value?              : MultiSelectValue
	/** Initial value for uncontrolled use. Defaults to the first option. */
	defaultValue?       : MultiSelectValue
	/** `filled` (solid track + solid selector) or `outline` (transparent, borders only). Defaults to `filled`. */
	variant?            : MultiSelectVariant
	/** `cycle` (default) or `direct`. See `MultiSelectClickMode`. */
	clickMode?          : MultiSelectClickMode
	/** Display only — ignores clicks (drive it with `setMultiSelectIndex`). */
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
	onSelect?           : (value: MultiSelectValue, index: number) => void
	/** Fires after a click with the option that was selected before it. */
	onDeselect?         : (value: MultiSelectValue, index: number) => void
}


// MARK: State
const multiSelectProps   = new Map<string, PropsController<MultiSelectState>>()
const slideGeneration    = new Map<string, number>()
const lastRenderedValues = new Map<string, MultiSelectValue[]>()


// MARK: MultiSelectOption
/**
 * Declares one option inside a `MultiSelect`. Renders nothing by itself — the
 * parent reads its props and lays the options out.
 */
export function MultiSelectOption(_props: MultiSelectOptionProps): ReactEcs.JSX.Element | null {
	return null
}


// MARK: getMultiSelectProps
/** Returns the per-id state controller, creating one if needed. */
export function getMultiSelectProps(
	id          : string,
	initialIndex: number = 0
): PropsController<MultiSelectState> {
	let props = multiSelectProps.get(id)
	if (!props) {
		props = new PropsController<MultiSelectState>({
			index   : initialIndex,
			position: initialIndex,
		})
		multiSelectProps.set(id, props)
	}
	return props
}


// MARK: getMultiSelectIndex
/** Selected index for `id`, or `-1` if the component has never rendered. */
export function getMultiSelectIndex(id: string): number {
	return multiSelectProps.get(id)?.get('index') ?? -1
}


// MARK: getMultiSelectValue
/** Selected value for `id`, or `undefined` if the component has never rendered. */
export function getMultiSelectValue(id: string): MultiSelectValue | undefined {
	const index = getMultiSelectIndex(id)
	return lastRenderedValues.get(id)?.[index]
}


// MARK: slideTo
/** Tweens the selector toward `to`. Newer calls cancel older ones via a generation counter. */
function slideTo(
	id      : string,
	props   : PropsController<MultiSelectState>,
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


// MARK: setMultiSelectIndex
/**
 * Moves an uncontrolled `MultiSelect` from game code (e.g. a HUD that advances
 * on its own). Does not fire `onSelect` / `onDeselect`.
 */
export function setMultiSelectIndex(
	id      : string,
	index   : number,
	animate : boolean = true,
	duration: number  = MULTI_SELECT_DURATION,
	easing  : EasingFn = easingFunctions.easeOutQuart
) {
	const props = getMultiSelectProps(id, index)
	const count = lastRenderedValues.get(id)?.length
	if (count !== undefined && (index < 0 || index >= count)) {
		console.error('setMultiSelectIndex: index out of range', id, index)
		return
	}
	props.set('index', index)
	slideTo(id, props, index, animate ? duration : 0, easing)
}


// MARK: setMultiSelectValue
/** Like `setMultiSelectIndex`, by option value. Needs the component to have rendered once. */
export function setMultiSelectValue(
	id     : string,
	value  : MultiSelectValue,
	animate: boolean = true
) {
	const values = lastRenderedValues.get(id)
	const index  = values ? values.indexOf(value) : -1
	if (index < 0) {
		console.error('setMultiSelectValue: unknown value (or component not rendered yet)', id, value)
		return
	}
	setMultiSelectIndex(id, index, animate)
}


// MARK: collectOptions
/** Flattens children into option props, keeping only `MultiSelectOption` elements. */
function collectOptions(
	children: MultiSelectProps['children'],
	fallback: MultiSelectOptionProps[] | undefined
): MultiSelectOptionProps[] {
	if (children === undefined || children === null) return fallback ?? []

	const out: MultiSelectOptionProps[] = []
	const walk = (node: unknown) => {
		if (Array.isArray(node)) {
			for (const child of node) walk(child)
			return
		}
		if (!node || typeof node !== 'object') return
		const element = node as ReactEcs.JSX.Element
		if (element.type === MultiSelectOption) {
			out.push(element.props as MultiSelectOptionProps)
		} else {
			console.error('MultiSelect: children must be <MultiSelectOption> elements', element.type)
		}
	}
	walk(children)
	return out
}


// MARK: clamp01
function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value))
}


// MARK: MultiSelect
/**
 * Segmented single-choice input: options sit side by side and a selector box
 * slides over the chosen one. In `cycle` mode (default) any click advances to
 * the next option and wraps back to the first; in `direct` mode each option is
 * its own hit area.
 *
 * ```tsx
 * <MultiSelect id="aim_step" onSelect={(value) => console.log(value)}>
 *   <MultiSelectOption value="position"  label="Position"  />
 *   <MultiSelectOption value="direction" label="Direction" />
 *   <MultiSelectOption value="strength"  label="Strength"  />
 * </MultiSelect>
 * ```
 *
 * `width` accepts any `PositionUnit` (the selector is placed in %). Clicks use
 * the kit button rule — `mouseDown` on mobile, `mouseUp` on desktop.
 */
export function MultiSelect({
	id,
	children,
	options: optionsProp,
	value,
	defaultValue,
	variant      = 'filled',
	clickMode    = 'cycle',
	readOnly     = false,
	inset        = MULTI_SELECT_INSET_DEFAULT,
	width        = MULTI_SELECT_WIDTH_DEFAULT,
	height       = MULTI_SELECT_HEIGHT_DEFAULT,
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
	duration     = MULTI_SELECT_DURATION,
	easing       = easingFunctions.easeOutQuart,
	uiTransform,
	onSelect,
	onDeselect,
	...props
}: MultiSelectProps) {
	const theme   = getTheme()
	const options = collectOptions(children, optionsProp)
	const count   = options.length

	if (count === 0) {
		console.error('MultiSelect: no options', id)
		return null
	}

	const values = options.map((option) => option.value)
	lastRenderedValues.set(id, values)

	const defaultIndex = Math.max(0, defaultValue === undefined ? 0 : values.indexOf(defaultValue))
	const controller   = getMultiSelectProps(id, defaultIndex)

	// Controlled: follow `value`. Uncontrolled: keep stored index in range if options shrink.
	if (value !== undefined) {
		const controlledIndex = values.indexOf(value)
		if (controlledIndex < 0) {
			console.error('MultiSelect: value not found in options', id, value)
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

MultiSelect.Option = MultiSelectOption
