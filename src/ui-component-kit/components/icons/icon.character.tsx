import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { atlasCharsAlphaNumeric, type TextureAtlas } from '../../atlases'
import { type UiBoxProps } from '../base'
import { charGlyph, IconAtlasText, missingGlyph } from './icon.atlasText'

type IconCharacterProps = Omit<UiBoxProps, 'uiText'> & {
	value    : string
	/**
	 * Tint multiply for each glyph texture. Only way to recolour glyphs —
	 * `backgroundColor` fills the container row (chip), same as `Icon`.
	 */
	iconColor?: Color4
	/**
	 * Glyph atlas with a `layout`. Defaults to `atlasCharsAlphaNumeric`.
	 * Pass a custom `TextureAtlas` to use your own letter sheet.
	 */
	atlas?   : TextureAtlas
	width?   : PositionUnit | 'auto' | undefined
	height?  : PositionUnit | 'auto' | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: IconCharacter
/**
 * Renders letters and digits from `atlasCharsAlphaNumeric` by default
 * (`a–z`, `A–Z`, `0–9`). Prefer `IconNumber` when you only need the numbers
 * sheet — this atlas is larger and has more texture overhead.
 * Unsupported characters (including most punctuation) render as a
 * warning-coloured box; spaces are blank spacers. For mixed letters +
 * symbols, use `IconString`. Tint with `iconColor` (texture × color multiply).
 */
export const IconCharacter = ({
	value = '',
	atlas = atlasCharsAlphaNumeric,
	...props
}: IconCharacterProps) => {
	return (
		<IconAtlasText
			{...props}
			value        = {value}
			keyPrefix    = "icon-char"
			resolveGlyph = {(glyph, horizontalInset) => {
				if (!atlas.hasChar(glyph)) {
					return missingGlyph(horizontalInset)
				}
				return charGlyph(atlas, glyph, horizontalInset)
			}}
		/>
	)
}
