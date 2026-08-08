import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSelfTransform, type ColSpanInput } from '../../utils'

import { UiBox, type UiBoxProps } from '../base'

import { applySpacingToChildren, flattenChildren } from './childSpacing'


/** Flow axis for `Grid`: fill rows left-to-right, or columns top-to-bottom. */
export type GridDirection = 'horizontal' | 'vertical'


export type GridProps = UiBoxProps & {
	children?     : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Items per row (`horizontal`) or per column (`vertical`).
	 * Required — equal-size cells are laid out in tracks of this length.
	 */
	limit         : number
	/** Defaults to `horizontal` (row-major). */
	direction?    : GridDirection
	/**
	 * When true (default), short final tracks get empty placeholders so cell
	 * size matches a full track. When false, leftover items share the track.
	 */
	padIncomplete?: boolean
	/** Gap between cells / tracks. Defaults to `theme.spacing`. Pass `0` to disable. */
	spacing?      : number
	cols?         : ColSpanInput
	colsDesktop?  : ColSpanInput
	colsMobile?   : ColSpanInput
}


// MARK: chunkChildren
/** Splits flattened children into tracks of at most `size`. */
function chunkChildren(
	list: ReactEcs.JSX.Element[],
	size: number,
): ReactEcs.JSX.Element[][] {
	const chunks: ReactEcs.JSX.Element[][] = []
	for (let i = 0; i < list.length; i += size) {
		chunks.push(list.slice(i, i + size))
	}
	return chunks
}


// MARK: renderEqualCell
/**
 * Cell shell. Horizontal tracks use equal `flexGrow` widths (not sticky `%` /
 * `cols`) so spacer gutters stay inside the parent. Vertical tracks are
 * content-sized; equal column widths come from the track shells in the row.
 */
function renderEqualCell(
	child    : ReactEcs.JSX.Element | undefined,
	key      : string,
	direction: GridDirection,
): ReactEcs.JSX.Element {
	const equalWidth = direction === 'horizontal'

	return (
		<UiBox
			key={key}
			uiTransform={{
				width         : equalWidth ? 0 : '100%',
				height        : 'auto',
				flexGrow      : equalWidth ? 1 : 0,
				flexShrink    : 0,
				...(equalWidth ? { flexBasis: 0 } : {}),
				display       : 'flex',
				flexDirection : 'column',
				alignItems    : 'stretch',
				justifyContent: 'flex-start',
			}}
		>
			{child}
		</UiBox>
	)
}


// MARK: buildTrackCells
/** Builds cell shells for one track, optionally padding to `limit`. */
function buildTrackCells(
	chunk        : ReactEcs.JSX.Element[],
	limit        : number,
	padIncomplete: boolean,
	direction    : GridDirection,
	trackKey     : string,
): ReactEcs.JSX.Element[] {
	const cells: ReactEcs.JSX.Element[] = chunk.map((child, i) => {
		const key = (child.key as string | undefined) ?? `${trackKey}_cell_${i}`
		return renderEqualCell(child, key, direction)
	})

	if (!padIncomplete) return cells

	while (cells.length < limit) {
		const pad = cells.length
		cells.push(renderEqualCell(undefined, `${trackKey}_pad_${pad}`, direction))
	}

	return cells
}


// MARK: Grid
/**
 * Equal-cell grid for inventories and icon boards.
 *
 * Chunks children into tracks of `limit`. Horizontal cells share width via
 * `flexGrow`; gutters use spacer entities — no padded `cols` wrappers and no
 * `flexWrap` + sticky `%` math.
 *
 * - `direction="horizontal"` (default): `limit` columns, row-major flow
 * - `direction="vertical"`: `limit` rows per column, column-major flow
 *
 * Optional `cols` sizes the whole grid inside a parent `Row` (same as `Column`).
 */
export function Grid({
	children,
	limit,
	direction     = 'horizontal',
	padIncomplete = true,
	spacing,
	cols,
	colsDesktop,
	colsMobile,
	uiTransform,
	...props
}: GridProps) {
	const gap      = spacing ?? getTheme().spacing
	const trackLen = Math.max(1, Math.floor(limit))
	const list     = flattenChildren(children)
	const tracks   = list.length === 0 ? [] : chunkChildren(list, trackLen)
	const colSelf  = getColSelfTransform(cols, colsDesktop, colsMobile, 'none')

	const body = direction === 'vertical'
		? applySpacingToChildren(
			tracks.map((chunk, trackIndex) => {
				const trackKey = `__grid_col_${trackIndex}`
				const cells    = buildTrackCells(chunk, trackLen, padIncomplete, direction, trackKey)

				return (
					<UiBox
						key={trackKey}
						uiTransform={{
							width         : 0,
							height        : 'auto',
							flexGrow      : 1,
							flexShrink    : 0,
							flexBasis     : 0,
							display       : 'flex',
							flexDirection : 'column',
							alignItems    : 'stretch',
							justifyContent: 'flex-start',
						}}
					>
						{applySpacingToChildren(cells, gap, 'bottom')}
					</UiBox>
				)
			}),
			gap,
			'right',
		)
		: applySpacingToChildren(
			tracks.map((chunk, trackIndex) => {
				const trackKey = `__grid_row_${trackIndex}`
				const cells    = buildTrackCells(chunk, trackLen, padIncomplete, direction, trackKey)

				return (
					<UiBox
						key={trackKey}
						uiTransform={{
							width         : '100%',
							height        : 'auto',
							display       : 'flex',
							flexDirection : 'row',
							alignItems    : 'stretch',
							justifyContent: 'flex-start',
						}}
					>
						{applySpacingToChildren(cells, gap, 'right')}
					</UiBox>
				)
			}),
			gap,
			'bottom',
		)

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : 'auto',
				display       : 'flex',
				flexDirection : direction === 'vertical' ? 'row' : 'column',
				alignItems    : 'stretch',
				justifyContent: 'flex-start',
				...(colSelf !== undefined ? {
					width     : colSelf.width,
					flexGrow  : colSelf.flexGrow,
					flexShrink: colSelf.flexShrink,
					...(colSelf.flexBasis !== undefined ? { flexBasis: colSelf.flexBasis } : {}),
					...(colSelf.maxWidth  !== undefined ? { maxWidth : colSelf.maxWidth  } : {}),
				} : {
					width: '100%',
				}),
				...uiTransform,
			}}
		>
			{body}
		</UiBox>
	)
}
