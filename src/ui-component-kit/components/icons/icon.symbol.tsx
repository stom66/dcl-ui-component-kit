import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { atlasCharsSymbols, type TextureAtlas } from '../../atlases'
import { type UiBoxProps } from '../base'
import { charGlyph, IconAtlasText, missingGlyph } from './icon.atlasText'

type IconSymbolProps = Omit<UiBoxProps, 'uiText'> & {
	value    : string
	/**
	 * Glyph atlas with a `layout`. Defaults to `atlasCharsSymbols`.
	 * Pass a custom `TextureAtlas` to use your own symbol sheet.
	 */
	atlas?   : TextureAtlas
	width?   : PositionUnit | 'auto' | undefined
	height?  : PositionUnit | 'auto' | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: IconSymbol
/**
 * Renders punctuation / symbol glyphs from `atlasCharsSymbols` by default
 * (e.g. `= $ % @ # ? !`). Prefer `IconNumber` when you only need digits and
 * operators from the numbers sheet. Unsupported characters render as a
 * warning-coloured box; spaces are blank spacers.
 */
export const IconSymbol = ({
	value = '',
	atlas = atlasCharsSymbols,
	...props
}: IconSymbolProps) => {
	return (
		<IconAtlasText
			{...props}
			value        = {value}
			keyPrefix    = "icon-sym"
			resolveGlyph = {(glyph, horizontalInset) => {
				if (!atlas.hasChar(glyph)) {
					return missingGlyph(horizontalInset)
				}
				return charGlyph(atlas, glyph, horizontalInset)
			}}
		/>
	)
}
