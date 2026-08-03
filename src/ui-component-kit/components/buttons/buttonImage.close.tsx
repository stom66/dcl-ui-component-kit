import { isMobile } from '@dcl/sdk/platform'
import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasBtnIconsStyled } from '../../atlases'

import { ButtonImage } from './buttonImage'


type ButtonImageCloseProps = Omit<Parameters<typeof ButtonImage>[0], 'width' | 'height' | 'uvColumn'> & {
	/** 1-based atlas column for the close glyph. Defaults to `1`. */
	uvColumn?: number
	width?   : number
	height?  : number
}

// MARK: ButtonImageClose
/**
 * Shared close-button image control (default atlas column `1`).
 * Override `textureSrc` / `uvColumn` / `uvColumnCount` / `uvRowCount` for a custom sheet.
 */
export function ButtonImageClose({
	id          = 'close',
	children,
	callback,
	uvColumn    = 1,
	textureSrc  = atlasBtnIconsStyled.source,
	uiTransform = {},
	width,
	height,
	...props
}: ButtonImageCloseProps) {
	const m = isMobile()
	return (
		<ButtonImage
			{...props}
			id          = {id}
			uvColumn    = {uvColumn}
			width       = {width  ?? (m ? 128 : 90)}
			height      = {height ?? (m ? 128 : 90)}
			textureSrc  = {textureSrc}
			uiTransform = {{
				position    : { top: 0, right: 0 },
				positionType: 'absolute',
				borderWidth : 0,
				...uiTransform,

			}}
			callback = {callback}
		>
			{children}
		</ButtonImage>
	)
}
