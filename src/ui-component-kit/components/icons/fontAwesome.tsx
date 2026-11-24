import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { resolveFontAwesomeIcon } from '../../fonts'
import { getTheme } from '../../styles'


export type FontAwesomeProps = {
	/** Sibling identity. react-ecs passes `key` through as a real prop. */
	key?      : string
	/** Icon name — kebab-case (`dice-d20`), camelCase (`diceD20`), or alias (`close` → `xmark`). */
	icon      : string
	/**
	 * Pixel size for the glyph box and `uiText.fontSize`.
	 * Passed through raw (same as the fontSrc bugtest scene) — not theme-scaled.
	 * Defaults to `theme.icons.defaultSize`.
	 */
	fontSize? : number
	/** Glyph tint. Defaults to `theme.colors.light`. */
	fontColor?: Color4
}


// MARK: FontAwesome
/**
 * Font Awesome Free glyph via scene TTF (`fontSrc`). Bare `UiEntity` — `key`
 * is forwarded so sibling lists keep a stable identity.
 *
 * Preview needs asset bundles (`npm run start:bundles`).
 */
export function FontAwesome({
	key,
	icon,
	fontSize: fontSizeProp,
	fontColor,
}: FontAwesomeProps) {
	const theme    = getTheme()
	const resolved = resolveFontAwesomeIcon(icon)

	if (!resolved) {
		console.error(`FontAwesome: unknown icon "${icon}"`)
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
