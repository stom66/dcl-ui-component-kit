import { isDesktop, isMobile } from '@dcl/sdk/platform'

import { getTheme } from '../styles'
import { clampNumber } from './math'


const IS_MOBILE  = isMobile()
const IS_DESKTOP = isDesktop()


// MARK: getColSizing
/**
 * Resolves a grid column span to a width percentage for the active platform.
 * When no column counts are provided, returns `"auto"`.
 */
export function getColSizing(
	cols?       : number,
	colsDesktop?: number,
	colsMobile? : number
): string {
	const colCount = getTheme().cols.COL_COUNT
	const colSize  = 100 / colCount

	if (cols !== undefined && (cols < 1 || cols > colCount)) {
		cols = clampNumber(cols, 1, colCount)
	}
	if (colsDesktop !== undefined && (colsDesktop < 1 || colsDesktop > colCount)) {
		colsDesktop = clampNumber(colsDesktop, 1, colCount)
	}
	if (colsMobile !== undefined && (colsMobile < 1 || colsMobile > colCount)) {
		colsMobile = clampNumber(colsMobile, 1, colCount)
	}

	let size = "auto"

	if (cols)                      size = cols * colSize + "%"
	if (colsDesktop && IS_DESKTOP) size = colsDesktop * colSize + "%"
	if (colsMobile && IS_MOBILE)   size = colsMobile * colSize + "%"

	return size
}
