import type { PositionUnit } from '@dcl/sdk/react-ecs'

/**
 * DCL/Yoga layout helpers for uiText blocks.
 *
 * `height: 'auto'` does not reserve space when a height-capped `Column` shrinks
 * its children (`flexShrink` defaults to 1). Text components must set
 * `flexShrink: 0` and a `minHeight` floor so siblings do not overlap.
 *
 * Explicit `\n` lines and soft-wrapped lines also need a multiplied floor —
 * Yoga often keeps the box at one line tall while the glyph paint wraps/overflows.
 */

/** Conservative average glyph width as a fraction of font size (sans-serif). */
const AVG_CHAR_WIDTH_FACTOR = 0.55


// MARK: textMinHeight
/** One-line floor for a uiText block (font size + a little leading). */
export function textMinHeight(fontSize: number): number {
	return Math.ceil(fontSize * 1.15)
}


// MARK: textLineCount
/** Number of explicit lines in a uiText value (`\n`-separated, minimum 1). */
export function textLineCount(value: string | undefined): number {
	return Math.max(1, String(value ?? '').split('\n').length)
}


// MARK: asPixelNumber
/**
 * Parses a plain virtual-pixel `PositionUnit` (`128` / `"128"`).
 * Returns `undefined` for `%` / `vw` / `vh` / `auto` / unset.
 */
export function asPixelNumber(value: PositionUnit | 'auto' | undefined): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) return Number(value)
	return undefined
}


// MARK: textWrappedLineCount
/**
 * Estimates visible line count for a uiText value inside a known content width.
 * Counts explicit `\n` breaks, then soft-wraps each paragraph by average glyph width.
 */
export function textWrappedLineCount(
	value     : string | undefined,
	fontSize  : number,
	widthPx   : number,
): number {
	const charsPerLine = Math.max(1, Math.floor(widthPx / Math.max(1, fontSize * AVG_CHAR_WIDTH_FACTOR)))
	let total = 0

	for (const paragraph of String(value ?? '').split('\n')) {
		const len = paragraph.length
		total += len === 0 ? 1 : Math.ceil(len / charsPerLine)
	}

	return Math.max(1, total)
}


// MARK: textBlockMinHeight
/**
 * Multiline floor for a uiText block.
 * When `widthPx` is known, soft-wrap is estimated; otherwise only `\n` counts.
 */
export function textBlockMinHeight(
	fontSize : number,
	value?   : string,
	widthPx? : number,
): number {
	const lines = widthPx !== undefined && widthPx > 0
		? textWrappedLineCount(value, fontSize, widthPx)
		: textLineCount(value)
	return textMinHeight(fontSize) * lines
}
