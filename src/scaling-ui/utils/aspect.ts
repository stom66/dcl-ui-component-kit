import type { PositionUnit } from '@dcl/sdk/react-ecs'

import { vhToPixels, vwToPixels } from './sizing'


export type AspectSizeValue = PositionUnit | 'auto'

export type ResolveAspectDimensionsOptions = {
	width?        : AspectSizeValue
	height?       : AspectSizeValue
	/**
	 * Width ÷ height. `2.6` means 2.6× as wide as tall.
	 * Ignored when both `width` and `height` are set.
	 */
	aspectRatio   : number
	/**
	 * Height used when neither axis is set. Also used as a fallback height when
	 * width is set but cannot be converted to pixels (`auto`, `%`, …).
	 */
	defaultHeight?: number
}

export type ResolvedAspectDimensions = {
	width ?: AspectSizeValue
	height?: AspectSizeValue
}


// MARK: sizeValueToPixels
/**
 * Converts a size value to virtual UI pixels when the unit is absolute or viewport-based.
 * Returns `null` for `auto`, `%`, and unrecognized units (those need a parent measurement).
 */
export function sizeValueToPixels(value: AspectSizeValue): number | null {
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) {
			console.error('aspect: sizeValueToPixels: non-finite number', value)
			return null
		}
		return value
	}

	const trimmed = String(value).trim()
	if (trimmed === 'auto') return null

	const match = trimmed.match(/^(-?[\d.]+)(px|vw|vh|%)?$/i)
	if (!match) {
		console.error('aspect: sizeValueToPixels: unsupported size value', value)
		return null
	}

	const amount = parseFloat(match[1])
	const unit   = (match[2] ?? 'px').toLowerCase()

	if (!Number.isFinite(amount)) {
		console.error('aspect: sizeValueToPixels: non-finite amount', value)
		return null
	}

	switch (unit) {
		case 'px':
		case '':
			return amount
		case 'vw':
			return vwToPixels(amount)
		case 'vh':
			return vhToPixels(amount)
		case '%':
			return null
		default:
			console.error('aspect: sizeValueToPixels: unsupported unit', unit, value)
			return null
	}
}


// MARK: resolveAspectDimensions
/**
 * Resolves width/height from an aspect ratio and zero or one specified axis.
 *
 * - Neither set → `defaultHeight` and `defaultHeight * aspectRatio` (pixels)
 * - Only height → width = heightPx * aspectRatio (both pixels)
 * - Only width  → height = widthPx / aspectRatio (both pixels)
 * - Both set    → returned unchanged (aspect ignored)
 *
 * Viewport units (`vw` / `vh`) on the specified axis are converted to pixels so
 * the derived axis can be computed. `auto` / `%` cannot be converted; the given
 * value is kept and the missing axis falls back to `defaultHeight` when needed.
 */
export function resolveAspectDimensions({
	width,
	height,
	aspectRatio,
	defaultHeight,
}: ResolveAspectDimensionsOptions): ResolvedAspectDimensions {
	if (!(aspectRatio > 0) || !Number.isFinite(aspectRatio)) {
		console.error('aspect: resolveAspectDimensions: aspectRatio must be a positive finite number', aspectRatio)
		return { width, height }
	}

	const hasWidth  = width  !== undefined
	const hasHeight = height !== undefined

	if (hasWidth && hasHeight) {
		return { width, height }
	}

	if (!hasWidth && !hasHeight) {
		if (defaultHeight === undefined) {
			console.error('aspect: resolveAspectDimensions: neither axis set and no defaultHeight')
			return {}
		}
		return {
			width : defaultHeight * aspectRatio,
			height: defaultHeight,
		}
	}

	if (hasWidth && !hasHeight) {
		const widthPx = sizeValueToPixels(width as AspectSizeValue)
		if (widthPx !== null) {
			return {
				width : widthPx,
				height: widthPx / aspectRatio,
			}
		}
		if (defaultHeight === undefined) {
			console.error('aspect: resolveAspectDimensions: cannot derive height from non-pixel width', width)
			return { width }
		}
		return { width, height: defaultHeight }
	}

	const heightPx = sizeValueToPixels(height as AspectSizeValue)
	if (heightPx !== null) {
		return {
			width : heightPx * aspectRatio,
			height: heightPx,
		}
	}

	console.error('aspect: resolveAspectDimensions: cannot derive width from non-pixel height', height)
	return { height }
}
