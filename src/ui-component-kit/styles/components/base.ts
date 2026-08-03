export type ThemeBase = {
	baseHeight: number
	baseWidth : number
	/** Default gap for `Column` / `Row` `spacing` (virtual pixels). */
	spacing   : number
}

export const base: ThemeBase = {
	baseHeight: 1080,
	baseWidth : 1920,
	spacing   : 8,
}
