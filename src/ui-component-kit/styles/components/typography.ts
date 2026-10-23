export type ThemeFontFamily = 'monospace' | 'serif' | 'sans-serif'

/**
 * Optional custom TTF paths (scene-relative) for SDK `fontSrc`.
 * Face keys map to built-in `font` values; `default` is a catch-all when the
 * face key is unset (one custom font for the whole project).
 */
export type ThemeFontSrc = {
	/** TTF for `'sans-serif'` roles. */
	sansSerif? : string
	/** TTF for `'serif'` roles (typically headings). */
	serif?     : string
	/** TTF for `'monospace'` roles (typically `Code`). */
	monospace? : string
	/**
	 * Catch-all when the face key is unset. Set only this for one custom
	 * font across the whole project.
	 */
	default?   : string
}

export type ThemeTypography = {
	/** Optional per-platform multipliers applied at render time via `resolveTypographySize`. */
	scale?: {
		mobile? : number
		desktop?: number
	}
	size: {
		/** Monospace / debug readout size. Prefer this over a magic number. */
		code   : number
		/** Body copy and button labels. */
		default: number
		/** Captions, hints, dense UI. */
		small  : number
		h1     : number
		h2     : number
		h3     : number
		h4     : number
		h5     : number
		h6     : number
	}
	family: {
		code   : ThemeFontFamily
		default: ThemeFontFamily
		h1     : ThemeFontFamily
		h2     : ThemeFontFamily
		h3     : ThemeFontFamily
		h4     : ThemeFontFamily
		h5     : ThemeFontFamily
		h6     : ThemeFontFamily
	}
	/**
	 * Optional custom TTF paths. Face key wins over `default`; omit keys to
	 * keep built-in faces. Always pair with `typography.family` (SDK fallback).
	 */
	fontSrc?: ThemeFontSrc
}

export const typography: ThemeTypography = {
	scale: {
		mobile : 1600 / 1200,
		desktop: 1,
	},
	size: {
		code   : 6,
		default: 10,
		small  : 8,
		h1     : 40,
		h2     : 28,
		h3     : 16,
		h4     : 14,
		h5     : 12,
		h6     : 10,
	},
	family: {
		code   : 'monospace',
		default: 'sans-serif',
		h1     : 'serif',
		h2     : 'serif',
		h3     : 'serif',
		h4     : 'serif',
		h5     : 'serif',
		h6     : 'serif',
	},
	fontSrc: {
		sansSerif : undefined,
		serif     : undefined,
		monospace : undefined,
		default   : undefined,
	},
}
