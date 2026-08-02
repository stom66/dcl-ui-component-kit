import ReactEcs from '@dcl/sdk/react-ecs'

import { getColSpan } from '../../utils'


type ColProps = {
	cols?       : number
	colsDesktop?: number
	colsMobile? : number
	uiTransform?: {
		margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
		[key: string]: unknown
	}
}

type ChildList = ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined


// MARK: flattenChildren
/**
 * Flattens nested child arrays (e.g. `{items.map(...)}` next to sibling JSX)
 * so spacing / gutters apply between the real elements, not the array wrapper.
 */
function flattenChildren(children: ChildList): ReactEcs.JSX.Element[] {
	if (children == null) return []

	const list   = Array.isArray(children) ? children : [children]
	const result: ReactEcs.JSX.Element[] = []

	for (const child of list) {
		if (child == null) continue
		if (Array.isArray(child)) {
			result.push(...flattenChildren(child))
			continue
		}
		result.push(child)
	}

	return result
}


// MARK: applySpacingToChildren
/**
 * Sets margin[edge] = spacing on every child except the last.
 * Preserves each child's `key` when recloning via `createElement`.
 * Nested arrays from `.map()` are flattened first.
 */
export function applySpacingToChildren(
	children: ChildList,
	spacing : number | undefined,
	edge    : 'top' | 'right' | 'bottom' | 'left',
) {
	if (!spacing || children == null) return children

	const list = flattenChildren(children)

	return list.map((child, i) => {
		// Leave the last child as the original element — recreating it is unnecessary
		// and has been flaky with ReactEcs for large subtrees.
		if (!child || i === list.length - 1) return child

		const uiTransform = child.props?.uiTransform ?? {}
		const margin      = typeof uiTransform.margin === 'object' ? uiTransform.margin : {}
		return ReactEcs.createElement(child.type, {
			...child.props,
			key        : child.key,
			uiTransform: {
				...uiTransform,
				margin: { ...margin, [edge]: spacing },
			},
		})
	})
}


// MARK: applyRowChildSpacing
/**
 * Row gutters + `cols` widths. Yoga has no `calc()`, so percentage `cols`
 * plus sibling margins overflow the parent. When `spacing > 0`, children with
 * `cols` use `flexGrow: span` (and `width: 0`) so free space after gutters is
 * shared in column proportions. Children without `cols` keep their own width.
 * Nested arrays from `.map()` are flattened first.
 */
export function applyRowChildSpacing(
	children: ChildList,
	spacing : number | undefined,
	edge    : 'left' | 'right',
) {
	if (children == null) return children

	const list = flattenChildren(children)
	const gap  = spacing ?? 0

	if (!gap) {
		return list
	}

	return list.map((child, i) => {
		if (!child) return child

		const props       = (child.props ?? {}) as ColProps
		const span        = getColSpan(props.cols, props.colsDesktop, props.colsMobile)
		const uiTransform = props.uiTransform ?? {}
		const margin      = typeof uiTransform.margin === 'object' ? uiTransform.margin : {}
		const isLast      = i === list.length - 1

		if (span === undefined && isLast) return child

		return ReactEcs.createElement(child.type, {
			...child.props,
			key        : child.key,
			uiTransform: {
				...uiTransform,
				...(span !== undefined
					? {
						width     : 0,
						flexGrow  : span,
						flexShrink: 0,
						flexBasis : 0,
					}
					: {}),
				...(!isLast
					? { margin: { ...margin, [edge]: gap } }
					: {}),
			},
		})
	})
}
