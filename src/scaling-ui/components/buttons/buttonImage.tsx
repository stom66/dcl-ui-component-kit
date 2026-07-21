import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiTransformProps} from '@dcl/sdk/react-ecs'
import { getPlatform, isMobile, isDesktop, isWeb } from '@dcl/sdk/platform'

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'

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

type ButtonImageProps = UiBoxProps & {
	key         : string
	width      ?: number
	height     ?: number
	textureSrc ?: string
	uiTransform?: UiTransformProps
	callback   ?: () => void
	children?  : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: ButtonImage
/**
 * Renders an image button with per-instance hover and press state.
 */
export const ButtonImage = ({ 
	key,
	children,
	width      = 64, 
	height     = 64, 
	textureSrc = "assets/images/ui/atlas-btn-close.png",
	uiTransform,
	callback  ,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	onMouseUp,
	uiBackground,
	...props
}: ButtonImageProps) => {
	return (
		<UiBox
			{...props}
			key = {key}
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
				...uiBackground,
			}}

			onMouseEnter = {() => {
				hoverStates.set(key, true)
				currentIndex.set(key, ButtonIndex.HOVER)
				onMouseEnter?.()
			}}
			onMouseLeave = {() => {
				hoverStates.set(key, false)
				currentIndex.set(key, ButtonIndex.DEFAULT)
				onMouseLeave?.()
			}}
			onMouseDown  = {() => {
				pressedStates.set(key, true)
				currentIndex.set(key, ButtonIndex.PRESS)
				onMouseDown?.()
			}}
			onMouseUp    = {() => {

				pressedStates.set(key, false)

				if (isMobile()) {
					callback?.()
					currentIndex.set(key, ButtonIndex.DEFAULT)

				} else {					
					if (hoverStates.get(key) === true) {
						callback?.()
						currentIndex.set(key, ButtonIndex.HOVER)
					} else {
						currentIndex.set(key, ButtonIndex.DEFAULT)
					}
				}

				onMouseUp?.()
			}}
		>
			{children}
		</UiBox>
	)
}


