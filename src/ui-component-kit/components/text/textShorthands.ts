import { Color4 } from '@dcl/sdk/math'
import { type TextAlignType, type UiFontType, type UiLabelProps, type UiTextWrapType } from '@dcl/sdk/react-ecs'


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
	/** Font family. Overrides `uiText.font`. */
	font?      : UiFontType
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
 */
export function mergeTextShorthands(
	defaults  : UiLabelProps,
	uiText    : Partial<UiLabelProps> | undefined,
	shorthands: TextShorthandProps,
): UiLabelProps {
	return {
		...defaults,
		...uiText,
		...omitUndefined({
			fontSize : shorthands.fontSize,
			font     : shorthands.font,
			textAlign: shorthands.textAlign,
			textWrap : shorthands.textWrap,
			color    : shorthands.fontColor,
		}),
		value: shorthands.value ?? uiText?.value ?? defaults.value ?? '',
	}
}
