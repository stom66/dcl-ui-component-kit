import { Color4 } from '@dcl/sdk/math'

import { customize } from 'src/scaling-ui/styles/customize'
import type { Theme } from 'src/scaling-ui/styles/theme.types'



// MARK: buildTheme
/** Applies {@link customize} on top of Bootstrap-oriented defaults. */
function buildTheme(): Theme {

	const defaultBorderWidth : Theme['borderWidth']  = 1
	const defaultBorderRadius: Theme['borderRadius'] =  8

	const base: Theme = {
		baseHeight  : 1080,
		baseWidth   : 1920,
		borderRadius: defaultBorderRadius,
		borderWidth : defaultBorderWidth,
		colors      : {
			body     : Color4.fromHexString('#212529'),
			secondary: Color4.fromHexString('#595c5f'),
			tertiary : Color4.fromHexString("#909294"),

			danger   : Color4.fromHexString('#dc3545'),
			info     : Color4.fromHexString('#0dcaf0'),
			primary  : Color4.fromHexString('#0d6efd'),
			success  : Color4.fromHexString('#198754'),
			warning  : Color4.fromHexString('#ffc107'),
		},

		typography  : {
			'default-font-size': 16,
			'h1-font-size'     : 24,
			'h2-font-size'     : 20,
			'h3-font-size'     : 18,
			'h4-font-size'     : 16,
			'h5-font-size'     : 14,
			'h6-font-size'     : 12,
		}
	}

	const merged: Theme = {
		...base,
		baseHeight  : customize.baseHeight ?? base.baseHeight,
		baseWidth   : customize.baseWidth ?? base.baseWidth,
		borderRadius: customize.borderRadius ?? base.borderRadius,
		borderWidth : customize.borderWidth ?? base.borderWidth,
		colors      : {
			...base.colors,
			...customize.colors,
		},
	}

	return merged as Theme
}


/** Active theme for utilities and layout. */
export const theme = buildTheme()
