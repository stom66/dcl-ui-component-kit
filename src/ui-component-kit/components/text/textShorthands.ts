import { Color4 } from '@dcl/sdk/math'
import { scaleFontSize, type TextAlignType, type UiFontType, type UiLabelProps, type UiTextWrapType } from '@dcl/sdk/react-ecs'


/**
 * Top-level text shorthands for `Text` / `H*` / `Code` / `Header` / `SectionHeader` / `Label`.
 * Prefer these over nesting `uiText={{ … }}`. `fontSize` is a theme base px number —
 * the helper wraps it with `scaleFontSize` at merge time.
 */
export type TextShorthandProps = {
	/** Copy string. Prefer this over JSX text children / `uiText.value`. */
	value?     : string
	/** Font color. Overrides `uiText.color`. */
	fontColor? : Color4
	/**
	 * Base font size in theme px (e.g. `theme.typography.size.small`).
	 * Auto-wrapped with `scaleFontSize` — do not pre-scale.
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
 * Shorthands win. `fontSize` shorthand is `scaleFontSize`'d; `uiText.fontSize`
 * is left as-is (caller must scale if they nest).
 */
export function mergeTextShorthands(
	defaults  : UiLabelProps,
	uiText    : Partial<UiLabelProps> | undefined,
	shorthands: TextShorthandProps,
): UiLabelProps {
	const scaledFontSize = shorthands.fontSize !== undefined
		? scaleFontSize(shorthands.fontSize)
		: undefined

	return {
		...defaults,
		...uiText,
		...omitUndefined({
			fontSize : scaledFontSize,
			font     : shorthands.font,
			textAlign: shorthands.textAlign,
			textWrap : shorthands.textWrap,
			color    : shorthands.fontColor,
		}),
		value: shorthands.value ?? uiText?.value ?? defaults.value ?? '',
	}
}
