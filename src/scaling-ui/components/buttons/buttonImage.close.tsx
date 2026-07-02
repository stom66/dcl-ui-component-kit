import { UiTransformProps } from '@dcl/sdk/react-ecs'

import { ButtonImage } from '../index'

// MARK: ButtonImageClose
/**
 * Renders the shared close button image component.
 */
export const ButtonImageClose = ({
	key,
	callback    = undefined,
	uiTransform = {}
} : { 
	key         : string,
	callback?   : () => void,
	uiTransform?: UiTransformProps,
}) => {
	return ButtonImage({
		key        : key,
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
