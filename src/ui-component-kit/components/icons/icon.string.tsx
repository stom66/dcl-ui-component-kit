import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { atlasCharsAlphaNumeric, atlasCharsNumbers, atlasCharsSymbols, type TextureAtlas } from '../../atlases'
import { type UiBoxProps } from '../base'
import { charGlyph, IconAtlasText, missingGlyph } from './icon.atlasText'

type IconStringAtlases = {
	/** Default: `atlasCharsAlphaNumeric` (letters + digits). Tried first. */
	characters?: TextureAtlas
	/** Default: `atlasCharsSymbols`. Tried second. */
	symbols?   : TextureAtlas
	/** Default: `atlasCharsNumbers` (digits + operators). Tried last. */
	numbers?   : TextureAtlas
}

type IconStringProps = Omit<UiBoxProps, 'uiText'> & {
	value    : number | string
	/**
	 * Tint multiply for each glyph texture. Only way to recolour glyphs —
	 * `backgroundColor` fills the container row (chip), same as `Icon`.
	 */
	iconColor?: Color4
	/** Degrees to rotate each glyph's UVs (same as `Icon.rotate`). */
	rotate?  : number
	/**
	 * Optional atlas overrides for the cascade. Lookup order is always
	 * characters → symbols → numbers.
	 */
	atlases? : IconStringAtlases
	width?   : PositionUnit | 'auto' | undefined
	height?  : PositionUnit | 'auto' | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: resolveStringGlyphAtlas
/**
 * Cascades glyph lookup across alphanumeric → symbols → numbers sheets.
 *
 * @param glyph   - Single character to resolve
 * @param atlases - Sheets to search (defaults applied by caller)
 */
function resolveStringGlyphAtlas(
	glyph  : string,
	atlases: Required<IconStringAtlases>,
): TextureAtlas | null {
	if (atlases.characters.hasChar(glyph)) {
		return atlases.characters
	}
	if (atlases.symbols.hasChar(glyph)) {
		return atlases.symbols
	}
	if (atlases.numbers.hasChar(glyph)) {
		return atlases.numbers
	}
	return null
}


// MARK: IconString
/**
 * Renders an arbitrary string from the bundled glyph atlases.
 * Lookup order per character: `atlasCharsAlphaNumeric` → `atlasCharsSymbols` →
 * `atlasCharsNumbers`. Spaces become blank spacers; unsupported characters
 * become a warning-coloured box (theme `colors.warning`).
 *
 * Prefer the narrower components when you know the charset:
 * - `IconNumber` — scores / timers / formulas (smallest sheet, least overhead)
 * - `IconSymbol` — punctuation only
 * - `IconCharacter` — letters (+ digits from the alphanumeric sheet)
 *
 * Tint with `iconColor` (texture × color multiply).
 */
export const IconString = ({
	value   = '',
	atlases,
	...props
}: IconStringProps) => {
	const resolvedAtlases: Required<IconStringAtlases> = {
		characters: atlases?.characters ?? atlasCharsAlphaNumeric,
		symbols   : atlases?.symbols    ?? atlasCharsSymbols,
		numbers   : atlases?.numbers    ?? atlasCharsNumbers,
	}

	return (
		<IconAtlasText
			{...props}
			value        = {value}
			keyPrefix    = "icon-str"
			resolveGlyph = {(glyph, horizontalInset) => {
				const glyphAtlas = resolveStringGlyphAtlas(glyph, resolvedAtlases)
				if (!glyphAtlas) {
					return missingGlyph(horizontalInset)
				}
				return charGlyph(glyphAtlas, glyph, horizontalInset)
			}}
		/>
	)
}
