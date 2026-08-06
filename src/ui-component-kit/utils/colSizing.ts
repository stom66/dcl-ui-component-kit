import { isDesktop, isMobile } from '@dcl/sdk/platform'
import type { PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../styles'
import { clampNumber } from './math'


const IS_MOBILE  = isMobile()
const IS_DESKTOP = isDesktop()


/** Grid span, or `'auto'` to fill leftover row space (equal share among siblings). */
export type ColSpanInput = number | 'auto'


export type ColSelfTransform = {
	width     : PositionUnit | 'auto'
	flexGrow  : number
	flexShrink: number
	/** Set for `cols="auto"` fill; omit for sticky `%` spans. */
	flexBasis?: number
	/** Reserved for callers that still forward it; sticky spans use `width` only. */
	maxWidth ?: PositionUnit
}

/**
 * Behaviour when no `cols` / platform override is set.
 *
 * - `content` — shrink-to-content (`width: auto`, no grow) — Labels / buttons
 * - `full`    — `width: 100%`
 * - `none`    — no grid sizing props (default for `Column`)
 */
export type ColSelfWhenOmitted = 'content' | 'full' | 'none'


// MARK: resolveColInput
/**
 * Picks the active `cols` input for the current platform.
 * Platform overrides win when defined for that platform.
 */
function resolveColInput(
	cols?       : ColSpanInput,
	colsDesktop?: ColSpanInput,
	colsMobile? : ColSpanInput,
): ColSpanInput | undefined {
	let value: ColSpanInput | undefined = cols

	if (colsDesktop !== undefined && IS_DESKTOP) {
		value = colsDesktop
	}
	if (colsMobile !== undefined && IS_MOBILE) {
		value = colsMobile
	}

	return value
}


// MARK: getColSpan
/**
 * Resolves the active column span (1–`COL_COUNT`) for the current platform.
 * Returns `undefined` when no column counts are provided, or when `cols` is
 * `'auto'` (fill — not a numeric span).
 */
export function getColSpan(
	cols?       : ColSpanInput,
	colsDesktop?: ColSpanInput,
	colsMobile? : ColSpanInput,
): number | undefined {
	const value = resolveColInput(cols, colsDesktop, colsMobile)
	if (value === undefined || value === 'auto') return undefined

	const colCount = getTheme().cols.COL_COUNT
	return clampNumber(value, 1, colCount)
}


// MARK: getColSizing
/**
 * Resolves a grid column span to a width percentage for the active platform.
 * When no column counts are provided, returns `"auto"`. When `cols` is
 * `'auto'` (fill), returns `"auto"` as a non-percentage sentinel — prefer
 * `getColSelfTransform` for layout components.
 */
export function getColSizing(
	cols?       : ColSpanInput,
	colsDesktop?: ColSpanInput,
	colsMobile? : ColSpanInput
): string {
	const value = resolveColInput(cols, colsDesktop, colsMobile)
	if (value === undefined || value === 'auto') return 'auto'

	const span     = getColSpan(cols, colsDesktop, colsMobile)
	if (span === undefined) return 'auto'

	const colCount = getTheme().cols.COL_COUNT
	return `${(span / colCount) * 100}%`
}


// MARK: getColSelfTransform
/**
 * Width / flex props for a grid-spanning item.
 *
 * - `cols="auto"` → fill leftover space (`flexGrow: 1`); equal share among
 *   sibling autos (two autos → half each)
 * - no `cols` → depends on `whenOmitted` (`content` / `full` / `none`)
 * - `cols={12}` (full) → `width: 100%`
 * - partial span → sticky `width: n/12%` (definite size so `flexWrap` works;
 *   two `cols={4}` stay ~⅓ each). Use `Row spacing={0}` when packing a full
 *   12-wide line — spacer gutters add px on top of 100% and can push the last
 *   cell onto the next wrap line.
 *
 * Returns `undefined` when `whenOmitted` is `'none'` and no `cols` is set —
 * callers should omit width / flexGrow props entirely.
 */
export function getColSelfTransform(
	cols?        : ColSpanInput,
	colsDesktop? : ColSpanInput,
	colsMobile?  : ColSpanInput,
	whenOmitted  : ColSelfWhenOmitted = 'content',
): ColSelfTransform | undefined {
	const value = resolveColInput(cols, colsDesktop, colsMobile)

	if (value === 'auto') {
		return {
			width     : 0,
			flexGrow  : 1,
			flexShrink: 0,
			flexBasis : 0,
		}
	}

	if (value === undefined) {
		if (whenOmitted === 'none') {
			return undefined
		}
		if (whenOmitted === 'full') {
			return {
				width     : '100%',
				flexGrow  : 0,
				flexShrink: 0,
			}
		}
		return {
			width     : 'auto',
			flexGrow  : 0,
			flexShrink: 0,
		}
	}

	const colCount = getTheme().cols.COL_COUNT
	const span     = clampNumber(value, 1, colCount)

	if (span >= colCount) {
		return {
			width     : '100%',
			flexGrow  : 0,
			flexShrink: 0,
		}
	}

	const width = `${(span / colCount) * 100}%` as PositionUnit

	return {
		width,
		flexGrow  : 0,
		flexShrink: 0,
	}
}
