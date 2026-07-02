import type { Color4 } from '@dcl/sdk/math'

export type Theme = {
	baseHeight        : number
	baseWidth         : number

	borderRadius      : number
	borderWidth       : number
	colors            : {
		body             : Color4
		secondary        : Color4
		tertiary         : Color4

		primary          : Color4
		info             : Color4
		danger           : Color4
		success          : Color4
		warning          : Color4
	}
	typography: {
		'default-font-size': number
		'h1-font-size': number
		'h2-font-size': number
		'h3-font-size': number
		'h4-font-size': number
		'h5-font-size': number
		'h6-font-size': number
	}
}


// MARK: ThemeCustomize
export type ThemeCustomize = Partial<{
	baseHeight        : number
	baseWidth         : number
	borderRadius      : number
	borderWidth       : number
	colors            : Partial<Theme['colors']>
	roundedDefault    : number
}>

