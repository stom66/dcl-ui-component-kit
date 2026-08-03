import { isDesktop, isMobile } from '@dcl/sdk/platform'
import type { PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../styles'
import { clampNumber } from './math'


const IS_MOBILE  = isMobile()
const IS_DESKTOP = isDesktop()


export type ColSelfTransform = {
	width     : PositionUnit | 'auto'
	flexGrow  : number
	flexShrink: number
	/** `0` for partial flex spans; omit/`undefined` when not growing. */
	flexBasis?: number
}


// MARK: getColSpan
/**
 * Resolves the active column span (1–`COL_COUNT`) for the current platform.
 * Returns `undefined` when no column counts are provided.
 */
export function getColSpan(
	cols?       : number,
	colsDesktop?: number,
	colsMobile? : number,
): number | undefined {
	const colCount = getTheme().cols.COL_COUNT
	let span: number | undefined

	if (cols !== undefined) {
		span = clampNumber(cols, 1, colCount)
	}
	if (colsDesktop !== undefined && IS_DESKTOP) {
		span = clampNumber(colsDesktop, 1, colCount)
	}
	if (colsMobile !== undefined && IS_MOBILE) {
		span = clampNumber(colsMobile, 1, colCount)
	}

	return span
}


// MARK: getColSizing
/**
 * Resolves a grid column span to a width percentage for the active platform.
 * When no column counts are provided, returns `"auto"`.
 *
 * Prefer `getColSelfTransform` for `Row` / `Column` / `Label` / `ButtonText` —
 * partial spans use `flexGrow` so gutters do not require `createElement` clones.
 */
export function getColSizing(
	cols?       : number,
	colsDesktop?: number,
	colsMobile? : number
): string {
	const span = getColSpan(cols, colsDesktop, colsMobile)
	if (span === undefined) return 'auto'

	const colCount = getTheme().cols.COL_COUNT
	return `${(span / colCount) * 100}%`
}


// MARK: getColSelfTransform
/**
 * Width / flex props for a grid-spanning item.
 *
 * - no `cols` → `width: auto`
 * - `cols={12}` (full) → `width: 100%` (safe inside vertical `Column` stacks)
 * - partial span → `flexGrow: span` with `width: 0` so `Row` gutters can be
 *   spacer entities instead of ReactEcs `createElement` reclones (entity leak)
 */
export function getColSelfTransform(
	cols?       : number,
	colsDesktop?: number,
	colsMobile? : number,
): ColSelfTransform {
	const span = getColSpan(cols, colsDesktop, colsMobile)
	if (span === undefined) {
		return {
			width     : 'auto',
			flexGrow  : 0,
			flexShrink: 0,
		}
	}

	const colCount = getTheme().cols.COL_COUNT
	if (span >= colCount) {
		return {
			width     : '100%',
			flexGrow  : 0,
			flexShrink: 0,
		}
	}

	return {
		width     : 0,
		flexGrow  : span,
		flexShrink: 0,
		flexBasis : 0,
	}
}
