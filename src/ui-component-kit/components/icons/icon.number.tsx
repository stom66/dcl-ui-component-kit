import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { atlasCharsNumbers, atlasCharsSymbols, type TextureAtlas } from '../../atlases'
import { type UiBoxProps } from '../base'
import { charGlyph, IconAtlasText, missingGlyph } from './icon.atlasText'

type IconNumberProps = Omit<UiBoxProps, 'uiText'> & {
	value    : number | '/' | '+' | '-' | '×' | '*' | 'x' | '=' | ':' | string
	/**
	 * Glyph atlas with a `layout`. Defaults to `atlasCharsNumbers`.
	 * Pass a custom `TextureAtlas` to use your own number sheet.
	 */
	atlas?   : TextureAtlas
	width?   : PositionUnit | 'auto' | undefined
	height?  : PositionUnit | 'auto' | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: resolveNumberGlyphAtlas
/**
 * Picks the atlas sheet for one glyph. Default `atlasCharsNumbers` falls back to
 * `atlasCharsSymbols` for punctuation (e.g. `=` `$` `%`) so formulas work.
 */
function resolveNumberGlyphAtlas(
	atlas: TextureAtlas,
	glyph: string,
): TextureAtlas | null {
	if (atlas.hasChar(glyph)) {
		return atlas
	}
	if (atlas === atlasCharsNumbers && atlasCharsSymbols.hasChar(glyph)) {
		return atlasCharsSymbols
	}
	return null
}


// MARK: IconNumber
/**
 * Renders a numeric / operator string from `atlasCharsNumbers` by default.
 * Prefer this over `IconString` / `IconCharacter` for scores, timers, and
 * formulas — the numbers sheet is smaller and has less texture overhead.
 *
 * Digit aspect follows each glyph's effective `insetX` (theme `horizontalInset`,
 * overridden by atlas `charInsets`). Specify `height` or `width` alone — the
 * other axis is computed from the sum of glyph aspects.
 * When using the default numbers atlas, missing glyphs (e.g. `=`) resolve from
 * `atlasCharsSymbols`. Unsupported characters render as a warning-coloured box;
 * spaces are blank spacers.
 */
export const IconNumber = ({
	value = 0,
	atlas = atlasCharsNumbers,
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
