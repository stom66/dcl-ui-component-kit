import { isMobile } from '@dcl/sdk/platform'
import { scaleFontSize, type ScaleContext, type ScaleUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../styles/theme'


/** Mobile virtual canvas width before SDK 7.26 / kit alignment bump (1200). */
const MOBILE_VIRTUAL_WIDTH_BASELINE = 1200
/** Current mobile virtual canvas width — keep multiplier in sync with `sizing.ts`. */
const MOBILE_VIRTUAL_WIDTH_CURRENT  = 1600

/** Default mobile typography boost — offsets larger mobile virtual canvas (1600 vs 1200). */
const DEFAULT_MOBILE_TYPOGRAPHY_SCALE = MOBILE_VIRTUAL_WIDTH_CURRENT / MOBILE_VIRTUAL_WIDTH_BASELINE


// MARK: resolveTypographySize
/**
 * Resolves a theme typography base px at render time (platform + optional theme scale).
 * Theme `typography.size.*` stays plain numbers; call this (or `scaleThemeFontSize`) before
 * `scaleFontSize` so mobile/desktop and high-DPI adjustments apply when canvas info exists.
 */
export function resolveTypographySize(basePx: number): number {
	if (!Number.isFinite(basePx) || basePx <= 0) return basePx

	const scale     = getTheme().typography.scale
	const platform  = isMobile()
		? (scale?.mobile ?? DEFAULT_MOBILE_TYPOGRAPHY_SCALE)
		: (scale?.desktop ?? 1)

	return basePx * platform
}


// MARK: scaleThemeFontSize
/**
 * Platform-aware theme font size: `resolveTypographySize` then SDK `scaleFontSize`.
 *
 * Kit components (`Text`, `Label`, `UiBox`, …) already call this — pass a raw
 * `theme.typography.size.*` (or other theme-base px) on `fontSize` / `uiText.fontSize`.
 * Use this helper only on raw `UiEntity` (or other paths that skip `UiBox`).
 * Never use SDK `scaleFontSize` directly; it skips the theme platform multiplier.
 */
export function scaleThemeFontSize(
	basePx   : number,
	scaleUnit?: ScaleUnit,
	ctx?     : ScaleContext,
): number {
	return scaleFontSize(resolveTypographySize(basePx), scaleUnit, ctx)
}


// MARK: scaleUiTextFontSize
/**
 * Scales a numeric `uiText.fontSize` as theme-base px. Viewport strings (`'2vw'`) pass through.
 * `UiBox` applies this so kit text cannot skip scaling.
 */
export function scaleUiTextFontSize<T extends { fontSize?: number | string }>(
	uiText: T | undefined,
): T | undefined {
	if (uiText === undefined) return undefined
	if (typeof uiText.fontSize !== 'number') return uiText
	return { ...uiText, fontSize: scaleThemeFontSize(uiText.fontSize) }
}


// MARK: resolveLayoutFontSize
/**
 * `scaleThemeFontSize` for Yoga minHeight / wrap estimates. Non-numeric sizes
 * (e.g. `'2vw'`) fall back to `fallback` theme-base px.
 */
export function resolveLayoutFontSize(
	fontSize: number | string | undefined,
	fallback: number,
): number {
	return scaleThemeFontSize(typeof fontSize === 'number' ? fontSize : fallback)
}
