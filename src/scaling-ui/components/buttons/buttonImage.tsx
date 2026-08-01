import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { UiTransformProps } from '@dcl/sdk/react-ecs'

import { atlasBtnIconsStyled } from '../../atlases'
import { PropsController } from '../../classes/propsController'
import { tweenValue } from '../../utils/tweens'
import { getUVCell } from '../../utils/uvs'

import { UiBox, type UiBoxProps } from '../base'


/** 1-based UV rows for button states (bottom → top in the atlas). */
enum ButtonIndex {
	DEFAULT  = 4,
	HOVER    = 3,
	PRESS    = 2,
	DISABLED = 1,
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
	id            : string
	/**
	 * 1-based atlas column for this button (first column is `1`).
	 * States are rows within that column.
	 */
	uvColumn      : number
	/**
	 * Total columns in the atlas. Defaults to `atlasBtnIconsStyled.columns`.
	 * Pass with `uvRowCount` (and `textureSrc`) when using a custom sheet.
	 */
	uvColumnCount?: number
	/**
	 * Total rows in the atlas. Defaults to `atlasBtnIconsStyled.rows`.
	 * Required for correct UVs when a custom sheet has a different row count.
	 */
	uvRowCount?  : number
	width        ?: number
	height       ?: number
	/** Atlas texture path. Defaults to `atlasBtnIconsStyled.source`. */
	textureSrc   ?: string
	uiTransform  ?: UiTransformProps
	callback     ?: () => void
	children?    : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
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
 * Atlas layout: columns = button variants, rows = states (disabled → default, UV bottom→top).
 */
export const ButtonImage = ({
	id,
	children,
	uvColumn,
	uvColumnCount = atlasBtnIconsStyled.columns,
	uvRowCount    = atlasBtnIconsStyled.rows,
	width         = 64,
	height        = 64,
	textureSrc    = atlasBtnIconsStyled.source,
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
	const row    = currentIndex.get(id) ?? ButtonIndex.DEFAULT

	const useDefaultAtlas =
		textureSrc    === atlasBtnIconsStyled.source &&
		uvColumnCount === atlasBtnIconsStyled.columns &&
		uvRowCount    === atlasBtnIconsStyled.rows

	const uvs = useDefaultAtlas
		? atlasBtnIconsStyled.cell({ xStart: uvColumn, yStart: row })
		: getUVCell({
			xStart: uvColumn,
			yStart: row,
			xTotal: uvColumnCount,
			yTotal: uvRowCount,
		})

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
				zIndex        : 1000,
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
					uvs,
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
