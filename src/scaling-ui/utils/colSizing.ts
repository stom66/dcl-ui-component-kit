import { isDesktop, isMobile } from '@dcl/sdk/platform'

import { getTheme } from '../styles'
import { clampNumber } from './math'


const IS_MOBILE  = isMobile()
const IS_DESKTOP = isDesktop()
const theme      = getTheme()

export function getColSizing(
	cols       : number = theme.cols.COL_COUNT, 
	colsDesktop: number = theme.cols.COL_COUNT, 
	colsMobile : number = theme.cols.COL_COUNT
): string {
	const colCount = theme.cols.COL_COUNT
	const colSize  = 100 / colCount

	if (cols && (cols < 1 || cols > colCount)) cols = clampNumber(cols, 1, colCount)
	if (colsDesktop && (colsDesktop < 1 || colsDesktop > colCount)) colsDesktop = clampNumber(colsDesktop, 1, colCount)
	if (colsMobile && (colsMobile < 1 || colsMobile > colCount)) colsMobile = clampNumber(colsMobile, 1, colCount)

	let size = "auto"

	if (cols) size                      = cols * colSize + "%"
	if (colsDesktop && IS_DESKTOP) size = colsDesktop * colSize + "%"
	if (colsMobile && IS_MOBILE) size   = colsMobile * colSize + "%"

	return size
}
