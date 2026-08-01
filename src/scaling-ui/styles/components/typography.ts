export type ThemeFontFamily = 'monospace' | 'serif' | 'sans-serif'

export type ThemeTypography = {
	size: {
		code   : number
		default: number
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
}

export const typography: ThemeTypography = {
	size: {
		code   : 12,
		default: 14,
		h1     : 48,
		h2     : 36,
		h3     : 18,
		h4     : 16,
		h5     : 14,
		h6     : 12,
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
}
