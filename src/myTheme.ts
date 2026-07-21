import { Color4 } from '@dcl/sdk/math'

import type { ThemeCustomize } from 'src/scaling-ui/styles/theme'


// MARK: themeOverrides
/**
 * Project-specific theme overrides.
 *
 * This file is intentionally small, like a Bootstrap custom variables file:
 * only define values that should differ from the default theme. The complete
 * list of available defaults is declared as `defaultTheme` in `src/scaling-ui/styles/theme.ts`.
 */
export const themeOverrides: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#508894'),
	},
}
