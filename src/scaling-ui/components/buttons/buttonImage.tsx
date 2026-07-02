import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, UiTransformProps} from '@dcl/sdk/react-ecs'

import { getUVRow } from '../../utils/uvs'


enum ButtonIndex {
	DEFAULT  = 3,
	HOVER    = 2,
	PRESS    = 1,
	DISABLED = 0,
}
const currentIndex : Map<string, number>  = new Map()
const hoverStates  : Map<string, boolean> = new Map()
const pressedStates: Map<string, boolean> = new Map()


// MARK: ButtonImage
/**
 * Renders an image button with per-instance hover and press state.
 */
export const ButtonImage = ({ 
	key,
	width      = 64, 
	height     = 64, 
	textureSrc = "assets/images/ui/atlas-btn-close.png",
	uiTransform,
	callback  ,
}: { 
	key         : string,
	width      ?: number, 
	height     ?: number, 
	textureSrc ?: string,
	uiTransform?: UiTransformProps,
	callback   ?: () => void 
}) => {
	return (
		<UiEntity
			key={key}
			uiTransform={{
				width         : width,
				height        : height,
				overflow      : 'hidden',
				positionType  : 'absolute',
				position      : { top: 20, left: -24 },
				...uiTransform
			}}

			uiBackground={{
				texture    : { src: textureSrc },
				textureMode: 'stretch',
				uvs        : getUVRow(currentIndex.get(key) ?? 3, 4),
				color      : Color4.White(),
			}}

			onMouseEnter = {() => {
				hoverStates.set(key, true)
				currentIndex.set(key, ButtonIndex.HOVER)
			}}
			onMouseLeave = {() => {
				hoverStates.set(key, false)
				currentIndex.set(key, ButtonIndex.DEFAULT)
			}}
			onMouseDown  = {() => {
				pressedStates.set(key, true)
				currentIndex.set(key, ButtonIndex.PRESS)
			}}
			onMouseUp    = {() => {
				pressedStates.set(key, false)
				if (hoverStates.get(key) === true) {
					if (callback !== undefined) {
						callback()
					}
					currentIndex.set(key, ButtonIndex.HOVER)
				} else {
					currentIndex.set(key, ButtonIndex.DEFAULT)
				}

			}}
		/>
	)
}


