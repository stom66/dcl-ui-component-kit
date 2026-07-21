import { ButtonImage } from '../index'

type ButtonImageCloseProps = Parameters<typeof ButtonImage>[0]

// MARK: ButtonImageClose
/**
 * Renders the shared close button image component.
 */
export const ButtonImageClose = ({
	key,
	children,
	callback    = undefined,
	uiTransform = {},
	...props
} : ButtonImageCloseProps) => {
	return ButtonImage({
		...props,
		key        : key,
		children   : children,
		width      : 90,
		height     : 90,
		textureSrc : "assets/images/scaling-ui/atlas-btn-close.png",
		uiTransform: {
			position    : { top: 20, right: 24 },
			positionType: 'absolute',
			...uiTransform,
		},
		callback  : () => {
			if (callback !== undefined) {
				callback()
			}
		}
	})
}
