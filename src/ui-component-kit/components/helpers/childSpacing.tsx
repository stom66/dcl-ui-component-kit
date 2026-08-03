import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox } from '../base'


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


// MARK: insertSpacers
/**
 * Inserts stably keyed spacer `UiBox`es between children.
 *
 * Do **not** `createElement`-clone children to apply margin — ReactEcs leaks
 * UiEntities when those clones are recreated every frame (left-bar Column with
 * N buttons → ~N-1 new entities per frame, thousands of CRDT entries/minute).
 */
function insertSpacers(
	children: ChildList,
	spacing : number,
	edge    : 'top' | 'right' | 'bottom' | 'left',
): ReactEcs.JSX.Element[] {
	const list = flattenChildren(children)
	if (list.length <= 1) return list

	const vertical = edge === 'top' || edge === 'bottom'
	const out    : ReactEcs.JSX.Element[] = []

	for (let i = 0; i < list.length; i++) {
		out.push(list[i])
		if (i >= list.length - 1) continue

		out.push(
			<UiBox
				key={`__gap_${edge}_${i}`}
				uiTransform={{
					width     : vertical ? 1 : spacing,
					height    : vertical ? spacing : 1,
					flexGrow  : 0,
					flexShrink: 0,
				}}
			/>
		)
	}

	return out
}


// MARK: applySpacingToChildren
/**
 * Gap between stacked children via spacer entities (not child margin clones).
 * Nested arrays from `.map()` are flattened first.
 */
export function applySpacingToChildren(
	children: ChildList,
	spacing : number | undefined,
	edge    : 'top' | 'right' | 'bottom' | 'left',
) {
	if (!spacing || children == null) return children
	return insertSpacers(children, spacing, edge)
}


// MARK: applyRowChildSpacing
/**
 * Horizontal gutters via spacer entities. `cols` children size themselves with
 * `flexGrow` (`getColSelfTransform`) so gutters do not overflow and no
 * `createElement` prop rewrite is required.
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

	return insertSpacers(list, gap, edge)
}
