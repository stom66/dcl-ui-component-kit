import { Color4 } from '@dcl/sdk/math'
import { type TextAlignType, type UiFontType, type UiLabelProps, type UiTextWrapType } from '@dcl/sdk/react-ecs'

import { resolveThemeFontSrc } from '../../utils/typography'


/**
 * Top-level text shorthands for `Text` / `H*` / `Code` / `Header` / `SectionHeader` / `Label`.
 * Prefer these over nesting `uiText={{ … }}`. `fontSize` is a theme-base px number
 * (`theme.typography.size.*`) — `UiBox` scales it. Do not pre-scale.
 */
export type TextShorthandProps = {
	/** Copy string. Prefer this over JSX text children / `uiText.value`. */
	value?     : string
	/** Font color. Overrides `uiText.color`. */
	fontColor? : Color4
	/**
	 * Theme-base font size in px (prefer `theme.typography.size.small` / `.default` / `h1`–`h6` / `.code`).
	 * Auto-scaled by `UiBox` — do not wrap with `scaleThemeFontSize` / `scaleFontSize`.
	 */
	fontSize?  : number
	/** Built-in font family. Overrides `uiText.font`. Always set beside `fontSrc` (SDK fallback). */
	font?      : UiFontType
	/**
	 * Scene-relative `.ttf` path for a custom font (`uiText.fontSrc`). Prefer theme
	 * `typography.fontSrc` for project-wide faces; use this for one-off overrides.
	 */
	fontSrc?   : string
	/** Text alignment. Overrides `uiText.textAlign`. */
	textAlign? : TextAlignType
	/** Wrap behaviour. Overrides `uiText.textWrap`. */
	textWrap?  : UiTextWrapType
}


// MARK: omitUndefined
/** Drops keys whose value is `undefined` so spreads do not clobber defaults. */
function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
	const out: Partial<T> = {}
	for (const key of Object.keys(obj) as (keyof T)[]) {
		if (obj[key] !== undefined) {
			out[key] = obj[key]
		}
	}
	return out
}


// MARK: mergeTextShorthands
/**
 * Merges text defaults ← `uiText` ← top-level shorthands.
 * Shorthands win. Numeric `fontSize` values stay theme-base px — `UiBox` scales them.
 * When `fontSrc` is still unset after merge, fills from `theme.typography.fontSrc`
 * for the resolved `font` face (see `resolveThemeFontSrc`).
 */
export function mergeTextShorthands(
	defaults  : UiLabelProps,
	uiText    : Partial<UiLabelProps> | undefined,
	shorthands: TextShorthandProps,
): UiLabelProps {
	const merged: UiLabelProps = {
		...defaults,
		...uiText,
		...omitUndefined({
			fontSize : shorthands.fontSize,
			font     : shorthands.font,
			fontSrc  : shorthands.fontSrc,
			textAlign: shorthands.textAlign,
			textWrap : shorthands.textWrap,
			color    : shorthands.fontColor,
		}),
		value: shorthands.value ?? uiText?.value ?? defaults.value ?? '',
	}

	if (merged.fontSrc === undefined) {
		const themeFontSrc = resolveThemeFontSrc(merged.font)
		if (themeFontSrc !== undefined) {
			merged.fontSrc = themeFontSrc
			if (merged.font === undefined) {
				merged.font = 'sans-serif'
			}
		}
	}

	return merged
}
