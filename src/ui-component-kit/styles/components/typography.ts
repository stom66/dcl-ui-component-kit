export type ThemeFontFamily = 'monospace' | 'serif' | 'sans-serif'

export type ThemeTypography = {
	size: {
		code   : number
		default: number
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
}

export const typography: ThemeTypography = {
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
}
