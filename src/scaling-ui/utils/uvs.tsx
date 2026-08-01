import { Vector2 } from "@dcl/sdk/math"


export type GetUVCellOptions = {
	/**
	 * 1-based start column (leftmost cell in the selection). Defaults to `1`.
	 * Example: first column of a 4-wide atlas → `1` (not `0`).
	 */
	xStart? : number
	/**
	 * 1-based start row (UV bottom → top). Defaults to `1`.
	 * Example: bottom row → `1`; top row of a 4-tall atlas → `4`.
	 */
	yStart? : number
	/**
	 * 1-based inclusive end column. Defaults to `xStart` (single column).
	 * Span columns 1–2 with `{ xStart: 1, xEnd: 2 }`.
	 */
	xEnd?   : number
	/**
	 * 1-based inclusive end row. Defaults to `yStart` (single row).
	 * Span rows 1–2 with `{ yStart: 1, yEnd: 2 }`.
	 */
	yEnd?   : number
	/** Total columns in the atlas grid (a count, not an index). Defaults to `2`. */
	xTotal? : number
	/** Total rows in the atlas grid (a count, not an index). Defaults to `2`. */
	yTotal? : number
	/** Fraction of the cell to inset on each side (0–0.5). Applied to both axes unless overridden. */
	inset?  : number
	/** X-axis inset override; defaults to `inset`. */
	insetX? : number
	/** Y-axis inset override; defaults to `inset`. */
	insetY? : number
}


// MARK: getUVRow
/**
 * UV quad for one full-width row of a single-column strip.
 *
 * All inputs are **1-based / human-facing**: `row` `1` is the bottom UV row.
 * Prefer `TextureAtlas.row` when you already have an atlas instance.
 *
 * @param row     - 1-based row number (bottom → top in UV space)
 * @param maxRows - Total row count in the strip (default `8`)
 * @returns Flat UV quad `[x0,y0, x0,y1, x1,y1, x1,y0]`
 *
 * @example
 * getUVRow(1, 4) // bottom row of a 4-row strip
 * getUVRow(4, 4) // top row
 */
export function getUVRow(
	row    : number,
	maxRows: number = 8
): number[] {
	return getUVCell({ xStart: 1, yStart: row, xTotal: 1, yTotal: maxRows })
}


// MARK: getUVColumn
/**
 * UV quad for one full-height column of a single-row strip.
 *
 * All inputs are **1-based / human-facing**: `column` `1` is the leftmost column.
 * Prefer `TextureAtlas.column` when you already have an atlas instance.
 *
 * @param column     - 1-based column number (left → right)
 * @param maxColumns - Total column count in the strip (default `8`)
 * @returns Flat UV quad `[x0,y0, x0,y1, x1,y1, x1,y0]`
 *
 * @example
 * getUVColumn(1, 4) // first column of a 4-wide strip
 * getUVColumn(4, 4) // last column
 */
export function getUVColumn(
	column    : number,
	maxColumns: number = 8
): number[] {
	return getUVCell({ xStart: column, yStart: 1, xTotal: maxColumns, yTotal: 1 })
}


// MARK: getUVCell
/**
 * UV quad for a cell (or inclusive cell range) in an atlas grid.
 *
 * **All cell coordinates are 1-based and inclusive.** Totals (`xTotal` /
 * `yTotal`) are counts of columns/rows, not indexes.
 *
 * - First cell of a 4×4 atlas: `{ xStart: 1, yStart: 1, xTotal: 4, yTotal: 4 }`
 * - Top-right cell of a 4×4: `{ xStart: 4, yStart: 4, xTotal: 4, yTotal: 4 }`
 * - Columns 1–2 on row 3: `{ xStart: 1, xEnd: 2, yStart: 3, xTotal: 4, yTotal: 4 }`
 *
 * `xEnd` / `yEnd` default to the start (single cell). `inset` is a fraction of
 * one cell size (0–0.5) applied inward on each side — e.g. inset `0.25` on a
 * 2×2 atlas cell (size 0.5) pads by `0.25 * 0.5 = 0.125` UV. Values above 0.5
 * flip the quad (opposite edges cross).
 *
 * Prefer `TextureAtlas.cell` / `.row` / `.column` when working with a known atlas
 * so column/row totals are not repeated at every call site.
 *
 * @param options - Cell selection and optional inset (see `GetUVCellOptions`)
 * @returns Flat UV quad `[x0,y0, x0,y1, x1,y1, x1,y0]`
 */
export function getUVCell({
	xStart = 1,
	yStart = 1,
	xEnd,
	yEnd,
	xTotal = 2,
	yTotal = 2,
	inset  = 0,
	insetX,
	insetY,
}: GetUVCellOptions = {}): number[] {
	// 1-based inclusive → 0-based half-open for UV math
	const zeroStartX = xStart - 1
	const zeroStartY = yStart - 1
	const zeroEndX   = xEnd ?? xStart
	const zeroEndY   = yEnd ?? yStart
	const sizeX      = 1 / xTotal
	const sizeY      = 1 / yTotal
	const padX       = (insetX ?? inset) * sizeX
	const padY       = (insetY ?? inset) * sizeY
	const x0         = zeroStartX * sizeX + padX
	const y0         = zeroStartY * sizeY + padY
	const x1         = zeroEndX * sizeX - padX
	const y1         = zeroEndY * sizeY - padY

	return [
		x0, y0,
		x0, y1,
		x1, y1,
		x1, y0,
	]
}


// MARK: getRotatedUVs
/**
 * Rotates a UV quad around an origin (degrees). Defaults to the quad centre.
 *
 * @param uvs      - Flat UV quad of exactly 8 numbers
 * @param rotation - Rotation in degrees
 * @param origin   - Optional pivot; defaults to the quad's centre
 * @returns Rotated UV quad of the same length
 */
export function getRotatedUVs(
	uvs     : number[],
	rotation: number,
	origin? : Vector2
): number[] {
	if (uvs.length !== 8) {
		throw new Error("UV array must contain exactly 8 values.")
	}

	// Find the centre of the quad
	if (!origin) {
		const centerX = (uvs[0] + uvs[2] + uvs[4] + uvs[6]) / 4
		const centerY = (uvs[1] + uvs[3] + uvs[5] + uvs[7]) / 4
		origin = Vector2.create(centerX, centerY)
	}


	const radians = rotation * Math.PI / 180
	const cos     = Math.cos(radians)
	const sin     = Math.sin(radians)

	const rotated: number[] = []

	for (let i = 0; i < 8; i += 2) {
		const x = uvs[i] - origin.x
		const y = uvs[i + 1] - origin.y

		rotated.push(
			x * cos - y * sin + origin.x,
			x * sin + y * cos + origin.y
		)
	}

	return rotated
}


// MARK: rotateUvIndexes
/**
 * Rotate the corner order of a UV quad by a given number of steps (90° each).
 *
 * @param uvs      - Flat UV quad of 8 numbers (4 corners × 2)
 * @param rotation - Number of corner steps to rotate (e.g. `1` = 90°)
 * @returns The UV quad with corners reordered
 */
export function rotateUvIndexes(
	uvs: number[],
	rotation: number
): number[] {
	let result = []
	for (let i = 0; i < uvs.length; i += 2) {
		const xNewIndex = (i + (rotation * 2)) % uvs.length
		const yNewIndex = (i + (rotation * 2) + 1) % uvs.length
		result[xNewIndex] = uvs[i]
		result[yNewIndex] = uvs[i + 1]
	}
	return result
}
