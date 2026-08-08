import ReactEcs from '@dcl/sdk/react-ecs'

import { getColSelfTransform } from '../../utils'

import { UiBox } from '../base'


type ChildList = ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined


// MARK: flattenChildren
/**
 * Flattens nested child arrays (e.g. `{items.map(...)}` next to sibling JSX)
 * so spacing / gutters apply between the real elements, not the array wrapper.
 */
export function flattenChildren(children: ChildList): ReactEcs.JSX.Element[] {
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


// MARK: childHasCols
/** True when the element opts into the 12-column grid via `cols` / platform overrides. */
function childHasCols(child: ReactEcs.JSX.Element): boolean {
	const props = child.props ?? {}
	return (
		props.cols !== undefined ||
		props.colsDesktop !== undefined ||
		props.colsMobile !== undefined
	)
}


// MARK: listHasCols
/** True when any flattened child uses `cols`. */
function listHasCols(list: ReactEcs.JSX.Element[]): boolean {
	return list.some(childHasCols)
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


// MARK: applyPaddedRowGutters
/**
 * Horizontal gutters via padded cell wrappers (not sibling spacers).
 *
 * Sticky `%` cols already sum toward 100%; spacer entities would add px on top
 * and overflow / wrap early. Each child is wrapped in a stably keyed box that
 * owns the `cols` width and applies half-`spacing` horizontal padding. Cols
 * children are re-created at `width: 100%` with `cols` cleared so chrome fills
 * the inner area.
 *
 * When `lineGap` is true (wrap rows), also applies `margin.bottom = gap` between
 * wrapped lines.
 */
function applyPaddedRowGutters(
	list   : ReactEcs.JSX.Element[],
	gap    : number,
	lineGap: boolean,
): ReactEcs.JSX.Element[] {
	const pad = gap / 2

	return list.map((child, i) => {
		const key     = (child.key as string | undefined) ?? `__rowgutter_${i}`
		const props   = child.props ?? {}
		const hasCols = childHasCols(child)
		const colSelf = hasCols
			? getColSelfTransform(props.cols, props.colsDesktop, props.colsMobile, 'none')
			: undefined

		// Fill the padded cell. Set both `width` (shorthand) and `uiTransform.width`
		// so ButtonText / Label / Column pick up 100% whether they read either path.
		// Direct kit primitives only — intermediate wrappers must forward these props.
		const inner = colSelf
			? ReactEcs.createElement(child.type, {
				...props,
				key         : `${key}__fill`,
				cols        : undefined,
				colsDesktop : undefined,
				colsMobile  : undefined,
				width       : '100%',
				uiTransform : {
					...props.uiTransform,
					width     : '100%',
					flexGrow  : 0,
					flexShrink: 0,
					maxWidth  : undefined,
					flexBasis : undefined,
				},
			})
			: child

		return (
			<UiBox
				key={key}
				uiTransform={{
					...(colSelf !== undefined ? {
						width     : colSelf.width,
						flexGrow  : colSelf.flexGrow,
						flexShrink: colSelf.flexShrink,
						...(colSelf.flexBasis !== undefined ? { flexBasis: colSelf.flexBasis } : {}),
					} : {
						flexGrow  : 0,
						flexShrink: 0,
					}),
					padding       : { left: pad, right: pad },
					...(lineGap ? { margin: { bottom: gap } } : {}),
					display       : 'flex',
					flexDirection : 'column',
					alignItems    : 'stretch',
					justifyContent: 'flex-start',
				}}
			>
				{inner}
			</UiBox>
		)
	})
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
 * Horizontal gutters for non-wrap rows.
 *
 * When any child uses `cols`, applies padded cell wrappers so sticky `%` spans
 * that sum to 12 stay inside the parent (sibling spacers would overflow).
 * Otherwise inserts spacer entities between content-sized children.
 * Do not use with `flexWrap` — use `applyWrapRowGutters` instead.
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

	if (listHasCols(list)) {
		return applyPaddedRowGutters(list, gap, false)
	}

	return insertSpacers(list, gap, edge)
}


// MARK: applyWrapRowGutters
/**
 * Gutters for `flexWrap` rows without sibling spacers (spacers break sticky `%`
 * cols and wrap early).
 *
 * Each child is wrapped in a stably keyed box that owns the `cols` width and
 * applies half-`spacing` horizontal padding + bottom margin. The child is
 * re-created at `width: 100%` with `cols` cleared so chrome fills the inner
 * area and gaps show between cells.
 */
export function applyWrapRowGutters(
	children: ChildList,
	spacing : number | undefined,
): ReactEcs.JSX.Element[] {
	const list = flattenChildren(children)
	const gap  = spacing ?? 0

	if (!gap) {
		return list
	}

	return applyPaddedRowGutters(list, gap, true)
}
