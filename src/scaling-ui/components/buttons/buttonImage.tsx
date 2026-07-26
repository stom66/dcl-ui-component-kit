import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { UiTransformProps } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'

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

type ButtonImageProps = Omit<UiBoxProps, 'uiTransform'> & {
	id          : string
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
	id,
	children,
	width      = 64,
	height     = 64,
	textureSrc = 'assets/images/ui/atlas-btn-close.png',
	uiTransform,
	callback,
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
			uiTransform={{
				width       : width,
				height      : height,
				overflow    : 'hidden',
				positionType: 'absolute',
				position    : { top: 20, left: -24 },
				...uiTransform
			}}
			uiBackground={{
				texture    : { src: textureSrc },
				textureMode: 'stretch',
				uvs        : getUVRow(currentIndex.get(id) ?? 3, 4),
				color      : Color4.White(),
				...uiBackground,
			}}
			onMouseEnter={() => {
				hoverStates.set(id, true)
				currentIndex.set(id, ButtonIndex.HOVER)
				onMouseEnter?.()
			}}
			onMouseLeave={() => {
				hoverStates.set(id, false)
				currentIndex.set(id, ButtonIndex.DEFAULT)
				onMouseLeave?.()
			}}
			onMouseDown={() => {
				pressedStates.set(id, true)
				currentIndex.set(id, ButtonIndex.PRESS)
				onMouseDown?.()
			}}
			onMouseUp={() => {
				pressedStates.set(id, false)

				if (isMobile()) {
					callback?.()
					currentIndex.set(id, ButtonIndex.DEFAULT)
				} else {
					if (hoverStates.get(id) === true) {
						callback?.()
						currentIndex.set(id, ButtonIndex.HOVER)
					} else {
						currentIndex.set(id, ButtonIndex.DEFAULT)
					}
				}

				onMouseUp?.()
			}}
		>
			{children}
		</UiBox>
	)
}
