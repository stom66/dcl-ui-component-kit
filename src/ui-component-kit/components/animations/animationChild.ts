import ReactEcs, { type PositionUnit } from '@dcl/sdk/react-ecs'

import type { SizeValue } from '../../utils/positionUnit'


// MARK: readSizeValue
/** Reads a PositionUnit / `auto` size; rejects unrecognized values. */
function readSizeValue(value: unknown): SizeValue | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && value !== '') {
		if (value === 'auto') return 'auto'
		const match = value.match(/^(-?[\d.]+)(%|px|vw|vh)?$/i)
		if (match && Number.isFinite(parseFloat(match[1]))) {
			return value as PositionUnit
		}
	}
	return undefined
}


// MARK: resolveAnimContentSize
/**
 * Resolves intrinsic width/height for an animation target.
 * Prefers the element's own `width` / `height` (or `uiTransform`), otherwise
 * walks into `children` so wrappers like `FlashColor` → `Icon` still size
 * correctly when nested under `Pulse` / `Bounce` / etc.
 */
export function resolveAnimContentSize(
	element : ReactEcs.JSX.Element | undefined,
	fallback: number,
): { width: SizeValue; height: SizeValue } {
	let current: ReactEcs.JSX.Element | undefined = element

	while (current) {
		const w = readSizeValue(current.props?.width  ?? current.props?.uiTransform?.width)
		const h = readSizeValue(current.props?.height ?? current.props?.uiTransform?.height)
		if (w !== undefined && h !== undefined) {
			return { width: w, height: h }
		}

		const nested = current.props?.children as ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined
		current = Array.isArray(nested) ? nested[0] : nested
	}

	return { width: fallback, height: fallback }
}


// MARK: resolveAnimBoxSize
/**
 * Size for an animation wrapper box / forwarded child.
 * Parent overrides (`width` / `height` from an outer `Pulse`, etc.) win so
 * scaled sizes propagate through intermediate wrappers to the leaf icon.
 */
export function resolveAnimBoxSize(
	widthProp : PositionUnit | 'auto' | undefined,
	heightProp: PositionUnit | 'auto' | undefined,
	child     : ReactEcs.JSX.Element | undefined,
	fallback  : number,
): { width: SizeValue; height: SizeValue } {
	const content = resolveAnimContentSize(child, fallback)
	const w       = readSizeValue(widthProp)
	const h       = readSizeValue(heightProp)
	return {
		width : w ?? content.width,
		height: h ?? content.height,
	}
}


// MARK: cloneAnimChild
/** Clones a single animation child with prop overrides (preserves `key`). */
export function cloneAnimChild(
	child    : ReactEcs.JSX.Element,
	overrides: Record<string, unknown>,
): ReactEcs.JSX.Element {
	return ReactEcs.createElement(child.type, {
		...child.props,
		...overrides,
		key: child.key,
	})
}


// MARK: cloneAnimChildDeep
/**
 * Clones `child` with size overrides. When `uvs` is set and the direct child
 * has no `uvs` of its own, recurse into its `children` so UV animations
 * (`Wiggle` / `Spinner`) still hit the leaf `Icon` through wrappers.
 */
export function cloneAnimChildDeep(
	child    : ReactEcs.JSX.Element,
	overrides: {
		width? : SizeValue
		height?: SizeValue
		uvs?   : number[]
		[key: string]: unknown
	},
): ReactEcs.JSX.Element {
	const { uvs, width, height, ...rest } = overrides
	const nested = child.props?.children as ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined
	const nestedChild = Array.isArray(nested) ? nested[0] : nested

	if (uvs !== undefined && child.props?.uvs === undefined && nestedChild) {
		return cloneAnimChild(child, {
			...rest,
			...(width  !== undefined ? { width  } : {}),
			...(height !== undefined ? { height } : {}),
			children: cloneAnimChildDeep(nestedChild, overrides),
		})
	}

	return cloneAnimChild(child, overrides)
}
