import { animation, base, border, buttons, colors, cols, icons, typography } from './components'
import type { ThemeAnimation, ThemeBase, ThemeBorder, ThemeButtons, ThemeColors, ThemeCols, ThemeIcons, ThemeTypography } from './components'


export type Theme = ThemeBase & {
	animation : ThemeAnimation
	border    : ThemeBorder
	buttons   : ThemeButtons
	colors    : ThemeColors
	cols      : ThemeCols
	icons     : ThemeIcons
	typography: ThemeTypography
}

export type ThemeCustomize = Partial<ThemeBase> & {
	animation ?: Partial<ThemeAnimation>
	border    ?: Partial<ThemeBorder>
	buttons   ?: Partial<ThemeButtons>
	colors    ?: Partial<ThemeColors>
	cols      ?: Partial<ThemeCols>
	icons     ?: {
		size   ?: number
		numbers?: Partial<ThemeIcons['numbers']>
	}
	typography?: {
		scale ?: Partial<ThemeTypography['scale']>
		size  ?: Partial<ThemeTypography['size']>
		family?: Partial<ThemeTypography['family']>
	}
}


// MARK: defaultTheme
/**
 * Complete default UI Component Kit theme values.
 *
 * Section defaults live in `styles/components/*` (e.g. `animation.ts`, `colors.ts`).
 * Consumers can override these by passing theme overrides into `SetupUiComponentKit`.
 */
export const defaultTheme: Theme = {
	...base,
	animation,
	border,
	buttons,
	colors,
	cols,
	icons,
	typography,
}


// MARK: buildTheme
/**
 * Applies project theme overrides on top of a complete base theme.
 */
export function buildTheme(
	baseTheme: Theme          = defaultTheme,
	overrides: ThemeCustomize = {}
): Theme {

	const merged: Theme = {
		...baseTheme,
		...overrides,
		animation   : {
			...baseTheme.animation,
			...overrides.animation,
		},
		border      : {
			...baseTheme.border,
			...overrides.border,
		},
		buttons     : {
			...baseTheme.buttons,
			...overrides.buttons,
		},
		colors      : {
			...baseTheme.colors,
			...overrides.colors,
		},
		cols        : {
			...baseTheme.cols,
			...overrides.cols,
		},
		icons       : {
			...baseTheme.icons,
			...overrides.icons,
			numbers: {
				...baseTheme.icons.numbers,
				...overrides.icons?.numbers,
			},
		},
		typography  : {
			...baseTheme.typography,
			scale : {
				...baseTheme.typography.scale,
				...overrides.typography?.scale,
			},
			size  : {
				...baseTheme.typography.size,
				...overrides.typography?.size,
			},
			family: {
				...baseTheme.typography.family,
				...overrides.typography?.family,
			},
		},
	}

	return merged
}


// MARK: theme
/** Active theme for utilities and layout. */
export let theme = buildTheme()


// MARK: getTheme
/**
 * Returns the currently active theme after setup-time overrides have been applied.
 */
export function getTheme(): Theme {
	return theme
}


// MARK: setTheme
/**
 * Updates the active theme by applying project overrides to the default theme.
 */
export function setTheme(
	overrides: ThemeCustomize = {}
): Theme {
	theme = buildTheme(defaultTheme, overrides)

	return theme
}
