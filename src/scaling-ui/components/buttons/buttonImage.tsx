import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { UiTransformProps } from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { tweenValue } from '../../utils/tweens'
import { getUVRow } from '../../utils/uvs'

import { UiBox, type UiBoxProps } from '../base'


enum ButtonIndex {
	DEFAULT  = 3,
	HOVER    = 2,
	PRESS    = 1,
	DISABLED = 0,
}

const DEFAULT_SCALE = 0.9
const HOVER_SCALE   = 1

const currentIndex  : Map<string, number>  = new Map()
const hoverStates   : Map<string, boolean> = new Map()
const pressedStates : Map<string, boolean> = new Map()

type ButtonImagePropsState = {
	scale: number
}

const buttonProps = new Map<string, PropsController<ButtonImagePropsState>>()

type ButtonImageProps = Omit<UiBoxProps, 'uiTransform'> & {
	id          : string
	width      ?: number
	height     ?: number
	textureSrc ?: string
	uiTransform?: UiTransformProps
	callback   ?: () => void
	children?  : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: getButtonProps
/** Returns the per-button props controller, creating one if needed. */
function getButtonProps(id: string): PropsController<ButtonImagePropsState> {
	let props = buttonProps.get(id)
	if (!props) {
		props = new PropsController<ButtonImagePropsState>({ scale: DEFAULT_SCALE })
		buttonProps.set(id, props)
	}
	return props
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
	const button = getButtonProps(id)
	const scale  = button.get('scale')

	return (
		<UiBox
			uiTransform={{
				width         : width,
				height        : height,
				overflow      : 'hidden',
				positionType  : 'absolute',
				position      : { top: 20, left: -24 },
				alignItems    : 'center',
				justifyContent: 'center',
				...uiTransform
			}}
		>
			<UiBox
				{...props}
				uiTransform={{
					width       : `${width * scale}`,
					height      : `${height * scale}`,
					borderWidth : 0,
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
					tweenValue(button.get('scale'), HOVER_SCALE, 0.2, (v) => {
						button.set('scale', v)
					})
					onMouseEnter?.()
				}}
				onMouseLeave={() => {
					hoverStates.set(id, false)
					currentIndex.set(id, ButtonIndex.DEFAULT)
					tweenValue(button.get('scale'), DEFAULT_SCALE, 0.2, (v) => {
						button.set('scale', v)
					})
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
		</UiBox>
	)
}
