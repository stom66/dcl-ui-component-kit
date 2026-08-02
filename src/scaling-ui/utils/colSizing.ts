import { isDesktop, isMobile } from '@dcl/sdk/platform'

import { getTheme } from '../styles'
import { clampNumber } from './math'


const IS_MOBILE  = isMobile()
const IS_DESKTOP = isDesktop()


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
 * Note: Yoga has no `calc()`. When a `Row` also applies child `spacing`, it
 * switches `cols` children to `flexGrow` instead of this percentage so gutters
 * do not overflow the parent.
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
