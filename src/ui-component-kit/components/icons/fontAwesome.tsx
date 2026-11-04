import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { resolveFontAwesomeIcon } from '../../fonts'
import { getTheme } from '../../styles'


export type FontAwesomeProps = {
	/** Icon name — kebab-case (`dice-d20`), camelCase (`diceD20`), or alias (`close` → `xmark`). */
	icon: string
	/**
	 * Pixel size for the glyph box and `uiText.fontSize`.
	 * Passed through raw (same as the fontSrc bugtest scene) — not theme-scaled.
	 * Defaults to `theme.icons.defaultSize`.
	 */
	fontSize?: number
	/** Glyph tint. Defaults to `theme.colors.light`. */
	fontColor?: Color4
}


// MARK: FontAwesome
/**
 * Font Awesome Free glyph via scene TTF (`fontSrc`). Bare `UiEntity` — only
 * `icon`, `fontSize`, and `fontColor`.
 *
 * **Known issue (Unity Desktop):** each `fontSrc` gets one dynamic SDF atlas.
 * After Latin prefill there is only room for roughly **~35–50 unique** PUA
 * icons (varies by glyph complexity). Repeats of the same icon are fine;
 * more unique icons → tofu. Prefer texture `Icon` / project atlases for
 * large sets. Preview needs asset bundles (`npm run start:bundles`).
 */
export function FontAwesome({
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
