import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { getTheme } from '../../styles'
import { alpha } from '../../utils/colors'

import { FontAwesome } from '../icons/fontAwesome'
import { Text } from '../text'


const CHECKBOX_SIZE_DEFAULT = 32


// MARK: Types
/** Font Awesome icon name, custom content, or `null` for an empty box. */
export type CheckboxIcon = string | ReactEcs.JSX.Element | null

type CheckboxState = { value: boolean }

export type CheckboxProps = {
	/** Unique id for the per-instance state controller. Read it with `getCheckboxValue(id)`. */
	id                     : string
	/** Controlled value. Omit to let the checkbox keep its own state. */
	value?                 : boolean
	/** Initial value for uncontrolled use. Defaults to `false`. */
	defaultValue?          : boolean
	/** Box size in px. Defaults to `32`. */
	size?                  : number
	/** Optional text to the right of the box. Clicking it toggles too. */
	label?                 : string
	/** Icon when checked. Defaults to `'check'` (Font Awesome). */
	checkedIcon?           : CheckboxIcon
	/** Icon when unchecked. Defaults to `'xmark'` (Font Awesome), drawn faint. `null` for an empty box. */
	uncheckedIcon?         : CheckboxIcon
	/** Icon size in px. Defaults to `60%` of `size`. */
	iconSize?              : number
	/** Icon color when checked. Defaults to theme light. */
	checkedIconColor?      : Color4
	/** Icon color when unchecked. Defaults to theme light at 25% alpha. */
	uncheckedIconColor?    : Color4
	/** Box fill when checked. Defaults to theme success. */
	checkedBackgroundColor?: Color4
	/** Box fill when unchecked. Defaults to theme dark. */
	backgroundColor?       : Color4
	/** Box border when checked. Defaults to `checkedBackgroundColor`. */
	checkedBorderColor?    : Color4
	/** Box border when unchecked. Defaults to theme tertiary. */
	borderColor?           : Color4
	borderWidth?           : number
	/** Defaults to `theme.border.radiusSmall / 2`. */
	borderRadius?          : number
	/** Label font size (theme base px). */
	fontSize?              : number
	/** Display only — ignores clicks. */
	readOnly?              : boolean
	uiTransform?           : UiTransformProps
	/** Fires after a click with the new value. */
	onChange?              : (value: boolean) => void
}


// MARK: State
const checkboxProps = new Map<string, PropsController<CheckboxState>>()


// MARK: getCheckboxProps
/** Returns the per-id state controller, creating one if needed. */
export function getCheckboxProps(
	id          : string,
	initialValue: boolean = false
): PropsController<CheckboxState> {
	let props = checkboxProps.get(id)
	if (!props) {
		props = new PropsController<CheckboxState>({ value: initialValue })
		checkboxProps.set(id, props)
	}
	return props
}


// MARK: getCheckboxValue
/** Current value for `id`, or `undefined` if the checkbox has never rendered. */
export function getCheckboxValue(id: string): boolean | undefined {
	return checkboxProps.get(id)?.get('value')
}


// MARK: setCheckboxValue
/** Sets an uncontrolled checkbox from game code. Does not fire `onChange`. */
export function setCheckboxValue(id: string, value: boolean) {
	getCheckboxProps(id, value).set('value', value)
}


// MARK: renderIcon
function renderIcon(
	icon : CheckboxIcon,
	size : number,
	color: Color4
): ReactEcs.JSX.Element | null {
	if (icon === null) return null
	if (typeof icon === 'string') return <FontAwesome icon={icon} fontSize={size} fontColor={color} />
	return icon
}


// MARK: Checkbox
/**
 * Square on/off box: a solid check when on, a faint cross when off (both
 * configurable). Clicks follow the kit button rule — `mouseDown` on mobile,
 * `mouseUp` on desktop. With `label`, the text is part of the hit area.
 *
 * Icons are Font Awesome names by default (needs the kit TTFs from
 * `copy-assets`); pass any element for custom content, or `null` for none.
 */
export function Checkbox({
	id,
	value,
	defaultValue         = false,
	size                 = CHECKBOX_SIZE_DEFAULT,
	label,
	checkedIcon          = 'check',
	uncheckedIcon        = 'xmark',
	iconSize,
	checkedIconColor,
	uncheckedIconColor,
	checkedBackgroundColor,
	backgroundColor,
	checkedBorderColor,
	borderColor,
	borderWidth,
	borderRadius,
	fontSize,
	readOnly             = false,
	uiTransform,
	onChange,
}: CheckboxProps) {
	const theme      = getTheme()
	const controller = getCheckboxProps(id, value ?? defaultValue)
	const controlled = value !== undefined
	if (controlled && controller.get('value') !== value) controller.set('value', value)
	const checked = controller.get('value')

	const onFill   = checkedBackgroundColor ?? theme.colors.success
	const fill     = checked ? onFill : (backgroundColor ?? theme.colors.dark)
	const stroke   = checked ? (checkedBorderColor ?? onFill) : (borderColor ?? theme.colors.tertiary)
	const glyph    = iconSize ?? Math.round(size * 0.6)
	const icon     = checked
		? renderIcon(checkedIcon, glyph, checkedIconColor ?? theme.colors.light)
		: renderIcon(uncheckedIcon, glyph, uncheckedIconColor ?? alpha(theme.colors.light, 0.25))

	const toggle = () => {
		const next = !checked
		if (!controlled) controller.set('value', next)
		onChange?.(next)
	}
	const handlers = readOnly ? {} : {
		onMouseDown: () => { if (isMobile()) toggle() },
		onMouseUp  : () => { if (!isMobile()) toggle() },
	}

	return (
		<UiEntity
			key         = {`${id}_root`}
			uiTransform = {{
				flexDirection: 'row',
				alignItems   : 'center',
				flexGrow     : 0,
				flexShrink   : 0,
				height       : size,
				pointerFilter: readOnly ? 'none' : 'block',
				...uiTransform,
			}}
			{...handlers}
		>
			<UiEntity
				key         = {`${id}_box`}
				uiTransform = {{
					width         : size,
					height        : size,
					flexShrink    : 0,
					alignItems    : 'center',
					justifyContent: 'center',
					borderRadius  : borderRadius ?? theme.border.radiusSmall / 2,
					borderWidth   : borderWidth ?? theme.border.width,
					borderColor   : stroke,
					pointerFilter : 'none',
				}}
				uiBackground = {{ color: Color4.create(fill.r, fill.g, fill.b, fill.a) }}
			>
				{icon}
			</UiEntity>
			{label !== undefined ? (
				<Text
					value       = {label}
					fontSize    = {fontSize}
					width       = "auto"
					textWrap    = "nowrap"
					margin      = {{ left: 10 }}
					uiTransform = {{ alignSelf: 'center', pointerFilter: 'none' }}
				/>
			) : null}
		</UiEntity>
	)
}
