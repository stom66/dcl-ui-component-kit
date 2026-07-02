import { Color4 } from '@dcl/sdk/math'

import type { ThemeCustomize } from 'src/scaling-ui/styles/theme.types'


// MARK: customize
/** User overrides merged in {@link buildTheme} (edit this file per project). */
export const customize: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#508894'),
	},
}
