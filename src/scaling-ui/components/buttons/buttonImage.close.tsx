import ReactEcs from '@dcl/sdk/react-ecs'

import { ButtonImage } from './buttonImage'
import { isMobile } from '@dcl/sdk/platform'


type ButtonImageCloseProps = Omit<Parameters<typeof ButtonImage>[0], 'textureSrc' | 'width' | 'height'>

// MARK: ButtonImageClose
/** Renders the shared close button image component. */
export function ButtonImageClose({
	id = 'close',
	children,
	callback,
	uiTransform = {},
	...props
}: ButtonImageCloseProps) {
	const m = isMobile()
	return (
		<ButtonImage
			{...props}
			id          = {id}
			width       = {m ? 128 : 90}
			height      = {m ? 128 : 90}
			textureSrc  = "assets/images/scaling-ui/atlas-btn-close.png"
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
