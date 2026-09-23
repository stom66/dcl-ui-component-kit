import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { atlasCharsAlphaNumeric, atlasCharsSymbols, type TextureAtlas } from '../../atlases'
import { type UiBoxProps } from '../base'
import { charGlyph, IconAtlasText, missingGlyph } from './icon.atlasText'

type IconNumberProps = Omit<UiBoxProps, 'uiText'> & {
	value    : number | '/' | '+' | '-' | '×' | '*' | 'x' | '=' | ':' | string
	/**
	 * Tint multiply for each glyph texture. Only way to recolour glyphs —
	 * `backgroundColor` fills the container row (chip), same as `Icon`.
	 */
	iconColor?: Color4
	/** Degrees to rotate each glyph's UVs (same as `Icon.rotate`). */
	rotate?  : number
	/**
	 * Glyph atlas with a `layout`. Defaults to `atlasCharsAlphaNumeric`
	 * (digits). Operators and punctuation fall back to `atlasCharsSymbols`
	 * when this default sheet is in use. Pass a custom `TextureAtlas` to
	 * use your own sheet with no symbols fallback.
	 */
	atlas?   : TextureAtlas
	width?   : PositionUnit | 'auto' | undefined
	height?  : PositionUnit | 'auto' | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: resolveNumberGlyphAtlas
/**
 * Picks the atlas sheet for one glyph. The default alphanumeric sheet holds
 * digits (and letters). Operators and punctuation, including `x` → `×`, come
 * from `atlasCharsSymbols` so formulas work. A custom `atlas` is used alone.
 */
function resolveNumberGlyphAtlas(
	atlas: TextureAtlas,
	glyph: string,
): TextureAtlas | null {
	if (atlas === atlasCharsAlphaNumeric) {
		const onAlphaSheet = atlas.hasChar(glyph) && glyph !== 'x'
		if (!onAlphaSheet && atlasCharsSymbols.hasChar(glyph)) {
			return atlasCharsSymbols
		}
	}
	if (atlas.hasChar(glyph)) {
		return atlas
	}
	return null
}


// MARK: IconNumber
/**
 * Renders a numeric / operator string. Digits come from `atlasCharsAlphaNumeric`;
 * operators and punctuation come from `atlasCharsSymbols` (for example `+`,
 * `/`, `=`, `:`).
 *
 * Digit aspect follows each glyph's effective `insetX` (theme `horizontalInset`,
 * overridden by atlas `charInsets`). Specify `height` or `width` alone — the
 * other axis is computed from the sum of glyph aspects.
 * Unsupported characters render as a warning-coloured box; spaces are blank
 * spacers. Tint with `iconColor` (texture × color multiply).
 */
export const IconNumber = ({
	value = 0,
	atlas = atlasCharsAlphaNumeric,
	...props
}: IconNumberProps) => {
	return (
		<IconAtlasText
			{...props}
			value        = {value}
			keyPrefix    = "icon-num"
			resolveGlyph = {(glyph, horizontalInset) => {
				const glyphAtlas = resolveNumberGlyphAtlas(atlas, glyph)
				if (!glyphAtlas) {
					return missingGlyph(horizontalInset)
				}
				return charGlyph(glyphAtlas, glyph, horizontalInset)
			}}
		/>
	)
}
