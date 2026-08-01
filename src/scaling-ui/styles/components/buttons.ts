export type ThemeButtons = {
	borderWidth  : number
	/** Default ButtonText height in virtual pixels when neither axis is set. */
	heightDefault: number
	/** ButtonText width ÷ height when deriving the missing axis. */
	aspectRatio  : number
}

export const buttons: ThemeButtons = {
	borderWidth  : 2,
	heightDefault: 48,
	aspectRatio  : 2.6,
}
