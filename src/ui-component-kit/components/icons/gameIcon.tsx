import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { resolveGameIcon, type GameIconId } from '../../fonts'
import { getTheme } from '../../styles'


export type GameIconProps = {
	/** Sibling identity. react-ecs passes `key` through as a real prop. */
	key?      : string
	/**
	 * Icon name from game-icons.net — kebab-case (`crossed-swords`), camelCase
	 * (`crossedSwords`), or `author/name` (`lorc/crossed-swords`, needed only for
	 * names two contributors share). Search `fonts/gameIcons.icons.ts` for names.
	 */
	icon      : GameIconId | (string & {})
	/**
	 * Pixel size for the glyph box and `uiText.fontSize`.
	 * Passed through raw — not theme-scaled. Defaults to `theme.icons.defaultSize`.
	 */
	fontSize? : number
	/** Glyph tint. Defaults to `theme.colors.light`. */
	fontColor?: Color4
}


// MARK: GameIcon
/**
 * game-icons.net glyph via scene TTF (`fontSrc`) — same API as `FontAwesome`.
 * Bare `UiEntity`; `key` is forwarded so sibling lists keep a stable identity.
 *
 * All ~4,000 icons live in one font, `assets/fonts/duck-game-icons.ttf`, copied
 * into the scene by `npx @stom66/dcl-ui-component-kit copy-assets`.
 *
 * Licence: CC BY 3.0 — credit the authors in your scene (see `docs/game-icons.md`).
 */
export function GameIcon({
	key,
	icon,
	fontSize: fontSizeProp,
	fontColor,
}: GameIconProps) {
	const theme    = getTheme()
	const resolved = resolveGameIcon(icon)

	if (!resolved) {
		console.error(`GameIcon: unknown icon "${icon}"`)
	}

	const fontSize = fontSizeProp ?? theme.icons.defaultSize

	return (
		<UiEntity
			key={key}
			uiTransform={{
				width     : fontSize,
				height    : fontSize,
				flexShrink: 0,
			}}
			uiText={{
				value    : resolved?.glyph ?? '',
				fontSize,
				font     : 'sans-serif',
				fontSrc  : resolved?.fontSrc,
				color    : fontColor ?? theme.colors.light,
				textAlign: 'middle-center',
			}}
		/>
	)
}
