import { Color4 } from '@dcl/sdk/math'

export type ThemeColors = {
	body     : Color4
	dark     : Color4
	light    : Color4

	primary  : Color4
	secondary: Color4
	tertiary : Color4

	danger   : Color4
	info     : Color4
	success  : Color4
	warning  : Color4
}

export const colors: ThemeColors = {
	body     : Color4.fromHexString('#3e0c5e'),
	dark     : Color4.fromHexString('#212529'),
	light    : Color4.fromHexString('#f8f9fa'),
	secondary: Color4.fromHexString('#595c5f'),
	tertiary : Color4.fromHexString('#909294'),

	primary  : Color4.fromHexString('#ff7538'),
	danger   : Color4.fromHexString('#ff2e55'),
	info     : Color4.fromHexString('#20b5f4'),
	success  : Color4.fromHexString('#7ec300'),
	warning  : Color4.fromHexString('#b232ff'),
}
