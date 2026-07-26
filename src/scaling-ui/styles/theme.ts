import { Color4 } from '@dcl/sdk/math'

import { cols } from './components/cols'
import type { ThemeCols } from './components/cols'
import { PositionUnit } from '@dcl/sdk/react-ecs'


export type Theme = {
	baseHeight        : number
	baseWidth         : number

	border            : {
		radiusSmall  : number
		radiusLarge  : number
		radiusDefault: number
		width        : number
	},
	colors            : {
		body             : Color4
		dark             : Color4
		light            : Color4

		primary          : Color4
		secondary        : Color4
		tertiary         : Color4

		danger           : Color4
		info             : Color4
		success          : Color4
		warning          : Color4
	}
	typography: {
		size: {
			code: number
			default: number
			h1: number
			h2: number
			h3: number
			h4: number
			h5: number
			h6: number
		},
		family: {
			code: 'monospace' | 'serif' | 'sans-serif'
			default: 'monospace' | 'serif' | 'sans-serif'
			h1: 'monospace' | 'serif' | 'sans-serif'
			h2: 'monospace' | 'serif' | 'sans-serif'
			h3: 'monospace' | 'serif' | 'sans-serif'
			h4: 'monospace' | 'serif' | 'sans-serif'
			h5: 'monospace' | 'serif' | 'sans-serif'
			h6: 'monospace' | 'serif' | 'sans-serif'
		}
	}

	cols: ThemeCols
}

export type ThemeCustomize = Partial<Omit<Theme, 'border' | 'colors' | 'cols' | 'typography'>> & {
	border    ?: Partial<Theme['border']>
	colors    ?: Partial<Theme['colors']>
	cols      ?: Partial<Theme['cols']>
	typography?: {
		size  ?: Partial<Theme['typography']['size']>
		family?: Partial<Theme['typography']['family']>
	}
}


// MARK: defaultTheme
/**
 * Complete default Scaling UI theme values.
 *
 * Consumers can override these by passing theme overrides into `SetupScalingUI`.
 */
export const defaultTheme: Theme = {
	baseHeight  : 1080,
	baseWidth   : 1920,
	border      : {
		radiusDefault: 16,
		radiusSmall  : 8,
		radiusLarge  : 32,
		width        : 1,
	},
	colors      : {
		body     : Color4.fromHexString('#212529'),
		dark     : Color4.fromHexString('#212529'),
		light    : Color4.fromHexString('#f8f9fa'),
		secondary: Color4.fromHexString('#595c5f'),
		tertiary : Color4.fromHexString('#909294'),

		danger   : Color4.fromHexString('#dc3545'),
		info     : Color4.fromHexString('#0dcaf0'),
		primary  : Color4.fromHexString('#0d6efd'),
		success  : Color4.fromHexString('#198754'),
		warning  : Color4.fromHexString('#ffc107'),
	},

	cols: cols,

	typography: {
		size: {
			code: 15,
			default: 16,
			h1: 24,
			h2: 20,
			h3: 18,
			h4: 16,
			h5: 14,
			h6: 12,
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
		border      : {
			...baseTheme.border,
			...overrides.border,
		},
		colors      : {
			...baseTheme.colors,
			...overrides.colors,
		},
		cols        : {
			...baseTheme.cols,
			...overrides.cols,
		},
		typography  : {
			...baseTheme.typography,
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
